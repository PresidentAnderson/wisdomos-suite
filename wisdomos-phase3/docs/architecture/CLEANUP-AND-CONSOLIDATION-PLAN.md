# WisdomOS 2026 - Cleanup and Consolidation Plan

**Date:** 2025-10-29
**Status:** ACTIVE - Awaiting User Approval
**Purpose:** Consolidate scattered folders, establish clear edition management, enable parallel platform builds

---

## Executive Summary

### Current State Discovery

**✅ GOOD NEWS:**
- You already have Turbo + pnpm monorepo configured
- Active workspace at `apps/wisdom/platforms/` with proper `@wisdom/platform-*` naming
- Edition structure exists at `apps/wisdom/editions/` with 10 tiers
- Root package.json references correct packages (`@wisdom/platform-web`, `@wisdom/shared-database`)

**❌ PROBLEM:**
- **~10GB of scattered/legacy code** in `apps/wisdom/` alongside the proper structure
- Multiple "wisdomos" instances with conflicting purposes
- No edition manifests (editions are folders but lack configuration files)
- Unclear which scattered folders are active vs abandoned

### Source of Truth Identified

**CANONICAL STRUCTURE (Active):**
```
apps/wisdom/platforms/
├── web-saas/frontend/        (@wisdom/platform-web) ← ROOT REFERENCES THIS
├── mobile/                    (@wisdom/platform-mobile)
└── desktop/                   (@wisdom/platform-desktop)

apps/wisdom/editions/
├── free/, student/, standard/, advanced/, premium/
├── institutional/, teacher/, community-hub/
├── personal edition/, experimental/
```

**SCATTERED/DUPLICATE CODE (To Be Archived):**
- `wisdome phase 3/` (3.8GB) - package name "wisdomos" v1.0.0
- `wisdomos-fullstack/` (172MB) - package name "wisdomos"
- `wisdomos-community-hub/` (564MB) - duplicates `editions/community-hub/`
- `wisdomos-core/` (184MB) - duplicates functionality of `@wisdomos/core` in packages/
- `wisdom course/` (296MB) - course content, standalone
- `wisdom-site-deployment/` (1.1GB) - deployment configs (may have useful configs)
- `Wisdom Unlimited/` (16MB) - single HTML file, legacy
- `wisdomos-mobile/` (16MB) - empty iOS/Android dirs

---

## Phase 1: Archive Legacy Folders (Week 1)

### Step 1.1: Create Archive Directory

```bash
mkdir -p "/Volumes/DevOPS 2025/01_DEVOPS_PLATFORM/wisdomOS 2026/_ARCHIVED_$(date +%Y%m%d)"
```

### Step 1.2: Archive Candidates (Manual Review Required)

| Folder | Size | Status | Recommendation |
|--------|------|--------|----------------|
| `wisdome phase 3/` | 3.8GB | Has package.json, appears to be dev/experimental | **REVIEW** - May contain recent work, check git history |
| `wisdomos-fullstack/` | 172MB | Has package.json, named "wisdomos" | **ARCHIVE** - Duplicate of platforms structure |
| `wisdomos-community-hub/` | 564MB | Has package.json, deployment guide | **ARCHIVE** - Moved to `editions/community-hub/` |
| `wisdomos-core/` | 184MB | Package "@wisdomos/core", v1.0.0 | **REVIEW** - Check if `packages/core/` has same functionality |
| `wisdom course/` | 296MB | Course content, package.json | **ARCHIVE** or **MOVE TO /docs/course/** |
| `wisdom-site-deployment/` | 1.1GB | Deployment configs, Docker | **EXTRACT CONFIGS** then archive |
| `Wisdom Unlimited/` | 16MB | Single HTML file | **ARCHIVE** |
| `wisdomos-mobile/` | 16MB | Empty dirs, no package.json | **DELETE** |

### Step 1.3: Pre-Archive Audit Commands

Before archiving, extract potentially useful files:

```bash
# Check for recent modifications in wisdome phase 3
find "apps/wisdom/wisdome phase 3" -type f -mtime -30 -ls

# Check git log for recent commits touching these folders
git log --since="2024-10-01" --name-only --oneline -- "apps/wisdom/wisdome phase 3" "apps/wisdom/wisdomos-fullstack"

# Compare wisdomos-core with packages/core
diff -rq "apps/wisdom/wisdomos-core/src" "packages/core/src" || echo "Differences found - manual review required"

# Extract deployment configs before archiving
cp -r "apps/wisdom/wisdom-site-deployment/docker-compose.yml" "deployment-configs/"
cp -r "apps/wisdom/wisdom-site-deployment/Dockerfile" "deployment-configs/"
```

### Step 1.4: Execute Archive (AFTER USER APPROVAL)

```bash
# Archive script (DO NOT RUN YET)
ARCHIVE_DIR="_ARCHIVED_$(date +%Y%m%d)"

mv "apps/wisdom/Wisdom Unlimited" "$ARCHIVE_DIR/"
mv "apps/wisdom/wisdomos-community-hub" "$ARCHIVE_DIR/"
mv "apps/wisdom/wisdomos-fullstack" "$ARCHIVE_DIR/"
# Continue after manual review of wisdome phase 3 and wisdomos-core
```

---

## Phase 2: Create Edition Manifests (Week 1-2)

### Current State
- Editions exist as folders: `free/`, `student/`, `standard/`, etc.
- Each has subdirs: `config/`, `desktop/`, `mobile/`, `web/`
- **NO manifest.json files** defining features/branding

### Implementation: Edition Manifest System

**Location:** `apps/wisdom/editions/[edition-name]/manifest.json`

**Template Structure:**
```json
{
  "$schema": "../../edition-schema.json",
  "id": "free",
  "name": "WisdomOS — Free Edition",
  "tier": "free",
  "branding": {
    "primaryColor": "#5B8CFF",
    "logoPath": "./assets/logo-free.svg",
    "tagline": "Start your wisdom journey"
  },
  "features": {
    "autobiography": true,
    "journal": true,
    "dailyPrompts": true,
    "fulfillmentDisplay": true,
    "relationshipAssessment": false,
    "coachTools": false,
    "orgAdmin": false,
    "exportPDF": false,
    "aiAnalysis": false
  },
  "limits": {
    "maxEntries": 100,
    "maxAreas": 5,
    "storageGB": 1
  },
  "platforms": ["web"],
  "pricing": {
    "currency": "USD",
    "monthlyPrice": 0,
    "annualPrice": 0
  }
}
```

### Edition Manifest Mapping

| Edition | Features | Platforms | Pricing |
|---------|----------|-----------|---------|
| **free** | autobiography, journal, dailyPrompts, fulfillmentDisplay | web | $0 |
| **student** | + relationshipAssessment, increased limits | web, mobile | $4.99/mo |
| **standard** | + exportPDF, aiAnalysis | web, mobile, desktop | $9.99/mo |
| **advanced** | + customFields, advancedCharts | web, mobile, desktop | $19.99/mo |
| **premium** | + coachTools, prioritySupport | web, mobile, desktop | $49.99/mo |
| **teacher** | + classManagement, studentReports | web, mobile, desktop | $29.99/mo |
| **institutional** | + orgAdmin, SSO, multiUser | web, desktop | Custom |
| **community-hub** | + communityForums, publicSharing | web, mobile | $14.99/mo |
| **personal edition** | All personal features, no org | web, mobile, desktop | $24.99/mo |
| **experimental** | Bleeding edge features, unstable | web | $0 (beta testers) |

### Action Items

1. **Create edition schema:**
   - File: `apps/wisdom/edition-schema.json`
   - Defines structure for manifest.json validation

2. **Generate manifests for all 10 editions:**
   - Use template above with edition-specific values
   - Place in each `editions/[name]/manifest.json`

3. **Create edition loader:**
   - Location: `packages/config/src/edition-loader.ts`
   - Reads `process.env.EDITION` and loads corresponding manifest
   - Exports `features`, `branding`, `limits` objects

---

## Phase 3: Build @wisdom/config Package (Week 2)

### Purpose
- Centralized feature flag system driven by edition manifests
- Runtime and compile-time feature detection
- Branding/theming configuration per edition

### Package Structure

```
packages/config/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts                  # Main exports
│   ├── edition-loader.ts         # Reads manifest.json
│   ├── feature-flags.ts          # Feature detection utilities
│   ├── branding.ts               # Branding/theme utilities
│   └── types.ts                  # TypeScript types
└── README.md
```

### Key Exports

```typescript
// packages/config/src/index.ts
export { loadEdition, getFeatures, getBranding } from './edition-loader';
export { useFeature } from './feature-flags';
export type { Edition, Features, Branding } from './types';
```

### Usage in Apps

**Web (Next.js):**
```typescript
import { getFeatures } from '@wisdom/config';

export default function RelationshipPage() {
  const features = getFeatures();

  if (!features.relationshipAssessment) {
    return <UpgradePrompt feature="Relationship Assessment" />;
  }

  return <RelationshipAssessment />;
}
```

**Mobile (React Native):**
```typescript
import { useFeature } from '@wisdom/config';

export function JournalScreen() {
  const hasExport = useFeature('exportPDF');

  return (
    <View>
      <JournalList />
      {hasExport && <ExportButton />}
    </View>
  );
}
```

### Environment Variables

**Build-time:**
```bash
# Web
NEXT_PUBLIC_EDITION=premium pnpm build

# Mobile (app.config.ts)
EXPO_PUBLIC_EDITION=student eas build --profile production

# Desktop
ELECTRON_EDITION=institutional pnpm build:desktop
```

**Runtime fallback:**
- Defaults to `free` edition if `EDITION` not set
- Logs warning in development mode

---

## Phase 4: Enhance Turborepo Pipeline (Week 2)

### Current turbo.json

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "dev": { "cache": false, "persistent": true },
    "build": {
      "cache": true,
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "build/**"]
    },
    "lint": { "cache": true },
    "test": { "cache": true }
  }
}
```

### Enhanced turbo.json (Edition-Aware)

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalEnv": ["EDITION", "NEXT_PUBLIC_EDITION", "EXPO_PUBLIC_EDITION"],
  "tasks": {
    "dev": {
      "cache": false,
      "persistent": true
    },
    "build": {
      "cache": true,
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "build/**"],
      "env": ["EDITION", "NEXT_PUBLIC_EDITION"]
    },
    "build:edition": {
      "cache": true,
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "build/**"]
    },
    "lint": {
      "cache": true
    },
    "test": {
      "cache": true,
      "dependsOn": ["^build"]
    },
    "test:e2e": {
      "cache": false,
      "dependsOn": ["build"]
    },
    "db:generate": {
      "cache": true,
      "outputs": ["node_modules/.prisma/**"]
    }
  }
}
```

### GitHub Actions Matrix Build

**File:** `.github/workflows/build-all-editions.yml`

```yaml
name: Build All Editions
on:
  push:
    branches: [main, staging]
  pull_request:

jobs:
  build-matrix:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        edition: [free, student, standard, advanced, premium, institutional]
        platform: [web, mobile, desktop]
        exclude:
          # Free edition only on web
          - edition: free
            platform: mobile
          - edition: free
            platform: desktop

    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 8.15.0

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile

      - name: Build ${{ matrix.platform }} - ${{ matrix.edition }}
        run: pnpm turbo run build --filter=@wisdom/platform-${{ matrix.platform }}
        env:
          EDITION: ${{ matrix.edition }}
          NEXT_PUBLIC_EDITION: ${{ matrix.edition }}
          EXPO_PUBLIC_EDITION: ${{ matrix.edition }}

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: ${{ matrix.platform }}-${{ matrix.edition }}
          path: |
            apps/wisdom/platforms/${{ matrix.platform }}/dist
            apps/wisdom/platforms/${{ matrix.platform }}/.next
```

---

## Phase 5: Documentation Reorganization (Week 3)

### Current State
- 35 markdown files at repository root
- Unorganized, difficult to navigate
- No clear structure

### Proposed Structure

```
docs/
├── README.md                          # Docs navigation hub
├── getting-started/
│   ├── README.md
│   ├── quick-start-auth.md
│   ├── quick-start-database.md
│   └── local-development.md
├── deployment/
│   ├── README.md
│   ├── production-checklist.md
│   ├── vercel-setup.md
│   ├── netlify-setup.md
│   ├── mobile-deployment.md
│   └── desktop-deployment.md
├── features/
│   ├── README.md
│   ├── journal-integration.md
│   ├── fulfillment-display.md
│   ├── difficult-conversations-toolkit.md
│   └── relationship-assessment.md
├── testing/
│   ├── README.md
│   ├── testing-plan.md
│   └── e2e-testing.md
├── architecture/
│   ├── README.md
│   ├── monorepo-structure.md
│   ├── edition-management.md
│   ├── database-design.md
│   └── deployment-status-report.md
├── security/
│   ├── README.md
│   ├── security-fixes-summary.md
│   └── auth-implementation.md
├── editions/
│   ├── README.md
│   ├── edition-comparison.md
│   ├── feature-matrix.md
│   └── pricing-strategy.md
└── adr/                               # Architecture Decision Records
    ├── 0001-monorepo-strategy.md
    ├── 0002-edition-manifest-system.md
    └── 0003-feature-flag-approach.md
```

### Migration Script

```bash
#!/bin/bash
# File: scripts/reorganize-docs.sh

DOCS_DIR="docs"
mkdir -p "$DOCS_DIR"/{getting-started,deployment,features,testing,architecture,security,editions,adr}

# Move getting-started docs
mv QUICK_START_AUTH_FIXES.md "$DOCS_DIR/getting-started/quick-start-auth.md"
mv QUICK_START_DATABASE_SETUP.md "$DOCS_DIR/getting-started/quick-start-database.md"

# Move deployment docs
mv DEPLOYMENT_INSTRUCTIONS.md "$DOCS_DIR/deployment/production-checklist.md"
mv VERCEL_ENV_SETUP.md "$DOCS_DIR/deployment/vercel-setup.md"
mv NETLIFY_*.md "$DOCS_DIR/deployment/"

# Move feature docs
mv JOURNAL_INTEGRATION_GUIDE.md "$DOCS_DIR/features/journal-integration.md"
mv FULFILLMENT_*.md "$DOCS_DIR/features/"
mv DIFFICULT_CONVERSATIONS_TOOLKIT_GUIDE.md "$DOCS_DIR/features/difficult-conversations-toolkit.md"

# Move architecture docs
mv COMPREHENSIVE_DEPLOYMENT_STATUS_REPORT.md "$DOCS_DIR/architecture/deployment-status-report.md"
mv DATABASE_PERSISTENCE_IMPLEMENTATION_REPORT.md "$DOCS_DIR/architecture/database-design.md"

# Move testing docs
mv TESTING_PLAN_COMPLETE.md "$DOCS_DIR/testing/testing-plan.md"

# Move security docs
mv SECURITY_FIXES_COMPLETE.md "$DOCS_DIR/security/security-fixes-summary.md"

echo "Documentation reorganization complete!"
echo "Review the docs/ directory and update any broken links."
```

---

## Phase 6: Source of Truth Mapping (Week 3)

### Edition Change Tracking Matrix

| Change Type | Location | Files to Modify | Build Impact |
|-------------|----------|-----------------|--------------|
| **Add new feature** | `packages/core/src/features/` | Add feature module, update types | All editions |
| **Enable feature in edition** | `apps/wisdom/editions/[edition]/manifest.json` | Update `features` object | Single edition |
| **Modify UI component** | `packages/ui/src/components/` | Edit component file | All platforms |
| **Platform-specific code** | `apps/wisdom/platforms/[platform]/` | Add/edit platform code | Single platform |
| **Database schema change** | `packages/database/prisma/schema.prisma` | Migrate schema, generate client | All apps |
| **Edition branding** | `apps/wisdom/editions/[edition]/manifest.json` | Update `branding` object | Single edition |
| **Add platform to edition** | `apps/wisdom/editions/[edition]/manifest.json` | Update `platforms` array | Single edition |

### Where to Track Changes

**Single Source of Truth Principle:**

1. **Feature Code:** `packages/core/src/features/[feature-name]/`
   - Business logic lives here
   - Imported by all platforms

2. **Feature Availability:** `apps/wisdom/editions/[edition]/manifest.json`
   - Controls which editions have access
   - Consumed by `@wisdom/config` at build time

3. **Platform UI:** `apps/wisdom/platforms/[platform]/`
   - Platform-specific rendering
   - Imports from `packages/ui/` and `packages/core/`

4. **Shared UI:** `packages/ui/src/components/`
   - Reusable components
   - Platform-agnostic (or with platform adapters)

5. **Database:** `packages/database/`
   - Single Prisma schema
   - Migrations tracked in git
   - Schema changes require migration + generation

**Change Flow Example:**

*"Add Relationship Assessment to Standard Edition"*

1. ✅ Feature already exists in `packages/core/src/features/relationship-assessment/`
2. Edit `apps/wisdom/editions/standard/manifest.json`:
   ```json
   "features": {
     "relationshipAssessment": true  // Changed from false
   }
   ```
3. Build standard edition:
   ```bash
   EDITION=standard pnpm turbo run build --filter=@wisdom/platform-web
   ```
4. Test that feature appears in standard, not in free
5. Commit: `feat(editions): enable relationship assessment in standard tier`

---

## Implementation Timeline

### Week 1: Audit & Archive
- [x] **Day 1-2:** Audit scattered folders (COMPLETED)
- [ ] **Day 3:** User review of archive candidates
- [ ] **Day 4-5:** Execute archive, extract configs, cleanup

### Week 2: Edition Infrastructure
- [ ] **Day 1-2:** Create edition schema + manifests for 10 editions
- [ ] **Day 3-4:** Build `@wisdom/config` package with feature flags
- [ ] **Day 5:** Update `turbo.json`, add build:edition scripts

### Week 3: Documentation & CI
- [ ] **Day 1-2:** Reorganize docs/ directory
- [ ] **Day 3-4:** Create GitHub Actions matrix build
- [ ] **Day 5:** Create "source of truth" mapping guide

### Week 4: Testing & Validation
- [ ] **Day 1-2:** Test building each edition × platform combination
- [ ] **Day 3-4:** Validate feature flags work in dev/prod
- [ ] **Day 5:** Document findings, create ADRs

---

## Success Criteria

### Phase 1: Cleanup Complete
- [ ] ~10GB of legacy code archived
- [ ] Only canonical structure remains in `apps/wisdom/`
- [ ] Git history preserved (archive via `git mv`)

### Phase 2: Edition System Live
- [ ] All 10 editions have valid `manifest.json` files
- [ ] `@wisdom/config` package builds successfully
- [ ] Feature flags work in web, mobile, desktop

### Phase 3: Parallel Builds Working
- [ ] `pnpm turbo run build` completes for all platforms
- [ ] GitHub Actions matrix builds all edition × platform combinations
- [ ] Build artifacts correctly reflect edition configurations

### Phase 4: Documentation Accessible
- [ ] All 35 root markdown files moved to organized `docs/` structure
- [ ] Navigation hub at `docs/README.md` complete
- [ ] ADRs document key architectural decisions

### Phase 5: Clear Change Tracking
- [ ] "Source of truth" mapping document complete
- [ ] Team knows where to modify code for each change type
- [ ] Changelog/release notes process documented

---

## Open Questions (Awaiting User Input)

1. **wisdome phase 3 (3.8GB):**
   - Is this active development or experimental?
   - Contains recent SQL migrations (`apply_fd_v5.sql`)
   - Should we merge into canonical structure or archive?

2. **wisdomos-core vs packages/core:**
   - Are these duplicates or serving different purposes?
   - Can we consolidate into single `@wisdomos/core` package?

3. **wisdom course (296MB):**
   - Is this part of the product or standalone?
   - Should it move to `docs/course/` or archive completely?

4. **wisdom-site-deployment configs:**
   - Extract Docker/deployment configs before archiving?
   - Which configs are still relevant?

5. **Edition feature matrix:**
   - Confirm feature availability per tier in table above
   - Any features missing from the list?

6. **Pricing strategy:**
   - Confirm monthly/annual pricing per edition
   - Currency (USD assumed)?

---

## Next Steps

**Immediate Actions (Awaiting Approval):**

1. **Answer open questions above** so we can proceed with archiving
2. **Review and approve archive candidates** table
3. **Confirm edition feature matrix** is accurate
4. **Proceed with Phase 1** (archiving) once approved

**After Approval:**

1. Run pre-archive audit commands
2. Execute archive (preserve git history)
3. Begin creating edition manifests
4. Build `@wisdom/config` package
5. Test parallel builds

---

## References

- Root package.json: `/Volumes/DevOPS 2025/01_DEVOPS_PLATFORM/wisdomOS 2026/package.json`
- Turbo config: `/Volumes/DevOPS 2025/01_DEVOPS_PLATFORM/wisdomOS 2026/turbo.json`
- Canonical platforms: `/Volumes/DevOPS 2025/01_DEVOPS_PLATFORM/wisdomOS 2026/apps/wisdom/platforms/`
- Canonical editions: `/Volumes/DevOPS 2025/01_DEVOPS_PLATFORM/wisdomOS 2026/apps/wisdom/editions/`
- Scattered folders: `/Volumes/DevOPS 2025/01_DEVOPS_PLATFORM/wisdomOS 2026/apps/wisdom/[legacy-folders]/`

---

**Status:** DRAFT - Awaiting user review and approval to proceed with Phase 1
