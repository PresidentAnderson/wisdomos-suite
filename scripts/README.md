# WisdomOS Scripts Directory

All scripts organized by purpose for easy access and management.

## Quick Start

**List all scripts:**
```bash
./scripts/list-scripts.sh
```

## Directory Structure

```
scripts/
├── deployment/          # Deployment scripts (3 scripts)
├── setup/              # Setup & configuration scripts (5 scripts)
├── git/                # Git & repository management (3 scripts)
├── testing/            # Testing scripts (1 script)
├── migration/          # Migration utilities (1 script)
├── *.ts                # TypeScript utility scripts (7 scripts)
├── list-scripts.sh     # List all available scripts
├── README.md           # This file
└── SHELL-SCRIPTS.md    # Detailed shell script documentation
```

## Usage

### Shell Scripts
Run any shell script by category:
```bash
./scripts/deployment/deploy-now.sh
./scripts/setup/setup-database.sh
./scripts/git/github-setup.sh
./scripts/testing/run-tests.sh
./scripts/migration/update-imports.sh
```

### TypeScript Scripts
Run using tsx or npm:
```bash
# Using tsx directly
tsx scripts/init-database.ts
tsx scripts/seed-demo-data.ts

# Or via npm scripts (if configured)
npm run db:init
npm run db:seed:demo
```

## Categories

### 📦 Deployment (./deployment/)
- `deploy-now.sh` - Quick deployment to production
- `deploy-vercel.sh` - Deploy to Vercel platform
- `deploy.sh` - General deployment script

### 🔧 Setup (./setup/)
- `setup-database.sh` - Initialize PostgreSQL database
- `setup-supabase.sh` - Configure Supabase integration
- `setup-secrets.sh` - Setup environment secrets
- `setup-environment.sh` - Setup environment configuration
- `auto-save-keys-to-1password.sh` - Save keys to 1Password vault

### 📂 Git & Repository (./git/)
- `github-setup.sh` - Initialize GitHub repository and settings
- `initialize-empty-repos.sh` - Batch create multiple repositories
- `setup-git-structure.sh` - Configure git structure and hooks

### 🧪 Testing (./testing/)
- `run-tests.sh` - Execute full test suite across monorepo

### 🔄 Migration (./migration/)
- `update-imports.sh` - Update package imports (post-migration)

### 📜 TypeScript Utilities (root)
- `init-database.ts` - Initialize database schema
- `seed-demo-data.ts` - Seed demo/test data
- `seed-tracker-data.ts` - Seed tracker-specific data
- `setup-hubspot-webhooks.ts` - Configure HubSpot webhooks
- `test-basic-schema.ts` - Test basic database schema
- `test-database-integration.ts` - Database integration tests
- `test-multi-tenancy.ts` - Multi-tenancy functionality tests

## First Time Setup

```bash
# 1. Setup database
./scripts/setup/setup-database.sh

# 2. Initialize schema
tsx scripts/init-database.ts

# 3. Setup Supabase
./scripts/setup/setup-supabase.sh

# 4. Configure secrets
./scripts/setup/setup-secrets.sh

# 5. Seed demo data (optional)
tsx scripts/seed-demo-data.ts

# 6. Run tests to verify
./scripts/testing/run-tests.sh
```

## Common Tasks

### Database Operations
```bash
# Initialize database
tsx scripts/init-database.ts

# Seed with demo data
tsx scripts/seed-demo-data.ts

# Test database integration
tsx scripts/test-database-integration.ts

# Test multi-tenancy
tsx scripts/test-multi-tenancy.ts
```

### Deployment
```bash
# Deploy to Vercel
./scripts/deployment/deploy-vercel.sh

# Quick production deployment
./scripts/deployment/deploy-now.sh
```

### Repository Management
```bash
# Setup GitHub repo
./scripts/git/github-setup.sh

# Initialize multiple repos
./scripts/git/initialize-empty-repos.sh
```

## Documentation

- **Shell Scripts:** See `SHELL-SCRIPTS.md` for detailed shell script documentation
- **TypeScript Scripts:** Check inline comments in each `.ts` file

## Making Scripts Executable

If a script isn't executable:
```bash
chmod +x scripts/category/script-name.sh
```

Make all scripts executable:
```bash
find scripts -name "*.sh" -exec chmod +x {} \;
```

## Environment Variables

Many scripts require environment variables. Create a `.env` file in the project root:

```bash
# Database
DATABASE_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_KEY=...

# Deployment
VERCEL_TOKEN=...
VERCEL_ORG_ID=...
VERCEL_PROJECT_ID=...

# GitHub
GITHUB_TOKEN=...

# HubSpot
HUBSPOT_API_KEY=...
HUBSPOT_WEBHOOK_SECRET=...

# 1Password
OP_SERVICE_ACCOUNT_TOKEN=...
```

**⚠️ Never commit `.env` files to version control!**

## Adding New Scripts

1. **Choose the right category:**
   - `deployment/` - Deployment and release scripts
   - `setup/` - First-time setup and configuration
   - `migration/` - Data or code migration scripts
   - `testing/` - Test execution scripts
   - `git/` - Git and repository management
   - Root directory - TypeScript utility scripts

2. **Follow naming conventions:**
   - Use kebab-case: `my-script-name.sh`
   - Be descriptive: `setup-postgres.sh` not `db.sh`

3. **Make executable:**
   ```bash
   chmod +x scripts/category/new-script.sh
   ```

4. **Update documentation:**
   - Add to `list-scripts.sh`
   - Update this README
   - Add usage comments in the script

## Safety & Security

⚠️ **Before running any script:**
1. Read the script to understand what it does
2. Ensure you have required permissions
3. Back up important data
4. Test in development first
5. Never run scripts from untrusted sources

🔒 **Security Best Practices:**
- Never commit secrets or API keys
- Use `.env` files (add to `.gitignore`)
- Rotate credentials regularly
- Limit script permissions to what's needed
- Review scripts after updates

## Troubleshooting

### Script Not Found
```bash
# Ensure you're in project root
cd "/Volumes/DevOps/01-active-projects/wisdomOS 2025"

# Use relative path
./scripts/deployment/deploy.sh
```

### Permission Denied
```bash
chmod +x scripts/category/script-name.sh
```

### Environment Variables Missing
```bash
# Check if .env exists
ls -la .env

# Run setup script
./scripts/setup/setup-secrets.sh
```

### TypeScript Scripts Failing
```bash
# Ensure tsx is installed
npm install -g tsx

# Or use via pnpm
pnpm add -g tsx
```

## Maintenance

Review and update scripts:
- After major platform updates
- When dependencies change
- During migrations or restructuring
- When adding new infrastructure

---

**Last Updated:** October 25, 2025
**Organization:** AXAI Innovations
**Project:** WisdomOS 2025
