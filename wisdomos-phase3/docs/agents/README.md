# WisdomOS Multi-Agent System (MAS)

**FD-v5 | Timeline: 1975-2100**

## Overview

The WisdomOS Multi-Agent System is a comprehensive architecture for managing personal transformation data through specialized, autonomous agents. Each agent handles specific domains while communicating through a unified message contract and event bus.

## Architecture

```
[PlannerAgent]
      │ produces Plan (DAG of tasks)
      ▼
[Orchestrator] — schedules, routes, retries
 ├─> [DatabaseAgent]
 ├─> [JournalAgent]
 ├─> [CommitmentAgent] → [AreaGenerator]
 ├─> [FulfilmentAgent]
 ├─> [NarrativeAgent]
 ├─> [IntegrityAgent]
 ├─> [FinanceAgent]
 ├─> [JusticeAgent]
 ├─> [UIUXAgent]
 ├─> [AnalyticsAgent]
 ├─> [I18nAgent]
 ├─> [SecurityAgent]
 └─> [DevOpsAgent]
```

## Core Principles

1. **Universal Message Contract**: All agents use the same MessageEnvelope format
2. **Event-Driven**: Agents communicate via Supabase Realtime + durable queues
3. **Source of Truth**: All data stored in Supabase PostgreSQL with RLS
4. **Autonomy**: Each agent operates independently within its domain
5. **Observability**: All actions logged to agent_logs table

## Quick Start

### Installation

```bash
cd packages/agents
pnpm install
pnpm build
```

### Running Agents

```typescript
import { Orchestrator } from '@wisdomos/agents';
import { JournalAgent, FulfilmentAgent } from '@wisdomos/agents';

// Initialize orchestrator
const orchestrator = new Orchestrator({
  version: '1.0.0',
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
});

// Register specialist agents
orchestrator.registerAgent(new JournalAgent({ version: '1.0.0' }));
orchestrator.registerAgent(new FulfilmentAgent({ version: '1.0.0' }));

// Start orchestrator
await orchestrator.start();
```

## Agent Directory

### Core Infrastructure
- **[Orchestrator](./orchestrator.md)** - Job scheduling, routing, retries
- **[PlannerAgent](./planner-agent.md)** - DAG task generation from objectives

### Data Processing
- **[JournalAgent](./journal-agent.md)** - Entry ingestion, classification, sentiment
- **[CommitmentAgent](./commitment-agent.md)** - Commitment detection and area spawning
- **[FulfilmentAgent](./fulfilment-agent.md)** - Score calculation and rollups

### Narrative & Analysis
- **[NarrativeAgent](./narrative-agent.md)** - Autobiography generation (1975-2100)
- **[IntegrityAgent](./integrity-agent.md)** - Promise tracking and integrity monitoring
- **[AnalyticsAgent](./analytics-agent.md)** - KPI tracking and insights

### Domain Specialists
- **[FinanceAgent](./finance-agent.md)** - Financial transaction processing
- **[JusticeAgent](./justice-agent.md)** - Legal case management (LAW console)
- **[I18nAgent](./i18n-agent.md)** - Internationalization (EN/FR)

### Platform Support
- **[SecurityAgent](./security-agent.md)** - Encryption, RLS, audit trails
- **[DevOpsAgent](./devops-agent.md)** - CI/CD and deployment
- **[UIUXAgent](./ui-ux-agent.md)** - Dashboard generation and UI updates

## Message Contract

All agents communicate using the universal MessageEnvelope:

```typescript
interface MessageEnvelope {
  message_id: string;
  created_at: string; // ISO 8601
  actor: AgentType;
  intent: 'plan' | 'execute' | 'validate' | 'report';
  task: string;
  payload: Record<string, any>;
  dependencies: string[]; // message IDs
  provenance: {
    source: 'system' | 'user' | 'import';
    version: string;
  };
  ttl_sec: number;
  retry: {
    count: number;
    max: number;
    backoff: 'exponential' | 'linear' | 'fixed';
  };
}
```

## Event Types

```typescript
const EventTypes = {
  // Journal
  JOURNAL_ENTRY_CREATED: 'journal.entry.created',

  // Commitments & Areas
  COMMITMENT_DETECTED: 'commitment.detected',
  AREA_SPAWNED: 'area.spawned',

  // Fulfilment
  FULFILMENT_ROLLUP_REQUESTED: 'fulfilment.rollup.requested',
  FULFILMENT_ROLLUP_COMPLETED: 'fulfilment.rollup.completed',

  // Autobiography
  AUTOBIOGRAPHY_CHAPTER_UPDATED: 'autobiography.chapter.updated',

  // Integrity
  INTEGRITY_ISSUE_RAISED: 'integrity.issue.raised',
  INTEGRITY_ISSUE_RESOLVED: 'integrity.issue.resolved',

  // Finance
  FINANCE_LEDGER_INGESTED: 'finance.ledger.ingested',

  // Justice
  JUSTICE_CASE_SYNCED: 'justice.case.synced',

  // Security
  SECURITY_AUDIT_LOGGED: 'security.audit.logged',

  // Deployment
  DEPLOYMENT_COMPLETED: 'deployment.completed',
};
```

## Queue System

### Tables

- **queue_jobs** - Pending and running jobs
- **queue_events** - Domain events
- **agent_logs** - Agent activity logs

### Job Processing Flow

1. PlannerAgent creates tasks → inserts into queue_jobs
2. Orchestrator polls for runnable jobs (deps_met = true)
3. Orchestrator dispatches to appropriate specialist agent
4. Agent processes job and emits events
5. Orchestrator marks job complete or retries on failure

## Database Schema

See `/supabase/migrations/`:
- `004_fd_v5_agent_system.sql` - Core schema
- `005_fd_v5_seed_data.sql` - Eras (1975-2100) and templates

### Key Tables

- **fd_areas** - Life areas (WRK, REL, HEA, etc.)
- **fd_dimensions** - Aspects within areas (INT, FOR, CON, etc.)
- **fd_entries** - Journal entries with encryption
- **fd_commitments** - Detected commitments
- **fd_score_rollups** - Monthly/quarterly aggregations
- **fd_autobiography_chapters** - Narrative chapters by era
- **fd_eras** - Timeline decades (1975-2100)

## Environment Variables

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI/ML
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Analytics
POSTHOG_KEY=phc_...

# Security
ENCRYPTION_MASTER_KEY=base64-encoded-key

# Configuration
TZ=America/Toronto
```

## Testing

```bash
# Unit tests
pnpm test

# Watch mode
pnpm test:watch

# E2E tests
pnpm test:e2e
```

### Test Scenarios

1. **E2E-01**: Journal → Area Spawn → Score Rollup → Chapter Link
2. **E2E-02**: Commitment detection → Area generation
3. **SEC-01**: RLS policy enforcement
4. **TIME-01**: Backfill entries → correct era assignment
5. **FIN-01**: Ledger import → profitability calculation

## Deployment

### Development

```bash
pnpm dev
```

### Production

```bash
pnpm build
pnpm start
```

### CI/CD

GitHub Actions workflow:
1. Lint & type-check
2. Run tests
3. Build agents
4. Deploy to Vercel/Netlify
5. Run Supabase migrations
6. Emit deployment.completed event

## Monitoring

- **Agent Logs**: `SELECT * FROM agent_logs WHERE level = 'error'`
- **Job Status**: `SELECT * FROM queue_jobs WHERE status = 'failed'`
- **Event Processing**: `SELECT * FROM queue_events WHERE processed_by = '{}'`

## Contributing

See individual agent documentation for specific implementation details.

### Adding a New Agent

1. Create agent class extending `BaseAgent`
2. Implement `handleMessage(message: MessageEnvelope)`
3. Register with Orchestrator
4. Add documentation in `/docs/agents/`
5. Add tests in `/packages/agents/test/`

## License

Proprietary - King Legend Inc. (PVT Hostel Products)

## IP Notice

- **King Legend Inc.** - PVT Hostel Products
- **15145597 Canada Inc.** - Atlas/Wisdom
- **AxAi Innovation** - White-label products
