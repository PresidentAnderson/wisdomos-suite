import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * GET /api/knowledge-graph/export
 *
 * Export complete knowledge graph as JSON for backup/portability
 *
 * Query params:
 * - graphType: "autobiography" | "coach" | "both"
 * - includeAnnotations: "true" | "false" (default: true)
 * - includeRelationships: "true" | "false" (default: true)
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await getUserFromRequest(request);
    if ("error" in authResult) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { user } = authResult;
    const userId = user.id;

    const { searchParams } = new URL(request.url);
    const graphType = searchParams.get("graphType") || "both";
    const includeAnnotations = searchParams.get("includeAnnotations") !== "false";
    const includeRelationships = searchParams.get("includeRelationships") !== "false";

    // Validate graphType
    if (!["autobiography", "coach", "both"].includes(graphType)) {
      return NextResponse.json(
        { error: "Invalid graphType. Must be 'autobiography', 'coach', or 'both'" },
        { status: 400 }
      );
    }

    // Build where clause for sourceType filter
    const sourceTypeFilter =
      graphType === "both"
        ? { sourceType: { in: ["autobiography", "coach"] } }
        : { sourceType: graphType };

    // Fetch clusters
    const clusters = await prisma.tagCluster.findMany({
      where: {
        userId,
        ...sourceTypeFilter,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Fetch relationships
    let relationships: any[] = [];
    if (includeRelationships) {
      relationships = await prisma.tagRelationship.findMany({
        where: {
          userId,
          ...sourceTypeFilter,
        },
      });
    }

    // Fetch annotations
    let annotations: any[] = [];
    if (includeAnnotations) {
      const graphTypeFilter =
        graphType === "both"
          ? { graphType: { in: ["autobiography", "coach"] } }
          : { graphType };

      annotations = await prisma.graphAnnotation.findMany({
        where: {
          userId,
          ...graphTypeFilter,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    // Fetch source data (entries/sessions)
    let sourceData: any = {};

    if (graphType === "autobiography" || graphType === "both") {
      const autobiographyEntries = await prisma.autobiographyEntry.findMany({
        where: { userId },
        select: {
          id: true,
          chapter: true,
          response: true,
          tags: true,
          sentiment: true,
          aiInsights: true,
          createdAt: true,
        },
      });
      sourceData.autobiography = autobiographyEntries;
    }

    if (graphType === "coach" || graphType === "both") {
      const coachSessions = await prisma.coachSession.findMany({
        where: { userId },
        select: {
          id: true,
          transcript: true,
          tags: true,
          sentiment: true,
          insights: true,
          sessionType: true,
          mood: true,
          energy: true,
          createdAt: true,
        },
      });
      sourceData.coach = coachSessions;
    }

    // Build export object
    const exportData = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      userId,
      graphType,
      metadata: {
        clusterCount: clusters.length,
        relationshipCount: relationships.length,
        annotationCount: annotations.length,
        sourceEntries: graphType === "both"
          ? (sourceData.autobiography?.length || 0) + (sourceData.coach?.length || 0)
          : (sourceData.autobiography?.length || sourceData.coach?.length || 0),
      },
      clusters,
      relationships: includeRelationships ? relationships : undefined,
      annotations: includeAnnotations ? annotations : undefined,
      sourceData,
    };

    // Return as downloadable JSON
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="knowledge-graph-${graphType}-${Date.now()}.json"`,
      },
    });
  } catch (error: any) {
    console.error("Error exporting knowledge graph:", error);
    return NextResponse.json(
      { error: error.message || "Failed to export knowledge graph" },
      { status: 500 }
    );
  }
}
