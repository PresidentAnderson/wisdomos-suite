# WisdomOS Multi-Tenancy Implementation Guide

## Overview

WisdomOS now supports a complete multi-tenant architecture where multiple organizations can use the same application instance with complete data isolation. Each tenant gets their own subdomain, isolated data, and customizable features based on their subscription plan.

## Architecture

### Database Schema

Every tenant-scoped table includes a `tenantId` field for data isolation:
- Users belong to tenants
- All user data (journals, life areas, etc.) is isolated by tenant
- Row-Level Security (RLS) policies enforce isolation at the database level

### Key Components

1. **Tenant Model** - Stores organization information, plans, and settings
2. **Tenant Service** - Handles tenant CRUD operations and business logic
3. **Tenant Middleware** - Extracts tenant context from subdomains
4. **Prisma Client Extension** - Automatically filters queries by tenant
5. **RLS Policies** - Database-level security for data isolation

## Usage Guide

### 1. Creating a New Tenant

Navigate to `/onboarding` to create a new tenant through the UI, or programmatically:

```typescript
import { TenantService } from '@/lib/tenant/tenant-service';

const tenant = await TenantService.createTenant({
  name: 'My Company',
  slug: 'my-company',
  ownerEmail: 'owner@mycompany.com',
  ownerPassword: 'securepassword',
  ownerName: 'John Doe',
  plan: TenantPlan.PROFESSIONAL,
});
```

### 2. Accessing Tenant Context in Components

```typescript
import { useTenantContext } from '@/lib/tenant/tenant-context';

function MyComponent() {
  const { tenantName, hasFeature } = useTenantContext();
  
  return (
    <div>
      <h1>Welcome to {tenantName}</h1>
      {hasFeature('ai_reframing') && (
        <button>Use AI Reframing</button>
      )}
    </div>
  );
}
```

### 3. API Routes with Tenant Isolation

```typescript
import { withTenantApi } from '@/lib/tenant/api-tenant-context';

export const GET = withTenantApi(async (request, context) => {
  // context.tenantId is automatically available
  // All Prisma queries are automatically filtered by tenant
  
  const users = await prisma.user.findMany();
  // Only returns users from the current tenant
  
  return NextResponse.json({ users });
});
```

### 4. Manual Tenant Context (Server-Side)

```typescript
import { withTenant } from '@/lib/tenant/prisma-tenant-client';

// Run operations in a specific tenant context
await withTenant(tenantId, async () => {
  // All database operations here are scoped to the tenant
  const data = await prisma.lifeArea.findMany();
});
```

## Subdomain Routing

### Development Setup

For local development, you can use:
1. **Subdomain**: `tenant1.localhost:3000`
2. **Header**: Set `x-tenant-slug` header
3. **Query Param**: Add `?tenant=tenant1` to URL

### Production Setup

1. Configure wildcard DNS: `*.wisdomos.app`
2. Update `NEXT_PUBLIC_APP_DOMAIN` environment variable
3. Subdomains automatically route to correct tenant

## Subscription Plans

### Available Plans

1. **FREE** - 1 user, 1GB storage, basic features
2. **STARTER** - 5 users, 10GB storage, AI features
3. **PROFESSIONAL** - 20 users, 100GB storage, API access
4. **ENTERPRISE** - Unlimited users, 1TB storage, SSO, custom domain

### Feature Checking

```typescript
// In components
const { hasFeature } = useTenantContext();
if (hasFeature('api_access')) {
  // Show API documentation
}

// In API routes
const hasFeature = await TenantService.hasFeature(tenantId, 'api_access');
```

## Database Migrations

Run migrations to set up multi-tenancy:

```bash
# Generate Prisma client
pnpm db:generate

# Push schema to database
pnpm db:push

# Apply RLS policies (Supabase)
psql $DATABASE_URL < prisma/migrations/add_rls_policies.sql
```

## Testing

Run the multi-tenancy test suite:

```bash
pnpm tsx scripts/test-multi-tenancy.ts
```

This tests:
- Tenant creation
- Data isolation between tenants
- Feature access control
- User limits
- Invitation system

## Security Considerations

1. **Data Isolation**: Every query is automatically filtered by tenant ID
2. **RLS Policies**: Database-level enforcement of tenant boundaries
3. **Middleware Protection**: Tenant context validated on every request
4. **User Verification**: Users can only access their assigned tenant

## Common Patterns

### Check if User is Admin

```typescript
const user = await prisma.user.findUnique({
  where: { id: userId },
});

if (user.role === 'ADMIN' || user.role === 'OWNER') {
  // Admin operations
}
```

### Invite Users to Tenant

```typescript
// Create invitation
const invitation = await TenantService.createInvitation(
  tenantId,
  'newuser@example.com',
  UserRole.MEMBER
);

// Send invitation email with invitation.token
// User accepts invitation via:
const newUser = await TenantService.acceptInvitation(
  token,
  'password',
  'User Name'
);
```

### Update Tenant Plan

```typescript
await TenantService.updateTenantPlan(
  tenantId,
  TenantPlan.PROFESSIONAL,
  stripeSubscriptionId
);
```

## Environment Variables

Add to `.env.local`:

```env
# Domain configuration
NEXT_PUBLIC_APP_DOMAIN=wisdomos.app

# Database
DATABASE_URL=postgresql://...

# Supabase (if using)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Troubleshooting

### "Tenant not found" Error
- Check subdomain is correct
- Verify tenant exists in database
- Check middleware is running

### Data Not Isolated
- Ensure `tenantId` is in all queries
- Verify RLS policies are applied
- Check tenant context is set

### Cannot Access Features
- Verify tenant plan includes feature
- Check feature name matches exactly
- Ensure features array is populated

## Next Steps

1. **Custom Domains**: Add support for custom domains per tenant
2. **Billing Integration**: Connect Stripe for subscription management
3. **SSO**: Implement SAML/OAuth for enterprise tenants
4. **Analytics**: Add tenant-specific usage analytics
5. **White-labeling**: Allow tenants to customize branding

## Support

For questions or issues with multi-tenancy implementation, please refer to the test suite in `scripts/test-multi-tenancy.ts` for working examples.