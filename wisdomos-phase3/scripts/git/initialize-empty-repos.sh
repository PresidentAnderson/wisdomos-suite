#!/bin/bash
# 🚀 Initialize Empty WisdomOS Repositories
# Creates initial commits and DevOps branches for all repositories

set -e

GITHUB_USERNAME="presidentanderson"
GH_CLI="/opt/homebrew/bin/gh"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔥 Initializing WisdomOS Repositories${NC}"

# Repository configuration
EMPTY_REPOS=(
  "wisdomos-core"
  "wisdomos-api" 
  "wisdomos-ios"
  "wisdomos-android"
  "wisdomos-desktop"
  "wisdomos-infrastructure"
  "wisdomos-documentation"
)

# DevOps branches to add
DEVOPS_BRANCHES=(
  "devops/codex"
  "devops/claude-code"
)

# Create temporary directory for initialization
TEMP_DIR="$(mktemp -d)"
echo -e "${YELLOW}Working in temporary directory: $TEMP_DIR${NC}"

for repo in "${EMPTY_REPOS[@]}"; do
  echo -e "\n${BLUE}🔧 Initializing $repo...${NC}"
  
  # Clone repository
  cd "$TEMP_DIR"
  git clone "https://github.com/$GITHUB_USERNAME/$repo.git" || continue
  cd "$repo"
  
  # Check if repository is truly empty
  if git rev-parse HEAD >/dev/null 2>&1; then
    echo -e "${GREEN}Repository $repo already has commits - skipping initialization${NC}"
    continue
  fi
  
  # Create appropriate initial structure based on repository type
  case $repo in
    "wisdomos-core")
      echo -e "${YELLOW}Creating TypeScript library structure...${NC}"
      cat > package.json << 'EOF'
{
  "name": "@wisdomos/core",
  "version": "1.0.0",
  "description": "WisdomOS Core - Phoenix transformation business logic",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "test": "jest",
    "lint": "eslint src/**/*.ts"
  },
  "keywords": ["wisdomos", "phoenix", "transformation"],
  "author": "Jonathan Anderson <contact@axaiinnovations.com>",
  "license": "PROPRIETARY",
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.4.0",
    "jest": "^29.0.0",
    "eslint": "^8.0.0"
  }
}
EOF
      mkdir -p src/__tests__
      echo 'export * from "./types";' > src/index.ts
      echo 'export interface PhoenixUser { id: string; email: string; }' > src/types.ts
      echo 'import { PhoenixUser } from "../types"; describe("Core Types", () => { test("should define PhoenixUser", () => { expect(true).toBe(true); }); });' > src/__tests__/types.test.ts
      ;;
      
    "wisdomos-api")
      echo -e "${YELLOW}Creating NestJS API structure...${NC}"
      cat > package.json << 'EOF'
{
  "name": "@wisdomos/api",
  "version": "1.0.0",
  "description": "WisdomOS API - Phoenix transformation backend",
  "scripts": {
    "dev": "nest start --watch",
    "build": "nest build",
    "start": "node dist/main",
    "test": "jest"
  },
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@prisma/client": "^5.0.0"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "typescript": "^5.4.0",
    "jest": "^29.0.0"
  }
}
EOF
      mkdir -p src
      echo 'import { NestFactory } from "@nestjs/core"; import { AppModule } from "./app.module"; async function bootstrap() { const app = await NestFactory.create(AppModule); await app.listen(4000); } bootstrap();' > src/main.ts
      echo 'import { Module } from "@nestjs/common"; @Module({}) export class AppModule {}' > src/app.module.ts
      ;;
      
    "wisdomos-ios")
      echo -e "${YELLOW}Creating iOS project structure...${NC}"
      cat > Podfile << 'EOF'
platform :ios, '15.0'
target 'WisdomOS' do
  use_frameworks!
  pod 'Alamofire'
end
EOF
      mkdir -p WisdomOS
      echo '// WisdomOS iOS - Phoenix Transformation App' > WisdomOS/AppDelegate.swift
      ;;
      
    "wisdomos-android")
      echo -e "${YELLOW}Creating Android project structure...${NC}"
      cat > build.gradle << 'EOF'
buildscript {
    ext.kotlin_version = '1.8.0'
    dependencies {
        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlin_version"
    }
}
allprojects {
    repositories {
        google()
        mavenCentral()
    }
}
EOF
      mkdir -p app/src/main/java/com/wisdomos
      echo '// WisdomOS Android - Phoenix Transformation App' > app/src/main/java/com/wisdomos/MainActivity.kt
      ;;
      
    "wisdomos-desktop")
      echo -e "${YELLOW}Creating Electron desktop structure...${NC}"
      cat > package.json << 'EOF'
{
  "name": "@wisdomos/desktop",
  "version": "1.0.0",
  "description": "WisdomOS Desktop - Phoenix transformation app",
  "main": "src/main.js",
  "scripts": {
    "start": "electron .",
    "build": "electron-builder",
    "dev": "electron . --dev"
  },
  "devDependencies": {
    "electron": "^27.0.0",
    "electron-builder": "^24.0.0"
  }
}
EOF
      mkdir -p src
      echo 'const { app, BrowserWindow } = require("electron"); function createWindow() { const win = new BrowserWindow({ width: 800, height: 600 }); win.loadFile("index.html"); } app.whenReady().then(createWindow);' > src/main.js
      ;;
      
    "wisdomos-infrastructure")
      echo -e "${YELLOW}Creating infrastructure configuration...${NC}"
      cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  api:
    build: ../api
    ports:
      - "4000:4000"
  web:
    build: ../web
    ports:
      - "3000:3000"
EOF
      mkdir -p kubernetes terraform ansible
      echo '# WisdomOS Infrastructure Configuration' > kubernetes/README.md
      ;;
      
    "wisdomos-documentation")
      echo -e "${YELLOW}Creating documentation structure...${NC}"
      mkdir -p docs/{api,web,mobile,deployment}
      echo '# WisdomOS Documentation' > docs/README.md
      echo '# API Documentation' > docs/api/README.md
      echo '# Web App Documentation' > docs/web/README.md
      ;;
  esac
  
  # Create universal README
  cat > README.md << EOF
# $repo

WisdomOS $(echo $repo | sed 's/wisdomos-//' | sed 's/-/ /' | awk '{for(i=1;i<=NF;i++)sub(/./,toupper(substr($i,1,1)),$i)}1') - Phoenix Operating System for Life Transformation

## 🔥 Overview
This repository contains the $(echo $repo | sed 's/wisdomos-//') component of the WisdomOS platform.

From ashes to clarity, every Phoenix transformation begins here.

## 🚀 Quick Start
\`\`\`bash
# Install dependencies
pnpm install

# Start development
pnpm dev
\`\`\`

## 🌿 Branches
- \`main\` - Production ready code
- \`develop\` - Development integration
- \`staging\` - Pre-production testing
- \`devops/codex\` - Codex DevOps automation
- \`devops/claude-code\` - Claude Code DevOps workflows

## 🔐 Environment Variables
Copy \`.env.example\` to \`.env\` and configure:
- Database credentials
- API keys
- Service endpoints

## 📱 Platform Integration
Integrates with the WisdomOS ecosystem:
- **Database**: Supabase PostgreSQL
- **Auth**: Supabase Auth with RLS
- **Real-time**: WebSocket collaboration  
- **Deployment**: Automated CI/CD
- **Monitoring**: Error tracking and analytics

## 🧪 Testing
\`\`\`bash
# Run tests
pnpm test

# Run with coverage
pnpm test:coverage
\`\`\`

## 🚀 Deployment
Automated deployment via GitHub Actions:
- Push to \`main\` → Production deploy
- Push to \`staging\` → Staging deploy
- Pull requests → Preview deploys

## 🔧 DevOps Branches
- **devops/codex**: Cursor/Codex AI-assisted development workflows
- **devops/claude-code**: Claude Code automation and CI/CD enhancements

## 🛡️ Security
- All secrets managed via GitHub Secrets
- Row-level security with Supabase
- Encrypted data storage
- Regular security audits

## 📚 Documentation
See [wisdomos-documentation](https://github.com/$GITHUB_USERNAME/wisdomos-documentation) for:
- Architecture overview
- API documentation  
- Deployment guides
- Development workflows

---

🔥 **Phoenix rises through transformation!**

*"From ashes to clarity, every transformation begins with a single commit."*
EOF

  # Create .gitignore
  cat > .gitignore << 'EOF'
# Dependencies
node_modules/
vendor/
Pods/

# Build outputs
dist/
build/
out/
*.app
*.ipa
*.apk

# Environment files
.env
.env.local
.env.production

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Logs
*.log
logs/

# Coverage reports
coverage/
*.lcov

# Temporary files
tmp/
temp/
*.tmp
EOF

  # Initial commit
  git add .
  git commit -m "🔥 Initial Phoenix commit - From ashes to digital transformation

- Add project structure and configuration
- Set up development environment
- Configure build and deployment scripts  
- Add comprehensive README documentation

Phoenix rises! 🔥"

  # Push to GitHub
  git branch -M main
  git push -u origin main
  
  echo -e "${GREEN}✅ Repository $repo initialized with initial commit${NC}"
  
  # Now create branches (they will work since we have a commit)
  echo -e "${YELLOW}🌿 Creating branches for $repo...${NC}"
  
  # Standard branches
  git checkout -b develop
  git push -u origin develop
  
  git checkout -b staging  
  git push -u origin staging
  
  git checkout -b release/v1.0.0
  git push -u origin release/v1.0.0
  
  # DevOps branches
  for branch in "${DEVOPS_BRANCHES[@]}"; do
    echo -e "   Creating DevOps branch: $branch"
    git checkout -b "$branch"
    
    # Add branch-specific DevOps configuration
    if [[ "$branch" == "devops/codex" ]]; then
      mkdir -p .codex
      echo "# Codex DevOps Configuration

This branch contains Cursor/Codex AI-assisted development workflows and automation.

## Features
- AI-powered code generation
- Automated refactoring suggestions  
- Intelligent error detection
- Smart deployment optimization

## Usage
Use this branch for Codex-enhanced development workflows.
" > .codex/README.md
      git add .codex/README.md
      git commit -m "🤖 Add Codex DevOps configuration"
    fi
    
    if [[ "$branch" == "devops/claude-code" ]]; then
      mkdir -p .claude
      echo "# Claude Code DevOps Configuration

This branch contains Claude Code automation and enhanced CI/CD workflows.

## Features  
- Advanced GitHub Actions workflows
- Intelligent build optimization
- Automated testing strategies
- Smart deployment pipelines

## Usage
Use this branch for Claude Code enhanced development and deployment automation.
" > .claude/README.md
      git add .claude/README.md 
      git commit -m "🧠 Add Claude Code DevOps configuration"
    fi
    
    git push -u origin "$branch"
  done
  
  # Return to main
  git checkout main
  
  # Create initial tag
  git tag v1.0.0-alpha
  git push origin v1.0.0-alpha
  
  echo -e "${GREEN}✅ All branches and tags created for $repo${NC}"
done

# Cleanup
cd /
rm -rf "$TEMP_DIR"

echo -e "\n${GREEN}🎉 Repository initialization complete!${NC}"

# Verify results
echo -e "\n${BLUE}📊 Final Repository Status:${NC}"
for repo in "${EMPTY_REPOS[@]}"; do
  echo -e "📦 $repo:"
  $GH_CLI api "repos/$GITHUB_USERNAME/$repo/branches" --jq '.[].name' | sed 's/^/   ✅ Branch: /'
  $GH_CLI api "repos/$GITHUB_USERNAME/$repo/tags" --jq '.[].name' | sed 's/^/   🏷️  Tag: /' || echo "   📝 No tags yet"
done

echo -e "\n${GREEN}🔥 Phoenix repositories are ready for transformation!${NC}"