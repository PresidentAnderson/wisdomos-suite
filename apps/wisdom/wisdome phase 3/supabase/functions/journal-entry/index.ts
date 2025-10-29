/**
 * Supabase Edge Function: Journal Entry Ingestion
 * Endpoint: /journal-entry
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get user from JWT
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse request body
    const { content, date, tags, source } = await req.json();

    if (!content) {
      return new Response(JSON.stringify({ error: 'Content is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Basic sentiment analysis (stub - replace with AI model)
    const sentimentScore = analyzeSentiment(content);

    // Insert entry
    const { data: entry, error: entryError } = await supabaseClient
      .from('fd_entries')
      .insert({
        user_id: user.id,
        content,
        entry_date: date || new Date().toISOString().split('T')[0],
        entry_timestamp: new Date().toISOString(),
        source: source || 'api',
        tags: tags || [],
        sentiment_score: sentimentScore,
      })
      .select()
      .single();

    if (entryError) throw entryError;

    // Classify and create links (stub - replace with AI classification)
    const classifications = await classifyEntry(content, user.id, supabaseClient);

    for (const classification of classifications) {
      await supabaseClient.from('fd_entry_links').insert({
        entry_id: entry.id,
        area_id: classification.area_id,
        dimension_id: classification.dimension_id,
        weight: classification.weight,
        confidence: classification.confidence,
        signal_value: classification.signal_value,
      });
    }

    // Emit event for journal entry created
    await supabaseClient.from('queue_events').insert({
      type: 'journal.entry.created',
      payload: {
        entry_id: entry.id,
        user_id: user.id,
        classifications: classifications.length,
      },
    });

    // Detect commitments (stub - replace with NLP)
    const commitments = detectCommitments(content);

    for (const commitment of commitments) {
      if (commitment.confidence > 0.75) {
        // Insert commitment
        const { data: comm } = await supabaseClient
          .from('fd_commitments')
          .insert({
            user_id: user.id,
            entry_id: entry.id,
            statement: commitment.statement,
            confidence: commitment.confidence,
            status: 'active',
          })
          .select()
          .single();

        // Spawn area via stored procedure
        if (comm) {
          await supabaseClient.rpc('fn_commitment_spawn', { p_commitment_id: comm.id });

          await supabaseClient.from('queue_events').insert({
            type: 'commitment.detected',
            payload: {
              commitment_id: comm.id,
              user_id: user.id,
              confidence: commitment.confidence,
            },
          });
        }
      }
    }

    // Request fulfilment rollup
    await supabaseClient.from('queue_events').insert({
      type: 'fulfilment.rollup.requested',
      payload: {
        user_id: user.id,
        trigger: 'journal_entry',
      },
    });

    return new Response(JSON.stringify({ success: true, entry_id: entry.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 201,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

// Helper functions (stubs - replace with AI models)

function analyzeSentiment(content: string): number {
  const positiveWords = ['happy', 'great', 'excellent', 'wonderful', 'joy', 'success'];
  const negativeWords = ['sad', 'terrible', 'awful', 'bad', 'failure', 'disappointed'];

  const contentLower = content.toLowerCase();
  let score = 0;

  for (const word of positiveWords) {
    if (contentLower.includes(word)) score += 0.2;
  }

  for (const word of negativeWords) {
    if (contentLower.includes(word)) score -= 0.2;
  }

  return Math.max(-1.0, Math.min(1.0, score));
}

async function classifyEntry(content: string, userId: string, supabase: any) {
  // Stub: Get first active area for user
  const { data: areas } = await supabase
    .from('fd_areas')
    .select('id')
    .eq('user_id', userId)
    .eq('active', true)
    .limit(1);

  if (areas && areas.length > 0) {
    return [
      {
        area_id: areas[0].id,
        dimension_id: null,
        weight: 0.8,
        confidence: 0.7,
        signal_value: 3.5,
      },
    ];
  }

  return [];
}

function detectCommitments(content: string) {
  const commitmentKeywords = ['commit to', 'i will', 'going to', 'my goal is', 'promise to'];

  const contentLower = content.toLowerCase();
  const hasCommitment = commitmentKeywords.some((keyword) => contentLower.includes(keyword));

  if (hasCommitment) {
    return [
      {
        statement: content.substring(0, 200),
        confidence: 0.85,
      },
    ];
  }

  return [];
}
