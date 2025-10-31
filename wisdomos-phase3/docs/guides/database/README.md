# Database Guide

Database management for WisdomOS.

## Quick Reference

```bash
# Generate Prisma client
pnpm db:generate

# Push schema changes (development)
pnpm db:push

# Create migration (production)
pnpm db:migrate dev --name migration-name

# Apply migrations
pnpm db:migrate deploy

# Open Prisma Studio
pnpm db:studio

# Seed database
pnpm db:seed:demo
```

## Schema Location

Main schema: `packages/database/prisma/schema.prisma`

## Migrations

Located in: `supabase/migrations/`

### Creating Migrations

```bash
# 1. Update schema in packages/database/prisma/schema.prisma
# 2. Create migration
pnpm db:migrate dev --name add-user-fields

# 3. Test migration
pnpm db:migrate deploy
```

## Seeding

See [Seeding Guide](./seeding.md) for details.

## Connection String

Format:
```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
```

With Supabase:
```
postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

## Row-Level Security

RLS policies enforce tenant isolation. See [Multi-Tenancy Guide](../../features/multi-tenancy.md).
