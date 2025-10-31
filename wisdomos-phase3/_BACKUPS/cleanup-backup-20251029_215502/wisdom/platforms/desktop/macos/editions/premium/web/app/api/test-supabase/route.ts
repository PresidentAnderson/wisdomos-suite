import { NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase/client'

export async function GET() {
  try {
    // Test 1: Basic connection
    const { data: testConnection, error: connectionError } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (connectionError) {
      console.error('Connection test failed:', connectionError)
    }

    // Test 2: Check tables exist
    const tables = [
      'users',
      'life_areas',
      'journal_entries',
      'contributions',
      'fulfillment_scores',
      'hubspot_sync',
      'commitments',
      'monthly_audits'
    ]

    const tableStatus: Record<string, boolean> = {}
    
    for (const table of tables) {
      try {
        const { error } = await supabase
          .from(table)
          .select('count')
          .limit(1)
        
        tableStatus[table] = !error
      } catch (e) {
        tableStatus[table] = false
      }
    }

    // Test 3: Try to create a test user (if doesn't exist)
    let testUser = null
    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', 'test@wisdomos.com')
        .single()
      
      if (!existingUser) {
        testUser = await supabaseAdmin.createUser('test@wisdomos.com', 'Test User')
      } else {
        testUser = existingUser
      }
    } catch (e) {
      console.error('User test failed:', e)
    }

    // Test 4: Check Row Level Security
    const rlsStatus: Record<string, string> = {}
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)
        
        if (error && error.message.includes('row-level security')) {
          rlsStatus[table] = 'RLS Active (restricted)'
        } else if (error) {
          rlsStatus[table] = `Error: ${error.message}`
        } else {
          rlsStatus[table] = 'Accessible'
        }
      } catch (e) {
        rlsStatus[table] = 'Unknown'
      }
    }

    const response = {
      status: 'connected',
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      timestamp: new Date().toISOString(),
      tests: {
        connection: !connectionError ? 'OK' : 'Failed',
        tables: tableStatus,
        rowLevelSecurity: rlsStatus,
        testUser: testUser ? 'Created/Found' : 'Failed'
      },
      summary: {
        tablesFound: Object.values(tableStatus).filter(v => v).length,
        totalTables: tables.length,
        allTablesExist: Object.values(tableStatus).every(v => v),
        canReadData: Object.values(rlsStatus).some(v => v === 'Accessible')
      }
    }

    return NextResponse.json(response, { status: 200 })
    
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message || 'Unknown error occurred',
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST() {
  try {
    // Test write operations
    const testData = {
      email: `test-${Date.now()}@wisdomos.com`,
      name: 'Test Write User'
    }

    // Test creating a user
    const user = await supabaseAdmin.createUser(testData.email, testData.name)
    
    // Test creating a journal entry
    const journalEntry = await supabaseAdmin.createJournalEntry({
      user_id: user.id,
      title: 'Test Journal Entry',
      body: 'This is a test entry created via API',
      mood: 'neutral',
      tags: ['test', 'api']
    })

    // Test creating a contribution
    const contribution = await supabaseAdmin.upsertContribution({
      user_id: user.id,
      external_id: `test-${Date.now()}`,
      type: 'being',
      title: 'Test Contribution',
      description: 'Test contribution via API'
    })

    // Clean up test data
    await supabase.from('contributions').delete().eq('id', contribution.id)
    await supabase.from('journal_entries').delete().eq('id', journalEntry.id)
    await supabase.from('users').delete().eq('id', user.id)

    return NextResponse.json({
      status: 'success',
      message: 'Write operations successful',
      tests: {
        userCreation: 'OK',
        journalEntry: 'OK',
        contribution: 'OK',
        cleanup: 'OK'
      }
    }, { status: 200 })

  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message || 'Write test failed',
      details: error
    }, { status: 500 })
  }
}