#!/bin/bash

# WisdomOS Full-Stack Setup Script
set -e

echo "🚀 WisdomOS Full-Stack Setup"
echo "============================="

# Check for required tools
echo "📋 Checking requirements..."
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm is required but not installed."; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required but not installed."; exit 1; }

# Create .env from example
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ Created .env file - please update with your configuration"
else
    echo "✅ .env file exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install
cd apps/server && npm install && cd ../..

# Start PostgreSQL
echo "🐘 Starting PostgreSQL..."
docker-compose up -d
echo "⏳ Waiting for database to be ready..."
sleep 5

# Setup database
echo "🗄️ Setting up database..."
cd apps/server

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run prisma:generate

# Run migrations
echo "📊 Running database migrations..."
npx prisma db push

# Seed database
echo "🌱 Seeding database..."
npm run db:seed

cd ../..

echo ""
echo "✅ Setup complete!"
echo ""
echo "📚 Next steps:"
echo "1. Update .env with your configuration (especially JWT_SECRET)"
echo "2. (Optional) Add HUBSPOT_ACCESS_TOKEN for HubSpot integration"
echo "3. Start the server: cd apps/server && npm run dev"
echo "4. API will be available at http://localhost:4000"
echo "5. Test with: curl http://localhost:4000/health"
echo ""
echo "📧 Demo login: demo@wisdomos.app"
echo ""
echo "🎉 Happy building with WisdomOS!"