/**
 * WisdomOS Multi-Agent System (MAS) — Type Definitions
 *
 * Universal contracts for agent communication
 * Version: 1.0
 */

// =====================================================
// AGENT TYPES
// =====================================================

export enum AgentType {
  PLANNER = 'PlannerAgent',
  ORCHESTRATOR = 'Orchestrator',
  DATABASE = 'DatabaseAgent',
  JOURNAL = 'JournalAgent',
  COMMITMENT = 'CommitmentAgent',
  AREA_GENERATOR = 'AreaGenerator',
  FULFILMENT = 'FulfilmentAgent',
  NARRATIVE = 'NarrativeAgent',
  INTEGRITY = 'IntegrityAgent',
  FINANCE = 'FinanceAgent',
  JUSTICE = 'JusticeAgent',
  UIUX = 'UIUXAgent',
  ANALYTICS = 'AnalyticsAgent',
  I18N = 'I18nAgent',
  SECURITY = 'SecurityAgent',
  DEVOPS = 'DevOpsAgent',
}

// =====================================================
// MESSAGE ENVELOPE
// =====================================================

export enum MessageIntent {
  PLAN = 'plan',
  EXECUTE = 'execute',
  VALIDATE = 'validate',
  REPORT = 'report',
  ANALYZE = 'analyze',
  TRANSFORM = 'transform',
}

export interface MessageEnvelope<T = any> {
  message_id: string; // UUID
  created_at: string; // ISO timestamp
  actor: AgentType;
  intent: MessageIntent;
  task: string;
  payload: T;
  dependencies?: string[]; // Array of message_ids
  provenance: {
    source: 'system' | 'user' | 'import';
    version: string;
  };
  ttl_sec: number;
  retry: {
    count: number;
    max: number;
    backoff: 'linear' | 'exponential' | 'fixed';
  };
}

// =====================================================
// EVENT TYPES
// =====================================================

export enum EventType {
  // Journal
  JOURNAL_ENTRY_CREATED = 'journal.entry.created',
  JOURNAL_ENTRY_UPDATED = 'journal.entry.updated',

  // Commitment
  COMMITMENT_DETECTED = 'commitment.detected',
  COMMITMENT_CONFIRMED = 'commitment.confirmed',

  // Area
  AREA_SPAWNED = 'area.spawned',
  AREA_UPDATED = 'area.updated',

  // Fulfillment
  FULFILMENT_ROLLUP_REQUESTED = 'fulfilment.rollup.requested',
  FULFILMENT_ROLLUP_COMPLETED = 'fulfilment.rollup.completed',

  // Autobiography
  AUTOBIOGRAPHY_CHAPTER_CREATED = 'autobiography.chapter.created',
  AUTOBIOGRAPHY_CHAPTER_UPDATED = 'autobiography.chapter.updated',

  // Integrity
  INTEGRITY_ISSUE_RAISED = 'integrity.issue.raised',
  INTEGRITY_ISSUE_RESOLVED = 'integrity.issue.resolved',

  // Finance
  FINANCE_LEDGER_INGESTED = 'finance.ledger.ingested',

  // Justice
  JUSTICE_CASE_SYNCED = 'justice.case.synced',

  // UI
  UI_SNAPSHOT_REQUESTED = 'ui.snapshot.requested',

  // Security
  SECURITY_AUDIT_LOGGED = 'security.audit.logged',

  // System
  DEPLOYMENT_COMPLETED = 'deployment.completed',
  PLAN_CREATED = 'plan.created',
  JOB_COMPLETED = 'job.completed',
  JOB_FAILED = 'job.failed',
}

export interface AgentEvent<T = any> {
  id: string;
  type: EventType;
  payload: T;
  processed_by: string[]; // Agent names
  processing_complete: boolean;
  source: string;
  correlation_id?: string;
  created_at: string;
  processed_at?: string;
}

// =====================================================
// JOB QUEUE
// =====================================================

export enum JobStatus {
  PENDING = 'pending',
  READY = 'ready',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export interface QueueJob<T = any> {
  id: string;
  message_id: string;
  agent: AgentType;
  intent: MessageIntent;
  task: string;
  payload: T;
  dependencies: string[];
  deps_met: boolean;
  run_at: string;
  started_at?: string;
  completed_at?: string;
  status: JobStatus;
  attempts: number;
  max_attempts: number;
  backoff_strategy: 'linear' | 'exponential' | 'fixed';
  provenance: {
    source: string;
    version: string;
  };
  created_by: string;
  ttl_sec: number;
  last_error?: string;
  created_at: string;
  updated_at: string;
}

// =====================================================
// AGENT LOGS
// =====================================================

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  CRITICAL = 'critical',
}

export interface AgentLog {
  id: string;
  agent: AgentType;
  level: LogLevel;
  message: string;
  context: Record<string, any>;
  job_id?: string;
  event_id?: string;
  user_id?: string;
  created_at: string;
}

// =====================================================
// PLANS (from PlannerAgent)
// =====================================================

export interface Task {
  id: string;
  title: string;
  description: string;
  owner: AgentType | 'human';
  estimate_hours: number;
  dependencies: string[]; // Task IDs
  definition_of_done: string[];
  inputs: Record<string, any>;
  outputs: Record<string, any>;
  tests: string[];
  sla_hours?: number;
}

export interface Plan {
  id: string;
  plan_id: string;
  objective: string;
  constraints: Record<string, any>;
  current_state: Record<string, any>;
  tasks: Task[];
  status: 'active' | 'completed' | 'cancelled';
  tasks_total: number;
  tasks_completed: number;
  created_at: string;
  completed_at?: string;
}

// =====================================================
// AGENT BASE CLASS
// =====================================================

export interface AgentConfig {
  name: AgentType;
  version: string;
  rate_limit_per_min: number;
  max_concurrent: number;
}

export abstract class BaseAgent {
  protected config: AgentConfig;

  constructor(config: AgentConfig) {
    this.config = config;
  }

  abstract execute(message: MessageEnvelope): Promise<any>;

  protected async emit(type: EventType, payload: any): Promise<string> {
    // Emit event to queue_events
    // Implementation in runtime
    return '';
  }

  protected async log(
    level: LogLevel,
    message: string,
    context: Record<string, any> = {}
  ): Promise<void> {
    // Log to agent_logs
    // Implementation in runtime
  }
}

// =====================================================
// SPECIFIC AGENT INTERFACES
// =====================================================

// JournalAgent
export interface JournalEntryPayload {
  entry_id: string;
  user_id: string;
  content: string;
  date: string;
  tags?: Array<{
    area_code: string;
    dimension_code?: string;
    strength?: number;
  }>;
}

// CommitmentAgent
export interface CommitmentDetectionResult {
  has_commitment: boolean;
  confidence: number; // 0-1
  statement: string;
  intent_verbs: string[];
  entities: {
    subjects: string[];
    projects: string[];
    people: string[];
    domains: string[];
  };
}

// AreaGenerator
export interface AreaSpawnRequest {
  commitment_id: string;
  user_id: string;
  statement: string;
  confidence: number;
  entities: CommitmentDetectionResult['entities'];
}

export interface AreaSpawnResult {
  area: {
    id: string;
    code: string;
    name: string;
    emoji: string;
    color: string;
    weight_default: number;
  };
  dimensions: Array<{
    id: string;
    code: string;
    name: string;
    description: string;
  }>;
  is_new: boolean;
}

// FulfilmentAgent
export interface FulfilmentRollupRequest {
  user_id: string;
  period: string; // 'YYYY-MM' or 'YYYY-QQ'
  period_type: 'month' | 'quarter';
}

export interface FulfilmentRollupResult {
  period: string;
  gfs: number; // 0-100
  confidence: number; // 0-1
  areas: Array<{
    code: string;
    name: string;
    score: number; // 0-5
    trend_30d?: number;
  }>;
}

// NarrativeAgent
export interface NarrativeUpdateRequest {
  user_id: string;
  entry_ids: string[];
  era?: string;
}

export interface NarrativeUpdateResult {
  chapters_updated: string[];
  links_created: number;
  coherence_score: number;
}

// IntegrityAgent
export interface IntegrityCheckRequest {
  user_id: string;
  period_start: string;
  period_end: string;
}

export interface IntegrityCheckResult {
  issues_raised: number;
  issues_resolved: number;
  open_issues: Array<{
    id: string;
    area_code: string;
    issue: string;
    severity: 'low' | 'medium' | 'high';
  }>;
}

// =====================================================
// ORCHESTRATOR INTERFACES
// =====================================================

export interface OrchestratorConfig {
  poll_interval_ms: number;
  batch_size: number;
  timezone: string; // 'America/Toronto'
}

export interface DispatchResult {
  job_id: string;
  status: 'started' | 'completed' | 'failed';
  result?: any;
  error?: string;
}

// =====================================================
// HELPER TYPES
// =====================================================

export type AgentHandler<TPayload = any, TResult = any> = (
  message: MessageEnvelope<TPayload>
) => Promise<TResult>;

export interface AgentRegistry {
  [AgentType.PLANNER]: AgentHandler;
  [AgentType.ORCHESTRATOR]: AgentHandler;
  [AgentType.DATABASE]: AgentHandler;
  [AgentType.JOURNAL]: AgentHandler<JournalEntryPayload, void>;
  [AgentType.COMMITMENT]: AgentHandler<JournalEntryPayload, CommitmentDetectionResult[]>;
  [AgentType.AREA_GENERATOR]: AgentHandler<AreaSpawnRequest, AreaSpawnResult>;
  [AgentType.FULFILMENT]: AgentHandler<FulfilmentRollupRequest, FulfilmentRollupResult>;
  [AgentType.NARRATIVE]: AgentHandler<NarrativeUpdateRequest, NarrativeUpdateResult>;
  [AgentType.INTEGRITY]: AgentHandler<IntegrityCheckRequest, IntegrityCheckResult>;
  [AgentType.FINANCE]: AgentHandler;
  [AgentType.JUSTICE]: AgentHandler;
  [AgentType.UIUX]: AgentHandler;
  [AgentType.ANALYTICS]: AgentHandler;
  [AgentType.I18N]: AgentHandler;
  [AgentType.SECURITY]: AgentHandler;
  [AgentType.DEVOPS]: AgentHandler;
}

// =====================================================
// EXPORTS
// =====================================================

export default {
  AgentType,
  MessageIntent,
  EventType,
  JobStatus,
  LogLevel,
};
