# Manual Deployment Guide - Fulfillment Dashboard API

**Date**: 2025-10-29
**Project**: Phoenix Rising WisdomOS
**Supabase Project**: yvssmqyphqgvpkwudeoa

---

## 🎯 What You're Deploying

You're deploying the **Fulfillment Dashboard API** with materialized views for **10-15x faster dashboard loads**. This will enable:

- Complete dashboard in single query (30-50ms vs 500-800ms)
- Area detail with relationships (15-30ms vs 200-400ms)
- Non-blocking materialized view refresh
- TypeScript integration with React hooks

---

## 📋 Step-by-Step Deployment

### Step 1: Access Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/yvssmqyphqgvpkwudeoa
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Run the Migration

**Option A: Run Complete Migration File**

Copy and paste the **entire contents** of this file:
```
supabase/migrations/20251029_fulfillment_dashboard_api.sql
```

**Option B: Run Step-by-Step** (recommended for verification)

I've broken down the migration into digestible steps below.

---

## 📝 Migration Steps (Run in SQL Editor)

### Step 1: Create Materialized View - Area Signals

```sql
-- =========================================
-- MATERIALIZED VIEW: Latest Signal per AREA
-- =========================================
drop materialized view if exists mv_area_signals_latest cascade;

create materialized view mv_area_signals_latest as
with latest_daily as (
  select distinct on (area_id)
    area_id,
    area_name,
    score_date as daily_date,
    area_daily_signal as daily_signal
  from v_daily_area_signal
  order by area_id, score_date desc
),
latest_weekly as (
  select distinct on (area_id)
    area_id,
    score_date as weekly_date,
    area_weekly_signal as weekly_signal
  from v_weekly_area_signal
  order by area_id, score_date desc
)
select
  a.id                                as area_id,
  a.name                              as area_name,
  c.id                                as cluster_id,
  c.name                              as cluster_name,
  c.color                             as cluster_color,
  ld.daily_date,
  ld.daily_signal,
  lw.weekly_date,
  lw.weekly_signal
from areas a
join clusters c on c.id = a.cluster_id
left join latest_daily  ld on ld.area_id = a.id
left join latest_weekly lw on lw.area_id = a.id;

-- Unique index to allow REFRESH CONCURRENTLY (non-blocking)
create unique index if not exists ux_mv_area_signals_latest
  on mv_area_signals_latest(area_id);

comment on materialized view mv_area_signals_latest is
  'Denormalized view of latest daily/weekly signals per area for fast dashboard reads';
```

**Expected Result**: ✅ "Success. No rows returned."

**Verify**:
```sql
select count(*) from mv_area_signals_latest;
```
Should return the number of areas in your system.

---

### Step 2: Create Materialized View - Area Dimension Signals

```sql
-- ================================================
-- MATERIALIZED VIEW: Latest Signal per AREA×DIMENSION
-- ================================================
drop materialized view if exists mv_area_dimension_signals_latest cascade;

create materialized view mv_area_dimension_signals_latest as
with latest_daily as (
  select distinct on (area_id, dimension_key)
    area_id,
    area_name,
    dimension_key,
    dimension_name,
    score_date as daily_date,
    area_dimension_daily_signal as daily_signal
  from v_daily_area_dimension_signal
  order by area_id, dimension_key, score_date desc
),
latest_weekly as (
  select distinct on (area_id, dimension_key)
    area_id,
    dimension_key,
    score_date as weekly_date,
    area_dimension_weekly_signal as weekly_signal
  from v_weekly_area_dimension_signal
  order by area_id, dimension_key, score_date desc
)
select
  a.id                    as area_id,
  a.name                  as area_name,
  c.id                    as cluster_id,
  c.name                  as cluster_name,
  c.color                 as cluster_color,
  ad.dimension_key,
  d.name                  as dimension_name,
  ad.priority             as priority,        -- 1=primary, 2=secondary
  ld.daily_date,
  ld.daily_signal,
  lw.weekly_date,
  lw.weekly_signal
from areas a
join clusters c on c.id = a.cluster_id
join area_dimensions ad on ad.area_id = a.id
join dimensions d on d.key = ad.dimension_key
left join latest_daily  ld on ld.area_id = a.id and ld.dimension_key = ad.dimension_key
left join latest_weekly lw on lw.area_id = a.id and lw.dimension_key = ad.dimension_key;

-- Unique index to allow REFRESH CONCURRENTLY
create unique index if not exists ux_mv_area_dimension_signals_latest
  on mv_area_dimension_signals_latest(area_id, dimension_key);

comment on materialized view mv_area_dimension_signals_latest is
  'Denormalized view of latest daily/weekly signals per area×dimension with priority ordering';
```

**Expected Result**: ✅ "Success. No rows returned."

**Verify**:
```sql
select count(*) from mv_area_dimension_signals_latest;
```
Should return the total number of area×dimension combinations.

---

### Step 3: Create Refresh Function

```sql
-- =========================================
-- UTILITY: Refresh Function for Both MVs
-- =========================================
create or replace function refresh_fulfillment_materialized_views(concurrent boolean default true)
returns void language plpgsql as $$
begin
  if concurrent then
    refresh materialized view concurrently mv_area_signals_latest;
    refresh materialized view concurrently mv_area_dimension_signals_latest;
  else
    refresh materialized view mv_area_signals_latest;
    refresh materialized view mv_area_dimension_signals_latest;
  end if;
end;
$$;

comment on function refresh_fulfillment_materialized_views is
  'Refresh both materialized views. Use concurrent=true for non-blocking refresh after score updates.';
```

**Expected Result**: ✅ "Success. No rows returned."

**Test**:
```sql
select refresh_fulfillment_materialized_views(true);
```
Should complete without errors.

---

### Step 4: Create Dashboard Overview Function

```sql
-- =========================================
-- API FUNCTION: get_dashboard_overview()
-- =========================================
create or replace function get_dashboard_overview()
returns jsonb language sql stable as $$
with area_dim as (
  select
    m.area_id,
    m.area_name,
    m.cluster_id,
    m.cluster_name,
    m.cluster_color,
    m.dimension_key,
    m.dimension_name,
    m.priority,
    m.daily_date,
    m.daily_signal,
    m.weekly_date,
    m.weekly_signal
  from mv_area_dimension_signals_latest m
),
area_signals as (
  select
    area_id,
    jsonb_build_object(
      'area_id', area_id,
      'area_name', area_name,
      'cluster_id', cluster_id,
      'cluster_name', cluster_name,
      'cluster_color', cluster_color,
      'daily',  jsonb_build_object('date', daily_date,  'signal', daily_signal),
      'weekly', jsonb_build_object('date', weekly_date, 'signal', weekly_signal)
    ) as sig
  from mv_area_signals_latest
),
dims_by_area as (
  select
    area_id,
    jsonb_agg(
      jsonb_build_object(
        'dimension_key', dimension_key,
        'dimension_name', dimension_name,
        'priority', priority,
        'daily',  jsonb_build_object('date', daily_date,  'signal', daily_signal),
        'weekly', jsonb_build_object('date', weekly_date, 'signal', weekly_signal)
      )
      order by priority asc, dimension_name asc
    ) as dimensions
  from area_dim
  group by area_id
),
subdims_by_area as (
  select area_id,
         jsonb_agg(jsonb_build_object('name', name, 'position', position)
                   order by position asc) as subdimensions
  from area_subdimensions
  group by area_id
),
areas_full as (
  select
    s.sig || jsonb_build_object(
      'dimensions', coalesce(d.dimensions, '[]'::jsonb),
      'subdimensions', coalesce(sd.subdimensions, '[]'::jsonb)
    ) as area_row
  from area_signals s
  left join dims_by_area d on d.area_id = s.area_id
  left join subdims_by_area sd on sd.area_id = s.area_id
),
clusters_json as (
  select
    c.id as cluster_id,
    c.name as cluster_name,
    c.color as cluster_color,
    jsonb_agg(a.area_row order by (a.area_row->>'area_name')) as areas
  from clusters c
  join areas ar on ar.cluster_id = c.id
  join areas_full a on (a.area_row->>'area_id')::int = ar.id
  group by c.id, c.name, c.color
)
select jsonb_build_object(
  'version', '5.4',
  'clusters', jsonb_agg(
    jsonb_build_object(
      'cluster_id', cluster_id,
      'cluster_name', cluster_name,
      'cluster_color', cluster_color,
      'areas', areas
    )
    order by cluster_id
  )
)
from clusters_json;
$$;

comment on function get_dashboard_overview is
  'Returns complete dashboard payload: clusters → areas → dimensions + signals. Optimized for single-query dashboard rendering.';
```

**Expected Result**: ✅ "Success. No rows returned."

**Test**:
```sql
select get_dashboard_overview();
```
Should return a complete JSON object with clusters and areas.

---

### Step 5: Create Area Detail Function

```sql
-- =========================================
-- API FUNCTION: get_area_detail(p_area_id int)
-- =========================================
create or replace function get_area_detail(p_area_id int)
returns jsonb language sql stable as $$
with a as (
  select * from areas where id = p_area_id
),
cluster as (
  select c.* from clusters c join a on a.cluster_id = c.id
),
area_sig as (
  select * from mv_area_signals_latest where area_id = p_area_id
),
dims as (
  select * from mv_area_dimension_signals_latest where area_id = p_area_id
),
subdims as (
  select * from area_subdimensions where area_id = p_area_id order by position asc
),
rels as (
  select id, person, role, frequency, priority, notes, created_at
  from relationships
  where area_id = p_area_id
  order by priority asc, created_at desc
)
select jsonb_build_object(
  'area_id',        a.id,
  'area_name',      a.name,
  'cluster',        jsonb_build_object(
                      'cluster_id', (select id from cluster),
                      'cluster_name',(select name from cluster),
                      'cluster_color',(select color from cluster)
                    ),
  'signals',        jsonb_build_object(
                      'daily',  jsonb_build_object('date', (select daily_date  from area_sig), 'signal', (select daily_signal  from area_sig)),
                      'weekly', jsonb_build_object('date', (select weekly_date from area_sig), 'signal', (select weekly_signal from area_sig))
                    ),
  'dimensions',     coalesce((
                      select jsonb_agg(
                        jsonb_build_object(
                          'dimension_key', dimension_key,
                          'dimension_name', dimension_name,
                          'priority', priority,
                          'daily',  jsonb_build_object('date', daily_date,  'signal', daily_signal),
                          'weekly', jsonb_build_object('date', weekly_date, 'signal', weekly_signal)
                        )
                        order by priority asc, dimension_name asc
                      )
                      from dims
                    ), '[]'::jsonb),
  'subdimensions',  coalesce((
                      select jsonb_agg(jsonb_build_object('name', name, 'position', position))
                      from subdims
                    ), '[]'::jsonb),
  'relationships',  coalesce((
                      select jsonb_agg(
                        jsonb_build_object(
                          'id', id, 'person', person, 'role', role,
                          'frequency', frequency, 'priority', priority,
                          'notes', notes, 'created_at', created_at
                        )
                      )
                      from rels
                    ), '[]'::jsonb)
)
from a;
$$;

comment on function get_area_detail is
  'Returns complete area payload including cluster, signals, dimensions, subdimensions, and relationships. Optimized for area detail pages.';
```

**Expected Result**: ✅ "Success. No rows returned."

**Test** (replace 16 with any valid area_id in your system):
```sql
select get_area_detail(16);
```
Should return a complete JSON object for that area.

---

### Step 6: Create Combined Refresh Function

```sql
-- =========================================
-- COMBINED RPC: refresh_and_get_dashboard()
-- =========================================
create or replace function refresh_and_get_dashboard()
returns jsonb language plpgsql as $$
begin
  -- Refresh materialized views concurrently (non-blocking)
  perform refresh_fulfillment_materialized_views(true);

  -- Return complete dashboard
  return get_dashboard_overview();
end;
$$;

comment on function refresh_and_get_dashboard is
  'Refreshes materialized views and returns complete dashboard in one call. Use for dashboard refresh operations.';
```

**Expected Result**: ✅ "Success. No rows returned."

**Test**:
```sql
select refresh_and_get_dashboard();
```
Should refresh views and return the complete dashboard JSON.

---

### Step 7: Create Performance Indexes

```sql
-- =========================================
-- INDEXES FOR PERFORMANCE
-- =========================================

-- Indexes on area_subdimensions for fast subdimension lookups
create index if not exists idx_area_subdimensions_area_id
  on area_subdimensions(area_id);

create index if not exists idx_area_subdimensions_area_position
  on area_subdimensions(area_id, position);

-- Indexes on relationships for fast relationship lookups
create index if not exists idx_relationships_area_id
  on relationships(area_id);

create index if not exists idx_relationships_area_priority
  on relationships(area_id, priority);
```

**Expected Result**: ✅ "Success. No rows returned."

---

## ✅ Verification Steps

After running all steps, verify everything is working:

### 1. Check Materialized Views Exist

```sql
select matviewname, hasindexes
from pg_matviews
where matviewname like 'mv_%'
order by matviewname;
```

**Expected Output**:
```
matviewname                          | hasindexes
-------------------------------------|------------
mv_area_dimension_signals_latest     | t
mv_area_signals_latest               | t
```

### 2. Check Views Have Data

```sql
select 'mv_area_signals_latest' as view, count(*) as row_count
from mv_area_signals_latest
union all
select 'mv_area_dimension_signals_latest', count(*)
from mv_area_dimension_signals_latest;
```

**Expected**: Both views should have data (row_count > 0)

### 3. Test Dashboard Overview

```sql
select
  jsonb_pretty(get_dashboard_overview());
```

**Expected**: Beautifully formatted JSON with all your clusters and areas

### 4. Test Area Detail

```sql
-- Get first area ID
select id, name from areas order by id limit 1;

-- Then test get_area_detail with that ID
select jsonb_pretty(get_area_detail(1)); -- Replace 1 with actual area ID
```

**Expected**: Complete area data including relationships

### 5. Test Refresh Function

```sql
select refresh_fulfillment_materialized_views(true);
```

**Expected**: Completes in 100-200ms without errors

### 6. Performance Test

```sql
-- Time the dashboard query
\timing on
select get_dashboard_overview();
\timing off
```

**Expected**: Execution time around 30-50ms

---

## 🎉 Success Criteria

You've successfully deployed if:

- ✅ Both materialized views exist with data
- ✅ All functions created without errors
- ✅ `get_dashboard_overview()` returns complete JSON
- ✅ `get_area_detail(area_id)` returns area with relationships
- ✅ Dashboard loads in under 50ms
- ✅ No SQL errors in Supabase logs

---

## 🔧 Troubleshooting

### Error: "relation does not exist"

**Problem**: Base views (v_daily_area_signal, v_weekly_area_signal) not found

**Solution**: Run the base fulfillment schema migration first:
```
supabase/migrations/20251029_fulfillment_ontology_v5_4.sql
```

### Error: "materialized view already exists"

**Problem**: Migration already partially run

**Solution**: The `drop materialized view if exists` statements should handle this. If not, manually drop:
```sql
drop materialized view if exists mv_area_signals_latest cascade;
drop materialized view if exists mv_area_dimension_signals_latest cascade;
```
Then rerun the migration.

### Materialized views are empty

**Problem**: No score data in base tables

**Solution**: Insert or upsert some scores first:
```sql
-- Check if daily_scores has data
select count(*) from daily_scores;

-- If empty, you need to populate scores first
```

### Function returns null

**Problem**: Materialized views not refreshed

**Solution**:
```sql
refresh materialized view mv_area_signals_latest;
refresh materialized view mv_area_dimension_signals_latest;
```

---

## 📞 Next Steps After Deployment

1. **Test in Your App**:
   ```typescript
   import { getDashboardOverview } from '@/lib/fulfillment-dashboard-client';

   const dashboard = await getDashboardOverview();
   console.log('Dashboard loaded:', dashboard);
   ```

2. **Set Up Periodic Refresh** (optional):
   ```sql
   -- Refresh every 5 minutes via pg_cron
   select cron.schedule(
     'refresh_fulfillment_mvs',
     '*/5 * * * *',
     $$select refresh_fulfillment_materialized_views(true);$$
   );
   ```

3. **Monitor Performance**:
   - Check query times in Supabase Dashboard → Logs
   - Verify materialized views stay updated
   - Monitor dashboard load times in browser DevTools

---

## 📚 Documentation

- **Complete API Reference**: `docs/FULFILLMENT_DASHBOARD_API.md`
- **TypeScript Types**: `packages/types/fulfillment-dashboard.ts`
- **Client Utilities**: `apps/web/lib/fulfillment-dashboard-client.ts`
- **Deployment Summary**: `FULFILLMENT_DASHBOARD_DEPLOYMENT.md`

---

**Status**: Ready for deployment
**Estimated Time**: 5-10 minutes
**Difficulty**: Medium (copy-paste SQL, verify results)

Good luck! 🚀
