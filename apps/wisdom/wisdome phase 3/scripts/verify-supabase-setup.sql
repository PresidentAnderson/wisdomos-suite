-- =====================================================
-- Supabase Setup Verification Script
-- =====================================================
-- Purpose: Verify all required features are enabled
-- Date: 2025-10-29
-- =====================================================

\echo '========================================='
\echo 'SUPABASE SETUP VERIFICATION'
\echo '========================================='
\echo ''

-- =====================================================
-- 1. CHECK POSTGRESQL EXTENSIONS
-- =====================================================
\echo '1. Checking PostgreSQL Extensions...'
\echo ''

SELECT
  extname as "Extension",
  extversion as "Version",
  CASE
    WHEN extname = 'pg_cron' THEN '⚠️  CRITICAL'
    WHEN extname IN ('pg_stat_statements', 'pgaudit', 'pg_trgm') THEN '🔵 RECOMMENDED'
    ELSE '✅ OPTIONAL'
  END as "Priority"
FROM pg_extension
WHERE extname IN ('pg_cron', 'uuid-ossp', 'pg_stat_statements', 'pgaudit', 'pg_trgm', 'vector')
ORDER BY extname;

\echo ''
\echo 'Expected Critical Extensions:'
\echo '  - pg_cron (for scheduled jobs)'
\echo '  - uuid-ossp (for UUID generation)'
\echo ''

-- Check if pg_cron is enabled
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    RAISE WARNING '⚠️  pg_cron is NOT enabled! This is CRITICAL for scheduled jobs.';
    RAISE NOTICE 'To enable: CREATE EXTENSION IF NOT EXISTS pg_cron;';
  ELSE
    RAISE NOTICE '✅ pg_cron is enabled';
  END IF;
END $$;

\echo ''

-- =====================================================
-- 2. CHECK STORAGE BUCKETS
-- =====================================================
\echo '2. Checking Storage Buckets...'
\echo ''

SELECT
  id as "Bucket ID",
  name as "Bucket Name",
  CASE WHEN public THEN 'Public ✅' ELSE 'Private 🔒' END as "Access",
  file_size_limit as "Max Size (bytes)",
  CASE
    WHEN name = 'attachments' THEN '50MB'
    WHEN name = 'avatars' THEN '5MB'
    WHEN name = 'exports' THEN '100MB'
  END as "Expected Size"
FROM storage.buckets
WHERE name IN ('attachments', 'avatars', 'exports')
ORDER BY name;

\echo ''
\echo 'Expected Buckets:'
\echo '  - attachments (private, 50MB)'
\echo '  - avatars (public, 5MB)'
\echo '  - exports (private, 100MB)'
\echo ''

-- Check if all buckets exist
DO $$
DECLARE
  bucket_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO bucket_count
  FROM storage.buckets
  WHERE name IN ('attachments', 'avatars', 'exports');

  IF bucket_count < 3 THEN
    RAISE WARNING '⚠️  Only % out of 3 expected buckets found!', bucket_count;
    RAISE NOTICE 'Run: psql $DATABASE_URL -f supabase/storage-buckets.sql';
  ELSE
    RAISE NOTICE '✅ All 3 storage buckets are configured';
  END IF;
END $$;

\echo ''

-- =====================================================
-- 3. CHECK RLS POLICIES
-- =====================================================
\echo '3. Checking Row-Level Security (RLS) Policies...'
\echo ''

SELECT
  COUNT(*) as "Total RLS Policies",
  COUNT(DISTINCT tablename) as "Tables with RLS"
FROM pg_policies
WHERE schemaname = 'public';

\echo ''

SELECT
  tablename as "Table Name",
  COUNT(*) as "Policy Count"
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename
LIMIT 20;

\echo ''
\echo 'Expected: 30+ RLS policies across all user-facing tables'
\echo ''

-- =====================================================
-- 4. CHECK STORAGE RLS POLICIES
-- =====================================================
\echo '4. Checking Storage RLS Policies...'
\echo ''

SELECT
  bucket_id as "Bucket",
  name as "Policy Name",
  definition as "Definition"
FROM storage.objects_policies
WHERE bucket_id IN ('attachments', 'avatars', 'exports')
ORDER BY bucket_id, name;

\echo ''

-- =====================================================
-- 5. CHECK SCHEDULED JOBS (pg_cron)
-- =====================================================
\echo '5. Checking Scheduled Jobs (pg_cron)...'
\echo ''

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    -- Show cron jobs
    PERFORM 1;
  ELSE
    RAISE WARNING '⚠️  Cannot check scheduled jobs - pg_cron not enabled';
  END IF;
END $$;

-- If pg_cron is enabled, show jobs
SELECT
  jobid as "Job ID",
  jobname as "Job Name",
  schedule as "Schedule (Cron)",
  active as "Active"
FROM cron.job
ORDER BY jobname
LIMIT 20;

\echo ''
\echo 'Expected: 19 scheduled jobs for rollups, reminders, cleanup'
\echo ''

-- Check job count
DO $$
DECLARE
  job_count INTEGER;
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    SELECT COUNT(*) INTO job_count FROM cron.job;

    IF job_count = 0 THEN
      RAISE WARNING '⚠️  No scheduled jobs found!';
      RAISE NOTICE 'Run: psql $DATABASE_URL -f supabase/migrations/20251029_pg_cron_jobs.sql';
    ELSIF job_count < 19 THEN
      RAISE WARNING '⚠️  Only % out of 19 expected jobs found', job_count;
    ELSE
      RAISE NOTICE '✅ All % scheduled jobs are configured', job_count;
    END IF;
  END IF;
END $$;

\echo ''

-- =====================================================
-- 6. CHECK TABLES & INDEXES
-- =====================================================
\echo '6. Checking Tables & Indexes...'
\echo ''

SELECT
  COUNT(DISTINCT tablename) as "Total Tables"
FROM pg_tables
WHERE schemaname = 'public';

SELECT
  COUNT(*) as "Total Indexes"
FROM pg_indexes
WHERE schemaname = 'public';

\echo ''
\echo 'Expected: 40+ tables, 100+ indexes'
\echo ''

-- =====================================================
-- 7. CHECK CORE TABLES EXIST
-- =====================================================
\echo '7. Checking Core Tables...'
\echo ''

SELECT
  tablename as "Table Name",
  CASE WHEN rowsecurity THEN 'Enabled ✅' ELSE 'Disabled ⚠️' END as "RLS Status"
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'fd_area',
    'fd_dimension',
    'fd_entry',
    'fd_score_raw',
    'fd_score_rollup',
    'goals',
    'rituals',
    'relationships',
    'notifications',
    'webhooks',
    'profiles'
  )
ORDER BY tablename;

\echo ''

-- =====================================================
-- 8. CHECK SEED DATA
-- =====================================================
\echo '8. Checking Seed Data...'
\echo ''

SELECT
  'Areas' as "Data Type",
  COUNT(*) as "Count",
  '16 expected' as "Expected"
FROM fd_area
UNION ALL
SELECT
  'Dimensions',
  COUNT(*),
  '70+ expected'
FROM fd_dimension;

\echo ''

-- Show sample areas
SELECT
  code as "Area Code",
  name as "Area Name",
  emoji as "Emoji"
FROM fd_area
ORDER BY code
LIMIT 16;

\echo ''

-- =====================================================
-- 9. CHECK FUNCTIONS
-- =====================================================
\echo '9. Checking Database Functions...'
\echo ''

SELECT
  proname as "Function Name",
  pg_get_function_arguments(oid) as "Arguments"
FROM pg_proc
WHERE pronamespace = 'public'::regnamespace
  AND proname LIKE 'fn_%'
ORDER BY proname;

\echo ''
\echo 'Expected: 15+ helper functions (fn_calculate_gfs, fn_fd_rollup_month, etc.)'
\echo ''

-- =====================================================
-- 10. CHECK TRIGGERS
-- =====================================================
\echo '10. Checking Triggers...'
\echo ''

SELECT
  COUNT(*) as "Total Triggers"
FROM pg_trigger
WHERE NOT tgisinternal;

\echo ''
\echo 'Expected: 20+ triggers for updated_at timestamps'
\echo ''

-- =====================================================
-- SUMMARY
-- =====================================================
\echo ''
\echo '========================================='
\echo 'VERIFICATION SUMMARY'
\echo '========================================='
\echo ''

DO $$
DECLARE
  ext_count INTEGER;
  bucket_count INTEGER;
  policy_count INTEGER;
  job_count INTEGER;
  area_count INTEGER;
  issues TEXT := '';
BEGIN
  -- Check extensions
  SELECT COUNT(*) INTO ext_count
  FROM pg_extension
  WHERE extname IN ('pg_cron', 'uuid-ossp');

  IF ext_count < 2 THEN
    issues := issues || '⚠️  Missing required extensions\n';
  END IF;

  -- Check buckets
  SELECT COUNT(*) INTO bucket_count
  FROM storage.buckets
  WHERE name IN ('attachments', 'avatars', 'exports');

  IF bucket_count < 3 THEN
    issues := issues || '⚠️  Missing storage buckets\n';
  END IF;

  -- Check RLS policies
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public';

  IF policy_count < 30 THEN
    issues := issues || '⚠️  Insufficient RLS policies\n';
  END IF;

  -- Check cron jobs
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    SELECT COUNT(*) INTO job_count FROM cron.job;
    IF job_count < 19 THEN
      issues := issues || '⚠️  Missing scheduled jobs\n';
    END IF;
  ELSE
    issues := issues || '⚠️  pg_cron not enabled\n';
  END IF;

  -- Check seed data
  SELECT COUNT(*) INTO area_count FROM fd_area;
  IF area_count < 16 THEN
    issues := issues || '⚠️  Missing seed data (areas)\n';
  END IF;

  -- Print summary
  IF issues = '' THEN
    RAISE NOTICE '✅ ✅ ✅ ALL SYSTEMS GO! ✅ ✅ ✅';
    RAISE NOTICE '';
    RAISE NOTICE 'Your Supabase instance is fully configured!';
    RAISE NOTICE 'Extensions: % OK', ext_count;
    RAISE NOTICE 'Storage Buckets: % OK', bucket_count;
    RAISE NOTICE 'RLS Policies: % OK', policy_count;
    RAISE NOTICE 'Scheduled Jobs: % OK', job_count;
    RAISE NOTICE 'Seed Data: % areas loaded', area_count;
  ELSE
    RAISE WARNING '⚠️  ISSUES DETECTED:';
    RAISE WARNING '%', issues;
    RAISE NOTICE '';
    RAISE NOTICE 'See above for details on what needs to be fixed.';
  END IF;
END $$;

\echo ''
\echo '========================================='
\echo 'VERIFICATION COMPLETE'
\echo '========================================='
