#!/bin/bash

# Apply Recommendations Migration to Supabase
# This script guides you through applying the migration

echo "=========================================="
echo "WisdomOS Recommendations Migration"
echo "=========================================="
echo ""
echo "To apply the recommendations table migration, you have two options:"
echo ""
echo "Option 1: Using Supabase SQL Editor (Recommended)"
echo "1. Open: https://supabase.com/dashboard/project/yvssmqyphqgvpkwudeoa/sql"
echo "2. Copy the contents of: supabase/migrations/20251029_recommendations_system.sql"
echo "3. Paste into SQL Editor and click 'Run'"
echo ""
echo "Option 2: Using psql command line"
echo "Run this command (you'll be prompted for the database password):"
echo ""
echo "psql 'postgresql://postgres.yvssmqyphqgvpkwudeoa:PASSWORD@aws-1-us-east-2.pooler.supabase.com:6543/postgres' -f supabase/migrations/20251029_recommendations_system.sql"
echo ""
echo "Replace PASSWORD with your Supabase database password."
echo ""
echo "=========================================="
echo ""

# Ask if user wants to proceed with Option 2
read -p "Do you want to try Option 2 now? (y/n): " answer

if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
    echo ""
    read -sp "Enter your Supabase database password: " DB_PASSWORD
    echo ""
    echo ""
    echo "Applying migration..."

    psql "postgresql://postgres.yvssmqyphqgvpkwudeoa:${DB_PASSWORD}@aws-1-us-east-2.pooler.supabase.com:6543/postgres" \
        -f "$(dirname "$0")/../supabase/migrations/20251029_recommendations_system.sql"

    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Migration applied successfully!"
        echo ""
        echo "Next steps:"
        echo "1. Verify in Supabase Dashboard > Database > Tables"
        echo "2. You should see the 'recommendations' table"
        echo "3. Redeploy your Vercel app to use the new environment variables"
    else
        echo ""
        echo "❌ Migration failed. Please try Option 1 (SQL Editor) instead."
    fi
else
    echo ""
    echo "Please use the Supabase SQL Editor to apply the migration manually."
    echo "SQL file location: supabase/migrations/20251029_recommendations_system.sql"
fi
