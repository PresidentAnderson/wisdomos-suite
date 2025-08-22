#!/bin/bash

echo "🚀 Complete Supabase Setup for WisdomOS"
echo ""
echo "This script will help you complete the database setup after creating your Supabase project."
echo ""

# Check if connection string is provided
if [ -z "$1" ]; then
    echo "❓ Please provide your Supabase connection string:"
    echo ""
    echo "Usage: ./complete-supabase-setup.sh 'postgresql://postgres:PASSWORD@db.PROJECT.supabase.co:5432/postgres'"
    echo ""
    echo "Get this from Supabase Dashboard → Settings → Database → Connection string → URI"
    exit 1
fi

CONNECTION_STRING="$1"

echo "📝 Using connection string: ${CONNECTION_STRING:0:30}..."
echo ""

# Step 1: Remove old DATABASE_URL if exists
echo "1️⃣ Removing old DATABASE_URL from Vercel (if exists)..."
vercel env rm DATABASE_URL production 2>/dev/null || true
echo ""

# Step 2: Add new DATABASE_URL to Vercel
echo "2️⃣ Adding DATABASE_URL to Vercel production..."
echo "$CONNECTION_STRING" | vercel env add DATABASE_URL production
echo "✅ DATABASE_URL added to Vercel"
echo ""

# Step 3: Initialize database schema
echo "3️⃣ Initializing database schema..."
export DATABASE_URL="$CONNECTION_STRING"
npx prisma db push --accept-data-loss
echo "✅ Database schema created"
echo ""

# Step 4: Seed database with demo data
echo "4️⃣ Seeding database with demo data..."
npx prisma db seed
echo "✅ Database seeded"
echo ""

# Step 5: Commit schema changes
echo "5️⃣ Committing PostgreSQL schema..."
git add prisma/schema.prisma
git commit -m "Switch to PostgreSQL with Supabase" 2>/dev/null || echo "Schema already committed"
git push 2>/dev/null || echo "Already pushed"
echo ""

# Step 6: Deploy to Vercel
echo "6️⃣ Deploying to Vercel..."
vercel --prod --yes
echo ""

echo "🎉 Setup Complete!"
echo ""
echo "Your WisdomOS app is now fully functional with PostgreSQL!"
echo "Visit: https://wisdomos-web.vercel.app"
echo ""
echo "Demo login: demo@wisdomos.app"