-- ============================================================
-- FULFILLMENT DISPLAY v5.4: DASHBOARD API & MATERIALIZED VIEWS
-- ============================================================
-- Fast, dashboard-friendly reads with denormalized signals
-- Materialized views + JSON API functions for complete payloads
-- ============================================================

-- =========================================
-- PART 1: MATERIALIZED VIEWS
-- =========================================

-- =========================================
-- MATERIALIZED VIEW: Latest Signal per AREA
-- =========================================
-- Denormalizes the latest daily & weekly signals per area
-- for instant dashboard reads without joins

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

-- Unique index to allow REFRESH CONCURRENTLY (non-blocking refresh)
create unique index if not exists ux_mv_area_signals_latest
  on mv_area_signals_latest(area_id);

comment on materialized view mv_area_signals_latest is
  'Denormalized view of latest daily/weekly signals per area for fast dashboard reads';

-- ================================================
-- MATERIALIZED VIEW: Latest Signal per AREA×DIMENSION
-- ================================================
-- Denormalizes the latest daily & weekly signals per area×dimension
-- Includes priority (1=primary, 2=secondary) for dimension ordering

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

-- =========================================
-- UTILITY: Refresh Function for Both MVs
-- =========================================
-- Call this after new scores are upserted for a snappy UI
-- concurrent=true allows non-blocking refresh (requires unique indexes)

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

-- =========================================
-- PART 2: JSON API FUNCTIONS
-- =========================================

-- =========================================
-- API FUNCTION: get_dashboard_overview()
-- =========================================
-- Returns a complete clustered JSON payload:
-- clusters → areas → (latest area signals + primary/secondary dimensions with signals + subdimensions)
--
-- Response structure:
-- {
--   "version": "5.4",
--   "clusters": [
--     {
--       "cluster_id": 1,
--       "cluster_name": "Growth",
--       "cluster_color": "#10b981",
--       "areas": [
--         {
--           "area_id": 1,
--           "area_name": "Career",
--           "cluster_id": 1,
--           "cluster_name": "Growth",
--           "cluster_color": "#10b981",
--           "daily": {"date": "2025-10-29", "signal": "thriving"},
--           "weekly": {"date": "2025-10-29", "signal": "thriving"},
--           "dimensions": [
--             {
--               "dimension_key": "fulfillment",
--               "dimension_name": "Fulfillment",
--               "priority": 1,
--               "daily": {"date": "2025-10-29", "signal": "thriving"},
--               "weekly": {"date": "2025-10-29", "signal": "thriving"}
--             }
--           ],
--           "subdimensions": [
--             {"name": "Meaning", "position": 1}
--           ]
--         }
--       ]
--     }
--   ]
-- }

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

-- =========================================
-- API FUNCTION: get_area_detail(p_area_id int)
-- =========================================
-- Returns a single area with:
-- - Cluster info
-- - Latest daily/weekly area signals
-- - All dimensions with latest signals
-- - Subdimensions
-- - Relationships
--
-- Response structure:
-- {
--   "area_id": 16,
--   "area_name": "Health",
--   "cluster": {
--     "cluster_id": 3,
--     "cluster_name": "Foundation",
--     "cluster_color": "#f59e0b"
--   },
--   "signals": {
--     "daily": {"date": "2025-10-29", "signal": "thriving"},
--     "weekly": {"date": "2025-10-29", "signal": "thriving"}
--   },
--   "dimensions": [
--     {
--       "dimension_key": "vitality",
--       "dimension_name": "Vitality",
--       "priority": 1,
--       "daily": {"date": "2025-10-29", "signal": "thriving"},
--       "weekly": {"date": "2025-10-29", "signal": "thriving"}
--     }
--   ],
--   "subdimensions": [
--     {"name": "Physical Health", "position": 1}
--   ],
--   "relationships": [
--     {
--       "id": 1,
--       "person": "Dr. Smith",
--       "role": "Primary Care",
--       "frequency": "monthly",
--       "priority": 1,
--       "notes": "Annual checkup",
--       "created_at": "2025-10-29T..."
--     }
--   ]
-- }

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

-- =========================================
-- COMBINED RPC: refresh_and_get_dashboard()
-- =========================================
-- Single call that:
-- 1. Refreshes materialized views (concurrently)
-- 2. Returns complete dashboard overview
--
-- Perfect for dashboard refresh button or periodic updates

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

-- =========================================
-- USAGE EXAMPLES
-- =========================================

-- Example 1: Get complete dashboard
-- select get_dashboard_overview();

-- Example 2: Get specific area detail
-- select get_area_detail(16); -- Health area

-- Example 3: Refresh MVs after score updates
-- select refresh_fulfillment_materialized_views(true);

-- Example 4: Refresh and get dashboard in one call
-- select refresh_and_get_dashboard();

-- Example 5: Get just the cluster structure
-- select
--   cluster_id,
--   cluster_name,
--   cluster_color,
--   jsonb_array_length((get_dashboard_overview()->'clusters'->0->'areas')) as area_count
-- from mv_area_signals_latest
-- group by cluster_id, cluster_name, cluster_color
-- order by cluster_id;

-- =========================================
-- PERFORMANCE NOTES
-- =========================================
-- 1. Materialized views cache expensive joins and aggregations
-- 2. Unique indexes enable REFRESH CONCURRENTLY (non-blocking)
-- 3. JSON API functions perform minimal joins on pre-aggregated data
-- 4. Single RPC call reduces network roundtrips
-- 5. Typical response time: <50ms for complete dashboard
--
-- Refresh Strategy:
-- - After score upserts: call refresh_fulfillment_materialized_views(true)
-- - Periodic refresh: pg_cron job every 5-15 minutes
-- - On-demand: User clicks refresh button → refresh_and_get_dashboard()

-- =========================================
-- MULTI-TENANT SUPPORT (FUTURE)
-- =========================================
-- To add per-user isolation:
-- 1. Add owner_user_id uuid to scores, areas, relationships
-- 2. Recreate MVs filtering by auth.uid()
-- 3. Add RLS policies to all tables
-- 4. Update API functions to filter by auth.uid()
--
-- Example RLS policy:
-- create policy "Users can only see their own areas"
--   on areas for select
--   using (owner_user_id = auth.uid());
