#!/bin/bash

echo "📋 WisdomOS Database Setup Instructions"
echo "========================================"
echo ""
echo "Since we're using the shared Supabase instance (flttywslqlhnjzlknkkqg),"
echo "the tables should already exist from the pvthostel project."
echo ""
echo "To verify or create tables manually:"
echo ""
echo "1. Go to Supabase Dashboard:"
echo "   https://supabase.com/dashboard/project/flttywslqlhnjzlknkkqg/editor"
echo ""
echo "2. The following tables should exist:"
echo "   - guests (for check-in system)"
echo "   - bookings (for reservations)"
echo "   - users (for WisdomOS users)"
echo "   - life_areas (for Phoenix life areas)"
echo "   - contributions (for Being/Doing/Having)"
echo "   - journal_entries (for journaling)"
echo "   - fulfillment_scores (for tracking)"
echo "   - hubspot_sync (for integration)"
echo ""
echo "3. If tables are missing, run the SQL from:"
echo "   /supabase/migrations/001_create_booking_tables.sql"
echo "   /supabase/migrations/002_create_wisdomos_tables.sql"
echo ""
echo "Testing connection now..."
echo ""

# Test with curl
echo "🧪 Testing Supabase API connection..."
curl -s -X GET \
  "https://flttywslqlhnjzlknkkqg.supabase.co/rest/v1/guests?select=count" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsdHR5d3NscWxobmp6bGtua2txZyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzM0NTk3MDUxLCJleHAiOjIwNTAxNzMwNTF9.wJLSSl1mNWR-8BlN7UWtFfP7j5wYtL6t53ND9uLkxYs" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsdHR5d3NscWxobmp6bGtua2txZyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzM0NTk3MDUxLCJleHAiOjIwNTAxNzMwNTF9.wJLSSl1mNWR-8BlN7UWtFfP7j5wYtL6t53ND9uLkxYs" \
  | jq '.' 2>/dev/null || echo "Response received (install jq for formatted output)"

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Commit and push changes"
echo "2. Deploy to Vercel"
echo "3. Test at: https://wisdomos-phoenix-frontend.vercel.app/checkin"