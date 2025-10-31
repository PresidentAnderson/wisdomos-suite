import { start } from 'workflow/api';
import { handleUserSignup } from "@/workflows/phoenix-transformation";
import { NextResponse } from "next/server";

/**
 * POST /api/signup
 * Starts the user signup workflow
 *
 * Body: { email: string }
 */
export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "email is required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Start the user signup workflow (runs asynchronously)
    await start(handleUserSignup, [email]);

    return NextResponse.json({
      message: "User signup workflow started",
      email,
      status: "processing",
    });
  } catch (error) {
    console.error("Error starting signup workflow:", error);
    return NextResponse.json(
      { error: "Failed to start signup workflow" },
      { status: 500 }
    );
  }
}
