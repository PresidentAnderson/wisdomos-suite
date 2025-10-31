# WisdomOS → Wisdom Migration Plan

## Overview
Migrating from monorepo structure (wisdomOS) to new wisdom/ architecture with separated editions and platforms.

**Migration Type:** Big Bang (all at once)
**Target Structure:** Separate apps per edition per platform

---

## Current Structure Analysis

### Apps (4)
- `apps/web/` - Next.js 14 web app (@wisdomos/web) - Main application
- `apps/api/` - NestJS API server (@wisdomos/api)
- `apps/community/` - Community hub (@wisdomos/community)
- `apps/mobile/` - React Native/Expo mobile app (@wisdomos/mobile)

### Packages (9)
- `packages/core/` - Business logic (@wisdomos/core)
- `packages/ui/` - Shared UI components (@wisdomos/ui)
- `packages/db/` - Prisma database (@wisdomos/db)
- `packages/types/` - TypeScript definitions (@wisdomos/types)
- `packages/api-client/` - API client utilities (@wisdomos/api-client)
- `packages/i18n/` - Internationalization (@wisdomos/i18n)
- `packages/database/` - Database utilities (@wisdomos/database)
- `packages/legacy/` - Legacy code (@wisdomos/legacy)
- `packages/contrib/` - Contributions (@wisdomos/contrib)

### Infrastructure
- `supabase/` - Database migrations
- `database/` - Database configuration
- `docker/` - Docker configs
- `.github/workflows/` - CI/CD pipelines
- `scripts/` - Build and deployment scripts

---

## Target Structure

```
wisdom/
├── shared/
│   ├── core/              # Business logic, models, auth (from packages/core, types, api-client)
│   ├── ui-components/     # Design system (from packages/ui)
│   ├── database/          # Prisma, migrations (from packages/db, database, supabase/)
│   ├── assets/            # Branding, i18n (from packages/i18n)
│   └── config/            # Feature flags by edition (NEW)
│
├── editions/
│   ├── free/              # Free tier edition
│   │   ├── web/
│   │   ├── mobile/
│   │   └── config/
│   ├── community-hub/     # Community edition (from apps/community)
│   │   ├── web/
│   │   └── config/
│   ├── student/           # Student edition (NEW)
│   │   └── config/
│   ├── institutional/     # Institutional edition (NEW)
│   │   └── config/
│   ├── standard/          # Standard edition (NEW)
│   │   └── config/
│   ├── advanced/          # Advanced edition (NEW)
│   │   └── config/
│   └── premium/           # Premium edition (from apps/web)
│       ├── web/
│       ├── mobile/
│       ├── desktop/
│       └── config/
│
└── platforms/
    ├── desktop/
    │   ├── windows/       # Electron + Windows
    │   ├── macos/         # Electron + macOS
    │   ├── unix/          # Electron + Linux
    │   └── shared/        # Shared Electron code
    ├── web-saas/
    │   ├── frontend/      # Shared Next.js base (from apps/web)
    │   ├── backend/       # NestJS API (from apps/api)
    │   └── deployment/    # Docker, K8s configs
    └── mobile/
        ├── ios/           # iOS-specific (from apps/mobile)
        ├── android/       # Android-specific (from apps/mobile)
        └── shared/        # Shared React Native/Expo code
```

---

## Migration Mapping

### Phase 1: Shared Infrastructure
| Current | New | Notes |
|---------|-----|-------|
| `packages/core/` | `wisdom/shared/core/` | Core business logic |
| `packages/types/` | `wisdom/shared/core/types/` | Merge into core |
| `packages/api-client/` | `wisdom/shared/core/api-client/` | Merge into core |
| `packages/ui/` | `wisdom/shared/ui-components/` | UI design system |
| `packages/db/` | `wisdom/shared/database/prisma/` | Prisma schema |
| `packages/database/` | `wisdom/shared/database/utils/` | DB utilities |
| `supabase/migrations/` | `wisdom/shared/database/migrations/` | SQL migrations |
| `packages/i18n/` | `wisdom/shared/assets/i18n/` | Localization |
| NEW | `wisdom/shared/assets/branding/` | Brand assets |
| NEW | `wisdom/shared/config/` | Feature flag system |

### Phase 2: Platforms
| Current | New | Notes |
|---------|-----|-------|
| `apps/web/` | `wisdom/platforms/web-saas/frontend/` | Next.js base |
| `apps/api/` | `wisdom/platforms/web-saas/backend/` | NestJS API |
| `docker/`, `deployment-configs/` | `wisdom/platforms/web-saas/deployment/` | Infrastructure |
| `apps/mobile/` (iOS) | `wisdom/platforms/mobile/ios/` | iOS specific |
| `apps/mobile/` (Android) | `wisdom/platforms/mobile/android/` | Android specific |
| `apps/mobile/` (shared) | `wisdom/platforms/mobile/shared/` | RN/Expo shared |
| NEW | `wisdom/platforms/desktop/` | Electron apps (future) |

### Phase 3: Editions
| Current | New | Notes |
|---------|-----|-------|
| `apps/web/` | `wisdom/editions/premium/web/` | Premium web edition |
| `apps/community/` | `wisdom/editions/community-hub/web/` | Community edition |
| NEW | `wisdom/editions/free/` | Free tier |
| NEW | `wisdom/editions/student/` | Student edition |
| NEW | `wisdom/editions/standard/` | Standard edition |
| NEW | `wisdom/editions/advanced/` | Advanced edition |

---

## Package Naming Convention

### Old → New Package Names
- `@wisdomos/core` → `@wisdom/shared-core`
- `@wisdomos/ui` → `@wisdom/shared-ui`
- `@wisdomos/db` → `@wisdom/shared-database`
- `@wisdomos/types` → `@wisdom/shared-types` (deprecated, merge to core)
- `@wisdomos/api-client` → `@wisdom/shared-api-client` (deprecated, merge to core)
- `@wisdomos/web` → `@wisdom/premium-web` or `@wisdom/platform-web`
- `@wisdomos/api` → `@wisdom/platform-api`
- `@wisdomos/mobile` → `@wisdom/platform-mobile`
- `@wisdomos/community` → `@wisdom/edition-community-hub`

---

## Workspace Configuration

### New pnpm-workspace.yaml
```yaml
packages:
  # Shared packages
  - 'wisdom/shared/*'
  - 'wisdom/shared/core/*'
  - 'wisdom/shared/database/*'

  # Platform packages
  - 'wisdom/platforms/web-saas/*'
  - 'wisdom/platforms/mobile/*'
  - 'wisdom/platforms/desktop/*'

  # Edition packages
  - 'wisdom/editions/*/web'
  - 'wisdom/editions/*/mobile'
  - 'wisdom/editions/*/desktop'
```

### Updated turbo.json
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "dev": {
      "cache": false,
      "persistent": true
    },
    "build": {
      "cache": true,
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "build/**", "out/**"]
    },
    "lint": {
      "cache": true
    },
    "test": {
      "cache": true,
      "dependsOn": ["^build"]
    }
  }
}
```

---

## Migration Steps

### Step 1: Create Directory Structure
1. Create `wisdom/` root directory
2. Create all subdirectories for shared/, editions/, platforms/
3. Keep original structure intact during migration

### Step 2: Migrate Shared Packages
1. Move `packages/core/` → `wisdom/shared/core/`
2. Move `packages/ui/` → `wisdom/shared/ui-components/`
3. Move `packages/db/` + `supabase/` → `wisdom/shared/database/`
4. Move `packages/i18n/` → `wisdom/shared/assets/i18n/`
5. Create `wisdom/shared/config/` with feature flag system
6. Update package.json names and dependencies

### Step 3: Migrate Platforms
1. Move `apps/api/` → `wisdom/platforms/web-saas/backend/`
2. Copy `apps/web/` → `wisdom/platforms/web-saas/frontend/` (base)
3. Move `apps/mobile/` → `wisdom/platforms/mobile/shared/`
4. Create iOS/Android specific directories
5. Move deployment configs → `wisdom/platforms/web-saas/deployment/`
6. Update package.json names and dependencies

### Step 4: Setup Editions
1. Move `apps/community/` → `wisdom/editions/community-hub/web/`
2. Move/copy `apps/web/` → `wisdom/editions/premium/web/`
3. Create edition configs for free, student, standard, advanced
4. Setup feature flag system in each edition
5. Link editions to platforms

### Step 5: Update Configuration
1. Create new `pnpm-workspace.yaml`
2. Update root `package.json` scripts
3. Update `turbo.json` with new paths
4. Update `tsconfig.json` path mappings
5. Update CI/CD workflows in `.github/workflows/`

### Step 6: Update Import Paths
1. Search and replace `@wisdomos/*` imports
2. Update relative imports across all files
3. Update path aliases in tsconfig files
4. Update API client imports

### Step 7: Testing & Validation
1. Run `pnpm install` to rebuild node_modules
2. Run `pnpm db:generate` to regenerate Prisma client
3. Test `pnpm build` on all packages
4. Test `pnpm dev` on all apps
5. Run all tests
6. Verify deployment configurations

### Step 8: Cleanup
1. Remove old `apps/` directory
2. Remove old `packages/` directory
3. Remove old migration documentation
4. Update README.md with new structure
5. Commit migration

---

## Risk Mitigation

### Backup Strategy
1. Create full git branch before migration
2. Tag current state: `git tag pre-wisdom-migration`
3. Keep old structure in separate branch

### Rollback Plan
If migration fails:
1. `git checkout pre-wisdom-migration`
2. Restore from backup branch
3. Investigate issues before retry

### Testing Checklist
- [ ] All packages build successfully
- [ ] All apps start in dev mode
- [ ] Database connections work
- [ ] API endpoints respond correctly
- [ ] Mobile app builds for iOS/Android
- [ ] All tests pass
- [ ] CI/CD pipelines pass
- [ ] Deployment succeeds

---

## Post-Migration Tasks

1. Update CLAUDE.md with new structure
2. Update documentation (README.md, REPOSITORY-STRUCTURE.md)
3. Update deployment guides
4. Update CI/CD workflows
5. Update team documentation
6. Announce migration to team

---

## Timeline Estimate

**Total Time:** 4-6 hours

| Phase | Duration | Notes |
|-------|----------|-------|
| Setup & Planning | 30 min | Create directories |
| Migrate Shared | 1 hour | Move packages |
| Migrate Platforms | 1.5 hours | Move apps, update configs |
| Setup Editions | 1 hour | Create edition structure |
| Update Configs | 45 min | Workspace, turbo, tsconfig |
| Fix Imports | 1 hour | Search/replace, path updates |
| Testing | 1 hour | Build, dev, tests |
| Cleanup | 15 min | Remove old dirs, docs |

---

## Decision Log

**Q: How should editions and platforms work together?**
A: Editions = Separate apps per edition per platform

**Q: Migration approach?**
A: All at once (big bang migration)

**Q: What happens to existing deployments?**
A: Update deployment configs to point to new paths

**Q: Package naming?**
A: Use `@wisdom/` namespace instead of `@wisdomos/`
