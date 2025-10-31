# WisePlay Marketplace — Development Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+** or **Bun**
- **pnpm** (recommended) or npm
- **PostgreSQL 14+** database
- **Git** for version control
- **Stripe CLI** (for webhook testing)
- Code editor (VS Code recommended)

Optional but recommended:
- **Docker** (for containerized PostgreSQL)
- **Postman** or **Insomnia** (for API testing)
- **Prisma Studio** (included with Prisma)

---

## Step-by-Step Setup

### 1. Clone and Navigate

```bash
# If not already in the wisdomOS monorepo
cd /Volumes/DevOPS\ 2025/01_DEVOPS_PLATFORM/wisdomOS\ 2026/apps/wiseplay-marketplace
```

### 2. Install Dependencies

```bash
pnpm install
# or
npm install
```

**Expected output:**
```
Installing dependencies...
✓ All dependencies installed successfully
```

### 3. Database Setup

#### Option A: Local PostgreSQL

If you have PostgreSQL installed locally:

```bash
# Create database
psql postgres
CREATE DATABASE wiseplay;
CREATE USER wiseplay_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE wiseplay TO wiseplay_user;
\q
```

#### Option B: Docker PostgreSQL

```bash
# Run PostgreSQL in Docker
docker run --name wiseplay-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=wiseplay \
  -p 5432:5432 \
  -d postgres:14

# Verify it's running
docker ps
```

#### Option C: Cloud PostgreSQL

Use a managed PostgreSQL service:
- **Supabase** (free tier available)
- **Neon** (serverless PostgreSQL)
- **Railway** (free tier)
- **Render** (free tier)

Get connection string from your provider.

### 4. Environment Variables

```bash
# Copy example environment file
cp .env.example .env.local
```

Now edit `.env.local`:

```env
# ============================================
# DATABASE
# ============================================
DATABASE_URL="postgresql://wiseplay_user:your_secure_password@localhost:5432/wiseplay?schema=public"
# Or for Docker: postgresql://postgres:postgres@localhost:5432/wiseplay

# ============================================
# NEXTAUTH
# ============================================
NEXTAUTH_URL="http://localhost:3012"
NEXTAUTH_SECRET="generate_this_with_openssl"  # See below for generation

# ============================================
# OAUTH PROVIDERS
# ============================================
# Google OAuth (see setup instructions below)
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-your-google-secret"

# GitHub OAuth (see setup instructions below)
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"

# ============================================
# STRIPE
# ============================================
# Get these from https://dashboard.stripe.com/test/apikeys
STRIPE_SECRET_KEY="sk_test_51..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_51..."
STRIPE_WEBHOOK_SECRET="whsec_..."  # Get from Stripe CLI (see below)

# ============================================
# SUPABASE (Optional - for file storage)
# ============================================
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# ============================================
# APP CONFIG
# ============================================
NODE_ENV="development"
```

#### Generate NEXTAUTH_SECRET

```bash
openssl rand -base64 32
# Output: FqG8h2K3m5N6p8Q9r1S3t5U7v9W1x3Y5z7A9b1C3d5E7

# Add to .env.local
NEXTAUTH_SECRET="FqG8h2K3m5N6p8Q9r1S3t5U7v9W1x3Y5z7A9b1C3d5E7"
```

### 5. OAuth Provider Setup

#### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Application type: **Web application**
6. **Authorized JavaScript origins:**
   - `http://localhost:3012`
7. **Authorized redirect URIs:**
   - `http://localhost:3012/api/auth/callback/google`
8. Click **Create**
9. Copy **Client ID** and **Client Secret** to `.env.local`

#### GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in:
   - **Application name:** WisePlay Marketplace (Local)
   - **Homepage URL:** `http://localhost:3012`
   - **Authorization callback URL:** `http://localhost:3012/api/auth/callback/github`
4. Click **Register application**
5. Click **Generate a new client secret**
6. Copy **Client ID** and **Client Secret** to `.env.local`

### 6. Stripe Setup

#### Create Stripe Account

1. Go to [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Sign up for a free account
3. Switch to **Test mode** (toggle in top right)

#### Get API Keys

1. Navigate to **Developers** → **API keys**
2. Copy:
   - **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - **Secret key** → `STRIPE_SECRET_KEY`

#### Install Stripe CLI

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Other OS: https://stripe.com/docs/stripe-cli
```

#### Login to Stripe CLI

```bash
stripe login
# Opens browser to authenticate
```

#### Get Webhook Secret

```bash
# This will forward webhooks to your local server
stripe listen --forward-to localhost:3012/api/marketplace/payments/webhooks

# Output:
# Ready! Your webhook signing secret is whsec_xxxxx
# Copy this secret to .env.local as STRIPE_WEBHOOK_SECRET
```

**Keep this terminal window open** while developing. Stripe will forward webhook events to your local server.

### 7. Initialize Database

```bash
# Generate Prisma client
pnpm db:generate

# Push schema to database (creates tables)
pnpm db:push
```

**Expected output:**
```
Environment variables loaded from .env.local
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "wiseplay"

Your database is now in sync with your Prisma schema. Done in 2.1s

✔ Generated Prisma Client
```

### 8. (Optional) Seed Database

Create a seed script to add sample data:

```bash
# Create seed file
touch prisma/seed.ts
```

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create categories
  const mathCategory = await prisma.serviceCategory.create({
    data: {
      name: 'Mathematics',
      slug: 'mathematics',
      description: 'Math tutoring and lessons',
    },
  });

  const scienceCategory = await prisma.serviceCategory.create({
    data: {
      name: 'Science',
      slug: 'science',
      description: 'Science tutoring and experiments',
    },
  });

  // Create tags
  await prisma.serviceTag.createMany({
    data: [
      { name: 'Beginner Friendly', slug: 'beginner-friendly' },
      { name: '1-on-1', slug: '1-on-1' },
      { name: 'Group Class', slug: 'group-class' },
      { name: 'Certification', slug: 'certification' },
    ],
  });

  console.log('✓ Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Add to `package.json`:
```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

Run seed:
```bash
pnpm prisma db seed
```

### 9. Start Development Server

```bash
pnpm dev
```

**Expected output:**
```
  ▲ Next.js 14.2.18
  - Local:        http://localhost:3012
  - Environments: .env.local

 ✓ Ready in 1.5s
```

Open browser to [http://localhost:3012](http://localhost:3012)

### 10. Verify Setup

#### Test Landing Page
- Navigate to `http://localhost:3012`
- Should see WisePlay landing page

#### Test Authentication
- Click **Sign In**
- Try Google or GitHub OAuth
- Should redirect to provider and back

#### Test Database
- Open Prisma Studio:
  ```bash
  pnpm db:studio
  ```
- Navigate to `http://localhost:5555`
- Should see database tables

#### Test Stripe Webhooks
- In terminal with Stripe CLI, you should see:
  ```
  2024-10-30 12:34:56   --> payment_intent.created [evt_test_xxx]
  2024-10-30 12:34:57   <-- [200] POST http://localhost:3012/api/marketplace/payments/webhooks
  ```

---

## Common Setup Issues

### Issue: "Can't reach database server"

**Solution:**
```bash
# Check PostgreSQL is running
docker ps  # If using Docker
# or
pg_isready  # If local install

# Verify DATABASE_URL in .env.local
# Ensure host, port, username, password are correct
```

### Issue: "Missing environment variable"

**Solution:**
```bash
# Ensure .env.local exists
ls -la .env.local

# Check all required variables are set
cat .env.local | grep -E "DATABASE_URL|NEXTAUTH_SECRET|STRIPE"
```

### Issue: "Prisma Client not generated"

**Solution:**
```bash
pnpm db:generate
```

### Issue: "Port 3012 already in use"

**Solution:**
```bash
# Find process using port 3012
lsof -i :3012

# Kill the process
kill -9 <PID>

# Or change port in package.json
# "dev": "next dev -p 3013"
```

### Issue: "OAuth callback URL mismatch"

**Solution:**
- Check OAuth provider settings
- Ensure callback URL matches: `http://localhost:3012/api/auth/callback/{provider}`
- For Google: Exactly `http://localhost:3012/api/auth/callback/google`
- For GitHub: Exactly `http://localhost:3012/api/auth/callback/github`

### Issue: "Stripe webhook signature verification failed"

**Solution:**
```bash
# Restart Stripe CLI listener
stripe listen --forward-to localhost:3012/api/marketplace/payments/webhooks

# Copy new webhook secret to .env.local
```

---

## Development Workflow

### Daily Workflow

1. **Start services:**
   ```bash
   # Terminal 1: PostgreSQL (if using Docker)
   docker start wiseplay-db

   # Terminal 2: Stripe CLI
   stripe listen --forward-to localhost:3012/api/marketplace/payments/webhooks

   # Terminal 3: Next.js dev server
   pnpm dev
   ```

2. **Make changes to code**
   - Edit files
   - Next.js hot-reloads automatically

3. **If database schema changes:**
   ```bash
   # Push changes to database
   pnpm db:push

   # Or create migration (for production)
   pnpm db:migrate
   ```

4. **Run type checking:**
   ```bash
   pnpm type-check
   ```

5. **Run linter:**
   ```bash
   pnpm lint
   ```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/add-booking-page

# Make changes, commit
git add .
git commit -m "feat: add booking page UI"

# Push to remote
git push origin feature/add-booking-page

# Create pull request on GitHub
```

### Database Workflow

#### View Data (Prisma Studio)
```bash
pnpm db:studio
# Opens http://localhost:5555
```

#### Reset Database (Careful!)
```bash
# Drops all tables and re-creates
pnpm db:push --force-reset

# Then re-seed if needed
pnpm prisma db seed
```

#### Create Migration (For Production)
```bash
# After schema changes in schema.prisma
pnpm db:migrate

# Name migration when prompted
# Example: "add_service_ratings"
```

---

## VS Code Setup (Recommended)

### Extensions

Install these extensions for best development experience:

1. **ESLint** (`dbaeumer.vscode-eslint`)
2. **Prettier** (`esbenp.prettier-vscode`)
3. **Prisma** (`Prisma.prisma`)
4. **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`)
5. **TypeScript Error Translator** (`mattpocock.ts-error-translator`)

### Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "[prisma]": {
    "editor.defaultFormatter": "Prisma.prisma"
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

### Launch Configuration

Create `.vscode/launch.json` for debugging:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "pnpm dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3012"
    }
  ]
}
```

---

## Testing Setup

### Unit Tests (Jest + Testing Library)

```bash
# Install testing dependencies
pnpm add -D jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom
```

Create `jest.config.js`:
```javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};

module.exports = createJestConfig(customJestConfig);
```

### E2E Tests (Playwright)

```bash
# Install Playwright
pnpm create playwright

# Run tests
pnpm playwright test
```

---

## Production Deployment Checklist

Before deploying to production:

- [ ] Set `NODE_ENV=production` in environment
- [ ] Use production database (not development DB)
- [ ] Run database migrations: `pnpm prisma migrate deploy`
- [ ] Use real Stripe keys (not test keys)
- [ ] Set secure `NEXTAUTH_SECRET` (different from dev)
- [ ] Update OAuth callback URLs to production domain
- [ ] Set up Stripe webhook endpoint (production URL)
- [ ] Enable HTTPS (required for OAuth and Stripe)
- [ ] Set up error monitoring (Sentry)
- [ ] Set up logging (Winston, Pino)
- [ ] Set up analytics (Google Analytics, Plausible)
- [ ] Test payment flow end-to-end
- [ ] Test email notifications
- [ ] Set up automated backups for database

---

## Useful Commands Reference

```bash
# Development
pnpm dev                # Start dev server
pnpm build              # Build for production
pnpm start              # Start production server
pnpm lint               # Run ESLint
pnpm type-check         # TypeScript checks

# Database
pnpm db:generate        # Generate Prisma client
pnpm db:push            # Push schema to DB (dev)
pnpm db:migrate         # Create migration (prod)
pnpm db:studio          # Open Prisma Studio
pnpm prisma db seed     # Seed database

# Stripe
stripe login            # Authenticate Stripe CLI
stripe listen --forward-to localhost:3012/api/marketplace/payments/webhooks
stripe trigger payment_intent.succeeded  # Test webhook

# Docker
docker ps               # List running containers
docker start wiseplay-db   # Start PostgreSQL
docker stop wiseplay-db    # Stop PostgreSQL
docker logs wiseplay-db    # View logs
```

---

## Next Steps

After setup is complete:

1. **Review codebase:** Read [`CODEBASE-ANALYSIS.md`](./CODEBASE-ANALYSIS.md)
2. **Explore API:** Test endpoints with Postman/Insomnia
3. **Build features:** Start with marketplace browse page
4. **Add tests:** Write tests as you build
5. **Deploy:** Follow production deployment checklist

---

**Setup Complete!** You're ready to start developing WisePlay Marketplace.

For questions or issues, check:
- [`README.md`](./README.md) - Project overview
- [`CODEBASE-ANALYSIS.md`](./CODEBASE-ANALYSIS.md) - Detailed architecture docs
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Stripe Connect Documentation](https://stripe.com/docs/connect)

**Last Updated:** October 30, 2025
