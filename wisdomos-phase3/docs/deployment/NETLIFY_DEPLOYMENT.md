# Netlify Deployment Guide for WisdomOS Phoenix

## Overview
This guide explains how to deploy the WisdomOS Phoenix application to Netlify.

## Prerequisites

1. A Netlify account
2. Supabase database configured
3. Required environment variables (see `.env.netlify.example`)
4. OpenAI API key for AI features

## Deployment Steps

### 1. Connect Repository to Netlify

1. Log in to [Netlify](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect to your Git provider (GitHub, GitLab, etc.)
4. Select the WisdomOS repository

### 2. Configure Build Settings

The `netlify.toml` file at the root automatically configures:

- **Base directory**: `apps/web`
- **Build command**: `cd ../.. && npm install --legacy-peer-deps && cd apps/web && npx prisma generate && npm run build`
- **Publish directory**: `.next`
- **Node version**: 20

**You do not need to manually configure these in the Netlify UI** - they are read from `netlify.toml`.

### 3. Set Environment Variables

In Netlify dashboard, go to **Site settings → Environment variables** and add:

#### Required Variables
```bash
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
OPENAI_API_KEY=sk-proj-xxxxx
```

#### Optional Variables
```bash
# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXX
NEXT_PUBLIC_CLARITY_ID=xxxxx

# Integrations
HUBSPOT_PRIVATE_APP_TOKEN=pat-na1-xxxxx
GRAFANA_SERVICE_ACCOUNT_TOKEN=your-token

# Slack Notifications
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx
```

**Copy the full list from `.env.netlify.example`**

### 4. Deploy

Click **Deploy site** in Netlify. The build process will:

1. Install dependencies with npm
2. Generate Prisma client
3. Build the Next.js application
4. Deploy to Netlify's edge network

## Common Issues & Solutions

### Issue 1: Build Fails with "Cannot find module '@prisma/client'"

**Solution**: Ensure `DATABASE_URL` is set in Netlify environment variables. Prisma generation requires a valid database connection string even if not connecting during build.

### Issue 2: Build Fails with "pnpm not found"

**Solution**: The project now uses npm for Netlify builds (configured in netlify.toml). If you see this error, clear build cache:
- Site settings → Build & deploy → Clear cache and retry

### Issue 3: API Routes Return 404

**Solution**:
- Ensure `@netlify/plugin-nextjs` plugin is enabled (configured in netlify.toml)
- Check that `functions.directory = "disabled"` is set (we use Next.js API routes, not Netlify Functions)

### Issue 4: Environment Variables Not Working

**Solution**:
- Variables must be set in Netlify UI under Environment Variables
- After adding variables, trigger a new deploy
- For production vs preview differences, use context-specific variables in netlify.toml

### Issue 5: "Module not found" for lucide-react or other dependencies

**Solution**: Clear build cache and redeploy. If persists, check that package.json versions are compatible.

### Issue 6: Prisma Generate Runs Multiple Times

**Solution**: `PRISMA_SKIP_POSTINSTALL_GENERATE=true` is set in netlify.toml to prevent duplicate generation.

## Build Configuration Details

### netlify.toml Structure

```toml
[build]
  base = "apps/web"                    # Start from web app directory
  publish = ".next"                    # Publish Next.js build output
  command = "cd ../.. && npm install --legacy-peer-deps && cd apps/web && npx prisma generate && npm run build"

[build.environment]
  NODE_VERSION = "20"
  NPM_FLAGS = "--legacy-peer-deps"     # Handle peer dependency conflicts
  PRISMA_SKIP_POSTINSTALL_GENERATE = "true"  # Avoid duplicate Prisma generation
```

### Next.js Configuration

The `next.config.mjs` includes:
- Security headers for production
- Image optimization settings
- Environment variable fallbacks for Netlify's `URL` variable
- Serverless optimization with `outputFileTracing`

## Monitoring & Maintenance

### Check Deployment Status
- Netlify Dashboard → Deploys
- View build logs for errors

### Roll Back a Deploy
- Netlify Dashboard → Deploys → Select previous deploy → "Publish deploy"

### Enable Deploy Notifications
- Site settings → Build & deploy → Deploy notifications
- Add Slack/email notifications for build failures

## Security Features

The deployment includes:
- Content Security Policy (CSP) headers
- HSTS with preload
- XSS protection
- Frame denial (X-Frame-Options: DENY)
- IP protection headers
- Rate limiting headers

All configured in `netlify.toml` headers section.

## Performance Optimizations

1. **Edge deployment** - Deployed to multiple regions (iad1, sfo1)
2. **Static asset caching** - 1 year cache for immutable assets
3. **Image optimization** - Next.js image optimization enabled
4. **Serverless functions** - 30s timeout for API routes

## Support

For deployment issues:
1. Check build logs in Netlify dashboard
2. Review environment variables are set correctly
3. Ensure database is accessible from Netlify
4. Contact AXAI Innovations: contact@axaiinovations.com

## Next Steps After Deployment

1. Configure custom domain (optional)
2. Set up branch deploys for staging
3. Enable Netlify Analytics
4. Configure deploy previews for PRs
5. Set up monitoring with Grafana (if configured)

## Useful Commands

```bash
# Test build locally (simulates Netlify build)
cd apps/web
npm install --legacy-peer-deps
npx prisma generate
npm run build

# Check for build errors
npm run type-check
npm run lint
```

## Additional Resources

- [Netlify Next.js Documentation](https://docs.netlify.com/frameworks/next-js/)
- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
