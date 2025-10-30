#!/bin/bash

# HubSpot Integration Setup Script
# Run this to initialize or repair the HubSpot integration

set -e

echo "🚀 WisdomOS HubSpot Integration Setup"
echo "======================================"
echo ""

# Check for required environment variables
check_env() {
    if [ -z "$HUBSPOT_PRIVATE_APP_TOKEN" ]; then
        echo "❌ HUBSPOT_PRIVATE_APP_TOKEN not set"
        echo "   Please add it to your .env file"
        exit 1
    fi
    
    if [ -z "$WISDOMOS_BASE_URL" ] && [ -z "$NEXT_PUBLIC_SITE_URL" ]; then
        echo "❌ WISDOMOS_BASE_URL or NEXT_PUBLIC_SITE_URL not set"
        echo "   Please add one to your .env file"
        exit 1
    fi
    
    echo "✅ Environment variables configured"
    echo ""
}

# Step 1: Health Check
health_check() {
    echo "Step 1: Validating HubSpot connection..."
    echo "-----------------------------------------"
    npx tsx scripts/hubspot/healthCheck.ts
    
    if [ $? -ne 0 ]; then
        echo "❌ Health check failed. Please fix the issues above and try again."
        exit 1
    fi
    echo ""
}

# Step 2: Subscribe Webhooks
subscribe_webhooks() {
    echo "Step 2: Configuring webhook subscriptions..."
    echo "--------------------------------------------"
    npx tsx scripts/hubspot/subscribeWebhooks.ts
    
    if [ $? -ne 0 ]; then
        echo "⚠️  Webhook subscription had issues. You may need to configure manually."
    fi
    echo ""
}

# Step 3: Run Backfill
run_backfill() {
    echo "Step 3: Backfilling historical data..."
    echo "--------------------------------------"
    
    # Default to last 3 days if SYNC_SINCE not set
    if [ -z "$SYNC_SINCE" ]; then
        SYNC_SINCE=$(date -u -d "3 days ago" '+%Y-%m-%dT%H:%M:%SZ' 2>/dev/null || \
                    date -u -v-3d '+%Y-%m-%dT%H:%M:%SZ')
        echo "Using default sync date: $SYNC_SINCE"
    fi
    
    echo "Running dry run first..."
    npx tsx scripts/hubspot/backfill.ts --since "$SYNC_SINCE" --dry-run
    
    echo ""
    read -p "Proceed with actual backfill? (y/n) " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npx tsx scripts/hubspot/backfill.ts --since "$SYNC_SINCE"
    else
        echo "Skipping backfill."
    fi
    echo ""
}

# Step 4: Start Heartbeat Monitor
start_heartbeat() {
    echo "Step 4: Starting heartbeat monitor..."
    echo "-------------------------------------"
    
    # Check if already running
    if pgrep -f "webhookHeartbeat.ts" > /dev/null; then
        echo "✅ Heartbeat monitor is already running"
    else
        echo "Starting heartbeat monitor in background..."
        nohup npx tsx jobs/hubspot/webhookHeartbeat.ts > logs/heartbeat.log 2>&1 &
        echo "✅ Heartbeat monitor started (PID: $!)"
        echo "   Logs: logs/heartbeat.log"
    fi
    echo ""
}

# Step 5: Test Integration
test_integration() {
    echo "Step 5: Testing integration..."
    echo "------------------------------"
    
    # Send test webhook event
    TEST_PAYLOAD='[{
        "eventId": "setup-test-'$(date +%s)'",
        "subscriptionType": "contact.creation",
        "portalId": 123456,
        "objectId": 1,
        "eventType": "contact.creation",
        "occurredAt": '$(date +%s000)'
    }]'
    
    WEBHOOK_URL="${WISDOMOS_BASE_URL:-$NEXT_PUBLIC_SITE_URL}/api/hubspot/webhook"
    
    echo "Sending test event to $WEBHOOK_URL"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d "$TEST_PAYLOAD")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n-1)
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo "✅ Webhook endpoint responding correctly"
    else
        echo "⚠️  Webhook returned status $HTTP_CODE"
        echo "   Response: $BODY"
    fi
    echo ""
}

# Main execution
main() {
    # Create logs directory if it doesn't exist
    mkdir -p logs
    
    # Load environment variables
    if [ -f .env ]; then
        export $(cat .env | grep -v '^#' | xargs)
    fi
    
    if [ -f .env.local ]; then
        export $(cat .env.local | grep -v '^#' | xargs)
    fi
    
    check_env
    health_check
    subscribe_webhooks
    run_backfill
    start_heartbeat
    test_integration
    
    echo "✅ HubSpot Integration Setup Complete!"
    echo ""
    echo "Next steps:"
    echo "1. Verify webhook events are being received"
    echo "2. Check contributions in your Fulfillment Display"
    echo "3. Monitor logs/heartbeat.log for ongoing health"
    echo ""
    echo "Useful commands:"
    echo "  View heartbeat logs:  tail -f logs/heartbeat.log"
    echo "  Run health check:     npx tsx scripts/hubspot/healthCheck.ts"
    echo "  Manual backfill:      npx tsx scripts/hubspot/backfill.ts --since 2025-08-01"
    echo ""
}

# Run main function
main