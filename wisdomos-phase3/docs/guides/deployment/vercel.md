# Vercel Deployment Guide

Deploy WisdomOS to Vercel in under 10 minutes.

## Prerequisites

- GitHub account with WisdomOS repository
- Vercel account (free tier works)
- Supabase database ready

## Quick Deploy

### Option 1: Deploy Button

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/wisdomos)

### Option 2: CLI Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel
```

## Step-by-Step Deployment

### 1. Import Repository

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Project"
3. Select your GitHub repository
4. Vercel will detect Next.js automatically

### 2. Configure Build Settings

Vercel auto-detects these, but verify:

- **Framework**: Next.js
- **Root Directory**: `./` (or `apps/web` if monorepo)
- **Build Command**: `pnpm build` (or custom command below)
- **Output Directory**: `.next`
- **Install Command**: `pnpm install`

For monorepo:
```bash
# Build Command
pnpm install && pnpm db:generate && pnpm --filter @wisdomos/web build

# Install Command
pnpm install --filter @wisdomos/web...
```

### 3. Add Environment Variables

Click "Environment Variables" and add:

#### Required Variables
```env
# Database
DATABASE_URL=postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Auth (generate: openssl rand -base64 32)
NEXTAUTH_SECRET=your-secret-key-minimum-32-characters

# Will be auto-set by Vercel, but can override:
# NEXTAUTH_URL=https://your-domain.vercel.app
```

#### Optional Variables
```env
# HubSpot
HUBSPOT_API_KEY=pat-na1-xxxxx
HUBSPOT_WEBHOOK_SECRET=your-secret

# Email
SENDGRID_API_KEY=SG.xxxxx

# Error Tracking
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx.ingest.sentry.io/xxxxx

# Analytics
NEXT_PUBLIC_GA4_ID=G-XXXXXXXXXX
```

### 4. Deploy

Click "Deploy" and wait 2-3 minutes.

Your app will be live at: `https://your-project.vercel.app`

## Deploying API Server

WisdomOS API (NestJS) can run on Vercel using serverless functions:

### 1. Create Separate Vercel Project

```bash
cd apps/api
vercel
```

### 2. Configure API Settings

**Build Command:**
```bash
pnpm install && pnpm build
```

**Output Directory:**
```bash
dist
```

### 3. Add API Environment Variables

```env
DATABASE_URL=postgresql://...
SUPABASE_SERVICE_KEY=...
JWT_SECRET=your-jwt-secret
CORS_ORIGINS=https://your-web-app.vercel.app
```

### 4. Update Web App API URL

In your web app environment variables:
```env
NEXT_PUBLIC_API_URL=https://your-api.vercel.app
```

## Custom Domain Setup

### 1. Add Domain in Vercel

1. Go to Project Settings → Domains
2. Add your domain: `yourdomain.com`
3. Add www variant: `www.yourdomain.com`

### 2. Configure DNS

In your domain registrar:

**Option A: Nameservers (Recommended)**
```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

**Option B: CNAME Record**
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
```

### 3. SSL Certificate

Vercel automatically provisions SSL. Wait 24-48 hours for DNS propagation.

## Multi-Tenancy with Wildcard Domains

For subdomains like `org.yourdomain.com`:

### 1. Add Wildcard Domain

In Vercel:
```
*.yourdomain.com
```

### 2. Configure DNS

```
Type: CNAME
Name: *
Value: cname.vercel-dns.com
```

### 3. Update Environment

```env
NEXT_PUBLIC_APP_DOMAIN=yourdomain.com
```

Vercel will automatically handle wildcard SSL.

## Environment Variable Management

### Add Variables via CLI

```bash
# Production
vercel env add HUBSPOT_API_KEY production

# Preview (staging)
vercel env add HUBSPOT_API_KEY preview

# Development (pulled locally)
vercel env add HUBSPOT_API_KEY development
```

### Pull Variables Locally

```bash
# Download environment variables
vercel env pull .env.local
```

### Update Existing Variables

```bash
vercel env rm VARIABLE_NAME production
vercel env add VARIABLE_NAME production
```

## Monorepo Configuration

For Turborepo monorepo setup:

### vercel.json (in root)

```json
{
  "buildCommand": "pnpm turbo run build --filter=@wisdomos/web",
  "installCommand": "pnpm install",
  "outputDirectory": "apps/web/.next",
  "framework": "nextjs",
  "cleanUrls": true,
  "trailingSlash": false
}
```

### Configure Workspace

In Vercel dashboard:
- **Root Directory**: `apps/web`
- **Build Command**: `cd ../.. && pnpm turbo run build --filter=@wisdomos/web`

## CI/CD with Vercel

Vercel auto-deploys on:

### Production Deployments
- Pushes to `main` branch
- Manual "Deploy to Production"

### Preview Deployments
- Pull requests automatically get preview URLs
- Every push to PR updates preview
- Comment in PR with deployment URL

### Branch Deployments
Configure in Project Settings → Git:
- Which branches trigger deployments
- Production branch
- Preview branch patterns

## Performance Optimization

### Enable Vercel Analytics

```bash
pnpm add @vercel/analytics

# Add to app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Enable Speed Insights

```bash
pnpm add @vercel/speed-insights

# Add to app/layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### Image Optimization

Vercel automatically optimizes images via Next.js Image component:

```tsx
import Image from 'next/image';

<Image
  src="/phoenix-logo.png"
  alt="Phoenix Logo"
  width={200}
  height={200}
  priority // for above-the-fold images
/>
```

## Monitoring & Logs

### View Logs

```bash
# Real-time logs
vercel logs your-deployment-url --follow

# Recent logs
vercel logs your-deployment-url
```

### Deployment Logs

In Vercel dashboard:
1. Go to Deployments
2. Click on deployment
3. View build and runtime logs

### Analytics Dashboard

View in Vercel dashboard:
- Page views
- Top pages
- Real user metrics
- Web Vitals scores

## Troubleshooting

### Build Fails with "Module not found"

```bash
# Ensure dependencies are in package.json dependencies (not devDependencies)
pnpm add <missing-package>
```

### "NEXTAUTH_SECRET" Error

Generate secret:
```bash
openssl rand -base64 32
```

Add to environment variables.

### Database Connection Fails

1. Check `DATABASE_URL` is correct
2. Verify Supabase allows connections from Vercel IPs
3. Use connection pooler URL (ends in `:6543`)

### API Routes Timeout

Vercel has 10s timeout on Hobby plan. Options:
1. Upgrade to Pro plan (60s timeout)
2. Optimize slow queries
3. Use background jobs for long tasks

### Environment Variables Not Loading

1. Redeploy after adding variables
2. Ensure variable names are correct (case-sensitive)
3. Check variable is set for correct environment (production/preview)

## Vercel-Specific Features

### Edge Functions

Convert API routes to edge functions:

```ts
// app/api/hello/route.ts
export const runtime = 'edge';

export async function GET() {
  return new Response('Hello from the Edge!');
}
```

### ISR (Incremental Static Regeneration)

```ts
// app/page.tsx
export const revalidate = 60; // Revalidate every 60 seconds

export default function Page() {
  return <div>This page regenerates every minute</div>;
}
```

### Preview Deployment URLs

Each PR gets unique URL like:
```
https://wisdomos-git-feature-branch.vercel.app
```

Share with team for testing.

## Cost Optimization

### Hobby Plan (Free)
- 100 GB bandwidth
- Unlimited deployments
- 10s serverless function duration
- Community support

### Pro Plan ($20/month per user)
- 1 TB bandwidth
- 60s function duration
- Advanced analytics
- Password protection
- Email support

### Enterprise
- Custom bandwidth
- 300s function duration
- SSO, advanced security
- Dedicated support

## Next Steps

After deployment:
1. ✅ Verify all pages load
2. ✅ Test authentication
3. ✅ Check database connectivity
4. ✅ Set up custom domain
5. ✅ Configure monitoring
6. ✅ Review [Production Checklist](./production-checklist.md)

---

**Deployed successfully?** Continue to [Production Checklist](./production-checklist.md) →
