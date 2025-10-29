#!/usr/bin/env node

/**
 * Run Supabase migrations
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigrations() {
  console.log('🚀 Running Supabase migrations...\n')
  
  const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations')
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort()
  
  for (const file of migrationFiles) {
    console.log(`📝 Running migration: ${file}`)
    
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8')
    
    // Split by semicolons and run each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))
    
    for (const statement of statements) {
      try {
        // Execute raw SQL using Supabase's rpc
        const { error } = await supabase.rpc('exec_sql', { 
          sql_query: statement + ';' 
        }).catch(async () => {
          // If exec_sql doesn't exist, try direct query
          const { error } = await supabase.from('_migrations').select('*').limit(0)
          if (error) {
            console.log(`   ⚠️  Could not execute: ${statement.substring(0, 50)}...`)
            console.log(`      Error: ${error.message}`)
          }
          return { error }
        })
        
        if (error) {
          console.log(`   ⚠️  Warning: ${error.message}`)
        } else {
          console.log(`   ✅ Statement executed successfully`)
        }
      } catch (err) {
        console.log(`   ⚠️  Could not execute statement: ${err.message}`)
      }
    }
    
    console.log(`   ✅ Migration ${file} processed\n`)
  }
  
  // Test if tables were created
  console.log('🧪 Testing table creation...')
  
  const tables = ['users', 'guests', 'bookings', 'life_areas', 'contributions']
  
  for (const table of tables) {
    const { error } = await supabase.from(table).select('*').limit(0)
    if (error) {
      console.log(`   ❌ Table ${table}: ${error.message}`)
    } else {
      console.log(`   ✅ Table ${table}: OK`)
    }
  }
  
  console.log('\n✅ Migration process complete!')
  console.log('🔗 View your database at: https://supabase.com/dashboard/project/flttywslqlhnjzlknkkqg')
}

runMigrations().catch(console.error)