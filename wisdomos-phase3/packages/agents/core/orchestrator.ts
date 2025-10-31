/**
 * WisdomOS Orchestrator — Nervous System
 *
 * Purpose: Dispatch tasks to correct agents, enforce dependencies,
 * retries, SLAs, and rate limits.
 *
 * @module Orchestrator
 * @version 1.0
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  AgentType,
  JobStatus,
  QueueJob,
  AgentEvent,
  EventType,
  LogLevel,
  DispatchResult,
  OrchestratorConfig,
} from '../types';

export class Orchestrator {
  private supabase: SupabaseClient;
  private config: OrchestratorConfig;
  private isRunning: boolean = false;
  private agentHandlers: Map<AgentType, Function> = new Map();

  constructor(
    supabaseUrl: string,
    supabaseKey: string,
    config: Partial<OrchestratorConfig> = {}
  ) {
    this.supabase = createClient(supabaseUrl, supabaseKey);

    this.config = {
      poll_interval_ms: config.poll_interval_ms || 5000,
      batch_size: config.batch_size || 10,
      timezone: config.timezone || 'America/Toronto',
    };
  }

  /**
   * Register an agent handler
   */
  registerAgent(agent: AgentType, handler: Function): void {
    this.agentHandlers.set(agent, handler);
    console.log(`✅ Registered handler for ${agent}`);
  }

  /**
   * Start the orchestration loop
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.warn('⚠️  Orchestrator is already running');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Orchestrator started');

    // Main event loop
    while (this.isRunning) {
      try {
        await this.processBatch();
      } catch (error) {
        console.error('❌ Orchestrator error:', error);
        await this.log(
          AgentType.ORCHESTRATOR,
          LogLevel.ERROR,
          'Orchestrator loop error',
          { error: error.message }
        );
      }

      // Wait before next poll
      await this.sleep(this.config.poll_interval_ms);
    }

    console.log('⏹️  Orchestrator stopped');
  }

  /**
   * Stop the orchestration loop
   */
  stop(): void {
    this.isRunning = false;
  }

  /**
   * Process a batch of ready jobs
   */
  private async processBatch(): Promise<void> {
    // Get jobs for all registered agents
    for (const [agent, handler] of this.agentHandlers) {
      const jobs = await this.getNextJobs(agent, this.config.batch_size);

      for (const job of jobs) {
        try {
          await this.dispatchJob(job, handler);
        } catch (error) {
          console.error(`❌ Failed to dispatch job ${job.id}:`, error);
        }
      }
    }
  }

  /**
   * Get next runnable jobs for an agent
   */
  private async getNextJobs(
    agent: AgentType,
    limit: number
  ): Promise<QueueJob[]> {
    const { data, error } = await this.supabase.rpc('fn_get_next_jobs', {
      p_agent: agent,
      p_limit: limit,
    });

    if (error) {
      console.error(`Error fetching jobs for ${agent}:`, error);
      return [];
    }

    return data || [];
  }

  /**
   * Dispatch a single job to its handler
   */
  private async dispatchJob(
    job: QueueJob,
    handler: Function
  ): Promise<DispatchResult> {
    const jobId = job.id;

    try {
      // Mark job as running
      await this.startJob(jobId);

      // Execute handler
      console.log(`▶️  Executing job ${jobId} [${job.agent}]: ${job.task}`);
      const result = await handler({
        message_id: job.message_id,
        created_at: job.created_at,
        actor: job.agent,
        intent: job.intent,
        task: job.task,
        payload: job.payload,
        dependencies: job.dependencies,
        provenance: job.provenance,
        ttl_sec: job.ttl_sec,
        retry: {
          count: job.attempts,
          max: job.max_attempts,
          backoff: job.backoff_strategy,
        },
      });

      // Mark job as completed
      await this.completeJob(jobId, result);

      await this.log(
        job.agent,
        LogLevel.INFO,
        `Job completed: ${job.task}`,
        { job_id: jobId, result }
      );

      return {
        job_id: jobId,
        status: 'completed',
        result,
      };
    } catch (error) {
      console.error(`❌ Job ${jobId} failed:`, error);

      // Mark job as failed (with retry logic)
      await this.failJob(jobId, error.message, true);

      await this.log(
        job.agent,
        LogLevel.ERROR,
        `Job failed: ${job.task}`,
        { job_id: jobId, error: error.message }
      );

      return {
        job_id: jobId,
        status: 'failed',
        error: error.message,
      };
    }
  }

  /**
   * Mark job as running
   */
  private async startJob(jobId: string): Promise<void> {
    await this.supabase.rpc('fn_start_job', { p_job_id: jobId });
  }

  /**
   * Mark job as completed
   */
  private async completeJob(jobId: string, result: any): Promise<void> {
    await this.supabase.rpc('fn_complete_job', {
      p_job_id: jobId,
      p_result: result,
    });
  }

  /**
   * Mark job as failed
   */
  private async failJob(
    jobId: string,
    error: string,
    retry: boolean
  ): Promise<void> {
    await this.supabase.rpc('fn_fail_job', {
      p_job_id: jobId,
      p_error: error,
      p_retry: retry,
    });
  }

  /**
   * Emit an event to the event bus
   */
  async emit(
    type: EventType,
    payload: any,
    source: string = 'Orchestrator',
    correlationId?: string
  ): Promise<string> {
    const { data, error } = await this.supabase.rpc('fn_emit_event', {
      p_type: type,
      p_payload: payload,
      p_source: source,
      p_correlation_id: correlationId,
    });

    if (error) {
      console.error('Error emitting event:', error);
      throw error;
    }

    return data;
  }

  /**
   * Log agent activity
   */
  async log(
    agent: AgentType,
    level: LogLevel,
    message: string,
    context: Record<string, any> = {},
    jobId?: string
  ): Promise<void> {
    await this.supabase.rpc('fn_log_agent', {
      p_agent: agent,
      p_level: level,
      p_message: message,
      p_context: context,
      p_job_id: jobId,
    });
  }

  /**
   * Create a new job
   */
  async createJob(
    agent: AgentType,
    task: string,
    payload: any,
    options: {
      intent?: string;
      dependencies?: string[];
      runAt?: Date;
      ttl_sec?: number;
    } = {}
  ): Promise<string> {
    const { data, error } = await this.supabase
      .from('queue_jobs')
      .insert({
        agent,
        task,
        payload,
        intent: options.intent || 'execute',
        dependencies: options.dependencies || [],
        run_at: options.runAt?.toISOString() || new Date().toISOString(),
        ttl_sec: options.ttl_sec || 600,
      })
      .select('message_id')
      .single();

    if (error) {
      console.error('Error creating job:', error);
      throw error;
    }

    return data.message_id;
  }

  /**
   * Subscribe to events
   */
  async subscribe(
    eventType: EventType,
    handler: (event: AgentEvent) => Promise<void>
  ): Promise<void> {
    // Subscribe to Postgres NOTIFY via Supabase Realtime
    const channel = this.supabase
      .channel('agent_events')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'queue_events',
          filter: `type=eq.${eventType}`,
        },
        async (payload) => {
          const event = payload.new as AgentEvent;
          await handler(event);
        }
      )
      .subscribe();

    console.log(`📡 Subscribed to ${eventType}`);
  }

  /**
   * Get job status
   */
  async getJobStatus(messageId: string): Promise<QueueJob | null> {
    const { data, error } = await this.supabase
      .from('queue_jobs')
      .select('*')
      .eq('message_id', messageId)
      .single();

    if (error) {
      console.error('Error fetching job status:', error);
      return null;
    }

    return data;
  }

  /**
   * Cancel a job
   */
  async cancelJob(messageId: string): Promise<void> {
    await this.supabase
      .from('queue_jobs')
      .update({ status: JobStatus.CANCELLED })
      .eq('message_id', messageId);
  }

  /**
   * Get agent logs
   */
  async getLogs(
    agent?: AgentType,
    level?: LogLevel,
    limit: number = 100
  ): Promise<any[]> {
    let query = this.supabase
      .from('agent_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (agent) {
      query = query.eq('agent', agent);
    }

    if (level) {
      query = query.eq('level', level);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching logs:', error);
      return [];
    }

    return data;
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    agents: Record<string, { registered: boolean; jobs_pending: number }>;
  }> {
    const health: any = {
      healthy: true,
      agents: {},
    };

    for (const [agent] of this.agentHandlers) {
      const { count, error } = await this.supabase
        .from('queue_jobs')
        .select('*', { count: 'exact', head: true })
        .eq('agent', agent)
        .in('status', ['pending', 'ready']);

      health.agents[agent] = {
        registered: true,
        jobs_pending: count || 0,
      };

      if (error) {
        health.healthy = false;
      }
    }

    return health;
  }

  /**
   * Utility: Sleep
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// =====================================================
// EXPORTS
// =====================================================

export default Orchestrator;
