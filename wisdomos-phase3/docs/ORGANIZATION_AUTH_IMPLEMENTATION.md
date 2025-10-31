# Organization-Based Authentication Implementation

**Date**: 2025-10-29
**Status**: ✅ Implemented
**Branch**: main

---

## Overview

This document describes the implementation of the organization-based multi-tenant authentication system for WisdomOS. The system enables:

- ✅ Automatic user assignment to organizations based on email domain
- ✅ Enterprise onboarding with role management (owner, admin, member, viewer)
- ✅ Organization creation and management
- ✅ Audit logging via onboarding events
- ✅ Row-Level Security (RLS) policies for data isolation
- ✅ PostgreSQL triggers for automatic organization assignment

---

## Architecture

### Database Schema

The system consists of three main tables:

1. **`organizations`** - Holds enterprise/organization data
2. **`user_roles`** - Maps users to organizations with roles
3. **`onboarding_events`** - Logs signup, role assignments, and audit events

### Automatic Assignment Flow

```
User Signs Up
     ↓
Extract email domain (e.g., user@acme.com → acme.com)
     ↓
Check if organization exists for domain
     ↓
   ┌─────────────────┐
   │ Org exists?     │
   └─────────────────┘
     ↓             ↓
   YES            NO
     ↓             ↓
Assign as        Log event
"member"      (no org found)
     ↓
Log event
(user assigned)
```

### Role Hierarchy

```
owner > admin > member > viewer
  4       3       2        1
```

**Permissions by Role**:

| Permission              | Owner | Admin | Member | Viewer |
|------------------------|-------|-------|--------|--------|
| Manage organization    | ✅    | ✅    | ❌     | ❌     |
| Invite members         | ✅    | ✅    | ❌     | ❌     |
| Remove members         | ✅    | ✅    | ❌     | ❌     |
| Change roles           | ✅    | ✅    | ❌     | ❌     |
| View analytics         | ✅    | ✅    | ❌     | ❌     |
| Manage billing         | ✅    | ❌    | ❌     | ❌     |

---

## Files Created

### 1. Database Migration

**File**: `supabase/migrations/20251029_organization_auth_system.sql`

**Contents**:
- Organizations table with domain-based matching
- User roles table with unique constraint on (user_id, organization_id)
- Onboarding events table for audit logging
- Automatic user assignment trigger function
- RLS policies for data isolation
- Indexes for performance
- Auto-update triggers for `updated_at` columns

**Key Features**:
```sql
-- Automatic user assignment based on email domain
create or replace function public.handle_new_user_signup()
returns trigger
language plpgsql
security definer
as $$
declare
  user_domain text;
  org_id uuid;
begin
  user_domain := split_part(NEW.email, '@', 2);

  select id into org_id
  from public.organizations
  where domain = user_domain and status = 'active'
  limit 1;

  if org_id is not null then
    insert into public.user_roles (user_id, organization_id, role)
    values (NEW.id, org_id, 'member');
  end if;

  return NEW;
end;
$$;
```

### 2. TypeScript Types

**File**: `packages/types/organization-auth.ts`

**Exports**:
- `Organization` - Organization entity interface
- `UserRole` - User-organization role mapping
- `OnboardingEvent` - Audit event logging
- `UserWithOrganization` - User with their organizations
- `OrganizationWithMembers` - Organization with member list
- `CreateOrganizationRequest` - API request types
- `UpdateOrganizationRequest` - API request types
- `AssignRoleRequest` - API request types
- `rolePermissions` - Permission matrix by role
- `hasPermission()` - Permission checking utility

### 3. Organization Client (Client-Side)

**File**: `apps/web/lib/organization-client.ts`

**Class**: `OrganizationClient`

**Methods**:
- `getUserOrganizations()` - Get current user's organizations with roles
- `getOrganizationWithMembers()` - Get organization details with member list
- `createOrganization()` - Create new organization and assign creator as owner
- `updateOrganization()` - Update organization details
- `assignRole()` - Add user to organization with specific role
- `updateRole()` - Change user's role in organization
- `removeUserFromOrganization()` - Remove user from organization
- `getOnboardingEvents()` - Get audit events for analytics
- `hasRole()` - Check if user has specific role
- `hasMinimumRole()` - Check if user meets minimum role requirement

**Usage Example**:
```typescript
import { getUserOrganizations } from '@/lib/organization-client';

const userOrgs = await getUserOrganizations();
console.log(userOrgs?.organizations);
// [{ organization: {...}, role: 'admin' }, ...]
```

### 4. API Routes

#### GET /api/organizations
**Purpose**: Get user's organizations
**Response**:
```json
{
  "organizations": [
    {
      "id": "uuid",
      "name": "Acme Corp",
      "domain": "acme.com",
      "plan": "enterprise",
      "status": "active",
      "role": "admin",
      "joined_at": "2025-10-29T..."
    }
  ],
  "total": 1
}
```

#### POST /api/organizations
**Purpose**: Create new organization
**Request**:
```json
{
  "name": "Acme Corporation",
  "domain": "acme.com",
  "plan": "enterprise"
}
```
**Response**: `201 Created` with organization object

#### GET /api/organizations/[id]
**Purpose**: Get organization details with members
**Response**:
```json
{
  "organization": {...},
  "members": [...],
  "total_members": 5,
  "user_role": "admin"
}
```

#### PATCH /api/organizations/[id]
**Purpose**: Update organization (owner/admin only)
**Request**:
```json
{
  "name": "Acme Corp Updated",
  "status": "active"
}
```

#### DELETE /api/organizations/[id]
**Purpose**: Delete organization (owner only)
**Response**: `200 OK` with success message

#### GET /api/organizations/[id]/members
**Purpose**: Get organization members
**Response**:
```json
{
  "members": [
    {
      "user_id": "uuid",
      "role": "admin",
      "created_at": "2025-10-29T..."
    }
  ],
  "total": 3
}
```

#### POST /api/organizations/[id]/members
**Purpose**: Add member to organization (owner/admin only)
**Request**:
```json
{
  "user_id": "uuid",
  "role": "member"
}
```

---

## Security Features

### Row-Level Security (RLS)

All tables have RLS enabled with the following policies:

**Organizations**:
```sql
-- Users can only read organizations they belong to
create policy "Users can read their own organizations"
  on public.organizations
  for select
  using (
    id in (
      select organization_id
      from public.user_roles
      where user_id = auth.uid()
    )
  );
```

**User Roles**:
```sql
-- Users can only read their own role records
create policy "Users can read their own roles"
  on public.user_roles
  for select
  using (user_id = auth.uid());
```

**Onboarding Events**:
```sql
-- Users can only read their own events
create policy "Users can read their own onboarding events"
  on public.onboarding_events
  for select
  using (user_id = auth.uid());
```

### Permission Checking

Use the utility functions to check permissions:

```typescript
import { hasMinimumRole } from '@/lib/organization-client';

const canInvite = await hasMinimumRole(userId, orgId, 'admin');
```

---

## Usage Examples

### 1. Display User's Organizations

```tsx
'use client';

import { useEffect, useState } from 'react';
import { getUserOrganizations } from '@/lib/organization-client';

export default function OrganizationsPage() {
  const [orgs, setOrgs] = useState([]);

  useEffect(() => {
    async function loadOrganizations() {
      const data = await getUserOrganizations();
      setOrgs(data?.organizations || []);
    }
    loadOrganizations();
  }, []);

  return (
    <div>
      <h1>My Organizations</h1>
      {orgs.map((item) => (
        <div key={item.organization.id}>
          <h2>{item.organization.name}</h2>
          <p>Role: {item.role}</p>
        </div>
      ))}
    </div>
  );
}
```

### 2. Create New Organization

```tsx
import { createOrganization } from '@/lib/organization-client';

async function handleCreateOrg() {
  const org = await createOrganization({
    name: 'My Company',
    domain: 'mycompany.com',
    plan: 'enterprise',
  });

  if (org) {
    console.log('Organization created:', org);
  }
}
```

### 3. Check User Permissions

```tsx
import { hasMinimumRole, rolePermissions } from '@/lib/organization-client';

async function checkPermissions(userId: string, orgId: string) {
  const canManage = await hasMinimumRole(userId, orgId, 'admin');

  if (canManage) {
    // Show management options
  }
}
```

---

## Testing

### Manual Testing Steps

1. **Verify Automatic Assignment**:
   ```sql
   -- Create test organization
   insert into public.organizations (name, domain, plan)
   values ('Test Corp', 'testcorp.com', 'enterprise');

   -- Sign up with matching email (user@testcorp.com)
   -- Verify user is automatically assigned as 'member'
   select * from public.user_roles where organization_id = '<org-id>';
   ```

2. **Test API Endpoints**:
   ```bash
   # Get user's organizations
   curl -X GET http://localhost:3000/api/organizations \
     -H "Authorization: Bearer <token>"

   # Create organization
   curl -X POST http://localhost:3000/api/organizations \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"name": "Acme Corp", "domain": "acme.com"}'
   ```

3. **Verify RLS Policies**:
   ```sql
   -- Switch to user context
   set local role authenticated;
   set local request.jwt.claims.sub to '<user-id>';

   -- Try to access organizations
   select * from public.organizations;
   -- Should only return organizations user belongs to
   ```

---

## Deployment Checklist

- [x] Create migration file
- [x] Create TypeScript types
- [x] Create organization client utilities
- [x] Create API routes
- [ ] Run migration in Supabase
- [ ] Test automatic user assignment
- [ ] Test API endpoints
- [ ] Verify RLS policies
- [ ] Update authentication flows
- [ ] Add organization switcher to UI
- [ ] Update user onboarding flow

---

## Next Steps

### Immediate (Required for Production)

1. **Run Migration**:
   ```bash
   # Via Supabase CLI
   supabase migration up

   # Or via Supabase Dashboard SQL Editor
   # Copy contents of migration file and execute
   ```

2. **Seed Organizations** (Optional):
   ```sql
   insert into public.organizations (name, domain, plan)
   values
     ('Acme Corporation', 'acme.com', 'enterprise'),
     ('Beta Industries', 'beta.com', 'standard'),
     ('Gamma Labs', 'gamma.io', 'enterprise');
   ```

3. **Test Automatic Assignment**:
   - Sign up with email from existing organization domain
   - Verify user is automatically assigned to organization
   - Check onboarding_events table for audit log

### Future Enhancements

1. **Organization Settings Page** (`/settings/organization`):
   - View/edit organization details
   - Manage members and roles
   - View onboarding events
   - Billing integration

2. **Organization Switcher Component**:
   - Dropdown in navigation bar
   - Switch between organizations user belongs to
   - Store selected org in context/state

3. **Invitation System**:
   - Send email invitations to join organization
   - Invitation acceptance flow
   - Pending invitations management

4. **Auto-Create Organizations** (Optional):
   Uncomment in migration file to automatically create organizations for new domains:
   ```sql
   -- In handle_new_user_signup() function
   insert into public.organizations (name, domain)
   values (user_domain, user_domain)
   returning id into org_id;

   insert into public.user_roles (user_id, organization_id, role)
   values (NEW.id, org_id, 'owner');
   ```

---

## Troubleshooting

### User not automatically assigned to organization

**Check**:
1. Organization exists with matching domain
2. Organization status is 'active'
3. User email contains valid domain after @
4. Trigger is enabled: `select * from pg_trigger where tgname = 'on_auth_user_created';`

### RLS policy blocking access

**Check**:
1. User is authenticated: `select auth.uid();`
2. User has role in organization: `select * from user_roles where user_id = auth.uid();`
3. RLS is enabled: `select * from pg_tables where tablename = 'organizations';`

### API returning 403 Forbidden

**Check**:
1. User is authenticated
2. User has required role for operation
3. Permission check logic is correct

---

## Database Schema Reference

### organizations

| Column     | Type         | Description                    |
|------------|--------------|--------------------------------|
| id         | uuid         | Primary key                    |
| name       | text         | Organization name              |
| domain     | text         | Email domain (unique)          |
| plan       | text         | Subscription plan              |
| status     | text         | active, suspended, inactive    |
| created_at | timestamptz  | Creation timestamp             |
| updated_at | timestamptz  | Last update timestamp          |

### user_roles

| Column          | Type        | Description                    |
|-----------------|-------------|--------------------------------|
| id              | uuid        | Primary key                    |
| user_id         | uuid        | Foreign key to auth.users      |
| organization_id | uuid        | Foreign key to organizations   |
| role            | text        | owner, admin, member, viewer   |
| created_at      | timestamptz | Creation timestamp             |
| updated_at      | timestamptz | Last update timestamp          |

**Unique Constraint**: (user_id, organization_id)

### onboarding_events

| Column          | Type        | Description                    |
|-----------------|-------------|--------------------------------|
| id              | uuid        | Primary key                    |
| user_id         | uuid        | Foreign key to auth.users      |
| organization_id | uuid        | Foreign key to organizations   |
| event_type      | text        | Event type identifier          |
| event_data      | jsonb       | Additional event data          |
| created_at      | timestamptz | Event timestamp                |

**Event Types**:
- `user_assigned_to_org` - User automatically assigned to organization
- `no_org_found_for_domain` - User signup without matching organization
- `org_created` - New organization created
- `role_assigned` - User added to organization manually
- `role_updated` - User's role changed
- `user_invited` - User invited to organization
- `user_removed` - User removed from organization

---

## Migration Rollback

If you need to rollback this migration:

```sql
-- Drop triggers
drop trigger if exists on_auth_user_created on auth.users;

-- Drop functions
drop function if exists public.handle_new_user_signup();
drop function if exists public.update_updated_at_column();

-- Drop tables (cascade will remove dependent objects)
drop table if exists public.onboarding_events cascade;
drop table if exists public.user_roles cascade;
drop table if exists public.organizations cascade;
```

---

## Support

For issues or questions:
- Check troubleshooting section above
- Review Supabase logs in dashboard
- Check PostgreSQL logs for trigger errors
- Verify RLS policies are not blocking operations

---

**Status**: ✅ Implementation Complete
**Last Updated**: 2025-10-29
**Next Action**: Run migration in Supabase and test automatic user assignment
