#!/bin/bash

# WisdomOS Database Setup Script
# Run this after setting up Supabase and configuring Vercel environment variables

set -e

echo "🗃️ Setting up WisdomOS database..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL environment variable not set"
    echo "Please set your Supabase connection string:"
    echo "export DATABASE_URL='postgresql://postgres:[password]@[host]:5432/postgres?schema=public'"
    exit 1
fi

echo "✅ DATABASE_URL found"

# 1. Generate Prisma client
echo "📦 Generating Prisma client..."
npx prisma generate

# 2. Push schema to database (creates tables)
echo "🏗️ Creating database schema..."
npx prisma db push --accept-data-loss

# 3. Run additional privacy system migration
echo "🔐 Setting up privacy system..."
if command -v psql &> /dev/null; then
    psql "$DATABASE_URL" -f prisma/migrations/privacy_system.sql
    echo "✅ Privacy system migration completed"
else
    echo "⚠️ psql not found - privacy migration skipped"
    echo "You may need to run the SQL migration manually if you want privacy features"
fi

# 4. Seed database with demo data
echo "🌱 Seeding database..."
npx prisma db seed

echo ""
echo "🎉 Database setup complete!"
echo ""
echo "📧 Demo login: demo@wisdomos.app"
echo "🌐 App URL: https://wisdomos-bxyh1r2u1-axaiinovation.vercel.app"
echo ""
echo "Next steps:"
echo "1. Set environment variables in Vercel"
echo "2. Redeploy: vercel --prod"
echo "3. Test the application"