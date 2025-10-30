import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";
import OpenAI from "openai";

// Lazy-load OpenAI client to prevent build-time errors
let openaiClient: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

export const runtime = "nodejs";
export const maxDuration = 60; // Extended timeout for transcription

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const authResult = await getUserFromRequest(request);

    if ("error" in authResult) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user } = authResult;
    const userId = user.id;

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const sessionType = formData.get("sessionType") as string || "reflection";
    const mood = formData.get("mood") as string || null;
    const energy = formData.get("energy") as string || null;

    if (!file) {
      return NextResponse.json(
        { error: "No audio file uploaded" },
        { status: 400 }
      );
    }

    const openai = getOpenAI();

    // Calculate duration from file size (rough estimate)
    const duration = Math.floor(file.size / 16000); // Assuming 16kHz audio

    console.log("🎙️ Starting transcription for user:", userId);

    // 1️⃣ Transcribe with Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: "whisper-1",
      response_format: "text",
      language: "en",
    });

    console.log("✅ Transcription complete:", transcription.substring(0, 100) + "...");

    // 2️⃣ Analyze sentiment and tone
    const analysisPrompt = `Analyze the emotional tone and sentiment of this reflection.
Provide a JSON object with:
- overall_sentiment: positive, neutral, or negative
- primary_emotion: the main emotion expressed
- secondary_emotions: array of other emotions present
- intensity: 1-10 scale
- themes: array of key themes or topics

Reflection: "${transcription}"`;

    const analysis = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an emotional intelligence coach. Analyze reflections with empathy and insight."
        },
        { role: "user", content: analysisPrompt },
      ],
      response_format: { type: "json_object" },
    });

    const sentiment = JSON.parse(analysis.choices[0].message.content || "{}");

    console.log("✅ Sentiment analysis complete");

    // 3️⃣ Generate coaching insights
    const insightsPrompt = `As a Phoenix transformation coach, provide 2-3 actionable insights based on this reflection.
Focus on:
- Patterns of growth or resistance
- Opportunities for breakthrough
- Encouragement and next steps

Keep insights concise (2-3 sentences each).

Reflection: "${transcription}"`;

    const insightsResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a Phoenix transformation coach focused on helping people rise from their ashes into their full potential.",
        },
        { role: "user", content: insightsPrompt },
      ],
    });

    const insights = insightsResponse.choices[0].message.content;

    console.log("✅ Insights generated");

    // 4️⃣ Extract tags
    const taggingPrompt = `Extract 3-5 concise tags that capture the essence of this reflection.
Examples: growth, resistance, breakthrough, acceptance, fear, courage, clarity, confusion, momentum, stuck

Return ONLY a comma-separated list of tags, nothing else.

Reflection: "${transcription}"`;

    const tagging = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a tagging system. Return only comma-separated tags." },
        { role: "user", content: taggingPrompt },
      ],
    });

    const tagsRaw = tagging.choices[0].message.content || "";
    const tags = tagsRaw
      .split(/[,.\n]/)
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 5);

    console.log("✅ Tags extracted:", tags);

    // 5️⃣ Create embedding for semantic search
    const embed = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: transcription,
    });
    const embedding = JSON.stringify(embed.data[0].embedding);

    console.log("✅ Embedding created");

    // 6️⃣ Store in database
    const session = await prisma.coachSession.create({
      data: {
        userId,
        transcript: transcription,
        tags,
        duration,
        sentiment,
        insights,
        embedding,
        sessionType,
        mood,
        energy: energy ? parseInt(energy) : null,
      },
    });

    console.log("✅ Session saved to database:", session.id);

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        transcript: transcription,
        tags,
        sentiment,
        insights,
        duration,
        createdAt: session.createdAt,
      },
      message: "Session processed and saved successfully",
    });
  } catch (error: any) {
    console.error("❌ Error processing voice session:", error);
    return NextResponse.json(
      {
        error: "Failed to process voice session",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve sessions
export async function GET(request: NextRequest) {
  try {
    const authResult = await getUserFromRequest(request);

    if ("error" in authResult) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user } = authResult;
    const userId = user.id;

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const sessionType = searchParams.get("sessionType");

    const where: any = { userId };
    if (sessionType) {
      where.sessionType = sessionType;
    }

    const sessions = await prisma.coachSession.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        transcript: true,
        tags: true,
        duration: true,
        sentiment: true,
        insights: true,
        sessionType: true,
        mood: true,
        energy: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      sessions,
      count: sessions.length,
    });
  } catch (error: any) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions", details: error.message },
      { status: 500 }
    );
  }
}
