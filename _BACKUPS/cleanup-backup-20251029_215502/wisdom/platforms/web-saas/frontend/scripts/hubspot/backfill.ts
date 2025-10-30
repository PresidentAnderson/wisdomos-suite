#!/usr/bin/env tsx
/**
 * HubSpot Backfill Script
 * Syncs historical data from a specific date
 */

import axios from 'axios'
import chalk from 'chalk'
import dotenv from 'dotenv'
import { batchUpsertFromHubSpot, InboundPayload } from '../../services/contributions/upsertFromHubSpot'

dotenv.config()

interface BackfillOptions {
  since?: string
  objectTypes?: string[]
  limit?: number
  dryRun?: boolean
}

interface BackfillStats {
  contacts: number
  companies: number
  deals: number
  tickets: number
  total: number
  errors: number
}

const DEFAULT_SINCE = process.env.SYNC_SINCE || '2025-08-20T00:00:00Z'
const DEFAULT_LIMIT = 100

async function backfill(options: BackfillOptions = {}): Promise<void> {
  const {
    since = DEFAULT_SINCE,
    objectTypes = ['contacts', 'companies', 'deals', 'tickets'],
    limit = DEFAULT_LIMIT,
    dryRun = false
  } = options
  
  const token = process.env.HUBSPOT_PRIVATE_APP_TOKEN
  
  if (!token) {
    console.error(chalk.red('❌ HUBSPOT_PRIVATE_APP_TOKEN not found'))
    process.exit(1)
  }
  
  console.log(chalk.blue('🔄 Starting HubSpot Backfill\n'))
  console.log(chalk.gray(`Since: ${since}`))
  console.log(chalk.gray(`Object Types: ${objectTypes.join(', ')}`))
  console.log(chalk.gray(`Batch Limit: ${limit}`))
  console.log(chalk.gray(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}\n`))
  
  const stats: BackfillStats = {
    contacts: 0,
    companies: 0,
    deals: 0,
    tickets: 0,
    total: 0,
    errors: 0
  }
  
  const sinceTimestamp = new Date(since).getTime()
  
  for (const objectType of objectTypes) {
    console.log(chalk.blue(`\n📦 Processing ${objectType}...\n`))
    
    try {
      const records = await fetchModifiedRecords(
        token,
        objectType,
        sinceTimestamp,
        limit
      )
      
      console.log(chalk.gray(`  Found ${records.length} modified ${objectType}\n`))
      
      if (records.length > 0 && !dryRun) {
        // Convert to contribution payloads
        const payloads: InboundPayload[] = records.map(record => ({
          source: 'hubspot' as const,
          entity: objectType.slice(0, -1) as any, // Remove 's' from plural
          id: record.id,
          properties: record.properties,
          associations: record.associations || {},
          updatedAt: record.properties.hs_lastmodifieddate || 
                    record.properties.updatedat || 
                    new Date().toISOString()
        }))
        
        // Batch upsert contributions
        console.log(chalk.gray(`  Upserting ${payloads.length} contributions...`))
        
        const contributions = await batchUpsertFromHubSpot(payloads)
        
        // Update stats
        const statKey = objectType as keyof BackfillStats
        if (statKey in stats && typeof stats[statKey] === 'number') {
          (stats as any)[statKey] = contributions.length
          stats.total += contributions.length
        }
        
        console.log(chalk.green(`  ✓ Processed ${contributions.length} ${objectType}\n`))
      } else if (dryRun) {
        console.log(chalk.yellow(`  [DRY RUN] Would process ${records.length} ${objectType}\n`))
        const statKey = objectType as keyof BackfillStats
        if (statKey in stats && typeof stats[statKey] === 'number') {
          (stats as any)[statKey] = records.length
          stats.total += records.length
        }
      }
      
    } catch (error: any) {
      console.error(chalk.red(`  ❌ Error processing ${objectType}:`))
      console.error(chalk.red(`     ${error.message}\n`))
      stats.errors++
    }
  }
  
  // Print summary
  console.log(chalk.blue('\n📊 Backfill Summary:\n'))
  console.log(chalk.white(`  Contacts:  ${stats.contacts}`))
  console.log(chalk.white(`  Companies: ${stats.companies}`))
  console.log(chalk.white(`  Deals:     ${stats.deals}`))
  console.log(chalk.white(`  Tickets:   ${stats.tickets}`))
  console.log(chalk.white(`  ─────────────────`))
  console.log(chalk.green(`  Total:     ${stats.total}`))
  
  if (stats.errors > 0) {
    console.log(chalk.red(`  Errors:    ${stats.errors}`))
  }
  
  if (dryRun) {
    console.log(chalk.yellow('\n⚠️  This was a dry run. No data was actually synced.'))
    console.log(chalk.yellow('Remove --dry-run flag to perform actual sync.\n'))
  } else {
    console.log(chalk.green('\n✅ Backfill complete!\n'))
  }
}

async function fetchModifiedRecords(
  token: string,
  objectType: string,
  sinceTimestamp: number,
  limit: number
): Promise<any[]> {
  const allRecords: any[] = []
  let after: string | undefined = undefined
  let hasMore = true
  
  while (hasMore && allRecords.length < limit * 10) { // Max 10 pages
    const searchPayload = {
      filterGroups: [{
        filters: [{
          propertyName: 'hs_lastmodifieddate',
          operator: 'GTE',
          value: sinceTimestamp.toString()
        }]
      }],
      sorts: [{
        propertyName: 'hs_lastmodifieddate',
        direction: 'ASCENDING'
      }],
      properties: [
        'hs_lastmodifieddate',
        'createdate',
        'hs_object_id'
      ],
      limit,
      after
    }
    
    // Add object-specific properties
    switch (objectType) {
      case 'contacts':
        searchPayload.properties.push(
          'firstname', 'lastname', 'email', 
          'phone', 'company', 'jobtitle'
        )
        break
      case 'companies':
        searchPayload.properties.push(
          'name', 'domain', 'industry',
          'city', 'country', 'numberofemployees'
        )
        break
      case 'deals':
        searchPayload.properties.push(
          'dealname', 'amount', 'dealstage',
          'closedate', 'pipeline'
        )
        break
      case 'tickets':
        searchPayload.properties.push(
          'subject', 'content', 'hs_pipeline_stage',
          'hs_ticket_priority', 'hs_ticket_category'
        )
        break
    }
    
    try {
      const response = await axios.post(
        `https://api.hubapi.com/crm/v3/objects/${objectType}/search`,
        searchPayload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )
      
      const { results, paging } = response.data
      
      allRecords.push(...results)
      
      if (paging?.next?.after) {
        after = paging.next.after
      } else {
        hasMore = false
      }
      
      // Progress indicator
      process.stdout.write(chalk.gray(`  Fetched ${allRecords.length} records...\r`))
      
    } catch (error: any) {
      console.error(chalk.red(`\n  Error fetching ${objectType}:`))
      throw error
    }
  }
  
  // Clear progress line
  process.stdout.write('                                        \r')
  
  return allRecords
}

// Parse command line arguments
function parseArgs(): BackfillOptions {
  const args = process.argv.slice(2)
  const options: BackfillOptions = {}
  
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--since':
        options.since = args[++i]
        break
      case '--types':
        options.objectTypes = args[++i].split(',')
        break
      case '--limit':
        options.limit = parseInt(args[++i])
        break
      case '--dry-run':
        options.dryRun = true
        break
      case '--help':
        console.log(`
Usage: tsx backfill.ts [options]

Options:
  --since <date>     Start date for backfill (ISO 8601)
  --types <list>     Comma-separated object types (contacts,companies,deals,tickets)
  --limit <number>   Batch size limit (default: 100)
  --dry-run         Preview without making changes
  --help           Show this help message

Examples:
  tsx backfill.ts --since 2025-08-01T00:00:00Z
  tsx backfill.ts --types contacts,deals --limit 50
  tsx backfill.ts --dry-run
        `)
        process.exit(0)
    }
  }
  
  return options
}

// Run if called directly
if (require.main === module) {
  const options = parseArgs()
  backfill(options).catch(error => {
    console.error(chalk.red('Fatal error:'), error)
    process.exit(1)
  })
}

export { backfill }