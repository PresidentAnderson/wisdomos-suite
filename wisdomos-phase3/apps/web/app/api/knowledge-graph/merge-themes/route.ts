import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getOpenAIClient } from "@/lib/openai-client";

// Rate limiting: Store last merge time per user
const lastMergeTime = new Map<string, number>();
const MERGE_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

/**
 * POST /api/knowledge-graph/merge-themes
 *
 * Intelligent merge of old and new tag clusters. Called after new sessions/entries
 * are added. Compares existing clusters with new data and decides whether to:
 * - Keep existing clusters
 * - Merge similar clusters
 * - Create new clusters for novel themes
 * - Archive outdated clusters
 *
 * Body:
 * - graphType: "autobiography" | "coach"
 * - triggerSource: "manual" | "auto" (optional)
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await getUserFromRequest(request);
    if ("error" in authResult) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { user } = authResult;
    const userId = user.id;

    // Rate limiting check
    const lastMerge = lastMergeTime.get(userId) || 0;
    const now = Date.now();
    if (now - lastMerge < MERGE_COOLDOWN_MS) {
      const waitSeconds = Math.ceil((MERGE_COOLDOWN_MS - (now - lastMerge)) / 1000);
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: `Please wait ${waitSeconds} seconds before merging again`,
          retryAfter: waitSeconds,
        },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { graphType, triggerSource = "manual" } = body;

    if (!graphType || !["autobiography", "coach"].includes(graphType)) {
      return NextResponse.json(
        { error: "Invalid graphType. Must be 'autobiography' or 'coach'" },
        { status: 400 }
      );
    }

    // Fetch existing clusters
    const existingClusters = await prisma.tagCluster.findMany({
      where: {
        userId,
        sourceType: graphType,
      },
      orderBy: {
        lastSeenAt: "desc",
      },
    });

    if (existingClusters.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No existing clusters to merge. Run cluster-tags first.",
        action: "none",
      });
    }

    // Fetch all current tags from source
    let currentTags: string[] = [];

    if (graphType === "autobiography") {
      const entries = await prisma.autobiographyEntry.findMany({
        where: { userId },
        select: { tags: true },
      });
      const tagSet = new Set<string>();
      entries.forEach((e) => e.tags?.forEach((t) => tagSet.add(t.toLowerCase())));
      currentTags = Array.from(tagSet);
    } else {
      const sessions = await prisma.coachSession.findMany({
        where: { userId },
        select: { tags: true },
      });
      const tagSet = new Set<string>();
      sessions.forEach((s) => s.tags?.forEach((t) => tagSet.add(t.toLowerCase())));
      currentTags = Array.from(tagSet);
    }

    // Find tags that are in clusters but no longer in data (outdated)
    const allClusterTags = new Set<string>();
    existingClusters.forEach((c) => c.tags.forEach((t) => allClusterTags.add(t)));

    const outdatedTags = Array.from(allClusterTags).filter(
      (t) => !currentTags.includes(t)
    );

    // Find new tags not in any cluster
    const newTags = currentTags.filter((t) => !allClusterTags.has(t));

    // Use GPT-4o-mini to analyze and suggest merges
    const openai = getOpenAIClient();

    const analysisPrompt = `You are analyzing knowledge graph clusters for theme evolution.

## Existing Clusters:
${existingClusters
  .map(
    (c, i) =>
      `${i + 1}. "${c.name}" (${c.tags.length} tags, ${c.eventCount} events)
   Summary: ${c.summary}
   Tags: ${c.tags.slice(0, 10).join(", ")}${c.tags.length > 10 ? "..." : ""}`
  )
  .join("\n\n")}

## New Tags Not Yet Clustered:
${newTags.slice(0, 20).join(", ")}${newTags.length > 20 ? `... (${newTags.length - 20} more)` : ""}

## Outdated Tags (no longer in data):
${outdatedTags.slice(0, 10).join(", ")}${outdatedTags.length > 10 ? `... (${outdatedTags.length - 10} more)` : ""}

Task: Decide how to evolve these clusters.

Options:
1. **merge**: Merge two or more similar clusters (e.g., "Work" + "Career" → "Professional Life")
2. **split**: Split a cluster if it's too broad
3. **archive**: Mark outdated clusters for deletion
4. **expand**: Add new tags to existing clusters
5. **create**: Create new cluster for novel themes
6. **keep**: Keep cluster unchanged

Output JSON format:
{
  "actions": [
    {
      "type": "merge",
      "clusters": ["cluster_id_1", "cluster_id_2"],
      "newName": "Combined Cluster Name",
      "newSummary": "New summary",
      "reason": "Why this merge makes sense"
    },
    {
      "type": "expand",
      "clusterId": "cluster_id",
      "newTags": ["tag1", "tag2"],
      "reason": "Why these tags fit"
    },
    {
      "type": "create",
      "name": "New Theme",
      "summary": "Theme summary",
      "tags": ["tag1", "tag2"],
      "reason": "Why this is a new theme"
    },
    {
      "type": "archive",
      "clusterId": "cluster_id",
      "reason": "Why this is outdated"
    }
  ],
  "summary": "Overall description of changes"
}

Return ONLY valid JSON, no markdown.`;

    const analysisResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert at knowledge graph evolution. You help merge, split, and evolve thematic clusters as new data arrives, maintaining coherence and meaningful distinctions.",
        },
        { role: "user", content: analysisPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.6,
    });

    const aiAnalysis = JSON.parse(analysisResponse.choices[0].message.content || "{}");

    if (!aiAnalysis.actions || !Array.isArray(aiAnalysis.actions)) {
      throw new Error("Invalid analysis response from AI");
    }

    // Execute actions
    const executedActions: any[] = [];
    const clusterMap = new Map(existingClusters.map((c) => [c.id, c]));

    for (const action of aiAnalysis.actions) {
      try {
        switch (action.type) {
          case "merge":
            {
              // Merge multiple clusters into one
              const clustersToMerge = action.clusters
                .map((id: string) => clusterMap.get(id))
                .filter(Boolean);

              if (clustersToMerge.length < 2) break;

              // Combine all tags
              const allTags = new Set<string>();
              let totalEvents = 0;
              clustersToMerge.forEach((c: any) => {
                c.tags.forEach((t: string) => allTags.add(t));
                totalEvents += c.eventCount;
              });

              // Create merged cluster
              const mergedCluster = await prisma.tagCluster.create({
                data: {
                  userId,
                  name: action.newName,
                  summary: action.newSummary,
                  color: clustersToMerge[0].color,
                  tags: Array.from(allTags),
                  sourceType: graphType,
                  confidence: Math.min(...clustersToMerge.map((c: any) => c.confidence)),
                  eventCount: totalEvents,
                  firstSeenAt: new Date(
                    Math.min(...clustersToMerge.map((c: any) => c.firstSeenAt.getTime()))
                  ),
                  lastSeenAt: new Date(),
                },
              });

              // Delete old clusters
              await prisma.tagCluster.deleteMany({
                where: {
                  id: { in: action.clusters },
                },
              });

              executedActions.push({
                type: "merge",
                result: mergedCluster,
                reason: action.reason,
              });
            }
            break;

          case "expand":
            {
              // Add new tags to existing cluster
              const cluster = clusterMap.get(action.clusterId);
              if (!cluster) break;

              const updatedTags = [...new Set([...cluster.tags, ...action.newTags])];

              await prisma.tagCluster.update({
                where: { id: action.clusterId },
                data: {
                  tags: updatedTags,
                  lastSeenAt: new Date(),
                },
              });

              executedActions.push({
                type: "expand",
                clusterId: action.clusterId,
                addedTags: action.newTags,
                reason: action.reason,
              });
            }
            break;

          case "create":
            {
              // Create new cluster for novel theme
              const newCluster = await prisma.tagCluster.create({
                data: {
                  userId,
                  name: action.name,
                  summary: action.summary,
                  color: "#6366F1", // Default indigo
                  tags: action.tags,
                  sourceType: graphType,
                  confidence: 0.7,
                  eventCount: action.tags.length,
                  firstSeenAt: new Date(),
                  lastSeenAt: new Date(),
                },
              });

              executedActions.push({
                type: "create",
                result: newCluster,
                reason: action.reason,
              });
            }
            break;

          case "archive":
            {
              // Delete outdated cluster
              await prisma.tagCluster.delete({
                where: { id: action.clusterId },
              });

              executedActions.push({
                type: "archive",
                clusterId: action.clusterId,
                reason: action.reason,
              });
            }
            break;
        }
      } catch (err) {
        console.error(`Failed to execute action ${action.type}:`, err);
      }
    }

    // Update rate limit timestamp
    lastMergeTime.set(userId, now);

    // Fetch updated clusters
    const updatedClusters = await prisma.tagCluster.findMany({
      where: {
        userId,
        sourceType: graphType,
      },
      orderBy: {
        eventCount: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      summary: aiAnalysis.summary,
      actions: executedActions,
      clusters: updatedClusters,
      stats: {
        clustersBegin: existingClusters.length,
        clustersAfter: updatedClusters.length,
        newTagsProcessed: newTags.length,
        outdatedTagsFound: outdatedTags.length,
      },
    });
  } catch (error: any) {
    console.error("Error merging themes:", error);
    return NextResponse.json(
      { error: error.message || "Failed to merge themes" },
      { status: 500 }
    );
  }
}
