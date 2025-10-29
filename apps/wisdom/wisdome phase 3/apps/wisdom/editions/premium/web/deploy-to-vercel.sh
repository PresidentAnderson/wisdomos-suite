#!/bin/bash

echo "🚀 Deploying WisdomOS Web App to Vercel"
echo "========================================"

# Navigate to the project directory
cd /Volumes/DevOps/08-incoming-projects/wisdomOS/apps/web

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in the wisdomOS web app directory"
    exit 1
fi

echo "✅ Found wisdomOS web app"

# Generate Prisma client
echo "📦 Generating Prisma client..."
npx prisma generate

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo ""
echo "🔗 Your app should now be live on Vercel"
echo "📝 Note: Make sure your environment variables are configured in Vercel dashboard"