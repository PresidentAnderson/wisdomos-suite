/**
 * Generate Interpretations Edge Function
 *
 * Purpose: Analyzes user journal entries, scores, and patterns to generate
 * AI-powered interpretations, insights, warnings, and celebrations.
 *
 * Triggers:
 * - Scheduled (monthly via pg_cron)
 * - On-demand (API call)
 * - After journal entry creation
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface InterpretationRequest {
  profile_id: string;
  period?: string; // 'YYYY-MM'
  force_regenerate?: boolean;
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

    const { profile_id, period, force_regenerate = false }: InterpretationRequest = await req.json();

    if (!profile_id) {
      return new Response(JSON.stringify({ error: 'profile_id is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const analysisMonth = period || new Date().toISOString().substring(0, 7);

    console.log(`Generating interpretations for profile ${profile_id}, period ${analysisMonth}`);

    // 1. Fetch recent entries
    const { data: entries, error: entriesError } = await supabase
      .from('fd_entry')
      .select('*, fd_entry_link(area_id, dimension_id, strength)')
      .eq('user_id', profile_id)
      .gte('date', `${analysisMonth}-01`)
      .lte('date', `${analysisMonth}-31`)
      .order('date', { ascending: false })
      .limit(30);

    if (entriesError) throw entriesError;

    // 2. Fetch score rollups
    const { data: scores, error: scoresError } = await supabase
      .from('fd_score_rollup')
      .select('*, fd_area(code, name, emoji)')
      .eq('user_id', profile_id)
      .eq('period', analysisMonth);

    if (scoresError) throw scoresError;

    // 3. Fetch integrity log
    const { data: integrityIssues, error: integrityError } = await supabase
      .from('fd_integrity_log')
      .select('*')
      .eq('user_id', profile_id)
      .is('resolved_at', null);

    if (integrityError) throw integrityError;

    // 4. Build context for AI analysis
    const context = {
      profile_id,
      period: analysisMonth,
      entries_count: entries?.length || 0,
      entries_sample: entries?.slice(0, 5).map(e => ({
        date: e.date,
        content: e.content_md?.substring(0, 200), // First 200 chars
        sentiment: e.sentiment,
      })),
      scores: scores?.map(s => ({
        area: s.fd_area?.name,
        score: s.score,
        trend_7d: s.trend_7d,
        trend_30d: s.trend_30d,
        trend_90d: s.trend_90d,
      })),
      integrity_issues: integrityIssues?.length || 0,
    };

    // 5. Call OpenAI for analysis
    const interpretations = await analyzeWithAI(context);

    // 6. Save interpretations to database
    const insertResults = [];
    for (const interp of interpretations) {
      const { data, error } = await supabase
        .from('fd_interpretation')
        .insert({
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
        })
        .select()
        .single();

      if (error) {
        console.error('Error inserting interpretation:', error);
      } else {
        insertResults.push(data);
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
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in generate-interpretations:', error);
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
 * Analyze user data with OpenAI and generate interpretations
 */
async function analyzeWithAI(context: any): Promise<any[]> {
  if (!OPENAI_API_KEY) {
    console.warn('OPENAI_API_KEY not set, returning sample interpretations');
    return generateSampleInterpretations(context);
  }

  const prompt = `You are a life fulfillment analyst helping someone track their personal growth across 16 areas of life.

Context for ${context.period}:
- Journal entries: ${context.entries_count}
- Recent entries: ${JSON.stringify(context.entries_sample, null, 2)}
- Area scores: ${JSON.stringify(context.scores, null, 2)}
- Unresolved integrity issues: ${context.integrity_issues}

Generate 3-5 interpretations of the following types:
1. "pattern" - Recurring themes or behaviors
2. "insight" - Meaningful observations
3. "warning" - Areas needing attention
4. "celebration" - Wins and positive progress
5. "suggestion" - Actionable recommendations

Return JSON array with format:
[{
  "type": "pattern|insight|warning|celebration|suggestion",
  "title": "Short title (max 60 chars)",
  "content": "Markdown explanation (2-3 sentences)",
  "confidence": 0.0-1.0,
  "area_id": null (or specific area ID if relevant)
}]`;

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
    return generateSampleInterpretations(context);
  }
}

/**
 * Generate sample interpretations when AI is unavailable
 */
function generateSampleInterpretations(context: any): any[] {
  const interpretations = [];

  // Check for declining trends
  const decliningAreas = context.scores?.filter((s: any) => s.trend_30d < -1.0) || [];
  if (decliningAreas.length > 0) {
    interpretations.push({
      type: 'warning',
      title: `Declining trend in ${decliningAreas[0].area}`,
      content: `Your fulfillment score in **${decliningAreas[0].area}** has decreased by ${Math.abs(decliningAreas[0].trend_30d).toFixed(1)} points over the last 30 days. Consider reviewing your commitments and actions in this area.`,
      confidence: 0.8,
      area_id: null,
    });
  }

  // Check for improving trends
  const improvingAreas = context.scores?.filter((s: any) => s.trend_30d > 1.0) || [];
  if (improvingAreas.length > 0) {
    interpretations.push({
      type: 'celebration',
      title: `Strong progress in ${improvingAreas[0].area}`,
      content: `Excellent work! Your **${improvingAreas[0].area}** score has improved by ${improvingAreas[0].trend_30d.toFixed(1)} points this month. Keep up the momentum!`,
      confidence: 0.85,
      area_id: null,
    });
  }

  // Check for low journaling
  if (context.entries_count < 5) {
    interpretations.push({
      type: 'suggestion',
      title: 'Increase journaling frequency',
      content: `You've logged only **${context.entries_count} entries** this month. Regular journaling (aim for 15-20 entries/month) improves score accuracy and self-awareness.`,
      confidence: 0.9,
      area_id: null,
    });
  }

  // Check for integrity issues
  if (context.integrity_issues > 0) {
    interpretations.push({
      type: 'warning',
      title: 'Unresolved integrity items',
      content: `You have **${context.integrity_issues} unresolved integrity issue(s)**. Addressing these can significantly improve your overall fulfillment and peace of mind.`,
      confidence: 0.95,
      area_id: null,
    });
  }

  return interpretations;
}
