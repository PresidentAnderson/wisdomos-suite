#!/bin/bash

# WisdomOS Vercel Deployment Script
# Handles registry issues and ensures clean deployment

set -e

echo "🚀 Starting WisdomOS Vercel deployment..."

# Navigate to project root
cd "$(dirname "$0")"

# Clean up any potential lock file conflicts
echo "🧹 Cleaning up lock file conflicts..."
find . -name "pnpm-lock.yaml" -delete 2>/dev/null || true

# Ensure npm registry is set correctly
echo "🔧 Setting npm registry..."
npm config set registry https://registry.npmjs.org/
npm config set audit false
npm config set fund false

# Navigate to web app directory
cd apps/web

# Clean install to avoid registry errors
echo "📦 Installing dependencies with clean npm install..."
rm -rf node_modules package-lock.json 2>/dev/null || true
npm install --no-audit --prefer-offline

# Verify build works locally
echo "🔨 Testing build locally..."
npm run build

echo "✅ Build successful! Ready for Vercel deployment."
echo ""
echo "Next steps:"
echo "1. Run: vercel --prod"
echo "2. Or push to your connected Git repository"
echo ""
echo "Vercel Configuration:"
echo "- Root vercel.json: Configured for monorepo structure"
echo "- Web vercel.json: Optimized for npm with registry fixes"
echo "- Build command: npm ci && npm run build"
echo "- Install command: npm ci --prefer-offline --no-audit"