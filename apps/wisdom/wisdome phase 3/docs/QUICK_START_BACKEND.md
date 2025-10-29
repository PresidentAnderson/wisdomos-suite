# Fulfillment Backend v5 — Quick Start Guide

**Get up and running in 15 minutes**

---

## Prerequisites

```bash
# Install Node.js 20+
node --version  # Should be v20+

# Install pnpm
npm install -g pnpm

# Install Supabase CLI
npm install -g supabase
```

---

## Step 1: Start Local Supabase

```bash
# Navigate to project root
cd /path/to/wisdome-phase-3

# Initialize Supabase (if not already done)
supabase init

# Start local Supabase (Postgres, Auth, Storage, etc.)
supabase start
```

You'll see output like:

```
Started supabase local development setup.

         API URL: http://localhost:54321
     GraphQL URL: http://localhost:54321/graphql/v1
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
    Inbucket URL: http://localhost:54324
      JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
        anon key: eyJhbGc...
service_role key: eyJhbGc...
```

---

## Step 2: Run Migrations

```bash
# Reset database and run all migrations
supabase db reset

# This will run:
# - 20251029_fulfillment_display_v5.sql (core schema)
# - 20251029_fulfillment_v5_extended.sql (extended tables)
# - 20251029_fulfillment_display_v5_seed.sql (seed data)
# - 20251029_pg_cron_jobs.sql (scheduled jobs)
```

---

## Step 3: Set Environment Variables

Create `.env.local`:

```bash
# Copy from Supabase output above
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres

# Optional: For AI features
OPENAI_API_KEY=sk-...
```

---

## Step 4: Generate TypeScript Types

```bash
# Generate types from Supabase schema
supabase gen types typescript --local > packages/types/supabase.ts

# Or use the script
chmod +x scripts/generate-types.sh
./scripts/generate-types.sh
```

---

## Step 5: Test the API

### Option A: Use Supabase Studio

```bash
# Open Studio
supabase studio

# Navigate to http://localhost:54323
# Use the SQL Editor to run queries
```

### Option B: Use cURL

```bash
# Get all areas
curl http://localhost:54321/rest/v1/fd_area \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# Create a test user (sign up)
curl http://localhost:54321/auth/v1/signup \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "securepassword123"
  }'
```

### Option C: Use JavaScript Client

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Test query
const { data: areas } = await supabase
  .from('fd_area')
  .select('*')
  .eq('is_active', true)

console.log('Areas:', areas)
```

---

## Step 6: Deploy Edge Functions (Optional)

```bash
# Serve Edge Functions locally
supabase functions serve

# In another terminal, test a function
curl -i --location --request POST \
  'http://localhost:54321/functions/v1/journal-ai-analysis' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"entry_id": "test-uuid"}'
```

---

## Step 7: Verify Setup

Run these checks:

```sql
-- 1. Check areas are seeded
SELECT COUNT(*) FROM fd_area;
-- Should return 16

-- 2. Check dimensions are seeded
SELECT COUNT(*) FROM fd_dimension;
-- Should return ~70

-- 3. Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = true;
-- Should show multiple tables

-- 4. Check pg_cron jobs are scheduled
SELECT * FROM cron.job;
-- Should show ~15 scheduled jobs
```

---

## Common Commands

```bash
# Stop Supabase
supabase stop

# View logs
supabase logs

# Reset database (WARNING: deletes all data)
supabase db reset

# Create new migration
supabase migration new my_migration_name

# Push migrations to remote
supabase db push

# Pull remote schema
supabase db pull

# Open Studio
supabase studio
```

---

## Next Steps

1. ✅ Read [FULFILLMENT_BACKEND_README.md](./FULFILLMENT_BACKEND_README.md) for comprehensive docs
2. ✅ Review [edge-functions-setup.md](./edge-functions-setup.md) for Edge Functions
3. ✅ Check [storage-buckets.sql](../supabase/storage-buckets.sql) for Storage setup
4. ✅ Explore the seed data in Supabase Studio
5. ✅ Start building your frontend!

---

## Troubleshooting

### Supabase won't start

```bash
# Check Docker is running
docker --version

# Check ports aren't in use
lsof -i :54321
lsof -i :54322

# Reset Docker
docker system prune -a
```

### Migrations fail

```bash
# View detailed error
supabase db reset --debug

# Check migration syntax
psql postgresql://postgres:postgres@localhost:54322/postgres \
  -f supabase/migrations/YOUR_MIGRATION.sql
```

### RLS blocking queries

```bash
# Disable RLS temporarily (dev only!)
ALTER TABLE your_table DISABLE ROW LEVEL SECURITY;

# Re-enable
ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;
```

---

## Support

- 📖 [Full Documentation](./FULFILLMENT_BACKEND_README.md)
- 🐛 [Report Issues](https://github.com/your-org/wisdomos/issues)
- 💬 [Supabase Discord](https://discord.supabase.com)

---

**Happy coding! 🚀**
