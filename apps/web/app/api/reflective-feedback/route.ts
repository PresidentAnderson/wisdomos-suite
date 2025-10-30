import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const authResult = await getUserFromRequest(request);

    if ("error" in authResult) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user } = authResult;
    const userId = user.id;

    const body = await request.json();
    const {
      dimensionName,
      dimensionCategory,
      feedbackText,
      vote,
      noFeedbackReason,
      metadata,
    } = body;

    if (!dimensionName) {
      return NextResponse.json(
        { error: "Dimension name is required" },
        { status: 400 }
      );
    }

    // Create reflective feedback entry
    const feedback = await prisma.reflectiveFeedback.create({
      data: {
        userId,
        dimensionName,
        dimensionCategory: dimensionCategory || getDimensionCategory(dimensionName),
        feedbackText: feedbackText || "",
        vote: vote || null,
        noFeedbackReason: noFeedbackReason || null,
        metadata: metadata || null,
      },
    });

    return NextResponse.json({
      success: true,
      feedback,
    });
  } catch (error) {
    console.error("Error creating reflective feedback:", error);
    return NextResponse.json(
      { error: "Failed to save feedback" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const authResult = await getUserFromRequest(request);

    if ("error" in authResult) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user } = authResult;
    const userId = user.id;

    const { searchParams } = new URL(request.url);
    const dimensionName = searchParams.get("dimensionName");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: any = {
      userId,
    };

    if (dimensionName) {
      where.dimensionName = dimensionName;
    }

    const feedbacks = await prisma.reflectiveFeedback.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      feedbacks,
    });
  } catch (error) {
    console.error("Error fetching reflective feedback:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
      { status: 500 }
    );
  }
}

// Helper function to determine category from dimension name
function getDimensionCategory(dimensionName: string): string {
  const categoryMap: Record<string, string> = {
    Being: "Creative",
    Thinking: "Creative",
    Feeling: "Emotional",
    Doing: "Physical",
    Relating: "Social",
    Measuring: "Performance",
    Planning: "Strategic",
    Ideating: "Strategic",
  };

  return categoryMap[dimensionName] || "General";
}
