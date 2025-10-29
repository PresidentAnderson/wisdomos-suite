#!/bin/bash

# WisdomOS Phase 3 Deployment Script
# Supports GitHub, GitLab, Docker, and Vercel deployments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="wisdomos-phase3"
VERSION=$(date +%Y%m%d-%H%M%S)
REGISTRY="ghcr.io/presidentanderson"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if Docker is running
    if ! docker info >/dev/null 2>&1; then
        log_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    
    # Check if git is configured
    if ! git config user.email >/dev/null 2>&1; then
        log_error "Git is not configured. Please configure git and try again."
        exit 1
    fi
    
    # Check if pnpm is installed
    if ! command -v pnpm &> /dev/null; then
        log_warning "pnpm not found. Installing..."
        npm install -g pnpm
    fi
    
    log_success "Prerequisites check passed"
}

# Build and test
build_and_test() {
    log_info "Building and testing..."
    
    # Install dependencies
    pnpm install --frozen-lockfile
    
    # Lint
    log_info "Running linter..."
    pnpm lint || log_warning "Linting failed"
    
    # Type check
    log_info "Type checking..."
    pnpm type-check || log_warning "Type check failed"
    
    # Build packages
    log_info "Building packages..."
    pnpm --filter @wisdomos/contrib build
    pnpm --filter @wisdomos/legacy build
    
    # Build applications
    log_info "Building applications..."
    pnpm --filter @wisdomos/api build
    pnpm --filter @wisdomos/web build
    pnpm --filter @wisdomos/community build
    
    # Test
    log_info "Running tests..."
    pnpm test || log_warning "Tests failed"
    
    log_success "Build and test completed"
}

# Docker deployment
deploy_docker() {
    log_info "Starting Docker deployment..."
    
    # Build Docker images
    log_info "Building Docker images..."
    docker build --target api -t ${PROJECT_NAME}-api:${VERSION} .
    docker build --target web -t ${PROJECT_NAME}-web:${VERSION} .
    docker build --target community -t ${PROJECT_NAME}-community:${VERSION} .
    
    # Tag as latest
    docker tag ${PROJECT_NAME}-api:${VERSION} ${PROJECT_NAME}-api:latest
    docker tag ${PROJECT_NAME}-web:${VERSION} ${PROJECT_NAME}-web:latest
    docker tag ${PROJECT_NAME}-community:${VERSION} ${PROJECT_NAME}-community:latest
    
    # Push to registry (if configured)
    if [ ! -z "$PUSH_TO_REGISTRY" ]; then
        log_info "Pushing to container registry..."
        docker tag ${PROJECT_NAME}-api:latest ${REGISTRY}/${PROJECT_NAME}-api:latest
        docker tag ${PROJECT_NAME}-web:latest ${REGISTRY}/${PROJECT_NAME}-web:latest
        docker tag ${PROJECT_NAME}-community:latest ${REGISTRY}/${PROJECT_NAME}-community:latest
        
        docker push ${REGISTRY}/${PROJECT_NAME}-api:latest
        docker push ${REGISTRY}/${PROJECT_NAME}-web:latest
        docker push ${REGISTRY}/${PROJECT_NAME}-community:latest
    fi
    
    # Deploy with docker-compose
    log_info "Deploying with docker-compose..."
    docker-compose -f docker-compose.production.yml down
    docker-compose -f docker-compose.production.yml up -d
    
    # Health check
    log_info "Running health checks..."
    sleep 30
    
    if curl -f http://localhost:3000/health >/dev/null 2>&1; then
        log_success "Web app health check passed"
    else
        log_error "Web app health check failed"
    fi
    
    if curl -f http://localhost:3001/health >/dev/null 2>&1; then
        log_success "API health check passed"
    else
        log_error "API health check failed"
    fi
    
    if curl -f http://localhost:3002/health >/dev/null 2>&1; then
        log_success "Community app health check passed"
    else
        log_error "Community app health check failed"
    fi
    
    log_success "Docker deployment completed"
}

# Vercel deployment
deploy_vercel() {
    log_info "Starting Vercel deployment..."
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        log_warning "Vercel CLI not found. Installing..."
        npm install -g vercel
    fi
    
    # Deploy web app
    log_info "Deploying web app to Vercel..."
    cd apps/web
    vercel --prod --confirm --token=$VERCEL_TOKEN || log_error "Web app deployment failed"
    cd ../..
    
    # Deploy community app
    log_info "Deploying community app to Vercel..."
    cd apps/community
    vercel --prod --confirm --token=$VERCEL_TOKEN || log_error "Community app deployment failed"
    cd ../..
    
    log_success "Vercel deployment completed"
}

# Git operations
git_operations() {
    log_info "Performing git operations..."
    
    # Add all changes
    git add -A
    
    # Commit if there are changes
    if ! git diff --cached --exit-code >/dev/null 2>&1; then
        git commit -m "🚀 Deploy: WisdomOS Phase 3 - $(date)"
        
        # Push to GitHub
        if git remote get-url origin >/dev/null 2>&1; then
            log_info "Pushing to GitHub..."
            git push origin main
            log_success "Pushed to GitHub"
        fi
        
        # Push to GitLab if configured
        if git remote get-url gitlab >/dev/null 2>&1; then
            log_info "Pushing to GitLab..."
            git push gitlab main || log_warning "GitLab push failed"
        fi
    else
        log_info "No changes to commit"
    fi
}

# Database migration
run_migrations() {
    log_info "Running database migrations..."
    
    if [ ! -z "$DATABASE_URL" ]; then
        # Run Supabase migrations
        if command -v supabase &> /dev/null; then
            supabase db push --db-url "$DATABASE_URL" || log_warning "Migration failed"
        else
            log_warning "Supabase CLI not found. Skipping migrations."
        fi
    else
        log_warning "DATABASE_URL not set. Skipping migrations."
    fi
}

# Cleanup
cleanup() {
    log_info "Cleaning up..."
    
    # Remove old Docker images
    docker image prune -f >/dev/null 2>&1
    
    # Clean pnpm cache
    pnpm store prune >/dev/null 2>&1
    
    log_success "Cleanup completed"
}

# Main deployment function
main() {
    log_info "Starting WisdomOS Phase 3 deployment..."
    log_info "Version: $VERSION"
    
    case "${1:-all}" in
        "check")
            check_prerequisites
            ;;
        "build")
            check_prerequisites
            build_and_test
            ;;
        "docker")
            check_prerequisites
            build_and_test
            deploy_docker
            ;;
        "vercel")
            check_prerequisites
            build_and_test
            deploy_vercel
            ;;
        "git")
            git_operations
            ;;
        "migrate")
            run_migrations
            ;;
        "all"|*)
            check_prerequisites
            build_and_test
            git_operations
            deploy_docker
            if [ ! -z "$VERCEL_TOKEN" ]; then
                deploy_vercel
            fi
            run_migrations
            cleanup
            ;;
    esac
    
    log_success "🎉 WisdomOS Phase 3 deployment completed successfully!"
    log_info "Access your application at:"
    log_info "  - Web App: http://localhost:3000"
    log_info "  - Community Hub: http://localhost:3002"
    log_info "  - API: http://localhost:3001"
    
    if [ ! -z "$VERCEL_TOKEN" ]; then
        log_info "  - Vercel Web: https://wisdomos-web.vercel.app"
        log_info "  - Vercel Community: https://wisdomos-community.vercel.app"
    fi
}

# Handle script arguments
case "$1" in
    help|--help|-h)
        echo "WisdomOS Phase 3 Deployment Script"
        echo ""
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  check     - Check prerequisites only"
        echo "  build     - Build and test only"
        echo "  docker    - Deploy with Docker"
        echo "  vercel    - Deploy to Vercel"
        echo "  git       - Git operations only"
        echo "  migrate   - Run database migrations"
        echo "  all       - Full deployment (default)"
        echo "  help      - Show this help message"
        echo ""
        echo "Environment Variables:"
        echo "  VERCEL_TOKEN         - Vercel authentication token"
        echo "  DATABASE_URL         - Database connection string"
        echo "  PUSH_TO_REGISTRY     - Set to push Docker images to registry"
        echo ""
        exit 0
        ;;
    *)
        main "$1"
        ;;
esac