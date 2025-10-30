#!/usr/bin/env tsx
/**
 * HubSpot Webhook Heartbeat Monitor
 * Checks webhook health and auto-reconnects if stale
 */

import chalk from 'chalk'
import dotenv from 'dotenv'
import { subscribeWebhooks } from '../../scripts/hubspot/subscribeWebhooks'

dotenv.config()

const HEARTBEAT_INTERVAL_MIN = parseInt(process.env.HEARTBEAT_INTERVAL_MIN || '5')
const STALE_MIN = parseInt(process.env.STALE_MIN || '15')
const MAX_RETRY_ATTEMPTS = 3
const RETRY_DELAYS = [60000, 120000, 240000] // 1m, 2m, 4m

interface Heartbeat {
  source: string
  timestamp: number
  count: number
  status: string
}

interface HeartbeatStore {
  getLastHeartbeat(source: string): Promise<Heartbeat | null>
  saveHeartbeat(heartbeat: Heartbeat): Promise<void>
}

// Simple in-memory store (replace with Redis/DB in production)
class InMemoryHeartbeatStore implements HeartbeatStore {
  private heartbeats: Map<string, Heartbeat> = new Map()
  
  async getLastHeartbeat(source: string): Promise<Heartbeat | null> {
    return this.heartbeats.get(source) || null
  }
  
  async saveHeartbeat(heartbeat: Heartbeat): Promise<void> {
    this.heartbeats.set(heartbeat.source, heartbeat)
  }
}

const store = new InMemoryHeartbeatStore()

async function checkWebhookHealth(): Promise<void> {
  console.log(chalk.blue(`[${new Date().toISOString()}] Checking webhook health...\n`))
  
  const lastHeartbeat = await store.getLastHeartbeat('hubspot_webhook')
  const now = Date.now()
  
  if (!lastHeartbeat) {
    console.log(chalk.yellow('⚠️  No heartbeat found. Assuming first run.\n'))
    await initializeHeartbeat()
    return
  }
  
  const minutesSinceLastBeat = (now - lastHeartbeat.timestamp) / 60000
  
  console.log(chalk.gray(`Last heartbeat: ${new Date(lastHeartbeat.timestamp).toISOString()}`))
  console.log(chalk.gray(`Minutes since: ${minutesSinceLastBeat.toFixed(1)}`))
  console.log(chalk.gray(`Stale threshold: ${STALE_MIN} minutes\n`))
  
  if (minutesSinceLastBeat > STALE_MIN) {
    console.log(chalk.red(`❌ Webhook is stale! Last heartbeat was ${minutesSinceLastBeat.toFixed(1)} minutes ago\n`))
    await handleStaleWebhook()
  } else {
    console.log(chalk.green(`✅ Webhook is healthy\n`))
    
    // Update status
    await store.saveHeartbeat({
      ...lastHeartbeat,
      status: 'healthy'
    })
  }
}

async function initializeHeartbeat(): Promise<void> {
  console.log(chalk.blue('Initializing heartbeat...\n'))
  
  await store.saveHeartbeat({
    source: 'hubspot_webhook',
    timestamp: Date.now(),
    count: 0,
    status: 'initialized'
  })
  
  // Ensure webhooks are subscribed
  try {
    await subscribeWebhooks()
    console.log(chalk.green('✅ Webhooks initialized\n'))
  } catch (error) {
    console.error(chalk.red('❌ Failed to initialize webhooks:'), error)
  }
}

async function handleStaleWebhook(): Promise<void> {
  console.log(chalk.yellow('🔄 Attempting to reconnect webhooks...\n'))
  
  let attempt = 0
  let success = false
  
  while (attempt < MAX_RETRY_ATTEMPTS && !success) {
    attempt++
    console.log(chalk.gray(`Attempt ${attempt}/${MAX_RETRY_ATTEMPTS}...\n`))
    
    try {
      // Re-subscribe webhooks
      await subscribeWebhooks()
      
      // Test webhook endpoint
      const testSuccess = await testWebhookEndpoint()
      
      if (testSuccess) {
        success = true
        console.log(chalk.green('✅ Webhooks reconnected successfully!\n'))
        
        // Update heartbeat
        await store.saveHeartbeat({
          source: 'hubspot_webhook',
          timestamp: Date.now(),
          count: 0,
          status: 'reconnected'
        })
        
        // Send notification (implement based on your notification system)
        await sendNotification(
          'success',
          'HubSpot webhooks reconnected',
          `Webhooks were stale and have been successfully reconnected after ${attempt} attempt(s).`
        )
      } else {
        throw new Error('Webhook endpoint test failed')
      }
      
    } catch (error: any) {
      console.error(chalk.red(`❌ Reconnection attempt ${attempt} failed:`), error.message)
      
      if (attempt < MAX_RETRY_ATTEMPTS) {
        const delay = RETRY_DELAYS[attempt - 1]
        console.log(chalk.yellow(`⏳ Waiting ${delay / 60000} minutes before retry...\n`))
        await sleep(delay)
      }
    }
  }
  
  if (!success) {
    console.error(chalk.red('❌ Failed to reconnect webhooks after all attempts!\n'))
    
    // Send alert
    await sendNotification(
      'error',
      'HubSpot webhook reconnection failed',
      `Webhooks have been stale for over ${STALE_MIN} minutes and reconnection failed after ${MAX_RETRY_ATTEMPTS} attempts. Manual intervention required.`
    )
    
    // Update heartbeat status
    await store.saveHeartbeat({
      source: 'hubspot_webhook',
      timestamp: Date.now(),
      count: 0,
      status: 'failed'
    })
  }
}

async function testWebhookEndpoint(): Promise<boolean> {
  const baseUrl = process.env.WISDOMOS_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL
  
  if (!baseUrl) {
    console.warn(chalk.yellow('⚠️  WISDOMOS_BASE_URL not set, skipping endpoint test'))
    return true // Assume success if we can't test
  }
  
  try {
    const testPayload = [{
      eventId: 'heartbeat-test-' + Date.now(),
      subscriptionType: 'heartbeat.test',
      portalId: 0,
      objectId: 0,
      eventType: 'heartbeat.test',
      occurredAt: Date.now()
    }]
    
    const response = await fetch(`${baseUrl}/api/hubspot/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPayload)
    })
    
    return response.ok
  } catch (error) {
    console.error(chalk.red('Webhook endpoint test error:'), error)
    return false
  }
}

async function sendNotification(
  level: 'success' | 'warning' | 'error',
  title: string,
  message: string
): Promise<void> {
  // Implement based on your notification system
  // Examples: Slack, email, PagerDuty, etc.
  
  console.log(chalk.blue('\n📬 Notification:'))
  console.log(chalk.gray(`Level: ${level}`))
  console.log(chalk.gray(`Title: ${title}`))
  console.log(chalk.gray(`Message: ${message}\n`))
  
  // Example: Send to Slack webhook
  const slackWebhook = process.env.SLACK_WEBHOOK_URL
  if (slackWebhook) {
    try {
      await fetch(slackWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `${level === 'error' ? '🚨' : level === 'warning' ? '⚠️' : '✅'} *${title}*\n${message}`
        })
      })
    } catch (error) {
      console.error('Failed to send Slack notification:', error)
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Cron job runner
async function runHeartbeatCheck(): Promise<void> {
  console.log(chalk.blue('💓 HubSpot Webhook Heartbeat Monitor\n'))
  console.log(chalk.gray(`Interval: ${HEARTBEAT_INTERVAL_MIN} minutes`))
  console.log(chalk.gray(`Stale threshold: ${STALE_MIN} minutes\n`))
  
  // Run immediately
  await checkWebhookHealth()
  
  // Schedule regular checks
  setInterval(async () => {
    await checkWebhookHealth()
  }, HEARTBEAT_INTERVAL_MIN * 60 * 1000)
  
  console.log(chalk.green(`\n✅ Heartbeat monitor running (checking every ${HEARTBEAT_INTERVAL_MIN} minutes)\n`))
}

// Export for use in cron scheduler
export { checkWebhookHealth, store }

// Run if called directly
if (require.main === module) {
  runHeartbeatCheck().catch(error => {
    console.error(chalk.red('Fatal error:'), error)
    process.exit(1)
  })
}