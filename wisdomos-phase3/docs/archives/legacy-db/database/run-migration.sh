#!/bin/bash

# WisdomOS Database Migration Runner
# Run this script to set up your PostgreSQL database

set -e

echo "🚀 WisdomOS Database Migration"
echo "================================"

# Check if .env file exists
if [ ! -f ../.env ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    cp ../.env.example ../.env
    echo "📝 Please update .env with your database credentials"
    exit 1
fi

# Load environment variables
export $(cat ../.env | grep -v '^#' | xargs)

# Extract database connection details
DB_HOST=$(echo $DATABASE_URL | sed -E 's/.*@([^:\/]+).*/\1/')
DB_PORT=$(echo $DATABASE_URL | sed -E 's/.*:([0-9]+)\/.*/\1/')
DB_NAME=$(echo $DATABASE_URL | sed -E 's/.*\/([^?]+).*/\1/')
DB_USER=$(echo $DATABASE_URL | sed -E 's/.*\/\/([^:]+):.*/\1/')
DB_PASS=$(echo $DATABASE_URL | sed -E 's/.*:([^@]+)@.*/\1/')

echo "📊 Database: $DB_NAME"
echo "🖥️  Host: $DB_HOST:$DB_PORT"
echo "👤 User: $DB_USER"
echo ""

# Check PostgreSQL connection
echo "🔍 Checking PostgreSQL connection..."
PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c '\q' 2>/dev/null || {
    echo "❌ Cannot connect to PostgreSQL"
    echo "   Please ensure PostgreSQL is running and credentials are correct"
    exit 1
}

# Create database if it doesn't exist
echo "📦 Creating database if needed..."
PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || {
    PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME"
    echo "✅ Database created: $DB_NAME"
}

# Run migration
echo "🔄 Running migration..."
PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f migration.sql

echo "✅ Migration complete!"
echo ""

# Run Prisma generate
echo "🔧 Generating Prisma client..."
cd ..
npx prisma generate

echo ""
echo "🎉 Database setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env with your HubSpot credentials (if using)"
echo "2. Run 'npm run dev' in /apps/api to start the API server"
echo "3. Run 'npm run dev' in /apps/web to start the web app"
echo "4. Visit http://localhost:3011/contacts to manage relationships"
echo ""
echo "📚 Documentation:"
echo "- Database schema: /database/schema.sql"
echo "- API testing: /test-api.http"
echo "- Prisma schema: /prisma/schema.prisma"