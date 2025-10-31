-- =========================
-- WisdomOS Core Schema
-- Aligned with WE2/WE3 Assessment + Fulfillment Display
-- =========================
-- Created: 2025-10-29
-- Purpose: Areas, People, Assessments (WE2..WE5), Signals, Autobiography, Coaches
-- =========================

create extension if not exists pgcrypto;

-- =========================
-- CORE TABLES
-- =========================

-- Life Areas (from Fulfillment Display)
create table if not exists public.areas (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  commitment text,
  attention_level int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists areas_slug_idx on public.areas (slug);

-- People (relationships, coaches, etc.)
create table if not exists public.people (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  role text,
  created_at timestamptz default now()
);

-- Area-People relationships (who you communicate with per area)
create table if not exists public.area_people (
  id uuid primary key default gen_random_uuid(),
  area_id uuid references public.areas(id) on delete cascade,
  person_id uuid references public.people(id) on delete cascade,
  frequency text,
  role_in_area text,
  created_at timestamptz default now(),
  unique (area_id, person_id)
);
create index if not exists area_people_area_idx on public.area_people (area_id);

-- Area Dimensions (custom dimensions per area)
create table if not exists public.area_dimensions (
  id uuid primary key default gen_random_uuid(),
  area_id uuid references public.areas(id) on delete cascade,
  key text not null,
  label text not null,
  weight numeric default 1.0,
  unique (area_id, key)
);

-- Dimension Signals (0..5 ratings over time)
create table if not exists public.dim_signals (
  id bigint generated always as identity primary key,
  area_id uuid references public.areas(id) on delete cascade,
  dimension_key text not null,
  at timestamptz default now(),
  value numeric not null check (value between 0 and 5),
  note text
);
create index if not exists dim_signals_area_at_idx on public.dim_signals (area_id, at);

-- WE2..WE5 Assessments (relationship "state & condition" snapshots)
-- Aligned with WE2: assess relational capability (not feelings)
create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  area_id uuid references public.areas(id) on delete cascade,
  person_id uuid references public.people(id) on delete cascade,
  weekend smallint not null check (weekend between 2 and 5),
  at timestamptz default now(),
  -- WE2 dimensions (all 0..5, decimals allowed)
  relatedness numeric check (relatedness between 0 and 5),
  workability numeric check (workability between 0 and 5),
  reliability numeric check (reliability between 0 and 5),
  openness numeric check (openness between 0 and 5),
  -- Auto-calculated overall score
  overall numeric generated always as
    ((coalesce(relatedness,0)+coalesce(workability,0)+
      coalesce(reliability,0)+coalesce(openness,0))/
     nullif((case when relatedness is not null then 1 else 0 end+
             case when workability is not null then 1 else 0 end+
             case when reliability is not null then 1 else 0 end+
             case when openness is not null then 1 else 0 end),0)
    ) stored
);
create index if not exists assessments_area_at_idx on public.assessments (area_id, at);

-- Autobiography Entries
create table if not exists public.autobio_entries (
  id uuid primary key default gen_random_uuid(),
  area_id uuid references public.areas(id) on delete cascade,
  year int,
  content_md text not null,
  created_at timestamptz default now()
);

-- Conversations (coach logs, dialogue history)
create table if not exists public.conversations (
  id bigint generated always as identity primary key,
  area_id uuid references public.areas(id) on delete cascade,
  coach_id uuid,
  turn int not null,
  role text not null check (role in ('user','coach','system')),
  content_md text not null,
  tags text[],
  created_at timestamptz default now()
);
create index if not exists conv_area_created_idx on public.conversations (area_id, created_at);

-- Coaches (AI coaches per area with WE2/WE3-informed context)
create table if not exists public.coaches (
  id uuid primary key default gen_random_uuid(),
  area_id uuid references public.areas(id) on delete cascade,
  name text not null,
  context_prompt text not null,
  status text default 'active' check (status in ('active','archived')),
  created_at timestamptz default now(),
  unique (area_id, name)
);

-- =========================
-- VIEW: Fulfillment Index
-- =========================
-- Rolling 30-day signal average + 90-day assessment average
create or replace view public.v_area_fulfillment as
select
  a.id as area_id,
  a.name,
  round(avg(ds.value)::numeric, 2) as avg_signal_30d,
  round(avg(asm.overall)::numeric, 2) as assessment_avg_90d,
  max(ds.at) as last_signal_at
from public.areas a
left join public.dim_signals ds
  on ds.area_id = a.id and ds.at > now() - interval '30 days'
left join public.assessments asm
  on asm.area_id = a.id and asm.at > now() - interval '90 days'
group by a.id, a.name;

-- =========================
-- RPCs (Remote Procedure Calls)
-- =========================

-- Create or update a coach
create or replace function public.create_or_update_coach(
  p_area_id uuid,
  p_name text,
  p_context text
) returns uuid language plpgsql as $$
declare v_id uuid;
begin
  insert into public.coaches (area_id, name, context_prompt)
  values (p_area_id, p_name, p_context)
  on conflict (area_id, name)
    do update set context_prompt = excluded.context_prompt
  returning id into v_id;
  return v_id;
end $$;

-- Log a coach conversation turn (optionally add to autobiography)
create or replace function public.coach_log(
  p_area_id uuid,
  p_role text,
  p_content_md text,
  p_tags text[] default '{}',
  p_autobio boolean default false
) returns void language plpgsql as $$
declare v_turn int;
begin
  select coalesce(max(turn),0)+1 into v_turn
  from public.conversations where area_id = p_area_id;

  insert into public.conversations(area_id, turn, role, content_md, tags)
  values (p_area_id, v_turn, p_role, p_content_md, p_tags);

  if p_autobio then
    insert into public.autobio_entries(area_id, year, content_md)
    values (p_area_id, null, p_content_md);
  end if;
end $$;

-- Upsert a dimension signal
create or replace function public.upsert_dim_signal(
  p_area_id uuid,
  p_key text,
  p_value numeric,
  p_note text default null
) returns void language sql as $$
  insert into public.dim_signals(area_id, dimension_key, value, note)
  values (p_area_id, p_key, p_value, p_note);
$$;

-- =========================
-- RLS (Row Level Security)
-- =========================
-- Enable RLS on all tables
alter table public.areas enable row level security;
alter table public.people enable row level security;
alter table public.area_people enable row level security;
alter table public.area_dimensions enable row level security;
alter table public.dim_signals enable row level security;
alter table public.assessments enable row level security;
alter table public.autobio_entries enable row level security;
alter table public.conversations enable row level security;
alter table public.coaches enable row level security;

-- DEV policies (open read; adjust for production with user-specific policies)
do $$
begin
  perform 1;
  exception when duplicate_object then null;
end $$;

create policy if not exists p_dev_sel_areas on public.areas for select using (true);
create policy if not exists p_dev_sel_people on public.people for select using (true);
create policy if not exists p_dev_sel_area_people on public.area_people for select using (true);
create policy if not exists p_dev_sel_dims on public.area_dimensions for select using (true);
create policy if not exists p_dev_sel_signals on public.dim_signals for select using (true);
create policy if not exists p_dev_sel_assess on public.assessments for select using (true);
create policy if not exists p_dev_sel_autobio on public.autobio_entries for select using (true);
create policy if not exists p_dev_sel_conv on public.conversations for select using (true);
create policy if not exists p_dev_sel_coaches on public.coaches for select using (true);

-- TODO: Add production RLS policies based on user authentication
-- Example:
-- create policy "Users can view their own areas" on public.areas
--   for select using (auth.uid() = user_id);
