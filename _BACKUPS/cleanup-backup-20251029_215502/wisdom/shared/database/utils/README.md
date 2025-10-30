# WisdomOS Database Package

This package contains the Prisma ORM setup and database models for WisdomOS, including the contribution-fulfillment mirroring feature.

## Features

- **Robust Connection Handling**: Graceful fallback to in-memory storage when database is unavailable
- **Contribution Mirroring**: Automatic mirroring of contributions to fulfillment entries in relevant life areas
- **Canonical Life Areas**: 13 predefined life areas with consistent slugs and metadata
- **Database Triggers**: PostgreSQL triggers for automatic mirroring
- **Type Safety**: Full TypeScript support with generated Prisma types

## Quick Start

### 1. Environment Setup

```bash
# Set your database URL in .env
DATABASE_URL=postgresql://username:password@localhost:5432/wisdomos
```

### 2. Initialize Database

```bash
# Run the initialization script
npm run db:init

# Or manually:
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run migrations
npm run db:seed      # Seed canonical life areas
```

### 3. Development

```bash
npm run db:studio    # Open Prisma Studio
npm run dev          # Watch mode for TypeScript
```

## Database Schema

### Core Models

- **User**: User authentication and profile
- **LifeAreaCanonical**: 13 canonical life areas (shared across all users)
- **Contribution**: User contributions (Doing/Being/Having)
- **FulfillmentEntry**: Mirrored fulfillment entries per life area
- **AuditLog**: Change tracking
- **MirrorRule**: Customizable mirroring rules

### Automatic Mirroring

When a contribution is created, it's automatically mirrored to:
- **Work & Purpose** (all contributions)
- **Creativity & Expression** (all contributions)
- **Community & Contribution** (if category="Doing" or tagged with "community")

## API Integration

### PrismaService

The service provides robust database operations with automatic fallbacks:

```typescript
import { PrismaService } from '@wisdomos/database';

// Safe query with fallback
const result = await prisma.safeQuery(
  async () => prisma.contribution.findMany({ where: { userId } }),
  () => inMemoryFallback() // Optional fallback
);
```

### Service Integration

Both `ContributionService` and `FulfillmentService` are integrated with:
- Database-first operations using Prisma
- Automatic fallback to in-memory storage
- Consistent API regardless of database availability

## Available Scripts

```bash
npm run build         # Build TypeScript
npm run dev           # Watch mode
npm run db:generate   # Generate Prisma client
npm run db:migrate    # Run development migrations
npm run db:deploy     # Deploy migrations (production)
npm run db:studio     # Open Prisma Studio
npm run db:seed       # Seed database
npm run db:reset      # Reset database
npm run type-check    # Type checking only
```

## Database Commands

### Migrations

```bash
# Create new migration
npx prisma migrate dev --name "description"

# Deploy to production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

### Seeding

```bash
# Seed canonical life areas
npm run db:seed

# Seed with demo data
DATABASE_SEED_DEMO=true npm run db:seed
```

## Production Deployment

1. Set `DATABASE_URL` environment variable
2. Run `npm run db:deploy` to apply migrations
3. Run `npm run db:seed` to initialize canonical life areas
4. The application will automatically fall back to in-memory storage if database becomes unavailable

## Troubleshooting

### Database Connection Issues

The system is designed to handle database unavailability gracefully:

1. **Development**: Check that PostgreSQL is running and `DATABASE_URL` is correct
2. **Production**: The API will continue functioning with in-memory storage
3. **Recovery**: When database comes back online, restart the application

### Migration Issues

```bash
# Check migration status
npx prisma migrate status

# Resolve failed migrations
npx prisma migrate resolve --applied "migration_name"

# Force reset (development only)
npx prisma migrate reset --force
```

### Common Errors

- **"Database not found"**: Create the database first or run migrations
- **"Table doesn't exist"**: Run `npm run db:migrate`
- **"Client not generated"**: Run `npm run db:generate`

## Architecture

### Mirroring Flow

1. User creates contribution via API
2. Database trigger automatically creates fulfillment entries
3. Entries appear in relevant life areas
4. Updates to contributions sync to fulfillment entries
5. Deletion removes all mirrored entries

### Fallback Strategy

1. **Database Available**: Full Prisma functionality with triggers
2. **Database Unavailable**: In-memory storage with manual mirroring logic
3. **Transition**: Seamless switching between modes

## Contributing

1. Make schema changes in `prisma/schema.prisma`
2. Create migrations with `npx prisma migrate dev`
3. Update seed script if needed
4. Update services to handle new fields
5. Test both database and in-memory modes

## Support

For issues related to:
- Database connections: Check PostgreSQL service and credentials
- Migrations: Use Prisma CLI tools
- API integration: Review service implementations
- Performance: Check database indexes and query optimization