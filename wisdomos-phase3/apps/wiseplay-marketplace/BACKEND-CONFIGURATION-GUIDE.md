# WisePlay Marketplace - Backend Configuration Guide

**Date:** October 30, 2025
**Status:** Production Deployment Ready
**Purpose:** Configure backend services for production deployment

---

## Overview

Your WisePlay Marketplace is deployed to Vercel, but needs backend configuration to function with real data. This guide walks you through:

1. ✅ Setting up Neon PostgreSQL database
2. ✅ Configuring environment variables in Vercel
3. ✅ Setting up OAuth providers (Google & GitHub)
4. ✅ Configuring Stripe for payments
5. ✅ Testing the complete setup

**Estimated Time:** 30-45 minutes

---

## Prerequisites

Before starting, have these accounts ready:
- [ ] Vercel account (you already have this)
- [ ] Neon account (free tier available)
- [ ] Google Cloud account (for OAuth)
- [ ] GitHub account (for OAuth)
- [ ] Stripe account (test mode works)

---

## Step 1: Set Up Neon PostgreSQL Database

### 1.1 Create Neon Account & Project

1. **Go to Neon:** https://neon.tech
2. **Sign up** with GitHub (recommended) or email
3. **Create a new project:**
   - Name: `wiseplay-marketplace-prod`
   - Region: Choose closest to your users (e.g., US East)
   - Postgres version: 15 (default)
   - Click "Create Project"

### 1.2 Get Database Connection String

1. In your Neon dashboard, click on your project
2. Click **"Connection Details"**
3. Select **"Pooled connection"** (recommended for serverless)
4. Copy the connection string - it looks like:
   ```
   postgresql://username:password@ep-xxxx-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
5. **Save this** - you'll need it for environment variables

### 1.3 Initialize Database Schema

**Option A: Using Prisma CLI (Recommended)**

```bash
# Set the DATABASE_URL temporarily
export DATABASE_URL="postgresql://username:password@ep-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Push schema to database
cd "/Volumes/DevOPS 2025/01_DEVOPS_PLATFORM/wisdomOS 2026/apps/wiseplay-marketplace"
pnpm prisma db push

# Verify it worked
pnpm prisma studio
# This opens a GUI where you can see your empty tables
```

**Option B: Using Neon SQL Editor**

1. In Neon dashboard, click **"SQL Editor"**
2. Copy the entire schema from `prisma/schema.prisma`
3. Convert to SQL (Prisma will do this automatically with `db push`)

**Expected Output:**
```
✔ Database synchronized with Prisma schema
✔ Created 14 tables
```

---

## Step 2: Configure Environment Variables in Vercel

### 2.1 Access Vercel Project Settings

1. Go to: https://vercel.com/axaiinovation/wiseplay-marketplace
2. Click **"Settings"** tab
3. Click **"Environment Variables"** in sidebar

### 2.2 Add Required Variables

Add these variables for **Production**, **Preview**, and **Development**:

#### Database
```env
DATABASE_URL=postgresql://username:password@ep-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```
💡 Use the connection string from Step 1.2

#### Authentication
```env
NEXTAUTH_URL=https://wiseplay-marketplace-4q3qhcabz-axaiinovation.vercel.app
NEXTAUTH_SECRET=<generate-using-command-below>
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
# Copy the output and paste as NEXTAUTH_SECRET
```

#### Google OAuth (Step 3 - come back after setup)
```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-secret-here
```

#### GitHub OAuth (Step 3 - come back after setup)
```env
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-secret
```

#### Stripe (Step 4 - come back after setup)
```env
STRIPE_SECRET_KEY=sk_test_xxx (or sk_live_xxx for production)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx (or pk_live_xxx)
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

#### Supabase (Optional - for file storage)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 2.3 Save and Redeploy

After adding variables:
1. Click **"Save"**
2. Go to **"Deployments"** tab
3. Find latest deployment
4. Click **"..."** → **"Redeploy"**
5. Wait for deployment to complete

---

## Step 3: Set Up OAuth Providers

### 3.1 Google OAuth Setup

#### Create OAuth Credentials

1. **Go to:** https://console.cloud.google.com
2. **Select or create a project** (e.g., "WisePlay Marketplace")
3. **Enable APIs:**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" → Enable
4. **Create Credentials:**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: **Web application**
   - Name: `WisePlay Marketplace Production`

#### Configure Authorized URLs

**Authorized JavaScript origins:**
```
https://wiseplay-marketplace-4q3qhcabz-axaiinovation.vercel.app
```

**Authorized redirect URIs:**
```
https://wiseplay-marketplace-4q3qhcabz-axaiinovation.vercel.app/api/auth/callback/google
```

5. **Click "Create"**
6. **Copy the Client ID and Client Secret**
7. **Add to Vercel environment variables** (Step 2.2)

#### OAuth Consent Screen

1. Go to "OAuth consent screen"
2. User Type: **External**
3. Fill in app information:
   - App name: `WisePlay Marketplace`
   - User support email: Your email
   - Developer contact: Your email
4. Scopes: Default (email, profile)
5. Test users: Add your email for testing
6. Click "Save and Continue"

### 3.2 GitHub OAuth Setup

#### Create OAuth App

1. **Go to:** https://github.com/settings/developers
2. **Click "OAuth Apps"** → "New OAuth App"
3. **Fill in details:**
   - Application name: `WisePlay Marketplace Production`
   - Homepage URL: `https://wiseplay-marketplace-4q3qhcabz-axaiinovation.vercel.app`
   - Authorization callback URL: `https://wiseplay-marketplace-4q3qhcabz-axaiinovation.vercel.app/api/auth/callback/github`
4. **Click "Register application"**
5. **Generate client secret:**
   - Click "Generate a new client secret"
   - Copy the Client ID and Client Secret
6. **Add to Vercel environment variables** (Step 2.2)

---

## Step 4: Configure Stripe

### 4.1 Get Stripe Keys

#### For Testing (Recommended First)

1. **Go to:** https://dashboard.stripe.com/test/dashboard
2. **Click "Developers"** → "API keys"
3. **Copy:**
   - Publishable key: `pk_test_xxx`
   - Secret key: `sk_test_xxx` (click "Reveal")
4. **Add to Vercel environment variables** (Step 2.2)

#### For Production (Later)

1. Go to: https://dashboard.stripe.com/dashboard
2. Same process, but use `sk_live_xxx` and `pk_live_xxx`

### 4.2 Set Up Stripe Connect

Your marketplace uses Stripe Connect for payouts to providers.

1. **Go to:** https://dashboard.stripe.com/test/connect/accounts/overview
2. **Enable Connect:**
   - Click "Get started"
   - Platform type: **Platform or marketplace**
   - Click "Continue"
3. **Configure settings:**
   - Dashboard → Settings → Connect
   - Brand icon: Upload logo (optional)
   - Support email: Your email
   - Click "Save"

### 4.3 Configure Webhooks

Webhooks notify your app about payment events.

1. **Go to:** https://dashboard.stripe.com/test/webhooks
2. **Click "Add endpoint"**
3. **Endpoint URL:**
   ```
   https://wiseplay-marketplace-4q3qhcabz-axaiinovation.vercel.app/api/marketplace/payments/webhooks
   ```
4. **Select events to listen to:**
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.succeeded`
   - `charge.failed`
   - `account.updated`
   - `payout.paid`
   - `payout.failed`

5. **Click "Add endpoint"**
6. **Copy the Signing Secret:** `whsec_xxx`
7. **Add to Vercel as `STRIPE_WEBHOOK_SECRET`** (Step 2.2)

### 4.4 Test Webhook

```bash
# Install Stripe CLI (if not already installed)
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local (for testing)
stripe listen --forward-to localhost:3012/api/marketplace/payments/webhooks

# In another terminal, trigger a test event
stripe trigger payment_intent.succeeded
```

---

## Step 5: Final Configuration & Testing

### 5.1 Verify All Environment Variables

**Checklist - All variables added to Vercel:**
- [ ] DATABASE_URL
- [ ] NEXTAUTH_URL
- [ ] NEXTAUTH_SECRET
- [ ] GOOGLE_CLIENT_ID
- [ ] GOOGLE_CLIENT_SECRET
- [ ] GITHUB_ID
- [ ] GITHUB_SECRET
- [ ] STRIPE_SECRET_KEY
- [ ] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- [ ] STRIPE_WEBHOOK_SECRET

### 5.2 Redeploy Application

```bash
cd "/Volumes/DevOPS 2025/01_DEVOPS_PLATFORM/wisdomOS 2026/apps/wiseplay-marketplace"
vercel --prod
```

Wait for deployment to complete (~30 seconds).

### 5.3 Seed Test Data

#### Option A: Manual via Prisma Studio

```bash
# Set DATABASE_URL
export DATABASE_URL="your-neon-connection-string"

# Open Prisma Studio
pnpm prisma studio

# Manually create test data:
# 1. Create a User
# 2. Create a Category
# 3. Create a Provider (linked to User)
# 4. Create a Service (linked to Provider & Category)
```

#### Option B: Seed Script (Recommended)

Create `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create test user
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test Provider',
      image: null,
    },
  });

  // Create provider
  const provider = await prisma.provider.create({
    data: {
      userId: user.id,
      displayName: 'Test Provider',
      bio: 'Experienced Landmark leader offering breakthrough coaching.',
      location: 'San Francisco, CA',
      isVerified: true,
    },
  });

  // Create categories
  const category = await prisma.category.create({
    data: {
      name: 'Coaching',
      slug: 'coaching',
      icon: '🎯',
      description: 'One-on-one breakthrough coaching sessions',
    },
  });

  // Create service
  await prisma.service.create({
    data: {
      providerId: provider.id,
      categoryId: category.id,
      title: 'Breakthrough Coaching Session',
      description: 'Transform your relationship to what\'s possible in a powerful 1-hour coaching session.',
      price: 150,
      priceType: 'PER_SESSION',
      deliveryTime: '1 hour session',
      location: 'Online (Zoom)',
      status: 'ACTIVE',
      imageUrl: null,
      whatIsIncluded: '- 1 hour of focused coaching\n- Follow-up action plan\n- Email support for 1 week',
      requirements: 'Open mind and commitment to breakthrough',
    },
  });

  console.log('✅ Seed data created!');
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

Run the seed:
```bash
export DATABASE_URL="your-neon-connection-string"
pnpm tsx prisma/seed.ts
```

### 5.4 Test Production Site

Visit your production URL: https://wiseplay-marketplace-4q3qhcabz-axaiinovation.vercel.app

**Test each feature:**

1. **Landing Page** (`/marketplace`)
   - [ ] Page loads without errors
   - [ ] Hero section displays
   - [ ] Categories show (if seeded)

2. **Service List** (`/marketplace/services`)
   - [ ] Services display (if seeded)
   - [ ] Filters work (search, category, price)
   - [ ] Pagination works
   - [ ] Sort options work

3. **Service Detail** (`/marketplace/services/[id]`)
   - [ ] Service info displays
   - [ ] Provider card shows
   - [ ] Reviews display (if seeded)
   - [ ] Book Now button appears

4. **Provider Profile** (`/marketplace/providers/[id]`)
   - [ ] Provider info displays
   - [ ] Services list shows
   - [ ] Stats are accurate

5. **Authentication**
   - [ ] Click "Sign In"
   - [ ] Google OAuth works
   - [ ] GitHub OAuth works
   - [ ] Session persists

---

## Step 6: Monitoring & Debugging

### 6.1 Check Vercel Logs

1. Go to: https://vercel.com/axaiinovation/wiseplay-marketplace
2. Click **"Logs"** tab
3. Filter by **"Production"**
4. Look for errors

**Common issues:**
- `DATABASE_URL not set` → Add to environment variables
- `OAuth redirect mismatch` → Check redirect URLs in OAuth apps
- `Prisma connection error` → Verify database connection string

### 6.2 Check Database

```bash
# Open Prisma Studio
export DATABASE_URL="your-neon-connection-string"
pnpm prisma studio

# Verify tables exist:
# - User, Provider, Service, Category, etc.
```

### 6.3 Check Neon Dashboard

1. Go to: https://console.neon.tech
2. Select your project
3. Click **"Monitoring"**
4. Check connection count and queries

---

## Step 7: Security & Best Practices

### 7.1 Database Security

✅ **Neon automatically provides:**
- SSL connections (`sslmode=require`)
- Connection pooling
- IP allowlisting (optional)

**Recommended:**
- Enable **IP allowlist** in Neon (Settings → IP Allow)
- Add Vercel's IP ranges (if needed)

### 7.2 Environment Variables

✅ **Do:**
- Use different secrets for production vs preview
- Rotate secrets every 90 days
- Use Vercel's encrypted storage

❌ **Don't:**
- Commit `.env` files to git
- Share secrets in Slack/email
- Use same database for dev and prod

### 7.3 OAuth Security

✅ **Do:**
- Use separate OAuth apps for production vs development
- Verify redirect URIs match exactly
- Keep client secrets secure

### 7.4 Stripe Security

✅ **Do:**
- Use test mode for development
- Verify webhook signatures
- Use Stripe Connect for marketplace
- Enable 3D Secure for payments

❌ **Don't:**
- Store raw card details
- Skip webhook verification
- Use live keys in development

---

## Troubleshooting

### Issue: Pages Load But No Data

**Cause:** Database not seeded or DATABASE_URL not set

**Fix:**
1. Check Vercel environment variables
2. Redeploy after adding DATABASE_URL
3. Seed database with test data

### Issue: OAuth "Redirect URI Mismatch"

**Cause:** OAuth redirect URLs don't match production URL

**Fix:**
1. Check production URL in Vercel
2. Update Google/GitHub OAuth settings
3. Ensure URLs match exactly (no trailing slash)

### Issue: Stripe Webhook Not Working

**Cause:** Webhook secret not set or endpoint URL wrong

**Fix:**
1. Check STRIPE_WEBHOOK_SECRET in Vercel
2. Verify webhook endpoint URL in Stripe
3. Check Vercel logs for webhook errors

### Issue: Database Connection Timeout

**Cause:** Wrong connection string or Neon suspended

**Fix:**
1. Check connection string format
2. Verify Neon project is active (free tier suspends after 7 days inactivity)
3. Use pooled connection string

---

## Quick Reference

### All Required URLs

**Production App:**
```
https://wiseplay-marketplace-4q3qhcabz-axaiinovation.vercel.app
```

**OAuth Callbacks:**
```
https://wiseplay-marketplace-4q3qhcabz-axaiinovation.vercel.app/api/auth/callback/google
https://wiseplay-marketplace-4q3qhcabz-axaiinovation.vercel.app/api/auth/callback/github
```

**Stripe Webhook:**
```
https://wiseplay-marketplace-4q3qhcabz-axaiinovation.vercel.app/api/marketplace/payments/webhooks
```

### Key Commands

```bash
# Set DATABASE_URL
export DATABASE_URL="postgresql://..."

# Push schema to database
pnpm prisma db push

# Open Prisma Studio
pnpm prisma studio

# Seed database
pnpm tsx prisma/seed.ts

# Deploy to production
vercel --prod

# View logs
vercel logs production
```

---

## Next Steps After Configuration

Once backend is configured:

1. **Test All Features:**
   - Sign up / sign in
   - Browse services
   - View service details
   - View provider profiles

2. **Build Phase 2 (Booking Flow):**
   - Booking form
   - Payment integration
   - Confirmation pages

3. **Add More Test Data:**
   - More services
   - Categories
   - Reviews
   - Bookings

4. **Optimize Performance:**
   - Add caching
   - Image optimization
   - Database query optimization

---

## Support Resources

### Documentation
- **Neon Docs:** https://neon.tech/docs
- **Vercel Docs:** https://vercel.com/docs
- **Prisma Docs:** https://www.prisma.io/docs
- **NextAuth Docs:** https://next-auth.js.org/getting-started
- **Stripe Docs:** https://stripe.com/docs

### Need Help?
- Check Vercel logs first
- Review Neon monitoring
- Check this guide's troubleshooting section
- Review existing documentation in this repo

---

## Summary Checklist

Configuration complete when all checked:

**Database:**
- [ ] Neon account created
- [ ] Database project created
- [ ] Connection string obtained
- [ ] Schema pushed to database
- [ ] Test data seeded

**Vercel:**
- [ ] All environment variables added
- [ ] Application redeployed
- [ ] No errors in logs
- [ ] Pages loading correctly

**OAuth:**
- [ ] Google OAuth app created
- [ ] Google redirect URLs configured
- [ ] GitHub OAuth app created
- [ ] GitHub redirect URLs configured
- [ ] Authentication working

**Stripe:**
- [ ] Stripe account set up
- [ ] API keys obtained
- [ ] Stripe Connect enabled
- [ ] Webhook endpoint created
- [ ] Webhook secret added to Vercel

**Testing:**
- [ ] All pages load without errors
- [ ] Test data displays correctly
- [ ] Authentication works
- [ ] Database queries successful

---

**Status:** Ready to configure! Follow steps 1-7 above.
**Time Required:** 30-45 minutes
**Difficulty:** Intermediate

🚀 **Let's get your backend configured!**
