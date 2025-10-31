# WisdomOS 2026 - Restructuring Strategy

**Date:** 2025-10-29
**Status:** READY FOR EXECUTION
**Purpose:** Consolidate two parallel monorepos into single source of truth with proper edition management

---

## Critical Discovery: Two Parallel Monorepos

### The Problem

You have **TWO complete monorepo structures** running in parallel:

1. **ROOT Monorepo** (Clean, organized)
   - Location: `/Volumes/DevOPS 2025/01_DEVOPS_PLATFORM/wisdomOS 2026/`
   - Package names: `@wisdom/platform-*`, `@wisdom/shared-*`
   - Status: ⚠️ **APPEARS TO BE OLDER/LESS ACTIVE**

2. **"wisdome phase 3" Monorepo** (Active development)
   - Location: `/Volumes/DevOPS 2025/01_DEVOPS_PLATFORM/wisdomOS 2026/apps/wisdom/wisdome phase 3/`
   - Package names: `@wisdomos/*`
   - Status: ✅ **ACTIVE - Recent SQL migrations, agent updates**
   - Size: 3.8GB

3. **"wisdomos-core" Library** (Different implementation)
   - Location: `/Volumes/DevOPS 2025/01_DEVOPS_PLATFORM/wisdomOS 2026/apps/wisdom/wisdomos-core/`
   - Package name: `@wisdomos/core`
   - Focus: Phoenix transformation business logic
   - Status: ⚠️ **DIFFERENT from both core packages above**

### Key Finding: Three Different "@wisdomos/core" Packages

| Package | Location | Contents | Purpose |
|---------|----------|----------|---------|
| **ROOT core** | `packages/core/` | Zod schemas (audit, fulfillment, journal, lifeArea, user) | Data validation layer |
| **Wisdome Phase 3 core** | `apps/wisdom/wisdome phase 3/packages/core/` | **IDENTICAL to ROOT** - Same schemas | **DUPLICATE** |
| **wisdomos-core** | `apps/wisdom/wisdomos-core/` | Phoenix transformation logic (interfaces, transformations, utils, tests) | Business logic layer |

**Conclusion:**
- ROOT `packages/core` and Wisdome Phase 3 `packages/core` are **EXACT DUPLICATES**
- `wisdomos-core` is **DIFFERENT** - handles Phoenix transformation (rebirth/renewal metaphor)
- They serve **DIFFERENT LAYERS**: schemas (validation) vs transformations (business logic)

---

## The Restructuring Strategy

### Option A: Promote "wisdome phase 3" to Root (RECOMMENDED)

**Rationale:**
- Wisdome phase 3 has recent activity (last 30 days)
- Contains updated SQL migrations, agent code
- Has complete monorepo structure already
- Currently buried 3 levels deep

**Steps:**

1. **Preserve Current Root Structure**
   ```bash
   # Create backup of current root
   mkdir -p "_BACKUPS/root-structure-$(date +%Y%m%d)"
   cp -r apps packages config docs "_BACKUPS/root-structure-$(date +%Y%m%d)/"
   ```

2. **Promote Wisdome Phase 3 Contents**
   ```bash
   # Move wisdome phase 3 contents UP to root
   cd "/Volumes/DevOPS 2025/01_DEVOPS_PLATFORM/wisdomOS 2026"

   # Option 1: Merge apps/ and packages/
   rsync -av "apps/wisdom/wisdome phase 3/apps/" "apps/"
   rsync -av "apps/wisdom/wisdome phase 3/packages/" "packages/"

   # Option 2: Start fresh from wisdome phase 3
   # (More radical - essentially promotes phase 3 to root)
   ```

3. **Integrate wisdomos-core as Separate Package**
   ```bash
   # Rename to avoid confusion with schema core
   mv "apps/wisdom/wisdomos-core" "packages/phoenix-core"

   # Update package.json
   # Change: "name": "@wisdomos/core"
   # To: "name": "@wisdomos/phoenix-core"
   ```

4. **Integrate wisdom course as Separate App**
   ```bash
   # Move to apps/ as standalone application
   mv "apps/wisdom/wisdom course" "apps/course-leader"

   # Update package.json
   # Change: "name": "wisdom-course"
   # To: "name": "@wisdom/course-leader"
   ```

5. **Archive Remaining Scattered Folders**
   ```bash
   mkdir -p "_ARCHIVED_$(date +%Y%m%d)"
   mv "apps/wisdom/wisdomos-fullstack" "_ARCHIVED_$(date +%Y%m%d)/"
   mv "apps/wisdom/wisdomos-community-hub" "_ARCHIVED_$(date +%Y%m%d)/"
   mv "apps/wisdom/wisdom-site-deployment" "_ARCHIVED_$(date +%Y%m%d)/"
   mv "apps/wisdom/Wisdom Unlimited" "_ARCHIVED_$(date +%Y%m%d)/"
   ```

6. **Clean Result:**
   ```
   /wisdomOS 2026/
   ├── apps/
   │   ├── api/                    (from wisdome phase 3)
   │   ├── web/                    (from wisdome phase 3)
   │   ├── mobile/                 (from wisdome phase 3)
   │   ├── community/              (from wisdome phase 3)
   │   ├── course-leader/          (from wisdom course)
   │   └── wisdom/                 (KEEP - contains editions/ and platforms/)
   ├── packages/
   │   ├── core/                   (schemas - from wisdome phase 3)
   │   ├── phoenix-core/           (transformations - from wisdomos-core)
   │   ├── database/
   │   ├── ui/
   │   ├── agents/
   │   └── [other packages from wisdome phase 3]
   ```

### Option B: Merge Wisdome Phase 3 INTO Existing Structure

**Rationale:**
- Preserve existing root organization
- Cherry-pick active code from wisdome phase 3
- More surgical approach

**Steps:**

1. **Compare and Merge Apps:**
   - Check if root `apps/api/` vs wisdome phase 3 `apps/api/` differ
   - Keep most recent version
   - Merge any unique features

2. **Merge Packages:**
   - Use wisdome phase 3 `packages/core/` (has recent updates)
   - Keep `wisdomos-core` separate as `phoenix-core`
   - Consolidate agents, UI, database packages

3. **Archive wisdome phase 3 Shell:**
   - Once contents extracted, archive the folder

---

## Recommended Structure After Restructuring

```
/Volumes/DevOPS 2025/01_DEVOPS_PLATFORM/wisdomOS 2026/
├── .git/                                    # Single git repo
├── .github/workflows/                       # CI/CD
├── apps/
│   ├── api/                                 # Backend API (NestJS)
│   ├── web/                                 # Web app (Next.js)
│   ├── mobile/                              # Mobile app (Expo/RN)
│   ├── community/                           # Community platform
│   ├── course-leader/                       # Course leader app (from "wisdom course")
│   └── wisdom/                              # Edition/platform management
│       ├── editions/                        # 10 edition configs + manifests
│       │   ├── free/
│       │   │   ├── manifest.json           # NEW - feature flags
│       │   │   ├── config/
│       │   │   ├── desktop/
│       │   │   ├── mobile/
│       │   │   └── web/
│       │   ├── student/manifest.json
│       │   ├── standard/manifest.json
│       │   ├── advanced/manifest.json
│       │   ├── premium/manifest.json
│       │   ├── institutional/manifest.json
│       │   ├── teacher/manifest.json
│       │   ├── community-hub/manifest.json
│       │   ├── personal edition/manifest.json
│       │   └── experimental/manifest.json
│       ├── platforms/                       # Platform-specific implementations
│       │   ├── web-saas/
│       │   ├── mobile/
│       │   └── desktop/
│       └── shared/                          # Shared wisdom app code
├── packages/
│   ├── core/                                # Zod schemas for validation
│   ├── phoenix-core/                        # Phoenix transformation logic (renamed from wisdomos-core)
│   ├── database/                            # Prisma schema + client
│   ├── ui/                                  # Shared UI components
│   ├── agents/                              # AI agents
│   ├── ai-tags/                             # AI tagging system
│   ├── api-client/                          # API client library
│   ├── config/                              # NEW - Edition loader + feature flags
│   ├── i18n/                                # Internationalization
│   ├── navigation/                          # Navigation utilities
│   ├── sync/                                # Sync utilities
│   └── types/                               # Shared TypeScript types
├── config/
│   ├── ci-cd/
│   └── docker/
├── deployment-configs/
│   ├── web/
│   ├── mobile/
│   ├── desktop/
│   └── api/
├── docs/                                    # Reorganized documentation
│   ├── getting-started/
│   ├── deployment/
│   ├── features/
│   ├── architecture/
│   ├── editions/
│   └── adr/
├── scripts/                                 # Automation scripts
├── supabase/                                # Supabase backend
├── tests/                                   # Tests
├── _ARCHIVED_20251029/                      # Archived legacy code
├── _BACKUPS/                                # Backups during migration
├── package.json                             # Root workspace
├── pnpm-workspace.yaml                      # Workspace config
├── turbo.json                               # Turbo config
└── README.md
```

---

## Package Naming Convention (Standardized)

After restructuring, standardize package names:

### Apps
- `@wisdom/api` (or keep `@wisdomos/api`)
- `@wisdom/web` (or keep `@wisdomos/web`)
- `@wisdom/mobile` (or keep `@wisdomos/mobile`)
- `@wisdom/community` (or keep `@wisdomos/community`)
- `@wisdom/course-leader` (NEW - from wisdom course)

### Packages
- `@wisdomos/core` - Zod schemas
- `@wisdomos/phoenix-core` - Phoenix transformation logic (renamed)
- `@wisdomos/database` - Prisma + Supabase
- `@wisdomos/ui` - UI components
- `@wisdomos/agents` - AI agents
- `@wisdomos/config` - **NEW** - Edition loader + feature flags
- `@wisdomos/[other-packages]`

**Decision Needed:** Choose between `@wisdom/*` or `@wisdomos/*` for consistency.

---

## Phase-by-Phase Execution Plan

### Phase 1: Analysis & Backup (Day 1)

**Goal:** Understand differences between root and wisdome phase 3, backup everything

```bash
# 1. Full backup
tar -czf "wisdomos-2026-backup-$(date +%Y%m%d).tar.gz" \
  "/Volumes/DevOPS 2025/01_DEVOPS_PLATFORM/wisdomOS 2026"

# 2. Compare apps/
diff -rq "apps/api" "apps/wisdom/wisdome phase 3/apps/api" > diff-api.txt
diff -rq "apps/web" "apps/wisdom/wisdome phase 3/apps/web" > diff-web.txt
diff -rq "apps/mobile" "apps/wisdom/wisdome phase 3/apps/mobile" > diff-mobile.txt

# 3. Compare packages/
diff -rq "packages/core" "apps/wisdom/wisdome phase 3/packages/core" > diff-core.txt
diff -rq "packages/database" "apps/wisdom/wisdome phase 3/packages/database" > diff-database.txt

# 4. Review diffs
cat diff-*.txt | grep -E "^Only in|^Files .* differ"
```

**Expected Outcome:**
- Identify which codebase is more recent
- Find unique features in each
- Create merge strategy

### Phase 2: Decision Point (Day 1-2)

**Choose ONE approach:**

**A. Promote wisdome phase 3** (if it's clearly more active)
- Faster execution
- Less merge conflicts
- Cleaner result

**B. Merge into root** (if root has valuable unique code)
- More controlled
- Preserves existing structure
- Requires careful merging

### Phase 3: Execute Restructure (Day 2-3)

**If Option A (Promote):**

```bash
#!/bin/bash
# File: scripts/restructure-promote-phase3.sh

set -e  # Exit on error

BACKUP_DIR="_BACKUPS/pre-restructure-$(date +%Y%m%d_%H%M%S)"
ARCHIVE_DIR="_ARCHIVED_$(date +%Y%m%d)"

echo "Creating backup..."
mkdir -p "$BACKUP_DIR"
cp -r apps packages config "$BACKUP_DIR/"

echo "Creating archive directory..."
mkdir -p "$ARCHIVE_DIR"

echo "Promoting wisdome phase 3 apps..."
rsync -av "apps/wisdom/wisdome phase 3/apps/" "apps/" --exclude node_modules

echo "Promoting wisdome phase 3 packages..."
rsync -av "apps/wisdom/wisdome phase 3/packages/" "packages/" --exclude node_modules

echo "Renaming wisdomos-core to phoenix-core..."
mv "apps/wisdom/wisdomos-core" "packages/phoenix-core"

echo "Moving wisdom course to apps/course-leader..."
mv "apps/wisdom/wisdom course" "apps/course-leader"

echo "Archiving legacy folders..."
mv "apps/wisdom/wisdomos-fullstack" "$ARCHIVE_DIR/"
mv "apps/wisdom/wisdomos-community-hub" "$ARCHIVE_DIR/"
mv "apps/wisdom/wisdom-site-deployment" "$ARCHIVE_DIR/"
mv "apps/wisdom/Wisdom Unlimited" "$ARCHIVE_DIR/"
mv "apps/wisdom/wisdomos-mobile" "$ARCHIVE_DIR/"

echo "Removing wisdome phase 3 shell..."
rm -rf "apps/wisdom/wisdome phase 3"

echo "Restructure complete!"
echo "Backup saved to: $BACKUP_DIR"
echo "Archived files in: $ARCHIVE_DIR"
```

**If Option B (Merge):**

```bash
#!/bin/bash
# File: scripts/restructure-merge.sh

# More complex - requires manual review of each diff
# Cherry-pick files from wisdome phase 3 based on analysis
```

### Phase 4: Update Package Names (Day 3-4)

**Update phoenix-core package.json:**
```json
{
  "name": "@wisdomos/phoenix-core",
  "version": "1.0.0",
  "description": "Phoenix transformation business logic",
  ...
}
```

**Update course-leader package.json:**
```json
{
  "name": "@wisdom/course-leader",
  "version": "1.0.0",
  "description": "Course leader application",
  ...
}
```

**Update imports across codebase:**
```bash
# Find all imports of @wisdomos/core that should point to phoenix-core
grep -r "@wisdomos/core" apps/ packages/ | grep -v "node_modules"

# Update manually or with sed (carefully!)
```

### Phase 5: Create Edition Manifests (Day 4-5)

**Generate manifest.json for each edition:**

```bash
# Script to generate all manifests
node scripts/generate-edition-manifests.js
```

**Example: `apps/wisdom/editions/free/manifest.json`**
```json
{
  "$schema": "../../edition-schema.json",
  "id": "free",
  "name": "WisdomOS — Free",
  "tier": "free",
  "branding": {
    "primaryColor": "#5B8CFF",
    "logoPath": "./assets/logo-free.svg"
  },
  "features": {
    "autobiography": true,
    "journal": true,
    "dailyPrompts": true,
    "fulfillmentDisplay": true,
    "relationshipAssessment": false,
    "coachTools": false,
    "orgAdmin": false
  },
  "limits": {
    "maxEntries": 100,
    "maxAreas": 5
  },
  "platforms": ["web"],
  "pricing": {
    "monthlyPrice": 0,
    "currency": "USD"
  }
}
```

### Phase 6: Build @wisdomos/config Package (Day 5-6)

**Create edition loader:**

```typescript
// packages/config/src/edition-loader.ts
import fs from 'fs';
import path from 'path';
import { Edition } from './types';

const EDITION = process.env.EDITION || process.env.NEXT_PUBLIC_EDITION || 'free';

let cachedEdition: Edition | null = null;

export function loadEdition(): Edition {
  if (cachedEdition) return cachedEdition;

  const manifestPath = path.join(
    process.cwd(),
    'apps/wisdom/editions',
    EDITION,
    'manifest.json'
  );

  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    cachedEdition = manifest;
    return manifest;
  } catch (error) {
    console.warn(`Failed to load edition "${EDITION}", falling back to "free"`);
    // Fallback to free edition
    const freePath = path.join(process.cwd(), 'apps/wisdom/editions/free/manifest.json');
    const freeManifest = JSON.parse(fs.readFileSync(freePath, 'utf-8'));
    cachedEdition = freeManifest;
    return freeManifest;
  }
}

export function getFeatures() {
  return loadEdition().features;
}

export function getBranding() {
  return loadEdition().branding;
}

export function getLimits() {
  return loadEdition().limits;
}
```

**Create feature flag hook:**

```typescript
// packages/config/src/feature-flags.ts
import { getFeatures } from './edition-loader';

export function useFeature(featureName: keyof typeof features): boolean {
  const features = getFeatures();
  return features[featureName] === true;
}

export function requireFeature(featureName: string) {
  if (!useFeature(featureName)) {
    throw new Error(`Feature "${featureName}" not available in current edition`);
  }
}
```

### Phase 7: Update Apps to Use @wisdomos/config (Day 6-7)

**Web app example:**

```typescript
// apps/web/app/relationship/page.tsx
import { getFeatures } from '@wisdomos/config';
import { RelationshipAssessment } from '@/components/RelationshipAssessment';
import { UpgradePrompt } from '@/components/UpgradePrompt';

export default function RelationshipPage() {
  const features = getFeatures();

  if (!features.relationshipAssessment) {
    return <UpgradePrompt feature="Relationship Assessment" />;
  }

  return <RelationshipAssessment />;
}
```

### Phase 8: Test Builds (Day 7-8)

**Test each edition builds correctly:**

```bash
# Free edition
EDITION=free pnpm turbo run build --filter=@wisdomos/web

# Standard edition
EDITION=standard pnpm turbo run build --filter=@wisdomos/web

# Premium edition
EDITION=premium pnpm turbo run build --filter=@wisdomos/web

# All editions (parallel)
for edition in free student standard advanced premium; do
  EDITION=$edition pnpm turbo run build --filter=@wisdomos/web &
done
wait
```

### Phase 9: Documentation (Day 8-9)

**Create key docs:**

1. `docs/architecture/restructuring-summary.md` - What changed and why
2. `docs/architecture/edition-system.md` - How edition manifests work
3. `docs/development/adding-features.md` - How to add features and enable per edition
4. `docs/development/where-to-make-changes.md` - Source of truth mapping

### Phase 10: Commit & Push (Day 9-10)

```bash
# Review all changes
git status
git diff

# Stage changes
git add .

# Commit with detailed message
git commit -m "refactor: consolidate monorepo structure and implement edition manifests

- Promoted active 'wisdome phase 3' codebase to root
- Renamed wisdomos-core to @wisdomos/phoenix-core to avoid naming conflict
- Moved wisdom course to apps/course-leader
- Archived legacy scattered folders (~10GB)
- Created edition manifest.json system for 10 tiers
- Built @wisdomos/config package for feature flags
- Standardized package naming across monorepo
- Reorganized documentation into docs/ subdirectories

BREAKING CHANGE: Package @wisdomos/core now refers to schema validation only.
Phoenix transformation logic moved to @wisdomos/phoenix-core.

Co-Authored-By: Claude <noreply@anthropic.com>"

# Push to feature branch first
git checkout -b refactor/monorepo-consolidation
git push -u origin refactor/monorepo-consolidation
```

---

## Wisdom Course Integration

### Current State
- Location: `apps/wisdom/wisdom course/`
- Package name: `wisdom-course`
- Size: 296MB
- Has: `index.html`, `css/`, `assets/`, `CLAUDE.md`

### Proposed Integration

**Move to:** `apps/course-leader/`

**Update to Next.js app:**

```
apps/course-leader/
├── package.json              # @wisdom/course-leader
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── courses/
│       └── [courseId]/page.tsx
├── components/
│   ├── CourseNav.tsx
│   └── LessonPlayer.tsx
├── public/
│   └── assets/             # Move existing assets here
├── styles/
│   └── globals.css         # Move existing CSS here
└── content/
    └── courses.json        # Course data
```

**Alternatively:** Keep as standalone static site if that's preferred

---

## Feature Matrix Template (For User to Fill)

| Feature | Free | Student | Standard | Advanced | Premium | Teacher | Institutional | Community Hub | Personal | Experimental |
|---------|------|---------|----------|----------|---------|---------|---------------|---------------|----------|--------------|
| **Core Features** |
| Autobiography | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Journal | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Daily Prompts | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Fulfillment Display | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Assessment Tools** |
| Relationship Assessment | ✗ | ? | ? | ? | ? | ? | ? | ? | ? | ? |
| Difficult Conversations | ✗ | ? | ? | ? | ? | ? | ? | ? | ? | ? |
| **Export & Analysis** |
| Export PDF | ✗ | ? | ? | ? | ? | ? | ? | ? | ? | ? |
| AI Analysis | ✗ | ? | ? | ? | ? | ? | ? | ? | ? | ? |
| **Collaboration** |
| Coach Tools | ✗ | ✗ | ✗ | ✗ | ? | ? | ? | ? | ✗ | ? |
| Client Dashboard | ✗ | ✗ | ✗ | ✗ | ? | ? | ? | ? | ✗ | ? |
| **Organization** |
| Multi-user Admin | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ? | ✗ | ✗ | ? |
| SSO | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ? | ✗ | ✗ | ? |
| **Community** |
| Public Sharing | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ? | ? | ? |
| Community Forums | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ? | ✗ | ? |
| **Education** |
| Class Management | ✗ | ✗ | ✗ | ✗ | ✗ | ? | ? | ✗ | ✗ | ? |
| Student Reports | ✗ | ✗ | ✗ | ✗ | ✗ | ? | ? | ✗ | ✗ | ? |
| **Limits** |
| Max Entries | 100 | ? | ? | ? | ∞ | ? | ? | ? | ? | ? |
| Max Life Areas | 5 | ? | ? | ? | ∞ | ? | ? | ? | ? | ? |
| Storage (GB) | 1 | ? | ? | ? | ∞ | ? | ? | ? | ? | ? |
| **Platforms** |
| Web | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Mobile | ✗ | ? | ? | ? | ? | ? | ? | ? | ? | ? |
| Desktop | ✗ | ? | ? | ? | ? | ? | ? | ? | ? | ? |

**Instructions:** Replace `?` with `✓` (enabled) or `✗` (disabled) for each edition.

---

## Next Steps

1. **User Reviews This Document**
   - Confirm Option A (promote) vs Option B (merge)
   - Fill in feature matrix template
   - Approve wisdom course integration plan

2. **Execute Phase 1 (Analysis & Backup)**
   - Run comparison scripts
   - Create full backup
   - Review diffs

3. **Execute Restructuring**
   - Run chosen restructure script
   - Update package names
   - Verify builds work

4. **Create Edition System**
   - Generate manifests
   - Build @wisdomos/config
   - Update apps to use feature flags

5. **Test & Document**
   - Test all edition builds
   - Create documentation
   - Commit changes

---

**Status:** Awaiting user decision on:
1. Option A (promote phase 3) vs Option B (merge)?
2. Feature matrix completion
3. Approval to proceed with Phase 1
