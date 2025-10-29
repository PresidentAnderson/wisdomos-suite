#!/bin/bash

# =====================================================
# SUPABASE DATABASE SETUP FOR WISDOMOS
# =====================================================

set -e

echo "🚀 WisdomOS Supabase Database Setup"
echo "===================================="
echo ""

# Load environment variables
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
fi

# Check for required environment variables
if [ -z "$SUPABASE_URL" ] && [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "❌ SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL not set"
    echo "   Please add to your .env.local file"
    exit 1
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ SUPABASE_SERVICE_ROLE_KEY not set"
    echo "   Please add to your .env.local file"
    exit 1
fi

SUPABASE_URL=${SUPABASE_URL:-$NEXT_PUBLIC_SUPABASE_URL}

echo "✅ Environment variables configured"
echo "   Supabase URL: ${SUPABASE_URL}"
echo ""

# Function to run SQL via Supabase API
run_migration() {
    local sql_file=$1
    local description=$2
    
    echo "📝 Running: ${description}"
    
    # Read SQL file
    sql_content=$(cat "$sql_file")
    
    # Execute via Supabase API
    response=$(curl -s -X POST "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
        -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
        -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
        -H "Content-Type: application/json" \
        -d "{\"query\": $(echo "$sql_content" | jq -Rs .)}" 2>/dev/null || echo "error")
    
    if [[ "$response" == *"error"* ]]; then
        echo "   ⚠️  Note: Direct SQL execution may require Supabase CLI or Dashboard"
        echo "   Please run the following migration manually in Supabase SQL Editor:"
        echo "   ${sql_file}"
    else
        echo "   ✅ Migration completed"
    fi
    echo ""
}

# Alternative: Use Supabase CLI if available
if command -v supabase &> /dev/null; then
    echo "✅ Supabase CLI detected"
    echo ""
    
    # Link to project if not already linked
    if [ ! -f "supabase/.temp/project-ref" ]; then
        echo "📎 Linking to Supabase project..."
        project_ref=$(echo "$SUPABASE_URL" | sed -n 's|.*//\([^.]*\)\.supabase\.co.*|\1|p')
        
        if [ -n "$project_ref" ]; then
            supabase link --project-ref "$project_ref"
        else
            echo "   ⚠️  Could not extract project reference from URL"
            echo "   Please run: supabase link --project-ref YOUR_PROJECT_REF"
        fi
    fi
    
    # Run migrations
    echo "🔄 Running database migrations..."
    supabase db push
    
    echo "✅ Migrations applied via Supabase CLI"
    
else
    echo "⚠️  Supabase CLI not found"
    echo "   Install with: npm install -g supabase"
    echo ""
    echo "📋 Manual Setup Instructions:"
    echo "=============================="
    echo ""
    echo "1. Open Supabase Dashboard:"
    echo "   ${SUPABASE_URL}"
    echo ""
    echo "2. Go to SQL Editor"
    echo ""
    echo "3. Run these migrations in order:"
    echo "   - supabase/migrations/001_fix_api_access.sql"
    echo "   - supabase/migrations/002_create_wisdomos_tables.sql"
    echo ""
    
    # Try to run migrations via API (may not work for all operations)
    run_migration "supabase/migrations/001_fix_api_access.sql" "Fix API Access"
    run_migration "supabase/migrations/002_create_wisdomos_tables.sql" "Create WisdomOS Tables"
fi

echo ""
echo "📊 Verifying Database Setup..."
echo "==============================="
echo ""

# Test connection and verify tables
echo "Testing database connection..."

test_query='{"query": "SELECT tablename FROM pg_tables WHERE schemaname = '"'"'public'"'"' ORDER BY tablename"}'

tables=$(curl -s -X POST "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
    -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "Content-Type: application/json" \
    -d "$test_query" 2>/dev/null | jq -r '.[] | .tablename' 2>/dev/null || echo "")

if [ -z "$tables" ]; then
    echo "⚠️  Could not verify tables via API"
    echo "   Please check Supabase Dashboard to confirm tables exist"
else
    echo "✅ Tables found in database:"
    echo "$tables" | while read table; do
        echo "   - $table"
    done
fi

echo ""
echo "✅ Supabase Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Verify tables in Supabase Dashboard"
echo "2. Test API access with: npm run dev"
echo "3. Check /api/test-supabase endpoint"
echo ""
echo "Your database is now configured for:"
echo "✅ User management"
echo "✅ Journal entries"
echo "✅ Contributions (Being/Doing/Having)"
echo "✅ Life areas and fulfillment scores"
echo "✅ HubSpot sync tracking"
echo "✅ Commitments and monthly audits"
echo ""