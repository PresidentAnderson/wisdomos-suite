import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getOpenAIClient} from "@/lib/openai-client";

// Color palette for clusters (Phoenix theme)
const CLUSTER_COLORS = [
  "#FF6B35", // Phoenix Orange
  "#F59E0B", // Phoenix Gold
  "#10B981", // Green
  "#6366F1", // Indigo
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#14B8A6", // Teal
  "#EF4444", // Red
];

interface TagData {
  tag: string;
  count: number;
  sources: string[]; // Array of entry/session IDs
}

interface ClusterResult {
  id: string;
  name: string;
  summary: string;
  color: string;
  tags: string[];
  confidence: number;
  eventCount: number;
}

/**
 * POST /api/knowledge-graph/cluster-tags
 *
 * Analyzes user's tags and creates semantic clusters using GPT-4o-mini.
 * Supports both autobiography and coach session data sources.
 *
 * Body:
 * - graphType: "autobiography" | "coach"
 * - forceRefresh: boolean (optional) - regenerate even if recent clusters exist
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

    // Parse request body
    const body = await request.json();
    const { graphType, forceRefresh = false } = body;

    if (!graphType || !["autobiography", "coach"].includes(graphType)) {
      return NextResponse.json(
        { error: "Invalid graphType. Must be 'autobiography' or 'coach'" },
        { status: 400 }
      );
    }

    // Check if recent clusters exist (within last 24 hours)
    if (!forceRefresh) {
      const recentClusters = await prisma.tagCluster.findMany({
        where: {
          userId,
          sourceType: graphType,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      });

      if (recentClusters.length > 0) {
        return NextResponse.json({
          success: true,
          clusters: recentClusters,
          cached: true,
          message: "Using cached clusters from last 24 hours",
        });
      }
    }

    // Fetch tags from appropriate source
    let tagData: TagData[] = [];

    if (graphType === "autobiography") {
      // Get tags from autobiography entries
      const entries = await prisma.autobiographyEntry.findMany({
        where: { userId },
        select: { id: true, tags: true },
      });

      const tagMap = new Map<string, TagData>();
      entries.forEach((entry) => {
        entry.tags?.forEach((tag) => {
          const normalized = tag.toLowerCase().trim();
          if (!tagMap.has(normalized)) {
            tagMap.set(normalized, { tag: normalized, count: 0, sources: [] });
          }
          const data = tagMap.get(normalized)!;
          data.count++;
          data.sources.push(entry.id);
        });
      });

      tagData = Array.from(tagMap.values());
    } else {
      // Get tags from coach sessions
      const sessions = await prisma.coachSession.findMany({
        where: { userId },
        select: { id: true, tags: true },
      });

      const tagMap = new Map<string, TagData>();
      sessions.forEach((session) => {
        session.tags?.forEach((tag) => {
          const normalized = tag.toLowerCase().trim();
          if (!tagMap.has(normalized)) {
            tagMap.set(normalized, { tag: normalized, count: 0, sources: [] });
          }
          const data = tagMap.get(normalized)!;
          data.count++;
          data.sources.push(session.id);
        });
      });

      tagData = Array.from(tagMap.values());
    }

    // Require minimum tags for clustering
    if (tagData.length < 5) {
      return NextResponse.json({
        success: true,
        clusters: [],
        message: "Not enough tags for clustering (minimum 5 required)",
      });
    }

    // Sort by frequency (most common first)
    tagData.sort((a, b) => b.count - a.count);

    // Limit to top 100 tags for API efficiency
    const topTags = tagData.slice(0, 100);

    // Generate embeddings for semantic clustering
    const openai = getOpenAIClient();

    const embedResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: topTags.map((t) => t.tag),
    });

    const embeddings = embedResponse.data.map((d) => d.embedding);

    // Use GPT-4o-mini to identify semantic clusters
    const clusteringPrompt = `You are analyzing tags from a personal ${graphType === "autobiography" ? "life story" : "coaching session"} knowledge graph.

Tags (with frequency):
${topTags.map((t, i) => `${i + 1}. ${t.tag} (${t.count}x)`).join("\n")}

Task: Group these tags into 5-8 thematic clusters. Each cluster should represent a major life theme or pattern.

Requirements:
1. Create 5-8 clusters (fewer for sparse data, more for rich data)
2. Each tag should belong to exactly ONE cluster
3. Each cluster should have:
   - A descriptive name (2-4 words)
   - A 1-sentence summary explaining the theme
   - 3-15 tags that belong to this cluster
4. Clusters should be meaningful and distinct

Output JSON format:
{
  "clusters": [
    {
      "name": "Career & Purpose",
      "summary": "Tags related to professional growth, career milestones, and finding purpose in work",
      "tags": ["career", "promotion", "leadership", "mentor"]
    },
    ...
  ]
}

Return ONLY valid JSON, no markdown formatting.`;

    const clusterResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert at identifying thematic patterns in personal development data. You create meaningful, distinct clusters that help people understand their life themes.",
        },
        { role: "user", content: clusteringPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const aiClusters = JSON.parse(
      clusterResponse.choices[0].message.content || "{}"
    );

    if (!aiClusters.clusters || !Array.isArray(aiClusters.clusters)) {
      throw new Error("Invalid clustering response from AI");
    }

    // Delete old clusters for this user/graphType
    await prisma.tagCluster.deleteMany({
      where: {
        userId,
        sourceType: graphType,
      },
    });

    // Create new clusters in database
    const createdClusters: ClusterResult[] = [];

    for (let i = 0; i < aiClusters.clusters.length; i++) {
      const cluster = aiClusters.clusters[i];
      const color = CLUSTER_COLORS[i % CLUSTER_COLORS.length];

      // Calculate event count (sum of tag frequencies in this cluster)
      const eventCount = cluster.tags.reduce((sum: number, tag: string) => {
        const tagInfo = tagData.find((t) => t.tag === tag.toLowerCase());
        return sum + (tagInfo?.count || 0);
      }, 0);

      // Calculate confidence based on cluster size and coherence
      const confidence = Math.min(
        0.95,
        0.6 + cluster.tags.length * 0.05 + (eventCount / topTags.length) * 0.3
      );

      const dbCluster = await prisma.tagCluster.create({
        data: {
          userId,
          name: cluster.name,
          summary: cluster.summary,
          color,
          tags: cluster.tags,
          sourceType: graphType,
          confidence,
          eventCount,
          firstSeenAt: new Date(),
          lastSeenAt: new Date(),
        },
      });

      createdClusters.push({
        id: dbCluster.id,
        name: dbCluster.name,
        summary: dbCluster.summary,
        color: dbCluster.color,
        tags: dbCluster.tags,
        confidence: dbCluster.confidence,
        eventCount: dbCluster.eventCount,
      });
    }

    // Generate tag relationships (edges in the graph)
    await generateTagRelationships(userId, graphType, topTags, embeddings);

    return NextResponse.json({
      success: true,
      clusters: createdClusters,
      totalTags: tagData.length,
      clusteredTags: topTags.length,
      cached: false,
    });
  } catch (error: any) {
    console.error("Error clustering tags:", error);
    return NextResponse.json(
      { error: error.message || "Failed to cluster tags" },
      { status: 500 }
    );
  }
}

/**
 * Generate tag relationships based on co-occurrence and semantic similarity
 */
async function generateTagRelationships(
  userId: string,
  sourceType: string,
  tagData: TagData[],
  embeddings: number[][]
) {
  // Delete old relationships
  await prisma.tagRelationship.deleteMany({
    where: { userId, sourceType },
  });

  const relationships: Array<{
    userId: string;
    sourceTag: string;
    targetTag: string;
    strength: number;
    relationshipType: string;
    sourceType: string;
    cooccurrenceCount: number;
  }> = [];

  // Calculate co-occurrence matrix
  const cooccurrenceMap = new Map<string, number>();

  tagData.forEach((source) => {
    tagData.forEach((target) => {
      if (source.tag === target.tag) return;

      const commonSources = source.sources.filter((id) =>
        target.sources.includes(id)
      );
      if (commonSources.length > 0) {
        const key = [source.tag, target.tag].sort().join("|");
        cooccurrenceMap.set(key, commonSources.length);
      }
    });
  });

  // Create relationships for co-occurring tags
  cooccurrenceMap.forEach((count, key) => {
    const [tag1, tag2] = key.split("|");
    const strength = Math.min(1, count / 3); // Normalize to 0-1

    if (strength > 0.2) {
      // Only include meaningful relationships
      relationships.push({
        userId,
        sourceTag: tag1,
        targetTag: tag2,
        strength,
        relationshipType: "similar",
        sourceType,
        cooccurrenceCount: count,
      });
    }
  });

  // Also add semantic similarity relationships using embeddings
  for (let i = 0; i < Math.min(tagData.length, embeddings.length); i++) {
    for (let j = i + 1; j < Math.min(tagData.length, embeddings.length); j++) {
      const similarity = cosineSimilarity(embeddings[i], embeddings[j]);

      if (similarity > 0.7) {
        // High semantic similarity
        const existing = relationships.find(
          (r) =>
            (r.sourceTag === tagData[i].tag && r.targetTag === tagData[j].tag) ||
            (r.sourceTag === tagData[j].tag && r.targetTag === tagData[i].tag)
        );

        if (!existing) {
          relationships.push({
            userId,
            sourceTag: tagData[i].tag,
            targetTag: tagData[j].tag,
            strength: similarity,
            relationshipType: "similar",
            sourceType,
            cooccurrenceCount: 0,
          });
        }
      }
    }
  }

  // Batch create relationships (limit to 1000 for performance)
  if (relationships.length > 0) {
    await prisma.tagRelationship.createMany({
      data: relationships.slice(0, 1000),
    });
  }
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * GET /api/knowledge-graph/cluster-tags
 *
 * Retrieve existing clusters for a user/graphType
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await getUserFromRequest(request);
    if ("error" in authResult) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { user } = authResult;
    const userId = user.id;

    const { searchParams } = new URL(request.url);
    const graphType = searchParams.get("graphType") || "autobiography";

    if (!["autobiography", "coach"].includes(graphType)) {
      return NextResponse.json(
        { error: "Invalid graphType" },
        { status: 400 }
      );
    }

    const clusters = await prisma.tagCluster.findMany({
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
      clusters,
      count: clusters.length,
    });
  } catch (error: any) {
    console.error("Error fetching clusters:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch clusters" },
      { status: 500 }
    );
  }
}
