# Vercel Dashboard Configuration - Manual Steps Required

**Date:** October 30, 2025
**Status:** ⚠️ URGENT - Manual Dashboard Configuration Required
**Reason:** Vercel CLI cannot programmatically update project settings

---

## Critical Issue

All deployments are failing because Vercel Dashboard settings override vercel.json configuration. The project settings show:

```
Root Directory:     .          ❌ Wrong (should be apps/web)
Build Command:      npm install && npm run build   ❌ Wrong (should use pnpm)
Install Command:    npm install   ❌ Wrong (conflicts with pnpm)
Framework:          Other      ❌ Wrong (should be Next.js)
Node Version:       22.x       ❌ Wrong (should be 20.x)
```

---

## Required Manual Steps

### Step 1: Access Vercel Dashboard

1. Open browser and go to: **https://vercel.com/axaiinovation/wisdomos-phase3/settings**
2. Log in if needed
3. Navigate to **Settings** tab
4. Click **General** section

### Step 2: Update Root Directory

**Why:** Monorepo structure requires specifying the app subdirectory

1. Scroll to **Root Directory** section
2. Click **Edit** button
3. Clear existing value (`.`)
4. Enter: `apps/web`
5. Click **Save**

### Step 3: Update Build & Development Settings

**Why:** Must use pnpm from monorepo root, not npm from subdirectory

1. Scroll to **Build & Development Settings** section
2. Find **Framework Preset**
   - Should auto-detect as `Next.js` after root directory change
   - If not, manually select **Next.js** from dropdown

3. Find **Build Command**
   - Click **Override** checkbox
   - Enter:
```bash
cd ../.. && pnpm install --frozen-lockfile && pnpm --filter @wisdomos/web build
```

4. Find **Install Command**
   - Click **Override** checkbox
   - Enter:
```bash
echo 'Skipping separate install - using buildCommand'
```

5. Find **Output Directory**
   - Should auto-fill as `.next` (correct)
   - If not, enter: `.next`

6. Click **Save** at bottom of section

### Step 4: Verify Node.js Version

1. Scroll to **Node.js Version** section
2. Should show: **20.x** (auto-detected from .nvmrc)
3. If shows 22.x, manually select **20.x** from dropdown
4. Click **Save**

### Step 5: Trigger Clean Redeploy

**Important:** Must clear build cache to use new settings

1. Navigate to **Deployments** tab (top menu)
2. Find the latest failed deployment (top of list)
3. Click on the deployment URL
4. Click **⋯ Menu** (three dots in top right)
5. Select **Redeploy**
6. In the modal:
   - Uncheck **"Use existing Build Cache"** ❌
   - Ensure it says "Use existing Build Cache → No"
   - Click **Redeploy** button

### Step 6: Monitor Build Logs

1. You'll be redirected to the new deployment page
2. Click **Building...** or **View Function Logs**
3. Watch for these success indicators:

```
✓ Installing dependencies with pnpm
✓ Prisma client generated
✓ Turborepo cache hit
✓ @wisdomos/web build started
✓ Next.js build completed
✓ Deployment ready
```

---

## What These Changes Do

### Root Directory: `apps/web`
- Tells Vercel where the Next.js app lives in the monorepo
- Makes paths relative to `apps/web` instead of root
- Allows proper detection of Next.js framework

### Build Command
```bash
cd ../.. && pnpm install --frozen-lockfile && pnpm --filter @wisdomos/web build
```
- `cd ../..` - Navigate to monorepo root (from apps/web)
- `pnpm install --frozen-lockfile` - Install all workspace dependencies
- `pnpm --filter @wisdomos/web build` - Build only the web app package
- Uses Turborepo for caching and dependency resolution

### Install Command
```bash
echo 'Skipping separate install - using buildCommand'
```
- Prevents Vercel from running `npm install` before the build command
- Avoids package manager conflict (npm vs pnpm)
- All installation happens in the build command

---

## Expected Build Duration

| Phase | Duration |
|-------|----------|
| Installing dependencies | 1-2 minutes |
| Prisma client generation | 10-20 seconds |
| Next.js build | 2-3 minutes |
| **Total** | **3-5 minutes** |

Previous failures completed in 7-55 seconds, indicating configuration errors.

---

## Troubleshooting

### If Build Still Fails After Configuration

#### Check 1: Verify Settings Were Applied
```bash
cd "/Volumes/DevOPS 2025/01_DEVOPS_PLATFORM/wisdomOS 2026/apps/web"
vercel project inspect wisdomos-phase3
```

Should show:
```
Root Directory: apps/web
Build Command: cd ../.. && pnpm install --frozen-lockfile && pnpm --filter @wisdomos/web build
Framework: Next.js
Node.js Version: 20.x
```

#### Check 2: Clear Build Cache
If settings are correct but build still fails:
1. Go to Deployments → Latest deployment
2. Click ⋯ Menu → Redeploy
3. **Important:** Uncheck "Use existing Build Cache"
4. Redeploy

#### Check 3: Verify Environment Variables
Ensure these are set in Vercel Dashboard → Settings → Environment Variables:

**Required:**
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Optional:**
- `OPENAI_API_KEY`
- `EDITION=personal`
- `NEXT_PUBLIC_EDITION=personal`

#### Check 4: Repository Issues
If you see "Could not find pnpm-lock.yaml":
```bash
# Verify lockfile exists
ls -la /Volumes/DevOPS\ 2025/01_DEVOPS_PLATFORM/wisdomOS\ 2026/pnpm-lock.yaml

# If missing, regenerate
cd "/Volumes/DevOPS 2025/01_DEVOPS_PLATFORM/wisdomOS 2026"
pnpm install
git add pnpm-lock.yaml
git commit -m "chore: Add pnpm-lock.yaml"
git push
```

---

## Alternative: Deploy via CLI

If Dashboard configuration doesn't work, try CLI deployment:

```bash
cd "/Volumes/DevOPS 2025/01_DEVOPS_PLATFORM/wisdomOS 2026"

# Deploy from root with explicit settings
vercel --prod \
  --build-env NODE_VERSION=20 \
  --build-env VERCEL_ROOT_DIRECTORY=apps/web \
  --yes
```

**Note:** This may not persist settings for future Git push deployments.

---

## Alternative: Create New Project

If all else fails, create a new Vercel project:

1. Go to **https://vercel.com/new**
2. Import from **GitHub**: `PresidentAnderson/wisdomos-phase3`
3. **Important:** When prompted for "Root Directory":
   - Click **Edit**
   - Enter: `apps/web`
4. Framework should auto-detect as **Next.js**
5. Override build command:
```bash
cd ../.. && pnpm install --frozen-lockfile && pnpm --filter @wisdomos/web build
```
6. Add all environment variables
7. Deploy

---

## Success Indicators

Deployment succeeded when you see:

- ✅ Build completes in 3-5 minutes (not 7-55 seconds)
- ✅ Deployment status shows **Ready** (not Error)
- ✅ URL loads homepage without errors
- ✅ Database queries work (check /api/health)
- ✅ Authentication works (test login)
- ✅ No console errors in browser DevTools

---

## Files Already Prepared

All code-level fixes are complete:

- ✅ `apps/web/package.json` - Added missing dependencies
- ✅ `apps/web/types/fulfillment-display.ts` - Fixed TypeScript imports
- ✅ `.nvmrc` - Node.js 20 specification
- ✅ `turbo.json` - Updated to tasks field
- ✅ `apps/web/vercel.json` - Correct build configuration
- ✅ Environment variables added via CLI

**Only remaining task:** Update Vercel Dashboard project settings (this cannot be automated).

---

## Contact for Help

**Vercel Documentation:**
- Monorepo Deployment: https://vercel.com/docs/monorepos
- Build Configuration: https://vercel.com/docs/build-step
- Turborepo + Vercel: https://turbo.build/repo/docs/handbook/deploying-with-docker

**Project Info:**
- Project ID: `prj_sUSoAvDA8MWdMv1lIeoAAf0T3Hlb`
- Org ID: `team_NvNuz1bVrXxLJXSczsMH7eO1`
- GitHub Repo: `PresidentAnderson/wisdomos-phase3`
- Branch: `main`

---

**Last Updated:** October 30, 2025 11:40 PST
**Prepared By:** Claude Code Deployment Analysis
**Status:** Awaiting Manual Dashboard Configuration

---

## Quick Reference Card

**Dashboard URL:**
```
https://vercel.com/axaiinovation/wisdomos-phase3/settings
```

**Settings to Change:**
```
Root Directory → apps/web
Build Command → cd ../.. && pnpm install --frozen-lockfile && pnpm --filter @wisdomos/web build
Install Command → echo 'Skipping separate install - using buildCommand'
Framework → Next.js
Node Version → 20.x
```

**Then:**
```
Deployments → Latest → ⋯ → Redeploy (without cache)
```

---

**Estimated Time:** 5-10 minutes
**Difficulty:** Easy (point-and-click in dashboard)
**Impact:** Will fix all 20+ consecutive deployment failures
