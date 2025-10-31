# WisdomOS Quick Start Guide

Get WisdomOS running in under 5 minutes.

## Prerequisites

- Node.js 18 or higher
- pnpm (recommended) or npm
- Git

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/wisdomos.git
cd wisdomos

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Initialize database
pnpm db:init

# Start development servers
pnpm dev
```

## What Gets Started

The `pnpm dev` command starts all development servers in parallel:

- **Web App**: http://localhost:3011 (Next.js frontend)
- **API Server**: Auto-discovers available port (NestJS backend)
- **Database**: Connects to your configured Supabase instance

## First Time Setup

### 1. Database Configuration

Edit `.env.local` with your Supabase credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Database URL
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres
```

### 2. Run Database Migrations

```bash
# Generate Prisma client
pnpm db:generate

# Push schema to database
pnpm db:push

# Seed with demo data (optional)
pnpm db:seed:demo
```

### 3. Access the Application

Open http://localhost:3011 in your browser. You should see the Phoenix onboarding experience.

## Your First Phoenix Cycle

1. **Create an Account**: Complete the onboarding flow
2. **Assess Your Life Areas**: Review the 13 life dimensions
3. **Journal an Upset**: Start with the Ashes phase (reflection)
4. **Track Progress**: Watch your dashboard transform from red to green

## Common Commands

```bash
# Development
pnpm dev              # Start all services
pnpm web:dev          # Web app only
pnpm api:dev          # API server only
pnpm mobile:dev       # Mobile app only

# Building
pnpm build            # Build all packages and apps
pnpm lint             # Run linting

# Database
pnpm db:generate      # Generate Prisma client
pnpm db:push          # Push schema changes
pnpm db:migrate       # Run migrations
pnpm db:studio        # Open Prisma Studio

# Testing
pnpm test             # Run all tests
pnpm test:watch       # Run tests in watch mode
```

## Project Structure

```
wisdomos/
├── apps/
│   ├── web/          # Next.js web application
│   ├── api/          # NestJS API server
│   └── mobile/       # React Native mobile app
├── packages/
│   ├── database/     # Prisma schema and migrations
│   ├── ui/           # Shared UI components
│   ├── core/         # Business logic
│   └── types/        # TypeScript types
└── docs/             # Documentation (you are here)
```

## Need Help?

- **Installation Issues**: See [Installation Guide](./getting-started/installation.md)
- **Configuration**: See [Configuration Guide](./getting-started/configuration.md)
- **Development**: See [Development Guide](./guides/development/README.md)
- **FAQ**: See [Frequently Asked Questions](./getting-started/faq.md)

## Next Steps

- [Learn about the Phoenix Cycle](./features/phoenix-cycle.md)
- [Explore Life Areas](./features/life-areas.md)
- [Deploy to Production](./guides/deployment/README.md)
- [Set up Multi-Tenancy](./features/multi-tenancy.md)

---

**Ready to rise from the ashes?** Let's begin your transformation journey.
