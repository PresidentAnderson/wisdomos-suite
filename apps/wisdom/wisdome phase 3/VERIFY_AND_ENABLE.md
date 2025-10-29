# Verify & Enable Supabase Features — Quick Guide

**You asked to verify storage buckets are set up and enable everything needed.**

---

## 🚀 Quick Start (2 Commands)

### 1. Set your DATABASE_URL

```bash
# For local Supabase
export DATABASE_URL='postgresql://postgres:postgres@localhost:54322/postgres'

# OR for remote Supabase project
export DATABASE_URL='postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres'
```

### 2. Run the enable script

```bash
./scripts/enable-all-features.sh
```

**This will:**
- ✅ Enable pg_cron extension (CRITICAL)
- ✅ Enable uuid-ossp, pg_stat_statements, pg_trgm
- ✅ Create 3 storage buckets (attachments, avatars, exports)
- ✅ Create 19 scheduled jobs
- ✅ Optionally enable Realtime
- ✅ Verify everything is working

---

## 📋 Or Verify Only

Just check what's already configured:

```bash
./scripts/verify-setup.sh
```

This will show you:
- Which extensions are enabled
- Which storage buckets exist
- How many RLS policies are active
- How many scheduled jobs are running
- If seed data is loaded

---

## 🎯 What Gets Enabled

### Storage Buckets (3)
- ✅ `attachments` — Private, 50MB (user files)
- ✅ `avatars` — Public, 5MB (profile pics)
- ✅ `exports` — Private, 100MB (data exports)

### PostgreSQL Extensions (4)
- ✅ `pg_cron` — Scheduled jobs (CRITICAL!)
- ✅ `uuid-ossp` — UUID generation
- ✅ `pg_stat_statements` — Query monitoring
- ✅ `pg_trgm` — Fuzzy text search

### Scheduled Jobs (19)
- ✅ Daily score rollups
- ✅ Ritual reminders
- ✅ Goal deadline checks
- ✅ Monthly/quarterly reviews
- ✅ Notification cleanup
- ✅ System health checks

### Optional: Realtime
- 📡 Live updates for journal entries, goals, rituals, etc.

---

## 🔍 Manual Verification

### Check Storage Buckets
```sql
SELECT id, name, public, file_size_limit
FROM storage.buckets
WHERE name IN ('attachments', 'avatars', 'exports');
```

Expected output:
```
 id          | name        | public | file_size_limit
-------------+-------------+--------+-----------------
 attachments | attachments | f      | 52428800
 avatars     | avatars     | t      | 5242880
 exports     | exports     | f      | 104857600
```

### Check Extensions
```sql
SELECT extname, extversion
FROM pg_extension
WHERE extname IN ('pg_cron', 'uuid-ossp', 'pg_stat_statements', 'pg_trgm');
```

Expected: All 4 extensions listed

### Check Scheduled Jobs
```sql
SELECT COUNT(*) FROM cron.job;
```

Expected: 19 jobs

---

## ✅ Success Checklist

After running `./scripts/enable-all-features.sh`, you should see:

- ✅ **Storage buckets:** 3/3 configured
- ✅ **Extensions:** pg_cron enabled
- ✅ **Scheduled jobs:** 19/19 created
- ✅ **RLS policies:** 30+ active
- ✅ **Seed data:** 16 areas loaded

If you see this output:
```
✅ ✅ ✅ ALL SYSTEMS GO! ✅ ✅ ✅

Your Supabase instance is fully configured!
Extensions: 2 OK
Storage Buckets: 3 OK
RLS Policies: 30+ OK
Scheduled Jobs: 19 OK
Seed Data: 16 areas loaded
```

**You're done!** Everything is working. 🎉

---

## 🆘 Troubleshooting

### "pg_cron not available"
You may need to enable it in Supabase Dashboard:
1. Go to **Database → Extensions**
2. Search for "pg_cron"
3. Click **Enable**

### "Storage bucket already exists"
That's fine! The script will skip creating duplicates.

### "Permission denied"
Make sure you're using the correct DATABASE_URL with proper credentials.

### Need help?
Run the verification script to see exactly what's missing:
```bash
./scripts/verify-setup.sh
```

---

## 📚 More Info

- Full checklist: `docs/SUPABASE_SETUP_CHECKLIST.md`
- API examples: `examples/fulfillment-api-usage.ts`
- Complete docs: `docs/FULFILLMENT_BACKEND_README.md`

---

**Ready to verify? Run `./scripts/enable-all-features.sh` now!** 🚀
