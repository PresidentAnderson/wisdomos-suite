import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * GET /api/knowledge-graph/relationships
 *
 * Retrieve tag relationships for building graph edges
 *
 * Query params:
 * - graphType: "autobiography" | "coach"
 * - minStrength: number (optional) - filter by minimum strength (0-1)
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
    const graphType = searchParams.get("graphType") || "autobiography";
    const minStrength = parseFloat(searchParams.get("minStrength") || "0");

    if (!["autobiography", "coach"].includes(graphType)) {
      return NextResponse.json(
        { error: "Invalid graphType" },
        { status: 400 }
      );
    }

    const relationships = await prisma.tagRelationship.findMany({
      where: {
        userId,
        sourceType: graphType,
        strength: {
          gte: minStrength,
        },
      },
      orderBy: {
        strength: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      relationships,
      count: relationships.length,
    });
  } catch (error: any) {
    console.error("Error fetching relationships:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch relationships" },
      { status: 500 }
    );
  }
}
