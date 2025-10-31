# WisePlay

**Where Landmark Community Creates Possibility**

A Next.js 14 community hub for Landmark Education members to connect, contribute, and create breakthrough partnerships.

## About

WisePlay is a contribution platform designed to support the Landmark Education community in creating authentic partnerships, breakthrough conversations, and transformational collaborations. This is a space for community members to offer their unique contributions and find the support they need for their next level of transformation.

## Core Values

- **Authenticity**: Real connections, genuine contributions
- **Transformation**: Focus on breakthrough and possibility
- **Community**: Supporting each other's growth and leadership
- **Contribution**: Every offering makes a difference
- **Integrity**: Operating from commitment and enrollment

## Getting Started

### Prerequisites

- Node.js 18+ or pnpm
- PostgreSQL database
- Supabase account
- Stripe account (for community sustainability contributions)

### Installation

1. Install dependencies:

```bash
npm install
# or
pnpm install
```

2. Copy the environment variables:

```bash
cp .env.example .env.local
```

3. Update `.env.local` with your actual credentials:
   - Database URL (PostgreSQL)
   - NextAuth configuration
   - Supabase credentials
   - Stripe keys

4. Initialize the database:

```bash
npm run db:generate
npm run db:push
```

5. Run the development server:

```bash
npm run dev
```

The app will be available at [http://localhost:3012](http://localhost:3012)

## Project Structure

```
wiseplay-marketplace/
├── app/                    # Next.js 14 App Router
│   ├── (auth)/            # Authentication routes
│   ├── (marketplace)/     # Community hub routes
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── marketplace/      # Community-specific components
├── lib/                   # Utilities and configurations
│   ├── db.ts             # Prisma client
│   ├── supabase.ts       # Supabase client
│   ├── stripe.ts         # Stripe client
│   └── utils.ts          # Utility functions
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
├── prisma/               # Database schema
│   └── schema.prisma     # Prisma schema
└── public/               # Static assets
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS (Warm orange/amber/gold palette)
- **UI Components**: Radix UI + shadcn/ui
- **Database**: PostgreSQL (Prisma ORM)
- **Auth**: NextAuth.js
- **Storage**: Supabase
- **Payments**: Stripe (for community sustainability)
- **State Management**: Zustand
- **Form Handling**: React Hook Form
- **Validation**: Zod
- **Icons**: Lucide React

## Available Scripts

- `npm run dev` - Start development server (port 3012)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

## Community Categories

The platform supports various types of contributions and partnerships:

- **Breakthrough Coaching**: 1-on-1 sessions for creating breakthroughs
- **Accountability Partnerships**: Ongoing support and commitment partnerships
- **Leadership Development**: Course leader and introduction leader coaching
- **Group Programs**: Circles, workshops, and community gatherings
- **Project Collaborations**: Team up on community initiatives and projects
- **Skills Exchange**: Share knowledge and expertise
- **Wisdom Unlimited Projects**: Support for Self-Expression & Leadership Program participants

## Features

### Current Features
- Community-focused landing page
- Contribution hub (formerly marketplace)
- Member authentication
- Partnership browsing
- Warm, authentic design aligned with Landmark values

### Planned Features
- Enhanced booking and scheduling
- Community leader profiles
- Impact tracking and testimonials
- Advanced partnership matching
- Community event calendar

## Community Sustainability

The platform includes a 6% community sustainability contribution that supports:
- Platform development and maintenance
- Community resources and tools
- Technical support and infrastructure
- Future feature development

This is not a profit-driven fee - it's a contribution to keeping this community resource available and thriving.

## Environment Variables

See `.env.example` for all required environment variables.

## Contributing

This is part of the WisdomOS monorepo. Please follow the coding standards and commit message conventions.

When contributing, please keep the Landmark Education community values in mind:
- Use authentic, human-centered language
- Focus on transformation and possibility
- Avoid transactional or commercial tone
- Emphasize community and contribution

## License

Proprietary - All rights reserved
