#!/bin/bash

# WisdomOS Database Setup Script
# This script helps set up the Supabase database for WisdomOS

set -e

echo "🔥 WisdomOS Database Setup"
echo "========================="

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Installing now..."
    brew install supabase/tap/supabase
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local file not found. Please create it with your Supabase credentials."
    echo "📝 Template created at .env.local - please update with your credentials."
    exit 1
fi

# Source environment variables
source .env.local

# Check for required environment variables
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ "$NEXT_PUBLIC_SUPABASE_URL" = "https://your-project-ref.supabase.co" ]; then
    echo "❌ Please update NEXT_PUBLIC_SUPABASE_URL in .env.local with your actual Supabase project URL"
    exit 1
fi

if [ -z "$SUPABASE_SERVICE_KEY" ] || [ "$SUPABASE_SERVICE_KEY" = "your_supabase_service_key_here" ]; then
    echo "❌ Please update SUPABASE_SERVICE_KEY in .env.local with your actual service key"
    exit 1
fi

echo "✅ Environment variables found"

# Initialize Supabase project locally
echo "🔧 Initializing Supabase project..."
if [ ! -f "supabase/config.toml" ]; then
    supabase init
fi

# Link to remote project
echo "🔗 Linking to remote Supabase project..."
PROJECT_REF=$(echo $NEXT_PUBLIC_SUPABASE_URL | sed 's/https:\/\/\(.*\)\.supabase\.co/\1/')
supabase link --project-ref $PROJECT_REF

# Apply migrations
echo "📁 Applying database migrations..."
supabase db push

# Apply seed data
echo "🌱 Applying seed data..."
psql "$NEXT_PUBLIC_SUPABASE_URL" -f supabase/seed.sql

echo "✅ Database setup complete!"
echo ""
echo "🎉 Your WisdomOS database is ready!"
echo "📱 Frontend: https://wisdomos-phoenix-frontend.vercel.app"
echo "🔌 API: https://api-hehupjoe3-axaiinovation.vercel.app"
echo ""
echo "Next steps:"
echo "1. Update environment variables in your Vercel deployments"
echo "2. Test the database connection"
echo "3. Verify all features are working"