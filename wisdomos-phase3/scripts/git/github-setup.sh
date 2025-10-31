#!/bin/bash
# WisdomOS Multi-Repository Setup for @presidentanderson
# Run this script to create and configure all platform-specific repositories

set -e

GITHUB_USERNAME="presidentanderson"
ORG_NAME="presidentanderson"  # Using username as org

echo "🔥 Setting up WisdomOS repository structure..."
echo "GitHub User: $GITHUB_USERNAME"

# 1. Create Core Private Repositories
echo "Creating core repositories..."

/opt/homebrew/bin/gh repo create $ORG_NAME/wisdomos-core --private \
  --description "🔥 WisdomOS Core - Phoenix business logic and shared utilities" \
  --homepage "https://wisdomos.com"

/opt/homebrew/bin/gh repo create $ORG_NAME/wisdomos-api --private \
  --description "🚀 WisdomOS API - NestJS backend with tRPC and Supabase" \
  --homepage "https://wisdomos.com"

# 2. Create Platform-Specific Repositories  
echo "Creating platform repositories..."

/opt/homebrew/bin/gh repo create $ORG_NAME/wisdomos-web --private \
  --description "🌐 WisdomOS Web - Next.js 14 web application for Phoenix transformation" \
  --homepage "https://wisdomos.com"

/opt/homebrew/bin/gh repo create $ORG_NAME/wisdomos-ios --private \
  --description "📱 WisdomOS iOS - Native iOS app for Phoenix transformation journey" \
  --homepage "https://wisdomos.com"

/opt/homebrew/bin/gh repo create $ORG_NAME/wisdomos-android --private \
  --description "🤖 WisdomOS Android - Native Android app for Phoenix transformation" \
  --homepage "https://wisdomos.com"

/opt/homebrew/bin/gh repo create $ORG_NAME/wisdomos-desktop --private \
  --description "🖥️ WisdomOS Desktop - Electron app for Phoenix transformation" \
  --homepage "https://wisdomos.com"

# 3. Create Supporting Repositories
echo "Creating supporting repositories..."

/opt/homebrew/bin/gh repo create $ORG_NAME/wisdomos-infrastructure --private \
  --description "☁️ WisdomOS Infrastructure - Docker, K8s, and deployment configs" \
  --homepage "https://wisdomos.com"

/opt/homebrew/bin/gh repo create $ORG_NAME/wisdomos-documentation --private \
  --description "📚 WisdomOS Documentation - Internal guides and specifications" \
  --homepage "https://wisdomos.com"

# 4. Configure Repository Settings
echo "Configuring repository settings..."

REPOS=(
  "wisdomos-core"
  "wisdomos-api" 
  "wisdomos-web"
  "wisdomos-ios"
  "wisdomos-android"
  "wisdomos-desktop"
  "wisdomos-infrastructure"
  "wisdomos-documentation"
)

for repo in "${REPOS[@]}"; do
  echo "Configuring $repo..."
  
  # Enable branch protection for main branch
  /opt/homebrew/bin/gh api repos/$ORG_NAME/$repo/branches/main/protection \
    --method PUT \
    --field required_status_checks='{"strict":true,"contexts":["ci/tests"]}' \
    --field enforce_admins=true \
    --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
    --field restrictions=null \
    --silent
    
  # Enable vulnerability alerts
  /opt/homebrew/bin/gh api repos/$ORG_NAME/$repo/vulnerability-alerts --method PUT --silent
  
  # Enable dependency graph
  /opt/homebrew/bin/gh api repos/$ORG_NAME/$repo --method PATCH \
    --field has_issues=true \
    --field has_projects=true \
    --field has_wiki=false \
    --field delete_branch_on_merge=true \
    --field allow_squash_merge=true \
    --field allow_merge_commit=false \
    --field allow_rebase_merge=false \
    --silent

  # Add topics for better organization
  /opt/homebrew/bin/gh api repos/$ORG_NAME/$repo/topics --method PUT \
    --field names='["wisdomos","phoenix","transformation","private"]' \
    --silent

  echo "✅ Configured $repo"
done

# 5. Set up repository secrets (you'll need to add values manually)
echo "Setting up repository secrets templates..."

SECRETS_TEMPLATE="# Repository Secrets to Add Manually
# Go to Settings > Secrets and variables > Actions for each repository

COMMON_SECRETS:
  DATABASE_URL: postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
  JWT_SECRET: your-jwt-secret-32-characters-minimum
  SUPABASE_SERVICE_ROLE_KEY: your-supabase-service-role-key
  OPENAI_API_KEY: sk-your-openai-api-key

WEB_SECRETS:
  NEXTAUTH_SECRET: your-nextauth-secret-key
  NETLIFY_AUTH_TOKEN: your-netlify-auth-token

MOBILE_SECRETS:
  APPLE_DEVELOPER_CERT: base64-encoded-certificate
  GOOGLE_PLAY_SERVICE_ACCOUNT: play-store-service-account-json
  EXPO_TOKEN: your-expo-access-token

DESKTOP_SECRETS:
  CODE_SIGNING_CERT_WINDOWS: windows-code-signing-certificate
  CODE_SIGNING_CERT_MAC: mac-code-signing-certificate
  
API_SECRETS:
  ENCRYPTION_KEY: your-encryption-key-for-sensitive-data
  WEBHOOK_SECRET: your-webhook-secret-for-integrations"

echo "$SECRETS_TEMPLATE" > repository-secrets.md

echo "🎉 Repository structure created successfully!"
echo ""
echo "Next steps:"
echo "1. Add repository secrets manually (see repository-secrets.md)"
echo "2. Split current monorepo using git subtree"
echo "3. Set up CI/CD workflows for each repository"
echo "4. Configure deployment environments"
echo ""
echo "Repositories created:"
for repo in "${REPOS[@]}"; do
  echo "  - https://github.com/$ORG_NAME/$repo"
done