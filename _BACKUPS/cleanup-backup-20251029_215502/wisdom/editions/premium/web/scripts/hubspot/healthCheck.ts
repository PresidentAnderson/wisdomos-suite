#!/usr/bin/env tsx
/**
 * HubSpot Health Check
 * Validates token, scopes, and connection status
 */

import axios from 'axios'
import chalk from 'chalk'
import dotenv from 'dotenv'
import { table } from 'table'

dotenv.config()

const REQUIRED_SCOPES = [
  'crm.objects.contacts.read',
  'crm.objects.contacts.write',
  'crm.objects.deals.read',
  'crm.objects.deals.write',
  'crm.objects.companies.read',
  'crm.objects.companies.write',
  'crm.objects.tickets.read',
  'crm.objects.tickets.write',
  'crm.schemas.custom.read',
  'webhooks'
]

interface TokenInfo {
  token: string
  scopes: string[]
  appId: number
  userId: number
  hubId: number
  expiresAt?: string
}

async function checkHealth(): Promise<void> {
  const token = process.env.HUBSPOT_PRIVATE_APP_TOKEN
  
  if (!token) {
    console.error(chalk.red('❌ HUBSPOT_PRIVATE_APP_TOKEN not found in environment'))
    process.exit(1)
  }

  console.log(chalk.blue('🔍 Checking HubSpot connection health...\n'))

  try {
    // Verify token and get info
    const response = await axios.get('https://api.hubapi.com/integrations/v1/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    const tokenInfo: TokenInfo = response.data
    
    // Check account info
    console.log(chalk.green('✅ Token Valid'))
    console.log(chalk.gray(`   Hub ID: ${tokenInfo.hubId}`))
    console.log(chalk.gray(`   App ID: ${tokenInfo.appId || 'N/A'}`))
    console.log(chalk.gray(`   User ID: ${tokenInfo.userId}\n`))

    // Get scopes via private apps endpoint
    const scopesResponse = await axios.get('https://api.hubapi.com/auth/v1/access-tokens/' + token.substring(0, 8), {
      headers: { 'Authorization': `Bearer ${token}` }
    }).catch(() => ({ data: { scopes: tokenInfo.scopes || [] } }))

    const availableScopes = scopesResponse.data.scopes || []
    
    // Check required scopes
    console.log(chalk.blue('📋 Scope Validation:\n'))
    
    const scopeData = [
      ['Scope', 'Required', 'Status']
    ]
    
    const allScopesValid = REQUIRED_SCOPES.every(scope => {
      const hasScope = availableScopes.includes(scope)
      scopeData.push([
        scope,
        'Yes',
        hasScope ? chalk.green('✓') : chalk.red('✗')
      ])
      return hasScope
    })

    // Add available but not required scopes
    availableScopes.forEach((scope: string) => {
      if (!REQUIRED_SCOPES.includes(scope)) {
        scopeData.push([
          scope,
          'No',
          chalk.gray('✓')
        ])
      }
    })

    console.log(table(scopeData))

    // Test API endpoints
    console.log(chalk.blue('🔌 Testing API Endpoints:\n'))
    
    const endpoints = [
      { name: 'Contacts', url: '/crm/v3/objects/contacts?limit=1' },
      { name: 'Companies', url: '/crm/v3/objects/companies?limit=1' },
      { name: 'Deals', url: '/crm/v3/objects/deals?limit=1' },
      { name: 'Tickets', url: '/crm/v3/objects/tickets?limit=1' }
    ]

    const endpointData = [
      ['Endpoint', 'Status', 'Count']
    ]

    for (const endpoint of endpoints) {
      try {
        const testResponse = await axios.get(`https://api.hubapi.com${endpoint.url}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        endpointData.push([
          endpoint.name,
          chalk.green('✓'),
          testResponse.data.total || '0'
        ])
      } catch (error) {
        endpointData.push([
          endpoint.name,
          chalk.red('✗'),
          'N/A'
        ])
      }
    }

    console.log(table(endpointData))

    // Final status
    if (allScopesValid) {
      console.log(chalk.green('\n✅ HubSpot integration is healthy and ready!'))
      
      // Save validated config
      console.log(chalk.gray('\nConfiguration:'))
      console.log(chalk.gray(`  HUBSPOT_PRIVATE_APP_TOKEN: ${token.substring(0, 10)}...`))
      console.log(chalk.gray(`  HUBSPOT_APP_ID: ${process.env.HUBSPOT_APP_ID || 'Not set'}`))
      console.log(chalk.gray(`  WISDOMOS_BASE_URL: ${process.env.WISDOMOS_BASE_URL || 'Not set'}`))
      console.log(chalk.gray(`  WEBHOOK_SECRET: ${process.env.WEBHOOK_SECRET ? 'Set' : 'Not set'}`))
      
    } else {
      console.log(chalk.yellow('\n⚠️  Some required scopes are missing'))
      console.log(chalk.gray('Please update your private app permissions in HubSpot'))
      process.exit(1)
    }

  } catch (error: any) {
    console.error(chalk.red('\n❌ Health check failed:'))
    console.error(chalk.red(error.response?.data?.message || error.message))
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  checkHealth().catch(console.error)
}

export { checkHealth }