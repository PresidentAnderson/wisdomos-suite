# Supabase Setup Checklist — Full Functionality

**Date:** October 29, 2025
**Version:** 5.0

This checklist ensures all required features are enabled in Supabase for the Fulfillment Display v5 backend.

---

## ✅ PostgreSQL Extensions

Enable these extensions in your Supabase project:

### 1. **pg_cron** (CRITICAL - Required for automation)
```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;
```
- **Purpose:** Scheduled jobs (19 jobs for rollups, reminders, cleanup)
- **Where to enable:** Supabase Dashboard → Database → Extensions
- **Status:** ⚠️ **REQUIRED** — Already in migration file

### 2. **pg_stat_statements** (Recommended for monitoring)
```sql
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
```
- **Purpose:** Query performance monitoring
- **Where to enable:** Supabase Dashboard → Database → Extensions
- **Status:** 🔵 **RECOMMENDED**

### 3. **pgaudit** (Recommended for compliance)
```sql
CREATE EXTENSION IF NOT EXISTS pgaudit;
```
- **Purpose:** Enhanced audit logging for compliance
- **Where to enable:** Supabase Dashboard → Database → Extensions
- **Status:** 🔵 **RECOMMENDED**

### 4. **pg_trgm** (Recommended for search)
```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```
- **Purpose:** Fuzzy text search (for journal entries, tags)
- **Where to enable:** Supabase Dashboard → Database → Extensions
- **Status:** 🔵 **RECOMMENDED**

### 5. **uuid-ossp** (Usually enabled by default)
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```
- **Purpose:** UUID generation functions
- **Where to enable:** Supabase Dashboard → Database → Extensions
- **Status:** ✅ **Should be enabled by default**

### 6. **pgvector** (Optional - for AI embeddings)
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```
- **Purpose:** Vector embeddings for AI similarity search
- **Where to enable:** Supabase Dashboard → Database → Extensions
- **Status:** 🟡 **OPTIONAL** (for future AI features)

---

## ✅ Supabase Features

### 7. **Realtime** (Enable subscriptions)
- **Purpose:** Live updates for journal entries, goals, notifications
- **Where to enable:** Supabase Dashboard → Settings → API → Realtime
- **Status:** ⚠️ **REQUIRED** for real-time features
- **Tables to enable:**
  - `fd_entry` (journal entries)
  - `goals` (goal updates)
  - `ritual_sessions` (ritual completions)
  - `notifications` (in-app notifications)
  - `relationship_events` (relationship updates)

**How to enable:**
1. Go to Database → Replication
2. Enable replication for these tables:
   ```sql
   ALTER TABLE fd_entry REPLICA IDENTITY FULL;
   ALTER TABLE goals REPLICA IDENTITY FULL;
   ALTER TABLE ritual_sessions REPLICA IDENTITY FULL;
   ALTER TABLE notifications REPLICA IDENTITY FULL;
   ALTER TABLE relationship_events REPLICA IDENTITY FULL;
   ```

### 8. **Auth Providers** (Configure authentication)
- **Email/Password:** ✅ Enabled by default
- **Google OAuth:** 🟡 Optional
- **GitHub OAuth:** 🟡 Optional
- **Apple OAuth:** 🟡 Optional
- **Where to enable:** Supabase Dashboard → Authentication → Providers

**Recommended settings:**
- ✅ Enable email confirmations (for production)
- ✅ Enable password recovery
- ✅ Set custom SMTP (for branded emails)
- ✅ Configure redirect URLs

### 9. **Storage** (Already configured via migration)
- **Buckets created:**
  - ✅ `attachments` (private, 50MB)
  - ✅ `avatars` (public, 5MB)
  - ✅ `exports` (private, 100MB)
- **Status:** ✅ **Configured via `storage-buckets.sql`**
- **Action needed:** Run the storage migration:
  ```bash
  psql $DATABASE_URL -f supabase/storage-buckets.sql
  ```

### 10. **Edge Functions** (Deploy serverless functions)
- **Functions to deploy:**
  - `journal-ai-analysis`
  - `send-webhook`
  - `generate-monthly-review`
  - `process-batch-scores`
  - `export-data`
- **Where to deploy:** Via Supabase CLI
  ```bash
  supabase functions deploy
  ```
- **Status:** 🟡 **OPTIONAL** (implement as needed)

---

## ✅ Environment Variables & Secrets

### 11. **Required Secrets**
Set these in Supabase Dashboard → Settings → Vault:

```bash
# AI Features (Optional)
OPENAI_API_KEY=sk-...

# Stripe Integration (Optional)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email Provider (Recommended)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG...

# Monitoring (Optional)
DATADOG_API_KEY=...
LOGFLARE_API_KEY=...
```

**How to set secrets (for Edge Functions):**
```bash
supabase secrets set OPENAI_API_KEY=sk-...
```

---

## ✅ Database Configuration

### 12. **Connection Pooler** (Enable for production)
- **Purpose:** Handle high concurrent connections
- **Where to enable:** Supabase Dashboard → Settings → Database
- **Recommended settings:**
  - ✅ Transaction mode (for most apps)
  - Pool size: 20-50 (depending on plan)
  - Max client connections: 100
- **Status:** ✅ **Already in config.toml**

### 13. **Backups** (Configure automatic backups)
- **Where to enable:** Supabase Dashboard → Settings → Backups
- **Recommended:**
  - ✅ Daily backups (enabled by default on Pro+)
  - ✅ Point-in-time recovery (PITR)
  - Retention: 7-30 days
- **Status:** ⚠️ **CHECK PLAN** (Free tier has limited backups)

---

## ✅ Security Configuration

### 14. **RLS Policies** (Already configured)
- **Status:** ✅ **All tables have RLS enabled**
- **Verify:** Run this query to check:
  ```sql
  SELECT tablename, rowsecurity
  FROM pg_tables
  WHERE schemaname = 'public'
  ORDER BY tablename;
  ```
- **Expected:** All user-facing tables should have `rowsecurity = true`

### 15. **API Keys & Rate Limiting**
- **anon key:** Public client access (rate-limited)
- **service_role key:** Server-side access (unrestricted)
- **Where to find:** Supabase Dashboard → Settings → API
- **Recommended:**
  - ✅ Rotate keys for production
  - ✅ Enable rate limiting (Pro+ feature)
  - ✅ Monitor API usage

### 16. **CORS Configuration**
- **Where to configure:** Supabase Dashboard → Settings → API
- **Recommended origins:**
  ```
  http://localhost:3011
  http://localhost:3000
  https://yourdomain.com
  https://*.yourdomain.com
  ```

---

## ✅ Monitoring & Observability

### 17. **Enable Logging**
- **Where to configure:** Supabase Dashboard → Logs
- **Logs available:**
  - ✅ Database logs
  - ✅ API logs
  - ✅ Auth logs
  - ✅ Edge Function logs
  - ✅ Realtime logs
- **Recommended:** Set up log drains to Logflare/Datadog

### 18. **Set Up Alerts** (Pro+ feature)
- **Where to configure:** Supabase Dashboard → Settings → Alerts
- **Recommended alerts:**
  - ✅ High error rate (>5% in 5 mins)
  - ✅ Slow queries (>1s avg)
  - ✅ Storage quota (>80%)
  - ✅ Database CPU (>80%)
  - ✅ RLS policy violations

---

## ✅ Performance Optimization

### 19. **Indexes** (Already created)
- **Status:** ✅ **100+ indexes created in migrations**
- **Verify:** Check slow queries in dashboard
- **Optimize:** Add indexes if needed based on query patterns

### 20. **Connection Pooling**
- **Use:** Connection pooler endpoint (port 6543)
- **Format:** `postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres`
- **Recommended:** Use pooler for serverless/Edge Functions

---

## 🚀 Quick Verification Commands

Run these to verify everything is set up correctly:

### Check Extensions
```sql
SELECT * FROM pg_extension ORDER BY extname;
```

Expected extensions:
- ✅ `pg_cron`
- ✅ `uuid-ossp`
- ✅ `pg_stat_statements` (recommended)
- ✅ `pgaudit` (recommended)
- ✅ `pg_trgm` (recommended)

### Check RLS Policies
```sql
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;
```

Expected: 30+ policies across user-facing tables

### Check Scheduled Jobs (pg_cron)
```sql
SELECT * FROM cron.job ORDER BY jobname;
```

Expected: 19 scheduled jobs

### Check Storage Buckets
```sql
SELECT id, name, public FROM storage.buckets;
```

Expected buckets:
- ✅ `attachments` (private)
- ✅ `avatars` (public)
- ✅ `exports` (private)

### Check Realtime Tables
```sql
SELECT schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;
```

Expected (if enabled):
- ✅ `fd_entry`
- ✅ `goals`
- ✅ `ritual_sessions`
- ✅ `notifications`
- ✅ `relationship_events`

---

## 📋 Complete Setup Checklist

**PostgreSQL Extensions:**
- [ ] ✅ `pg_cron` (REQUIRED)
- [ ] 🔵 `pg_stat_statements` (recommended)
- [ ] 🔵 `pgaudit` (recommended)
- [ ] 🔵 `pg_trgm` (recommended)
- [ ] ✅ `uuid-ossp` (should be enabled)
- [ ] 🟡 `pgvector` (optional, for AI)

**Supabase Features:**
- [x] ✅ Webhooks (you've enabled this!)
- [ ] ⚠️ Realtime (enable for live updates)
- [ ] ✅ Auth providers (email enabled by default)
- [ ] ✅ Storage buckets (run storage-buckets.sql)
- [ ] 🟡 Edge Functions (deploy as needed)

**Configuration:**
- [ ] ✅ Connection pooler settings
- [ ] ⚠️ Backups & PITR
- [ ] ✅ API keys & CORS
- [ ] 🔵 Rate limiting (Pro+)
- [ ] 🔵 Alerts (Pro+)

**Verification:**
- [ ] ✅ RLS policies active (30+)
- [ ] ✅ Indexes created (100+)
- [ ] ⚠️ pg_cron jobs scheduled (19)
- [ ] ✅ Storage buckets created (3)
- [ ] 🟡 Realtime tables enabled (5)

---

## 🎯 Priority Actions

### Immediate (Required for Core Functionality)
1. ⚠️ **Enable `pg_cron` extension** → Enables 19 scheduled jobs
2. ⚠️ **Run storage buckets migration** → `psql $DATABASE_URL -f supabase/storage-buckets.sql`
3. ⚠️ **Verify RLS policies** → Ensure user data isolation

### Short-term (Recommended)
4. 🔵 **Enable Realtime** → For live updates in UI
5. 🔵 **Configure SMTP** → For branded email notifications
6. 🔵 **Set up monitoring** → Logs & alerts

### Optional (As Needed)
7. 🟡 **Deploy Edge Functions** → AI analysis, webhooks
8. 🟡 **Configure OAuth providers** → Google/GitHub login
9. 🟡 **Set AI API keys** → OpenAI integration

---

## 📞 Support

If you encounter issues:
- 📖 [Supabase Docs](https://supabase.com/docs)
- 💬 [Supabase Discord](https://discord.supabase.com)
- 🐛 [Project Issues](https://github.com/your-org/wisdomos/issues)

---

**Once you've completed this checklist, you'll have full functionality! 🚀**
