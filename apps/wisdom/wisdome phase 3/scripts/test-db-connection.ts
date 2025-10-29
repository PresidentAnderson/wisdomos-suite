#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function testConnection() {
  console.log('🔌 Testing WisdomOS Database Connection...\n');

  try {
    // Test basic connection
    console.log('📡 Attempting to connect to Supabase...');
    await prisma.$connect();
    console.log('✅ Successfully connected to database!\n');

    // Check database version
    const result = await prisma.$queryRaw`SELECT version()` as any[];
    console.log('📊 PostgreSQL Version:');
    console.log(result[0].version);
    console.log('');

    // Check if tables exist
    console.log('📋 Checking database schema...');
    const tables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    ` as any[];

    if (tables.length > 0) {
      console.log(`✅ Found ${tables.length} tables:`);
      tables.forEach((table: any) => {
        console.log(`   - ${table.table_name}`);
      });
    } else {
      console.log('⚠️  No tables found. Run "pnpm db:push" to create schema.');
    }

    console.log('\n🎉 Database connection test completed successfully!');

  } catch (error: any) {
    console.error('\n❌ Database connection failed:');
    console.error(`   Error: ${error.message}`);
    console.error('\n🔍 Troubleshooting:');
    console.error('   1. Check DATABASE_URL in .env.local');
    console.error('   2. Verify Supabase project is active');
    console.error('   3. Confirm network connectivity');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
