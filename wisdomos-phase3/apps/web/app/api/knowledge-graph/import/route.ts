import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * POST /api/knowledge-graph/import
 *
 * Import knowledge graph from JSON backup. Merges with existing data.
 *
 * Body: JSON export file
 * - version: string
 * - clusters: array
 * - relationships: array (optional)
 * - annotations: array (optional)
 *
 * Options:
 * - merge: "replace" | "merge" (default: merge)
 *   - replace: Delete existing data before import
 *   - merge: Keep existing data and add imported data
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

    // Parse import data
    const importData = await request.json();

    // Validate import data structure
    if (!importData.version || !importData.clusters) {
      return NextResponse.json(
        {
          error: "Invalid import file. Must contain version and clusters.",
        },
        { status: 400 }
      );
    }

    if (importData.version !== "1.0") {
      return NextResponse.json(
        {
          error: `Unsupported version ${importData.version}. Expected 1.0`,
        },
        { status: 400 }
      );
    }

    // Get merge strategy from query params
    const { searchParams } = new URL(request.url);
    const mergeStrategy = searchParams.get("merge") || "merge";

    if (!["replace", "merge"].includes(mergeStrategy)) {
      return NextResponse.json(
        { error: "Invalid merge strategy. Must be 'replace' or 'merge'" },
        { status: 400 }
      );
    }

    // Statistics
    let stats = {
      clustersImported: 0,
      relationshipsImported: 0,
      annotationsImported: 0,
      clustersSkipped: 0,
      errors: [] as string[],
    };

    // If replace mode, delete existing data for matching graph types
    if (mergeStrategy === "replace") {
      const graphTypes = new Set<string>();
      importData.clusters.forEach((c: any) => graphTypes.add(c.sourceType));

      for (const graphType of Array.from(graphTypes)) {
        if (["autobiography", "coach"].includes(graphType)) {
          // Delete clusters
          await prisma.tagCluster.deleteMany({
            where: { userId, sourceType: graphType },
          });

          // Delete relationships
          await prisma.tagRelationship.deleteMany({
            where: { userId, sourceType: graphType },
          });

          // Delete annotations
          await prisma.graphAnnotation.deleteMany({
            where: { userId, graphType },
          });
        }
      }
    }

    // Import clusters
    for (const cluster of importData.clusters) {
      try {
        // Check if cluster already exists (by name + sourceType)
        if (mergeStrategy === "merge") {
          const existing = await prisma.tagCluster.findFirst({
            where: {
              userId,
              name: cluster.name,
              sourceType: cluster.sourceType,
            },
          });

          if (existing) {
            stats.clustersSkipped++;
            continue;
          }
        }

        // Create cluster (generate new ID)
        await prisma.tagCluster.create({
          data: {
            userId,
            name: cluster.name,
            summary: cluster.summary,
            color: cluster.color,
            tags: cluster.tags,
            sourceType: cluster.sourceType,
            confidence: cluster.confidence || 0.7,
            eventCount: cluster.eventCount || 0,
            firstSeenAt: cluster.firstSeenAt
              ? new Date(cluster.firstSeenAt)
              : new Date(),
            lastSeenAt: cluster.lastSeenAt
              ? new Date(cluster.lastSeenAt)
              : new Date(),
          },
        });

        stats.clustersImported++;
      } catch (err: any) {
        stats.errors.push(
          `Failed to import cluster "${cluster.name}": ${err.message}`
        );
      }
    }

    // Import relationships (if provided)
    if (importData.relationships && Array.isArray(importData.relationships)) {
      for (const rel of importData.relationships) {
        try {
          // Check for duplicates in merge mode
          if (mergeStrategy === "merge") {
            const existing = await prisma.tagRelationship.findFirst({
              where: {
                userId,
                sourceTag: rel.sourceTag,
                targetTag: rel.targetTag,
                sourceType: rel.sourceType,
              },
            });

            if (existing) continue;
          }

          await prisma.tagRelationship.create({
            data: {
              userId,
              sourceTag: rel.sourceTag,
              targetTag: rel.targetTag,
              strength: rel.strength,
              relationshipType: rel.relationshipType,
              sourceType: rel.sourceType,
              cooccurrenceCount: rel.cooccurrenceCount || 0,
            },
          });

          stats.relationshipsImported++;
        } catch (err: any) {
          stats.errors.push(
            `Failed to import relationship ${rel.sourceTag} -> ${rel.targetTag}: ${err.message}`
          );
        }
      }
    }

    // Import annotations (if provided)
    if (importData.annotations && Array.isArray(importData.annotations)) {
      for (const ann of importData.annotations) {
        try {
          await prisma.graphAnnotation.create({
            data: {
              userId,
              nodeId: ann.nodeId,
              nodeType: ann.nodeType,
              graphType: ann.graphType,
              content: ann.content,
              position: ann.position || null,
              attachments: ann.attachments || null,
            },
          });

          stats.annotationsImported++;
        } catch (err: any) {
          stats.errors.push(
            `Failed to import annotation for node ${ann.nodeId}: ${err.message}`
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Import completed with ${mergeStrategy} strategy`,
      stats,
    });
  } catch (error: any) {
    console.error("Error importing knowledge graph:", error);
    return NextResponse.json(
      { error: error.message || "Failed to import knowledge graph" },
      { status: 500 }
    );
  }
}
