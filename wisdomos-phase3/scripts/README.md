# Scripts Directory

## Purpose
Automation scripts for database setup, deployment, testing, and maintenance.

## What's Inside

### deployment/
Scripts for deploying WisdomOS to various platforms:
- Netlify deployment automation
- Vercel setup scripts
- Environment configuration

### setup/
Initial setup and configuration scripts:
- Database initialization
- Environment setup
- Dependency installation

### testing/
Test automation and validation:
- E2E test runners
- Integration test scripts
- Performance testing

### migration/
Database and code migration utilities:
- Schema migrations
- Data transformations
- Version upgrades

### git/
Git workflow automation:
- Pre-commit hooks
- Branch management
- Release automation

## Usage
```bash
# Run a script
node scripts/setup/init-database.ts
tsx scripts/seed-demo-data.ts

# Make executable
chmod +x scripts/deployment/deploy.sh
./scripts/deployment/deploy.sh
```

## File Types
- `.ts` - TypeScript scripts (run with tsx)
- `.js` - JavaScript scripts (run with node)
- `.sh` - Shell scripts (run with bash)

## Importance: ⭐⭐⭐⭐
Important - Automates critical development and deployment tasks.
