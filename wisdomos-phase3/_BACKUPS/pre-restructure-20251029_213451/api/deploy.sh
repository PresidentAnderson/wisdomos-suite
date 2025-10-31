#!/bin/bash

# WisdomOS API Deployment Script

echo "🔥 Starting WisdomOS API deployment..."

# Check if npm build works
echo "📦 Building the application..."
if ! npm run build; then
  echo "❌ Build failed. Please fix build errors first."
  exit 1
fi

echo "✅ Build successful!"

# Test the application locally
echo "🧪 Testing application startup..."
timeout 10 npm start &
sleep 3
if curl -s http://localhost:4000/api/dashboard > /dev/null; then
  echo "✅ Application starts successfully"
  pkill -f "node dist/main"
else
  echo "❌ Application failed to start"
  pkill -f "node dist/main"
  exit 1
fi

echo "🚀 Application is ready for deployment!"
echo "📝 Deployment options:"
echo "   - Railway: git push to railway remote"
echo "   - Render: Connect to GitHub repository"
echo "   - Heroku: git push heroku main"
echo "   - Vercel: vercel --prod from this directory"

# Output the current GitHub repository
if git remote -v | grep origin; then
  echo "🔗 GitHub repository: $(git remote get-url origin)"
fi

echo "✅ Deployment preparation complete!"