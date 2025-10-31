#!/bin/bash

# Script to list all available scripts with descriptions
# Usage: ./scripts/list-scripts.sh

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "                    WisdomOS Scripts Directory"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "📦 DEPLOYMENT SCRIPTS (./scripts/deployment/)"
echo "  • deploy-now.sh          - Quick deployment to production"
echo "  • deploy-vercel.sh       - Deploy to Vercel platform"
echo "  • deploy.sh              - General deployment script"
echo ""

echo "🔧 SETUP SCRIPTS (./scripts/setup/)"
echo "  • setup-database.sh      - Initialize PostgreSQL database"
echo "  • setup-supabase.sh      - Configure Supabase integration"
echo "  • setup-secrets.sh       - Setup environment secrets"
echo "  • setup-environment.sh   - Setup environment configuration"
echo "  • auto-save-keys-to-1password.sh - Save keys to 1Password"
echo ""

echo "📂 GIT & REPOSITORY SCRIPTS (./scripts/git/)"
echo "  • github-setup.sh        - Initialize GitHub repository"
echo "  • initialize-empty-repos.sh - Batch create repositories"
echo "  • setup-git-structure.sh - Configure git structure and hooks"
echo ""

echo "🧪 TESTING SCRIPTS (./scripts/testing/)"
echo "  • run-tests.sh           - Execute full test suite"
echo ""

echo "🔄 MIGRATION SCRIPTS (./scripts/migration/)"
echo "  • update-imports.sh      - Update package imports (already run)"
echo ""

echo "📜 TYPESCRIPT SCRIPTS (./scripts/)"
echo "  • init-database.ts       - Initialize database schema"
echo "  • seed-demo-data.ts      - Seed demo/test data"
echo "  • seed-tracker-data.ts   - Seed tracker-specific data"
echo "  • setup-hubspot-webhooks.ts - Configure HubSpot webhooks"
echo "  • test-basic-schema.ts   - Test basic database schema"
echo "  • test-database-integration.ts - Integration tests"
echo "  • test-multi-tenancy.ts  - Multi-tenancy tests"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Usage: ./scripts/category/script-name.sh"
echo "Full docs: See scripts/SHELL-SCRIPTS.md"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
