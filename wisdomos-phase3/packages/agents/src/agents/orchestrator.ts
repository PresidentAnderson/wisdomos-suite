/**
 * Orchestrator Agent
 * Dispatches tasks to correct agents, enforces dependencies, retries, SLAs
 */

import { BaseAgent, AgentConfig } from '../core/base-agent';
import type {
  MessageEnvelope,
  QueueJob,
  JobStatus,
  AgentType,
} from '../types/contracts';
import { EventTypes } from '../types/contracts';

export interface OrchestratorConfig extends AgentConfig {
  pollIntervalMs?: number;
  maxConcurrentJobs?: number;
}

export class Orchestrator extends BaseAgent {
  private pollIntervalMs: number;
  private maxConcurrentJobs: number;
  private runningJobs: Set<string> = new Set();
  private agentRegistry: Map<AgentType, BaseAgent> = new Map();

  constructor(config: OrchestratorConfig) {
    super({ ...config, agentType: 'Orchestrator' });
    this.pollIntervalMs = config.pollIntervalMs || 5000; // 5 seconds
    this.maxConcurrentJobs = config.maxConcurrentJobs || 10;
  }

  /**
   * Register a specialist agent
   */
  registerAgent(agent: BaseAgent): void {
    this.agentRegistry.set(agent.getName(), agent);
    this.log('info', `Registered agent: ${agent.getName()}`);
  }

  /**
   * Handle incoming message
   */
  async handleMessage(message: MessageEnvelope): Promise<void> {
    await this.log('info', `Orchestrator received message: ${message.task}`, { message });
    // Orchestrator processes plan messages and schedules jobs
    if (message.intent === 'plan') {
      await this.schedulePlan(message);
    }
  }

  /**
   * Schedule tasks from a plan
   */
  private async schedulePlan(message: MessageEnvelope): Promise<void> {
    const { tasks } = message.payload;
    await this.log('info', `Scheduling ${tasks?.length || 0} tasks from plan`);

    // In production, this would insert jobs into queue_jobs table
    // For now, we simulate
    for (const task of tasks || []) {
      await this.scheduleJob({
        id: task.task_id,
        agent: task.owner,
        intent: 'execute',
        payload: task,
        status: 'ready',
        run_at: new Date().toISOString(),
        attempts: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deps_met: task.dependencies?.length === 0,
      });
    }
  }

  /**
   * Schedule a job
   */
  private async scheduleJob(job: QueueJob): Promise<void> {
    await this.log('info', `Job scheduled: ${job.id} for agent ${job.agent}`);
    // In production: INSERT INTO queue_jobs
  }

  /**
   * Poll for runnable jobs
   */
  async poll(): Promise<void> {
    try {
      const jobs = await this.nextRunnableJobs();

      for (const job of jobs) {
        if (this.runningJobs.size >= this.maxConcurrentJobs) {
          await this.log('warn', 'Max concurrent jobs reached, waiting...');
          break;
        }

        await this.executeJob(job);
      }
    } catch (error) {
      await this.log('error', 'Poll error', { error });
    }
  }

  /**
   * Get next runnable jobs
   */
  private async nextRunnableJobs(): Promise<QueueJob[]> {
    // In production: SELECT FROM queue_jobs WHERE status='ready' AND deps_met=true AND run_at <= NOW()
    // For now, return empty array
    return [];
  }

  /**
   * Execute a job
   */
  private async executeJob(job: QueueJob): Promise<void> {
    this.runningJobs.add(job.id);

    try {
      await this.log('info', `Executing job ${job.id} with agent ${job.agent}`);

      // Update job status to running
      await this.updateJobStatus(job.id, 'running');

      // Dispatch to appropriate agent
      const agent = this.agentRegistry.get(job.agent);
      if (!agent) {
        throw new Error(`Agent not found: ${job.agent}`);
      }

      const message = this.createMessage(job.intent, `Execute: ${job.id}`, job.payload);
      await agent.handleMessage(message);

      // Mark job as completed
      await this.updateJobStatus(job.id, 'completed');
      await this.emitEvent(EventTypes.JOB_COMPLETED, { job_id: job.id });

      await this.log('info', `Job completed: ${job.id}`);
    } catch (error) {
      await this.log('error', `Job failed: ${job.id}`, { error });
      await this.retryOrFail(job, error);
    } finally {
      this.runningJobs.delete(job.id);
    }
  }

  /**
   * Update job status
   */
  private async updateJobStatus(jobId: string, status: JobStatus): Promise<void> {
    await this.log('debug', `Job ${jobId} status: ${status}`);
    // In production: UPDATE queue_jobs SET status = $1 WHERE id = $2
  }

  /**
   * Retry or fail a job
   */
  private async retryOrFail(job: QueueJob, error: any): Promise<void> {
    const nextAttempt = job.attempts + 1;
    const maxRetries = 3; // Could come from job.payload.retry.max

    if (nextAttempt < maxRetries) {
      // Calculate backoff delay (exponential)
      const delayMs = Math.pow(2, nextAttempt) * 1000;
      const runAt = new Date(Date.now() + delayMs).toISOString();

      await this.log('info', `Retrying job ${job.id} (attempt ${nextAttempt}/${maxRetries})`, {
        delay: delayMs,
      });

      // In production: UPDATE queue_jobs SET attempts = $1, run_at = $2, last_error = $3, status = 'ready'
    } else {
      await this.log('error', `Job ${job.id} failed after ${maxRetries} attempts`);
      await this.updateJobStatus(job.id, 'failed');
      await this.emitEvent(EventTypes.JOB_FAILED, { job_id: job.id, error: error.message });
    }
  }

  /**
   * Start the orchestrator
   */
  async start(): Promise<void> {
    await this.log('info', 'Orchestrator started');
    // In production, this would start polling
    setInterval(() => this.poll(), this.pollIntervalMs);
  }

  /**
   * Stop the orchestrator
   */
  async stop(): Promise<void> {
    await this.log('info', 'Orchestrator stopped');
    // Clean up intervals, connections, etc.
  }
}
