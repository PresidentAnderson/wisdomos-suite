import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

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

// Lazy-load Supabase client
let supabaseClient: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!supabaseClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error('Supabase environment variables are not set');
    }
    supabaseClient = createClient(url, key);
  }
  return supabaseClient;
}

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;
    const sessionType = formData.get("sessionType") as string || "reflection";

    if (!file || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Transcribe
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: "whisper-1",
      response_format: "text",
    });

    // Analyze sentiment
    const sentimentAnalysis = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Analyze emotional tone. Return JSON with: overall_sentiment, emotions array, tone, intensity" },
        { role: "user", content: transcription },
      ],
      response_format: { type: "json_object" },
    });

    const sentiment = JSON.parse(sentimentAnalysis.choices[0].message.content || "{}");

    // Extract tags
    const taggingAnalysis = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Extract 3-7 thematic tags. Return JSON array." },
        { role: "user", content: transcription },
      ],
      response_format: { type: "json_object" },
    });

    const tagsResponse = JSON.parse(taggingAnalysis.choices[0].message.content || '{"tags": []}');
    const tags = Array.isArray(tagsResponse.tags) ? tagsResponse.tags : [];

    // Generate insights
    const insightsAnalysis = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Provide 2-3 actionable coaching insights." },
        { role: "user", content: transcription },
      ],
    });

    const insights = insightsAnalysis.choices[0].message.content;

    // Create embedding
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: transcription,
    });
    const embedding = embeddingResponse.data[0].embedding;

    // Save to database
    const { data: sessionData, error: dbError } = await supabase
      .from("coaching_sessions")
      .insert({
        user_id: userId,
        transcript: transcription,
        tags: tags,
        sentiment: sentiment,
        insights: insights,
        embedding: embedding,
        session_type: sessionType,
      })
      .select()
      .single();

    if (dbError) {
      return NextResponse.json({ error: "Failed to save session" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      session: { id: sessionData.id, transcript: transcription, tags, sentiment, insights },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
