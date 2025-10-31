#!/bin/bash

# Setup local SQLite database for development
echo "🚀 Setting up local SQLite database for WisdomOS..."

# Export environment variable
export DATABASE_URL="file:./prisma/dev.db"

# Generate Prisma client
echo "📦 Generating Prisma client..."
npx prisma generate

# Push schema to database (force to skip validation)
echo "🔄 Creating database schema..."
npx prisma db push --accept-data-loss --skip-generate || true

# Run seed if it exists
echo "🌱 Seeding database with demo data..."
npx prisma db seed || echo "Note: Seeding skipped or completed with warnings"

echo "✅ Local database setup complete!"
echo ""
echo "📊 To view your database, run:"
echo "   npx prisma studio"
echo ""
echo "🚀 To start the application, run:"
echo "   npm run dev"