-- ============================================================
-- QUICK DEPLOYMENT VERIFICATION (1 minute)
-- ============================================================
-- Run this entire script in Supabase SQL Editor to verify both deployments
-- Copy and paste all queries below, then click "Run"
-- ============================================================

-- ============================================================
-- QUICK CHECK: All Components Deployed
-- ============================================================

select
  'Component' as category,
  'Expected' as expected,
  'Status' as status
union all
select
  '─────────────────────────',
  '─────────',
  '──────'
union all

-- Organization Auth Tables
select
  '📊 Organizations Table',
  '✓ Exists',
  case when count(*) = 1 then '✅ PASS' else '❌ FAIL' end
from information_schema.tables
where table_name = 'organizations'
union all

select
  '📊 User Roles Table',
  '✓ Exists',
  case when count(*) = 1 then '✅ PASS' else '❌ FAIL' end
from information_schema.tables
where table_name = 'user_roles'
union all

select
  '📊 Onboarding Events Table',
  '✓ Exists',
  case when count(*) = 1 then '✅ PASS' else '❌ FAIL' end
from information_schema.tables
where table_name = 'onboarding_events'
union all

-- Organization Auth Trigger
select
  '⚡ Auto-Assignment Trigger',
  '✓ Enabled',
  case when count(*) = 1 then '✅ PASS' else '❌ FAIL' end
from pg_trigger
where tgname = 'on_auth_user_created'
  and tgenabled = 'O'
union all

-- RLS Policies
select
  '🔒 RLS Policies (Org Auth)',
  '≥ 3',
  case
    when count(*) >= 3 then '✅ PASS (' || count(*) || ')'
    else '❌ FAIL (' || count(*) || ')'
  end
from pg_policies
where tablename in ('organizations', 'user_roles', 'onboarding_events')
union all

-- Materialized Views
select
  '📈 Materialized View: Areas',
  '✓ Exists',
  case when count(*) = 1 then '✅ PASS' else '❌ FAIL' end
from pg_matviews
where matviewname = 'mv_area_signals_latest'
union all

select
  '📈 Materialized View: Dimensions',
  '✓ Exists',
  case when count(*) = 1 then '✅ PASS' else '❌ FAIL' end
from pg_matviews
where matviewname = 'mv_area_dimension_signals_latest'
union all

-- Dashboard API Functions
select
  '🎯 API: get_dashboard_overview',
  '✓ Exists',
  case when count(*) = 1 then '✅ PASS' else '❌ FAIL' end
from information_schema.routines
where routine_name = 'get_dashboard_overview'
union all

select
  '🎯 API: get_area_detail',
  '✓ Exists',
  case when count(*) = 1 then '✅ PASS' else '❌ FAIL' end
from information_schema.routines
where routine_name = 'get_area_detail'
union all

select
  '🎯 API: refresh_materialized_views',
  '✓ Exists',
  case when count(*) = 1 then '✅ PASS' else '❌ FAIL' end
from information_schema.routines
where routine_name = 'refresh_fulfillment_materialized_views'
union all

select
  '🎯 API: refresh_and_get_dashboard',
  '✓ Exists',
  case when count(*) = 1 then '✅ PASS' else '❌ FAIL' end
from information_schema.routines
where routine_name = 'refresh_and_get_dashboard'
union all

-- Performance Indexes
select
  '⚡ MV Indexes (for fast refresh)',
  '= 2',
  case
    when count(*) = 2 then '✅ PASS'
    else '❌ FAIL (' || count(*) || ')'
  end
from pg_indexes
where tablename like 'mv_%'
  and indexname like 'ux_%'
union all

-- Data Status
select
  '📊 Areas in MV',
  'Varies',
  case
    when count(*) > 0 then '✅ ' || count(*) || ' areas'
    else '⚠️  0 areas (ok if fresh install)'
  end
from mv_area_signals_latest
union all

select
  '📊 Dimensions in MV',
  'Varies',
  case
    when count(*) > 0 then '✅ ' || count(*) || ' dimensions'
    else '⚠️  0 dimensions (ok if fresh install)'
  end
from mv_area_dimension_signals_latest;

-- ============================================================
-- FUNCTIONAL TEST: API Functions Work
-- ============================================================

-- Test 1: Dashboard Overview API
select
  '🧪 Test: Dashboard Overview API' as test,
  case
    when json_typeof(get_dashboard_overview()) = 'object'
      and get_dashboard_overview()->>'version' = '5.4'
    then '✅ PASS - Returns valid JSON'
    else '❌ FAIL - Invalid response'
  end as result;

-- Test 2: Refresh Function
select
  '🧪 Test: Refresh Materialized Views' as test,
  case
    when (select refresh_fulfillment_materialized_views(true)) is null
    then '✅ PASS - Refresh completed'
    else '❌ FAIL - Refresh failed'
  end as result;

-- ============================================================
-- DEPLOYMENT STATUS SUMMARY
-- ============================================================

select
  '═══════════════════════════════════════' as separator
union all
select
  '📋 DEPLOYMENT STATUS SUMMARY'
union all
select
  '═══════════════════════════════════════'
union all

-- Count successes
select
  case
    when (
      (select count(*) from information_schema.tables where table_name in ('organizations', 'user_roles', 'onboarding_events')) = 3
      and (select count(*) from pg_trigger where tgname = 'on_auth_user_created') = 1
      and (select count(*) from pg_matviews where matviewname like 'mv_%') = 2
      and (select count(*) from information_schema.routines where routine_name in ('get_dashboard_overview', 'get_area_detail', 'refresh_fulfillment_materialized_views', 'refresh_and_get_dashboard')) = 4
    )
    then '✅ ALL DEPLOYMENTS SUCCESSFUL!'
    else '⚠️  PARTIAL DEPLOYMENT - Check failures above'
  end as overall_status
union all

-- Component counts
select
  '📊 Organization Auth: ' ||
  (select count(*) from information_schema.tables where table_name in ('organizations', 'user_roles', 'onboarding_events')) ||
  '/3 tables, ' ||
  (select count(*) from pg_trigger where tgname = 'on_auth_user_created') ||
  '/1 trigger'
union all

select
  '📈 Dashboard API: ' ||
  (select count(*) from pg_matviews where matviewname like 'mv_%') ||
  '/2 MVs, ' ||
  (select count(*) from information_schema.routines where routine_name in ('get_dashboard_overview', 'get_area_detail', 'refresh_fulfillment_materialized_views', 'refresh_and_get_dashboard')) ||
  '/4 functions'
union all

select
  '🔒 Security: ' ||
  (select count(*) from pg_policies where tablename in ('organizations', 'user_roles', 'onboarding_events')) ||
  ' RLS policies active'
union all

select
  '⚡ Performance: ' ||
  (select count(*) from pg_indexes where tablename like 'mv_%' and indexname like 'ux_%') ||
  '/2 MV indexes for concurrent refresh'
union all

select
  '═══════════════════════════════════════';

-- ============================================================
-- NEXT STEPS
-- ============================================================

select
  '' as next_steps
union all
select
  '🚀 NEXT STEPS:'
union all
select
  '1. If all checks pass ✅ - You''re ready to use the APIs!'
union all
select
  '2. Create test organization: See below for SQL'
union all
select
  '3. Test in React app: import { getDashboardOverview } from ''@/lib/fulfillment-dashboard-client'''
union all
select
  '4. Build UI components using the React hooks'
union all
select
  '';

-- ============================================================
-- OPTIONAL: CREATE TEST DATA
-- ============================================================

-- Uncomment to create test organization:
-- insert into organizations (name, domain, plan, status)
-- values ('Test Corporation', 'test.com', 'enterprise', 'active')
-- returning *;

-- Uncomment to view all organizations:
-- select * from organizations;

-- Uncomment to test dashboard API:
-- select jsonb_pretty(get_dashboard_overview());

-- ============================================================
-- VERIFICATION COMPLETE
-- ============================================================
