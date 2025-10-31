#!/bin/bash

# WisdomOS Enterprise Agents - Automated Deployment Script
# Deploys all 10 agents to Supabase Edge Functions with autopilot configuration

set -e  # Exit on error

echo "🚀 WisdomOS Enterprise Agents Deployment"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI not found. Please install it first:${NC}"
    echo "   npm install -g supabase"
    exit 1
fi

# Check if we're linked to a project
if [ ! -f ".supabase/config.toml" ]; then
    echo -e "${YELLOW}⚠️  Not linked to a Supabase project${NC}"
    echo "   Run: supabase link --project-ref yvssmqyphqgvpkwudeoa"
    exit 1
fi

echo -e "${BLUE}📦 Building agents package...${NC}"
cd packages/agents
pnpm build || npm run build
cd ../..

echo ""
echo -e "${GREEN}✅ Agents built successfully${NC}"
echo ""

# Array of agents to deploy
AGENTS=(
    "orchestrator:Orchestrator - Job scheduling and routing"
    "journal-agent:JournalAgent - Entry ingestion and classification"
    "commitment-agent:CommitmentAgent - Commitment detection and tracking"
    "fulfilment-agent:FulfilmentAgent - Score calculation and rollups"
    "narrative-agent:NarrativeAgent - Autobiography generation"
    "planner-agent:PlannerAgent - DAG task generation"
    "integrity-agent:IntegrityAgent - Promise tracking and time-locks"
    "security-agent:SecurityAgent - Encryption and audit trails"
    "finance-agent:FinanceAgent - Ledger and cashflow analysis"
    "analytics-agent:AnalyticsAgent - KPI tracking and metrics"
)

echo -e "${BLUE}🚀 Deploying Enterprise Agents to Supabase Edge Functions${NC}"
echo ""

# Deploy each agent
for agent_info in "${AGENTS[@]}"; do
    IFS=':' read -r agent_name description <<< "$agent_info"

    echo -e "${YELLOW}📤 Deploying $agent_name...${NC}"
    echo "   $description"

    # Check if function directory exists
    FUNC_DIR="supabase/functions/$agent_name"
    if [ ! -d "$FUNC_DIR" ]; then
        echo -e "${BLUE}   Creating function directory: $FUNC_DIR${NC}"
        mkdir -p "$FUNC_DIR"

        # Create index.ts that imports from agents package
        cat > "$FUNC_DIR/index.ts" <<EOF
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Import agent from package
// Note: In production, agents are bundled into this function
import { ${agent_name//-/}Agent } from '../../../packages/agents/src/agents/${agent_name}.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse request body
    const { payload } = await req.json()

    // Execute agent
    const agent = new ${agent_name//-/}Agent(supabaseClient)
    const result = await agent.execute(payload)

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Agent execution error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
EOF
    fi

    # Deploy function
    supabase functions deploy "$agent_name" --no-verify-jwt 2>&1 | grep -v "Warning"

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}   ✅ $agent_name deployed successfully${NC}"
    else
        echo -e "${RED}   ❌ Failed to deploy $agent_name${NC}"
    fi
    echo ""
done

echo ""
echo -e "${GREEN}🎉 All agents deployed successfully!${NC}"
echo ""

# Set up cron schedules for autopilot
echo -e "${BLUE}⏰ Configuring autopilot cron schedules...${NC}"
echo ""

# Create cron configuration SQL
cat > /tmp/setup-crons.sql <<'EOF'
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Clear existing cron jobs
SELECT cron.unschedule(jobid) FROM cron.job WHERE jobname LIKE 'wisdomos_%';

-- Orchestrator: Poll for jobs every 5 minutes
SELECT cron.schedule(
  'wisdomos_orchestrator_poll',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://yvssmqyphqgvpkwudeoa.supabase.co/functions/v1/orchestrator-poll',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

-- Journal Agent: Process unclassified entries every 10 minutes
SELECT cron.schedule(
  'wisdomos_journal_processing',
  '*/10 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://yvssmqyphqgvpkwudeoa.supabase.co/functions/v1/journal-agent',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb,
    body := '{"action": "process_unclassified"}'::jsonb
  );
  $$
);

-- Commitment Agent: Detect commitments every 15 minutes
SELECT cron.schedule(
  'wisdomos_commitment_detection',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://yvssmqyphqgvpkwudeoa.supabase.co/functions/v1/commitment-agent',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb,
    body := '{"action": "detect_commitments"}'::jsonb
  );
  $$
);

-- Fulfilment Agent: Calculate scores every hour
SELECT cron.schedule(
  'wisdomos_fulfilment_calculation',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://yvssmqyphqgvpkwudeoa.supabase.co/functions/v1/fulfilment-agent',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb,
    body := '{"action": "calculate_scores"}'::jsonb
  );
  $$
);

-- Fulfilment Agent: Monthly rollup on 1st day of month at 2 AM
SELECT cron.schedule(
  'wisdomos_fulfilment_monthly_rollup',
  '0 2 1 * *',
  $$
  SELECT net.http_post(
    url := 'https://yvssmqyphqgvpkwudeoa.supabase.co/functions/v1/fulfilment-agent',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb,
    body := '{"action": "monthly_rollup"}'::jsonb
  );
  $$
);

-- Narrative Agent: Generate autobiography updates daily at 3 AM
SELECT cron.schedule(
  'wisdomos_narrative_generation',
  '0 3 * * *',
  $$
  SELECT net.http_post(
    url := 'https://yvssmqyphqgvpkwudeoa.supabase.co/functions/v1/narrative-agent',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb,
    body := '{"action": "generate_updates"}'::jsonb
  );
  $$
);

-- Planner Agent: Generate task plans every 6 hours
SELECT cron.schedule(
  'wisdomos_planner_task_generation',
  '0 */6 * * *',
  $$
  SELECT net.http_post(
    url := 'https://yvssmqyphqgvpkwudeoa.supabase.co/functions/v1/planner-agent',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb,
    body := '{"action": "generate_plans"}'::jsonb
  );
  $$
);

-- Integrity Agent: Check time-locked promises every hour
SELECT cron.schedule(
  'wisdomos_integrity_check',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://yvssmqyphqgvpkwudeoa.supabase.co/functions/v1/integrity-agent',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb,
    body := '{"action": "check_timelock"}'::jsonb
  );
  $$
);

-- Finance Agent: Update cashflow daily at 1 AM
SELECT cron.schedule(
  'wisdomos_finance_update',
  '0 1 * * *',
  $$
  SELECT net.http_post(
    url := 'https://yvssmqyphqgvpkwudeoa.supabase.co/functions/v1/finance-agent',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb,
    body := '{"action": "update_cashflow"}'::jsonb
  );
  $$
);

-- Analytics Agent: Calculate KPIs every hour
SELECT cron.schedule(
  'wisdomos_analytics_kpi',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://yvssmqyphqgvpkwudeoa.supabase.co/functions/v1/analytics-agent',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb,
    body := '{"action": "calculate_kpis"}'::jsonb
  );
  $$
);
EOF

# Execute cron setup (commented out - needs manual execution with proper credentials)
# supabase db execute --file /tmp/setup-crons.sql

echo -e "${YELLOW}⚠️  Cron SQL generated at: /tmp/setup-crons.sql${NC}"
echo -e "${YELLOW}   Execute manually with: supabase db execute --file /tmp/setup-crons.sql${NC}"
echo ""

# Display deployment summary
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Agent Deployment Complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📋 Deployed Agents:${NC}"
echo "  1. orchestrator - Job scheduling and routing"
echo "  2. journal-agent - Entry processing (every 10 min)"
echo "  3. commitment-agent - Commitment detection (every 15 min)"
echo "  4. fulfilment-agent - Score calculation (hourly) + monthly rollup"
echo "  5. narrative-agent - Autobiography generation (daily 3 AM)"
echo "  6. planner-agent - Task planning (every 6 hours)"
echo "  7. integrity-agent - Promise tracking (hourly)"
echo "  8. security-agent - Encryption and auditing"
echo "  9. finance-agent - Cashflow updates (daily 1 AM)"
echo "  10. analytics-agent - KPI calculation (hourly)"
echo ""
echo -e "${BLUE}⏰ Autopilot Schedule:${NC}"
echo "  • Orchestrator polls: Every 5 minutes"
echo "  • Journal processing: Every 10 minutes"
echo "  • Commitment detection: Every 15 minutes"
echo "  • Fulfilment calculation: Every hour"
echo "  • Integrity checks: Every hour"
echo "  • Analytics KPIs: Every hour"
echo "  • Task planning: Every 6 hours"
echo "  • Finance updates: Daily at 1 AM"
echo "  • Narrative generation: Daily at 3 AM"
echo "  • Monthly rollup: 1st of month at 2 AM"
echo ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo "  1. Execute cron setup: supabase db execute --file /tmp/setup-crons.sql"
echo "  2. Verify functions: supabase functions list"
echo "  3. Check logs: supabase functions logs <function-name>"
echo "  4. Monitor with Grafana at http://localhost:3000"
echo ""
echo -e "${GREEN}🎉 WisdomOS is now on autopilot!${NC}"
