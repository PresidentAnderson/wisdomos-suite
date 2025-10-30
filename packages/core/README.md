# Core Package

## Purpose
Zod schemas for validation across all WisdomOS applications.

## What's Inside

### Schemas
- **audit.ts** - Audit log schemas
- **fulfillment.ts** - Fulfillment/goals schemas
- **journal.ts** - Journal entry schemas
- **lifeArea.ts** - Life area schemas
- **user.ts** - User profile schemas

## Technologies
- Zod for runtime validation
- TypeScript for type safety
- Shared across all apps

## Usage
```typescript
import { userSchema, journalEntrySchema } from '@wisdomos/core';

// Validate data
const validatedUser = userSchema.parse(userData);
const validatedEntry = journalEntrySchema.parse(entryData);
```

## When to Use
- API request validation
- Form validation
- Type guards
- Ensuring data consistency

## Importance: ⭐⭐⭐⭐⭐
Critical - Ensures data integrity across all applications.
