# WisdomOS MAS - Deployment Instructions

**Status**: Ready to Deploy
**Date**: October 29, 2025

---

## 🚀 QUICK START DEPLOYMENT

### Option 1: Deploy to Existing Supabase Project

```bash
cd "/Volumes/DevOPS 2025/01_DEVOPS_PLATFORM/wisdomOS 2026"

# 1. Link your Supabase project
supabase link --project-ref YOUR_PROJECT_REF

# 2. Deploy migrations
supabase db push

# 3. Deploy Edge Functions
supabase functions deploy journal-entry
supabase functions deploy orchestrator-poll

# 4. Set secrets (optional for now)
supabase secrets set OPENAI_API_KEY=sk-...
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
```

### Option 2: Create New Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Name it "WisdomOS" or similar
4. Copy the project reference ID
5. Run Option 1 commands above with your new project ref

---

## 📊 WHAT GETS DEPLOYED

### Database (Automatic via `supabase db push`)

**26 Tables**:
- Queue: `queue_jobs`, `queue_events`, `agent_logs`
- FD Core: `fd_areas`, `fd_dimensions`, `fd_entries`, `fd_entry_links`
- Commitments: `fd_commitments`, `fd_actions`
- Scoring: `fd_score_raw`, `fd_score_rollups`
- Autobiography: `fd_eras`, `fd_autobiography_chapters`, `fd_autobiography_links`
- Integrity: `fd_integrity_logs`
- Finance: `fd_finance_transactions`
- Justice: `fd_law_cases`, `fd_law_filings`
- Planning: `fd_plans`, `fd_plan_tasks`
- Templates: `fd_area_templates`, `fd_dimension_templates`, `fd_system_metadata`

**3 PostgreSQL Functions**:
- `fn_deps_met(job_id)` - Check job dependencies
- `fn_fd_rollup_month(user_id, month)` - Monthly score aggregation
- `fn_commitment_spawn(commitment_id)` - Auto-spawn areas

**RLS Policies**: All tables protected with row-level security

**Seed Data**:
- 13 eras (1975-2100)
- 10 area templates (bilingual EN/FR)
- 6 dimension templates (bilingual EN/FR)
- System metadata

### Edge Functions

**1. journal-entry** (`/functions/v1/journal-entry`)
- Accepts journal entries via POST
- Performs sentiment analysis
- Classifies to areas/dimensions
- Detects commitments
- Spawns areas automatically
- Emits events

**2. orchestrator-poll** (`/functions/v1/orchestrator-poll`)
- Polls queue_jobs table
- Executes pending jobs
- Handles retries with exponential backoff
- Logs to agent_logs
- Emits completion events

---

## 🧪 VERIFY DEPLOYMENT

### 1. Check Database Tables

```bash
supabase db sql "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'fd_%' ORDER BY table_name;"
```

Expected: 20+ tables starting with `fd_`

### 2. Verify Eras

```bash
supabase db sql "SELECT COUNT(*) as era_count FROM fd_eras;"
```

Expected: `era_count = 13`

### 3. Check Area Templates

```bash
supabase db sql "SELECT code, name_en FROM fd_area_templates ORDER BY sort_order;"
```

Expected: WRK, REL, HEA, FIN, LRN, CRE, SPR, FUN, ENV, LEG

### 4. Verify Functions

```bash
supabase db sql "SELECT proname FROM pg_proc WHERE proname LIKE 'fn_fd_%';"
```

Expected: 3 functions (fn_deps_met, fn_fd_rollup_month, fn_commitment_spawn)

### 5. Test Edge Functions

```bash
# Get your project URL and keys from Supabase dashboard

# Test journal-entry
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/journal-entry \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "I commit to deploying WisdomOS today!",
    "date": "2025-10-29"
  }'

# Expected response:
# {"success":true,"entry_id":"uuid-here"}
```

---

## 🔍 TROUBLESHOOTING

### Issue: "Cannot connect to Docker daemon"

**Solution**: Supabase CLI uses Docker for local development. For deployment to cloud, you don't need Docker running. Use the cloud commands:

```bash
# Skip local Docker, deploy directly to cloud
supabase link --project-ref YOUR_REF
supabase db push --remote
supabase functions deploy journal-entry
supabase functions deploy orchestrator-poll
```

### Issue: "Project not found"

**Solution**:
1. Go to https://supabase.com/dashboard
2. Verify your project exists
3. Copy the exact project reference from project settings
4. Try linking again

### Issue: "Migration already exists"

**Solution**: This is normal if you've run migrations before. Supabase tracks which migrations are applied.

```bash
# Force reset (WARNING: Deletes all data)
supabase db reset --remote

# Or skip migrations that are already applied (safe)
supabase db push --remote --skip-verify
```

### Issue: "Authentication error"

**Solution**:
```bash
# Re-authenticate with Supabase
supabase login

# Then link project again
supabase link --project-ref YOUR_REF
```

---

## 📋 DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] Supabase project created
- [ ] Project reference ID copied
- [ ] Supabase CLI installed (`npm install -g supabase`)
- [ ] Logged in to Supabase CLI (`supabase login`)

### Database Deployment
- [ ] Linked to project (`supabase link`)
- [ ] Migrations applied (`supabase db push`)
- [ ] Verified tables created (26 tables)
- [ ] Verified functions created (3 functions)
- [ ] Verified seed data (13 eras, 10 areas, 6 dimensions)

### Edge Functions Deployment
- [ ] journal-entry deployed
- [ ] orchestrator-poll deployed
- [ ] Tested journal-entry endpoint
- [ ] Tested orchestrator-poll endpoint

### Configuration
- [ ] Environment variables set
- [ ] API keys configured (optional for MVP)
- [ ] RLS policies verified
- [ ] Access tokens tested

### Verification
- [ ] Created test journal entry
- [ ] Verified entry in database
- [ ] Checked queue_events for events
- [ ] Ran orchestrator poll
- [ ] Verified agent_logs for activity

---

## 🎯 POST-DEPLOYMENT TESTING

### Test 1: Journal Entry Flow

```bash
# Step 1: Create entry
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/journal-entry \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "I commit to exercising 5 days per week starting today. This is important for my health and energy.",
    "date": "2025-10-29",
    "tags": ["health", "commitment"]
  }'

# Step 2: Verify entry created
supabase db sql "SELECT id, content, sentiment_score FROM fd_entries ORDER BY created_at DESC LIMIT 1;"

# Step 3: Check events emitted
supabase db sql "SELECT type, payload FROM queue_events ORDER BY created_at DESC LIMIT 5;"

# Step 4: Check for commitment
supabase db sql "SELECT statement, confidence, status FROM fd_commitments ORDER BY created_at DESC LIMIT 1;"

# Step 5: Check if area spawned
supabase db sql "SELECT code, name, is_commitment_spawned FROM fd_areas WHERE is_commitment_spawned = true ORDER BY created_at DESC LIMIT 1;"
```

### Test 2: Orchestrator Execution

```bash
# Run orchestrator poll
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/orchestrator-poll \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY"

# Check jobs processed
supabase db sql "SELECT agent, status, created_at FROM queue_jobs ORDER BY created_at DESC LIMIT 5;"

# Check agent logs
supabase db sql "SELECT agent, level, message FROM agent_logs ORDER BY created_at DESC LIMIT 10;"
```

### Test 3: Score Rollup

```bash
# Trigger rollup via SQL
supabase db sql "SELECT fn_fd_rollup_month('USER_ID', '2025-10-01');"

# Verify rollup created
supabase db sql "SELECT period_type, period_start, score_avg FROM fd_score_rollups WHERE user_id = 'USER_ID';"
```

---

## 🔐 ENVIRONMENT VARIABLES

### Required (For Production)

```bash
# Supabase
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Set in Supabase
supabase secrets set SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
```

### Optional (For Enhanced Features)

```bash
# AI/ML
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Analytics
POSTHOG_KEY=phc_...
LOGSNAG_TOKEN=...

# Set in Supabase
supabase secrets set OPENAI_API_KEY="sk-..."
supabase secrets set ANTHROPIC_API_KEY="sk-ant-..."
```

---

## 📞 GET HELP

### Supabase Dashboard
- **URL**: https://supabase.com/dashboard
- **Project Settings**: Project Settings → General → Reference ID
- **API Keys**: Project Settings → API
- **Database**: Table Editor to view data
- **Functions**: Edge Functions to manage deployments

### Command Line Help

```bash
# Supabase CLI help
supabase --help
supabase db --help
supabase functions --help

# Check current link
supabase projects list

# View project details
supabase status
```

### Documentation
- Supabase Docs: https://supabase.com/docs
- Edge Functions: https://supabase.com/docs/guides/functions
- Database: https://supabase.com/docs/guides/database

---

## 🎉 SUCCESS!

Once deployed, your enterprise MAS is live and ready to:

- ✅ Ingest journal entries
- ✅ Detect commitments
- ✅ Spawn areas automatically
- ✅ Calculate scores
- ✅ Generate autobiography chapters
- ✅ Track integrity
- ✅ Manage finances
- ✅ Monitor KPIs
- ✅ Enforce security
- ✅ Plan workflows

**Next**: Build the UI dashboard or integrate with your apps!

---

**Questions?** Check:
- ENTERPRISE_AGENTS_COMPLETE.md
- DEPLOYMENT_STATUS.md
- /docs/agents/README.md
