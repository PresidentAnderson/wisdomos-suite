# Monorepo Structure

WisdomOS uses Turborepo to manage multiple applications and shared packages.

## Directory Structure

```
wisdomos/
├── apps/
│   ├── web/              # Next.js web application
│   ├── api/              # NestJS API server
│   └── mobile/           # React Native mobile app
├── packages/
│   ├── database/         # Prisma schema, client, migrations
│   ├── ui/               # Shared React components
│   ├── core/             # Business logic utilities
│   ├── types/            # TypeScript type definitions
│   ├── api-client/       # Frontend API utilities
│   ├── config/           # Feature flags by edition
│   └── i18n/             # Internationalization
├── config/               # Infrastructure configs
├── deployment-configs/   # Platform-specific deployment
├── docs/                 # Documentation
├── scripts/              # Build and utility scripts
├── supabase/             # Database migrations
├── turbo.json            # Turborepo configuration
├── pnpm-workspace.yaml   # pnpm workspace config
└── package.json          # Root package.json
```

## Workspace Configuration

### pnpm-workspace.yaml
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### turbo.json
```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "outputs": []
    }
  }
}
```

## Package Dependencies

Apps depend on packages:

```json
{
  "name": "@wisdomos/web",
  "dependencies": {
    "@wisdomos/database": "workspace:*",
    "@wisdomos/ui": "workspace:*",
    "@wisdomos/core": "workspace:*",
    "@wisdomos/types": "workspace:*"
  }
}
```

## Build Order

Turborepo automatically determines build order:

1. `packages/types` (no dependencies)
2. `packages/core` (depends on types)
3. `packages/database` (generates Prisma client)
4. `packages/ui` (depends on types)
5. `apps/api` (depends on database, core)
6. `apps/web` (depends on all packages)

## Development Workflow

```bash
# Install all dependencies
pnpm install

# Run all apps in dev mode
pnpm dev

# Build all apps and packages
pnpm build

# Run specific app
pnpm --filter @wisdomos/web dev

# Add dependency to specific package
pnpm --filter @wisdomos/web add lodash
```

See [Development Guide](../guides/development/README.md) for more.
