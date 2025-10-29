/**
 * WisdomOS Multi-Agent System (MAS) - Universal Contracts
 * FD-v5 (1975-2100 timeline)
 */

import { z } from 'zod';

/**
 * Agent Types
 */
export type AgentType =
  | 'PlannerAgent'
  | 'Orchestrator'
  | 'DatabaseAgent'
  | 'JournalAgent'
  | 'CommitmentAgent'
  | 'AreaGenerator'
  | 'FulfilmentAgent'
  | 'NarrativeAgent'
  | 'IntegrityAgent'
  | 'FinanceAgent'
  | 'JusticeAgent'
  | 'UIUXAgent'
  | 'AnalyticsAgent'
  | 'I18nAgent'
  | 'SecurityAgent'
  | 'DevOpsAgent';

/**
 * Intent Types
 */
export type IntentType = 'plan' | 'execute' | 'validate' | 'report';

/**
 * Provenance Source
 */
export type ProvenanceSource = 'system' | 'user' | 'import';

/**
 * Retry Configuration
 */
export interface RetryConfig {
  count: number;
  max: number;
  backoff: 'exponential' | 'linear' | 'fixed';
}

/**
 * Message Provenance
 */
export interface MessageProvenance {
  source: ProvenanceSource;
  version: string;
  timestamp?: string;
  metadata?: Record<string, any>;
}

/**
 * Universal Message Envelope
 * All agents use this standard message format
 */
export interface MessageEnvelope {
  message_id: string;
  created_at: string; // ISO 8601 format with timezone
  actor: AgentType;
  intent: IntentType;
  task: string;
  payload: Record<string, any>;
  dependencies: string[]; // array of message_ids
  provenance: MessageProvenance;
  ttl_sec: number;
  retry: RetryConfig;
}

/**
 * Zod Schema for Message Envelope Validation
 */
export const MessageEnvelopeSchema = z.object({
  message_id: z.string().uuid(),
  created_at: z.string().datetime(),
  actor: z.enum([
    'PlannerAgent',
    'Orchestrator',
    'DatabaseAgent',
    'JournalAgent',
    'CommitmentAgent',
    'AreaGenerator',
    'FulfilmentAgent',
    'NarrativeAgent',
    'IntegrityAgent',
    'FinanceAgent',
    'JusticeAgent',
    'UIUXAgent',
    'AnalyticsAgent',
    'I18nAgent',
    'SecurityAgent',
    'DevOpsAgent',
  ]),
  intent: z.enum(['plan', 'execute', 'validate', 'report']),
  task: z.string().min(1),
  payload: z.record(z.any()),
  dependencies: z.array(z.string().uuid()),
  provenance: z.object({
    source: z.enum(['system', 'user', 'import']),
    version: z.string(),
    timestamp: z.string().datetime().optional(),
    metadata: z.record(z.any()).optional(),
  }),
  ttl_sec: z.number().int().positive(),
  retry: z.object({
    count: z.number().int().min(0),
    max: z.number().int().positive(),
    backoff: z.enum(['exponential', 'linear', 'fixed']),
  }),
});

/**
 * Event Types
 * All domain events emitted by agents
 */
export const EventTypes = {
  // Journal Events
  JOURNAL_ENTRY_CREATED: 'journal.entry.created',
  JOURNAL_ENTRY_UPDATED: 'journal.entry.updated',

  // Commitment Events
  COMMITMENT_DETECTED: 'commitment.detected',
  COMMITMENT_CONFIRMED: 'commitment.confirmed',

  // Area Events
  AREA_SPAWNED: 'area.spawned',
  AREA_UPDATED: 'area.updated',

  // Fulfilment Events
  FULFILMENT_ROLLUP_REQUESTED: 'fulfilment.rollup.requested',
  FULFILMENT_ROLLUP_COMPLETED: 'fulfilment.rollup.completed',

  // Autobiography Events
  AUTOBIOGRAPHY_CHAPTER_UPDATED: 'autobiography.chapter.updated',
  AUTOBIOGRAPHY_LINK_CREATED: 'autobiography.link.created',

  // Integrity Events
  INTEGRITY_ISSUE_RAISED: 'integrity.issue.raised',
  INTEGRITY_ISSUE_RESOLVED: 'integrity.issue.resolved',

  // Finance Events
  FINANCE_LEDGER_INGESTED: 'finance.ledger.ingested',
  FINANCE_TRANSACTION_CREATED: 'finance.transaction.created',

  // Justice Events
  JUSTICE_CASE_SYNCED: 'justice.case.synced',
  JUSTICE_FILING_CREATED: 'justice.filing.created',

  // UI Events
  UI_SNAPSHOT_REQUESTED: 'ui.snapshot.requested',
  UI_DASHBOARD_RENDERED: 'ui.dashboard.rendered',

  // Security Events
  SECURITY_AUDIT_LOGGED: 'security.audit.logged',
  SECURITY_VIOLATION_DETECTED: 'security.violation.detected',

  // Deployment Events
  DEPLOYMENT_STARTED: 'deployment.started',
  DEPLOYMENT_COMPLETED: 'deployment.completed',
  DEPLOYMENT_FAILED: 'deployment.failed',

  // Plan Events
  PLAN_CREATED: 'plan.created',
  PLAN_UPDATED: 'plan.updated',

  // Job Events
  JOB_COMPLETED: 'job.completed',
  JOB_FAILED: 'job.failed',
} as const;

export type EventType = typeof EventTypes[keyof typeof EventTypes];

/**
 * Event Payload
 */
export interface EventPayload {
  event_id: string;
  type: EventType;
  payload: Record<string, any>;
  created_at: string;
  processed_by: string[];
}

/**
 * Job Status
 */
export type JobStatus = 'ready' | 'running' | 'completed' | 'failed' | 'cancelled';

/**
 * Queue Job
 */
export interface QueueJob {
  id: string;
  agent: AgentType;
  intent: IntentType;
  payload: Record<string, any>;
  status: JobStatus;
  run_at: string;
  attempts: number;
  last_error?: string;
  created_at: string;
  updated_at: string;
  deps_met: boolean;
}

/**
 * Agent Log Level
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

/**
 * Agent Log
 */
export interface AgentLog {
  id: string;
  agent: AgentType;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  created_at: string;
}

/**
 * Task Definition
 */
export interface TaskDefinition {
  task_id: string;
  definition_of_done: string[];
  owner: 'human' | AgentType;
  estimate_hours: number;
  inputs: Record<string, any>;
  outputs: Record<string, any>;
  tests: string[];
  dependencies: string[];
}

/**
 * Plan Definition
 */
export interface PlanDefinition {
  plan_id: string;
  objective: string;
  constraints: Record<string, any>;
  state: Record<string, any>;
  tasks: TaskDefinition[];
  created_at: string;
  created_by: AgentType;
}
