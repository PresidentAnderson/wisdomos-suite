#!/bin/bash
# 🔧 WisdomOS Git Structure Setup
# Creates branches, tags, and CI/CD workflows for all repositories

set -e

GITHUB_USERNAME="presidentanderson"
GH_CLI="/opt/homebrew/bin/gh"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔥 Setting up WisdomOS Git Structure${NC}"

# Repository configuration
ALL_REPOS=(
  "wisdomos-core"
  "wisdomos-api" 
  "wisdomos-web"
  "wisdomos-ios"
  "wisdomos-android"
  "wisdomos-desktop"
  "wisdomos-infrastructure"
  "wisdomos-documentation"
)

# Branch structure
BRANCHES=("develop" "staging" "release/v1.0.0")
INITIAL_TAG="v1.0.0-alpha"

# Build failure tracking
BUILD_FAILURES=()

echo -e "${YELLOW}📋 Repository Git Structure Setup${NC}"

for repo in "${ALL_REPOS[@]}"; do
  echo -e "\n${BLUE}🔧 Configuring $repo...${NC}"
  
  # Check if repo has any commits
  if ! $GH_CLI api repos/$GITHUB_USERNAME/$repo/commits --jq '.[0].sha' 2>/dev/null; then
    echo -e "${YELLOW}⚠️  $repo has no commits yet - creating initial structure${NC}"
    
    # Create initial README if repo is empty
    echo "# $repo

WisdomOS $(echo $repo | sed 's/wisdomos-//' | sed 's/-/ /' | awk '{for(i=1;i<=NF;i++)sub(/./,toupper(substr($i,1,1)),$i)}1') - Phoenix Operating System for Life Transformation

## 🔥 Overview
This repository contains the $(echo $repo | sed 's/wisdomos-//') component of the WisdomOS platform.

## 🚀 Quick Start
\`\`\`bash
# Install dependencies
pnpm install

# Start development
pnpm dev
\`\`\`

## 📱 Platform Integration
This component integrates with the WisdomOS ecosystem:
- **Database**: Supabase PostgreSQL
- **Auth**: Supabase Auth  
- **Real-time**: WebSocket collaboration
- **Deployment**: Automated CI/CD

## 🔐 Security
All secrets are managed via GitHub Secrets. Never commit sensitive data.

## 📚 Documentation
See [wisdomos-documentation](https://github.com/$GITHUB_USERNAME/wisdomos-documentation) for detailed guides.

---

🔥 **Phoenix rises through transformation!**
" | $GH_CLI api repos/$GITHUB_USERNAME/$repo/contents/README.md --method PUT --field message="Initial README for $repo" --field content=@- --input - 2>/dev/null || true
  fi
  
  # Create branch structure
  echo -e "${YELLOW}🌿 Creating branch structure...${NC}"
  for branch in "${BRANCHES[@]}"; do
    echo -e "   Creating branch: $branch"
    $GH_CLI api repos/$GITHUB_USERNAME/$repo/git/refs --method POST \
      --field ref="refs/heads/$branch" \
      --field sha="$(git ls-remote https://github.com/$GITHUB_USERNAME/$repo.git HEAD | cut -f1)" 2>/dev/null || echo "   ⚠️  Branch $branch may already exist"
  done
  
  # Create initial tag
  echo -e "${YELLOW}🏷️  Creating initial tag: $INITIAL_TAG${NC}"
  $GH_CLI api repos/$GITHUB_USERNAME/$repo/git/refs --method POST \
    --field ref="refs/tags/$INITIAL_TAG" \
    --field sha="$(git ls-remote https://github.com/$GITHUB_USERNAME/$repo.git HEAD | cut -f1)" 2>/dev/null || echo "   ⚠️  Tag $INITIAL_TAG may already exist"
  
  echo -e "${GREEN}✅ Git structure configured for $repo${NC}"
done

echo -e "\n${GREEN}🎉 Git structure setup complete!${NC}"

# Generate branch protection rules
echo -e "\n${BLUE}🛡️  Setting up branch protection...${NC}"
for repo in "${ALL_REPOS[@]}"; do
  echo -e "Protecting main branch for $repo..."
  $GH_CLI api repos/$GITHUB_USERNAME/$repo/branches/main/protection --method PUT \
    --field required_status_checks='{"strict":true,"contexts":["ci/build","ci/test"]}' \
    --field enforce_admins=true \
    --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
    --field restrictions=null 2>/dev/null || echo "   ⚠️  Branch protection may already be configured"
done

echo -e "\n${BLUE}📊 Repository Structure Summary:${NC}"
echo -e "Branches: main, develop, staging, release/v1.0.0"
echo -e "Tags: $INITIAL_TAG"
echo -e "Protection: main branch protected with PR reviews"

echo -e "\n${GREEN}🔥 WisdomOS repositories are ready for Phoenix development!${NC}"