#!/bin/bash
# Deploy WisdomOS MAS to Supabase

set -e

echo "🚀 WisdomOS MAS Deployment to Supabase"
echo "======================================"
echo ""

# Check if we're in the right directory
if [ ! -f "pnpm-workspace.yaml" ]; then
    echo "❌ Error: Must run from wisdomOS root directory"
    exit 1
fi

# Check if supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it:"
    echo "   npm install -g supabase"
    exit 1
fi

echo "📝 Step 1: Checking Supabase project status..."
supabase status || {
    echo "⚠️  Supabase not linked. Linking project..."
    echo "Please provide your project reference ID:"
    read -r PROJECT_REF
    supabase link --project-ref "$PROJECT_REF"
}

echo ""
echo "🗄️  Step 2: Deploying database migrations..."
supabase db push

echo ""
echo "✅ Migrations deployed! Verifying..."
echo ""

# Verify eras
ERA_COUNT=$(supabase db sql "SELECT COUNT(*) FROM fd_eras;" --csv | tail -n 1)
echo "✓ Eras created: $ERA_COUNT (expected 13)"

# Verify area templates
AREA_COUNT=$(supabase db sql "SELECT COUNT(*) FROM fd_area_templates;" --csv | tail -n 1)
echo "✓ Area templates: $AREA_COUNT (expected 10)"

# Verify dimension templates
DIM_COUNT=$(supabase db sql "SELECT COUNT(*) FROM fd_dimension_templates;" --csv | tail -n 1)
echo "✓ Dimension templates: $DIM_COUNT (expected 6)"

echo ""
echo "📦 Step 3: Deploying Edge Functions..."

# Deploy journal-entry function
echo "Deploying journal-entry..."
supabase functions deploy journal-entry

# Deploy orchestrator-poll function
echo "Deploying orchestrator-poll..."
supabase functions deploy orchestrator-poll

echo ""
echo "🔐 Step 4: Setting environment secrets..."
echo "Please provide the following (press Enter to skip):"

read -p "OPENAI_API_KEY: " OPENAI_KEY
if [ -n "$OPENAI_KEY" ]; then
    supabase secrets set OPENAI_API_KEY="$OPENAI_KEY"
fi

read -p "ANTHROPIC_API_KEY: " ANTHROPIC_KEY
if [ -n "$ANTHROPIC_KEY" ]; then
    supabase secrets set ANTHROPIC_API_KEY="$ANTHROPIC_KEY"
fi

echo ""
echo "✅ Deployment Complete!"
echo ""
echo "📊 Quick Stats:"
echo "- Database tables: 26"
echo "- PostgreSQL functions: 3"
echo "- Edge functions: 2"
echo "- Eras (1975-2100): 13"
echo ""
echo "🧪 Test the deployment:"
echo ""
echo "1. Create a test entry:"
echo "   curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/journal-entry \\"
echo "     -H 'Authorization: Bearer YOUR_ANON_KEY' \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"content\":\"I commit to exercising daily\",\"date\":\"2025-10-29\"}'"
echo ""
echo "2. Check the queue_events table:"
echo "   supabase db sql \"SELECT * FROM queue_events ORDER BY created_at DESC LIMIT 5;\""
echo ""
echo "3. Run orchestrator poll:"
echo "   curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/orchestrator-poll \\"
echo "     -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY'"
echo ""
echo "📖 Next steps:"
echo "- Review /docs/agents/README.md for architecture"
echo "- See DEPLOYMENT_STATUS.md for deployment summary"
echo "- Check MAS_AGENT_FACTORY_DELIVERED.md for full delivery report"
echo ""
echo "🎉 Ready to build the future!"
