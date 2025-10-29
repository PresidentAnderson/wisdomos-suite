# Fulfillment Backend Deployment Guide (Supabase)

**Version:** 5.0
**Date:** 2025-10-29
**Owner:** Jonathan Anderson (President Anderson)
**Stack:** Supabase (Postgres + Auth + Storage + Edge Functions), TypeScript, pg_cron

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Migrations](#database-migrations)
4. [Edge Functions Deployment](#edge-functions-deployment)
5. [pg_cron Jobs Setup](#pg_cron-jobs-setup)
6. [Storage Buckets](#storage-buckets)
7. [Testing](#testing)
8. [Monitoring & Observability](#monitoring--observability)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Tools

```bash
# Install Supabase CLI
npm install -g supabase

# Verify installation
supabase --version
```

### Required Accounts & Access

- **Supabase Account**: [supabase.com](https://supabase.com)
- **OpenAI API Key**: For AI-powered interpretations (optional)
- **1Password CLI**: For secrets management (optional)

### Environment Variables

```bash
# .env.local (DO NOT COMMIT)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
OPENAI_API_KEY=sk-proj-...
DATABASE_URL=postgresql://postgres:[password]@[host]:6543/postgres
```

---

## Environment Setup

### 1. Initialize Supabase Project

```bash
# Login to Supabase
supabase login

# Link to existing project
supabase link --project-ref your-project-ref

# Or create new project
supabase projects create fulfillment-backend-v5 --org-id your-org-id
```

### 2. Configure Local Development

```bash
# Start local Supabase (optional for local dev)
supabase start

# Check status
supabase status
```

### 3. Set Environment Secrets

```bash
# Set OpenAI API key for Edge Functions
supabase secrets set OPENAI_API_KEY=sk-proj-...

# Verify secrets
supabase secrets list
```

---

## Database Migrations

### Migration Files Overview

```
supabase/migrations/
├── 000_core_schema.sql              # Core WisdomOS schema
├── 001_phase3_schema.sql            # Phase 3 enhancements
├── 20251029_fulfillment_display_v5.sql       # Fulfillment v5 core tables
├── 20251029_fulfillment_display_v5_seed.sql  # Seed data (16 areas)
├── 20251029_fulfillment_backend_complete.sql # Backend completion
├── 20251029_pg_cron_jobs.sql        # Scheduled jobs
├── 20251029_agent_queue_system.sql  # Agent queue
├── 20251029_commitment_engine.sql   # Commitment tracking
└── 20251029_relationship_archetypes.sql # Relationships
```

### Apply Migrations

#### Production Deployment

```bash
# Push all migrations to production
supabase db push

# Or apply specific migration
supabase migration up --db-url $DATABASE_URL
```

#### Local Development

```bash
# Reset local database (WARNING: destroys data)
supabase db reset

# Apply migrations locally
supabase db push --local
```

### Verify Migrations

```bash
# Check migration status
supabase migration list

# Inspect schema
supabase db inspect

# Connect to database
psql $DATABASE_URL
```

```sql
-- Verify tables exist
\dt fd_*

-- Check row counts
SELECT 'fd_area' as table_name, COUNT(*) FROM fd_area
UNION ALL
SELECT 'fd_dimension', COUNT(*) FROM fd_dimension;

-- Expected output:
-- fd_area: 16 rows
-- fd_dimension: ~60-80 rows
```

---

## Edge Functions Deployment

### Available Functions

1. **generate-interpretations**: AI-powered pattern analysis
2. **calculate-gfs**: Global Fulfillment Score calculation
3. **process-journal-entry**: Entry sentiment & linking
4. **send-webhook**: Webhook delivery with retry

### Deploy Functions

```bash
# Deploy all functions
supabase functions deploy generate-interpretations
supabase functions deploy calculate-gfs
supabase functions deploy process-journal-entry
supabase functions deploy send-webhook

# Or deploy all at once
for func in generate-interpretations calculate-gfs process-journal-entry send-webhook; do
  supabase functions deploy $func
done
```

### Test Functions Locally

```bash
# Serve function locally
supabase functions serve generate-interpretations --env-file .env.local

# Test with curl
curl -i --location --request POST \
  'http://localhost:54321/functions/v1/generate-interpretations' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"profile_id":"uuid-here","period":"2025-10"}'
```

### Invoke Functions from Database

```sql
-- Example: Trigger interpretation generation from SQL
SELECT
  net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/generate-interpretations',
    headers := '{"Authorization": "Bearer ' || current_setting('app.service_role_key') || '", "Content-Type": "application/json"}',
    body := jsonb_build_object(
      'profile_id', 'user-uuid-here',
      'period', '2025-10'
    )
  );
```

---

## pg_cron Jobs Setup

### Enable pg_cron Extension

```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;
```

### View Scheduled Jobs

```sql
-- List all jobs
SELECT * FROM cron.job ORDER BY jobname;

-- View job run history
SELECT *
FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 50;
```

### Key Jobs

| Job Name | Schedule | Purpose |
|----------|----------|---------|
| `daily-score-rollup` | 1 AM daily | Aggregate scores into rollups |
| `daily-goal-check` | 9 AM daily | Notify about upcoming deadlines |
| `daily-integrity-check` | 7 PM daily | Alert unresolved integrity issues |
| `weekly-ritual-report` | 6 PM Sunday | Weekly ritual completion report |
| `monthly-review-generation` | 2 AM 1st of month | Generate monthly reviews |
| `quarterly-review-generation` | 2 AM 1st of quarter | Generate quarterly reviews |

### Manage Jobs

```sql
-- Disable a job
SELECT cron.unschedule('job-name');

-- Re-enable a job (re-run migration or manually schedule)
SELECT cron.schedule(
  'job-name',
  '0 1 * * *',
  $$ SELECT 1; $$
);

-- Manually trigger a job
SELECT cron.schedule('test-job', '* * * * *', $$ SELECT NOW(); $$);
SELECT cron.unschedule('test-job');
```

---

## Storage Buckets

### Create Buckets

```sql
-- Create attachments bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('fd-attachments', 'fd-attachments', false);

-- Set up RLS policies
CREATE POLICY "Users can upload their own attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'fd-attachments' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'fd-attachments' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### Upload Example

```typescript
// Frontend code
const { data, error } = await supabase.storage
  .from('fd-attachments')
  .upload(`${userId}/evidence/${filename}`, file);
```

---

## Testing

### Database Tests

```bash
# Test connection
psql $DATABASE_URL -c "SELECT NOW();"

# Test RLS policies
psql $DATABASE_URL <<EOF
SET ROLE authenticated;
SET request.jwt.claim.sub = 'user-uuid-here';
SELECT * FROM fd_entry LIMIT 5;
EOF
```

### Function Tests

```bash
# Test calculate-gfs
curl -X POST \
  https://your-project.supabase.co/functions/v1/calculate-gfs \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "profile_id": "user-uuid",
    "period": "2025-10"
  }'
```

### Load Testing

```bash
# Use Apache Bench or k6
ab -n 100 -c 10 \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  https://your-project.supabase.co/functions/v1/calculate-gfs
```

---

## Monitoring & Observability

### Supabase Dashboard

- **Logs**: View real-time logs at `https://app.supabase.com/project/[ref]/logs`
- **Database**: Monitor queries at `https://app.supabase.com/project/[ref]/database/query-performance`
- **Functions**: Check invocations at `https://app.supabase.com/project/[ref]/functions`

### Custom Monitoring Queries

```sql
-- Active users (last 24h)
SELECT COUNT(DISTINCT profile_id)
FROM fd_audit_log
WHERE created_at >= NOW() - INTERVAL '24 hours';

-- GFS distribution
SELECT
  FLOOR(gfs / 10) * 10 AS gfs_bucket,
  COUNT(*) as users
FROM fd_review_month
WHERE month = TO_CHAR(CURRENT_DATE, 'YYYY-MM')
GROUP BY gfs_bucket
ORDER BY gfs_bucket;

-- Unresolved integrity issues
SELECT COUNT(*)
FROM fd_integrity_log
WHERE resolved_at IS NULL;

-- Pending notifications
SELECT
  notification_type,
  COUNT(*) as count
FROM fd_notification
WHERE status = 'pending'
GROUP BY notification_type;
```

### Set Up Alerts

```sql
-- Create monitoring function
CREATE OR REPLACE FUNCTION fn_check_system_health()
RETURNS TABLE(metric TEXT, value NUMERIC, status TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT
    'pending_notifications'::TEXT,
    COUNT(*)::NUMERIC,
    CASE WHEN COUNT(*) > 1000 THEN 'CRITICAL' ELSE 'OK' END
  FROM fd_notification WHERE status = 'pending'
  UNION ALL
  SELECT
    'unresolved_integrity_issues',
    COUNT(*),
    CASE WHEN COUNT(*) > 100 THEN 'WARNING' ELSE 'OK' END
  FROM fd_integrity_log WHERE resolved_at IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Schedule health check
SELECT cron.schedule(
  'system-health-alert',
  '*/30 * * * *', -- Every 30 minutes
  $$ SELECT * FROM fn_check_system_health() WHERE status != 'OK'; $$
);
```

---

## Troubleshooting

### Common Issues

#### 1. Migrations Fail

```bash
# Check current schema version
supabase migration list

# Repair migrations
supabase migration repair --status applied --version YYYYMMDDHHMMSS

# Force push (DANGEROUS)
supabase db push --force
```

#### 2. RLS Blocks Queries

```sql
-- Temporarily disable RLS for debugging (DO NOT USE IN PRODUCTION)
ALTER TABLE fd_entry DISABLE ROW LEVEL SECURITY;

-- Check policies
\d+ fd_entry

-- Test policy logic
SELECT * FROM fd_entry WHERE user_id = auth.uid();
```

#### 3. pg_cron Jobs Not Running

```sql
-- Check job status
SELECT * FROM cron.job WHERE jobname = 'your-job-name';

-- Check run history
SELECT *
FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'your-job-name')
ORDER BY start_time DESC
LIMIT 10;

-- Check logs
SELECT * FROM cron.job_run_details WHERE status = 'failed';
```

#### 4. Edge Function Errors

```bash
# View function logs
supabase functions logs generate-interpretations

# Test locally
supabase functions serve generate-interpretations --inspect
```

#### 5. Performance Issues

```sql
-- Find slow queries
SELECT
  query,
  mean_exec_time,
  calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Analyze table
ANALYZE fd_entry;

-- Rebuild indexes
REINDEX TABLE fd_entry;
```

---

## Production Checklist

- [ ] All migrations applied successfully
- [ ] Seed data loaded (16 areas, dimensions)
- [ ] RLS policies enabled on all user tables
- [ ] Edge Functions deployed and tested
- [ ] pg_cron jobs scheduled and verified
- [ ] Storage buckets created with proper policies
- [ ] Environment secrets configured
- [ ] Monitoring dashboards set up
- [ ] Backup strategy in place
- [ ] Load testing completed
- [ ] Documentation reviewed

---

## Next Steps

1. **Frontend Integration**: Connect Next.js app to backend APIs
2. **AI Fine-Tuning**: Train custom models on user data
3. **Mobile Sync**: Implement offline-first with Expo
4. **Analytics**: Add Posthog or Mixpanel for usage tracking
5. **Compliance**: GDPR/CCPA data export & deletion

---

## Support

- **Supabase Docs**: https://supabase.com/docs
- **WisdomOS Repo**: https://github.com/your-org/wisdomos
- **Issues**: https://github.com/your-org/wisdomos/issues
- **Contact**: president.anderson@wisdomos.com

---

**Deployment Complete! 🚀**
