# WisdomOS Editions - Migration Guide

**Date**: 2025-10-29
**Status**: Ready for Implementation
**Version**: 1.0.0

---

## 🎯 Overview

This guide explains how to migrate your existing WisdomOS codebase to the new **editions-as-first-class-citizens** architecture with unified monorepo structure.

### What's Changing

**Before** (Multiple repos/forks):
- Separate codebases for Personal, Coach, Org
- Code duplication across editions
- Difficult to track changes
- Manual synchronization required

**After** (Unified monorepo):
- Single codebase with edition manifests
- Shared packages across platforms
- One commit → all editions build
- Clear change tracking

---

## 📦 New Structure

```
wisdomos/
├─ editions/                    # ← NEW: Edition configurations
│  ├─ personal/manifest.json
│  ├─ coach/manifest.json
│  └─ org/manifest.json
│
├─ packages/                    # ← NEW: Shared code
│  ├─ config/                  # Edition loader + feature flags
│  ├─ core/                    # Domain logic (TBD)
│  ├─ db/                      # Database + Prisma (TBD)
│  ├─ ui/                      # Shared components (TBD)
│  └─ api/                     # API routes (TBD)
│
├─ apps/
│  ├─ web/                     # Next.js (existing)
│  ├─ mobile/                  # Expo (future)
│  └─ desktop/                 # Electron (future)
│
├─ turbo.json                  # ← NEW: Turborepo config
├─ pnpm-workspace.yaml         # ← NEW: pnpm workspace
└─ .github/workflows/ci.yml    # ← NEW: CI matrix builds
```

---

## 🚀 Migration Steps

### Phase 1: Setup Infrastructure (Day 1)

#### 1.1 Initialize Turborepo

```bash
cd "/Volumes/DevOPS 2025/01_DEVOPS_PLATFORM/wisdomOS 2026"

# Install turborepo
pnpm add -D turbo

# Install tsup for config package
cd packages/config
pnpm install

# Build config package
pnpm build
```

#### 1.2 Update Root package.json

Add these scripts to your root `package.json`:

```json
{
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "clean": "turbo run clean",
    "build:personal": "EDITION=personal turbo run build --filter=apps/web",
    "build:coach": "EDITION=coach turbo run build --filter=apps/web",
    "build:org": "EDITION=org turbo run build --filter=apps/web"
  }
}
```

#### 1.3 Update apps/web/package.json

Add dependency on config package:

```json
{
  "dependencies": {
    "@wisdomos/config": "workspace:*"
  }
}
```

### Phase 2: Integrate Feature Flags (Day 2-3)

#### 2.1 Update Next.js Config

Edit `apps/web/next.config.mjs`:

```javascript
const nextConfig = {
  // ... existing config
  
  // Inject edition at build time
  env: {
    NEXT_PUBLIC_EDITION: process.env.EDITION || 'personal',
  },
}
```

#### 2.2 Start Using Feature Flags

**Example 1: Conditional UI Component**

```typescript
// apps/web/app/dashboard/page.tsx
import { hasFeature } from '@wisdomos/config'

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      
      {/* Always show for all editions */}
      <FulfillmentDisplay />
      
      {/* Only in Coach and Org editions */}
      {hasFeature('coaching', 'clientDashboard') && (
        <ClientDashboard />
      )}
      
      {/* Only in Org edition */}
      {hasFeature('organization', 'teamAnalytics') && (
        <TeamAnalytics />
      )}
    </div>
  )
}
```

**Example 2: Conditional Route**

```typescript
// apps/web/middleware.ts
import { hasFeature } from '@wisdomos/config'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  // Block org-only routes in other editions
  if (path.startsWith('/admin/organization')) {
    if (!hasFeature('organization', 'orgAdmin')) {
      return NextResponse.redirect(new URL('/404', request.url))
    }
  }
}
```

**Example 3: Branding**

```typescript
// apps/web/app/layout.tsx
import { branding } from '@wisdomos/config'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <title>{branding.appName}</title>
        <style>{`
          :root {
            --color-primary: ${branding.primaryColor};
            --color-secondary: ${branding.secondaryColor};
          }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  )
}
```

### Phase 3: Refactor Existing Code (Day 4-7)

#### 3.1 Identify Edition-Specific Code

Search your codebase for edition-specific features:

```bash
# Find coach-specific code
rg -i "coach|client" --type tsx --type ts

# Find org-specific code
rg -i "organization|enterprise|sso" --type tsx --type ts
```

#### 3.2 Wrap with Feature Flags

Replace hardcoded checks with feature flags:

```typescript
// Before
if (process.env.EDITION === 'coach') {
  // coach-only code
}

// After
import { hasFeature } from '@wisdomos/config'

if (hasFeature('coaching', 'clientDashboard')) {
  // coach-only code
}
```

#### 3.3 Move Shared Code to Packages

Identify reusable logic and move to `packages/`:

```bash
# Example: Move journal logic
mkdir -p packages/core/src/journal
mv apps/web/lib/journal/* packages/core/src/journal/

# Example: Move UI components
mkdir -p packages/ui/src/components
mv apps/web/components/shared/* packages/ui/src/components/
```

### Phase 4: Test Builds (Day 8)

#### 4.1 Build Each Edition

```bash
# Build personal edition
pnpm build:personal

# Build coach edition
pnpm build:coach

# Build org edition
pnpm build:org
```

#### 4.2 Verify Feature Flags

Create a test script:

```typescript
// test/feature-flags.test.ts
import { loadEditionManifest, clearManifestCache } from '@wisdomos/config'

describe('Edition Feature Flags', () => {
  beforeEach(() => {
    clearManifestCache()
  })

  it('personal edition should not have coaching features', () => {
    process.env.EDITION = 'personal'
    const manifest = loadEditionManifest()
    expect(manifest.features.coaching.clientDashboard).toBe(false)
  })

  it('coach edition should have coaching features', () => {
    process.env.EDITION = 'coach'
    const manifest = loadEditionManifest()
    expect(manifest.features.coaching.clientDashboard).toBe(true)
  })

  it('org edition should have all features', () => {
    process.env.EDITION = 'org'
    const manifest = loadEditionManifest()
    expect(manifest.features.organization.orgAdmin).toBe(true)
    expect(manifest.features.coaching.clientDashboard).toBe(true)
  })
})
```

### Phase 5: Set Up CI (Day 9)

#### 5.1 Configure GitHub Secrets

Add these secrets to your GitHub repository:

- `NETLIFY_AUTH_TOKEN`
- `NETLIFY_SITE_ID`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### 5.2 Test CI Pipeline

```bash
# Push to trigger CI
git add .
git commit -m "feat: implement editions architecture"
git push origin main
```

Watch the GitHub Actions workflow build all 3 editions in parallel.

---

## 🎨 Usage Examples

### Example 1: Component with Feature Flag

```typescript
// components/navigation/Sidebar.tsx
import { hasFeature, branding } from '@wisdomos/config'

export function Sidebar() {
  return (
    <nav style={{ borderLeftColor: branding.primaryColor }}>
      <NavLink href="/dashboard">Dashboard</NavLink>
      <NavLink href="/journal">Journal</NavLink>
      
      {hasFeature('core', 'autobiography') && (
        <NavLink href="/autobiography">Autobiography</NavLink>
      )}
      
      {hasFeature('coaching', 'clientDashboard') && (
        <NavLink href="/clients">Clients</NavLink>
      )}
      
      {hasFeature('organization', 'teamAnalytics') && (
        <NavLink href="/analytics">Team Analytics</NavLink>
      )}
    </nav>
  )
}
```

### Example 2: API Route with Feature Check

```typescript
// app/api/clients/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { hasFeature } from '@wisdomos/config'

export async function GET(request: NextRequest) {
  // Block if coaching features not enabled
  if (!hasFeature('coaching', 'clientDashboard')) {
    return NextResponse.json(
      { error: 'Feature not available in this edition' },
      { status: 403 }
    )
  }

  // Proceed with coach-specific logic
  const clients = await getClients()
  return NextResponse.json({ clients })
}
```

### Example 3: Conditional Imports

```typescript
// app/dashboard/page.tsx
import { edition } from '@wisdomos/config'

// Dynamically import edition-specific components
const DashboardView = edition.id === 'org' 
  ? lazy(() => import('./OrgDashboard'))
  : lazy(() => import('./PersonalDashboard'))

export default function DashboardPage() {
  return (
    <Suspense fallback={<Loading />}>
      <DashboardView />
    </Suspense>
  )
}
```

---

## 🔧 Troubleshooting

### Issue: "Edition manifest not found"

**Cause**: `EDITION` environment variable not set or invalid path.

**Solution**:
```bash
# Check edition env var
echo $EDITION

# Verify manifest exists
ls editions/personal/manifest.json

# Set explicitly
export EDITION=personal
pnpm build
```

### Issue: Build fails with "Cannot find module '@wisdomos/config'"

**Cause**: Config package not built or not linked.

**Solution**:
```bash
# Build config package
cd packages/config
pnpm build

# Reinstall dependencies
cd ../..
pnpm install
```

### Issue: Features not toggling correctly

**Cause**: Manifest cache or wrong edition loaded.

**Solution**:
```typescript
import { clearManifestCache, loadEditionManifest } from '@wisdomos/config'

// Clear cache
clearManifestCache()

// Reload with specific edition
const manifest = loadEditionManifest('coach')
```

---

## 📊 Migration Checklist

### Pre-Migration
- [ ] Back up existing codebase
- [ ] Document current edition-specific features
- [ ] Identify shared vs. edition-specific code

### Infrastructure
- [ ] Create edition manifests (personal, coach, org)
- [ ] Set up pnpm workspace
- [ ] Configure Turborepo
- [ ] Create config package
- [ ] Set up GitHub Actions

### Code Migration
- [ ] Update Next.js config to inject EDITION
- [ ] Replace hardcoded edition checks with feature flags
- [ ] Move shared code to packages/
- [ ] Update imports to use @wisdomos/* packages
- [ ] Add feature flag checks to routes

### Testing
- [ ] Build each edition successfully
- [ ] Test feature flags work correctly
- [ ] Verify branding changes per edition
- [ ] Test CI pipeline runs for all editions

### Deployment
- [ ] Deploy personal edition
- [ ] Deploy coach edition
- [ ] Deploy org edition
- [ ] Verify each edition works independently

---

## 🎯 Success Criteria

- ✅ Single codebase with 3 edition manifests
- ✅ One commit builds all 3 editions
- ✅ Feature flags control edition-specific functionality
- ✅ CI runs parallel builds for all editions
- ✅ No code duplication between editions
- ✅ Clear change tracking in git history

---

## 📚 Additional Resources

- **Edition Manifests**: `/editions/*/manifest.json`
- **Config Package**: `/packages/config/`
- **Turborepo Docs**: https://turbo.build/repo/docs
- **pnpm Workspaces**: https://pnpm.io/workspaces
- **GitHub Actions Matrix**: https://docs.github.com/en/actions/using-jobs/using-a-matrix-for-your-jobs

---

## 🔮 Future Phases

### Phase 6: Extract More Packages
- Create `@wisdomos/core` for domain logic
- Create `@wisdomos/db` for Prisma schema
- Create `@wisdomos/ui` for shared components
- Create `@wisdomos/api` for API routes

### Phase 7: Add Mobile & Desktop
- Set up Expo for mobile app
- Configure Electron for desktop app
- Share packages across all platforms

### Phase 8: Advanced Features
- Runtime feature flags (kill switches)
- A/B testing per edition
- Edition-specific analytics
- White-label support for Org edition

---

**Created**: 2025-10-29
**Status**: Ready for Implementation
**Next Action**: Start with Phase 1 - Setup Infrastructure
