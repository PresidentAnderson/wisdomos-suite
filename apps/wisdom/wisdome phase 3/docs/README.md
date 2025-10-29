# WisdomOS Documentation

**Phoenix Operating System for Life Transformation**

---

## Quick Links

- **[Engineering Guide](./ENGINEERING_GUIDE.md)** - Complete technical blueprint for developers and AI agents
- **[API Reference](./API_REFERENCE.md)** - Comprehensive API documentation
- **[Database Schema](./DATABASE_SCHEMA.md)** - Complete database architecture and schema documentation

---

## What is WisdomOS?

WisdomOS is a **living system for awareness, alignment, and human development**. It's not just software—it's a platform that helps people:

- Develop self-awareness through journaling and reflection
- Align their actions with their values
- Transform through the Phoenix cycle (Ashes → Fire → Rebirth → Flight)
- Build lasting fulfillment across life dimensions

---

## For Developers

### Getting Started

```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# 3. Generate Prisma client
pnpm db:generate

# 4. Push database schema
pnpm db:push

# 5. Seed demo data (optional)
pnpm db:seed:demo

# 6. Start development
pnpm dev
```

### Key Commands

```bash
# Development
pnpm dev                    # Start all apps
pnpm web:dev                # Web app only
pnpm api:dev                # API server only

# Database
pnpm db:generate            # Generate Prisma client
pnpm db:push                # Push schema changes
pnpm db:migrate             # Create migration
pnpm db:studio              # Open Prisma Studio

# Testing
pnpm test                   # Run tests
pnpm lint                   # Run linter
pnpm type-check             # TypeScript validation

# Building
pnpm build                  # Build all packages
```

---

## For AI Agents

### Agent Roles

WisdomOS uses specialized AI agents:

| Agent | Purpose |
|-------|---------|
| **JournalAgent** | Analyze journal entries for themes and insights |
| **FulfillmentAgent** | Calculate fulfillment scores across life areas |
| **InsightAgent** | Detect patterns and behavioral loops |
| **IntegrityAgent** | Cross-check commitments vs. actions |
| **NarrativeAgent** | Build autobiographical storyline |
| **PhoenixAgent** | Guide through transformation cycles |

### Integration

Agents communicate via standardized request/response format:

```typescript
interface AgentRequest {
  agentType: AgentType;
  userId: string;
  context: {
    journalEntries?: Journal[];
    lifeAreas?: LifeArea[];
  };
  task: string;
}

interface AgentResponse {
  insights: Insight[];
  recommendations: Recommendation[];
  confidence: number;
}
```

---

## Architecture Overview

### Technology Stack

- **Frontend**: Next.js 14 + React 18 + TypeScript
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **ORM**: Prisma
- **AI**: OpenAI GPT-4 / Anthropic Claude
- **Deployment**: Vercel (Web)

### Project Structure

```
wisdomos/
├── apps/
│   ├── web/                # Next.js frontend
│   ├── api/                # NestJS backend
│   └── mobile/             # React Native (future)
│
├── packages/
│   ├── db/                 # Prisma schema + client
│   ├── ui/                 # Shared components
│   ├── types/              # TypeScript definitions
│   └── core/               # Business logic
│
├── docs/                   # Documentation (you are here)
├── scripts/                # Automation scripts
└── supabase/               # Database migrations
```

---

## Core Concepts

### Phoenix Transformation Cycle

WisdomOS is built around the Phoenix metaphor:

1. **Ashes** (Reflection) - What needs to burn away?
2. **Fire** (Breakthrough) - Transform through challenge
3. **Rebirth** (Fulfillment) - New identity emerges
4. **Flight** (Legacy) - Contribution to others

### Life Areas

Users organize their lives into fulfillment dimensions:

- Career & Purpose
- Relationships & Love
- Physical Health
- Mental Well-being
- Financial Security
- Personal Growth
- Community & Service
- Spirituality & Meaning

### Status Indicators

Each life area has a status:
- 🟢 **GREEN** - Thriving, aligned, fulfilling
- 🟡 **YELLOW** - Attention needed, minor misalignment
- 🔴 **RED** - Breakdown, urgent transformation required

---

## Database

### Multi-Tenant Architecture

Every user belongs to a **Tenant** (organization/workspace):
- Complete data isolation via Row-Level Security (RLS)
- Supports B2B SaaS, personal workspaces, team collaboration
- Tenant-scoped authentication and authorization

### Core Tables

- `tenants` - Organizations/workspaces
- `users` - User accounts with roles
- `life_areas` - Fulfillment dimensions
- `journals` - Reflections and entries
- `events` - Life events (wins, upsets, insights)
- `relationships` - Social connections
- `resets` - Phoenix transformations
- `badges` - Gamification achievements
- `vault_items` - Secure document storage
- `audits` - Monthly assessments

See [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for full details.

---

## API

### Base URL

```
Production:  https://wisdomos-phoenix-frontend.vercel.app/api
Development: http://localhost:3000/api
```

### Authentication

All API requests require JWT token:

```http
Authorization: Bearer {token}
```

### Key Endpoints

```http
POST   /auth/signup           # Create account
POST   /auth/login            # Authenticate
GET    /api/life-areas        # List life areas
POST   /api/journals          # Create journal entry
GET    /api/insights/:id      # Get AI insights
GET    /api/dashboard         # Dashboard metrics
POST   /api/phoenix/reset     # Initiate transformation
```

See [API_REFERENCE.md](./API_REFERENCE.md) for complete documentation.

---

## Environment Variables

### Required

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
SUPABASE_JWT_SECRET=your-jwt-secret

# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# OpenAI
OPENAI_API_KEY=sk-proj-...

# Security
JWT_SECRET=your-jwt-secret
NEXTAUTH_SECRET=your-nextauth-secret
MASTER_ENCRYPTION_KEY=base64-encoded-key
```

### Optional

```bash
# Feature Flags
ENABLE_AI_FEATURES=true
ENABLE_COMMUNITY_HUB=true
ENABLE_GAMIFICATION=true

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_...
```

---

## Engineering Philosophy

> "Every function must serve awareness; every API must deepen connection."

### Core Values

1. **Awareness-First Design** - Every interaction promotes insight
2. **Data Sovereignty** - Users own their data completely
3. **Intentional Architecture** - Code structure mirrors life structure
4. **Agent Collaboration** - AI as partners, not overlords
5. **Ethical Foundation** - Privacy, security, autonomy are non-negotiable

### Coding Standards

- **TypeScript everywhere** - No implicit any types
- **Zod validation** - All API inputs validated
- **Conventional commits** - `type(scope): description`
- **Phoenix-themed naming** - Functions reflect transformation metaphor
- **Test-driven development** - Unit + E2E tests required

---

## Support & Community

- **GitHub Issues**: Bug reports and feature requests
- **Slack**: #engineering (general), #phoenix-agents (AI)
- **Linear**: Sprint planning and task tracking
- **Weekly Sync**: Engineering standup (Fridays)

---

## License

Proprietary - WisdomOS © 2025

---

**Document Version**: 1.0
**Last Updated**: 2025-10-28
**Maintained By**: WisdomOS Engineering Team

---

*"Every line of code is an act of creation. Create with wisdom."*
