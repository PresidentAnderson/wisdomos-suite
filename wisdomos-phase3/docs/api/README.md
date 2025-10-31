# API Documentation

WisdomOS uses tRPC for type-safe API communication.

## Overview

The API is built with:
- **tRPC**: Type-safe RPC framework
- **Zod**: Schema validation
- **NestJS**: Server framework
- **Prisma**: Database ORM

## Base URL

**Development**: `http://localhost:8080/trpc`
**Production**: `https://api.yourdomain.com/trpc`

## Authentication

All authenticated endpoints require JWT token:

```typescript
const token = await supabase.auth.getSession();

const client = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:8080/trpc',
      headers: {
        authorization: `Bearer ${token.access_token}`,
      },
    }),
  ],
});
```

## Available Endpoints

- [Authentication](./authentication.md) - Login, signup, password reset
- [Users](./endpoints/users.md) - User management
- [Life Areas](./endpoints/life-areas.md) - Life area CRUD
- [Contributions](./endpoints/contributions.md) - Contribution tracking
- [Tenants](./endpoints/tenants.md) - Multi-tenancy management
- [Webhooks](./webhooks.md) - External integrations

## Making Requests

### Query (GET)
```typescript
const lifeAreas = await client.lifeAreas.list.query();
```

### Mutation (POST/PUT/DELETE)
```typescript
const newArea = await client.lifeAreas.create.mutate({
  name: 'Health',
  score: 7,
});
```

### With Parameters
```typescript
const area = await client.lifeAreas.getById.query({ id: '123' });
```

## Error Handling

tRPC errors include:
```typescript
try {
  await client.lifeAreas.create.mutate(data);
} catch (error) {
  if (error instanceof TRPCClientError) {
    console.error('Code:', error.data?.code);
    console.error('Message:', error.message);
  }
}
```

See [Error Codes](./errors.md) for full list.

## Rate Limiting

- **Free**: 100 requests/minute
- **Pro**: 1000 requests/minute
- **Enterprise**: Unlimited

Exceeded limits return 429 status.
