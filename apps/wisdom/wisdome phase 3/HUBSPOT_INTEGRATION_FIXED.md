# HubSpot Integration - Complete Implementation

## Overview
This document describes the complete HubSpot → WisdomOS integration implementation with webhook signature verification, queue processing, and incremental sync capabilities.

## Implementation Status ✅

### 1. Webhook Endpoint with v3 Signature Verification ✅
- **Route:** `POST /api/integrations/hubspot/webhook`
- **Location:** `apps/api/src/hubspot/hubspot-webhook.controller.ts`
- **Features:**
  - HMAC-SHA256 signature verification
  - Raw body middleware for signature validation
  - Fast acknowledgment (200 response immediately)
  - Event queuing for async processing

### 2. Queue System ✅
- **Service:** `HubSpotQueueService`
- **Location:** `apps/api/src/hubspot/hubspot-queue.service.ts`
- **Features:**
  - In-memory queue with coalescing (120s window)
  - Dead Letter Queue (DLQ) for failed events
  - Event debouncing by objectType:objectId
  - Statistics tracking (processed/failed counts)

### 3. HubSpot Sync Service ✅
- **Service:** `HubSpotSyncService`
- **Location:** `apps/api/src/hubspot/hubspot-sync.service.ts`
- **Features:**
  - Incremental sync with cursor support
  - Rate limiting with automatic retry
  - Pagination handling
  - Last modified date filtering

### 4. Sync Endpoints ✅
- `POST /api/integrations/hubspot/sync/contacts`
- `POST /api/integrations/hubspot/sync/deals`
- `POST /api/integrations/hubspot/sync/companies`
- `POST /api/integrations/hubspot/sync/tickets`
- `POST /api/integrations/hubspot/sync/all`

### 5. Health Check Endpoint ✅
- **Route:** `GET /api/integrations/hubspot/health`
- **Response:**
```json
{
  "connected": true,
  "configured": true,
  "apiConnected": true,
  "webhookStatus": "connected",
  "lastWebhook": "2025-08-22T10:30:00Z",
  "queueDepth": 5,
  "dlqDepth": 0,
  "processedTotal": 150,
  "failedTotal": 2
}
```

### 6. Contribution Mapping ✅
- **Contacts → Being:** Professional connections and relationships
- **Deals → Doing:** Business activities and progress
- **Companies → Having:** Portfolio and organizational assets
- **Tickets → Doing:** Support and service activities

### 7. Database Schema ✅
- **Migration:** `supabase/migrations/003_hubspot_integration.sql`
- **Tables:**
  - `integration_cursors`: Track sync progress
  - `webhook_events`: Log webhook events
  - `hubspot_relationships`: Entity relationships
  - Extended `contributions` with HubSpot fields

## Environment Variables

Add these to your `.env` file:

```bash
# HubSpot Configuration
HUBSPOT_ACCESS_TOKEN=pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
HUBSPOT_APP_SECRET=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
PUBLIC_BASE_URL=https://your-domain.com

# Optional (for different token names)
HUBSPOT_PRIVATE_APP_TOKEN=${HUBSPOT_ACCESS_TOKEN}
HUBSPOT_PRIVATE_APP_KEY=${HUBSPOT_ACCESS_TOKEN}
```

## HubSpot Setup

### 1. Create Private App
1. Go to HubSpot Settings → Integrations → Private Apps
2. Create new private app
3. Set required scopes:
   - `crm.objects.contacts.read`
   - `crm.objects.deals.read`
   - `crm.objects.companies.read`
   - `crm.objects.tickets.read`
   - `crm.objects.owners.read`

### 2. Configure Webhooks
1. In your private app, go to Webhooks tab
2. Set target URL: `https://your-domain.com/api/integrations/hubspot/webhook`
3. Subscribe to events:
   - `contact.creation`
   - `contact.propertyChange`
   - `deal.creation`
   - `deal.propertyChange`
   - `company.creation`
   - `ticket.creation`

### 3. Get Credentials
- Copy the **Access Token** → `HUBSPOT_ACCESS_TOKEN`
- Copy the **App Secret** → `HUBSPOT_APP_SECRET`

## Testing

### 1. Test Webhook Signature (Local)
```bash
BODY='[{"objectId":"123","objectType":"contact","eventType":"contact.creation"}]'
URL='http://localhost:4000/api/integrations/hubspot/webhook'
SECRET='your-app-secret'

SIG=$(echo -n "POST${URL}${BODY}" | openssl dgst -sha256 -hmac "${SECRET}" -binary | base64)

curl -X POST "${URL}" \
  -H "X-HubSpot-Signature-v3: ${SIG}" \
  -H "Content-Type: application/json" \
  --data "${BODY}"
```

### 2. Test Health Check
```bash
curl http://localhost:4000/api/integrations/hubspot/health
```

### 3. Test Sync
```bash
# Sync contacts
curl -X POST http://localhost:4000/api/integrations/hubspot/sync/contacts \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-user"}'

# Sync all
curl -X POST http://localhost:4000/api/integrations/hubspot/sync/all \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-user"}'
```

## Troubleshooting

### Common Issues

1. **Signature Verification Fails**
   - Check `HUBSPOT_APP_SECRET` is correct
   - Ensure `PUBLIC_BASE_URL` matches the webhook URL exactly
   - Verify raw body is being used (not parsed JSON)

2. **Rate Limiting (429 errors)**
   - The sync service automatically retries with exponential backoff
   - Check HubSpot API limits in your account

3. **Queue Overflow**
   - Monitor queue depth via health endpoint
   - Increase coalesce window if needed
   - Check DLQ for persistent failures

4. **Missing Dependencies**
   ```bash
   npm install @nestjs/axios @nestjs/event-emitter body-parser
   ```

## Production Checklist

- [ ] Set all environment variables
- [ ] Run database migration
- [ ] Configure webhook URL in HubSpot
- [ ] Test webhook signature verification
- [ ] Test sync endpoints
- [ ] Monitor health endpoint
- [ ] Set up error alerting for DLQ
- [ ] Configure log aggregation
- [ ] Set up metrics dashboard

## Architecture Flow

```
HubSpot → Webhook → Signature Verify → Queue → Coalesce → Process → Contribution
                                          ↓
                                        DLQ (on failure)
                                          
Sync API → Paginate → Process → Upsert → Contribution
            ↓
          Cursor (save progress)
```

## Next Steps

1. **Add Prisma Schema** for cursor persistence
2. **Implement proper upsert** by hubspotId
3. **Add metrics collection** (Prometheus/Grafana)
4. **Set up alerting** for webhook failures
5. **Implement retry mechanism** for DLQ items
6. **Add webhook replay** capability
7. **Create admin UI** for monitoring

## Support

For issues or questions:
- Check logs: `docker logs wisdomos-api`
- Monitor health: `/api/integrations/hubspot/health`
- Review DLQ: Check queue service stats
- Verify webhooks: HubSpot dashboard → Private Apps → Webhooks → Activity