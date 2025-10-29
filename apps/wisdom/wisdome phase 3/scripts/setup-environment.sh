#!/bin/bash

# WisdomOS Multi-Tenancy Environment Setup Script

set -e

echo "🚀 Setting up WisdomOS Multi-Tenancy Environment..."

# Check if environment argument is provided
if [ -z "$1" ]; then
  echo "Usage: $0 [development|production]"
  exit 1
fi

ENVIRONMENT=$1

echo "📋 Environment: $ENVIRONMENT"

# Copy appropriate environment file
if [ "$ENVIRONMENT" = "development" ]; then
  echo "🔧 Copying development environment variables..."
  cp .env.development .env
  cp .env.development packages/db/.env
  cp .env.development apps/web/.env.local
elif [ "$ENVIRONMENT" = "production" ]; then
  echo "🔧 Copying production environment variables..."
  cp .env.production .env
  cp .env.production packages/db/.env
  cp .env.production apps/web/.env.local
  
  # For production, switch back to PostgreSQL
  echo "🗃️  Updating database provider for production..."
  sed -i '' 's/provider = "sqlite"/provider = "postgresql"/g' packages/db/prisma/schema.prisma
  sed -i '' 's/DATABASE_URL="file:\.\/dev\.db"/DATABASE_URL=env("DATABASE_URL")/g' packages/db/prisma/schema.prisma
else
  echo "❌ Invalid environment. Use 'development' or 'production'"
  exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Generate Prisma client
echo "🔨 Generating Prisma client..."
pnpm db:generate

# Push database schema
if [ "$ENVIRONMENT" = "development" ]; then
  echo "🗃️  Setting up development database..."
  pnpm db:push
else
  echo "🗃️  For production, run migrations manually:"
  echo "   pnpm db:push (after setting up your PostgreSQL database)"
fi

# Run basic tests
echo "🧪 Running basic schema tests..."
npx tsx scripts/test-basic-schema.ts

echo ""
echo "✅ Environment setup complete!"
echo ""
echo "📋 Next steps:"
if [ "$ENVIRONMENT" = "development" ]; then
  echo "   1. Update .env with your actual API keys"
  echo "   2. Run 'pnpm dev' to start development server"
  echo "   3. Visit http://localhost:3000/onboarding to create your first tenant"
else
  echo "   1. Set up your production PostgreSQL database"
  echo "   2. Update .env.production with your actual credentials"
  echo "   3. Set up DNS wildcards: *.wisdomos.app"
  echo "   4. Deploy to your production environment"
  echo "   5. Run database migrations in production"
fi
echo ""