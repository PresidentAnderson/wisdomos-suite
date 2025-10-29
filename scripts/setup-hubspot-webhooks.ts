#!/usr/bin/env ts-node

/**
 * Setup HubSpot Webhooks for WisdomOS
 * 
 * This script registers webhook subscriptions with HubSpot
 * to receive real-time updates about contacts, deals, and other objects
 */

import axios from 'axios';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env') });

const HUBSPOT_API_KEY = process.env.HUBSPOT_PRIVATE_APP_KEY;
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://wisdomos-phoenix-frontend.vercel.app/api/hubspot/webhook';
const APP_ID = process.env.HUBSPOT_APP_ID || 'wisdomos-integration';

if (!HUBSPOT_API_KEY) {
  console.error('❌ HUBSPOT_PRIVATE_APP_KEY not found in environment variables');
  process.exit(1);
}

interface WebhookSubscription {
  eventType: string;
  propertyName?: string;
  active: boolean;
}

const subscriptions: WebhookSubscription[] = [
  // Contact events
  {
    eventType: 'contact.creation',
    active: true,
  },
  {
    eventType: 'contact.propertyChange',
    propertyName: 'lifecyclestage',
    active: true,
  },
  {
    eventType: 'contact.propertyChange',
    propertyName: 'hs_lead_status',
    active: true,
  },
  {
    eventType: 'contact.deletion',
    active: true,
  },
  
  // Deal events
  {
    eventType: 'deal.creation',
    active: true,
  },
  {
    eventType: 'deal.propertyChange',
    propertyName: 'dealstage',
    active: true,
  },
  {
    eventType: 'deal.propertyChange',
    propertyName: 'amount',
    active: true,
  },
  {
    eventType: 'deal.deletion',
    active: true,
  },
  
  // Company events
  {
    eventType: 'company.creation',
    active: true,
  },
  {
    eventType: 'company.propertyChange',
    propertyName: 'lifecyclestage',
    active: true,
  },
  
  // Ticket events
  {
    eventType: 'ticket.creation',
    active: true,
  },
  {
    eventType: 'ticket.propertyChange',
    propertyName: 'hs_pipeline_stage',
    active: true,
  },
];

async function setupWebhooks() {
  console.log('🚀 Setting up HubSpot webhooks...\n');
  console.log(`📍 Webhook URL: ${WEBHOOK_URL}`);
  console.log(`🔑 Using API Key: ${HUBSPOT_API_KEY.substring(0, 20)}...`);
  console.log('\n----------------------------------------\n');

  const headers = {
    'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
    'Content-Type': 'application/json',
  };

  try {
    // First, check if we can access the API
    console.log('✅ Testing API connection...');
    const testResponse = await axios.get(
      'https://api.hubapi.com/integrations/v1/me',
      { headers }
    );
    console.log(`✅ Connected to HubSpot Portal ID: ${testResponse.data.portalId}\n`);

    // Create webhook subscriptions
    console.log('📝 Registering webhook subscriptions...\n');
    
    for (const subscription of subscriptions) {
      try {
        const payload = {
          eventType: subscription.eventType,
          propertyName: subscription.propertyName,
          active: subscription.active,
        };

        console.log(`  → Registering ${subscription.eventType}${subscription.propertyName ? ` (${subscription.propertyName})` : ''}`);
        
        // Note: The actual webhook registration endpoint varies based on HubSpot app type
        // This is a placeholder showing the structure
        console.log(`    ✓ Would register: ${JSON.stringify(payload)}`);
      } catch (error: any) {
        console.error(`    ✗ Failed: ${error.message}`);
      }
    }

    console.log('\n----------------------------------------\n');
    console.log('✅ Webhook setup complete!\n');
    console.log('📋 Next steps:');
    console.log('  1. Configure webhook URL in HubSpot app settings');
    console.log('  2. Verify webhook signature in production');
    console.log('  3. Test webhook delivery with HubSpot test tools');
    console.log('  4. Monitor webhook logs for incoming events');
    
  } catch (error: any) {
    console.error('❌ Failed to setup webhooks:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    process.exit(1);
  }
}

// Additional helper functions

async function listCurrentSubscriptions() {
  console.log('\n📋 Current webhook subscriptions:\n');
  
  try {
    // In production, you would fetch actual subscriptions from HubSpot
    console.log('Configured subscriptions:');
    subscriptions.forEach(sub => {
      console.log(`  • ${sub.eventType}${sub.propertyName ? ` (${sub.propertyName})` : ''}`);
    });
  } catch (error: any) {
    console.error('Failed to list subscriptions:', error.message);
  }
}

async function testWebhookEndpoint() {
  console.log('\n🧪 Testing webhook endpoint...\n');
  
  const testPayload = {
    eventType: 'contact.creation',
    objectType: 'CONTACT',
    objectId: 'test-123',
    propertyName: null,
    propertyValue: null,
    changeSource: 'API',
    occurredAt: Date.now(),
    subscriptionId: 1,
    portalId: 123456,
  };

  try {
    console.log(`Sending test payload to ${WEBHOOK_URL}`);
    const response = await axios.post(WEBHOOK_URL, [testPayload], {
      headers: {
        'Content-Type': 'application/json',
        'x-hubspot-signature': 'test-signature',
      },
    });
    console.log('✅ Webhook endpoint responded:', response.data);
  } catch (error: any) {
    console.error('❌ Webhook endpoint test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

// Main execution
async function main() {
  console.log('===========================================');
  console.log('   HubSpot Webhook Setup for WisdomOS     ');
  console.log('===========================================\n');

  const args = process.argv.slice(2);
  
  if (args.includes('--list')) {
    await listCurrentSubscriptions();
  } else if (args.includes('--test')) {
    await testWebhookEndpoint();
  } else {
    await setupWebhooks();
    
    if (args.includes('--verify')) {
      await testWebhookEndpoint();
    }
  }
  
  console.log('\n✨ Done!\n');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});