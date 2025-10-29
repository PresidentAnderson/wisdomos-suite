#!/bin/bash

# =====================================================
# Supabase Setup Verification & Enablement Script
# =====================================================
# Purpose: Verify and enable all required features
# Date: 2025-10-29
# =====================================================

set -e

echo ""
echo "🔍 Supabase Setup Verification & Enablement"
echo "=========================================="
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  DATABASE_URL not set!"
    echo ""
    echo "Please set it first:"
    echo "  export DATABASE_URL='postgresql://postgres:postgres@localhost:54322/postgres'"
    echo ""
    echo "Or for remote Supabase:"
    echo "  export DATABASE_URL='postgresql://postgres.[PROJECT_REF]:[PASSWORD]@...' "
    echo ""
    exit 1
fi

echo "✅ DATABASE_URL is set"
echo ""

# Run verification script
echo "📊 Running verification checks..."
echo ""

psql "$DATABASE_URL" -f scripts/verify-supabase-setup.sql

echo ""
echo "=========================================="
echo "🎯 Next Steps"
echo "=========================================="
echo ""
echo "If any issues were found above, run these commands:"
echo ""
echo "1. Enable pg_cron extension:"
echo "   psql \$DATABASE_URL -c 'CREATE EXTENSION IF NOT EXISTS pg_cron;'"
echo ""
echo "2. Create storage buckets (if missing):"
echo "   psql \$DATABASE_URL -f supabase/storage-buckets.sql"
echo ""
echo "3. Create scheduled jobs (if missing):"
echo "   psql \$DATABASE_URL -f supabase/migrations/20251029_pg_cron_jobs.sql"
echo ""
echo "4. Enable recommended extensions:"
echo "   psql \$DATABASE_URL -c 'CREATE EXTENSION IF NOT EXISTS pg_stat_statements;'"
echo "   psql \$DATABASE_URL -c 'CREATE EXTENSION IF NOT EXISTS pg_trgm;'"
echo ""
echo "=========================================="
echo ""
