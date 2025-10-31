/**
 * Netlify Edge Function: Generate Interpretations
 *
 * Converts Supabase Edge Function to Netlify format
 */

import { Context } from "https://edge.netlify.com";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface InterpretationRequest {
  profile_id: string;
  period?: string;
  force_regenerate?: boolean;
}

export default async (request: Request, context: Context) => {
  // CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      },
    });
  }

  try {
    const { profile_id, period, force_regenerate = false }: InterpretationRequest =
      await request.json();

    if (!profile_id) {
      return new Response(
        JSON.stringify({ error: 'profile_id is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const analysisMonth = period || new Date().toISOString().substring(0, 7);

    console.log(`Generating interpretations for profile ${profile_id}, period ${analysisMonth}`);

    // Fetch data from Supabase
    const supabaseHeaders = {
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    };

    // 1. Fetch recent entries
    const entriesResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/fd_entry?user_id=eq.${profile_id}&date=gte.${analysisMonth}-01&date=lte.${analysisMonth}-31&order=date.desc&limit=30`,
      { headers: supabaseHeaders }
    );
    const entries = await entriesResponse.json();

    // 2. Fetch score rollups
    const scoresResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/fd_score_rollup?user_id=eq.${profile_id}&period=eq.${analysisMonth}&select=*,fd_area(code,name,emoji)`,
      { headers: supabaseHeaders }
    );
    const scores = await scoresResponse.json();

    // 3. Fetch integrity issues
    const integrityResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/fd_integrity_log?user_id=eq.${profile_id}&resolved_at=is.null`,
      { headers: supabaseHeaders }
    );
    const integrityIssues = await integrityResponse.json();

    // 4. Build context for AI
    const contextData = {
      profile_id,
      period: analysisMonth,
      entries_count: entries?.length || 0,
      entries_sample: entries?.slice(0, 5).map((e: any) => ({
        date: e.date,
        content: e.content_md?.substring(0, 200),
        sentiment: e.sentiment,
      })),
      scores: scores?.map((s: any) => ({
        area: s.fd_area?.name,
        score: s.score,
        trend_7d: s.trend_7d,
        trend_30d: s.trend_30d,
        trend_90d: s.trend_90d,
      })),
      integrity_issues: integrityIssues?.length || 0,
    };

    // 5. Generate interpretations
    const interpretations = await analyzeWithAI(contextData);

    // 6. Save to database
    const insertResults = [];
    for (const interp of interpretations) {
      const insertResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/fd_interpretation`,
        {
          method: 'POST',
          headers: {
            ...supabaseHeaders,
            'Prefer': 'return=representation',
          },
          body: JSON.stringify({
            profile_id,
            interpretation_type: interp.type,
            title: interp.title,
            content_md: interp.content,
            confidence: interp.confidence,
            related_area_id: interp.area_id || null,
            source: 'ai',
            metadata_json: {
              model: 'gpt-4',
              generated_at: new Date().toISOString(),
              period: analysisMonth,
            },
          }),
        }
      );

      if (insertResponse.ok) {
        const inserted = await insertResponse.json();
        insertResults.push(inserted);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        profile_id,
        period: analysisMonth,
        interpretations_generated: insertResults.length,
        interpretations: insertResults,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error: any) {
    console.error('Error in generate-interpretations:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
};

async function analyzeWithAI(contextData: any): Promise<any[]> {
  if (!OPENAI_API_KEY) {
    console.warn('OPENAI_API_KEY not set, returning sample interpretations');
    return generateSampleInterpretations(contextData);
  }

  const prompt = `You are a life fulfillment analyst helping someone track their personal growth across 16 areas of life.

Context for ${contextData.period}:
- Journal entries: ${contextData.entries_count}
- Recent entries: ${JSON.stringify(contextData.entries_sample, null, 2)}
- Area scores: ${JSON.stringify(contextData.scores, null, 2)}
- Unresolved integrity issues: ${contextData.integrity_issues}

Generate 3-5 interpretations of the following types:
1. "pattern" - Recurring themes or behaviors
2. "insight" - Meaningful observations
3. "warning" - Areas needing attention
4. "celebration" - Wins and positive progress
5. "suggestion" - Actionable recommendations

Return JSON with format:
{
  "interpretations": [{
    "type": "pattern|insight|warning|celebration|suggestion",
    "title": "Short title (max 60 chars)",
    "content": "Markdown explanation (2-3 sentences)",
    "confidence": 0.0-1.0,
    "area_id": null
  }]
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
          { role: 'system', content: 'You are a life fulfillment analyst. Return valid JSON only.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      }),
    });

    const result = await response.json();
    const content = result.choices[0]?.message?.content;

    if (content) {
      const parsed = JSON.parse(content);
      return parsed.interpretations || [];
    }

    return [];
  } catch (error) {
    console.error('OpenAI API error:', error);
    return generateSampleInterpretations(contextData);
  }
}

function generateSampleInterpretations(contextData: any): any[] {
  const interpretations = [];

  const decliningAreas = contextData.scores?.filter((s: any) => s.trend_30d < -1.0) || [];
  if (decliningAreas.length > 0) {
    interpretations.push({
      type: 'warning',
      title: `Declining trend in ${decliningAreas[0].area}`,
      content: `Your fulfillment score in **${decliningAreas[0].area}** has decreased by ${Math.abs(decliningAreas[0].trend_30d).toFixed(1)} points over the last 30 days. Consider reviewing your commitments.`,
      confidence: 0.8,
      area_id: null,
    });
  }

  const improvingAreas = contextData.scores?.filter((s: any) => s.trend_30d > 1.0) || [];
  if (improvingAreas.length > 0) {
    interpretations.push({
      type: 'celebration',
      title: `Strong progress in ${improvingAreas[0].area}`,
      content: `Excellent work! Your **${improvingAreas[0].area}** score has improved by ${improvingAreas[0].trend_30d.toFixed(1)} points this month.`,
      confidence: 0.85,
      area_id: null,
    });
  }

  if (contextData.entries_count < 5) {
    interpretations.push({
      type: 'suggestion',
      title: 'Increase journaling frequency',
      content: `You've logged only **${contextData.entries_count} entries** this month. Regular journaling improves score accuracy.`,
      confidence: 0.9,
      area_id: null,
    });
  }

  if (contextData.integrity_issues > 0) {
    interpretations.push({
      type: 'warning',
      title: 'Unresolved integrity items',
      content: `You have **${contextData.integrity_issues} unresolved integrity issue(s)**. Addressing these can improve your overall fulfillment.`,
      confidence: 0.95,
      area_id: null,
    });
  }

  return interpretations;
}

export const config = { path: "/functions/generate-interpretations" };
