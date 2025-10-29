#!/bin/bash

# =====================================================
# Generate TypeScript types from Supabase schema
# =====================================================
# Purpose: Auto-generate TypeScript types for type safety
# Date: 2025-10-29
# =====================================================

set -e

echo "🔄 Generating TypeScript types from Supabase schema..."

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    npm install -g supabase
fi

# Generate types
supabase gen types typescript --local > packages/types/supabase.ts

echo "✅ Types generated at packages/types/supabase.ts"

# Also generate Zod schemas for runtime validation (optional)
if command -v zod-prisma-types &> /dev/null; then
    echo "🔄 Generating Zod schemas..."
    npx zod-prisma-types generate
    echo "✅ Zod schemas generated"
fi

# Generate Drizzle schema (if using Drizzle)
# drizzle-kit introspect:pg --out=./packages/db/drizzle --connectionString=$DATABASE_URL

echo "🎉 Type generation complete!"
