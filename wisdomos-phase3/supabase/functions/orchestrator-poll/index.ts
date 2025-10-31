/**
 * Supabase Edge Function: Orchestrator Poll
 * Background worker that polls queue_jobs and executes agents
 * Triggered by cron or manual invocation
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Use service role key for background jobs
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get runnable jobs
    const { data: jobs, error: jobsError } = await supabaseClient
      .from('queue_jobs')
      .select('*')
      .eq('status', 'ready')
      .eq('deps_met', true)
      .lte('run_at', new Date().toISOString())
      .limit(10);

    if (jobsError) throw jobsError;

    const results = [];

    for (const job of jobs || []) {
      try {
        // Update job status to running
        await supabaseClient
          .from('queue_jobs')
          .update({ status: 'running', updated_at: new Date().toISOString() })
          .eq('id', job.id);

        // Execute job based on agent type
        await executeJob(job, supabaseClient);

        // Mark job as completed
        await supabaseClient
          .from('queue_jobs')
          .update({ status: 'completed', updated_at: new Date().toISOString() })
          .eq('id', job.id);

        // Log completion
        await supabaseClient.from('agent_logs').insert({
          agent: job.agent,
          level: 'info',
          message: `Job ${job.id} completed`,
          context: { job_id: job.id },
        });

        // Emit job completed event
        await supabaseClient.from('queue_events').insert({
          type: 'job.completed',
          payload: { job_id: job.id, agent: job.agent },
        });

        results.push({ job_id: job.id, status: 'completed' });
      } catch (error) {
        // Handle job failure
        const newAttempts = job.attempts + 1;
        const maxRetries = 3;

        if (newAttempts < maxRetries) {
          // Retry with exponential backoff
          const delayMs = Math.pow(2, newAttempts) * 1000;
          const runAt = new Date(Date.now() + delayMs).toISOString();

          await supabaseClient
            .from('queue_jobs')
            .update({
              status: 'ready',
              attempts: newAttempts,
              last_error: error.message,
              run_at: runAt,
              updated_at: new Date().toISOString(),
            })
            .eq('id', job.id);

          results.push({ job_id: job.id, status: 'retry', attempt: newAttempts });
        } else {
          // Mark as failed
          await supabaseClient
            .from('queue_jobs')
            .update({
              status: 'failed',
              last_error: error.message,
              updated_at: new Date().toISOString(),
            })
            .eq('id', job.id);

          await supabaseClient.from('queue_events').insert({
            type: 'job.failed',
            payload: { job_id: job.id, error: error.message },
          });

          results.push({ job_id: job.id, status: 'failed', error: error.message });
        }

        // Log error
        await supabaseClient.from('agent_logs').insert({
          agent: job.agent,
          level: 'error',
          message: `Job ${job.id} failed: ${error.message}`,
          context: { job_id: job.id, error: error.message },
        });
      }
    }

    return new Response(JSON.stringify({ processed: results.length, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

async function executeJob(job: any, supabase: any) {
  switch (job.agent) {
    case 'FulfilmentAgent':
      await executeFulfilmentJob(job, supabase);
      break;

    case 'NarrativeAgent':
      await executeNarrativeJob(job, supabase);
      break;

    case 'CommitmentAgent':
      await executeCommitmentJob(job, supabase);
      break;

    default:
      throw new Error(`Unknown agent: ${job.agent}`);
  }
}

async function executeFulfilmentJob(job: any, supabase: any) {
  const { user_id, period } = job.payload;

  // Call the rollup function
  await supabase.rpc('fn_fd_rollup_month', {
    p_user_id: user_id,
    p_month: new Date().toISOString().split('T')[0],
  });

  // Emit completion event
  await supabase.from('queue_events').insert({
    type: 'fulfilment.rollup.completed',
    payload: { user_id, period: period || 'month' },
  });
}

async function executeNarrativeJob(job: any, supabase: any) {
  const { user_id, era_id, area_id } = job.payload;

  // Get era info
  const { data: era } = await supabase.from('fd_eras').select('*').eq('id', era_id).single();

  if (!era) throw new Error('Era not found');

  // Find or create chapter
  let { data: chapter } = await supabase
    .from('fd_autobiography_chapters')
    .select('*')
    .eq('user_id', user_id)
    .eq('era_id', era_id)
    .eq('area_id', area_id)
    .single();

  if (!chapter) {
    const { data: newChapter } = await supabase
      .from('fd_autobiography_chapters')
      .insert({
        user_id,
        era_id,
        area_id,
        title: `${era.name} - Chapter`,
        summary: '',
        coherence_score: 0,
        theme_tags: [],
      })
      .select()
      .single();

    chapter = newChapter;
  }

  // Emit chapter updated event
  await supabase.from('queue_events').insert({
    type: 'autobiography.chapter.updated',
    payload: { chapter_id: chapter.id, era_code: era.code },
  });
}

async function executeCommitmentJob(job: any, supabase: any) {
  // Commitment processing logic
  const { commitment_id } = job.payload;

  // Spawn area if not already done
  await supabase.rpc('fn_commitment_spawn', { p_commitment_id: commitment_id });

  // Emit area spawned event
  await supabase.from('queue_events').insert({
    type: 'area.spawned',
    payload: { commitment_id },
  });
}
