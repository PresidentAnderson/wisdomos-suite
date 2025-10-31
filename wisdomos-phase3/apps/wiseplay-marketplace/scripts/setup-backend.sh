#!/bin/bash

# WisePlay Marketplace - Backend Setup Automation Script
# This script helps automate the backend configuration process

set -e  # Exit on error

echo "🚀 WisePlay Marketplace - Backend Setup"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo -e "${YELLOW}⚠️  No .env.local file found. Creating from .env.example...${NC}"
  cp .env.example .env.local
  echo -e "${GREEN}✅ Created .env.local${NC}"
  echo ""
fi

# Function to check if a variable is set in .env.local
check_env_var() {
  local var_name=$1
  if grep -q "^${var_name}=" .env.local && ! grep -q "^${var_name}=$" .env.local; then
    return 0  # Variable is set
  else
    return 1  # Variable is not set or empty
  fi
}

# Check required environment variables
echo "📋 Checking environment variables..."
echo ""

missing_vars=()

if ! check_env_var "DATABASE_URL"; then
  missing_vars+=("DATABASE_URL")
fi

if ! check_env_var "NEXTAUTH_URL"; then
  missing_vars+=("NEXTAUTH_URL")
fi

if ! check_env_var "NEXTAUTH_SECRET"; then
  missing_vars+=("NEXTAUTH_SECRET")
fi

if [ ${#missing_vars[@]} -eq 0 ]; then
  echo -e "${GREEN}✅ All required environment variables are set${NC}"
else
  echo -e "${RED}❌ Missing required environment variables:${NC}"
  for var in "${missing_vars[@]}"; do
    echo "   - $var"
  done
  echo ""
  echo -e "${YELLOW}Please update .env.local with the missing variables.${NC}"
  echo ""

  # Offer to generate NEXTAUTH_SECRET
  if [[ " ${missing_vars[@]} " =~ " NEXTAUTH_SECRET " ]]; then
    read -p "Generate NEXTAUTH_SECRET now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      secret=$(openssl rand -base64 32)
      echo "NEXTAUTH_SECRET=$secret" >> .env.local
      echo -e "${GREEN}✅ Generated and added NEXTAUTH_SECRET to .env.local${NC}"
      echo ""
    fi
  fi

  # Ask about DATABASE_URL
  if [[ " ${missing_vars[@]} " =~ " DATABASE_URL " ]]; then
    echo -e "${BLUE}To get DATABASE_URL:${NC}"
    echo "1. Create account at https://neon.tech"
    echo "2. Create a new project"
    echo "3. Copy the pooled connection string"
    echo "4. Add to .env.local as DATABASE_URL=postgresql://..."
    echo ""
  fi

  # Ask about NEXTAUTH_URL
  if [[ " ${missing_vars[@]} " =~ " NEXTAUTH_URL " ]]; then
    echo -e "${BLUE}For NEXTAUTH_URL:${NC}"
    echo "Local: http://localhost:3012"
    echo "Production: https://wiseplay-marketplace-4q3qhcabz-axaiinovation.vercel.app"
    echo ""
    read -p "Enter NEXTAUTH_URL (or press Enter to skip): " nextauth_url
    if [ ! -z "$nextauth_url" ]; then
      echo "NEXTAUTH_URL=$nextauth_url" >> .env.local
      echo -e "${GREEN}✅ Added NEXTAUTH_URL to .env.local${NC}"
      echo ""
    fi
  fi

  echo -e "${YELLOW}Please complete .env.local configuration and run this script again.${NC}"
  exit 1
fi

echo ""

# Check if DATABASE_URL is accessible
echo "🔌 Testing database connection..."
if check_env_var "DATABASE_URL"; then
  # Source the .env.local file
  export $(cat .env.local | grep -v '^#' | xargs)

  # Try to connect to database
  if pnpm prisma db execute --stdin <<< "SELECT 1" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Database connection successful${NC}"
  else
    echo -e "${RED}❌ Could not connect to database${NC}"
    echo "Please verify your DATABASE_URL is correct"
    exit 1
  fi
else
  echo -e "${YELLOW}⚠️  DATABASE_URL not set, skipping connection test${NC}"
fi

echo ""

# Ask if user wants to push schema
echo "📦 Database Schema"
read -p "Push Prisma schema to database? This will create/update tables. (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "Pushing schema to database..."
  pnpm prisma db push
  echo -e "${GREEN}✅ Schema pushed successfully${NC}"
else
  echo -e "${YELLOW}⚠️  Skipped schema push${NC}"
fi

echo ""

# Ask if user wants to seed database
echo "🌱 Test Data"
read -p "Seed database with test data? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "Seeding database..."
  pnpm tsx prisma/seed.ts
  echo -e "${GREEN}✅ Database seeded successfully${NC}"
else
  echo -e "${YELLOW}⚠️  Skipped database seeding${NC}"
fi

echo ""

# Check if Prisma Studio should be opened
echo "🎨 Prisma Studio"
read -p "Open Prisma Studio to view database? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "Opening Prisma Studio..."
  echo -e "${BLUE}Prisma Studio will open in your browser${NC}"
  echo "Press Ctrl+C to close when done"
  pnpm prisma studio
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Backend setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Configure OAuth providers (Google, GitHub)"
echo "2. Set up Stripe keys"
echo "3. Add environment variables to Vercel"
echo "4. Deploy: vercel --prod"
echo ""
echo "See BACKEND-CONFIGURATION-GUIDE.md for detailed instructions"
echo ""
