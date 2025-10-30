# HubSpot Integration Guide for WisdomOS

## Overview

This integration connects HubSpot CRM with WisdomOS to automatically create Being/Doing/Having contributions that feed your Fulfillment Display and Assessment Tool.

## Architecture

```
HubSpot → Webhooks → WisdomOS API → Contribution Service → Fulfillment Display
                          ↑
                    Heartbeat Monitor
                    (Auto-reconnect)
```

## Key Components

### 1. **Webhook Endpoint** (`/api/hubspot/webhook`)
- Receives real-time events from HubSpot
- Maps CRM objects to contributions:
  - **Contacts** → Being (relationships)
  - **Deals** → Doing (active work/commitments)
  - **Companies** → Having (assets/contexts)
  - **Tickets** → Doing (tasks/issues)

### 2. **Contribution Service**
- Upserts contributions with idempotency
- Updates Fulfillment Display scores
- Emits events for UI updates

### 3. **Heartbeat Monitor**
- Checks webhook health every 5 minutes
- Auto-reconnects if stale (>15 min)
- Sends alerts on failure

### 4. **Backfill System**
- Syncs historical data from specified date
- Handles pagination and rate limits
- Supports dry-run mode

## Setup Instructions

### Prerequisites

1. **HubSpot Private App** with these scopes:
   - `crm.objects.contacts.read/write`
   - `crm.objects.deals.read/write`
   - `crm.objects.companies.read/write`
   - `crm.objects.tickets.read/write`
   - `webhooks`

2. **Environment Variables** in `.env`:
```env
HUBSPOT_PRIVATE_APP_TOKEN=pat-na1-xxxxx
HUBSPOT_APP_ID=123456
WISDOMOS_BASE_URL=https://your-app.vercel.app
WEBHOOK_SECRET=your-secret-key
SYNC_SINCE=2025-08-20T00:00:00Z
HEARTBEAT_INTERVAL_MIN=5
STALE_MIN=15
```

### Quick Setup

Run the automated setup script:

```bash
cd apps/web
./scripts/hubspot/setup.sh
```

This will:
1. Validate your HubSpot token and scopes
2. Configure webhook subscriptions
3. Backfill historical data
4. Start the heartbeat monitor
5. Test the integration

### Manual Setup

#### Step 1: Health Check
```bash
npx tsx scripts/hubspot/healthCheck.ts
```

#### Step 2: Subscribe Webhooks
```bash
npx tsx scripts/hubspot/subscribeWebhooks.ts
```

Then in HubSpot:
1. Go to Settings > Integrations > Private Apps
2. Find your app
3. Go to Webhooks tab
4. Set Target URL to: `https://your-app.vercel.app/api/hubspot/webhook`
5. Enable all required events

#### Step 3: Backfill Historical Data
```bash
# Dry run first
npx tsx scripts/hubspot/backfill.ts --since 2025-08-20 --dry-run

# Then actual sync
npx tsx scripts/hubspot/backfill.ts --since 2025-08-20
```

#### Step 4: Start Heartbeat Monitor
```bash
# Run in background
nohup npx tsx jobs/hubspot/webhookHeartbeat.ts > logs/heartbeat.log 2>&1 &

# Or use PM2
pm2 start jobs/hubspot/webhookHeartbeat.ts --name hubspot-heartbeat
```

## Testing

### Unit Tests
```bash
npm test tests/integration/hubspot-webhook.spec.ts
```

### Manual Test
Create a test contact in HubSpot and verify:
1. Webhook event received (check logs)
2. Being contribution created
3. Fulfillment Display updated

### Test Webhook Endpoint
```bash
curl -X POST https://your-app.vercel.app/api/hubspot/webhook \
  -H "Content-Type: application/json" \
  -d '[{
    "eventId": "test-123",
    "subscriptionType": "contact.creation",
    "portalId": 123456,
    "objectId": 789,
    "eventType": "contact.creation",
    "occurredAt": 1735689600000
  }]'
```

## Monitoring

### Check Webhook Health
```bash
# View heartbeat logs
tail -f logs/heartbeat.log

# Check last heartbeat
npx tsx -e "
  const hb = JSON.parse(localStorage.getItem('wisdomos_heartbeats') || '[]');
  console.log(hb[hb.length - 1]);
"
```

### View Contributions
```bash
# List recent contributions
npx tsx -e "
  const c = JSON.parse(localStorage.getItem('wisdomos_contributions') || '[]');
  console.table(c.slice(-5));
"
```

## Troubleshooting

### Webhooks Not Receiving Events

1. Check token scopes:
```bash
npx tsx scripts/hubspot/healthCheck.ts
```

2. Verify webhook URL in HubSpot settings

3. Check webhook endpoint is accessible:
```bash
curl https://your-app.vercel.app/api/hubspot/webhook
```

### Stale Webhook Alert

The heartbeat monitor will auto-reconnect. If it fails:

1. Check HubSpot API status
2. Verify token hasn't expired
3. Manually re-subscribe:
```bash
npx tsx scripts/hubspot/subscribeWebhooks.ts
```

### Missing Historical Data

Run backfill for specific date range:
```bash
npx tsx scripts/hubspot/backfill.ts --since 2025-08-01 --types contacts,deals
```

## How It Feeds WisdomOS

### Fulfillment Display
- Each contribution updates relevant life area scores
- Active contributions increase fulfillment
- Archived/closed items decrease urgency

### Assessment Tool
- Live relationships populate assessment criteria
- Deal progress tracks commitment completion
- Company associations provide context

### Example Flow

1. **New Contact Created in HubSpot**
   - Webhook fires `contact.creation` event
   - Creates Being contribution
   - Links to "Relationships" life area
   - Updates Fulfillment score +0.5

2. **Deal Stage Changes**
   - Webhook fires `deal.propertyChange` event
   - Updates Doing contribution
   - Reflects commitment progress
   - Assessment tool shows completion %

3. **Company Associated**
   - Webhook fires `company.propertyChange` event
   - Creates Having contribution
   - Provides context for commitments
   - Enriches relationship data

## Production Deployment

### Vercel
Environment variables are automatically used. Just deploy:
```bash
vercel --prod
```

### Docker
Include in Dockerfile:
```dockerfile
# Install dependencies
RUN npm install axios chalk table

# Copy integration scripts
COPY scripts/hubspot scripts/hubspot
COPY services/contributions services/contributions
COPY jobs/hubspot jobs/hubspot

# Start heartbeat on container start
CMD ["sh", "-c", "npm start & npx tsx jobs/hubspot/webhookHeartbeat.ts"]
```

## Support

For issues or questions:
1. Check logs: `logs/heartbeat.log`
2. Run health check: `npx tsx scripts/hubspot/healthCheck.ts`
3. Review this guide
4. Contact: contact@axaiinovations.com

---

*Built by AXAI Innovations for WisdomOS Phoenix Framework*