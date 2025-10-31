# WisdomOS Scripts Directory

This directory contains all shell scripts organized by purpose.

## Directory Structure

```
scripts-organized/
├── deployment/          # Deployment scripts
├── setup/              # Setup and initialization scripts
├── migration/          # Migration scripts
├── testing/            # Testing scripts
└── git/                # Git and repository management scripts
```

---

## Deployment Scripts

### `deployment/deploy-now.sh`
**Purpose:** Quick deployment script for immediate deployments
**Usage:** `./scripts-organized/deployment/deploy-now.sh`
**Description:** Deploys the application to production environment

### `deployment/deploy-vercel.sh`
**Purpose:** Deploy specifically to Vercel platform
**Usage:** `./scripts-organized/deployment/deploy-vercel.sh`
**Description:** Handles Vercel-specific deployment configuration and triggers

---

## Setup Scripts

### `setup/setup-database.sh`
**Purpose:** Initialize and configure database
**Usage:** `./scripts-organized/setup/setup-database.sh`
**Description:** Sets up PostgreSQL database, creates tables, and runs initial migrations

### `setup/setup-supabase.sh`
**Purpose:** Configure Supabase integration
**Usage:** `./scripts-organized/setup/setup-supabase.sh`
**Description:** Sets up Supabase client, authentication, and row-level security policies

### `setup/setup-secrets.sh`
**Purpose:** Configure environment secrets and credentials
**Usage:** `./scripts-organized/setup/setup-secrets.sh`
**Description:** Prompts for and sets up required environment variables and secrets
**⚠️ Security:** Never commit this script's output or generated .env files

---

## Git & Repository Scripts

### `git/github-setup.sh`
**Purpose:** Initialize GitHub repository and settings
**Usage:** `./scripts-organized/git/github-setup.sh`
**Description:** Creates GitHub repo, sets up remote, configures branch protection

### `git/initialize-empty-repos.sh`
**Purpose:** Initialize multiple empty repositories
**Usage:** `./scripts-organized/git/initialize-empty-repos.sh`
**Description:** Batch creates and initializes repositories for different project components
**Note:** 11KB script - handles complex multi-repo setup

### `git/setup-git-structure.sh`
**Purpose:** Configure git directory structure and hooks
**Usage:** `./scripts-organized/git/setup-git-structure.sh`
**Description:** Sets up monorepo git structure, worktrees, and commit hooks

---

## Testing Scripts

### `testing/run-tests.sh`
**Purpose:** Execute test suite
**Usage:** `./scripts-organized/testing/run-tests.sh`
**Description:** Runs all tests (unit, integration, e2e) across the monorepo
**Size:** 7.9KB - comprehensive test runner

---

## Migration Scripts

### `migration/update-imports.sh`
**Purpose:** Update package imports after migration
**Usage:** `./scripts-organized/migration/update-imports.sh`
**Description:** Bulk updates imports from `@wisdomos/*` to `@wisdom/*` namespace
**Context:** Created during wisdom/ structure migration
**⚠️ Important:** This was already run during migration - only run again if reverting

---

## Usage Examples

### First Time Setup

```bash
# 1. Setup database
./scripts-organized/setup/setup-database.sh

# 2. Setup Supabase
./scripts-organized/setup/setup-supabase.sh

# 3. Configure secrets
./scripts-organized/setup/setup-secrets.sh

# 4. Run tests to verify
./scripts-organized/testing/run-tests.sh
```

### Development Workflow

```bash
# Run tests before commit
./scripts-organized/testing/run-tests.sh

# Deploy to Vercel
./scripts-organized/deployment/deploy-vercel.sh
```

### Repository Management

```bash
# Initialize new repos
./scripts-organized/git/initialize-empty-repos.sh

# Setup GitHub
./scripts-organized/git/github-setup.sh
```

---

## Making Scripts Executable

If a script is not executable, run:

```bash
chmod +x scripts-organized/category/script-name.sh
```

Or make all scripts executable:

```bash
find scripts-organized -name "*.sh" -exec chmod +x {} \;
```

---

## Script Permissions

All scripts should have execute permissions (`-rwxr-xr-x`). Check permissions:

```bash
ls -la scripts-organized/**/*.sh
```

---

## Adding New Scripts

When adding new scripts:

1. **Choose the right category:**
   - `deployment/` - Deployment and release scripts
   - `setup/` - First-time setup and configuration
   - `migration/` - Data or code migration scripts
   - `testing/` - Test execution scripts
   - `git/` - Git and repository management

2. **Follow naming conventions:**
   - Use kebab-case: `my-script-name.sh`
   - Use descriptive names: `setup-postgres.sh` not `db.sh`

3. **Add documentation:**
   - Update this README with script details
   - Add comments in the script file
   - Include usage instructions

4. **Make executable:**
   ```bash
   chmod +x scripts-organized/category/new-script.sh
   ```

---

## Environment Variables

Many scripts require environment variables. Common variables:

```bash
# Database
DATABASE_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...

# Deployment
VERCEL_TOKEN=...
VERCEL_ORG_ID=...
VERCEL_PROJECT_ID=...

# GitHub
GITHUB_TOKEN=...
```

Store these in `.env` file (never commit to git!).

---

## Troubleshooting

### Script Not Found
```bash
# Ensure you're in project root
cd /Volumes/DevOps/01-active-projects/wisdomOS 2025

# Use relative path
./scripts-organized/category/script.sh
```

### Permission Denied
```bash
chmod +x scripts-organized/category/script.sh
```

### Environment Variables Missing
```bash
# Check if .env exists
ls -la .env

# Run setup-secrets.sh
./scripts-organized/setup/setup-secrets.sh
```

---

## Safety Notes

⚠️ **Before running any script:**
1. Read the script to understand what it does
2. Ensure you have required permissions
3. Back up important data
4. Test in development first
5. Never run scripts from untrusted sources

🔒 **Security:**
- Never commit secrets or API keys
- Use `.env` files (add to `.gitignore`)
- Rotate credentials regularly
- Limit script permissions to what's needed

---

## Maintenance

These scripts should be reviewed and updated:
- After major platform updates
- When dependencies change
- During migration or restructuring
- When adding new infrastructure

Last organized: October 24, 2025
