# WisdomOS Autopilot - Autonomous Agent Operation

## Overview

WisdomOS is now configured for full autonomous operation with 10 enterprise agents running 24/7 on Supabase Edge Functions with automated scheduling via pg_cron.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Supabase Edge Functions                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐      ┌──────────────┐                    │
│  │ Orchestrator │◄─────┤  pg_cron     │  Every 5 min      │
│  │  (Master)    │      │  Scheduler   │                    │
│  └──────┬───────┘      └──────────────┘                    │
│         │                                                    │
│         ├──► JournalAgent       (10 min)                    │
│         ├──► CommitmentAgent    (15 min)                    │
│         ├──► FulfilmentAgent    (hourly + monthly)          │
│         ├──► NarrativeAgent     (daily 3 AM)                │
│         ├──► PlannerAgent       (6 hours)                   │
│         ├──► IntegrityAgent     (hourly)                    │
│         ├──► SecurityAgent      (on-demand)                 │
│         ├──► FinanceAgent       (daily 1 AM)                │
│         └──► AnalyticsAgent     (hourly)                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  PostgreSQL Database                        │
│                  (Supabase Postgres)                        │
│                                                              │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐                │
│   │  Jobs    │  │  Events  │  │   Logs   │                │
│   │  Queue   │  │   Bus    │  │  Audit   │                │
│   └──────────┘  └──────────┘  └──────────┘                │
└─────────────────────────────────────────────────────────────┘
```

## Enterprise Agents

### 1. Orchestrator (Master Controller)
**Function**: `orchestrator-poll`
**Schedule**: Every 5 minutes
**Responsibilities**:
- Poll job queue for pending tasks
- Route jobs to appropriate agents
- Implement exponential backoff for retries
- Handle job lifecycle (pending → processing → completed/failed)
- Monitor agent health

**Configuration**:
```typescript
// Cron: */5 * * * *
// Max concurrent jobs: 10
// Retry strategy: Exponential backoff (1s, 2s, 4s, 8s, 16s)
// Timeout: 120s per job
```

### 2. JournalAgent
**Function**: `journal-agent`
**Schedule**: Every 10 minutes
**Responsibilities**:
- Ingest new journal entries
- Classify entries (reflection, experience, goal, etc.)
- Sentiment analysis
- Extract entities and themes
- Link to existing commitments

**Triggers**:
- Automatic: Every 10 minutes for unclassified entries
- Manual: POST to `/functions/v1/journal-agent`
- Webhook: From journal entry creation

### 3. CommitmentAgent
**Function**: `commitment-agent`
**Schedule**: Every 15 minutes
**Responsibilities**:
- Detect commitments in journal entries
- Calculate confidence scores (0-1)
- Auto-spawn life areas when confidence > 0.7
- Track commitment status
- Link to fulfillment dimensions

**Auto-Spawning**:
When a commitment is detected with high confidence, automatically creates:
- New Life Area (if needed)
- Subdomain structure
- 6 dimensions with baseline metrics

### 4. FulfilmentAgent
**Function**: `fulfilment-agent`
**Schedules**:
- Hourly: Score calculation
- Monthly (1st at 2 AM): Rollup aggregation

**Responsibilities**:
- Calculate dimension metrics (0-5 scale)
- Aggregate subdomain scores
- Roll up life area totals
- Generate monthly/quarterly summaries
- Detect trends and anomalies

**Scoring Algorithm**:
```
Dimension Score = (Promise Kept Rate × 0.4) +
                  (Activity Frequency × 0.3) +
                  (Sentiment Average × 0.2) +
                  (Goal Achievement × 0.1)
```

### 5. NarrativeAgent
**Function**: `narrative-agent`
**Schedule**: Daily at 3 AM
**Responsibilities**:
- Generate autobiography updates
- Synthesize journal entries into narrative
- Maintain 125-year timeline (1975-2100)
- Create era summaries
- Extract life themes

**Timeline Structure**:
- 13 eras from birth to future projection
- Monthly narrative blocks
- Key moment highlighting
- Thematic analysis

### 6. PlannerAgent
**Function**: `planner-agent`
**Schedule**: Every 6 hours
**Responsibilities**:
- Generate DAG task plans
- Resolve dependencies
- Topological sort
- Estimate effort and duration
- Detect circular dependencies

**DAG Generation**:
```
Input: Goals + Commitments + Current State
Output: DAG with nodes (tasks) and edges (dependencies)
Algorithm: Topological sort with cycle detection
```

### 7. IntegrityAgent
**Function**: `integrity-agent`
**Schedule**: Every hour
**Responsibilities**:
- Track promises and commitments
- Enforce time-lock edits (±90 days)
- Calculate integrity scores
- Flag broken promises
- Generate integrity reports

**Time-Lock Rules**:
- Can edit entries from last 90 days
- Future projections up to +90 days
- Historical entries locked after 90 days
- Exceptions logged and audited

### 8. SecurityAgent
**Function**: `security-agent`
**Schedule**: On-demand
**Responsibilities**:
- Field-level encryption (AES-256-GCM)
- RLS policy validation
- Audit trail generation
- Security event monitoring
- Compliance reporting

**Encryption**:
- Sensitive fields encrypted at rest
- Per-tenant encryption keys
- Key rotation every 90 days
- Backup encryption with separate keys

### 9. FinanceAgent
**Function**: `finance-agent`
**Schedule**: Daily at 1 AM
**Responsibilities**:
- Ingest ledger transactions
- Calculate profitability metrics
- Cashflow analysis
- Multi-currency support
- Financial reporting

**Metrics Calculated**:
- Monthly revenue/expenses
- Profit margins
- Cash runway
- Burn rate
- Category breakdowns

### 10. AnalyticsAgent
**Function**: `analytics-agent`
**Schedule**: Every hour
**Responsibilities**:
- Calculate KPIs (Activation, Retention, Outcome, Integrity)
- Track product metrics
- User engagement analysis
- Cohort analysis
- Trend detection

**KPI Framework**:
```
Activation: % users with 3+ journal entries in first week
Retention: % users active in week N after signup
Outcome: % users with avg fulfillment score > 3.5
Integrity: % promises kept within deadline
```

## Deployment

### Prerequisites
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to project
supabase link --project-ref yvssmqyphqgvpkwudeoa
```

### Deploy All Agents
```bash
cd /path/to/wisdomos-2026
./scripts/deploy-agents.sh
```

The script will:
1. Build the agents package
2. Create function directories
3. Deploy each agent to Supabase
4. Generate cron setup SQL
5. Display deployment summary

### Configure Cron Schedules
```bash
# Execute the generated SQL
supabase db execute --file /tmp/setup-crons.sql
```

### Verify Deployment
```bash
# List deployed functions
supabase functions list

# Check function logs
supabase functions logs orchestrator-poll
supabase functions logs journal-agent

# Test a function
curl -X POST https://yvssmqyphqgvpkwudeoa.supabase.co/functions/v1/journal-agent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"action": "process_unclassified"}'
```

## Monitoring

### Grafana Dashboards
Access: `http://localhost:3000`

**WisdomOS Platform Overview** includes:
- Agent job queue length
- Job success/failure rates
- Processing times per agent
- Database connection count
- System resource usage

### Key Metrics to Watch
```
- orchestrator_jobs_pending < 100
- journal_processing_lag < 1 hour
- commitment_detection_rate > 0.1 per day
- fulfilment_calculation_success > 95%
- integrity_check_failures < 5 per day
```

### Alerts Configured
- **Critical**: Orchestrator not polling for 15+ minutes
- **Warning**: Job queue backlog > 500
- **Warning**: Agent failure rate > 10%
- **Critical**: Database connection failure
- **Warning**: Fulfilment scores not calculated in 2+ hours

### Log Monitoring
```bash
# Real-time logs for all agents
supabase functions logs --all

# Filter by agent
supabase functions logs orchestrator-poll --level error

# View job queue
SELECT * FROM jobs
WHERE status IN ('pending', 'processing')
ORDER BY created_at DESC
LIMIT 50;

# View recent events
SELECT * FROM events
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
```

## Troubleshooting

### Agent Not Running
```bash
# Check function status
supabase functions list

# Redeploy
supabase functions deploy agent-name --project-ref yvssmqyphqgvpkwudeoa

# Check logs for errors
supabase functions logs agent-name --level error
```

### Job Queue Backup
```sql
-- Check job status distribution
SELECT status, COUNT(*) FROM jobs GROUP BY status;

-- Cancel stuck jobs
UPDATE jobs
SET status = 'failed', error = 'Manual cancellation - stuck'
WHERE status = 'processing'
AND updated_at < NOW() - INTERVAL '1 hour';

-- Retry failed jobs
UPDATE jobs
SET status = 'pending', retry_count = 0
WHERE status = 'failed'
AND created_at > NOW() - INTERVAL '24 hours';
```

### Cron Not Triggering
```sql
-- Check cron jobs
SELECT * FROM cron.job WHERE jobname LIKE 'wisdomos_%';

-- Check cron history
SELECT * FROM cron.job_run_details
WHERE job_name LIKE 'wisdomos_%'
ORDER BY start_time DESC LIMIT 20;

-- Reschedule a job
SELECT cron.unschedule('wisdomos_orchestrator_poll');
SELECT cron.schedule(
  'wisdomos_orchestrator_poll',
  '*/5 * * * *',
  $$ SELECT net.http_post(...) $$
);
```

### Performance Issues
```sql
-- Check slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
WHERE mean_exec_time > 1000
ORDER BY mean_exec_time DESC;

-- Check table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Scaling

### Horizontal Scaling
Supabase Edge Functions auto-scale based on load:
- Cold start: ~1-2s
- Warm instances: <100ms
- Max concurrent: 100 per function
- Auto-scaling triggers at 70% capacity

### Database Scaling
Current: Supabase Pro Plan
- Connection pooling: PgBouncer
- Read replicas: Available if needed
- Upgrade path: Enterprise tier

### Cost Optimization
```
Current costs (monthly estimate):
- Edge Functions: $25 (10 functions × 1M invocations)
- Database: $25 (Pro plan)
- Storage: $10 (100GB)
- Bandwidth: $5
Total: ~$65/month
```

### Optimization Tips
1. Batch journal processing (process 50 at a time)
2. Use database connection pooling
3. Cache frequently accessed data
4. Implement rate limiting on high-volume agents
5. Archive old jobs/events quarterly

## Security

### Access Control
- Service role key for cron jobs
- Anon key for public endpoints
- RLS policies on all tables
- Function-level authorization

### Encryption
- TLS 1.3 for all connections
- AES-256-GCM for sensitive fields
- Per-tenant encryption keys
- Key rotation every 90 days

### Audit Trail
All agent actions logged to `logs` table:
- Timestamp
- Agent name
- Action performed
- User ID (if applicable)
- Request/response
- Errors

### Compliance
- GDPR: Right to erasure implemented
- CCPA: Data export available
- SOC 2: Audit logs retained 1 year
- HIPAA: PHI encryption at rest/transit

## Future Enhancements

### Planned Features
1. **Agent Health Dashboard**: Real-time monitoring UI
2. **Adaptive Scheduling**: ML-based cron optimization
3. **Multi-Region**: Deploy to multiple Supabase regions
4. **Agent Collaboration**: Inter-agent communication bus
5. **User Preferences**: Per-user agent scheduling

### Roadmap
- **Q1 2026**: Agent health dashboard
- **Q2 2026**: Adaptive scheduling
- **Q3 2026**: Multi-region deployment
- **Q4 2026**: Agent collaboration framework

## Support

### Documentation
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [pg_cron Documentation](https://github.com/citusdata/pg_cron)
- [WisdomOS Agent API Reference](/docs/api/agents)

### Getting Help
- GitHub Issues: https://github.com/PresidentAnderson/wisdomos-phase3/issues
- Discord: wisdomos.com/discord
- Email: support@wisdomos.com

---

Last Updated: October 30, 2025
Version: 1.0.0
Status: ✅ Production-Ready
