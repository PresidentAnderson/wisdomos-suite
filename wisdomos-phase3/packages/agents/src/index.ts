/**
 * WisdomOS Multi-Agent System (MAS)
 * Main export file
 */

// Core Infrastructure
export { BaseAgent } from './core/base-agent';
export type { AgentConfig } from './core/base-agent';

// Types & Contracts
export * from './types/contracts';

// Core Agents
export { Orchestrator } from './agents/orchestrator';
export type { OrchestratorConfig } from './agents/orchestrator';

export { JournalAgent } from './agents/journal-agent';
export type { JournalEntry, ClassificationResult } from './agents/journal-agent';

export { CommitmentAgent } from './agents/commitment-agent';
export type { Commitment } from './agents/commitment-agent';

export { FulfilmentAgent } from './agents/fulfilment-agent';
export type { ScoreInput, ScoreResult } from './agents/fulfilment-agent';

export { NarrativeAgent } from './agents/narrative-agent';
export type { Era, Chapter } from './agents/narrative-agent';

// Enterprise Agents
export { IntegrityAgent } from './agents/integrity-agent';
export type { IntegrityIssue, TimeLockViolation } from './agents/integrity-agent';

export { SecurityAgent } from './agents/security-agent';
export type { EncryptionConfig, AuditEntry, SecurityViolation } from './agents/security-agent';

export { FinanceAgent } from './agents/finance-agent';
export type { Transaction, ProfitabilityMetrics, CashflowAnalysis } from './agents/finance-agent';

export { AnalyticsAgent } from './agents/analytics-agent';
export type { KPI, ActivationMetrics, RetentionMetrics, OutcomeMetrics, IntegrityMetrics } from './agents/analytics-agent';

export { PlannerAgent } from './agents/planner-agent';
export type { PlanningContext, TaskDependencyGraph } from './agents/planner-agent';

// Version
export const VERSION = '1.0.0';
