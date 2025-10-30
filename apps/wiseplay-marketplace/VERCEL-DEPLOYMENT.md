# WisePlay Marketplace — Vercel Deployment Guide

## Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] **Production Database** (PostgreSQL) - Recommended: Neon, Supabase, or Railway
- [ ] **Stripe Account** with production keys
- [ ] **OAuth Apps** configured for production domain
- [ ] **Environment Variables** ready
- [ ] **Code committed** to Git repository

---

## Step 1: Prepare Production Environment

### 1.1 Production Database

**Recommended: Neon (Free Tier Available)**

1. Go to [neon.tech](https://neon.tech)
2. Create account and new project
3. Copy connection string: `postgresql://user:password@host.neon.tech/wiseplay`

**Alternative: Supabase**
1. Go to [supabase.com](https://supabase.com)
2. Create project
3. Get connection string from Settings → Database

### 1.2 Run Database Migrations

```bash
# Set production DATABASE_URL temporarily
export DATABASE_URL="postgresql://user:password@host.neon.tech/wiseplay"

# Run migrations
pnpm prisma migrate deploy

# Or push schema (development)
pnpm prisma db push
```

### 1.3 Stripe Production Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Switch to **Live mode** (toggle in top right)
3. Navigate to **Developers** → **API keys**
4. Copy:
   - Publishable key (`pk_live_...`)
   - Secret key (`sk_live_...`)

### 1.4 Update OAuth Redirect URLs

**Google Cloud Console:**
- Add: `https://your-app.vercel.app/api/auth/callback/google`

**GitHub OAuth:**
- Add: `https://your-app.vercel.app/api/auth/callback/github`

---

## Step 2: Deploy to Vercel

### Option A: Deploy via CLI (Recommended)

```bash
# Navigate to project
cd /Volumes/DevOPS\ 2025/01_DEVOPS_PLATFORM/wisdomOS\ 2026/apps/wiseplay-marketplace

# Login to Vercel (if not already)
vercel login

# Deploy (will prompt for configuration)
vercel

# Follow prompts:
# ? Set up and deploy? Yes
# ? Which scope? [Your account]
# ? Link to existing project? No
# ? What's your project's name? wiseplay-marketplace
# ? In which directory is your code located? ./
# ? Want to override settings? No

# This creates a preview deployment
```

### Option B: Deploy via Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import Git repository
3. Select: `wisdomOS 2026` repository
4. **Root Directory:** `apps/wiseplay-marketplace`
5. **Framework Preset:** Next.js
6. **Build Command:** `pnpm build`
7. **Install Command:** `pnpm install`
8. Click **Deploy**

---

## Step 3: Configure Environment Variables

After initial deployment, add environment variables:

### Via Vercel Dashboard

1. Go to your project → **Settings** → **Environment Variables**
2. Add each variable below for **Production**, **Preview**, and **Development**

### Required Variables

```env
# Database
DATABASE_URL=postgresql://user:password@host.neon.tech/wiseplay

# NextAuth
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=[Generate new with: openssl rand -base64 32]

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-google-secret

# GitHub OAuth
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret

# Stripe (LIVE KEYS - not test!)
STRIPE_SECRET_KEY=sk_live_51...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51...
STRIPE_WEBHOOK_SECRET=[Get from Stripe webhook setup - see below]

# Supabase (if using)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Application
NODE_ENV=production
```

### Via CLI

```bash
# Add environment variable
vercel env add DATABASE_URL production

# When prompted, paste the value
```

---

## Step 4: Set Up Stripe Webhooks

### 4.1 Create Webhook Endpoint

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click **Add endpoint**
3. **Endpoint URL:** `https://your-app.vercel.app/api/marketplace/payments/webhooks`
4. **Events to send:**
   - `payment_intent.succeeded`
   - `payment_intent.failed`
   - `payment_intent.canceled`
   - `charge.succeeded`
   - `charge.failed`
   - `charge.refunded`
   - `account.updated`
   - `payout.paid`
   - `payout.failed`
5. Click **Add endpoint**

### 4.2 Get Signing Secret

1. Click on the webhook you just created
2. **Reveal** the **Signing secret**
3. Copy the secret (starts with `whsec_`)
4. Add to Vercel environment variables:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   ```

### 4.3 Test Webhook

```bash
# Test webhook with Stripe CLI
stripe trigger payment_intent.succeeded --forward-to https://your-app.vercel.app/api/marketplace/payments/webhooks
```

---

## Step 5: Redeploy with Environment Variables

After adding all environment variables:

```bash
# Trigger new deployment
vercel --prod

# Or via dashboard: Deployments → Redeploy
```

---

## Step 6: Verify Deployment

### 6.1 Check Deployment Status

```bash
# Check recent deployments
vercel ls

# Check logs
vercel logs [deployment-url]
```

### 6.2 Test Critical Flows

**Landing Page:**
- Visit: `https://your-app.vercel.app`
- Should load without errors

**Authentication:**
- Click "Sign In"
- Test Google OAuth
- Test GitHub OAuth
- Should redirect properly

**Database Connection:**
- Check Vercel logs for database errors
- No connection errors should appear

**Stripe Webhook:**
- Trigger test payment intent
- Check webhook received in Stripe Dashboard

---

## Step 7: Custom Domain (Optional)

### 7.1 Add Custom Domain

1. Go to project → **Settings** → **Domains**
2. Click **Add**
3. Enter your domain: `wiseplay.com`
4. Click **Add**

### 7.2 Update DNS Records

Vercel will show DNS records to add:

**For root domain (wiseplay.com):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 7.3 Update Environment Variables

After domain is verified:
```env
NEXTAUTH_URL=https://wiseplay.com
```

Update OAuth redirect URLs:
- Google: `https://wiseplay.com/api/auth/callback/google`
- GitHub: `https://wiseplay.com/api/auth/callback/github`

Update Stripe webhook URL:
- `https://wiseplay.com/api/marketplace/payments/webhooks`

Redeploy: `vercel --prod`

---

## Troubleshooting

### Issue: "Missing environment variable"

**Solution:**
- Check all required variables are set in Vercel Dashboard
- Ensure variables are set for **Production** environment
- Redeploy after adding variables

### Issue: "Database connection failed"

**Solution:**
```bash
# Test connection locally
psql "postgresql://user:password@host.neon.tech/wiseplay"

# If works locally, check Vercel environment variable
# Ensure DATABASE_URL is correctly set
```

### Issue: "OAuth callback URL mismatch"

**Solution:**
- Verify OAuth provider settings match exactly:
  - Google: `https://your-app.vercel.app/api/auth/callback/google`
  - GitHub: `https://your-app.vercel.app/api/auth/callback/github`
- No trailing slashes
- Correct domain

### Issue: "Stripe webhook signature verification failed"

**Solution:**
- Verify `STRIPE_WEBHOOK_SECRET` matches webhook signing secret
- Ensure webhook endpoint URL is correct
- Check webhook is in "Live mode" (not test mode)

### Issue: "Build failed"

**Solution:**
```bash
# Test build locally
pnpm build

# Check build logs in Vercel
# Common issues:
# - TypeScript errors
# - Missing environment variables at build time
# - Dependency issues
```

---

## Monitoring & Maintenance

### Enable Vercel Analytics

1. Go to project → **Analytics**
2. Click **Enable**
3. Monitor:
   - Page views
   - Response times
   - Error rates

### Set Up Error Tracking

**Sentry Integration:**
```bash
pnpm add @sentry/nextjs

# Follow Sentry setup wizard
npx @sentry/wizard@latest -i nextjs
```

### Database Backups

**Neon:**
- Automatic daily backups included
- Manual backups: Dashboard → Backups

**Supabase:**
- Automatic daily backups included
- Manual backups: Dashboard → Database → Backups

### Stripe Webhook Monitoring

- Dashboard → Webhooks → [Your endpoint]
- Monitor success/failure rates
- View webhook logs

---

## Performance Optimization

### Enable Edge Functions (Optional)

Create `middleware.ts` for edge runtime:
```typescript
export const config = {
  matcher: [
    '/api/marketplace/:path*',
  ],
};
```

### Enable ISR (Incremental Static Regeneration)

For service listings:
```typescript
// app/marketplace/page.tsx
export const revalidate = 60; // Revalidate every 60 seconds
```

### Image Optimization

Ensure images use Next.js Image component:
```typescript
import Image from 'next/image';

<Image src="/image.jpg" alt="..." width={500} height={300} />
```

---

## Rollback Plan

### Rollback to Previous Deployment

```bash
# List deployments
vercel ls

# Promote previous deployment to production
vercel promote [previous-deployment-url] --prod
```

### Via Dashboard

1. Go to **Deployments**
2. Find previous successful deployment
3. Click **⋯** → **Promote to Production**

---

## Production Checklist

Before going live:

- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] Stripe webhooks configured and tested
- [ ] OAuth providers updated with production URLs
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active (automatic with Vercel)
- [ ] Error tracking enabled (Sentry)
- [ ] Analytics enabled
- [ ] Database backups configured
- [ ] Payment flow tested end-to-end
- [ ] Email notifications tested
- [ ] Tested on multiple devices/browsers
- [ ] Performance audit completed (Lighthouse)
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Monitoring alerts configured

---

## Useful Commands

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# View recent deployments
vercel ls

# Add environment variable
vercel env add VARIABLE_NAME production

# List environment variables
vercel env ls

# Remove deployment
vercel rm [deployment-url]

# Check project info
vercel inspect
```

---

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Neon Documentation](https://neon.tech/docs)
- [Supabase Documentation](https://supabase.com/docs)

---

**Deployment Ready!** Follow the steps above to deploy WisePlay Marketplace to production.

**Last Updated:** October 30, 2025
