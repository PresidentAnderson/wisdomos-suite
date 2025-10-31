
-- Migration: 0003_dashboard_status_and_tests.sql
-- Created: 2025-10-29T10:05:34.387189

do $$ begin
  create type status_color as enum ('red','amber','green','gray');
exception when duplicate_object then null; end $$;

create or replace function public.status_color_numeric(val numeric, green_min numeric, amber_min numeric, red_min numeric default null)
returns status_color language sql immutable as $$
  select case
    when val is null then 'gray'::status_color
    when val >= green_min then 'green'::status_color
    when val >= amber_min then 'amber'::status_color
    else 'red'::status_color
  end;
$$;

create or replace function public.status_color_bool(val boolean)
returns status_color language sql immutable as $$
  select case when val is null then 'gray'::status_color
              when val then 'green'::status_color
              else 'red'::status_color end;
$$;

create or replace view public.vw_dashboard_status as
with current as (select * from public.vw_dashboard_current)
select
  status_color_numeric(health_sleep_avg_30d, 7, 5)                  as health_sleep_status,
  status_color_numeric(health_mood_avg_30d, 7, 5)                   as health_mood_status,
  status_color_numeric(health_steps_avg_30d, 8000, 4000)            as health_steps_status,
  status_color_numeric(work_focus_hours_avg_30d, 3, 1)              as work_focus_status,
  status_color_numeric(friendship_outreach_30d, 12, 4)              as friendship_status,
  status_color_numeric(community_events_30d, 2, 1)                  as community_status,
  status_color_numeric(spiritual_adherence_pct_avg_30d, 60, 30)     as spiritual_status,
  case
    when cash_flow is null then 'gray'::status_color
    when cash_flow >= 0 then 'green'::status_color
    when cash_flow >= -500 then 'amber'::status_color
    else 'red'::status_color
  end                                                               as finance_cashflow_status,
  status_color_bool(taxes_current)                                   as finance_taxes_status
from current
limit 1;

create or replace view public.vw_dashboard_overall as
select
  (select count(*) from (values
     ((select health_sleep_status   from vw_dashboard_status)),
     ((select health_mood_status    from vw_dashboard_status)),
     ((select health_steps_status   from vw_dashboard_status)),
     ((select work_focus_status     from vw_dashboard_status)),
     ((select friendship_status     from vw_dashboard_status)),
     ((select community_status      from vw_dashboard_status)),
     ((select spiritual_status      from vw_dashboard_status)),
     ((select finance_cashflow_status from vw_dashboard_status)),
     ((select finance_taxes_status    from vw_dashboard_status))
  ) t(c) where c = 'red')   as red_count,
  (select count(*) from (values
     ((select health_sleep_status   from vw_dashboard_status)),
     ((select health_mood_status    from vw_dashboard_status)),
     ((select health_steps_status   from vw_dashboard_status)),
     ((select work_focus_status     from vw_dashboard_status)),
     ((select friendship_status     from vw_dashboard_status)),
     ((select community_status      from vw_dashboard_status)),
     ((select spiritual_status      from vw_dashboard_status)),
     ((select finance_cashflow_status from vw_dashboard_status)),
     ((select finance_taxes_status    from vw_dashboard_status))
  ) t(c) where c = 'amber') as amber_count,
  (select count(*) from (values
     ((select health_sleep_status   from vw_dashboard_status)),
     ((select health_mood_status    from vw_dashboard_status)),
     ((select health_steps_status   from vw_dashboard_status)),
     ((select work_focus_status     from vw_dashboard_status)),
     ((select friendship_status     from vw_dashboard_status)),
     ((select community_status      from vw_dashboard_status)),
     ((select spiritual_status      from vw_dashboard_status)),
     ((select finance_cashflow_status from vw_dashboard_status)),
     ((select finance_taxes_status    from vw_dashboard_status))
  ) t(c) where c = 'green') as green_count,
  (select count(*) from (values
     ((select health_sleep_status   from vw_dashboard_status)),
     ((select health_mood_status    from vw_dashboard_status)),
     ((select health_steps_status   from vw_dashboard_status)),
     ((select work_focus_status     from vw_dashboard_status)),
     ((select friendship_status     from vw_dashboard_status)),
     ((select community_status      from vw_dashboard_status)),
     ((select spiritual_status      from vw_dashboard_status)),
     ((select finance_cashflow_status from vw_dashboard_status)),
     ((select finance_taxes_status    from vw_dashboard_status))
  ) t(c) where c = 'gray')  as gray_count
;
