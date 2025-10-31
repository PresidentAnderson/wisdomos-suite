const { execSync } = require('child_process');

console.log('🚀 Setting up WisdomOS database in Supabase...');

// Set environment variables for this process
process.env.SUPABASE_SERVICE_ROLE_KEY = 'sbp_2ea61ad2d7106298a24d17c90d01a0315b28478b';
process.env.DATABASE_URL = 'postgresql://postgres.flttywslqlhnjzlknkkqg:PresidentJab2025!@aws-0-us-west-1.pooler.supabase.com:6543/postgres';
process.env.DIRECT_URL = 'postgresql://postgres.flttywslqlhnjzlknkkqg:PresidentJab2025!@aws-0-us-west-1.pooler.supabase.com:5432/postgres';

try {
  console.log('📦 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  console.log('🏗️  Creating database schema...');
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });

  console.log('✅ Database setup complete!');
  console.log('📊 Your WisdomOS database is ready with all required tables.');

} catch (error) {
  console.error('❌ Error setting up database:', error.message);
  process.exit(1);
}