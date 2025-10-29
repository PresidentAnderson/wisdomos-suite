/**
 * Process Journal Entry Edge Function
 *
 * Purpose: Processes a journal entry with AI analysis:
 * - Sentiment analysis
 * - Area/dimension linking
 * - Summary generation
 * - Entity extraction
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface ProcessEntryRequest {
  entry_id: string;
}

serve(async (req) => {
  try {
    // CORS handling
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { entry_id }: ProcessEntryRequest = await req.json();

    if (!entry_id) {
      return new Response(
        JSON.stringify({ error: 'entry_id is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`Processing journal entry ${entry_id}`);

    // 1. Fetch entry
    const { data: entry, error: entryError } = await supabase
      .from('fd_entry')
      .select('*')
      .eq('id', entry_id)
      .single();

    if (entryError) throw entryError;
    if (!entry) {
      return new Response(
        JSON.stringify({ error: 'Entry not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Analyze with AI
    const analysis = await analyzeEntry(entry.content_md);

    // 3. Update entry with AI results
    const { error: updateError } = await supabase
      .from('fd_entry')
      .update({
        sentiment: analysis.sentiment,
        ai_summary: analysis.summary,
      })
      .eq('id', entry_id);

    if (updateError) throw updateError;

    // 4. Create area/dimension links
    for (const link of analysis.links) {
      const { error: linkError } = await supabase
        .from('fd_entry_link')
        .upsert({
          entry_id,
          area_id: link.area_id,
          dimension_id: link.dimension_id || null,
          strength: link.strength,
        });

      if (linkError) console.error('Error creating link:', linkError);
    }

    // 5. Extract and create actions if mentioned
    for (const action of analysis.actions) {
      const { error: actionError } = await supabase
        .from('fd_action')
        .insert({
          user_id: entry.user_id,
          tenant_id: entry.tenant_id,
          area_id: action.area_id,
          title: action.title,
          description: action.description,
          status: 'pending',
        });

      if (actionError) console.error('Error creating action:', actionError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        entry_id,
        analysis: {
          sentiment: analysis.sentiment,
          summary: analysis.summary,
          links_created: analysis.links.length,
          actions_created: analysis.actions.length,
        },
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in process-journal-entry:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});

/**
 * Analyze journal entry with AI
 */
async function analyzeEntry(content: string): Promise<any> {
  if (!OPENAI_API_KEY) {
    console.warn('OPENAI_API_KEY not set, using basic analysis');
    return basicAnalysis(content);
  }

  const prompt = `Analyze this journal entry and return JSON:

Entry:
"""
${content}
"""

Areas of Life (codes):
WRK (Work), PUR (Purpose), MUS (Music), WRT (Writing), SPE (Speaking),
LRN (Learning), HLT (Health), SPF (Spiritual), FIN (Finance), FAM (Family),
FRD (Friendship), COM (Community), LAW (Law), INT (Integrity), FOR (Forgiveness), AUT (Autobiography)

Return:
{
  "sentiment": -1.0 to 1.0 (negative to positive),
  "summary": "1-2 sentence summary",
  "links": [
    {
      "area_code": "CODE",
      "strength": 0.0-1.0 (relevance)
    }
  ],
  "actions": [
    {
      "area_code": "CODE",
      "title": "Action title",
      "description": "Action description"
    }
  ]
}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a life coach analyzing journal entries. Return valid JSON only.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.5,
        response_format: { type: 'json_object' },
      }),
    });

    const result = await response.json();
    const parsed = JSON.parse(result.choices[0]?.message?.content || '{}');

    return {
      sentiment: parsed.sentiment || 0,
      summary: parsed.summary || '',
      links: parsed.links || [],
      actions: parsed.actions || [],
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    return basicAnalysis(content);
  }
}

/**
 * Basic rule-based analysis when AI is unavailable
 */
function basicAnalysis(content: string): any {
  const lowerContent = content.toLowerCase();

  // Simple sentiment analysis
  const positiveWords = ['great', 'good', 'happy', 'excited', 'accomplished', 'love', 'wonderful'];
  const negativeWords = ['bad', 'difficult', 'struggle', 'hard', 'sad', 'frustrated', 'worried'];

  let sentiment = 0;
  positiveWords.forEach((word) => {
    if (lowerContent.includes(word)) sentiment += 0.2;
  });
  negativeWords.forEach((word) => {
    if (lowerContent.includes(word)) sentiment -= 0.2;
  });
  sentiment = Math.max(-1, Math.min(1, sentiment));

  // Simple area detection
  const links: any[] = [];
  const areaKeywords: Record<string, string[]> = {
    WRK: ['work', 'job', 'project', 'client', 'business'],
    HLT: ['health', 'exercise', 'gym', 'sleep', 'nutrition'],
    FAM: ['family', 'mom', 'dad', 'sister', 'brother', 'parent'],
    FRD: ['friend', 'friendship', 'social'],
    FIN: ['money', 'finance', 'budget', 'savings', 'income'],
    LRN: ['learn', 'study', 'course', 'book', 'skill'],
    SPF: ['spiritual', 'prayer', 'meditation', 'faith'],
    MUS: ['music', 'song', 'compose', 'recording'],
    WRT: ['writing', 'write', 'wrote', 'article', 'book'],
  };

  Object.entries(areaKeywords).forEach(([code, keywords]) => {
    const matches = keywords.filter((kw) => lowerContent.includes(kw));
    if (matches.length > 0) {
      links.push({
        area_code: code,
        strength: Math.min(matches.length * 0.3, 1.0),
      });
    }
  });

  // Extract simple actions (sentences with "need to", "should", "will", "plan to")
  const actions: any[] = [];
  const actionPhrases = ['need to', 'should', 'will', 'plan to', 'going to'];
  actionPhrases.forEach((phrase) => {
    if (lowerContent.includes(phrase)) {
      const sentences = content.split(/[.!?]/);
      sentences.forEach((sentence) => {
        if (sentence.toLowerCase().includes(phrase)) {
          actions.push({
            area_code: 'WRK', // Default to work
            title: sentence.trim().substring(0, 100),
            description: sentence.trim(),
          });
        }
      });
    }
  });

  return {
    sentiment,
    summary: content.substring(0, 200) + (content.length > 200 ? '...' : ''),
    links,
    actions: actions.slice(0, 3), // Max 3 actions
  };
}
