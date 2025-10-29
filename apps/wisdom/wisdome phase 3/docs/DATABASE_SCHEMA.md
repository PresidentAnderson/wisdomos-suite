# WisdomOS Database Schema Documentation (v1.0)

**Complete Database Architecture for the Phoenix Operating System**

---

## Table of Contents

1. [Overview](#overview)
2. [Multi-Tenancy Architecture](#multi-tenancy-architecture)
3. [Core Tables](#core-tables)
4. [Relationships & ERD](#relationships--erd)
5. [Enumerations](#enumerations)
6. [Indexes & Performance](#indexes--performance)
7. [Row-Level Security (RLS)](#row-level-security-rls)
8. [Data Migration Strategy](#data-migration-strategy)
9. [Backup & Recovery](#backup--recovery)

---

## Overview

### Database System
- **Engine**: PostgreSQL 15+
- **Hosting**: Supabase
- **ORM**: Prisma 6.14.0
- **Connection Pooling**: PgBouncer (6543)
- **Direct Connection**: PostgreSQL (5432)

### Design Philosophy

WisdomOS follows these database principles:

1. **Multi-Tenant by Default**: Every table includes `tenantId` for complete data isolation
2. **Soft Deletes**: Important records use `deletedAt` timestamp instead of hard deletes
3. **Audit Trail**: All user actions tracked in `tenant_audit_logs`
4. **Phoenix-Aligned**: Schema reflects the transformation journey (Ashes → Fire → Rebirth → Flight)
5. **Performance-First**: Strategic indexes on query patterns

---

## Multi-Tenancy Architecture

### Tenant Isolation Strategy

Every user belongs to a **Tenant** (organization/workspace). This enables:
- B2B SaaS deployment (companies as tenants)
- Personal workspaces (individuals as single-user tenants)
- Family/team collaboration (shared tenant)

### Data Isolation Guarantees

```sql
-- Row-Level Security Policy (Supabase)
CREATE POLICY "Users can only access their tenant's data"
ON public.journals
FOR ALL
USING (tenant_id = auth.uid()::text OR
       tenant_id IN (
         SELECT tenant_id FROM public.users
         WHERE id = auth.uid()
       ));
```

### Tenant Model

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | String | Display name ("Acme Corp Workspace") |
| `slug` | String | URL-safe identifier (unique) |
| `domain` | String? | Custom domain (optional) |
| `status` | TenantStatus | ACTIVE, SUSPENDED, CANCELLED, TRIAL |
| `plan` | TenantPlan | FREE, STARTER, PROFESSIONAL, ENTERPRISE |
| `maxUsers` | Int | User limit (default: 5) |
| `maxStorage` | Int | Storage limit in bytes (default: 1GB) |
| `currentStorage` | Int | Current usage |
| `stripeCustomerId` | String? | Billing integration |
| `trialEndsAt` | DateTime? | Trial period end |
| `createdAt` | DateTime | Creation timestamp |
| `updatedAt` | DateTime | Last modification |
| `deletedAt` | DateTime? | Soft delete timestamp |

**Indexes**:
- `slug` (unique)
- `status`

---

## Core Tables

### 1. Users

User accounts with role-based access control.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `tenantId` | UUID | Tenant association (required) |
| `email` | String | Email address |
| `name` | String? | Display name |
| `passwordHash` | String? | Bcrypt hashed password |
| `role` | UserRole | OWNER, ADMIN, MEMBER, VIEWER |
| `isOwner` | Boolean | Tenant owner flag |
| `lastLoginAt` | DateTime? | Last authentication |
| `createdAt` | DateTime | Account creation |
| `updatedAt` | DateTime | Last update |

**Unique Constraint**: `(tenantId, email)` - Email unique per tenant

**Indexes**:
- `tenantId`
- `email`

**Relations**:
- Belongs to: `Tenant`
- Has many: `LifeArea`, `Journal`, `Relationship`, `Reset`, `Vault`, `Badge`, `Audit`

---

### 2. Life Areas

Fulfillment dimensions (Career, Relationships, Health, etc.)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `tenantId` | UUID | Tenant isolation |
| `userId` | UUID | Owner |
| `name` | String | Area name ("Career & Purpose") |
| `phoenixName` | String? | Phoenix metaphor name ("Phoenix of Mastery") |
| `status` | LifeStatus | GREEN (thriving), YELLOW (attention), RED (breakdown) |
| `score` | Int | 0-100 fulfillment score |
| `sortOrder` | Int | Display order |
| `createdAt` | DateTime | Creation timestamp |
| `updatedAt` | DateTime | Last update |

**Unique Constraint**: `(userId, name)` - Area name unique per user

**Indexes**:
- `tenantId`
- `userId`

**Relations**:
- Belongs to: `User`
- Has many: `Journal`, `Reset`, `Relationship`, `Event`, `Audit`

---

### 3. Journals

Reflection and journaling entries.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `tenantId` | UUID | Tenant isolation |
| `userId` | UUID | Author |
| `lifeAreaId` | UUID | Associated life area |
| `content` | String | Journal text (up to 10,000 chars) |
| `upsetDetected` | Boolean | AI-detected upset/breakdown |
| `aiReframe` | String? | AI-generated reframe suggestion |
| `tags` | String | JSON array of tags |
| `createdAt` | DateTime | Entry timestamp |
| `updatedAt` | DateTime | Last edit |

**Indexes**:
- `tenantId`
- `(userId, createdAt)` - Most common query
- `lifeAreaId`

**Relations**:
- Belongs to: `User`, `LifeArea`

---

### 4. Events

Significant life events tracked for analytics.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `tenantId` | UUID | Tenant isolation |
| `userId` | UUID | Event owner |
| `lifeAreaId` | UUID | Related life area |
| `type` | EventType | WIN, COMMITMENT_KEPT, UPSET, etc. |
| `impact` | Int | -2 to +2 (negative to positive) |
| `title` | String | Event description |
| `notes` | String? | Additional context |
| `occurredAt` | DateTime | When event happened |
| `createdAt` | DateTime | Record creation |

**Event Types**:
- `WIN` - Achievement or success
- `COMMITMENT_KEPT` - Promise fulfilled
- `COMMITMENT_BROKEN` - Promise broken
- `UPSET` - Emotional breakdown
- `INSIGHT` - Breakthrough realization
- `BOUNDARY_RESET` - Boundary established/reset
- `TASK_COMPLETED` - Task finished
- `TASK_MISSED` - Task not completed

**Indexes**:
- `tenantId`
- `(userId, occurredAt)`
- `(lifeAreaId, occurredAt)`
- `type`

---

### 5. Relationships

Social connection tracking.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `tenantId` | UUID | Tenant isolation |
| `userId` | UUID | Owner |
| `lifeAreaId` | UUID | Related life area |
| `name` | String | Person's name |
| `frequency` | Int | Interaction frequency (1-10 scale) |
| `notes` | String? | Relationship notes |
| `createdAt` | DateTime | Record creation |
| `updatedAt` | DateTime | Last update |

**Indexes**:
- `tenantId`
- `userId`
- `lifeAreaId`

---

### 6. Resets

Phoenix transformation rituals (5-step reset process).

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `tenantId` | UUID | Tenant isolation |
| `userId` | UUID | User performing reset |
| `lifeAreaId` | UUID | Area being reset |
| `step1_pause` | String? | Step 1: Pause and breathe |
| `step2_identify` | String? | Step 2: Identify the upset |
| `step3_acknowledge` | String? | Step 3: Acknowledge the pattern |
| `step4_recommit` | String? | Step 4: Recommit to your vision |
| `step5_recalibrate` | String? | Step 5: Recalibrate actions |
| `completed` | Boolean | All steps completed |
| `createdAt` | DateTime | Reset initiated |
| `completedAt` | DateTime? | Reset completed |

**Indexes**:
- `tenantId`
- `(userId, createdAt)`
- `lifeAreaId`

---

### 7. Badges

Gamification achievements.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `tenantId` | UUID | Tenant isolation |
| `userId` | UUID | Badge owner |
| `type` | BadgeType | Achievement type |
| `name` | String | Badge display name |
| `description` | String | Achievement description |
| `icon` | String | Emoji representation |
| `color` | String | Hex color code |
| `rarity` | Rarity | COMMON, RARE, EPIC, LEGENDARY |
| `progress` | Int | Current progress |
| `maxProgress` | Int | Progress required to unlock |
| `unlocked` | Boolean | Achievement status |
| `unlockedAt` | DateTime? | When unlocked |
| `createdAt` | DateTime | Record creation |

**Badge Types**:
- `ASHES_MASTER` - Completed multiple reflection cycles
- `FLAME_WALKER` - Navigated challenging transformations
- `RISING_STAR` - Consistent growth trajectory
- `FULL_FLIGHT` - Achieved sustained fulfillment
- `BOUNDARY_GUARDIAN` - Maintained healthy boundaries
- `TRANSFORMATION_CATALYST` - Helped others transform
- `PHOENIX_BORN` - Completed first full phoenix cycle
- `ETERNAL_FLAME` - Maintained 365-day streak

**Indexes**:
- `tenantId`
- `(userId, unlocked)`

**Unique Constraint**: `(userId, type)`

---

### 8. Vault

Secure document storage.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `tenantId` | UUID | Tenant isolation |
| `userId` | UUID | Owner |
| `title` | String | Document title |
| `content` | String | Encrypted content or file URL |
| `category` | String? | Document category |
| `accessLevel` | AccessLevel | PRIVATE, SHARED, PUBLIC |
| `tags` | String | JSON array of tags |
| `createdAt` | DateTime | Upload timestamp |
| `updatedAt` | DateTime | Last modification |

**Indexes**:
- `tenantId`
- `(userId, accessLevel)`
- `(userId, createdAt)`

---

### 9. Audits

Monthly life area assessments.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `tenantId` | UUID | Tenant isolation |
| `userId` | UUID | User conducting audit |
| `lifeAreaId` | UUID | Area being audited |
| `month` | DateTime | First day of month |
| `drift` | Float | -1 to 1 drift metric |
| `action` | String? | Corrective action plan |
| `colorSymbol` | String | Hex color for calendar display |
| `notes` | String? | Audit notes |
| `createdAt` | DateTime | Audit creation |
| `updatedAt` | DateTime | Last update |

**Unique Constraint**: `(userId, lifeAreaId, month)` - One audit per area per month

**Indexes**:
- `tenantId`
- `(userId, month)`
- `(lifeAreaId, month)`

---

### 10. Tenant Invitations

Team member invitations.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `tenantId` | UUID | Target tenant |
| `email` | String | Invitee email |
| `role` | UserRole | Assigned role |
| `token` | UUID | Unique invitation token |
| `expiresAt` | DateTime | Expiration timestamp |
| `acceptedAt` | DateTime? | Acceptance timestamp |
| `createdAt` | DateTime | Invitation sent |

**Indexes**:
- `token` (unique)
- `(tenantId, email)`

---

### 11. Tenant Audit Logs

Immutable audit trail for compliance.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `tenantId` | UUID | Tenant context |
| `userId` | UUID? | Actor (null for system actions) |
| `action` | String | Action performed |
| `resource` | String? | Resource type (e.g., "journal") |
| `resourceId` | UUID? | Specific resource ID |
| `metadata` | String? | JSON additional data |
| `ipAddress` | String? | Request IP |
| `userAgent` | String? | Browser/client |
| `createdAt` | DateTime | Action timestamp |

**Indexes**:
- `(tenantId, createdAt)` - Chronological queries
- `userId`

---

## Relationships & ERD

### Entity Relationship Diagram

```
┌─────────────┐
│   Tenant    │
└──────┬──────┘
       │
       │ 1:N
       │
┌──────▼──────────────────────────────────────────────┐
│                     User                             │
└──┬────┬────┬────┬────┬────┬────┬────┬──────────────┘
   │    │    │    │    │    │    │    │
   │1:N │1:N │1:N │1:N │1:N │1:N │1:N │1:N
   │    │    │    │    │    │    │    │
   ▼    ▼    ▼    ▼    ▼    ▼    ▼    ▼
 Life  Jour Rela Reset Vault Badge Audit Tenant
 Area  nal  tion                         Audit
       │    ship                         Log
       │
    1:N│
       │
    ┌──▼────────┐
    │  Event    │
    └───────────┘
```

### Key Relationships

1. **Tenant → Users** (1:N)
   - One tenant has many users
   - Users cannot exist without a tenant

2. **User → Life Areas** (1:N)
   - Each user defines their own life areas
   - Typical: 5-8 areas per user

3. **Life Area → Journals** (1:N)
   - All journal entries linked to a life area
   - Enables area-specific analytics

4. **Life Area → Events** (1:N)
   - Events tracked per life area
   - Aggregated for fulfillment scoring

5. **User → Relationships** (1:N)
   - Social connections tracked
   - Relationship quality impacts fulfillment

6. **User → Resets** (1:N)
   - Phoenix transformation rituals
   - Track breakdown → breakthrough cycles

---

## Enumerations

### TenantStatus

```typescript
enum TenantStatus {
  ACTIVE      // Full access
  SUSPENDED   // Temporary pause (billing issue)
  CANCELLED   // Account closed
  TRIAL       // Trial period active
}
```

### TenantPlan

```typescript
enum TenantPlan {
  FREE          // Limited features
  STARTER       // Basic features
  PROFESSIONAL  // Advanced features
  ENTERPRISE    // Custom features + support
}
```

### UserRole

```typescript
enum UserRole {
  OWNER       // Full control, billing access
  ADMIN       // User management, settings
  MEMBER      // Standard access
  VIEWER      // Read-only access
}
```

### LifeStatus

```typescript
enum LifeStatus {
  GREEN   // Thriving - aligned and fulfilling
  YELLOW  // Attention needed - minor misalignment
  RED     // Breakdown - urgent transformation required
}
```

### EventType

```typescript
enum EventType {
  WIN                  // Achievement
  COMMITMENT_KEPT      // Promise fulfilled
  COMMITMENT_BROKEN    // Promise broken
  UPSET                // Emotional breakdown
  INSIGHT              // Breakthrough realization
  BOUNDARY_RESET       // Boundary established
  TASK_COMPLETED       // Task finished
  TASK_MISSED          // Task not completed
}
```

### BadgeType

```typescript
enum BadgeType {
  ASHES_MASTER             // Reflection mastery
  FLAME_WALKER             // Transformation navigator
  RISING_STAR              // Growth trajectory
  FULL_FLIGHT              // Sustained fulfillment
  BOUNDARY_GUARDIAN        // Healthy boundaries
  TRANSFORMATION_CATALYST  // Helps others
  PHOENIX_BORN             // First full cycle
  ETERNAL_FLAME            // 365-day streak
}
```

### Rarity

```typescript
enum Rarity {
  COMMON      // Easy to achieve
  RARE        // Requires consistent effort
  EPIC        // Exceptional achievement
  LEGENDARY   // Rare mastery
}
```

### AccessLevel

```typescript
enum AccessLevel {
  PRIVATE  // Only user can access
  SHARED   // Shared with specific users
  PUBLIC   // Visible to all tenant members
}
```

---

## Indexes & Performance

### Query Optimization Strategy

| Table | Index | Purpose |
|-------|-------|---------|
| `tenants` | `slug` | Unique lookup for subdomain routing |
| `tenants` | `status` | Filter active/suspended accounts |
| `users` | `tenantId` | Tenant isolation queries |
| `users` | `email` | Login lookups |
| `users` | `(tenantId, email)` | Unique constraint enforcement |
| `life_areas` | `tenantId` | Tenant isolation |
| `life_areas` | `userId` | User's life areas |
| `life_areas` | `(userId, name)` | Unique constraint |
| `journals` | `tenantId` | Tenant isolation |
| `journals` | `(userId, createdAt)` | Chronological queries |
| `journals` | `lifeAreaId` | Life area analytics |
| `events` | `(userId, occurredAt)` | Timeline queries |
| `events` | `type` | Event type filtering |
| `relationships` | `userId` | User's relationships |
| `resets` | `(userId, createdAt)` | Reset history |
| `badges` | `(userId, unlocked)` | Achievement display |
| `vault_items` | `(userId, createdAt)` | Recent documents |
| `audits` | `(userId, month)` | Monthly audit queries |
| `tenant_audit_logs` | `(tenantId, createdAt)` | Compliance queries |

### Performance Considerations

1. **Composite Indexes**: `(userId, createdAt)` supports both filtering and sorting
2. **Tenant Isolation**: All queries filtered by `tenantId` first
3. **Pagination**: Limit + offset pattern for large datasets
4. **Connection Pooling**: PgBouncer on port 6543 for scalability

---

## Row-Level Security (RLS)

### Supabase RLS Policies

```sql
-- Users can only access their tenant's data
CREATE POLICY "tenant_isolation_users"
ON public.users
FOR ALL
USING (tenant_id = (SELECT tenant_id FROM auth.users WHERE id = auth.uid()));

-- Life areas restricted to owner
CREATE POLICY "life_areas_owner_only"
ON public.life_areas
FOR ALL
USING (user_id = auth.uid());

-- Journals restricted to author
CREATE POLICY "journals_author_only"
ON public.journals
FOR ALL
USING (user_id = auth.uid());

-- Audit logs read-only
CREATE POLICY "audit_logs_read_only"
ON public.tenant_audit_logs
FOR SELECT
USING (tenant_id = (SELECT tenant_id FROM auth.users WHERE id = auth.uid()));
```

---

## Data Migration Strategy

### Prisma Migrations

```bash
# Create migration
npx prisma migrate dev --name add_phoenix_cycles

# Apply to production
npx prisma migrate deploy

# Rollback (if needed)
npx prisma migrate resolve --rolled-back [migration-name]
```

### Migration Best Practices

1. **Never delete columns** - Deprecate and hide instead
2. **Additive changes** - Add new columns as nullable
3. **Backfill data** - Separate migration step for data changes
4. **Test migrations** - Always test on staging first

---

## Backup & Recovery

### Supabase Auto-Backups

- **Daily backups**: Automatic (retained 7 days on Free, 30 days on Pro)
- **Point-in-time recovery**: Available on Pro plan
- **Manual backups**: Export via Supabase dashboard

### Disaster Recovery Plan

1. **Database Export**: `pg_dump` via Supabase CLI
2. **Restore**: `pg_restore` to new instance
3. **RTO (Recovery Time Objective)**: < 1 hour
4. **RPO (Recovery Point Objective)**: < 24 hours

```bash
# Manual backup
supabase db dump -f backup.sql

# Restore
supabase db restore backup.sql
```

---

**Document Version**: 1.0
**Schema Version**: Prisma 6.14.0
**Last Updated**: 2025-10-28
**Database**: PostgreSQL 15+ (Supabase)
