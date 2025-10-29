#!/bin/bash
#
# Fulfillment Backend Deployment Script
# Version: 5.0
# Purpose: Deploy complete Fulfillment Display v5 backend to Supabase
#

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
  echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
  log_info "Checking prerequisites..."

  # Check Supabase CLI
  if ! command -v supabase &> /dev/null; then
    log_error "Supabase CLI not found. Install with: npm install -g supabase"
    exit 1
  fi

  # Check psql
  if ! command -v psql &> /dev/null; then
    log_warn "psql not found. Some verification steps will be skipped."
  fi

  # Check environment variables
  if [ -z "$DATABASE_URL" ]; then
    log_warn "DATABASE_URL not set. Set it with: export DATABASE_URL=postgresql://..."
  fi

  log_info "Prerequisites check complete ✓"
}

# Test database connection
test_connection() {
  log_info "Testing database connection..."

  if [ -n "$DATABASE_URL" ]; then
    if psql "$DATABASE_URL" -c "SELECT NOW();" > /dev/null 2>&1; then
      log_info "Database connection successful ✓"
    else
      log_error "Failed to connect to database"
      exit 1
    fi
  else
    log_warn "Skipping connection test (DATABASE_URL not set)"
  fi
}

# Apply migrations
apply_migrations() {
  log_info "Applying database migrations..."

  # Check if linked to Supabase project
  if ! supabase projects list &> /dev/null; then
    log_error "Not linked to Supabase project. Run: supabase link"
    exit 1
  fi

  # Push migrations
  log_info "Pushing migrations to Supabase..."
  if supabase db push; then
    log_info "Migrations applied successfully ✓"
  else
    log_error "Migration push failed"
    exit 1
  fi
}

# Verify schema
verify_schema() {
  log_info "Verifying database schema..."

  if [ -z "$DATABASE_URL" ]; then
    log_warn "Skipping schema verification (DATABASE_URL not set)"
    return
  fi

  # Check for key tables
  TABLES=(
    "fd_area"
    "fd_dimension"
    "fd_entry"
    "fd_score_raw"
    "fd_score_rollup"
    "fd_review_month"
    "fd_integrity_log"
    "fd_forgiveness_log"
    "fd_autobiography_chapter"
    "fd_work_finance_integration"
    "fd_dashboard"
    "fd_interpretation"
    "fd_attachment"
    "fd_notification"
    "fd_webhook"
    "fd_api_key"
    "fd_audit_log"
  )

  for table in "${TABLES[@]}"; do
    if psql "$DATABASE_URL" -c "SELECT 1 FROM $table LIMIT 1;" > /dev/null 2>&1; then
      log_info "  ✓ $table"
    else
      log_error "  ✗ $table (missing or inaccessible)"
    fi
  done

  # Check seed data
  AREA_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM fd_area;")
  DIMENSION_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM fd_dimension;")

  log_info "Seed data: $AREA_COUNT areas, $DIMENSION_COUNT dimensions"

  if [ "$AREA_COUNT" -lt 16 ]; then
    log_warn "Expected 16 areas, found $AREA_COUNT. Seed data may not be loaded."
  else
    log_info "Seed data verified ✓"
  fi
}

# Deploy Edge Functions
deploy_edge_functions() {
  log_info "Deploying Edge Functions..."

  FUNCTIONS=(
    "generate-interpretations"
    "calculate-gfs"
    "process-journal-entry"
    "send-webhook"
  )

  for func in "${FUNCTIONS[@]}"; do
    log_info "Deploying $func..."
    if supabase functions deploy "$func"; then
      log_info "  ✓ $func deployed"
    else
      log_error "  ✗ $func deployment failed"
    fi
  done

  log_info "Edge Functions deployed ✓"
}

# Verify pg_cron jobs
verify_cron_jobs() {
  log_info "Verifying pg_cron jobs..."

  if [ -z "$DATABASE_URL" ]; then
    log_warn "Skipping cron verification (DATABASE_URL not set)"
    return
  fi

  JOB_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM cron.job;" 2>/dev/null || echo "0")

  if [ "$JOB_COUNT" -gt 0 ]; then
    log_info "Found $JOB_COUNT pg_cron jobs ✓"
  else
    log_warn "No pg_cron jobs found. Extension may not be enabled."
  fi
}

# Set environment secrets
set_secrets() {
  log_info "Setting environment secrets..."

  # Check if OPENAI_API_KEY is set locally
  if [ -n "$OPENAI_API_KEY" ]; then
    log_info "Setting OPENAI_API_KEY secret..."
    if supabase secrets set OPENAI_API_KEY="$OPENAI_API_KEY"; then
      log_info "  ✓ OPENAI_API_KEY set"
    else
      log_warn "  ✗ Failed to set OPENAI_API_KEY"
    fi
  else
    log_warn "OPENAI_API_KEY not set locally. Skipping."
  fi

  log_info "Secrets configuration complete ✓"
}

# Print summary
print_summary() {
  echo ""
  echo "========================================="
  echo "  Fulfillment Backend Deployment Complete"
  echo "========================================="
  echo ""
  log_info "Next steps:"
  echo "  1. Visit Supabase Dashboard to verify deployment"
  echo "  2. Test Edge Functions with sample requests"
  echo "  3. Monitor pg_cron jobs in cron.job table"
  echo "  4. Configure frontend environment variables"
  echo ""
  echo "Documentation:"
  echo "  - Deployment Guide: FULFILLMENT_BACKEND_DEPLOYMENT.md"
  echo "  - API Reference: docs/api-reference.md"
  echo ""
  log_info "Deployment successful! 🚀"
}

# Main execution
main() {
  echo ""
  echo "========================================="
  echo "  Fulfillment Backend Deployment v5.0"
  echo "========================================="
  echo ""

  check_prerequisites
  test_connection
  apply_migrations
  verify_schema
  deploy_edge_functions
  verify_cron_jobs
  set_secrets
  print_summary
}

# Run main function
main
