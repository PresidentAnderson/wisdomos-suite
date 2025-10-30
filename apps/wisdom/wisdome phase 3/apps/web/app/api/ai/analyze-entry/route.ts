import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { text, promptText } = await request.json();

    // Check if OpenAI is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        sentiment: 'neutral',
        themes: [],
        insights: 'AI analysis not configured',
        suggestions: [],
      });
    }

    const OpenAI = (await import('openai')).default;
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a compassionate life coach analyzing autobiography entries. Provide sentiment analysis, identify key themes, offer insights, and suggest reflective questions. Return JSON with keys: sentiment, themes, insights, suggestions.',
        },
        {
          role: 'user',
          content: `Prompt: ${promptText}\n\nEntry: ${text}`,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const analysis = JSON.parse(completion.choices[0].message.content || '{}');

    return NextResponse.json({
      sentiment: analysis.sentiment || 'neutral',
      themes: analysis.themes || [],
      insights: analysis.insights || '',
      suggestions: analysis.suggestions || [],
    });
  } catch (error) {
    console.error('AI Analysis Error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze entry' },
      { status: 500 }
    );
  }
}
