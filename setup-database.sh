#!/bin/bash
set -e

echo "🚀 WisdomOS Database Setup Script"
echo "=================================="

# Check if DATABASE_URL is set and not placeholder
if [[ -z "$DATABASE_URL" ]] || [[ "$DATABASE_URL" == *"YOUR_SUPABASE_DATABASE_URL"* ]]; then
    echo "❌ Error: Please update DATABASE_URL in .env.local with your actual Supabase connection string"
    echo "   Format: postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
    exit 1
fi

echo "📊 Database URL configured: ${DATABASE_URL%%@*}@***"

echo ""
echo "🔄 Step 1: Generating Prisma client..."
npm run prisma:generate

echo ""
echo "🏗️  Step 2: Pushing database schema to Supabase..."
npm run prisma:push

echo ""
echo "🌱 Step 3: Seeding database with demo data..."
npm run prisma:seed

echo ""
echo "✅ Database setup complete!"
echo ""
echo "🔍 Next steps:"
echo "   1. Run 'npm run prisma:studio' to view your data"
echo "   2. Test the application with 'npm run dev'"
echo "   3. Login with: demo@wisdomos.app"
echo ""
echo "📝 Don't forget to:"
echo "   - Add these environment variables to Vercel"
echo "   - Save your Supabase credentials securely"