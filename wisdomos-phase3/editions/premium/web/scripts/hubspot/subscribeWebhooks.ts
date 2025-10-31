#!/usr/bin/env tsx
/**
 * HubSpot Webhook Subscription Manager
 * Ensures all required webhook topics are subscribed
 */

import axios from 'axios'
import chalk from 'chalk'
import dotenv from 'dotenv'

dotenv.config()

const WEBHOOK_EVENTS = [
  'contact.creation',
  'contact.propertyChange',
  'company.creation',
  'company.propertyChange',
  'deal.creation',
  'deal.propertyChange',
  'ticket.creation',
  'ticket.propertyChange'
]

interface WebhookSubscription {
  id: string
  eventType: string
  propertyName?: string
  active: boolean
  createdAt: string
}

async function subscribeWebhooks(): Promise<void> {
  const token = process.env.HUBSPOT_PRIVATE_APP_TOKEN
  const appId = process.env.HUBSPOT_APP_ID
  const baseUrl = process.env.WISDOMOS_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL
  
  if (!token) {
    console.error(chalk.red('❌ HUBSPOT_PRIVATE_APP_TOKEN not found'))
    process.exit(1)
  }
  
  if (!baseUrl) {
    console.error(chalk.red('❌ WISDOMOS_BASE_URL not found'))
    process.exit(1)
  }

  const webhookUrl = `${baseUrl}/api/hubspot/webhook`
  
  console.log(chalk.blue('🔔 Managing HubSpot Webhook Subscriptions\n'))
  console.log(chalk.gray(`Target URL: ${webhookUrl}\n`))

  try {
    // Get existing subscriptions
    console.log(chalk.blue('📋 Checking existing subscriptions...\n'))
    
    const existingResponse = await axios.get(
      `https://api.hubapi.com/webhooks/v3/${appId}/subscriptions`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    ).catch(() => ({ data: { results: [] } }))
    
    const existing = existingResponse.data.results || []
    const existingTypes = existing.map((sub: any) => sub.eventType)
    
    console.log(chalk.gray(`Found ${existing.length} existing subscriptions\n`))
    
    // Subscribe to missing events
    const toSubscribe = WEBHOOK_EVENTS.filter(event => !existingTypes.includes(event))
    
    if (toSubscribe.length === 0) {
      console.log(chalk.green('✅ All required webhooks are already subscribed!\n'))
    } else {
      console.log(chalk.yellow(`📝 Subscribing to ${toSubscribe.length} new events...\n`))
      
      for (const eventType of toSubscribe) {
        try {
          // Try developer API first
          const devApiUrl = `https://api.hubapi.com/webhooks/v3/${appId}/subscriptions`
          
          const subscription = {
            eventType,
            propertyName: eventType.includes('propertyChange') ? '*' : undefined,
            active: true
          }
          
          await axios.post(devApiUrl, subscription, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
          
          console.log(chalk.green(`  ✓ Subscribed to ${eventType}`))
        } catch (error: any) {
          // Fallback: Manual webhook setup instructions
          console.log(chalk.yellow(`  ⚠️  Could not auto-subscribe to ${eventType}`))
          console.log(chalk.gray(`     Please add manually in HubSpot Settings > Integrations > Webhooks`))
        }
      }
    }
    
    // Create or update webhook target URL
    console.log(chalk.blue('\n🎯 Configuring webhook target URL...\n'))
    
    // For private apps, we need to configure this in the app settings
    // Display instructions for manual configuration
    console.log(chalk.cyan('Manual Configuration Required:\n'))
    console.log(chalk.white('1. Go to HubSpot > Settings > Integrations > Private Apps'))
    console.log(chalk.white(`2. Find your app (ID: ${appId || 'Check HubSpot'})`))
    console.log(chalk.white('3. Go to the "Webhooks" tab'))
    console.log(chalk.white(`4. Set Target URL to: ${chalk.green(webhookUrl)}`))
    console.log(chalk.white('5. Enable the following events:'))
    
    WEBHOOK_EVENTS.forEach(event => {
      console.log(chalk.gray(`   • ${event}`))
    })
    
    // Test webhook endpoint
    console.log(chalk.blue('\n🧪 Testing webhook endpoint...\n'))
    
    try {
      const testPayload = [{
        eventId: 'test-' + Date.now(),
        subscriptionType: 'contact.creation',
        portalId: 123456,
        objectId: 1,
        eventType: 'contact.creation',
        occurredAt: Date.now()
      }]
      
      const testResponse = await axios.post(webhookUrl, testPayload, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000
      })
      
      if (testResponse.status === 200) {
        console.log(chalk.green('✅ Webhook endpoint is responding correctly!\n'))
      } else {
        console.log(chalk.yellow(`⚠️  Webhook endpoint returned status ${testResponse.status}\n`))
      }
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED') {
        console.log(chalk.yellow('⚠️  Webhook endpoint not reachable (app may not be running)\n'))
      } else {
        console.log(chalk.red(`❌ Webhook endpoint test failed: ${error.message}\n`))
      }
    }
    
    // Summary
    console.log(chalk.green('\n✅ Webhook subscription setup complete!\n'))
    console.log(chalk.gray('Next steps:'))
    console.log(chalk.gray('1. Ensure your app is deployed and accessible'))
    console.log(chalk.gray('2. Complete manual configuration in HubSpot if needed'))
    console.log(chalk.gray('3. Run backfill script to sync historical data'))
    console.log(chalk.gray('4. Monitor heartbeat for ongoing health\n'))
    
  } catch (error: any) {
    console.error(chalk.red('\n❌ Subscription failed:'))
    console.error(chalk.red(error.response?.data?.message || error.message))
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  subscribeWebhooks().catch(console.error)
}

export { subscribeWebhooks }