-- ============================================================
-- DEPLOYMENT VERIFICATION CHECKLIST
-- ============================================================
-- Run these queries in Supabase SQL Editor to verify deployments
-- Project: Phoenix Rising WisdomOS (yvssmqyphqgvpkwudeoa)
-- Date: 2025-10-29
-- ============================================================

-- ============================================================
-- PART 1: ORGANIZATION AUTHENTICATION VERIFICATION
-- ============================================================

-- 1.1 Check if organizations table exists
select
  table_name,
  table_schema
from information_schema.tables
where table_name = 'organizations';
-- Expected: 1 row (table exists in 'public' schema)

-- 1.2 Check organizations table structure
select
  column_name,
  data_type,
  is_nullable,
  column_default
from information_schema.columns
where table_name = 'organizations'
order by ordinal_position;
-- Expected: 7 columns (id, name, domain, plan, status, created_at, updated_at)

-- 1.3 Check if user_roles table exists
select
  table_name,
  table_schema
from information_schema.tables
where table_name = 'user_roles';
-- Expected: 1 row (table exists)

-- 1.4 Check user_roles table structure
select
  column_name,
  data_type,
  is_nullable
from information_schema.columns
where table_name = 'user_roles'
order by ordinal_position;
-- Expected: 6 columns (id, user_id, organization_id, role, created_at, updated_at)

-- 1.5 Check if onboarding_events table exists
select
  table_name,
  table_schema
from information_schema.tables
where table_name = 'onboarding_events';
-- Expected: 1 row (table exists)

-- 1.6 Check onboarding_events table structure
select
  column_name,
  data_type,
  is_nullable
from information_schema.columns
where table_name = 'onboarding_events'
order by ordinal_position;
-- Expected: 5 columns (id, user_id, organization_id, event_type, event_data, created_at)

-- 1.7 Check if automatic user assignment trigger exists
select
  tgname as trigger_name,
  tgenabled as enabled,
  tgtype,
  proname as function_name
from pg_trigger t
join pg_proc p on p.oid = t.tgfoid
where tgname = 'on_auth_user_created';
-- Expected: 1 row (trigger exists and is enabled)

-- 1.8 Check if trigger function exists
select
  routine_name,
  routine_type,
  routine_schema
from information_schema.routines
where routine_name = 'handle_new_user_signup';
-- Expected: 1 row (function exists)

-- 1.9 Check RLS policies on organizations table
select
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
from pg_policies
where tablename = 'organizations';
-- Expected: At least 1 policy for row-level security

-- 1.10 Check RLS policies on user_roles table
select
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
from pg_policies
where tablename = 'user_roles';
-- Expected: At least 1 policy

-- 1.11 Check RLS policies on onboarding_events table
select
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
from pg_policies
where tablename = 'onboarding_events';
-- Expected: At least 1 policy

-- 1.12 Check indexes on organizations
select
  indexname,
  indexdef
from pg_indexes
where tablename = 'organizations';
-- Expected: At least 2 indexes (primary key + domain index)

-- 1.13 Check indexes on user_roles
select
  indexname,
  indexdef
from pg_indexes
where tablename = 'user_roles';
-- Expected: At least 3 indexes (primary key + user_id + org_id)

-- 1.14 Count existing organizations (will be 0 if fresh install)
select count(*) as organization_count from organizations;
-- Expected: 0 (or more if test data exists)

-- 1.15 Count existing user roles
select count(*) as user_role_count from user_roles;
-- Expected: 0 (or more if test data exists)

-- 1.16 Count onboarding events
select count(*) as event_count from onboarding_events;
-- Expected: 0 (or more if test data exists)

-- ============================================================
-- PART 2: FULFILLMENT DASHBOARD API VERIFICATION
-- ============================================================

-- 2.1 Check if materialized view mv_area_signals_latest exists
select
  matviewname,
  hasindexes,
  ispopulated
from pg_matviews
where matviewname = 'mv_area_signals_latest';
-- Expected: 1 row (MV exists, has indexes, is populated)

-- 2.2 Check if materialized view mv_area_dimension_signals_latest exists
select
  matviewname,
  hasindexes,
  ispopulated
from pg_matviews
where matviewname = 'mv_area_dimension_signals_latest';
-- Expected: 1 row (MV exists, has indexes, is populated)

-- 2.3 Check columns in mv_area_signals_latest
select
  attname as column_name,
  atttypid::regtype as data_type
from pg_attribute
where attrelid = 'mv_area_signals_latest'::regclass
  and attnum > 0
  and not attisdropped
order by attnum;
-- Expected: 9 columns (area_id, area_name, cluster_id, cluster_name, cluster_color, daily_date, daily_signal, weekly_date, weekly_signal)

-- 2.4 Check columns in mv_area_dimension_signals_latest
select
  attname as column_name,
  atttypid::regtype as data_type
from pg_attribute
where attrelid = 'mv_area_dimension_signals_latest'::regclass
  and attnum > 0
  and not attisdropped
order by attnum;
-- Expected: 12 columns

-- 2.5 Count rows in mv_area_signals_latest
select count(*) as row_count from mv_area_signals_latest;
-- Expected: Number of areas in your system (may be 0 if no areas exist yet)

-- 2.6 Count rows in mv_area_dimension_signals_latest
select count(*) as row_count from mv_area_dimension_signals_latest;
-- Expected: Number of area×dimension combinations

-- 2.7 Check if refresh function exists
select
  routine_name,
  routine_type,
  routine_schema,
  data_type
from information_schema.routines
where routine_name = 'refresh_fulfillment_materialized_views';
-- Expected: 1 row (function exists)

-- 2.8 Check if get_dashboard_overview function exists
select
  routine_name,
  routine_type,
  routine_schema,
  data_type
from information_schema.routines
where routine_name = 'get_dashboard_overview';
-- Expected: 1 row (function exists, returns jsonb)

-- 2.9 Check if get_area_detail function exists
select
  routine_name,
  routine_type,
  routine_schema,
  data_type
from information_schema.routines
where routine_name = 'get_area_detail';
-- Expected: 1 row (function exists, returns jsonb)

-- 2.10 Check if refresh_and_get_dashboard function exists
select
  routine_name,
  routine_type,
  routine_schema,
  data_type
from information_schema.routines
where routine_name = 'refresh_and_get_dashboard';
-- Expected: 1 row (function exists, returns jsonb)

-- 2.11 Check indexes on materialized views
select
  indexname,
  indexdef
from pg_indexes
where tablename like 'mv_%'
order by tablename, indexname;
-- Expected: 2 unique indexes (one per MV)

-- 2.12 Check indexes on area_subdimensions
select
  indexname,
  indexdef
from pg_indexes
where tablename = 'area_subdimensions';
-- Expected: At least 2 indexes

-- 2.13 Check indexes on relationships
select
  indexname,
  indexdef
from pg_indexes
where tablename = 'relationships';
-- Expected: At least 2 indexes

-- ============================================================
-- PART 3: FUNCTIONAL TESTING
-- ============================================================

-- 3.1 Test refresh_fulfillment_materialized_views function
-- This should complete without errors
select refresh_fulfillment_materialized_views(true);
-- Expected: (no output, completes successfully)

-- 3.2 Test get_dashboard_overview function
-- This should return a JSON object with clusters and areas
select jsonb_pretty(get_dashboard_overview());
-- Expected: JSON object with structure:
-- {
--   "version": "5.4",
--   "clusters": [...]
-- }

-- 3.3 Test get_dashboard_overview response structure
select
  json_typeof(get_dashboard_overview()) as root_type,
  json_typeof(get_dashboard_overview()->'clusters') as clusters_type,
  jsonb_array_length(get_dashboard_overview()->'clusters') as cluster_count;
-- Expected: root_type = object, clusters_type = array, cluster_count >= 0

-- 3.4 Test get_area_detail function (if areas exist)
-- First, get a valid area ID
select id, name from areas order by id limit 1;
-- Then test with that ID (replace 1 with actual ID):
select jsonb_pretty(get_area_detail(1));
-- Expected: JSON object with area details, or error if area doesn't exist

-- 3.5 Test refresh_and_get_dashboard function
select
  json_typeof(refresh_and_get_dashboard()) as type,
  refresh_and_get_dashboard()->>'version' as version;
-- Expected: type = object, version = "5.4"

-- 3.6 Check if base views exist (these should already be there)
select
  table_name,
  table_type
from information_schema.views
where table_name in (
  'v_daily_area_signal',
  'v_weekly_area_signal',
  'v_daily_area_dimension_signal',
  'v_weekly_area_dimension_signal'
)
order by table_name;
-- Expected: 4 rows (all base views exist)

-- ============================================================
-- PART 4: PERFORMANCE TESTING
-- ============================================================

-- 4.1 Measure dashboard overview query time
-- Enable timing in psql or note the execution time
\timing on
select get_dashboard_overview();
\timing off
-- Expected: < 50ms execution time

-- 4.2 Measure area detail query time
\timing on
select get_area_detail(1); -- Replace with valid area ID
\timing off
-- Expected: < 30ms execution time

-- 4.3 Measure materialized view refresh time
\timing on
select refresh_fulfillment_materialized_views(true);
\timing off
-- Expected: 100-200ms (concurrent refresh is non-blocking)

-- ============================================================
-- PART 5: DATA INTEGRITY CHECKS
-- ============================================================

-- 5.1 Verify foreign key constraints on user_roles
select
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name as foreign_table_name,
  ccu.column_name as foreign_column_name
from information_schema.table_constraints as tc
join information_schema.key_column_usage as kcu
  on tc.constraint_name = kcu.constraint_name
join information_schema.constraint_column_usage as ccu
  on ccu.constraint_name = tc.constraint_name
where tc.constraint_type = 'FOREIGN KEY'
  and tc.table_name = 'user_roles';
-- Expected: 2 foreign keys (to auth.users and organizations)

-- 5.2 Verify unique constraint on user_roles
select
  constraint_name,
  constraint_type
from information_schema.table_constraints
where table_name = 'user_roles'
  and constraint_type = 'UNIQUE';
-- Expected: 1 unique constraint on (user_id, organization_id)

-- 5.3 Verify unique constraint on organizations.domain
select
  constraint_name,
  constraint_type
from information_schema.table_constraints
where table_name = 'organizations'
  and constraint_type = 'UNIQUE';
-- Expected: At least 1 unique constraint on domain

-- ============================================================
-- PART 6: SUMMARY REPORT
-- ============================================================

-- 6.1 Complete deployment summary
select
  '✅ Organization Auth Tables' as component,
  count(*) as deployed
from information_schema.tables
where table_name in ('organizations', 'user_roles', 'onboarding_events')

union all

select
  '✅ Organization Auth Trigger',
  count(*)
from pg_trigger
where tgname = 'on_auth_user_created'

union all

select
  '✅ Materialized Views',
  count(*)
from pg_matviews
where matviewname like 'mv_%'

union all

select
  '✅ Dashboard API Functions',
  count(*)
from information_schema.routines
where routine_name in (
  'get_dashboard_overview',
  'get_area_detail',
  'refresh_fulfillment_materialized_views',
  'refresh_and_get_dashboard'
)

union all

select
  '✅ RLS Policies (Org Auth)',
  count(*)
from pg_policies
where tablename in ('organizations', 'user_roles', 'onboarding_events');

-- Expected output:
-- ✅ Organization Auth Tables: 3
-- ✅ Organization Auth Trigger: 1
-- ✅ Materialized Views: 2
-- ✅ Dashboard API Functions: 4
-- ✅ RLS Policies (Org Auth): 3+

-- ============================================================
-- VERIFICATION COMPLETE
-- ============================================================
-- If all queries above return expected results, deployment is successful!
--
-- Next steps:
-- 1. Create test organization
-- 2. Test automatic user assignment
-- 3. Populate some scores to test dashboard
-- 4. Integrate with React components
-- ============================================================
