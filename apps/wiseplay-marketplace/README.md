# WisePlay Marketplace

A Next.js 14 marketplace for educational games and learning experiences.

## Getting Started

### Prerequisites

- Node.js 18+ or pnpm
- PostgreSQL database
- Supabase account
- Stripe account

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
│   ├── (marketplace)/     # Main marketplace routes
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── marketplace/      # Marketplace-specific components
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
- **Styling**: TailwindCSS
- **UI Components**: Radix UI + shadcn/ui
- **Database**: PostgreSQL (Prisma ORM)
- **Auth**: NextAuth.js
- **Storage**: Supabase
- **Payments**: Stripe
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

## Features

### Phase 1 (Current)
- Landing page
- User authentication
- Game browsing
- Basic marketplace structure

### Phase 2 (Planned)
- Game purchasing
- Creator dashboard
- Payment processing
- File uploads

### Phase 3 (Future)
- Reviews and ratings
- User profiles
- Analytics dashboard
- Advanced search and filtering

## Environment Variables

See `.env.example` for all required environment variables.

## Contributing

This is part of the WisdomOS monorepo. Please follow the coding standards and commit message conventions.

## License

Proprietary - All rights reserved
