#!/bin/bash
#
# Deploy WisdomOS to Netlify
# Version: Sprint-0
# Purpose: Deploy Next.js app + Edge Functions + Supabase backend to Netlify
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

log_step() {
  echo -e "${BLUE}[STEP]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
  log_step "Checking prerequisites..."

  # Check Netlify CLI
  if ! command -v netlify &> /dev/null; then
    log_error "Netlify CLI not found. Install with: npm install -g netlify-cli"
    exit 1
  fi

  # Check if logged in to Netlify
  if ! netlify status &> /dev/null; then
    log_warn "Not logged in to Netlify. Running login..."
    netlify login
  fi

  # Check pnpm
  if ! command -v pnpm &> /dev/null; then
    log_error "pnpm not found. Install with: npm install -g pnpm"
    exit 1
  fi

  log_info "Prerequisites check complete ✓"
}

# Check environment variables
check_env_vars() {
  log_step "Checking environment variables..."

  REQUIRED_VARS=(
    "SUPABASE_URL"
    "SUPABASE_SERVICE_ROLE_KEY"
    "DATABASE_URL"
  )

  MISSING_VARS=()

  for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
      MISSING_VARS+=("$var")
    fi
  done

  if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    log_warn "Missing environment variables:"
    for var in "${MISSING_VARS[@]}"; do
      echo "  - $var"
    done
    log_info "You'll need to set these in Netlify dashboard after deployment."
  else
    log_info "All required environment variables found ✓"
  fi
}

# Install dependencies
install_dependencies() {
  log_step "Installing dependencies..."

  if [ -f "package.json" ]; then
    pnpm install
    log_info "Dependencies installed ✓"
  else
    log_warn "No package.json found, skipping dependency installation"
  fi
}

# Generate Prisma client
generate_prisma() {
  log_step "Generating Prisma client..."

  if [ -d "packages/db" ]; then
    pnpm db:generate
    log_info "Prisma client generated ✓"
  else
    log_warn "No Prisma schema found, skipping"
  fi
}

# Build application
build_app() {
  log_step "Building application..."

  if pnpm build 2>&1 | tee build.log; then
    log_info "Build successful ✓"
  else
    log_error "Build failed. Check build.log for details."
    exit 1
  fi
}

# Deploy to Netlify
deploy_to_netlify() {
  log_step "Deploying to Netlify..."

  # Check if site exists
  if netlify status | grep -q "Site Id"; then
    log_info "Existing site found, deploying..."
    DEPLOY_CMD="netlify deploy --prod"
  else
    log_info "No site found, creating new site..."
    DEPLOY_CMD="netlify deploy --prod"
  fi

  # Deploy
  if $DEPLOY_CMD; then
    log_info "Deployment successful ✓"
  else
    log_error "Deployment failed"
    exit 1
  fi
}

# Set environment variables in Netlify
set_netlify_env() {
  log_step "Setting environment variables in Netlify..."

  if [ -n "$SUPABASE_URL" ]; then
    netlify env:set SUPABASE_URL "$SUPABASE_URL" --context production
    log_info "  ✓ SUPABASE_URL set"
  fi

  if [ -n "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    netlify env:set SUPABASE_SERVICE_ROLE_KEY "$SUPABASE_SERVICE_ROLE_KEY" --context production
    log_info "  ✓ SUPABASE_SERVICE_ROLE_KEY set"
  fi

  if [ -n "$DATABASE_URL" ]; then
    netlify env:set DATABASE_URL "$DATABASE_URL" --context production
    log_info "  ✓ DATABASE_URL set"
  fi

  if [ -n "$OPENAI_API_KEY" ]; then
    netlify env:set OPENAI_API_KEY "$OPENAI_API_KEY" --context production
    log_info "  ✓ OPENAI_API_KEY set"
  fi

  if [ -n "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    netlify env:set NEXT_PUBLIC_SUPABASE_URL "$NEXT_PUBLIC_SUPABASE_URL" --context production
    log_info "  ✓ NEXT_PUBLIC_SUPABASE_URL set"
  fi

  if [ -n "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    netlify env:set NEXT_PUBLIC_SUPABASE_ANON_KEY "$NEXT_PUBLIC_SUPABASE_ANON_KEY" --context production
    log_info "  ✓ NEXT_PUBLIC_SUPABASE_ANON_KEY set"
  fi

  log_info "Environment variables configured ✓"
}

# Deploy Edge Functions
deploy_edge_functions() {
  log_step "Deploying Edge Functions..."

  if [ -d "netlify/edge-functions" ]; then
    log_info "Edge functions will be deployed automatically with site"
    log_info "  - generate-interpretations"
    log_info "  - calculate-gfs"
    log_info "Available at:"
    log_info "  - https://[your-site].netlify.app/functions/generate-interpretations"
    log_info "  - https://[your-site].netlify.app/functions/calculate-gfs"
  else
    log_warn "No edge functions found"
  fi
}

# Verify deployment
verify_deployment() {
  log_step "Verifying deployment..."

  SITE_URL=$(netlify status | grep -oP 'URL:\s+\K\S+' || echo "")

  if [ -n "$SITE_URL" ]; then
    log_info "Site deployed at: $SITE_URL"

    # Test site
    if curl -s -o /dev/null -w "%{http_code}" "$SITE_URL" | grep -q "200"; then
      log_info "Site is responding ✓"
    else
      log_warn "Site may not be fully ready yet"
    fi
  else
    log_warn "Could not determine site URL"
  fi
}

# Print summary
print_summary() {
  echo ""
  echo "========================================="
  echo "  Netlify Deployment Complete!"
  echo "========================================="
  echo ""

  SITE_URL=$(netlify status | grep -oP 'URL:\s+\K\S+' || echo "")

  if [ -n "$SITE_URL" ]; then
    log_info "Your site is live at:"
    echo "  $SITE_URL"
    echo ""
    log_info "Edge Functions available at:"
    echo "  $SITE_URL/functions/generate-interpretations"
    echo "  $SITE_URL/functions/calculate-gfs"
    echo ""
  fi

  log_info "Next steps:"
  echo "  1. Visit Netlify dashboard to verify deployment"
  echo "  2. Test Edge Functions with sample requests"
  echo "  3. Configure custom domain (optional)"
  echo "  4. Set up monitoring and analytics"
  echo ""

  log_info "Useful commands:"
  echo "  - View logs: netlify logs"
  echo "  - Open dashboard: netlify open"
  echo "  - View functions: netlify functions:list"
  echo ""

  log_info "Deployment successful! 🚀"
}

# Main execution
main() {
  echo ""
  echo "========================================="
  echo "  WisdomOS Netlify Deployment"
  echo "  Sprint-0 | Fulfillment v5"
  echo "========================================="
  echo ""

  # Load environment variables from .env.local if it exists
  if [ -f ".env.local" ]; then
    log_info "Loading environment variables from .env.local"
    set -a
    source .env.local
    set +a
  fi

  check_prerequisites
  check_env_vars
  install_dependencies
  generate_prisma
  build_app
  deploy_to_netlify
  set_netlify_env
  deploy_edge_functions
  verify_deployment
  print_summary
}

# Run main function
main
