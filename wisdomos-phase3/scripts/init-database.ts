#!/usr/bin/env tsx

import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

const DATABASE_PACKAGE_PATH = path.resolve(__dirname, '../packages/database');
const PRISMA_PATH = path.join(DATABASE_PACKAGE_PATH, 'prisma');

console.log('🗃️  WisdomOS Database Initialization Script');
console.log('============================================\n');

async function main() {
  try {
    // Check if database URL is configured
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.error('❌ DATABASE_URL environment variable is not set');
      console.log('   Please set DATABASE_URL in your .env file');
      console.log('   Example: DATABASE_URL=postgresql://username:password@localhost:5432/database');
      process.exit(1);
    }

    console.log('✅ Database URL configured');

    // Change to database package directory
    process.chdir(DATABASE_PACKAGE_PATH);
    
    console.log('\n📦 Installing database dependencies...');
    execSync('npm install', { stdio: 'inherit' });
    
    console.log('\n🔧 Generating Prisma client...');
    execSync('npm run db:generate', { stdio: 'inherit' });
    
    console.log('\n🚀 Running database migrations...');
    try {
      execSync('npm run db:deploy', { stdio: 'inherit' });
    } catch (error) {
      console.warn('⚠️  Migrations failed (database might not be running)');
      console.log('   Will attempt to create and migrate...');
      
      try {
        execSync('npm run db:migrate', { stdio: 'inherit' });
      } catch (migrationError) {
        console.error('❌ Failed to run migrations. Please ensure:');
        console.log('   1. PostgreSQL is running');
        console.log('   2. Database exists and is accessible');
        console.log('   3. DATABASE_URL is correct');
        throw migrationError;
      }
    }
    
    console.log('\n🌱 Seeding database with canonical life areas...');
    execSync('npm run db:seed', { stdio: 'inherit' });
    
    console.log('\n🎉 Database initialization completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Start your API server: npm run dev');
    console.log('   2. The database will automatically fallback to in-memory if connection fails');
    console.log('   3. Use Prisma Studio to view data: npm run db:studio');
    
  } catch (error) {
    console.error('\n❌ Database initialization failed:', error.message);
    console.log('\n🔄 Fallback mode available:');
    console.log('   The API will automatically use in-memory storage if database is unavailable');
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n⏹️  Database initialization interrupted');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n⏹️  Database initialization terminated');
  process.exit(0);
});

main();