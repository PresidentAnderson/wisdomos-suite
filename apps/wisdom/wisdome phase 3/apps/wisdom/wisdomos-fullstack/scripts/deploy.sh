#!/bin/bash

# WisdomOS Production Deployment Script
set -e

echo "🚀 WisdomOS Production Deployment"
echo "================================="

# Configuration
DEPLOY_ENV=${1:-production}
echo "📍 Deploying to: $DEPLOY_ENV"

# Build server
echo "🔨 Building server..."
cd apps/server
npm run build
cd ../..

# Run production migrations
if [ "$DEPLOY_ENV" = "production" ]; then
    echo "📊 Running production migrations..."
    cd apps/server
    npx prisma migrate deploy
    cd ../..
fi

# Docker build (optional)
if [ -f "Dockerfile" ]; then
    echo "🐳 Building Docker image..."
    docker build -t wisdomos:latest .
fi

echo ""
echo "✅ Build complete!"
echo ""
echo "📚 Deployment options:"
echo ""
echo "Option 1: Railway"
echo "  railway up"
echo ""
echo "Option 2: Render"
echo "  Connect GitHub repo at render.com"
echo ""
echo "Option 3: Fly.io"
echo "  fly deploy"
echo ""
echo "Option 4: Docker"
echo "  docker run -p 4000:4000 --env-file .env wisdomos:latest"
echo ""
echo "Option 5: VPS with PM2"
echo "  pm2 start apps/server/dist/index.js --name wisdomos"
echo ""
echo "🗄️ Database options:"
echo "  - Supabase (PostgreSQL)"
echo "  - Railway PostgreSQL"
echo "  - Neon.tech"
echo "  - Your own PostgreSQL instance"
echo ""
echo "Remember to set environment variables in your deployment platform!"