# Manual Verification Guide — Supabase Dashboard

Since you have a remote Supabase project, here's how to verify and enable everything through the **Supabase Dashboard**.

**Project:** Phoenix Rising WisdomOS (`yvssmqyphqgvpkwudeoa`)

---

## ✅ Step 1: Verify Storage Buckets

1. Go to: https://supabase.com/dashboard/project/yvssmqyphqgvpkwudeoa/storage/buckets

2. You should see **3 buckets:**

| Bucket Name | Public | Max Size | Status |
|-------------|--------|----------|--------|
| `attachments` | Private 🔒 | 50 MB | ✅ Should exist (you created it) |
| `avatars` | Public | 5 MB | ❓ Check if exists |
| `exports` | Private 🔒 | 100 MB | ❓ Check if exists |

3. **If missing**, create them:
   - Click **"New bucket"**
   - Name: `avatars`
   - Public: ✅ Yes
   - File size limit: `5242880` (5MB)
   - Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`
   - Click **"Create bucket"**

   Repeat for `exports` if needed:
   - Name: `exports`
   - Public: ❌ No
   - File size limit: `104857600` (100MB)
   - Allowed MIME types: `application/json`, `application/zip`, `text/csv`, `application/pdf`

---

## ✅ Step 2: Enable pg_cron Extension

1. Go to: https://supabase.com/dashboard/project/yvssmqyphqgvpkwudeoa/database/extensions

2. Search for **"pg_cron"**

3. Click **"Enable"** (if not already enabled)

4. **Verify:** You should see it in the "Enabled Extensions" list

**This is CRITICAL** — enables 19 scheduled jobs for automation!

---

## ✅ Step 3: Enable Recommended Extensions

While you're in the Extensions page, also enable:

- ✅ **`uuid-ossp`** (should already be enabled)
- ✅ **`pg_stat_statements`** (query performance monitoring)
- ✅ **`pg_trgm`** (fuzzy text search for journals/tags)

---

## ✅ Step 4: Run SQL Migrations via SQL Editor

1. Go to: https://supabase.com/dashboard/project/yvssmqyphqgvpkwudeoa/sql/new

2. **Run Storage Buckets SQL:**
   - Copy the entire contents of `supabase/storage-buckets.sql`
   - Paste into SQL Editor
   - Click **"Run"**
   - This creates buckets and RLS policies

3. **Run pg_cron Jobs SQL:**
   - Copy the entire contents of `supabase/migrations/20251029_pg_cron_jobs.sql`
   - Paste into SQL Editor
   - Click **"Run"**
   - This creates 19 scheduled jobs

---

## ✅ Step 5: Verify Everything

Run this SQL in the SQL Editor to verify:

```sql
-- 1. Check Extensions
SELECT extname, extversion
FROM pg_extension
WHERE extname IN ('pg_cron', 'uuid-ossp', 'pg_stat_statements', 'pg_trgm')
ORDER BY extname;

-- 2. Check Storage Buckets
SELECT id, name, public, file_size_limit
FROM storage.buckets
WHERE name IN ('attachments', 'avatars', 'exports')
ORDER BY name;

-- 3. Check Scheduled Jobs
SELECT jobname, schedule, active
FROM cron.job
ORDER BY jobname;

-- 4. Check RLS Policies
SELECT COUNT(*) as "Total RLS Policies"
FROM pg_policies
WHERE schemaname = 'public';

-- 5. Check Seed Data
SELECT COUNT(*) as "Areas Count" FROM fd_area
UNION ALL
SELECT COUNT(*) as "Dimensions Count" FROM fd_dimension;
```

---

## ✅ Expected Results

### Extensions (4)
```
 extname            | extversion
--------------------+------------
 pg_cron            | 1.x
 pg_stat_statements | 1.x
 pg_trgm            | 1.x
 uuid-ossp          | 1.x
```

### Storage Buckets (3)
```
 id          | name        | public | file_size_limit
-------------+-------------+--------+-----------------
 attachments | attachments | f      | 52428800
 avatars     | avatars     | t      | 5242880
 exports     | exports     | f      | 104857600
```

### Scheduled Jobs (19)
```
 jobname                          | schedule      | active
----------------------------------+---------------+--------
 cleanup-old-notifications        | 0 2 * * *     | t
 daily-goal-check                 | 0 9 * * *     | t
 daily-integrity-check            | 0 19 * * *    | t
 daily-ritual-reminders           | 0 8 * * *     | t
 daily-score-rollup               | 0 1 * * *     | t
 monthly-dashboard-snapshot       | 0 3 1 * *     | t
 monthly-review-generation        | 0 2 1 * *     | t
 monthly-review-notification      | 0 9 1 * *     | t
 quarterly-review-generation      | 0 2 1 1,4,7,10 * | t
 quarterly-review-notification    | 0 9 1 1,4,7,10 * | t
 system-health-check              | */15 * * * *  | t
 weekly-relationship-check        | 0 17 * * 5    | t
 weekly-ritual-report             | 0 18 * * 0    | t
 ... (plus 6 more)
```

### RLS Policies
```
 Total RLS Policies
--------------------
 30+
```

### Seed Data
```
 Areas Count
-------------
 16

 Dimensions Count
-----------------
 70+
```

---

## ✅ Step 6: Enable Realtime (Optional)

If you want live updates in the UI:

1. Go to: https://supabase.com/dashboard/project/yvssmqyphqgvpkwudeoa/database/replication

2. **Enable replication** for these tables:
   - `fd_entry` (journal entries)
   - `goals` (goal updates)
   - `ritual_sessions` (ritual completions)
   - `notifications` (in-app notifications)
   - `relationship_events` (relationship updates)

3. Click **"Enable"** for each table

---

## ✅ Step 7: Configure Storage RLS Policies

The `storage-buckets.sql` migration should have created these, but verify:

1. Go to: https://supabase.com/dashboard/project/yvssmqyphqgvpkwudeoa/storage/policies

2. **For `attachments` bucket:**
   - ✅ Users can upload attachments
   - ✅ Users can read own attachments
   - ✅ Users can update own attachments
   - ✅ Users can delete own attachments

3. **For `avatars` bucket:**
   - ✅ Users can upload avatar
   - ✅ Anyone can read avatars (public)
   - ✅ Users can update own avatar
   - ✅ Users can delete own avatar

4. **For `exports` bucket:**
   - ✅ Users can upload exports
   - ✅ Users can read own exports
   - ✅ Users can delete own exports

---

## 🎯 Quick Checklist

- [ ] Storage buckets created (3/3)
- [ ] `pg_cron` extension enabled
- [ ] `pg_stat_statements` enabled
- [ ] `pg_trgm` enabled
- [ ] Storage buckets SQL migration run
- [ ] pg_cron jobs SQL migration run
- [ ] Verified scheduled jobs (19)
- [ ] Verified RLS policies (30+)
- [ ] Verified seed data (16 areas)
- [ ] (Optional) Realtime enabled for 5 tables

---

## ✅ Success!

If you see all the expected results above, **you're done!** 🎉

Your Supabase instance is fully configured with:
- ✅ 3 storage buckets
- ✅ 4 PostgreSQL extensions
- ✅ 19 scheduled jobs
- ✅ 30+ RLS policies
- ✅ 100+ indexes
- ✅ 16 life areas + 70+ dimensions

---

## 🚀 Next Steps

1. **Test the API:**
   - Use examples in `examples/fulfillment-api-usage.ts`
   - Try creating a journal entry, goal, or ritual

2. **Build the frontend:**
   - Fulfillment Dashboard UI
   - Area detail views
   - Monthly review interface

3. **Deploy Edge Functions** (optional):
   ```bash
   supabase functions deploy journal-ai-analysis
   ```

4. **Configure monitoring:**
   - Set up alerts in Dashboard → Settings
   - Configure log drains if needed

---

**Everything is ready to go! Start building! 🚀**
