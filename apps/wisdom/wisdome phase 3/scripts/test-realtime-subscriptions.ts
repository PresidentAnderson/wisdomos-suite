/**
 * Test Script for Real-time Subscriptions System
 *
 * This script tests the Supabase real-time subscriptions for fd_score_raw table.
 * It creates test data and verifies that real-time events are received.
 *
 * Usage:
 *   npx tsx scripts/test-realtime-subscriptions.ts
 *
 * Requirements:
 *   - Valid Supabase credentials in .env.local
 *   - User authenticated in the system
 *   - fd_area table seeded with areas
 */

import { createClient } from '@supabase/supabase-js'

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials')
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface TestConfig {
  userId: string
  tenantId: string
  period: string
  testDuration: number // seconds
}

async function runRealtimeTest(config: TestConfig) {
  console.log('\n🔥 Phoenix Real-time Subscription Test')
  console.log('=====================================\n')

  console.log('Configuration:')
  console.log(`  User ID: ${config.userId}`)
  console.log(`  Tenant ID: ${config.tenantId}`)
  console.log(`  Period: ${config.period}`)
  console.log(`  Test Duration: ${config.testDuration}s\n`)

  // Fetch available areas
  console.log('📊 Fetching available areas...')
  const { data: areas, error: areasError } = await supabase
    .from('fd_area')
    .select('id, code, name, emoji')
    .eq('is_active', true)
    .limit(3)

  if (areasError || !areas || areas.length === 0) {
    console.error('❌ Failed to fetch areas:', areasError)
    return
  }

  console.log(`✅ Found ${areas.length} areas for testing:`)
  areas.forEach(area => {
    console.log(`   ${area.emoji} ${area.name} (${area.code})`)
  })
  console.log()

  // Track received updates
  let updateCount = 0
  const receivedUpdates: any[] = []

  // Subscribe to real-time channel
  console.log('🔌 Subscribing to real-time channel...')

  const channelName = `test_fd_scores_${config.userId}_${Date.now()}`
  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'fd_score_raw',
        filter: `user_id=eq.${config.userId}`,
      },
      (payload) => {
        updateCount++
        receivedUpdates.push(payload)

        console.log(`\n📨 Real-time Update #${updateCount}`)
        console.log(`   Event: ${payload.eventType}`)
        console.log(`   Timestamp: ${new Date().toISOString()}`)

        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const record = payload.new
          const area = areas.find(a => a.id === record.area_id)
          console.log(`   Area: ${area?.emoji} ${area?.name || 'Unknown'}`)
          console.log(`   Score: ${record.score}/5.0`)
          console.log(`   Source: ${record.source}`)
          console.log(`   Period: ${record.period}`)
        } else if (payload.eventType === 'DELETE') {
          const record = payload.old
          console.log(`   Deleted score for area: ${record.area_id}`)
        }
      }
    )
    .subscribe((status) => {
      console.log(`🔗 Subscription status: ${status}`)

      if (status === 'SUBSCRIBED') {
        console.log('✅ Successfully subscribed to real-time updates')
        console.log('⏳ Waiting for events...\n')
      } else if (status === 'CHANNEL_ERROR') {
        console.error('❌ Channel error occurred')
      } else if (status === 'TIMED_OUT') {
        console.error('❌ Subscription timed out')
      }
    })

  // Wait for subscription to be ready
  await new Promise(resolve => setTimeout(resolve, 2000))

  // Insert test scores
  console.log('💉 Inserting test scores...\n')

  for (let i = 0; i < areas.length; i++) {
    const area = areas[i]
    const score = 2 + Math.random() * 3 // Random score 2-5

    console.log(`   Inserting score for ${area.emoji} ${area.name}: ${score.toFixed(2)}`)

    const { error } = await supabase.from('fd_score_raw').insert({
      user_id: config.userId,
      tenant_id: config.tenantId,
      area_id: area.id,
      period: config.period,
      score: parseFloat(score.toFixed(2)),
      source: 'manual',
      provenance: 'test-script',
    })

    if (error) {
      console.error(`   ❌ Insert failed:`, error.message)
    } else {
      console.log(`   ✅ Inserted successfully`)
    }

    // Wait between inserts
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  console.log('\n⏳ Waiting for real-time events to arrive...\n')

  // Wait for events to arrive
  await new Promise(resolve => setTimeout(resolve, config.testDuration * 1000))

  // Update test scores
  console.log('📝 Updating test scores...\n')

  for (let i = 0; i < Math.min(2, areas.length); i++) {
    const area = areas[i]
    const newScore = 3 + Math.random() * 2 // Random score 3-5

    console.log(`   Updating score for ${area.emoji} ${area.name}: ${newScore.toFixed(2)}`)

    const { error } = await supabase
      .from('fd_score_raw')
      .update({
        score: parseFloat(newScore.toFixed(2)),
        source: 'ai',
        provenance: 'test-script-update',
      })
      .eq('user_id', config.userId)
      .eq('area_id', area.id)
      .eq('period', config.period)

    if (error) {
      console.error(`   ❌ Update failed:`, error.message)
    } else {
      console.log(`   ✅ Updated successfully`)
    }

    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  console.log('\n⏳ Waiting for update events...\n')
  await new Promise(resolve => setTimeout(resolve, 3000))

  // Cleanup
  console.log('🧹 Cleaning up test data...\n')

  const { error: deleteError } = await supabase
    .from('fd_score_raw')
    .delete()
    .eq('user_id', config.userId)
    .eq('period', config.period)
    .eq('provenance', 'test-script')

  if (deleteError) {
    console.error('❌ Cleanup failed:', deleteError.message)
  } else {
    console.log('✅ Test data cleaned up')
  }

  await new Promise(resolve => setTimeout(resolve, 2000))

  // Unsubscribe
  console.log('\n🔌 Unsubscribing from channel...')
  await supabase.removeChannel(channel)

  // Results
  console.log('\n📊 Test Results')
  console.log('================\n')
  console.log(`Total events received: ${updateCount}`)
  console.log(`Expected events: ${areas.length * 2} (inserts + updates) + ${areas.length} (deletes)`)

  if (updateCount > 0) {
    console.log('\n✅ Real-time subscriptions are working!')
    console.log('\nEvent breakdown:')
    const eventTypes = receivedUpdates.reduce((acc, update) => {
      acc[update.eventType] = (acc[update.eventType] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    Object.entries(eventTypes).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`)
    })
  } else {
    console.log('\n⚠️  No real-time events received!')
    console.log('\nPossible issues:')
    console.log('   1. Supabase realtime not enabled for fd_score_raw table')
    console.log('   2. Row-level security blocking updates')
    console.log('   3. Network/firewall issues')
    console.log('   4. Subscription filter not matching')
  }

  console.log('\n✨ Test complete!\n')
}

// Main execution
async function main() {
  // Test configuration
  // Replace these with your actual test user/tenant IDs
  const config: TestConfig = {
    userId: process.env.TEST_USER_ID || 'your-test-user-id',
    tenantId: process.env.TEST_TENANT_ID || 'your-test-tenant-id',
    period: '2025-10',
    testDuration: 5, // seconds to wait between operations
  }

  // Validate configuration
  if (config.userId === 'your-test-user-id' || config.tenantId === 'your-test-tenant-id') {
    console.error('\n❌ Please configure TEST_USER_ID and TEST_TENANT_ID environment variables\n')
    console.log('Usage:')
    console.log('  export TEST_USER_ID="your-user-id"')
    console.log('  export TEST_TENANT_ID="your-tenant-id"')
    console.log('  npx tsx scripts/test-realtime-subscriptions.ts\n')
    process.exit(1)
  }

  try {
    await runRealtimeTest(config)
  } catch (error) {
    console.error('\n❌ Test failed with error:', error)
    process.exit(1)
  }
}

main()
