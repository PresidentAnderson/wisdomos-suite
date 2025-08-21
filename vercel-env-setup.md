# Vercel Environment Variables Setup

## Required Environment Variables

Set these in the Vercel dashboard (Settings → Environment Variables):

### 1. DATABASE_URL
**Value:** [Your Supabase connection string]
**Example format:** `postgresql://postgres:[password]@[host]:5432/postgres?schema=public`
**Environment:** Production, Preview, Development

### 2. JWT_SECRET
**Value:** `wisdomos-production-secret-change-this-later-$(date +%s)`
**Environment:** Production, Preview, Development

### 3. NEXT_PUBLIC_APP_URL
**Value:** `https://wisdomos-bxyh1r2u1-axaiinovation.vercel.app`
**Environment:** Production
**Value:** `https://wisdomos-git-[branch-name]-axaiinovation.vercel.app` 
**Environment:** Preview
**Value:** `http://localhost:3000`
**Environment:** Development

## Supabase Setup Steps

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `wisdomos-production`
   - Database Password: [choose a strong password]
   - Region: [closest to your users]
5. Wait for project creation (2-3 minutes)
6. Go to Settings → Database
7. Copy the Connection string from "Database URL" section
8. Use this as your DATABASE_URL in Vercel

## After Setting Environment Variables

1. Redeploy: Run `vercel --prod` to redeploy with new environment variables
2. Run database migrations (see next steps)

## Current Deployment
- **URL:** https://wisdomos-bxyh1r2u1-axaiinovation.vercel.app
- **Vercel Project:** https://vercel.com/axaiinovation/wisdomos-web
- **Status:** Deployed but needs database connection