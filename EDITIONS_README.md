# WisdomOS - Unified Editions Architecture

**A single codebase. Three editions. All platforms.**

<div align="center">

[![CI Status](https://github.com/PresidentAnderson/wisdomos-phase3/workflows/CI/badge.svg)](https://github.com/PresidentAnderson/wisdomos-phase3/actions)
[![Turborepo](https://img.shields.io/badge/built%20with-Turborepo-blueviolet)](https://turbo.build)
[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-yellow)](https://pnpm.io)

</div>

---

## 🎯 Overview

WisdomOS now uses a **unified monorepo architecture** where editions are treated as first-class build targets, not separate codebases. This means:

- ✅ **One commit** → all editions build automatically
- ✅ **No code duplication** → shared packages across editions
- ✅ **Clear change tracking** → see what changed for each edition
- ✅ **Parallel builds** → Turborepo caching and intelligent task running

---

## 📦 Editions

### 🌟 Personal Edition
**Target**: Individuals seeking personal growth and fulfillment

**Features**:
- ✅ Autobiography & life story
- ✅ Fulfillment Display (30 life areas)
- ✅ Journal & daily reflections
- ✅ AI Wisdom Coach
- ✅ Relationship assessments
- ❌ Client management
- ❌ Organization features

**Pricing**: Free (with optional premium features)

---

### 💼 Coach Edition
**Target**: Professional coaches and therapists

**Features**:
- ✅ All Personal Edition features
- ✅ Client dashboard & management
- ✅ Session notes & progress tracking
- ✅ Client exports (PDF/JSON)
- ✅ Goal management & tracking
- ✅ Webhooks & API integrations
- ❌ Multi-user organization features
- ❌ Enterprise SSO

**Pricing**: $49/month

---

### 🏢 Organization Edition
**Target**: Enterprises and large organizations

**Features**:
- ✅ All Coach Edition features
- ✅ Multi-user workspaces
- ✅ SSO (SAML, LDAP, SCIM)
- ✅ Organization admin panel
- ✅ Team analytics & reporting
- ✅ Compliance & audit logs
- ✅ RBAC (Role-Based Access Control)
- ✅ Custom branding & white-label

**Pricing**: Custom (contact sales)

---

## 🏗️ Architecture

### Directory Structure

```
wisdomos/
├─ editions/                    # Edition manifests (config as data)
│  ├─ personal/manifest.json   # Feature flags, branding, limits
│  ├─ coach/manifest.json
│  └─ org/manifest.json
│
├─ packages/                    # Shared code across all apps
│  ├─ config/                  # Edition loader + feature flags
│  ├─ core/                    # Domain logic (future)
│  ├─ db/                      # Prisma + Supabase (future)
│  ├─ ui/                      # Shared React components (future)
│  └─ api/                     # API routes & handlers (future)
│
├─ apps/
│  ├─ web/                     # Next.js web app
│  ├─ mobile/                  # Expo/React Native (future)
│  └─ desktop/                 # Electron (future)
│
├─ .github/
│  └─ workflows/ci.yml         # CI matrix builds all editions
│
├─ turbo.json                  # Turborepo configuration
├─ pnpm-workspace.yaml         # pnpm workspaces
└─ package.json                # Root scripts
```

### Edition Manifest Example

```json
{
  "id": "personal",
  "name": "WisdomOS — Personal Edition",
  "branding": {
    "primaryColor": "#FF6B35",
    "appName": "WisdomOS Personal"
  },
  "features": {
    "core": {
      "autobiography": true,
      "journaling": true
    },
    "coaching": {
      "clientDashboard": false
    },
    "organization": {
      "multiUser": false,
      "sso": false
    }
  }
}
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- pnpm 8+
- Turborepo (installed automatically)

### Installation

```bash
# Clone repo
git clone https://github.com/PresidentAnderson/wisdomos-phase3.git
cd wisdomos-phase3

# Install dependencies
pnpm install

# Build config package
cd packages/config
pnpm build
cd ../..
```

### Development

```bash
# Start dev server (personal edition by default)
EDITION=personal pnpm dev

# Start coach edition
EDITION=coach pnpm dev

# Start org edition
EDITION=org pnpm dev
```

### Building

```bash
# Build all editions in parallel
pnpm build

# Build specific edition
pnpm build:personal
pnpm build:coach
pnpm build:org

# Build with Turborepo (cached)
pnpm turbo run build --filter=apps/web
```

---

## 💻 Usage

### Using Feature Flags

```typescript
// Import feature flags
import { hasFeature, branding, edition } from '@wisdomos/config'

// Check if feature is enabled
if (hasFeature('coaching', 'clientDashboard')) {
  return <ClientDashboard />
}

// Use edition branding
<h1 style={{ color: branding.primaryColor }}>
  {branding.appName}
</h1>

// Check edition type
if (edition.id === 'org') {
  return <OrganizationSettings />
}
```

### Conditional Components

```typescript
// components/Navigation.tsx
import { hasFeature } from '@wisdomos/config'

export function Navigation() {
  return (
    <nav>
      <Link href="/dashboard">Dashboard</Link>
      <Link href="/journal">Journal</Link>
      
      {/* Coach edition only */}
      {hasFeature('coaching', 'clientDashboard') && (
        <Link href="/clients">Clients</Link>
      )}
      
      {/* Org edition only */}
      {hasFeature('organization', 'teamAnalytics') && (
        <Link href="/analytics">Team Analytics</Link>
      )}
    </nav>
  )
}
```

### API Route Guards

```typescript
// app/api/clients/route.ts
import { NextResponse } from 'next/server'
import { hasFeature } from '@wisdomos/config'

export async function GET(request: Request) {
  // Block if coaching features disabled
  if (!hasFeature('coaching', 'clientDashboard')) {
    return NextResponse.json(
      { error: 'Feature not available' },
      { status: 403 }
    )
  }

  // Proceed with coach-specific logic
  return NextResponse.json({ clients: [] })
}
```

---

## 🔧 Scripts

### Root Scripts

```bash
# Development
pnpm dev                        # Start all apps in dev mode
EDITION=coach pnpm dev          # Start with specific edition

# Building
pnpm build                      # Build all packages and apps
pnpm build:personal             # Build personal edition only
pnpm build:coach                # Build coach edition only
pnpm build:org                  # Build org edition only

# Testing
pnpm test                       # Run all tests
pnpm lint                       # Lint all packages
pnpm type-check                 # TypeScript type checking

# Cleaning
pnpm clean                      # Clean all build artifacts
```

### Turborepo Commands

```bash
# Run task for specific app
pnpm turbo run build --filter=apps/web

# Run task for all packages
pnpm turbo run build --filter=packages/*

# Run with specific edition
EDITION=coach pnpm turbo run dev --filter=apps/web

# Force rebuild (skip cache)
pnpm turbo run build --force
```

---

## 🧪 Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests for specific edition
EDITION=personal pnpm test
EDITION=coach pnpm test

# Run tests with coverage
pnpm test -- --coverage
```

### Testing Feature Flags

```typescript
// test/feature-flags.test.ts
import { loadEditionManifest, clearManifestCache } from '@wisdomos/config'

describe('Feature Flags', () => {
  beforeEach(() => {
    clearManifestCache()
  })

  it('personal edition disables coaching features', () => {
    process.env.EDITION = 'personal'
    const manifest = loadEditionManifest()
    expect(manifest.features.coaching.clientDashboard).toBe(false)
  })
})
```

---

## 🚢 Deployment

### CI/CD Pipeline

Our GitHub Actions workflow automatically:
1. Builds all 3 editions in parallel
2. Runs tests for each edition
3. Lints and type-checks code
4. Deploys to production (on merge to `main`)

```yaml
# .github/workflows/ci.yml
strategy:
  matrix:
    app: [web]
    edition: [personal, coach, org]
```

### Manual Deployment

```bash
# Deploy personal edition to Netlify
EDITION=personal pnpm build
netlify deploy --prod --dir=apps/web/.next

# Deploy coach edition
EDITION=coach pnpm build
netlify deploy --prod --dir=apps/web/.next
```

---

## 📚 Documentation

- **[Migration Guide](./docs/EDITIONS_MIGRATION_GUIDE.md)** - Step-by-step migration from old structure
- **[Phoenix Wisdom Coach](./docs/PHOENIX_WISDOM_COACH.md)** - Voice AI coaching system
- **[Enterprise Onboarding](./docs/ORGANIZATION_AUTH_IMPLEMENTATION.md)** - Multi-tenant setup
- **[Fulfillment Display](./docs/FULFILLMENT_DISPLAY_V5.md)** - Life areas and tracking

---

## 🤝 Contributing

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat(web,coach): add client export feature
fix(config): resolve manifest loading bug
docs(editions): update migration guide
chore(deps): upgrade Next.js to 14.2.32
```

### PR Template

Include these in your PR description:

- **Editions Affected**: [personal] [coach] [org]
- **Platforms**: [web] [mobile] [desktop]
- **Breaking Changes**: Yes/No
- **Migration Required**: Yes/No

---

## 🔮 Roadmap

### ✅ Phase 1: Foundation (Complete)
- [x] Edition manifests
- [x] Config package with feature flags
- [x] Turborepo setup
- [x] CI matrix builds

### 🚧 Phase 2: Package Extraction (In Progress)
- [ ] Extract `@wisdomos/core` (domain logic)
- [ ] Extract `@wisdomos/db` (Prisma + Supabase)
- [ ] Extract `@wisdomos/ui` (shared components)
- [ ] Extract `@wisdomos/api` (API routes)

### 🔜 Phase 3: Multi-Platform (Planned)
- [ ] Expo mobile app
- [ ] Electron desktop app
- [ ] Shared packages across platforms

### 🔮 Phase 4: Advanced Features (Future)
- [ ] Runtime feature flags (kill switches)
- [ ] A/B testing per edition
- [ ] White-label customization (Org edition)
- [ ] Plugin system

---

## 📊 Stats

- **Editions**: 3 (Personal, Coach, Org)
- **Platforms**: 1 (Web) + 2 planned (Mobile, Desktop)
- **Packages**: 1 (Config) + 4 planned
- **Build Time**: ~2-3 minutes (all editions, parallel)
- **CI Time**: ~5-8 minutes (full pipeline)

---

## 📄 License

Copyright © 2025 AXAI Innovations - Phoenix Rising WisdomOS

---

## 🙋 Support

- **Documentation**: [docs/](./docs/)
- **Issues**: [GitHub Issues](https://github.com/PresidentAnderson/wisdomos-phase3/issues)
- **Discussions**: [GitHub Discussions](https://github.com/PresidentAnderson/wisdomos-phase3/discussions)

---

**Built with**: Next.js • Turborepo • pnpm • TypeScript • Supabase • OpenAI

**Status**: ✅ Production-Ready • 🚧 Actively Developed

---

<div align="center">
  <strong>One codebase. Three editions. All platforms.</strong>
</div>
