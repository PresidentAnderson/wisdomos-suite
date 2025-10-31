#!/bin/bash
# 🚀 WisdomOS Netlify Deployment Script
# Run this to deploy your web app immediately

set -e

echo "🔥 Deploying WisdomOS to Netlify..."

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "📦 Installing Netlify CLI..."
    npm install -g netlify-cli
fi

# Login to Netlify (if not already logged in)
echo "🔐 Checking Netlify authentication..."
netlify status 2>/dev/null || {
    echo "Please login to Netlify:"
    netlify login
}

# Build the web application
echo "🏗️  Building WisdomOS web application..."
cd "apps/web" || exit 1

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Generate Prisma client  
echo "🔗 Generating database client..."
pnpm db:generate

# Build the application
echo "🏭 Building Next.js application..."
pnpm run build

# Deploy to Netlify
echo "🚀 Deploying to Netlify..."
netlify deploy --prod --dir=out --message "🔥 WisdomOS Phoenix deployment"

echo ""
echo "✅ Deployment complete!"
echo "🌐 Your WisdomOS is now live!"
echo ""

# Show deployment status
netlify status

echo ""
echo "🔥 Phoenix has risen! Your transformation platform is live!"