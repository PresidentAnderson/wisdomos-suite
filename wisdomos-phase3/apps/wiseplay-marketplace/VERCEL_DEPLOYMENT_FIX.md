# WisePlay Marketplace - Vercel Deployment Fix

## Problem Summary

The Vercel deployment was failing with the error:
```
ERR_PNPM_NO_MATCHING_VERSION_INSIDE_WORKSPACE  In : No matching version found for @wisdomos/database@* inside the workspace
```

This occurred because Vercel couldn't properly resolve the pnpm workspace dependencies when building the marketplace app in isolation.

## Root Cause

1. **Monorepo Build Context**: Vercel was trying to build the marketplace app without understanding the full monorepo structure
2. **Workspace Dependencies**: The `@wisdomos/database` package is a workspace dependency that needs to be installed from the monorepo root
3. **Prisma Client Generation**: The Prisma client wasn't being generated before the Next.js build process
4. **Version Mismatch**: Prisma versions were inconsistent between packages (5.7.1 vs 5.22.0)

## Solutions Implemented

### 1. Created Root .npmrc Configuration
**File**: `/Volumes/DevOPS 2025/01_DEVOPS_PLATFORM/wisdomOS 2026/.npmrc`

```
shamefully-hoist=true
strict-peer-dependencies=false
auto-install-peers=true
node-linker=hoisted
```

**Purpose**: Configures pnpm to hoist dependencies, making workspace packages accessible to Vercel's build process.

### 2. Updated Marketplace vercel.json
**File**: `/apps/wiseplay-marketplace/vercel.json`

**Before**:
```json
{
  "buildCommand": "pnpm build",
  "installCommand": "pnpm install",
  "framework": "nextjs"
}
```

**After**:
```json
{
  "buildCommand": "cd ../.. && pnpm install && cd packages/database && pnpm db:generate && cd ../../apps/wiseplay-marketplace && pnpm build",
  "installCommand": "cd ../.. && pnpm install",
  "outputDirectory": ".next",
  "devCommand": "pnpm dev",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

**Key Changes**:
- Install from monorepo root (`cd ../..`)
- Generate Prisma client before building (`pnpm db:generate`)
- Navigate back to marketplace directory for final build
- Ensures all workspace dependencies are available

### 3. Added postinstall Hooks

#### Marketplace Package
**File**: `/apps/wiseplay-marketplace/package.json`

Added:
```json
"postinstall": "cd ../../packages/database && prisma generate"
```

#### Database Package
**File**: `/packages/database/package.json`

Added:
```json
"postinstall": "prisma generate"
```

Updated build script:
```json
"build": "prisma generate && tsc"
```

**Purpose**: Automatically generates the Prisma client whenever dependencies are installed, ensuring it's always available.

### 4. Aligned Prisma Versions
**Files**:
- `/packages/database/package.json`
- `/apps/wiseplay-marketplace/package.json`

**Changed**: Updated database package Prisma dependencies from `^5.7.1` to `^5.22.0` to match marketplace version.

**Rationale**: Version mismatches can cause schema incompatibility issues and build failures.

## Build Process Flow

The new build process follows this sequence:

1. **Install Phase** (from monorepo root):
   ```bash
   cd /Volumes/DevOPS 2025/01_DEVOPS_PLATFORM/wisdomOS 2026
   pnpm install
   ```
   - Installs all workspace dependencies
   - Triggers postinstall hooks
   - Generates Prisma client automatically

2. **Generate Phase**:
   ```bash
   cd packages/database
   pnpm db:generate
   ```
   - Explicitly generates Prisma client
   - Creates TypeScript types from schema
   - Makes `@prisma/client` available

3. **Build Phase**:
   ```bash
   cd apps/wiseplay-marketplace
   pnpm build
   ```
   - Next.js build with all dependencies available
   - Uses generated Prisma client
   - Creates optimized production bundle

## File Changes Summary

### New Files
- `.npmrc` - Root pnpm configuration

### Modified Files
1. `apps/wiseplay-marketplace/package.json`
   - Added postinstall script
   - Ensures Prisma client generation

2. `apps/wiseplay-marketplace/vercel.json`
   - Updated build and install commands
   - Implements monorepo-aware build process

3. `packages/database/package.json`
   - Added postinstall script
   - Updated Prisma versions to 5.22.0
   - Enhanced build script

## Verification Steps

### Local Testing
```bash
cd /Volumes/DevOPS 2025/01_DEVOPS_PLATFORM/wisdomOS 2026

# Clean install
rm -rf node_modules apps/wiseplay-marketplace/node_modules packages/database/node_modules
pnpm install

# Build database package
cd packages/database
pnpm build

# Build marketplace
cd ../../apps/wiseplay-marketplace
pnpm build
```

### Vercel Deployment
1. Commit and push changes
2. Trigger Vercel deployment
3. Monitor build logs for successful Prisma generation
4. Verify app starts without database connection errors

## Expected Vercel Build Output

The successful build should show:
```
✓ Installing dependencies...
✓ Running postinstall scripts...
✓ Generating Prisma Client...
✓ Building Next.js application...
✓ Deployment ready
```

## Troubleshooting

### If deployment still fails:

1. **Check Vercel Environment Variables**
   - Ensure `DATABASE_URL` is set
   - Verify `NEXT_PUBLIC_*` variables are configured

2. **Check Build Logs**
   - Look for "Prisma Client generated" message
   - Verify workspace dependencies are found
   - Check for TypeScript compilation errors

3. **Verify pnpm Version**
   - Root package.json specifies: `"packageManager": "pnpm@8.15.0"`
   - Vercel should auto-detect this

4. **Alternative: Use Vercel CLI**
   ```bash
   cd apps/wiseplay-marketplace
   vercel --prod
   ```

## Next Steps

1. **Commit Changes**:
   ```bash
   git add .npmrc
   git add apps/wiseplay-marketplace/package.json
   git add apps/wiseplay-marketplace/vercel.json
   git add packages/database/package.json
   git commit -m "fix: Configure Vercel for monorepo deployment with workspace dependencies"
   git push
   ```

2. **Deploy to Vercel**:
   - Push triggers automatic deployment
   - Or use Vercel CLI: `vercel --prod`

3. **Monitor Deployment**:
   - Watch build logs in Vercel dashboard
   - Test deployed application
   - Verify database connections work

## Configuration Files Reference

### pnpm-workspace.yaml (already exists)
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
  - 'editions/*/config'
  - 'platforms/*/shared'
```

### .vercelignore (already exists)
```
node_modules
.next
.env.local
.env*.local
*.log
.DS_Store
coverage
.vscode
.idea
*.swp
*.swo
```

## Architecture Notes

- **Monorepo**: Uses pnpm workspaces with Turborepo
- **Database Package**: Single source of truth for Prisma schema
- **Workspace Protocol**: Dependencies use `workspace:*` for cross-package references
- **Build Order**: Database package must build before dependent apps
- **Prisma Client**: Generated at `packages/database/node_modules/.prisma/client`

## Success Criteria

- [ ] Vercel build completes without errors
- [ ] Prisma client is generated during build
- [ ] Workspace dependencies resolve correctly
- [ ] Application deploys successfully
- [ ] Database connections work in production
- [ ] No runtime errors related to missing dependencies

## Support

If issues persist:
1. Check Vercel documentation on monorepo deployments
2. Verify all environment variables are set
3. Test build locally with exact Vercel Node.js version
4. Consider using Vercel's "Framework Preset" for Next.js
5. Review pnpm and Turborepo configurations

---

**Status**: Ready for deployment
**Date**: 2025-10-30
**Last Updated**: 2025-10-30
