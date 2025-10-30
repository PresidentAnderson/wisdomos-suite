# Database Package

## Purpose
Single source of truth for database schemas, Prisma ORM client, and database utilities.

## What's Inside

### prisma/
- **schema.prisma** - Complete database schema definition
- **migrations/** - Database migration history
- **seed.ts** - Database seeding scripts

### src/
- **index.ts** - Prisma client export
- **utils/** - Database utility functions
- **middleware/** - Prisma middleware (RLS, logging)

## Key Features
- Prisma ORM integration
- PostgreSQL schema management
- Row-Level Security (RLS) support
- Multi-tenancy support
- Type-safe database queries

## Usage
\`\`\`typescript
import { prisma } from '@wisdomos/database';

const users = await prisma.user.findMany();
\`\`\`

## Development
\`\`\`bash
# Generate Prisma client
pnpm db:generate

# Push schema changes
pnpm db:push

# Run migrations
pnpm db:migrate

# Open Prisma Studio
pnpm db:studio

# Seed database
pnpm db:seed:demo
\`\`\`

## Importance: ⭐⭐⭐⭐⭐
Critical - This is the ONLY database package (consolidation complete).
