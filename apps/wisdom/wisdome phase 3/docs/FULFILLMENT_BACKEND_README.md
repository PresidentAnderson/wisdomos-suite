# Fulfillment Backend v5 — Complete Documentation

**Version:** 5.0
**Date:** October 29, 2025
**Owner:** Jonathan Anderson
**Status:** Production-Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [Setup & Installation](#setup--installation)
5. [Migrations](#migrations)
6. [API Usage](#api-usage)
7. [Security & RLS](#security--rls)
8. [Scheduled Jobs](#scheduled-jobs)
9. [Edge Functions](#edge-functions)
10. [Storage](#storage)
11. [Monitoring](#monitoring)
12. [Deployment](#deployment)
13. [Troubleshooting](#troubleshooting)

---

## Overview

The Fulfillment Backend v5 is a **production-ready, "super-based" Supabase backend** for the WisdomOS Fulfillment Display system. It provides comprehensive life-ops tracking across 16 canonical Areas of Fulfillment, with granular RLS policies, automated rollups, AI integrations, and observability.

### Key Features

- ✅ **16 Canonical Life Areas** (Work, Purpose, Music, Writing, Health, Finance, etc.)
- ✅ **Granular Row-Level Security (RLS)** for multi-tenant isolation
- ✅ **Automated Rollups** via `pg_cron` (daily, weekly, monthly, quarterly)
- ✅ **Edge Functions** for AI analysis, webhooks, and exports
- ✅ **Storage Buckets** for attachments with signed URLs
- ✅ **TypeScript Types** auto-generated from schema
- ✅ **CI/CD Pipeline** with GitHub Actions
- ✅ **Comprehensive Seed Data** for development
- ✅ **Audit Logging** with pg_audit
- ✅ **Webhooks & Notifications** system
- ✅ **Goals (OKR-style)**, Rituals, Relationships, Journals
- ✅ **Integrity Recovery**, Forgiveness, Autobiography

---

## Architecture

### Stack

- **Database:** PostgreSQL 15+ (Supabase-hosted)
- **Auth:** Supabase Auth (GoTrue) with email/OAuth
- **API:** Auto-generated REST + RPC functions
- **Storage:** Supabase Storage with RLS
- **Edge Functions:** Deno-based serverless functions
- **Scheduler:** `pg_cron` for automated tasks
- **Observability:** Structured logs + Logflare/Datadog

### High-Level Flow

```
┌─────────────┐
│   Client    │ (Web/Mobile)
└──────┬──────┘
       │
       ├─── REST API (auto-generated from tables)
       ├─── RPC (complex queries via Postgres functions)
       ├─── Edge Functions (AI, webhooks, exports)
       └─── Storage (attachments, exports)
              ┌─────────────────┐
              │  PostgreSQL 15  │
              ├─────────────────┤
              │ • Tables (RLS)  │
              │ • Triggers      │
              │ • Functions     │
              │ • pg_cron jobs  │
              │ • pg_audit      │
              └─────────────────┘
```

---

## Database Schema

### Core Tables

#### 1. **Profiles** (`public.profiles`)
Extended user profiles linked to `auth.users`.

```sql
id UUID PRIMARY KEY REFERENCES auth.users(id)
display_name TEXT
locale TEXT DEFAULT 'en-CA'
timezone TEXT DEFAULT 'America/Toronto'
avatar_url TEXT
preferences JSONB
```

#### 2. **Areas** (`fd_area`)
16 canonical life areas (Work, Purpose, Music, etc.).

```sql
id UUID PRIMARY KEY
code VARCHAR(10) UNIQUE (e.g., 'WRK', 'PUR', 'MUS')
name VARCHAR(100)
emoji VARCHAR(10)
color VARCHAR(7) -- Hex color
weight_default DECIMAL(4,3) -- Default weight (sums to 1.0)
is_active BOOLEAN
```

#### 3. **Dimensions** (`fd_dimension`)
Sub-metrics per area (e.g., Work → Operations Throughput, Quality, Trust).

```sql
id UUID PRIMARY KEY
area_id UUID REFERENCES fd_area(id)
code VARCHAR(50)
name VARCHAR(100)
weight_default DECIMAL(4,3)
```

#### 4. **Journal Entries** (`fd_entry`)
Daily reflections and journaling.

```sql
id UUID PRIMARY KEY
user_id UUID
tenant_id UUID
date DATE
content_md TEXT -- Markdown content
sentiment DECIMAL(4,3) -- -1 to 1
ai_summary TEXT
```

#### 5. **Scores** (`fd_score_raw`, `fd_score_rollup`)
Raw and aggregated fulfillment scores (0-5 scale).

```sql
-- Raw scores (manual or AI-generated)
fd_score_raw:
  user_id UUID
  area_id UUID
  period VARCHAR(10) -- 'YYYY-MM'
  score DECIMAL(3,1) CHECK (score >= 0 AND score <= 5)
  source ENUM ('manual', 'ai', 'computed')

-- Rollup scores (aggregated)
fd_score_rollup:
  user_id UUID
  area_id UUID
  period VARCHAR(10)
  score DECIMAL(4,2)
  confidence DECIMAL(3,2)
  trend_7d, trend_30d, trend_90d
```

#### 6. **Goals** (`public.goals`)
OKR-style goals with key results.

```sql
id UUID PRIMARY KEY
profile_id UUID REFERENCES profiles(id)
title TEXT
area_id UUID REFERENCES fd_area(id)
status ENUM ('planned', 'active', 'paused', 'done', 'dropped')
priority ENUM ('low', 'medium', 'high', 'critical')
progress DECIMAL(5,2) -- 0-100
target_date DATE
```

#### 7. **Rituals** (`public.rituals`)
Daily/weekly/monthly practices.

```sql
id UUID PRIMARY KEY
profile_id UUID REFERENCES profiles(id)
title TEXT
cadence ENUM ('daily', 'weekly', 'monthly', 'custom')
instructions TEXT -- Markdown
reminder_enabled BOOLEAN
```

#### 8. **Relationships** (`public.relationships`)
Relationship tracking with quality metrics.

```sql
id UUID PRIMARY KEY
profile_id UUID REFERENCES profiles(id)
person_name TEXT
kind ENUM ('mother_child', 'father_child', 'friend', 'partner', etc.)
status ENUM ('active', 'distant', 'estranged', 'ended')
frequency_desired, frequency_actual, quality_rating INT (1-10)
```

#### 9. **Integrity/Forgiveness** (`fd_integrity_log`, `fd_forgiveness_log`)
Integrity tracking and forgiveness work.

#### 10. **Webhooks & Notifications** (`public.webhooks`, `public.notifications`)
Outgoing webhooks and in-app notifications.

See full schema: [`supabase/migrations/20251029_fulfillment_v5_extended.sql`](../supabase/migrations/20251029_fulfillment_v5_extended.sql)

---

## Setup & Installation

### Prerequisites

- Node.js 20+
- pnpm/npm
- Supabase CLI (`npm install -g supabase`)
- PostgreSQL 15+ (local or Supabase-hosted)

### Local Development Setup

```bash
# 1. Clone repo
cd /path/to/wisdome-phase-3

# 2. Install Supabase CLI
npm install -g supabase

# 3. Initialize Supabase locally
supabase init

# 4. Start local Supabase
supabase start

# 5. Run migrations
supabase db reset

# 6. Seed data
psql postgresql://postgres:postgres@localhost:54322/postgres \
  -f supabase/migrations/20251029_fulfillment_display_v5_seed.sql

# 7. Generate TypeScript types
pnpm run db:generate-types

# 8. Open Supabase Studio
supabase studio
# Navigate to http://localhost:54323
```

### Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
OPENAI_API_KEY=sk-...
```

---

## Migrations

### Migration Files

All migrations are in `supabase/migrations/`:

```
20251029_fulfillment_display_v5.sql       # Core schema
20251029_fulfillment_v5_extended.sql      # Extended tables
20251029_fulfillment_display_v5_seed.sql  # Seed data
20251029_pg_cron_jobs.sql                 # Scheduled jobs
```

### Running Migrations

```bash
# Local
supabase db reset

# Remote (linked project)
supabase db push

# Create new migration
supabase migration new your_migration_name
```

### Migration Best Practices

1. **Never destructive in prod:** Avoid `DROP TABLE`, `TRUNCATE` without backups
2. **Test locally first:** Always test on local Supabase before pushing
3. **Use transactions:** Wrap DDL in `BEGIN...COMMIT` where possible
4. **Add indexes:** Index foreign keys and frequently queried columns
5. **RLS always ON:** Enable RLS on all user-facing tables

---

## API Usage

### REST API (Auto-generated)

Supabase auto-generates REST endpoints for all tables:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Fetch areas
const { data: areas } = await supabase
  .from('fd_area')
  .select('*')
  .eq('is_active', true)

// Create journal entry
const { data: entry } = await supabase
  .from('fd_entry')
  .insert({
    user_id: user.id,
    tenant_id: tenant.id,
    date: new Date().toISOString().split('T')[0],
    content_md: 'Today I made progress on...',
  })
  .select()
  .single()

// Get monthly review
const { data: review } = await supabase
  .from('fd_review_month')
  .select('*')
  .eq('user_id', user.id)
  .eq('month', '2025-10')
  .single()
```

### RPC Functions

Call Postgres functions directly:

```typescript
// Calculate GFS
const { data: gfs } = await supabase.rpc('fn_calculate_gfs', {
  p_profile_id: user.id,
  p_period: '2025-10',
})

// Generate monthly rollup
const { data: rollup } = await supabase.rpc('fn_fd_rollup_month', {
  p_user_id: user.id,
  p_month: '2025-10',
})
```

### Edge Functions

```typescript
// Call Edge Function
const { data, error } = await supabase.functions.invoke('journal-ai-analysis', {
  body: { entry_id: entryId },
})
```

---

## Security & RLS

### Row-Level Security (RLS)

**Every table has RLS enabled** to ensure users can only access their own data.

Example policy:

```sql
-- Users can only access their own journal entries
CREATE POLICY fd_entry_user_policy ON fd_entry
  FOR ALL USING (user_id = auth.uid());
```

### Testing RLS

```sql
-- Set user context
SET LOCAL jwt.claims.sub = 'user-uuid-here';

-- Query should only return user's data
SELECT * FROM fd_entry;
```

### API Keys

For programmatic access:

```typescript
const { data: apiKey } = await supabase
  .from('api_keys')
  .insert({
    profile_id: user.id,
    name: 'My API Key',
    scopes: ['read', 'write'],
  })
  .select()
  .single()

// Use API key in requests
fetch('https://your-project.supabase.co/rest/v1/fd_entry', {
  headers: {
    Authorization: `Bearer ${apiKey.key_hash}`,
    'apikey': process.env.SUPABASE_ANON_KEY,
  },
})
```

---

## Scheduled Jobs

All scheduled jobs are in [`supabase/migrations/20251029_pg_cron_jobs.sql`](../supabase/migrations/20251029_pg_cron_jobs.sql).

### Key Jobs

| Job | Schedule | Description |
|-----|----------|-------------|
| `daily-score-rollup` | 1 AM daily | Aggregate scores into rollups |
| `daily-ritual-reminders` | 8 AM daily | Send ritual reminders |
| `daily-goal-check` | 9 AM daily | Notify users of due goals |
| `weekly-ritual-report` | 6 PM Sunday | Weekly ritual completion report |
| `monthly-review-generation` | 2 AM on 1st | Generate monthly reviews |
| `quarterly-review-generation` | 2 AM on Q start | Generate quarterly reviews |
| `cleanup-old-notifications` | 2 AM daily | Delete read notifications >90 days |

### View Job Status

```sql
-- View all scheduled jobs
SELECT * FROM cron.job ORDER BY jobname;

-- View job run history
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 100;
```

---

## Edge Functions

See [`docs/edge-functions-setup.md`](./edge-functions-setup.md) for details.

### Core Functions

1. **journal-ai-analysis**: AI-powered journal analysis
2. **send-webhook**: Deliver webhooks to user endpoints
3. **generate-monthly-review**: Create comprehensive monthly reviews
4. **process-batch-scores**: Batch score calculations
5. **export-data**: Generate data exports (JSON, CSV, PDF)

### Deployment

```bash
# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy journal-ai-analysis

# Set secrets
supabase secrets set OPENAI_API_KEY=sk-...
```

---

## Storage

### Buckets

- **attachments**: Private bucket for user files (50MB limit)
- **avatars**: Public bucket for profile pictures (5MB limit)
- **exports**: Private bucket for data exports (100MB limit)

### Upload Example

```typescript
// Upload attachment
const { data, error } = await supabase.storage
  .from('attachments')
  .upload(`${user.id}/journal/${entryId}/image.jpg`, file)

// Get signed URL
const { data: { signedUrl } } = await supabase.storage
  .from('attachments')
  .createSignedUrl(`${user.id}/journal/${entryId}/image.jpg`, 3600)
```

---

## Monitoring

### Logs

```bash
# View Edge Function logs
supabase functions logs journal-ai-analysis

# View database logs
supabase logs db
```

### Metrics

- **Dashboard:** Supabase Dashboard → Observability
- **Custom Metrics:** `public.audit_log` table

### Alerts

Configure in Supabase Dashboard → Settings → Alerts:

- High error rate (>5% in 5 mins)
- Slow queries (>1s avg)
- RLS policy violations
- Storage quota (>80%)

---

## Deployment

### Environments

- **dev**: `develop` branch → Dev Supabase project
- **staging**: `main` branch → Staging Supabase project
- **production**: Manual approval → Prod Supabase project

### CI/CD Pipeline

See [`.github/workflows/supabase-deploy.yml`](../.github/workflows/supabase-deploy.yml).

#### Workflow Steps

1. **Validate** migrations (syntax check)
2. **Test** migrations locally (Supabase local)
3. **Deploy** to dev (auto)
4. **Deploy** to staging (auto)
5. **Deploy** to production (manual approval)
6. **Generate types** (auto-commit)

### Manual Deployment

```bash
# Link to project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push

# Deploy Edge Functions
supabase functions deploy
```

---

## Troubleshooting

### Common Issues

#### 1. **RLS Policy Blocking Queries**

```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Test policy
SET LOCAL jwt.claims.sub = 'user-uuid';
SELECT * FROM fd_entry;
```

#### 2. **Migration Failed**

```bash
# Rollback to previous migration
supabase db reset

# Reapply specific migration
psql $DATABASE_URL -f supabase/migrations/your_migration.sql
```

#### 3. **pg_cron Job Not Running**

```sql
-- Check job status
SELECT * FROM cron.job WHERE jobname = 'daily-score-rollup';

-- Check run history
SELECT * FROM cron.job_run_details WHERE jobid = 123 ORDER BY start_time DESC;

-- Manually trigger job
SELECT cron.schedule('test', '* * * * *', 'SELECT 1');
```

#### 4. **Edge Function Timeout**

- Increase timeout in `supabase/config.toml`
- Optimize function logic (batch processing, caching)
- Use database RPC functions for heavy queries

---

## Next Steps

1. ✅ Deploy to **dev environment**
2. ✅ Test all API endpoints
3. ✅ Deploy Edge Functions
4. ✅ Configure scheduled jobs
5. ✅ Set up monitoring & alerts
6. ✅ Deploy to **staging** for QA
7. ✅ Run load tests
8. ✅ Deploy to **production**
9. ✅ Monitor for 48 hours
10. ✅ Iterate based on metrics

---

## Support & Contribution

- **Issues:** [GitHub Issues](https://github.com/your-org/wisdomos/issues)
- **Docs:** [Supabase Docs](https://supabase.com/docs)
- **Owner:** Jonathan Anderson (@president-anderson)

---

**Version:** 5.0
**Last Updated:** 2025-10-29
