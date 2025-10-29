# System Design

High-level architecture of WisdomOS.

## System Overview

```
┌─────────────────────────────────────────────────┐
│              User Devices                       │
│  Web Browser | iOS App | Android App | Desktop  │
└─────────────┬───────────────────────────────────┘
              │
    ┌─────────┴─────────┐
    │   Vercel Edge     │ (CDN + Edge Functions)
    └─────────┬─────────┘
              │
┌─────────────┴─────────────────┐
│      Next.js Frontend         │
│  - SSR/SSG pages             │
│  - Client components         │
│  - API routes               │
└───────┬──────────┬───────────┘
        │          │
        │    ┌─────┴──────────┐
        │    │   tRPC API     │
        │    │   (Type-safe)  │
        │    └─────┬──────────┘
        │          │
┌───────┴──────────┴──────────┐
│     NestJS API Server       │
│  - Business logic          │
│  - Event handlers          │
│  - Webhook processing      │
└───────┬──────────┬──────────┘
        │          │
        │    ┌─────┴────────────┐
        │    │  Prisma ORM      │
        │    └─────┬────────────┘
        │          │
┌───────┴──────────┴──────────┐
│   Supabase PostgreSQL       │
│  - Main database           │
│  - RLS policies            │
│  - Realtime subscriptions  │
└────────────┬────────────────┘
             │
┌────────────┴────────────────┐
│  External Services          │
│  - HubSpot CRM             │
│  - SendGrid Email          │
│  - Sentry Errors           │
│  - Stripe Payments         │
└─────────────────────────────┘
```

## Data Flow

### User Request Flow
1. User interacts with UI (browser/app)
2. Frontend makes tRPC call
3. API validates with Zod schema
4. Service layer processes business logic
5. Prisma queries database with tenant context
6. RLS enforces data isolation
7. Response flows back through layers

### Event-Driven Flow
1. User action triggers domain event
2. Event emitted via NestJS EventEmitter
3. Event handlers process asynchronously
4. Side effects: webhooks, emails, notifications
5. Audit log persisted to database

## Scalability

### Horizontal Scaling
- **Frontend**: Serverless edge functions
- **API**: Stateless containers (Docker/K8s)
- **Database**: Connection pooling + read replicas

### Caching Strategy
- **CDN**: Static assets at edge
- **Redis**: Session and frequently-accessed data
- **ISR**: Next.js incremental regeneration
- **Query**: TanStack Query client-side cache

## Security Layers

1. **Network**: HTTPS, CORS, rate limiting
2. **Authentication**: JWT tokens, refresh rotation
3. **Authorization**: Role-based access control
4. **Database**: RLS policies per tenant
5. **Validation**: Zod schemas at every boundary

See [Database Design](./database-design.md) for schema details.
