#!/bin/bash

# ==============================================
# WisdomOS Phase 3 - 1Password Setup Script
# ==============================================
#
# This script helps you store WisdomOS credentials in 1Password
#
# Prerequisites:
# 1. Install 1Password CLI: brew install --cask 1password-cli
# 2. Sign in: op signin
# 3. Have your Supabase credentials ready
#
# Usage:
#   chmod +x setup-1password.sh
#   ./setup-1password.sh
#

set -e

echo "🔐 WisdomOS Phase 3 - 1Password Setup"
echo "======================================"
echo ""

# Check if 1Password CLI is installed
if ! command -v op &> /dev/null; then
    echo "❌ 1Password CLI is not installed."
    echo ""
    echo "Install it with: brew install --cask 1password-cli"
    echo "Then run: op signin"
    exit 1
fi

# Check if signed in
if ! op account list &> /dev/null; then
    echo "❌ Not signed in to 1Password."
    echo ""
    echo "Please run: op signin"
    exit 1
fi

echo "✅ 1Password CLI is ready"
echo ""

# Define the vault (change if needed)
VAULT="Private"
ITEM_NAME="WisdomOS-Phase3-Development"

echo "📝 Creating 1Password item: $ITEM_NAME in vault: $VAULT"
echo ""

# Pre-filled values
SUPABASE_URL="https://yvssmqyphqgvpkwudeoa.supabase.co"
SUPABASE_PROJECT_REF="yvssmqyphqgvpkwudeoa"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2c3NtcXlwaHFndnBrd3VkZW9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMDU4NjQsImV4cCI6MjA3MTU4MTg2NH0.3sPL2dBVvs6prTLb5hIjrPjoJRKOoSR4XSpYPZbFl-k"

# Generated secrets
NEXTAUTH_SECRET="6ltD7aFeOw/xo+bnT4xT4B74Cw0l4kmtZbfuqXPQXRY="
JWT_SECRET="EkcRMPMod1rZdCWiSvtlBChqeFgAutkg3uuDAvzqJZk="
MASTER_ENCRYPTION_KEY="OW4DTrpH26TcIC8cfmzEwvNXPa9KzmFsV5ASfdWqLss="

# Prompt for missing credentials
echo "⚠️  You need to provide the following from your Supabase dashboard:"
echo "   Dashboard: https://supabase.com/dashboard/project/yvssmqyphqgvpkwudeoa"
echo ""

read -p "Enter Supabase SERVICE_ROLE key (starts with eyJ...): " SUPABASE_SERVICE_KEY
if [ -z "$SUPABASE_SERVICE_KEY" ]; then
    echo "❌ Service role key is required"
    exit 1
fi

read -p "Enter Supabase JWT Secret (from Project Settings → API): " SUPABASE_JWT_SECRET
if [ -z "$SUPABASE_JWT_SECRET" ]; then
    echo "❌ JWT secret is required"
    exit 1
fi

read -sp "Enter your Supabase Database Password: " DATABASE_PASSWORD
echo ""
if [ -z "$DATABASE_PASSWORD" ]; then
    echo "❌ Database password is required"
    exit 1
fi

DATABASE_URL="postgresql://postgres.yvssmqyphqgvpkwudeoa:${DATABASE_PASSWORD}@aws-0-us-west-1.pooler.supabase.com:6543/postgres"

echo ""
echo "🔨 Creating 1Password item..."

# Create the item with a template
op item create \
    --category=server \
    --title="$ITEM_NAME" \
    --vault="$VAULT" \
    --tags="wisdomos,development,supabase" \
    "url=$SUPABASE_URL" \
    "username=postgres" \
    "password=$DATABASE_PASSWORD" 2>/dev/null || true

# Add Supabase credentials
echo "📦 Adding Supabase credentials..."
op item edit "$ITEM_NAME" --vault="$VAULT" \
    "Supabase Project URL[text]=$SUPABASE_URL" \
    "Supabase Project Ref[text]=$SUPABASE_PROJECT_REF" \
    "Supabase Anon Key[password]=$SUPABASE_ANON_KEY" \
    "Supabase Service Key[password]=$SUPABASE_SERVICE_KEY" \
    "Supabase JWT Secret[password]=$SUPABASE_JWT_SECRET" \
    "Database URL[password]=$DATABASE_URL" 2>/dev/null || true

# Add application secrets
echo "🔑 Adding application secrets..."
op item edit "$ITEM_NAME" --vault="$VAULT" \
    "NextAuth Secret[password]=$NEXTAUTH_SECRET" \
    "JWT Secret[password]=$JWT_SECRET" \
    "Master Encryption Key[password]=$MASTER_ENCRYPTION_KEY" 2>/dev/null || true

# Add configuration
echo "⚙️  Adding configuration..."
op item edit "$ITEM_NAME" --vault="$VAULT" \
    "API URL[text]=http://localhost:4000" \
    "Web URL[text]=http://localhost:3000" \
    "Community URL[text]=http://localhost:3002" \
    "CORS Origin[text]=http://localhost:3000" \
    "Node Environment[text]=development" 2>/dev/null || true

echo ""
echo "✅ Successfully created 1Password item: $ITEM_NAME"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. View the item:"
echo "   op item get '$ITEM_NAME' --vault='$VAULT'"
echo ""
echo "2. Update .env.local with 1Password references:"
echo "   See the generated .env.1password file"
echo ""
echo "3. Run commands with secrets injected:"
echo "   op run -- npm run dev"
echo ""
echo "4. Optional: Add third-party API keys (HubSpot, OpenAI, etc.):"
echo "   op item edit '$ITEM_NAME' --vault='$VAULT' 'OpenAI API Key[password]=sk-...'"
echo ""

# Create .env file with 1Password references
cat > .env.1password << 'EOF'
# ==============================================
# WisdomOS Phase 3 - 1Password References
# ==============================================
#
# This file uses 1Password CLI references.
# Run commands with: op run -- npm run dev
#
# Make sure you're signed in: op signin

# Supabase
NEXT_PUBLIC_SUPABASE_URL=op://Private/WisdomOS-Phase3-Development/Supabase Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=op://Private/WisdomOS-Phase3-Development/Supabase Anon Key
SUPABASE_SERVICE_KEY=op://Private/WisdomOS-Phase3-Development/Supabase Service Key
SUPABASE_JWT_SECRET=op://Private/WisdomOS-Phase3-Development/Supabase JWT Secret
DATABASE_URL=op://Private/WisdomOS-Phase3-Development/Database URL

# Security
JWT_SECRET=op://Private/WisdomOS-Phase3-Development/JWT Secret
NEXTAUTH_SECRET=op://Private/WisdomOS-Phase3-Development/NextAuth Secret
MASTER_ENCRYPTION_KEY=op://Private/WisdomOS-Phase3-Development/Master Encryption Key
NEXTAUTH_URL=http://localhost:3000

# API Configuration
NEXT_PUBLIC_API_BASE=op://Private/WisdomOS-Phase3-Development/API URL
API_URL=op://Private/WisdomOS-Phase3-Development/API URL
WEB_URL=op://Private/WisdomOS-Phase3-Development/Web URL
COMMUNITY_URL=op://Private/WisdomOS-Phase3-Development/Community URL
CORS_ORIGIN=op://Private/WisdomOS-Phase3-Development/CORS Origin

# Development
NODE_ENV=op://Private/WisdomOS-Phase3-Development/Node Environment
LOG_LEVEL=debug
PORT=4000

# Feature Flags
ENABLE_REGISTRATION=true
ENABLE_LEGACY_VAULT=true
ENABLE_COMMUNITY_HUB=true
ENABLE_GAMIFICATION=true
ENABLE_AI_FEATURES=false
EOF

echo "📄 Created .env.1password with 1Password CLI references"
echo ""
echo "🎉 Setup complete!"
