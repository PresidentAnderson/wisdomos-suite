# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
```bash
# Start all development servers (parallel)
pnpm dev

# Build all packages and apps
pnpm build

# Run linting across all packages
pnpm lint

# Run all tests
pnpm test
```

### Database Commands
```bash
# Generate Prisma client
pnpm db:generate

# Push schema changes to database
pnpm db:push

# Run database migrations
pnpm db:migrate

# Open Prisma Studio
pnpm db:studio

# Seed database with demo data
pnpm db:seed:demo

# Initialize database setup
pnpm db:init
```

### Individual App Commands
```bash
# Web app (Next.js) - runs on :3011 in dev
pnpm web:dev

# API server (NestJS) 
pnpm api:dev

# Mobile app (Expo)
pnpm mobile:dev
pnpm mobile:ios
pnpm mobile:android
```

### Testing Commands
```bash
# API tests
pnpm --filter @wisdomos/api test
pnpm --filter @wisdomos/api test:watch
pnpm --filter @wisdomos/api test:e2e

# Web app type checking
pnpm --filter @wisdomos/web type-check
```

## Architecture Overview

### Project Structure
WisdomOS is a monorepo using **Turborepo** and **pnpm/npm workspaces**. The codebase follows a multi-tenant phoenix transformation platform pattern organized by shared components, platform implementations, and product editions.

```
wisdom/
├── shared/                 # Reusable code across all platforms
│   ├── core/              # Business logic, models, authentication
│   ├── ui-components/     # Design system
│   ├── database/          # Prisma, migrations, utils
│   ├── assets/            # Branding, i18n
│   └── config/            # Feature flags by edition
│
├── platforms/              # Platform-specific implementations
│   ├── web-saas/
│   │   ├── frontend/      # Next.js 14 main web application
│   │   ├── backend/       # NestJS API server with tRPC
│   │   └── deployment/    # Docker, K8s configs
│   ├── mobile/
│   │   ├── ios/           # iOS-specific code
│   │   ├── android/       # Android-specific code
│   │   └── shared/        # React Native/Expo shared code
│   └── desktop/           # Electron (future)
│       ├── windows/
│       ├── macos/
│       ├── unix/
│       └── shared/
│
└── editions/               # Product editions
    ├── free/              # Free tier edition
    ├── community-hub/     # Community edition
    ├── student/           # Student edition
    ├── institutional/     # Institutional edition
    ├── standard/          # Standard edition
    ├── advanced/          # Advanced edition
    └── premium/           # Premium edition
        ├── web/
        ├── mobile/
        └── desktop/
```

### Key Technologies
- **Frontend**: Next.js 14, React 18, TailwindCSS, Framer Motion
- **Backend**: NestJS, tRPC, Prisma ORM
- **Database**: PostgreSQL (Supabase)
- **Auth**: NextAuth.js with Supabase integration
- **UI**: Radix UI components, Lucide icons
- **State**: Zustand for client state, TanStack Query for server state
- **Testing**: Jest for unit tests, Supertest for API tests

### Phoenix Transformation System
WisdomOS implements a "Phoenix Operating System for Life Transformation" with these core cycles:
1. **Ashes (Reflection)** - Journaling and pattern recognition
2. **Fire (Breakthrough)** - Conversations and reframing  
3. **Rebirth (Fulfillment)** - Dashboard progress tracking
4. **Flight (Legacy)** - Archiving and contribution

### Multi-Tenancy
The system supports multiple organizations with row-level security (RLS) policies in Supabase. Each tenant has isolated data access through Prisma middleware.

### Database Architecture
- **Primary DB**: Supabase PostgreSQL with RLS policies
- **ORM**: Prisma with client generation in `packages/db`
- **Migrations**: Located in `supabase/migrations/`
- **Schema**: Single source of truth at `packages/db/prisma/schema.prisma`

### API Architecture
- **tRPC**: Type-safe API layer in NestJS
- **Authentication**: JWT-based with Supabase integration
- **Validation**: Zod schemas for request validation
- **Event System**: NestJS EventEmitter for domain events

### UI Patterns
- **Design System**: Phoenix-themed components following brand guidelines
- **Glass Morphism**: Backdrop blur effects for cards and modals
- **Phoenix Colors**: Fire gradient system (gold, red, orange, indigo)
- **Animations**: Framer Motion with phoenix rise, ember glow, flame flicker effects
- **State Indicators**: Green (thriving), Yellow (attention), Red (breakdown)

## Development Workflow

### Getting Started
1. Install pnpm globally: `npm install -g pnpm`
2. Install dependencies: `pnpm install`
3. Set up environment variables (copy .env.example to .env.local)
4. Initialize database: `pnpm db:init`
5. Start development: `pnpm dev`

### Making Changes
1. Database changes: Update `packages/db/prisma/schema.prisma` then run `pnpm db:push`
2. API changes: Add tRPC routers in `apps/api/src/routers/`
3. UI changes: Follow phoenix brand guidelines in `BRAND-GUIDELINES.md`
4. Always run `pnpm lint` before commits

### Package Dependencies
- `@wisdom/shared-database` - Database schemas and client (Prisma)
- `@wisdom/shared-ui` - Shared React/React Native components
- `@wisdom/shared-core` - Business logic utilities
- `@wisdom/shared-types` - TypeScript definitions
- `@wisdom/shared-api-client` - Frontend API utilities
- `@wisdom/shared-config` - Feature flags by edition
- `@wisdom/shared-i18n` - Internationalization
- `@wisdom/platform-web` - Next.js web frontend
- `@wisdom/platform-api` - NestJS API backend
- `@wisdom/platform-mobile` - React Native mobile app

### Testing Strategy
- **Unit Tests**: Jest for business logic in packages/
- **API Tests**: Supertest for NestJS endpoints  
- **E2E Tests**: Jest configuration for integration tests
- **Type Checking**: TypeScript strict mode across all packages

## Important Notes
- Web app runs on port 3011 in development, 3000 in production
- API server auto-discovers available ports
- Database changes require `pnpm db:generate` to update Prisma client
- Phoenix theme colors and animations must follow brand guidelines
- All user data is tenant-isolated through RLS policies
- Use tRPC for all API communication, avoid direct database access in frontend