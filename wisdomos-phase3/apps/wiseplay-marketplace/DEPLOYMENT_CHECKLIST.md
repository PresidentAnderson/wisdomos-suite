# Vercel Deployment Checklist

Use this checklist to ensure successful deployment of WisePlay Marketplace to Vercel.

## Pre-Deployment Checklist

### Local Testing
- [ ] Run `npm install` successfully
- [ ] Run `npx prisma generate` successfully
- [ ] Run `npm run build` successfully
- [ ] Test app locally with `npm run dev`
- [ ] Verify database connection works
- [ ] All tests pass (if applicable)

### Code Review
- [ ] All changes committed to Git
- [ ] No secrets in code (check .env.local is in .gitignore)
- [ ] package.json has `next` dependency (v14.2.18)
- [ ] prisma/schema.prisma exists
- [ ] vercel.json is configured correctly
- [ ] No console.errors or warnings

## Vercel Configuration Checklist

### Project Settings
- [ ] **Root Directory**: Set to `apps/wiseplay-marketplace` (CRITICAL!)
- [ ] Framework: Detected as Next.js
- [ ] Node.js Version: 18.x or higher
- [ ] Install Command: Uses vercel.json config
- [ ] Build Command: Uses vercel.json config

### Environment Variables
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `NEXTAUTH_URL` - Your Vercel deployment URL
- [ ] `NEXTAUTH_SECRET` - Generated with `openssl rand -base64 32`
- [ ] `STRIPE_SECRET_KEY` - Stripe secret key
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- [ ] `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret (add after first deploy)
- [ ] `NEXT_PUBLIC_PLATFORM_FEE_PERCENT` - Platform fee percentage (default: 6)
- [ ] `NEXT_PUBLIC_APP_URL` - Your Vercel deployment URL

### Optional Variables
- [ ] `GOOGLE_CLIENT_ID` - For Google OAuth
- [ ] `GOOGLE_CLIENT_SECRET` - For Google OAuth
- [ ] `GITHUB_ID` - For GitHub OAuth
- [ ] `GITHUB_SECRET` - For GitHub OAuth

## Deployment Checklist

### Initial Deployment
- [ ] Import project from GitHub
- [ ] Configure Root Directory (CRITICAL!)
- [ ] Add all environment variables
- [ ] Click Deploy
- [ ] Wait for build to complete
- [ ] Check build logs for errors

### Build Verification
- [ ] Build logs show "Next.js detected"
- [ ] No "No Next.js version detected" error
- [ ] Prisma Client generated successfully
- [ ] Build completed without errors
- [ ] Deployment URL generated

### Post-Deployment Testing
- [ ] Visit deployment URL
- [ ] Homepage loads correctly
- [ ] Test user registration/login
- [ ] Test navigation
- [ ] Check browser console for errors
- [ ] Test database connectivity
- [ ] Test Stripe integration (if applicable)

## Database Checklist

### Supabase/PostgreSQL Setup
- [ ] Database created and accessible
- [ ] Connection string added to Vercel
- [ ] Database migrations run (if needed)
- [ ] Database seeded (if needed)
- [ ] Connection pooling enabled
- [ ] SSL mode enabled for production

### Prisma Configuration
- [ ] schema.prisma up to date
- [ ] Prisma Client generates without errors
- [ ] Database URL format correct
- [ ] Schema pushed to database (`npx prisma db push`)

## Stripe Configuration Checklist

### Stripe Account Setup
- [ ] Stripe account created
- [ ] API keys copied (test and live)
- [ ] Webhook endpoint configured

### Webhook Setup (Do AFTER first deployment)
1. [ ] Go to Stripe Dashboard → Webhooks
2. [ ] Add endpoint: `https://your-domain.vercel.app/api/marketplace/payments/webhooks`
3. [ ] Select events:
   - [ ] `payment_intent.succeeded`
   - [ ] `payment_intent.payment_failed`
   - [ ] `account.updated`
   - [ ] `account.application.deauthorized`
4. [ ] Copy webhook signing secret
5. [ ] Add `STRIPE_WEBHOOK_SECRET` to Vercel
6. [ ] Redeploy

## Security Checklist

- [ ] `.env.local` in .gitignore
- [ ] No secrets committed to Git
- [ ] NEXTAUTH_SECRET is strong and unique
- [ ] Database uses SSL in production
- [ ] Environment variables only in Vercel dashboard
- [ ] Production uses different keys than development

## Performance Checklist

- [ ] Images optimized
- [ ] Static assets in /public
- [ ] API routes optimized
- [ ] Database queries optimized
- [ ] No N+1 query issues

## Monitoring Checklist

- [ ] Vercel Analytics enabled (optional)
- [ ] Error tracking configured (optional)
- [ ] Database monitoring enabled
- [ ] Stripe webhook monitoring enabled
- [ ] Set up email alerts for critical errors

## Domain Setup Checklist (Optional)

- [ ] Custom domain purchased
- [ ] Domain added in Vercel
- [ ] DNS configured
- [ ] SSL certificate generated
- [ ] `NEXTAUTH_URL` updated
- [ ] `NEXT_PUBLIC_APP_URL` updated
- [ ] Stripe webhook URL updated

## Troubleshooting Checklist

If deployment fails, check:

- [ ] Root Directory is set to `apps/wiseplay-marketplace`
- [ ] All environment variables are set
- [ ] Build logs for specific errors
- [ ] DATABASE_URL is accessible from Vercel
- [ ] Node.js version is compatible
- [ ] No syntax errors in code
- [ ] Dependencies are installed correctly

## Common Errors and Solutions

### "No Next.js version detected"
**Solution**: Set Root Directory to `apps/wiseplay-marketplace` in Vercel settings

### "Prisma Client not generated"
**Solution**: Ensure `prisma` is in devDependencies and schema exists

### "Database connection failed"
**Solution**: Check DATABASE_URL and ensure SSL mode is enabled

### "Module not found"
**Solution**: Clear build cache and redeploy

## Final Verification

Before going live:

- [ ] Test complete user flow
- [ ] Test payment processing
- [ ] Verify all pages load
- [ ] Check mobile responsiveness
- [ ] Test with real data
- [ ] Review all error logs
- [ ] Performance test
- [ ] Security audit

## Post-Launch Checklist

- [ ] Monitor first 24 hours of logs
- [ ] Test webhook deliveries
- [ ] Check database performance
- [ ] Monitor API response times
- [ ] Review user feedback
- [ ] Fix any critical issues immediately

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Stripe Docs**: https://stripe.com/docs
- **Project Docs**: See DEPLOYMENT.md for detailed guide

---

**Deployment Status**: ☐ Not Started | ☐ In Progress | ☐ Completed

**Deployment Date**: __________________

**Deployed By**: __________________

**Deployment URL**: __________________

**Notes**:
_____________________________________________
_____________________________________________
_____________________________________________
