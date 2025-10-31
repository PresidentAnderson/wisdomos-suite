# WisdomOS Architecture

Technical architecture overview for developers.

## Table of Contents

- [System Design](./system-design.md) - High-level architecture
- [Monorepo Structure](./monorepo-structure.md) - Repository organization
- [Frontend Architecture](./frontend-architecture.md) - Next.js patterns
- [Backend Architecture](./backend-architecture.md) - NestJS and tRPC
- [Database Design](./database-design.md) - Schema and relationships
- [Auth Flow](./auth-flow.md) - Authentication and authorization

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.x
- **Styling**: TailwindCSS + Framer Motion
- **UI**: Radix UI components
- **State**: Zustand + TanStack Query
- **Forms**: React Hook Form + Zod

### Backend
- **Framework**: NestJS 10.x
- **API**: tRPC for type-safe APIs
- **ORM**: Prisma 5.x
- **Events**: NestJS EventEmitter
- **Validation**: Zod schemas

### Database
- **Primary**: PostgreSQL 15+
- **Hosting**: Supabase
- **Security**: Row-Level Security (RLS)
- **Migrations**: Prisma Migrate

### Infrastructure
- **Monorepo**: Turborepo
- **Package Manager**: pnpm
- **CI/CD**: GitHub Actions
- **Deployment**: Vercel, Netlify, Docker

## Architecture Patterns

### Design Principles
- **Type Safety**: End-to-end TypeScript
- **API Contract**: tRPC for client-server types
- **Data Isolation**: Multi-tenant RLS
- **Event-Driven**: Domain events pattern
- **Modular**: Feature-based organization

### Key Patterns
- Repository pattern for data access
- Service layer for business logic
- DTO validation with Zod
- Middleware for cross-cutting concerns
- Event sourcing for audit trail

See individual architecture docs for details.
