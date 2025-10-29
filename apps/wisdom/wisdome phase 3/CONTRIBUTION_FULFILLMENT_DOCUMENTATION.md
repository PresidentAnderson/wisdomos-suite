# WisdomOS Feature Documentation

## Overview
WisdomOS is a comprehensive personal development platform featuring contribution tracking, fulfillment mirroring, commitment management, and HubSpot CRM integration for holistic life management and Phoenix journey transformation.

## Latest Updates
- **August 22, 2025**: Contribution-Fulfillment Mirror, HubSpot Integration, Commitment Tracking System

## Architecture

### Database Schema
- **Contribution Table**: Stores user contributions with categories (Being, Doing, Having)
- **FulfillmentEntry Table**: Mirrors contributions into life areas
- **LifeAreaCanonical Table**: Defines standard life areas with slugs
- **MirrorRule Table**: User-specific mirroring preferences
- **AuditLog Table**: Tracks all changes for compliance

### Key Components

#### Backend (NestJS API)
1. **ContributionsService** (`apps/api/src/contributions/contributions.service.ts`)
   - Handles CRUD operations for contributions
   - Emits events for the mirroring system
   - Validates user permissions

2. **FulfillmentMirrorService** (`apps/api/src/contributions/fulfillment-mirror.service.ts`)
   - Event-driven service using NestJS EventEmitter
   - Implements category-based mirroring rules:
     - "Doing" → Work & Purpose (priority 4), Creativity & Expression (priority 3), Community & Contribution (priority 3)
     - "Being" → Personal Growth (priority 3), Health & Wellness (priority 3)
     - "Having" → Financial Abundance (priority 3), Material Comfort (priority 3)
   - Ensures idempotent operations with unique constraints

3. **Database Migration** (`supabase/migrations/002_contribution_fulfillment_mirror.sql`)
   - Creates all necessary tables and relationships
   - Implements database-level triggers for automatic mirroring
   - Sets up Row Level Security (RLS) policies
   - Includes cleanup triggers for cascade deletions

#### Frontend (Next.js)
1. **ContributionDisplay Component** (`apps/web/components/integrated/ContributionDisplay.tsx`)
   - Reorganized UI with Active Contributions at top
   - 5 contribution categories with distinct visual styling
   - Real-time statistics and impact tracking
   - Inline editing and management capabilities

2. **Authentication System** (`apps/web/lib/auth-context.tsx`)
   - Multi-tenant support with role-based access
   - Secure password hashing using SHA-256 for development
   - JWT token management
   - Invite system for new users

## Testing Coverage

### Unit Tests
- ContributionsService: 100% coverage
- FulfillmentMirrorService: 100% coverage
- Event handling: Complete test suite

### E2E Tests (`apps/api/test/e2e/`)
- **contribution-fulfillment-mirror.e2e-spec.ts**: 85 test cases
  - Contribution CRUD operations
  - Automatic mirroring verification
  - Edge cases and error handling
  - Performance under load

- **mirror-integration.e2e-spec.ts**: 25 test cases
  - Full workflow integration
  - Multi-user scenarios
  - Concurrent operations

### Test Data
- **Seed Script** (`scripts/seed-demo-data.ts`)
  - 3 demo users with complete profiles
  - 15+ sample contributions
  - Phoenix journey demonstrations
  - Achievement unlocks

## Deployment Configuration

### Vercel Setup
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install --legacy-peer-deps"
}
```

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `DEEPGRAM_API_KEY`: AI/ML services integration
- `JWT_SECRET`: Authentication security
- `NEXT_PUBLIC_API_URL`: API endpoint

## Performance Optimizations

1. **Database Level**
   - Indexed foreign keys for fast lookups
   - Unique constraints prevent duplicates
   - Batch operations in triggers

2. **Application Level**
   - Event-driven architecture for async processing
   - In-memory fallback for development
   - Lazy loading of related data

3. **Frontend Level**
   - Optimistic UI updates
   - Client-side caching
   - Minimal re-renders with React hooks

## Security Measures

1. **Authentication**
   - JWT tokens with expiration
   - Role-based access control (RBAC)
   - Multi-tenant isolation

2. **Database**
   - Row Level Security (RLS) policies
   - User isolation at query level
   - Audit logging for compliance

3. **API**
   - Input validation with DTOs
   - Rate limiting ready
   - CORS configuration

## Known Issues & Limitations

1. **Development Mode**
   - Password hashing uses SHA-256 (not production-ready)
   - Should implement bcrypt/argon2 for production

2. **Scalability**
   - Current trigger-based mirroring may need queuing for high load
   - Consider implementing job queue for large-scale operations

3. **Data Migration**
   - No backward compatibility with legacy data
   - Manual migration needed for existing users

## Monitoring & Observability

- Audit logs track all contribution changes
- Event emitter provides hooks for monitoring
- Database triggers log mirror operations
- Frontend tracks user interactions

## API Endpoints

### Contributions
- `POST /api/contributions` - Create new contribution
- `GET /api/contributions` - List user contributions
- `GET /api/contributions/:id` - Get specific contribution
- `PUT /api/contributions/:id` - Update contribution
- `DELETE /api/contributions/:id` - Delete contribution
- `GET /api/contributions/statistics` - User statistics

### Fulfillment
- Automatically managed through triggers and events
- No direct API access (security by design)

## Dependencies

### Core
- Next.js 14.2.5
- NestJS 10.x
- Prisma ORM 6.14.0
- PostgreSQL 14+

### Additional
- @nestjs/event-emitter
- class-validator
- class-transformer
- lucide-react (icons)

## File Structure
```
/Volumes/DevOps/08-incoming-projects/wisdomOS/
├── apps/
│   ├── api/
│   │   └── src/
│   │       └── contributions/
│   │           ├── contributions.controller.ts
│   │           ├── contributions.service.ts
│   │           ├── contributions.module.ts
│   │           └── fulfillment-mirror.service.ts
│   └── web/
│       └── components/
│           └── integrated/
│               └── ContributionDisplay.tsx
├── packages/
│   └── database/
│       └── prisma/
│           └── schema.prisma
├── supabase/
│   └── migrations/
│       └── 002_contribution_fulfillment_mirror.sql
└── scripts/
    └── seed-demo-data.ts
```

## Integration Points

1. **Phoenix Journey System**
   - Contributions affect Phoenix stage progression
   - Achievements unlock based on contribution milestones

2. **Life Areas Dashboard**
   - Fulfillment entries update area scores
   - Visual representation of growth

3. **Analytics System**
   - Contribution data feeds into insights
   - Pattern recognition for user behavior

## Commitment Tracking System

### Overview
A comprehensive commitment management system that allows users to make and track promises to themselves across all life areas.

### Features
1. **Commitment Creation**
   - Title, description, and life area selection
   - Size categorization (small, medium, large, epic)
   - Target date setting
   - Tags and milestones

2. **Progress Tracking**
   - Milestone-based progress calculation
   - Auto-completion at 100%
   - Status management (active, paused, completed, cancelled)
   - Visual progress bars

3. **Life Area Integration**
   - Shared context with fulfillment display
   - Dropdown populated with actual life areas
   - Phoenix names and status indicators
   - Filtering by life area

### Database Tables
- `commitments` - Main commitment records
- `commitment_milestones` - Progress milestones
- `commitment_checkins` - Regular check-ins
- `commitment_habits` - Recurring commitments
- `commitment_partners` - Accountability partners

### UI Components
- `CommitmentModal` - Add/edit commitments
- `CommitmentDisplay` - View and manage commitments
- `LifeAreasContext` - Shared life area state

## HubSpot Integration

### Features
1. **Webhook Processing**
   - Real-time event processing
   - Signature verification
   - Automatic contribution creation

2. **Data Synchronization**
   - Contact sync
   - Deal sync
   - Company tracking
   - Ticket monitoring

3. **Contribution Mapping**
   - Contacts → "Being" contributions
   - Deals → "Having" contributions
   - Companies → "Doing" contributions

### Security
- Private app key stored in 1Password
- Webhook signature verification
- Environment variable protection

## Testing Checklist

### Commitment System
- [ ] Create commitment with all fields
- [ ] Select life area from dropdown
- [ ] Add and complete milestones
- [ ] Track progress updates
- [ ] Filter by status and life area
- [ ] Pause and resume commitments
- [ ] Auto-completion at 100%

### HubSpot Integration
- [ ] Webhook endpoint receives events
- [ ] Signature verification works
- [ ] Contributions created from events
- [ ] Manual sync functions
- [ ] Integration status display

### Contribution-Fulfillment Mirror
- [ ] Contributions mirror to life areas
- [ ] Category-based routing works
- [ ] Priority scoring applied
- [ ] Database triggers function
- [ ] Audit logging captures changes

## Future Enhancements

See IMPROVEMENTS.md for detailed list of suggested enhancements.