#!/bin/bash

# WisdomOS Supabase Setup Script
# This script helps you set up Supabase for the WisdomOS project

echo "🚀 WisdomOS Supabase Setup"
echo "=========================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Instructions for creating Supabase project
echo -e "${YELLOW}Step 1: Create Supabase Project${NC}"
echo "1. Go to https://supabase.com"
echo "2. Sign up or log in"
echo "3. Click 'New Project'"
echo "4. Enter project details:"
echo "   - Name: wisdomos"
echo "   - Database Password: (generate a strong one)"
echo "   - Region: Choose closest to you"
echo ""
read -p "Press Enter when you've created the project..."

# Step 2: Get credentials
echo ""
echo -e "${YELLOW}Step 2: Get Your Supabase Credentials${NC}"
echo "In your Supabase project dashboard:"
echo "1. Go to Settings → API"
echo "2. Copy the following values:"
echo ""

# Prompt for credentials
read -p "Enter your Supabase URL (https://xxx.supabase.co): " SUPABASE_URL
read -p "Enter your Supabase Anon Key: " SUPABASE_ANON_KEY
read -p "Enter your Supabase Service Role Key: " SUPABASE_SERVICE_KEY

# Step 3: Create .env files
echo ""
echo -e "${YELLOW}Step 3: Creating Environment Files${NC}"

# Create frontend .env.local
cat > apps/web/.env.local << EOF
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_KEY

# JWT Configuration
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRES_IN=7d

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE=http://localhost:4000
EOF

# Create backend .env
cat > apps/api/.env << EOF
# Supabase Configuration
SUPABASE_URL=$SUPABASE_URL
SUPABASE_SERVICE_KEY=$SUPABASE_SERVICE_KEY

# Database URL (from Supabase Settings → Database)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.$SUPABASE_URL:5432/postgres

# JWT Configuration
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRES_IN=7d

# Application Configuration
PORT=4000
NODE_ENV=development
EOF

echo -e "${GREEN}✓ Environment files created${NC}"

# Step 4: Run migrations
echo ""
echo -e "${YELLOW}Step 4: Running Database Migrations${NC}"
echo "Go to your Supabase dashboard:"
echo "1. Click on 'SQL Editor' in the left sidebar"
echo "2. Click 'New Query'"
echo "3. Copy and paste the contents of these files in order:"
echo "   - supabase/migrations/000_core_schema.sql"
echo "   - supabase/migrations/001_phase3_schema.sql"
echo "   - supabase/seed.sql (for demo data)"
echo "4. Run each script"
echo ""
read -p "Press Enter when you've run the migrations..."

# Step 5: Update Vercel environment variables
echo ""
echo -e "${YELLOW}Step 5: Update Vercel Environment Variables${NC}"
echo "1. Go to https://vercel.com/dashboard"
echo "2. Select your wisdomos-phoenix-frontend project"
echo "3. Go to Settings → Environment Variables"
echo "4. Add these variables:"
echo ""
echo "NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL"
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY"
echo "SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_KEY"
echo ""
echo "5. Do the same for your API project"
echo ""
read -p "Press Enter when you've added the environment variables..."

# Step 6: Test locally
echo ""
echo -e "${YELLOW}Step 6: Test Locally${NC}"
echo "Starting local development servers..."
echo ""

# Start the API
echo "Starting API server..."
cd apps/api
npm run dev &
API_PID=$!

# Wait for API to start
sleep 5

# Start the frontend
echo "Starting frontend..."
cd ../web
npm run dev &
WEB_PID=$!

echo ""
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo "Your WisdomOS application is now running:"
echo "- Frontend: http://localhost:3000"
echo "- API: http://localhost:4000"
echo ""
echo "Test the application by:"
echo "1. Creating a new account"
echo "2. Adding a journal entry"
echo "3. Setting up your life areas"
echo "4. Creating assessments"
echo ""
echo "To deploy to production:"
echo "1. Push to GitHub: git push origin main"
echo "2. Vercel will automatically deploy"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop the servers${NC}"

# Wait for user to stop
wait $API_PID
wait $WEB_PID