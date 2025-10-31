-- ============================================================
--  ORGANIZATION-BASED AUTH + ENTERPRISE ONBOARDING SCHEMA
-- ============================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================
-- 1. ORGANIZATIONS TABLE
-- ============================================================
create table if not exists public.organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  domain text unique not null,
  plan text default 'enterprise',
  status text default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

comment on table public.organizations is 'Holds enterprise/organization data';
comment on column public.organizations.domain is 'Email domain for auto-assignment (e.g., "acme.com")';
comment on column public.organizations.plan is 'enterprise, standard, etc.';
comment on column public.organizations.status is 'active, suspended, etc.';

-- ============================================================
-- 2. USER_ROLES TABLE
-- ============================================================
create table if not exists public.user_roles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  role text not null default 'member',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, organization_id)
);

comment on table public.user_roles is 'Maps users to organizations with roles';
comment on column public.user_roles.role is 'owner, admin, member, viewer, etc.';

-- ============================================================
-- 3. ONBOARDING_EVENTS TABLE (for analytics + audit)
-- ============================================================
create table if not exists public.onboarding_events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete set null,
  event_type text not null,
  event_data jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

comment on table public.onboarding_events is 'Logs signup, org creation, role assignment, etc.';

-- ============================================================
-- 4. FUNCTION: ASSIGN USER TO ORGANIZATION ON SIGNUP
-- ============================================================
create or replace function public.handle_new_user_signup()
returns trigger
language plpgsql
security definer
as $$
declare
  user_email text;
  user_domain text;
  org_id uuid;
begin
  -- Extract email from NEW user
  user_email := NEW.email;
  if user_email is null or user_email = '' then
    return NEW;
  end if;

  -- Extract domain from email (everything after @)
  user_domain := split_part(user_email, '@', 2);

  -- Check if an organization exists for this domain
  select id into org_id
  from public.organizations
  where domain = user_domain
    and status = 'active'
  limit 1;

  if org_id is not null then
    -- Assign user to organization as 'member'
    insert into public.user_roles (user_id, organization_id, role)
    values (NEW.id, org_id, 'member')
    on conflict (user_id, organization_id) do nothing;

    -- Log the event
    insert into public.onboarding_events (user_id, organization_id, event_type, event_data)
    values (
      NEW.id,
      org_id,
      'user_assigned_to_org',
      jsonb_build_object('email', user_email, 'domain', user_domain)
    );
  else
    -- No organization found for this domain
    -- Option 1: Auto-create organization (uncomment if desired)
    -- insert into public.organizations (name, domain)
    -- values (user_domain, user_domain)
    -- returning id into org_id;
    --
    -- insert into public.user_roles (user_id, organization_id, role)
    -- values (NEW.id, org_id, 'owner');

    -- Option 2: Just log that no org was found
    insert into public.onboarding_events (user_id, event_type, event_data)
    values (
      NEW.id,
      'no_org_found_for_domain',
      jsonb_build_object('email', user_email, 'domain', user_domain)
    );
  end if;

  return NEW;
end;
$$;

comment on function public.handle_new_user_signup is 'Automatically assigns new users to their organization based on email domain';

-- ============================================================
-- 5. TRIGGER: CALL FUNCTION ON USER INSERT
-- ============================================================
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user_signup();

-- ============================================================
-- 6. ROW-LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Organizations: Users can read their own organization(s)
alter table public.organizations enable row level security;

create policy "Users can read their own organizations"
  on public.organizations
  for select
  using (
    id in (
      select organization_id
      from public.user_roles
      where user_id = auth.uid()
    )
  );

-- User roles: Users can read their own role records
alter table public.user_roles enable row level security;

create policy "Users can read their own roles"
  on public.user_roles
  for select
  using (user_id = auth.uid());

-- Onboarding events: Users can read their own events
alter table public.onboarding_events enable row level security;

create policy "Users can read their own onboarding events"
  on public.onboarding_events
  for select
  using (user_id = auth.uid());

-- ============================================================
-- 7. INDEXES FOR PERFORMANCE
-- ============================================================
create index if not exists idx_organizations_domain on public.organizations(domain);
create index if not exists idx_user_roles_user_id on public.user_roles(user_id);
create index if not exists idx_user_roles_org_id on public.user_roles(organization_id);
create index if not exists idx_onboarding_events_user_id on public.onboarding_events(user_id);
create index if not exists idx_onboarding_events_org_id on public.onboarding_events(organization_id);

-- ============================================================
-- 8. UPDATED_AT TRIGGER (OPTIONAL)
-- ============================================================
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  NEW.updated_at = now();
  return NEW;
end;
$$;

create trigger set_updated_at_organizations
before update on public.organizations
for each row
execute function public.update_updated_at_column();

create trigger set_updated_at_user_roles
before update on public.user_roles
for each row
execute function public.update_updated_at_column();

-- ============================================================
-- 9. SEED DATA (OPTIONAL - for testing)
-- ============================================================
-- insert into public.organizations (name, domain, plan)
-- values
--   ('Acme Corporation', 'acme.com', 'enterprise'),
--   ('Beta Industries', 'beta.com', 'standard'),
--   ('Gamma Labs', 'gamma.io', 'enterprise')
-- on conflict (domain) do nothing;
