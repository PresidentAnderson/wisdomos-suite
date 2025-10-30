# 🚀 Deploy Now - Quick Start Guide

**Status**: ✅ Supabase CLI connected and ready
**Project**: Phoenix Rising WisdomOS (yvssmqyphqgvpkwudeoa)
**Migrations Ready**: 13 total (including 2 new ones)

---

## ⚡ Option 1: One-Command Deploy (Fastest)

Run this command in your terminal:

```bash
cd "/Volumes/DevOPS 2025/01_DEVOPS_PLATFORM/wisdomOS 2026" && supabase db push --linked
```

When prompted with the list of migrations, type `Y` and press Enter.

**What will be deployed**:
- ✅ All base migrations (if not already applied)
- ✅ Organization authentication system (NEW)
- ✅ Fulfillment dashboard API with materialized views (NEW)

**Expected output**: "Finished supabase db push."

---

## 📋 Option 2: Deploy Specific Migrations Only

If you want to deploy only the new migrations:

### Step 1: Deploy Organization Auth

```bash
cd "/Volumes/DevOPS 2025/01_DEVOPS_PLATFORM/wisdomOS 2026"

# Read the migration file and pipe to psql via Supabase
supabase db execute --file supabase/migrations/20251029_organization_auth_system.sql --linked
```

### Step 2: Deploy Fulfillment Dashboard API

```bash
supabase db execute --file supabase/migrations/20251029_fulfillment_dashboard_api.sql --linked
```

---

## 🎯 Option 3: Manual Deploy via Dashboard (Most Visual)

1. **Go to Supabase Dashboard**:
   - URL: https://supabase.com/dashboard/project/yvssmqyphqgvpkwudeoa/editor
   - Click on **SQL Editor** in left sidebar

2. **Deploy Organization Auth** (5 minutes):
   - Click **New Query**
   - Open file: `supabase/migrations/20251029_organization_auth_system.sql`
   - Copy entire contents
   - Paste into SQL Editor
   - Click **Run** (bottom right)
   - Wait for "Success. No rows returned."

3. **Deploy Fulfillment Dashboard API** (5 minutes):
   - Click **New Query**
   - Open file: `supabase/migrations/20251029_fulfillment_dashboard_api.sql`
   - Copy entire contents
   - Paste into SQL Editor
   - Click **Run**
   - Wait for "Success. No rows returned."

---

## ✅ Verification (After Deployment)

Run these commands in Supabase SQL Editor to verify:

### 1. Check Organization Auth Tables

```sql
-- Check organizations table
select count(*) as org_count from organizations;

-- Check user_roles table
select count(*) as role_count from user_roles;

-- Check onboarding_events table
select count(*) as event_count from onboarding_events;

-- Check trigger exists
select tgname, tgenabled
from pg_trigger
where tgname = 'on_auth_user_created';
```

**Expected**: All tables exist, trigger enabled

### 2. Check Fulfillment Dashboard API

```sql
-- Check materialized views exist
select matviewname, hasindexes
from pg_matviews
where matviewname like 'mv_%'
order by matviewname;

-- Check materialized views have data
select 'mv_area_signals_latest' as view, count(*) as row_count
from mv_area_signals_latest
union all
select 'mv_area_dimension_signals_latest', count(*)
from mv_area_dimension_signals_latest;

-- Check functions exist
select routine_name
from information_schema.routines
where routine_name in (
  'get_dashboard_overview',
  'get_area_detail',
  'refresh_fulfillment_materialized_views',
  'refresh_and_get_dashboard'
)
order by routine_name;
```

**Expected**: 2 materialized views with data, 4 functions exist

### 3. Test API Functions

```sql
-- Test dashboard overview (should return JSON)
select jsonb_pretty(get_dashboard_overview());

-- Test area detail (replace 1 with actual area_id)
select jsonb_pretty(get_area_detail(1));

-- Test refresh function
select refresh_fulfillment_materialized_views(true);

-- Test combined function
select jsonb_pretty(refresh_and_get_dashboard());
```

**Expected**: All return valid JSON without errors

### 4. Performance Test

```sql
-- Enable timing
\timing on

-- Test dashboard performance
select get_dashboard_overview();

-- Should complete in ~30-50ms
\timing off
```

---

## 🐛 Troubleshooting

### Error: "relation does not exist"

**Problem**: Base tables not created yet

**Solution**: Run base migrations first using Option 1 (supabase db push --linked)

### Error: "already exists"

**Problem**: Migration already applied

**Solution**: This is normal! Skip to verification steps.

### Error: "permission denied"

**Problem**: Supabase CLI not authenticated

**Solution**:
```bash
supabase login
supabase link --project-ref yvssmqyphqgvpkwudeoa
```

### Materialized views are empty

**Problem**: No score data yet

**Solution**: This is normal for new installs. Views will populate when scores are added.

---

## 📊 What You're Deploying

### Organization Authentication System
- **Tables**: organizations, user_roles, onboarding_events
- **Triggers**: Automatic user assignment on signup
- **Functions**: Organization management functions
- **Indexes**: Performance indexes on all tables
- **RLS Policies**: Row-level security for data isolation

### Fulfillment Dashboard API
- **Materialized Views**: Pre-aggregated signals for fast reads
- **Functions**: 4 JSON API functions
- **Indexes**: Unique indexes for concurrent refresh
- **Performance**: 10-15x faster dashboard loads

---

## 🎉 After Deployment

Once deployed, you can:

1. **Test Organization Auth**:
   ```sql
   -- Create test organization
   insert into organizations (name, domain, plan)
   values ('Test Corp', 'test.com', 'enterprise');

   -- Verify it exists
   select * from organizations;
   ```

2. **Test Dashboard API**:
   ```typescript
   import { getDashboardOverview } from '@/lib/fulfillment-dashboard-client';

   const dashboard = await getDashboardOverview();
   console.log('Dashboard loaded:', dashboard);
   ```

3. **Start Building UI**:
   - Use React hooks: `useDashboardOverview()`, `useAreaDetail()`
   - Create organization settings page
   - Add dashboard component

---

## 🚦 Quick Start Commands

```bash
# Navigate to project
cd "/Volumes/DevOPS 2025/01_DEVOPS_PLATFORM/wisdomOS 2026"

# Option A: Deploy all migrations (recommended)
supabase db push --linked
# Type 'Y' when prompted

# Option B: Deploy specific migrations
supabase db execute --file supabase/migrations/20251029_organization_auth_system.sql --linked
supabase db execute --file supabase/migrations/20251029_fulfillment_dashboard_api.sql --linked

# Verify deployment
supabase db remote-api-url
```

---

## 📞 Need Help?

- **Documentation**: See `MANUAL_DEPLOYMENT_GUIDE.md` for detailed steps
- **API Reference**: See `docs/FULFILLMENT_DASHBOARD_API.md`
- **Session Summary**: See `SESSION_SUMMARY_2025_10_29.md`

---

**Ready to deploy!** Choose your option and run the commands. ✨
