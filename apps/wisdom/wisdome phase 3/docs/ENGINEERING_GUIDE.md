# WisdomOS — Software Engineering Guide (v1.0)

**Architecture & Engineering Manual for Development Teams and AI Agents**

> "Every function must serve awareness; every API must deepen connection."

---

## Table of Contents

1. [Mission & Core Philosophy](#1-mission--core-philosophy)
2. [Architecture Overview](#2-architecture-overview)
3. [Data Model Design](#3-data-model-design)
4. [API Layer](#4-api-layer-supabase--edge-functions)
5. [Agent Integration Model](#5-agent-integration-model)
6. [System Modules](#6-system-modules-v1v3-roadmap)
7. [Developer Guidelines](#7-developer-guidelines)
8. [Data Privacy & Ethics](#8-data-privacy--ethics)
9. [Engineering Workflow](#9-engineering-workflow)
10. [Roadmap to MVP](#10-roadmap-to-mvp)
11. [Developer Onboarding Checklist](#11-developer-onboarding-checklist)
12. [Documentation & Governance](#12-documentation--governance)

---

## 1. Mission & Core Philosophy

**WisdomOS is not just software — it's a living system for awareness, alignment, and human development.**

### Engineering Principle
**Encode wisdom into systems.**

Every feature, every API endpoint, every data model must serve the deeper purpose of helping users:
- Develop self-awareness through journaling and reflection
- Align their actions with their values
- Transform through the Phoenix cycle (Ashes → Fire → Rebirth → Flight)
- Build lasting fulfillment across life dimensions

### Core Values
- **Awareness-First Design**: Every interaction should promote insight
- **Data Sovereignty**: Users own their data, insights are suggestive not prescriptive
- **Intentional Architecture**: Code structure mirrors life structure
- **Agent Collaboration**: AI agents work as partners, not overlords
- **Ethical Foundation**: Privacy, security, and user autonomy are non-negotiable

---

## 2. Architecture Overview

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14 + React 18 + TypeScript | Web interface for dashboards, journals, reflections |
| **Deployment** | Vercel (Web) | Production hosting with edge functions |
| **Backend** | Supabase (PostgreSQL + Auth + Edge Functions) | Database, authentication, real-time subscriptions |
| **ORM** | Prisma | Type-safe database access with migrations |
| **AI Layer** | OpenAI GPT-4 / Anthropic Claude | NLP insights, reflection prompts, pattern analysis |
| **State Management** | Zustand + TanStack Query | Client state + server state caching |
| **UI Components** | Radix UI + TailwindCSS + Framer Motion | Accessible components with Phoenix animations |
| **File Storage** | Supabase Storage | User uploads, attachments, media |
| **Analytics** | PostHog + Supabase Analytics | User behavior, engagement patterns |
| **Automation** | GitHub Actions | CI/CD pipelines, automated testing |

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Next.js    │  │   React 18   │  │  TailwindCSS │      │
│  │   (App Dir)  │  │   Components │  │   + Framer   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      API & State Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    tRPC      │  │   TanStack   │  │    Zustand   │      │
│  │  (Type-Safe) │  │    Query     │  │  (Client)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                       Backend Services                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Supabase    │  │  PostgreSQL  │  │   Prisma     │      │
│  │  Auth + RLS  │  │  (Multi-Tenant) │  ORM       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                        AI Agent Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Journal    │  │  Fulfillment │  │   Insight    │      │
│  │    Agent     │  │    Agent     │  │    Agent     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Data Model Design

### Database: Multi-Tenant PostgreSQL (Supabase)

#### Core Tables

| Table | Description | Key Fields |
|-------|-------------|------------|
| `tenants` | Organization/workspace isolation | `id`, `slug`, `plan`, `status` |
| `users` | All WisdomOS participants | `id`, `tenantId`, `email`, `role` |
| `life_areas` | Fulfillment categories (Work, Relationships, Health, etc.) | `id`, `userId`, `name`, `status`, `score` |
| `journals` | Reflections and daily entries | `id`, `userId`, `lifeAreaId`, `content`, `sentiment` |
| `insights` | AI-generated analysis | `id`, `journalId`, `agentType`, `insight` |
| `phoenix_cycles` | Transformation tracking | `id`, `userId`, `stage`, `cycleNumber` |
| `relationships` | Social connections | `id`, `userId`, `type`, `quality` |
| `resets` | Phoenix transformations | `id`, `userId`, `trigger`, `outcome` |
| `vault` | Secure document storage | `id`, `userId`, `encrypted`, `metadata` |
| `badges` | Gamification achievements | `id`, `userId`, `type`, `earnedAt` |

### Phoenix Stages Enum

```typescript
enum PhoenixStage {
  ASHES    // Reflection phase - What needs to burn away?
  FIRE     // Breakthrough phase - Transform through challenge
  REBIRTH  // Fulfillment phase - New identity emerges
  FLIGHT   // Legacy phase - Contribution to others
}
```

### Life Status Indicators

```typescript
enum LifeStatus {
  GREEN   // Thriving - everything aligned
  YELLOW  // Attention needed - minor misalignment
  RED     // Breakdown - urgent transformation required
}
```

### Multi-Tenancy Model

Every user belongs to a **tenant** (organization/workspace). Row-Level Security (RLS) policies ensure complete data isolation:

- Users can only access their tenant's data
- Tenant admins can manage their organization
- Cross-tenant data leakage is architecturally impossible

---

## 4. API Layer (Supabase + Edge Functions)

### Authentication Endpoints

```typescript
// Auth API
POST   /auth/signup           // Create new user account
POST   /auth/login            // JWT token authentication
POST   /auth/logout           // Invalidate session
GET    /auth/me               // Get current user profile
POST   /auth/reset-password   // Password reset flow
```

### Core API Endpoints

```typescript
// Life Areas
GET    /api/life-areas              // Fetch user's life areas
POST   /api/life-areas              // Create new life area
PATCH  /api/life-areas/:id          // Update life area
DELETE /api/life-areas/:id          // Delete life area

// Journals
GET    /api/journals                // List journal entries
GET    /api/journals/:id            // Get specific entry
POST   /api/journals                // Create journal entry
PATCH  /api/journals/:id            // Update journal entry
DELETE /api/journals/:id            // Delete journal entry

// AI Insights
GET    /api/insights/:journalId     // Get AI analysis for entry
POST   /api/insights/generate       // Generate new insights
GET    /api/insights/patterns       // Detect recurring patterns

// Phoenix Cycles
GET    /api/phoenix/current         // Current transformation stage
POST   /api/phoenix/reset           // Initiate new phoenix cycle
GET    /api/phoenix/history         // Past transformations

// Dashboard
GET    /api/dashboard               // Aggregate metrics & scores
GET    /api/dashboard/trends        // Historical trend data
GET    /api/dashboard/recommendations // AI-driven suggestions

// Relationships
GET    /api/relationships           // Social connections
POST   /api/relationships           // Add new relationship
PATCH  /api/relationships/:id       // Update relationship quality

// Vault
GET    /api/vault                   // List secured documents
POST   /api/vault                   // Upload encrypted document
GET    /api/vault/:id               // Download document
DELETE /api/vault/:id               // Delete document
```

### tRPC Router Structure

```typescript
// apps/api/src/routers/index.ts
export const appRouter = router({
  auth: authRouter,
  lifeAreas: lifeAreasRouter,
  journals: journalsRouter,
  insights: insightsRouter,
  phoenix: phoenixRouter,
  dashboard: dashboardRouter,
  relationships: relationshipsRouter,
  vault: vaultRouter,
  agents: agentsRouter,
});

export type AppRouter = typeof appRouter;
```

---

## 5. Agent Integration Model

### AI Agent Architecture

WisdomOS uses specialized AI agents for different aspects of awareness and transformation:

| Agent | Role | Description |
|-------|------|-------------|
| **JournalAgent** | NLP Summarization | Reads daily reflections, extracts key themes, identifies emotional tone |
| **FulfillmentAgent** | Metrics & Alignment | Calculates fulfillment scores across life areas, detects imbalances |
| **InsightAgent** | Pattern Detection | Identifies recurring emotional/behavioral loops, surfaces blind spots |
| **IntegrityAgent** | Consistency Watchdog | Cross-references commitments vs. actions, flags contradictions |
| **NarrativeAgent** | Story Architect | Builds autobiographical storyline from journal entries |
| **PhoenixAgent** | Transformation Guide | Guides users through phoenix cycle stages |
| **RelationshipAgent** | Connection Analyst | Maps social connections, suggests relationship improvements |

### Agent Communication Protocol

```typescript
// Agent request format
interface AgentRequest {
  agentType: AgentType;
  userId: string;
  context: {
    journalEntries?: Journal[];
    lifeAreas?: LifeArea[];
    phoenixCycle?: PhoenixCycle;
  };
  task: string;
}

// Agent response format
interface AgentResponse {
  agentType: AgentType;
  insights: Insight[];
  recommendations: Recommendation[];
  confidence: number; // 0-1
  metadata: {
    model: string;
    tokensUsed: number;
    processingTime: number;
  };
}
```

### Agent Prompting Strategy

```typescript
// Example: JournalAgent system prompt
const JOURNAL_AGENT_PROMPT = `
You are the Journal Agent for WisdomOS, a Phoenix Operating System for life transformation.

Your purpose: Help users develop self-awareness through reflective journaling.

When analyzing journal entries:
1. Identify core emotional themes
2. Extract key insights about the user's inner world
3. Detect patterns across multiple entries
4. Suggest reflection questions that deepen awareness
5. Maintain a compassionate, non-judgmental tone

Remember: You're not giving advice. You're helping the user see themselves more clearly.
`;
```

---

## 6. System Modules (v1–v3 Roadmap)

### Phase 1: Foundation (Current)
- ✅ Multi-tenant database with RLS policies
- ✅ User authentication and authorization
- ✅ Life areas tracking
- ✅ Journal entry system
- ✅ Basic AI insights

### Phase 2: Intelligence (In Progress)
- 🔄 Advanced AI agent integration
- 🔄 Pattern detection across journal entries
- 🔄 Phoenix cycle tracking
- 🔄 Relationship mapping
- 🔄 Integrity dashboard

### Phase 3: Transformation (Planned)
- 📋 Full autobiography builder
- 📋 Multi-agent orchestration
- 📋 Real-time fulfillment analytics
- 📋 Community features (shared wisdom)
- 📋 Mobile app (React Native)

---

## 7. Developer Guidelines

### Project Structure (Monorepo)

```
wisdomos/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── app/                # App router pages
│   │   ├── components/         # React components
│   │   ├── lib/                # Utilities
│   │   └── styles/             # Global styles
│   ├── api/                    # NestJS backend
│   └── mobile/                 # React Native app (future)
│
├── packages/
│   ├── db/                     # Prisma schema + client
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── src/
│   ├── database/               # Legacy database package
│   ├── ui/                     # Shared React components
│   ├── types/                  # TypeScript definitions
│   ├── core/                   # Business logic
│   ├── ai/                     # AI agent orchestration
│   └── utils/                  # Common helpers
│
├── docs/                       # Documentation
│   ├── ENGINEERING_GUIDE.md
│   ├── API_REFERENCE.md
│   ├── DATABASE_SCHEMA.md
│   └── AGENT_ARCHITECTURE.md
│
├── scripts/                    # Automation scripts
│   ├── init-database.ts
│   ├── seed-demo-data.ts
│   └── test-database-integration.ts
│
├── supabase/                   # Supabase configuration
│   ├── migrations/             # Database migrations
│   └── config.toml
│
├── .github/
│   └── workflows/              # CI/CD pipelines
│
├── package.json                # Root package
├── turbo.json                  # Turborepo config
├── pnpm-workspace.yaml         # pnpm workspaces
└── .env.local                  # Local environment vars
```

### Coding Standards

#### TypeScript Everywhere
```typescript
// ✅ Good: Explicit types
interface CreateJournalInput {
  content: string;
  lifeAreaId: string;
  tags?: string[];
}

async function createJournal(input: CreateJournalInput): Promise<Journal> {
  // Implementation
}

// ❌ Bad: Implicit any
async function createJournal(input) {
  // Implementation
}
```

#### Zod Validation
```typescript
import { z } from 'zod';

const CreateJournalSchema = z.object({
  content: z.string().min(10).max(10000),
  lifeAreaId: z.string().uuid(),
  tags: z.array(z.string()).optional(),
});

// Use in tRPC router
export const journalsRouter = router({
  create: protectedProcedure
    .input(CreateJournalSchema)
    .mutation(async ({ ctx, input }) => {
      // Type-safe input guaranteed
    }),
});
```

#### Commit Message Format
```bash
# Format: type(scope): description

feat(journals): add sentiment analysis to entries
fix(auth): resolve JWT expiration edge case
docs(api): update authentication endpoints
refactor(db): optimize life areas query performance
test(agents): add unit tests for JournalAgent
chore(deps): update Prisma to v6.14.0
```

#### Phoenix-Themed Naming

Follow the Phoenix transformation metaphor:
```typescript
// ✅ Good: Phoenix-aligned naming
function triggerPhoenixReset()
function calculateEmberScore() // Early stage fulfillment
function trackFlightProgress() // Legacy contribution

// ❌ Bad: Generic naming
function doReset()
function getScore()
function trackProgress()
```

### Testing Strategy

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Type checking
pnpm type-check

# Run all checks before commit
pnpm lint && pnpm test && pnpm type-check
```

---

## 8. Data Privacy & Ethics

### Core Principles

1. **User Data Sovereignty**
   - Every user owns their data completely
   - Export functionality available at any time
   - Deletion is permanent and immediate

2. **AI Ethics**
   - AI insights are **suggestive**, never **prescriptive**
   - Users can always override or ignore AI recommendations
   - Transparency in how insights are generated

3. **Encryption Standards**
   - All journal entries encrypted at rest (AES-256)
   - Sensitive vault documents use client-side encryption
   - Database credentials stored in Supabase Vault

4. **Audit Trail**
   - All data access logged in `tenant_audit_logs`
   - Immutable logs for compliance
   - Users can view their own audit history

### Data Retention Policy

```typescript
// Automatic data lifecycle
interface DataRetention {
  journals: 'permanent' | 'user-controlled';
  insights: 'permanent';
  audit_logs: '7_years'; // Compliance requirement
  deleted_users: '30_days_soft_delete'; // Grace period
}
```

---

## 9. Engineering Workflow

### 1. Feature Development

```bash
# Create feature branch
git checkout -b feature/phoenix-agent-integration

# Make changes
# ... code ...

# Run local tests
pnpm test

# Commit with conventional format
git commit -m "feat(agents): add PhoenixAgent for cycle tracking"

# Push and create PR
git push origin feature/phoenix-agent-integration
```

### 2. Code Review Process

- All PRs require at least 1 approval
- Automated checks must pass:
  - TypeScript compilation
  - Linting (ESLint + Prettier)
  - Unit tests
  - Type checking

### 3. Deployment Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm build
      - run: pnpm test
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

### 4. Database Migrations

```bash
# Create migration
pnpm db:migrate

# Apply to production (via CI/CD)
pnpm db:push

# Rollback if needed
npx prisma migrate resolve --rolled-back [migration-name]
```

---

## 10. Roadmap to MVP

| Phase | Milestone | Status | Output |
|-------|-----------|--------|--------|
| **Phase 1** | Core Platform | ✅ Complete | Multi-tenant database, auth, life areas |
| **Phase 2** | AI Integration | 🔄 In Progress | Journal insights, pattern detection |
| **Phase 3** | Phoenix Cycles | 📋 Planned | Full transformation tracking |
| **Phase 4** | Mobile App | 📋 Planned | React Native iOS/Android |
| **Phase 5** | Agent Marketplace | 📋 Future | Third-party agent plugins |

---

## 11. Developer Onboarding Checklist

### Environment Setup

```bash
# 1. Clone repository
git clone https://github.com/wisdomos/wisdomos-platform.git
cd wisdomos-platform

# 2. Install dependencies
pnpm install

# 3. Copy environment template
cp .env.example .env.local

# 4. Configure environment variables
# Edit .env.local with your Supabase credentials

# 5. Initialize database
pnpm db:init

# 6. Generate Prisma client
pnpm db:generate

# 7. Seed demo data (optional)
pnpm db:seed:demo

# 8. Start development server
pnpm dev
```

### Access Required

- [ ] GitHub repository access
- [ ] Supabase project access (staging)
- [ ] 1Password vault access (credentials)
- [ ] Vercel team access (deployments)
- [ ] Linear project access (task tracking)
- [ ] Slack workspace access (#engineering channel)

### Required Reading

- [ ] Read ENGINEERING_GUIDE.md (this document)
- [ ] Review DATABASE_SCHEMA.md
- [ ] Study AGENT_ARCHITECTURE.md
- [ ] Understand Phoenix transformation philosophy
- [ ] Sign Developer Code of Ethics

---

## 12. Documentation & Governance

### Documentation Structure

```
docs/
├── ENGINEERING_GUIDE.md          # This document
├── API_REFERENCE.md              # Complete API documentation
├── DATABASE_SCHEMA.md            # Database structure + relationships
├── AGENT_ARCHITECTURE.md         # AI agent design patterns
├── DEPLOYMENT_GUIDE.md           # Production deployment
├── SECURITY_POLICY.md            # Security practices
└── CODE_OF_ETHICS.md             # Developer ethical guidelines
```

### Governance Process

#### RFC (Request for Comments)
For major architectural changes:
1. Create RFC document in `docs/rfcs/`
2. Present in engineering meeting
3. Gather feedback and iterate
4. Final approval required from tech lead
5. Implement after approval

#### Security Incidents
- Report immediately via secure channel
- Create incident ticket (confidential)
- Follow incident response protocol
- Post-mortem after resolution

### Support & Communication

- **Slack**: #engineering (general), #phoenix-agents (AI)
- **GitHub Issues**: Bug reports and feature requests
- **Linear**: Sprint planning and task tracking
- **Weekly Sync**: Engineering standup (Fridays)

---

## Appendix A: Environment Variables Reference

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret

# Database
DATABASE_URL=postgresql://user:pass@host:6543/db
DIRECT_URL=postgresql://user:pass@host:5432/db

# OpenAI (AI Features)
OPENAI_API_KEY=sk-proj-...

# Security
JWT_SECRET=random-secret-key
NEXTAUTH_SECRET=random-nextauth-secret
MASTER_ENCRYPTION_KEY=base64-encoded-key

# Feature Flags
ENABLE_AI_FEATURES=true
ENABLE_COMMUNITY_HUB=true
ENABLE_GAMIFICATION=true

# Analytics (Optional)
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

---

## Appendix B: Quick Command Reference

```bash
# Development
pnpm dev                    # Start all apps in parallel
pnpm web:dev                # Start web app only
pnpm api:dev                # Start API server only

# Database
pnpm db:generate            # Generate Prisma client
pnpm db:push                # Push schema to database
pnpm db:migrate             # Create and apply migration
pnpm db:studio              # Open Prisma Studio
pnpm db:seed                # Seed canonical data
pnpm db:seed:demo           # Seed demo data

# Testing
pnpm test                   # Run all tests
pnpm test:watch             # Watch mode
pnpm lint                   # Run linter
pnpm type-check             # TypeScript validation

# Building
pnpm build                  # Build all packages
pnpm clean                  # Clean build artifacts
```

---

**Document Version**: 1.0
**Last Updated**: 2025-10-28
**Maintained By**: WisdomOS Engineering Team
**License**: Proprietary

---

*"Every line of code is an act of creation. Create with wisdom."*
