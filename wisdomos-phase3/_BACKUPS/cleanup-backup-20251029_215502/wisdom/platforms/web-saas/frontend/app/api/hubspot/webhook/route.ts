import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { upsertFromHubSpot } from '@/services/contributions/upsertFromHubSpot'
import { metrics } from '@/lib/monitoring/metrics'

interface HubSpotEvent {
  eventId: string
  subscriptionType: string
  portalId: number
  objectId: number
  propertyName?: string
  propertyValue?: any
  changeSource: string
  eventType: string
  occurredAt: number
}

// Store processed event IDs to prevent duplicates (in production, use Redis/DB)
const processedEvents = new Set<string>()

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    
    // Verify webhook signature if secret is set
    const webhookSecret = process.env.WEBHOOK_SECRET
    if (webhookSecret) {
      const signature = request.headers.get('x-hubspot-signature-v3')
      if (!verifyWebhookSignature(body, signature || '', webhookSecret)) {
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        )
      }
    }

    const events: HubSpotEvent[] = JSON.parse(body)
    
    if (!Array.isArray(events)) {
      return NextResponse.json(
        { error: 'Invalid payload format' },
        { status: 400 }
      )
    }

    const results = {
      processed: 0,
      skipped: 0,
      errors: 0,
      contributions: [] as any[]
    }

    // Process events in batch
    for (const event of events) {
      try {
        // Skip if already processed (idempotency)
        if (processedEvents.has(event.eventId)) {
          results.skipped++
          continue
        }

        // Map event to contribution
        const contribution = await processEventToContribution(event)
        
        if (contribution) {
          results.contributions.push(contribution)
          results.processed++
        } else {
          results.skipped++
        }

        // Mark as processed
        processedEvents.add(event.eventId)
        
        // Clean up old event IDs (keep last 10000)
        if (processedEvents.size > 10000) {
          const oldestIds = Array.from(processedEvents).slice(0, 1000)
          oldestIds.forEach(id => processedEvents.delete(id))
        }

      } catch (error) {
        console.error(`Error processing event ${event.eventId}:`, error)
        results.errors++
      }
    }

    // Record heartbeat
    await recordHeartbeat('hubspot_webhook', results.processed)
    
    // Track metrics
    await metrics.trackHubSpotSync('webhook', results.processed)
    if (results.errors > 0) {
      await metrics.event(
        'HubSpot Webhook Errors',
        `${results.errors} errors occurred processing webhook batch`,
        'warning'
      )
    }

    // Log batch summary
    console.log(`[HubSpot Webhook] Batch processed:`, {
      total: events.length,
      processed: results.processed,
      skipped: results.skipped,
      errors: results.errors,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      ok: true,
      results
    })

  } catch (error) {
    console.error('[HubSpot Webhook] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  const hash = crypto
    .createHmac('sha256', secret)
    .update('POST' + 'https://your-domain.com/api/hubspot/webhook' + body)
    .digest('hex')
  
  return `v3=${hash}` === signature
}

async function processEventToContribution(event: HubSpotEvent) {
  // Extract entity type from subscription type
  const [objectType, eventType] = event.subscriptionType.split('.')
  
  // Map HubSpot object types to our entity types
  const entityMap: Record<string, string> = {
    'contact': 'contact',
    'company': 'company',
    'deal': 'deal',
    'ticket': 'ticket'
  }

  const entity = entityMap[objectType]
  if (!entity) {
    console.warn(`Unknown object type: ${objectType}`)
    return null
  }

  // Fetch full object data from HubSpot if needed
  const objectData = await fetchHubSpotObject(entity, event.objectId.toString())
  
  if (!objectData) {
    return null
  }

  // Create contribution using shared service
  const contribution = await upsertFromHubSpot({
    source: 'hubspot',
    entity: entity as any,
    id: event.objectId.toString(),
    properties: objectData.properties,
    associations: objectData.associations,
    updatedAt: new Date(event.occurredAt).toISOString()
  })

  return contribution
}

async function fetchHubSpotObject(objectType: string, objectId: string) {
  const token = process.env.HUBSPOT_PRIVATE_APP_TOKEN
  
  if (!token) {
    console.error('HUBSPOT_PRIVATE_APP_TOKEN not configured')
    return null
  }

  try {
    const response = await fetch(
      `https://api.hubapi.com/crm/v3/objects/${objectType}/${objectId}?associations=contacts,companies,deals`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`HubSpot API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error fetching ${objectType} ${objectId}:`, error)
    return null
  }
}

async function recordHeartbeat(source: string, count: number) {
  try {
    // Store heartbeat in local storage or database
    const heartbeat = {
      source,
      timestamp: Date.now(),
      count,
      status: 'healthy'
    }
    
    // In production, store this in database
    if (typeof window !== 'undefined') {
      const heartbeats = JSON.parse(
        localStorage.getItem('wisdomos_heartbeats') || '[]'
      )
      heartbeats.push(heartbeat)
      
      // Keep only last 100 heartbeats
      if (heartbeats.length > 100) {
        heartbeats.splice(0, heartbeats.length - 100)
      }
      
      localStorage.setItem('wisdomos_heartbeats', JSON.stringify(heartbeats))
    }
    
    console.log(`[Heartbeat] Recorded for ${source}:`, heartbeat)
  } catch (error) {
    console.error('[Heartbeat] Error recording:', error)
  }
}