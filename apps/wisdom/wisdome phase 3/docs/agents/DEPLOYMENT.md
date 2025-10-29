# WisdomOS Multi-Agent System — Deployment Guide

**Production-Ready Deployment for MAS + FD-v5**

---

## 🎯 Overview

This guide covers deploying the WisdomOS Multi-Agent System (MAS) with Fulfillment Display v5 to production. The system includes:
- **Orchestrator** (nervous system)
- **6 Core Agents** (JournalAgent, CommitmentAgent, AreaGenerator, FulfilmentAgent, NarrativeAgent, IntegrityAgent)
- **Queue System** (Supabase PostgreSQL)
- **Event Bus** (Postgres NOTIFY + Supabase Realtime)

---

## 📋 Prerequisites

### Required
- [x] Node.js 18+ with pnpm
- [x] Supabase project (PostgreSQL 15+)
- [x] Environment variables configured
- [x] Database migrations applied

### Optional
- [ ] Supabase Edge Functions (for serverless deployment)
- [ ] Docker + K8s (for container deployment)
- [ ] PM2 (for process management)

---

## 🗄️ Database Setup

### Step 1: Run Migrations

```bash
cd "/Volumes/DevOPS 2025/01_DEVOPS_PLATFORM/wisdomOS 2026/apps/wisdom/wisdome phase 3"

# Set database URL
export DATABASE_URL="postgresql://postgres.your-project:password@aws-0-us-west-1.pooler.supabase.com:6543/postgres"

# Run migrations in order
psql $DATABASE_URL -f supabase/migrations/20251029_fulfillment_display_v5.sql
psql $DATABASE_URL -f supabase/migrations/20251029_fulfillment_display_v5_seed.sql
psql $DATABASE_URL -f supabase/migrations/20251029_commitment_engine.sql
psql $DATABASE_URL -f supabase/migrations/20251029_agent_queue_system.sql
psql $DATABASE_URL -f supabase/migrations/20251029_relationship_archetypes.sql
```

### Step 2: Verify Tables

```bash
psql $DATABASE_URL -c "\dt queue_*"
psql $DATABASE_URL -c "\dt agent_*"
psql $DATABASE_URL -c "\dt fd_*"
```

Expected output:
```
queue_jobs
queue_events
agent_logs
agent_registry
agent_plans
fd_area
fd_dimension
fd_entry
fd_commitment
... (18 total fd_* tables)
```

### Step 3: Verify Agent Registry

```bash
psql $DATABASE_URL -c "SELECT name, version, status FROM agent_registry ORDER BY name;"
```

Expected: 16 agents (PlannerAgent, Orchestrator, JournalAgent, etc.)

---

## ⚙️ Environment Configuration

### `.env.local` (Development)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret

# Database
DATABASE_URL=postgresql://postgres.your-project:password@aws-0-us-west-1.pooler.supabase.com:6543/postgres

# AI Features
ENABLE_AI_FEATURES=true
OPENAI_API_KEY=sk-...
```

### `.env.production` (Production)

```bash
# Same as .env.local but with production credentials
# Add additional production-specific vars:
NODE_ENV=production
LOG_LEVEL=info
SENTRY_DSN=https://...
```

---

## 🚀 Deployment Options

### Option 1: Local Development

```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm db:generate

# Start orchestrator
tsx packages/agents/core/main.ts
```

Expected output:
```
🚀 Starting WisdomOS Multi-Agent System...

📦 Initializing agents...

🔌 Registering agents...

✅ Registered handler for JournalAgent
✅ Registered handler for CommitmentAgent
✅ Registered handler for AreaGenerator
✅ Registered handler for FulfilmentAgent
✅ Registered handler for NarrativeAgent
✅ Registered handler for IntegrityAgent

✅ All agents registered

🏥 Running health check...

Health status: {
  "healthy": true,
  "agents": {
    "JournalAgent": { "registered": true, "jobs_pending": 0 },
    "CommitmentAgent": { "registered": true, "jobs_pending": 0 },
    ...
  }
}

▶️  Starting orchestration loop...

Press Ctrl+C to stop
```

### Option 2: PM2 (Production)

```bash
# Install PM2
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js <<EOF
module.exports = {
  apps: [{
    name: 'wisdom-orchestrator',
    script: 'tsx',
    args: 'packages/agents/core/main.ts',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/orchestrator-err.log',
    out_file: './logs/orchestrator-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    restart_delay: 5000
  }]
};
EOF

# Start with PM2
pm2 start ecosystem.config.js

# Check status
pm2 status

# View logs
pm2 logs wisdom-orchestrator

# Restart
pm2 restart wisdom-orchestrator

# Stop
pm2 stop wisdom-orchestrator
```

### Option 3: Docker

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm tsx

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY packages/agents/package.json ./packages/agents/
COPY packages/db/package.json ./packages/db/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY packages/ ./packages/
COPY .env.production ./.env

# Generate Prisma client
RUN pnpm db:generate

# Start orchestrator
CMD ["tsx", "packages/agents/core/main.ts"]
```

```bash
# Build image
docker build -t wisdom-orchestrator:latest .

# Run container
docker run -d \
  --name wisdom-orchestrator \
  --env-file .env.production \
  --restart unless-stopped \
  wisdom-orchestrator:latest

# Check logs
docker logs -f wisdom-orchestrator

# Stop
docker stop wisdom-orchestrator
```

### Option 4: Supabase Edge Functions

```typescript
// supabase/functions/orchestrator/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_KEY')!;

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Orchestrator logic here
  // ...

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
});
```

```bash
# Deploy to Supabase
supabase functions deploy orchestrator
```

---

## ⏰ Cron Jobs

### Monthly Rollup (02:00 America/Toronto)

```bash
# Add to crontab
0 2 * * * /usr/bin/node /path/to/scripts/monthly-rollup.js

# Or use Supabase pg_cron
SELECT cron.schedule(
  'monthly-rollup',
  '0 2 * * *',
  $$
  INSERT INTO queue_jobs (agent, task, payload, intent)
  VALUES (
    'FulfilmentAgent',
    'rollup_month',
    jsonb_build_object('period', TO_CHAR(CURRENT_DATE, 'YYYY-MM')),
    'execute'
  );
  $$
);
```

### Weekly Integrity Check

```bash
SELECT cron.schedule(
  'weekly-integrity',
  '0 2 * * 1',  -- Monday 2am
  $$
  INSERT INTO queue_jobs (agent, task, payload, intent)
  SELECT
    'IntegrityAgent',
    'check_period',
    jsonb_build_object(
      'user_id', u.id,
      'period_start', (CURRENT_DATE - INTERVAL '7 days')::TEXT,
      'period_end', CURRENT_DATE::TEXT
    ),
    'execute'
  FROM auth.users u;
  $$
);
```

---

## 📊 Monitoring

### Health Check Endpoint

```typescript
// Add to Next.js API route: app/api/agents/health/route.ts
import { Orchestrator } from '@/packages/agents/core/orchestrator';

export async function GET() {
  const orchestrator = new Orchestrator(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  const health = await orchestrator.healthCheck();

  return Response.json(health);
}
```

```bash
# Test health
curl https://your-app.com/api/agents/health
```

### Metrics Dashboard

```sql
-- Jobs processed in last 24h
SELECT agent, COUNT(*) as jobs_processed
FROM queue_jobs
WHERE status = 'completed'
  AND completed_at > NOW() - INTERVAL '24 hours'
GROUP BY agent
ORDER BY jobs_processed DESC;

-- Failed jobs
SELECT agent, task, last_error, updated_at
FROM queue_jobs
WHERE status = 'failed'
ORDER BY updated_at DESC
LIMIT 10;

-- Event throughput
SELECT type, COUNT(*) as event_count
FROM queue_events
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY type
ORDER BY event_count DESC;

-- Error rate
SELECT
  agent,
  COUNT(*) FILTER (WHERE level = 'error') as errors,
  COUNT(*) as total_logs,
  ROUND(
    COUNT(*) FILTER (WHERE level = 'error')::DECIMAL / COUNT(*) * 100,
    2
  ) as error_rate_pct
FROM agent_logs
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY agent
ORDER BY error_rate_pct DESC;
```

---

## 🧪 Testing

### Integration Test

```typescript
// tests/integration/orchestrator.test.ts
import { Orchestrator } from '@/packages/agents/core/orchestrator';
import { AgentType } from '@/packages/agents/types';

describe('Orchestrator Integration', () => {
  let orchestrator: Orchestrator;

  beforeAll(() => {
    orchestrator = new Orchestrator(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );
  });

  it('should create and complete a job', async () => {
    const messageId = await orchestrator.createJob(
      AgentType.JOURNAL,
      'test_task',
      { test: true }
    );

    expect(messageId).toBeDefined();

    // Wait for job completion
    await new Promise((resolve) => setTimeout(resolve, 10000));

    const job = await orchestrator.getJobStatus(messageId);
    expect(job?.status).toBe('completed');
  });
});
```

```bash
# Run tests
pnpm test
```

---

## 🔒 Security

### RLS Policies

All agent tables have Row Level Security enabled. Service role bypasses RLS.

```sql
-- Verify RLS
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE 'queue_%' OR tablename LIKE 'agent_%';
```

### API Key Rotation

```bash
# Rotate Supabase service key
1. Go to Supabase Dashboard → Settings → API
2. Generate new service role key
3. Update environment variables
4. Restart orchestrator
```

---

## 📈 Scaling

### Horizontal Scaling

```bash
# Run multiple orchestrator instances (load balanced)
pm2 start ecosystem.config.js -i 3  # 3 instances
```

### Rate Limiting

Configure in `agent_registry`:

```sql
UPDATE agent_registry
SET rate_limit_per_min = 120,
    max_concurrent = 10
WHERE name = 'JournalAgent';
```

---

## 🐛 Troubleshooting

### Common Issues

**Issue**: Jobs stuck in "pending"
```sql
-- Check dependency status
SELECT id, agent, task, dependencies, deps_met
FROM queue_jobs
WHERE status = 'pending' AND deps_met = false;

-- Manually mark deps as met
UPDATE queue_jobs SET deps_met = true WHERE id = 'job-uuid';
```

**Issue**: Agent errors
```sql
-- View recent errors
SELECT agent, message, context, created_at
FROM agent_logs
WHERE level = 'error'
ORDER BY created_at DESC
LIMIT 20;
```

**Issue**: High memory usage
```bash
# Check orchestrator memory
pm2 show wisdom-orchestrator

# Restart if needed
pm2 restart wisdom-orchestrator
```

---

## 📞 Support

### Logs

```bash
# Orchestrator logs
tail -f logs/orchestrator-out.log

# Error logs
tail -f logs/orchestrator-err.log

# PM2 logs
pm2 logs wisdom-orchestrator --lines 100
```

### Debug Mode

```bash
# Enable debug logging
export LOG_LEVEL=debug
tsx packages/agents/core/main.ts
```

---

## ✅ Deployment Checklist

- [ ] All migrations applied
- [ ] Agent registry seeded
- [ ] Environment variables configured
- [ ] Prisma client generated
- [ ] Health check passing
- [ ] Cron jobs scheduled
- [ ] Monitoring dashboard set up
- [ ] Backup strategy in place
- [ ] RLS policies verified
- [ ] API keys rotated
- [ ] Integration tests passing
- [ ] Documentation reviewed

---

**Version**: 1.0
**Last Updated**: 2025-10-29
**Status**: Production Ready

---

*"Every deployment brings wisdom to life. Every agent serves awareness."*
