# @wisdomos/agents

Multi-Agent System (MAS) for WisdomOS FD-v5 Platform

## Overview

This package contains the complete Multi-Agent System for WisdomOS, managing:
- Journal entry processing
- Commitment detection and area spawning
- Score calculations and rollups
- Autobiography generation (1975-2100 timeline)
- Integrity monitoring
- Finance and legal tracking
- Security and compliance

## Installation

```bash
pnpm install
```

## Quick Start

```typescript
import { Orchestrator, JournalAgent, FulfilmentAgent } from '@wisdomos/agents';

// Create orchestrator
const orchestrator = new Orchestrator({
  version: '1.0.0',
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  pollIntervalMs: 5000,
  maxConcurrentJobs: 10,
});

// Register agents
orchestrator.registerAgent(new JournalAgent({ version: '1.0.0' }));
orchestrator.registerAgent(new FulfilmentAgent({ version: '1.0.0' }));

// Start orchestrator
await orchestrator.start();
```

## Architecture

The agent system follows an event-driven architecture:

1. **Orchestrator** polls `queue_jobs` table for runnable tasks
2. **Specialist Agents** process tasks and emit events
3. **Events** trigger downstream agent actions
4. **Results** stored in Supabase with RLS

## Agents

### Core Agents (Implemented)

- **Orchestrator** - Job scheduling and routing
- **JournalAgent** - Entry ingestion and classification
- **CommitmentAgent** - Commitment detection and area spawning
- **FulfilmentAgent** - Score calculation and rollups
- **NarrativeAgent** - Autobiography chapter generation

### Planned Agents

- **PlannerAgent** - DAG task generation
- **IntegrityAgent** - Promise tracking
- **FinanceAgent** - Transaction processing
- **JusticeAgent** - Legal case management
- **SecurityAgent** - Encryption and audit
- **AnalyticsAgent** - KPI tracking
- **I18nAgent** - Internationalization
- **DevOpsAgent** - CI/CD integration

## Development

```bash
# Build
pnpm build

# Watch mode
pnpm dev

# Run tests
pnpm test

# Type check
pnpm type-check

# Lint
pnpm lint
```

## Message Contract

All agents use the universal `MessageEnvelope`:

```typescript
interface MessageEnvelope {
  message_id: string;
  created_at: string;
  actor: AgentType;
  intent: 'plan' | 'execute' | 'validate' | 'report';
  task: string;
  payload: Record<string, any>;
  dependencies: string[];
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

## Events

```typescript
// Journal events
JOURNAL_ENTRY_CREATED: 'journal.entry.created'

// Commitment events
COMMITMENT_DETECTED: 'commitment.detected'
AREA_SPAWNED: 'area.spawned'

// Fulfilment events
FULFILMENT_ROLLUP_REQUESTED: 'fulfilment.rollup.requested'
FULFILMENT_ROLLUP_COMPLETED: 'fulfilment.rollup.completed'

// Autobiography events
AUTOBIOGRAPHY_CHAPTER_UPDATED: 'autobiography.chapter.updated'

// And more...
```

## Database Schema

Migrations in `/supabase/migrations/`:

- `004_fd_v5_agent_system.sql` - Core tables and functions
- `005_fd_v5_seed_data.sql` - Eras and templates

### Key Tables

- `queue_jobs` - Job queue
- `queue_events` - Event log
- `agent_logs` - Agent activity
- `fd_areas` - Life areas
- `fd_entries` - Journal entries
- `fd_commitments` - Detected commitments
- `fd_score_rollups` - Aggregated scores
- `fd_autobiography_chapters` - Narrative chapters
- `fd_eras` - Timeline (1975-2100)

## Configuration

Copy `.env.agents.example` to `.env.agents`:

```bash
cp .env.agents.example .env.agents
```

Required variables:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY` (for classification)
- `TZ=America/Toronto`

## Testing

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Watch mode
pnpm test:watch
```

## Documentation

Full documentation in `/docs/agents/`:

- [Overview](../../docs/agents/README.md)
- [Orchestrator](../../docs/agents/orchestrator.md)
- [JournalAgent](../../docs/agents/journal-agent.md)
- [CommitmentAgent](../../docs/agents/commitment-agent.md)
- [FulfilmentAgent](../../docs/agents/fulfilment-agent.md)
- [NarrativeAgent](../../docs/agents/narrative-agent.md)

## Contributing

1. Create feature branch
2. Implement agent extending `BaseAgent`
3. Add tests
4. Update documentation
5. Create PR using `feature_task.md` template

## License

Proprietary - King Legend Inc.

## IP Notice

- **King Legend Inc.** - PVT Hostel Products
- **15145597 Canada Inc.** - Atlas/Wisdom
- **AxAi Innovation** - White-label products
