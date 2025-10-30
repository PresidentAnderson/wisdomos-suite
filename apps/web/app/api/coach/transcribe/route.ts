import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as Blob
    const userId = formData.get('userId') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      )
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    console.log('Starting transcription for user:', userId)

    // 1️⃣ Transcribe audio with Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: file as File,
      model: 'whisper-1',
      response_format: 'text',
    })

    console.log('Transcription complete:', transcription.substring(0, 100))

    // 2️⃣ Analyze sentiment and emotional tone
    const sentimentAnalysis = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert emotional intelligence coach. Analyze the emotional tone and sentiment of this reflection.
Return a JSON object with:
{
  "overall": "positive" | "neutral" | "negative" | "mixed",
  "emotions": ["emotion1", "emotion2", ...],
  "intensity": 1-10,
  "energy": 1-10
}`,
        },
        { role: 'user', content: transcription },
      ],
      response_format: { type: 'json_object' },
    })

    const sentiment = JSON.parse(sentimentAnalysis.choices[0].message.content || '{}')

    // 3️⃣ Extract tags and themes
    const taggingAnalysis = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Extract 3-7 key themes from this reflection. Focus on:
- Life areas (e.g., relationships, career, health)
- Emotions and feelings
- Actions or intentions
- Growth areas

Return as JSON: {"tags": ["tag1", "tag2", ...], "themes": ["theme1", "theme2", ...]}`,
        },
        { role: 'user', content: transcription },
      ],
      response_format: { type: 'json_object' },
    })

    const tagsData = JSON.parse(taggingAnalysis.choices[0].message.content || '{}')
    const tags = tagsData.tags || []
    const themes = tagsData.themes || []

    // 4️⃣ Generate AI Coach insights
    const insightsAnalysis = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are Phoenix, an AI wisdom coach. Based on this reflection:
1. Identify key insights and patterns
2. Offer compassionate observations
3. Suggest areas for growth
4. Provide 2-3 reflective questions

Be warm, encouraging, and insightful. Focus on empowerment and growth.`,
        },
        { role: 'user', content: transcription },
      ],
    })

    const insights = insightsAnalysis.choices[0].message.content || ''

    // 5️⃣ Generate coaching response
    const coachResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are Phoenix, a compassionate AI wisdom coach. Respond to this reflection with:
- Acknowledgment of their feelings
- 1-2 key insights
- A supportive, actionable suggestion
- An empowering closing

Keep it conversational, warm, and under 150 words.`,
        },
        { role: 'user', content: transcription },
      ],
    })

    const response = coachResponse.choices[0].message.content || ''

    // 6️⃣ Create embedding for semantic search
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: transcription,
    })

    const embedding = embeddingResponse.data[0].embedding

    // 7️⃣ Store in Supabase
    const { data, error } = await supabase
      .from('wisdom_coach_sessions')
      .insert({
        user_id: userId,
        transcript: transcription,
        tags,
        sentiment,
        themes: { themes },
        insights,
        coach_response: response,
        embedding,
        duration_seconds: Math.floor((file.size / 16000) * 1000), // Rough estimate
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to save session', details: error.message },
        { status: 500 }
      )
    }

    console.log('Session saved successfully:', data.id)

    return NextResponse.json({
      success: true,
      sessionId: data.id,
      transcript: transcription,
      tags,
      themes,
      sentiment,
      insights,
      coachResponse: response,
    })

  } catch (error: any) {
    console.error('Transcription error:', error)
    return NextResponse.json(
      {
        error: 'Failed to process audio',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
