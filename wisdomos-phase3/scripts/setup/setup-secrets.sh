#!/bin/bash
# WisdomOS Repository Secrets Configuration
# This script helps you add secrets to all WisdomOS repositories

set -e

GITHUB_USERNAME="presidentanderson"
GH_CLI="/opt/homebrew/bin/gh"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔐 WisdomOS Repository Secrets Configuration${NC}"
echo -e "${YELLOW}This script will guide you through adding secrets to all repositories${NC}"
echo ""

# Repository arrays
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

WEB_REPOS=("wisdomos-web")
API_REPOS=("wisdomos-api")
MOBILE_REPOS=("wisdomos-ios" "wisdomos-android")
DESKTOP_REPOS=("wisdomos-desktop")

# Function to add secret to repository
add_secret() {
  local repo=$1
  local secret_name=$2
  local secret_value=$3
  
  if [ -z "$secret_value" ]; then
    echo -e "${YELLOW}⚠️  Skipping $secret_name for $repo (empty value)${NC}"
    return
  fi
  
  echo -e "${BLUE}Adding $secret_name to $repo...${NC}"
  echo "$secret_value" | $GH_CLI secret set $secret_name --repo $GITHUB_USERNAME/$repo
  echo -e "${GREEN}✅ Added $secret_name to $repo${NC}"
}

# Function to prompt for secret value
prompt_secret() {
  local secret_name=$1
  local description=$2
  local example=$3
  
  echo -e "${YELLOW}📝 $secret_name${NC}"
  echo -e "${NC}$description${NC}"
  if [ -n "$example" ]; then
    echo -e "${NC}Example: $example${NC}"
  fi
  echo -n "Enter value (or press Enter to skip): "
  read -s secret_value
  echo ""
  echo "$secret_value"
}

echo -e "${BLUE}🔑 COMMON SECRETS (for all repositories)${NC}"
echo "These secrets will be added to ALL repositories"
echo ""

# Database secrets
DATABASE_URL=$(prompt_secret "DATABASE_URL" "Supabase PostgreSQL connection string" "postgresql://postgres:password@db.xxx.supabase.co:5432/postgres")

JWT_SECRET=$(prompt_secret "JWT_SECRET" "JWT signing secret (minimum 32 characters)" "your-super-secure-jwt-secret-key-32-chars-min")

SUPABASE_URL=$(prompt_secret "SUPABASE_URL" "Your Supabase project URL" "https://xxx.supabase.co")

SUPABASE_ANON_KEY=$(prompt_secret "SUPABASE_ANON_KEY" "Supabase anonymous key" "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")

SUPABASE_SERVICE_ROLE_KEY=$(prompt_secret "SUPABASE_SERVICE_ROLE_KEY" "Supabase service role key (server-side only)" "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")

# AI Services
OPENAI_API_KEY=$(prompt_secret "OPENAI_API_KEY" "OpenAI API key for AI features" "sk-...")

echo ""
echo -e "${BLUE}🌐 WEB-SPECIFIC SECRETS${NC}"

NEXTAUTH_SECRET=$(prompt_secret "NEXTAUTH_SECRET" "NextAuth.js secret key" "your-nextauth-secret-key")

NETLIFY_AUTH_TOKEN=$(prompt_secret "NETLIFY_AUTH_TOKEN" "Netlify personal access token" "netlify-token-xxx")

echo ""
echo -e "${BLUE}📱 MOBILE-SPECIFIC SECRETS${NC}"

# iOS Secrets
APPLE_DEVELOPER_CERT=$(prompt_secret "APPLE_DEVELOPER_CERT" "Base64 encoded Apple Developer Certificate (.p12)" "base64-encoded-cert-here")

APPLE_CERT_PASSWORD=$(prompt_secret "APPLE_CERT_PASSWORD" "Password for Apple Developer Certificate" "cert-password")

APPLE_TEAM_ID=$(prompt_secret "APPLE_TEAM_ID" "Apple Developer Team ID" "ABC123DEF4")

# Android Secrets
ANDROID_KEYSTORE=$(prompt_secret "ANDROID_KEYSTORE" "Base64 encoded Android keystore file" "base64-encoded-keystore")

ANDROID_KEY_ALIAS=$(prompt_secret "ANDROID_KEY_ALIAS" "Android keystore key alias" "wisdomos-key")

ANDROID_KEY_PASSWORD=$(prompt_secret "ANDROID_KEY_PASSWORD" "Android keystore key password" "key-password")

ANDROID_STORE_PASSWORD=$(prompt_secret "ANDROID_STORE_PASSWORD" "Android keystore store password" "store-password")

# Google Play
GOOGLE_PLAY_SERVICE_ACCOUNT=$(prompt_secret "GOOGLE_PLAY_SERVICE_ACCOUNT" "Google Play service account JSON (base64)" "base64-encoded-service-account-json")

echo ""
echo -e "${BLUE}🖥️ DESKTOP-SPECIFIC SECRETS${NC}"

# Desktop signing certificates
WINDOWS_CERT=$(prompt_secret "WINDOWS_CERT" "Base64 encoded Windows code signing certificate" "base64-encoded-windows-cert")

WINDOWS_CERT_PASSWORD=$(prompt_secret "WINDOWS_CERT_PASSWORD" "Windows certificate password" "windows-cert-password")

MACOS_CERT=$(prompt_secret "MACOS_CERT" "Base64 encoded macOS code signing certificate" "base64-encoded-macos-cert")

MACOS_CERT_PASSWORD=$(prompt_secret "MACOS_CERT_PASSWORD" "macOS certificate password" "macos-cert-password")

echo ""
echo -e "${BLUE}🔧 OPTIONAL INTEGRATIONS${NC}"

HUBSPOT_ACCESS_TOKEN=$(prompt_secret "HUBSPOT_ACCESS_TOKEN" "HubSpot access token (optional)" "pat-na1-xxx")

FIREBASE_TOKEN=$(prompt_secret "FIREBASE_TOKEN" "Firebase CLI token for app distribution" "firebase-token-xxx")

echo ""
echo -e "${GREEN}🚀 Starting secrets configuration...${NC}"

# Add common secrets to all repositories
echo -e "${BLUE}Adding common secrets to all repositories...${NC}"
for repo in "${ALL_REPOS[@]}"; do
  echo -e "${YELLOW}Configuring $repo...${NC}"
  
  add_secret "$repo" "DATABASE_URL" "$DATABASE_URL"
  add_secret "$repo" "JWT_SECRET" "$JWT_SECRET"
  add_secret "$repo" "SUPABASE_URL" "$SUPABASE_URL"
  add_secret "$repo" "SUPABASE_ANON_KEY" "$SUPABASE_ANON_KEY"
  add_secret "$repo" "SUPABASE_SERVICE_ROLE_KEY" "$SUPABASE_SERVICE_ROLE_KEY"
  add_secret "$repo" "OPENAI_API_KEY" "$OPENAI_API_KEY"
  
  # Optional integrations
  add_secret "$repo" "HUBSPOT_ACCESS_TOKEN" "$HUBSPOT_ACCESS_TOKEN"
  
  echo -e "${GREEN}✅ Common secrets added to $repo${NC}"
done

# Add web-specific secrets
echo -e "${BLUE}Adding web-specific secrets...${NC}"
for repo in "${WEB_REPOS[@]}"; do
  add_secret "$repo" "NEXTAUTH_SECRET" "$NEXTAUTH_SECRET"
  add_secret "$repo" "NETLIFY_AUTH_TOKEN" "$NETLIFY_AUTH_TOKEN"
  echo -e "${GREEN}✅ Web secrets added to $repo${NC}"
done

# Add mobile-specific secrets
echo -e "${BLUE}Adding mobile-specific secrets...${NC}"
for repo in "${MOBILE_REPOS[@]}"; do
  if [[ "$repo" == "wisdomos-ios" ]]; then
    add_secret "$repo" "APPLE_DEVELOPER_CERT" "$APPLE_DEVELOPER_CERT"
    add_secret "$repo" "APPLE_CERT_PASSWORD" "$APPLE_CERT_PASSWORD"
    add_secret "$repo" "APPLE_TEAM_ID" "$APPLE_TEAM_ID"
  fi
  
  if [[ "$repo" == "wisdomos-android" ]]; then
    add_secret "$repo" "ANDROID_KEYSTORE" "$ANDROID_KEYSTORE"
    add_secret "$repo" "ANDROID_KEY_ALIAS" "$ANDROID_KEY_ALIAS"
    add_secret "$repo" "ANDROID_KEY_PASSWORD" "$ANDROID_KEY_PASSWORD"
    add_secret "$repo" "ANDROID_STORE_PASSWORD" "$ANDROID_STORE_PASSWORD"
    add_secret "$repo" "GOOGLE_PLAY_SERVICE_ACCOUNT" "$GOOGLE_PLAY_SERVICE_ACCOUNT"
  fi
  
  # Firebase for both mobile platforms
  add_secret "$repo" "FIREBASE_TOKEN" "$FIREBASE_TOKEN"
  
  echo -e "${GREEN}✅ Mobile secrets added to $repo${NC}"
done

# Add desktop-specific secrets
echo -e "${BLUE}Adding desktop-specific secrets...${NC}"
for repo in "${DESKTOP_REPOS[@]}"; do
  add_secret "$repo" "WINDOWS_CERT" "$WINDOWS_CERT"
  add_secret "$repo" "WINDOWS_CERT_PASSWORD" "$WINDOWS_CERT_PASSWORD"
  add_secret "$repo" "MACOS_CERT" "$MACOS_CERT"
  add_secret "$repo" "MACOS_CERT_PASSWORD" "$MACOS_CERT_PASSWORD"
  echo -e "${GREEN}✅ Desktop secrets added to $repo${NC}"
done

echo ""
echo -e "${GREEN}🎉 Repository secrets configuration complete!${NC}"
echo ""
echo -e "${BLUE}📋 Summary:${NC}"
echo "✅ Common secrets added to all 8 repositories"
echo "✅ Web secrets added to wisdomos-web"
echo "✅ Mobile secrets added to wisdomos-ios and wisdomos-android"
echo "✅ Desktop secrets added to wisdomos-desktop"
echo ""
echo -e "${YELLOW}🔐 Security Notes:${NC}"
echo "• All secrets are encrypted and stored securely by GitHub"
echo "• Secrets are only accessible during GitHub Actions workflows"
echo "• You can view/edit secrets in each repository's Settings > Secrets and variables > Actions"
echo ""
echo -e "${BLUE}🚀 Next Steps:${NC}"
echo "1. Verify secrets in each repository's GitHub settings"
echo "2. Test deployment workflows"
echo "3. Set up CI/CD pipelines"
echo ""
echo -e "${GREEN}Phoenix secrets are secure! 🔥${NC}"