# Netlify Deployment Checklist

Use this checklist before deploying to Netlify to ensure all requirements are met.

## Pre-Deployment Checklist

### 1. Environment Variables
- [ ] `DATABASE_URL` configured in Netlify
- [ ] `DIRECT_URL` configured in Netlify
- [ ] `NEXT_PUBLIC_SUPABASE_URL` configured in Netlify
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` configured in Netlify
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configured in Netlify
- [ ] `OPENAI_API_KEY` configured in Netlify
- [ ] Optional: Analytics IDs configured (GA, Clarity)
- [ ] Optional: Integration tokens configured (HubSpot, Grafana, Slack)

### 2. Database Setup
- [ ] Supabase project created
- [ ] Database tables created (run migrations)
- [ ] Database is accessible from internet (Netlify needs access)
- [ ] Connection pooling enabled (recommended for serverless)

### 3. Build Configuration
- [ ] `netlify.toml` exists at repository root ✅
- [ ] Base directory set to `apps/web` ✅
- [ ] Publish directory set to `.next` ✅
- [ ] Node version set to 20 ✅
- [ ] `@netlify/plugin-nextjs` plugin enabled ✅

### 4. Code Quality
- [ ] TypeScript type checking passes (`npm run type-check`)
- [ ] ESLint passes (`npm run lint`)
- [ ] Prisma schema is valid
- [ ] Prisma client generates successfully
- [ ] No console errors in development

### 5. Netlify Site Settings
- [ ] Site created in Netlify dashboard
- [ ] Repository connected
- [ ] Branch for production set (usually `main`)
- [ ] Build settings reviewed (should auto-detect from netlify.toml)
- [ ] Environment variables added in Netlify UI

### 6. Security Verification
- [ ] `.env` files NOT committed to git
- [ ] Sensitive keys stored only in Netlify environment variables
- [ ] API keys are production keys (not test/development)
- [ ] CORS settings reviewed in `netlify.toml`

### 7. Feature Flags
- [ ] `NEXT_PUBLIC_FEATURE_BULK_GENERATION` set (if using AI features)
- [ ] `NEXT_PUBLIC_FEATURE_CURATION_MODE` set (if using curation)
- [ ] `NEXT_PUBLIC_FEATURE_REGION_RELEVANCE` set (if using regions)
- [ ] `NEXT_PUBLIC_FEATURE_MEMORY_LINKING` set (if using memory linking)

## Post-Deployment Checklist

### 1. Initial Deploy
- [ ] Build completes successfully
- [ ] No build errors in Netlify logs
- [ ] Deploy preview URL accessible
- [ ] Homepage loads correctly

### 2. Functionality Testing
- [ ] Authentication works (login/register)
- [ ] Database queries work
- [ ] API routes respond correctly
- [ ] AI features work (if enabled)
- [ ] Image loading works
- [ ] Navigation works across all pages

### 3. Performance Testing
- [ ] Lighthouse score > 80
- [ ] Time to First Byte (TTFB) < 1s
- [ ] Largest Contentful Paint (LCP) < 2.5s
- [ ] First Input Delay (FID) < 100ms

### 4. Security Testing
- [ ] Security headers present (check with securityheaders.com)
- [ ] HTTPS enforced
- [ ] CSP headers working
- [ ] No mixed content warnings
- [ ] API endpoints require authentication

### 5. Production Settings
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Deploy notifications enabled
- [ ] Error tracking configured (Sentry, etc.)
- [ ] Analytics tracking verified

## Troubleshooting Quick Reference

| Issue | Solution |
|-------|----------|
| Build fails with "Cannot find module" | Clear build cache, redeploy |
| "Prisma Client not generated" | Ensure DATABASE_URL is set in env vars |
| API routes return 404 | Check @netlify/plugin-nextjs is enabled |
| Slow cold starts | Enable Edge Functions (if available) |
| Environment variables not updating | Clear cache and redeploy |
| "pnpm not found" error | This is expected - build uses npm |

## Common Commands

```bash
# Test build locally
cd apps/web
npm install --legacy-peer-deps
npx prisma generate
npm run build

# Type check
npm run type-check

# Lint
npm run lint

# Test Prisma connection
npx prisma db pull
```

## Resources

- Deployment Guide: `NETLIFY_DEPLOYMENT.md`
- Environment Variables Template: `.env.netlify.example`
- Netlify Config: `netlify.toml`
- Next.js Config: `apps/web/next.config.mjs`

## Support Contacts

- AXAI Innovations: contact@axaiinovations.com
- Netlify Support: https://answers.netlify.com/
- Supabase Support: https://supabase.com/support

---

**Last Updated**: 2025-10-29
**Configuration Version**: 2.0.0-phoenix
