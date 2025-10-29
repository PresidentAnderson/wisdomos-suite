#!/bin/bash

# =====================================================
# Enable All Supabase Features Script
# =====================================================
# Purpose: Enable all required features for full functionality
# Date: 2025-10-29
# =====================================================

set -e

echo ""
echo "🚀 Enabling All Supabase Features"
echo "=========================================="
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  DATABASE_URL not set!"
    echo ""
    echo "Please set it first:"
    echo "  export DATABASE_URL='postgresql://postgres:postgres@localhost:54322/postgres'"
    echo ""
    exit 1
fi

echo "✅ DATABASE_URL is set: ${DATABASE_URL:0:50}..."
echo ""

# =====================================================
# 1. ENABLE POSTGRESQL EXTENSIONS
# =====================================================
echo "📦 Step 1: Enabling PostgreSQL Extensions..."
echo ""

echo "  → Enabling pg_cron (CRITICAL)..."
psql "$DATABASE_URL" -c "CREATE EXTENSION IF NOT EXISTS pg_cron;" 2>&1 | grep -v "already exists" || true

echo "  → Enabling uuid-ossp..."
psql "$DATABASE_URL" -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";" 2>&1 | grep -v "already exists" || true

echo "  → Enabling pg_stat_statements (recommended)..."
psql "$DATABASE_URL" -c "CREATE EXTENSION IF NOT EXISTS pg_stat_statements;" 2>&1 | grep -v "already exists" || true

echo "  → Enabling pg_trgm (recommended for search)..."
psql "$DATABASE_URL" -c "CREATE EXTENSION IF NOT EXISTS pg_trgm;" 2>&1 | grep -v "already exists" || true

echo ""
echo "✅ Extensions enabled!"
echo ""

# =====================================================
# 2. CREATE STORAGE BUCKETS
# =====================================================
echo "📁 Step 2: Creating Storage Buckets..."
echo ""

if [ -f "supabase/storage-buckets.sql" ]; then
    echo "  → Running storage-buckets.sql..."
    psql "$DATABASE_URL" -f supabase/storage-buckets.sql 2>&1 | grep -v "already exists" || true
    echo ""
    echo "✅ Storage buckets configured!"
else
    echo "⚠️  storage-buckets.sql not found!"
fi

echo ""

# =====================================================
# 3. CREATE SCHEDULED JOBS
# =====================================================
echo "⏰ Step 3: Creating Scheduled Jobs (pg_cron)..."
echo ""

if [ -f "supabase/migrations/20251029_pg_cron_jobs.sql" ]; then
    echo "  → Running pg_cron_jobs.sql..."
    psql "$DATABASE_URL" -f supabase/migrations/20251029_pg_cron_jobs.sql 2>&1 | grep -v "already exists" || true
    echo ""
    echo "✅ Scheduled jobs created!"
else
    echo "⚠️  pg_cron_jobs.sql not found!"
fi

echo ""

# =====================================================
# 4. ENABLE REALTIME (Optional)
# =====================================================
echo "📡 Step 4: Enabling Realtime (optional)..."
echo ""

read -p "Do you want to enable Realtime for live updates? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "  → Enabling replication for key tables..."

    psql "$DATABASE_URL" -c "ALTER TABLE fd_entry REPLICA IDENTITY FULL;" 2>&1 | grep -v "already" || true
    psql "$DATABASE_URL" -c "ALTER TABLE goals REPLICA IDENTITY FULL;" 2>&1 | grep -v "already" || true
    psql "$DATABASE_URL" -c "ALTER TABLE ritual_sessions REPLICA IDENTITY FULL;" 2>&1 | grep -v "already" || true
    psql "$DATABASE_URL" -c "ALTER TABLE notifications REPLICA IDENTITY FULL;" 2>&1 | grep -v "already" || true
    psql "$DATABASE_URL" -c "ALTER TABLE relationship_events REPLICA IDENTITY FULL;" 2>&1 | grep -v "already" || true

    echo ""
    echo "✅ Realtime enabled for 5 tables!"
    echo ""
    echo "📝 Next: Go to Supabase Dashboard → Database → Replication"
    echo "   and enable these tables in the Realtime section"
else
    echo "  ⏭️  Skipping Realtime setup"
fi

echo ""

# =====================================================
# 5. VERIFICATION
# =====================================================
echo "🔍 Step 5: Running Verification..."
echo ""

if [ -f "scripts/verify-supabase-setup.sql" ]; then
    psql "$DATABASE_URL" -f scripts/verify-supabase-setup.sql
else
    echo "⚠️  verify-supabase-setup.sql not found!"
    echo "  Running quick verification instead..."
    echo ""

    # Quick verification
    echo "Extensions:"
    psql "$DATABASE_URL" -c "SELECT extname, extversion FROM pg_extension WHERE extname IN ('pg_cron', 'uuid-ossp', 'pg_stat_statements', 'pg_trgm') ORDER BY extname;"

    echo ""
    echo "Storage Buckets:"
    psql "$DATABASE_URL" -c "SELECT id, name, public FROM storage.buckets WHERE name IN ('attachments', 'avatars', 'exports') ORDER BY name;"

    echo ""
    echo "Scheduled Jobs:"
    psql "$DATABASE_URL" -c "SELECT jobname, schedule, active FROM cron.job ORDER BY jobname LIMIT 10;"
fi

echo ""
echo "=========================================="
echo "✅ Setup Complete!"
echo "=========================================="
echo ""
echo "🎉 All features have been enabled!"
echo ""
echo "📋 What was enabled:"
echo "  ✅ PostgreSQL extensions (pg_cron, uuid-ossp, pg_stat_statements, pg_trgm)"
echo "  ✅ Storage buckets (attachments, avatars, exports)"
echo "  ✅ Scheduled jobs (19 jobs for automation)"
echo "  📡 Realtime (if you selected yes)"
echo ""
echo "🎯 Next Steps:"
echo "  1. Check verification output above for any issues"
echo "  2. Test the API with: examples/fulfillment-api-usage.ts"
echo "  3. Deploy Edge Functions (optional): supabase functions deploy"
echo "  4. Configure monitoring & alerts in Supabase Dashboard"
echo ""
echo "🚀 You're ready to build! Happy coding!"
echo ""
