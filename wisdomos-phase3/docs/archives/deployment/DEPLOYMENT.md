# WisdomOS Netlify Deployment Guide

This guide explains how to deploy your WisdomOS monorepo to Netlify with your existing Supabase project.

## 🚀 Quick Deploy

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/your-username/wisdomos)

## Prerequisites

- ✅ Existing Supabase project
- ✅ Netlify account
- ✅ GitHub repository (optional for continuous deployment)

## 1. Netlify Site Setup

### Option A: Git-based Deployment (Recommended)
1. Connect your GitHub repository to Netlify
2. Set build settings:
   - **Base directory**: ` ` (leave empty for monorepo root)
   - **Build command**: `pnpm install && pnpm db:generate && pnpm --filter @wisdomos/web build`
   - **Publish directory**: `apps/web/out`

### Option B: Manual Deployment
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
pnpm install
pnpm db:generate
pnpm --filter @wisdomos/web build
netlify deploy --prod --dir=apps/web/out
```

## 2. Environment Variables

In your Netlify dashboard, go to **Site Settings > Environment Variables** and add:

### Required Variables
```bash
# Database
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Authentication
JWT_SECRET=your-production-jwt-secret-min-32-characters
NEXTAUTH_URL=https://your-site.netlify.app
NEXTAUTH_SECRET=your-nextauth-secret-key

# API Configuration
NEXT_PUBLIC_API_BASE=https://your-site.netlify.app
CORS_ORIGIN=https://your-site.netlify.app

# Build Configuration
NODE_VERSION=20
PNPM_VERSION=8.15.0
NODE_ENV=production
```

### Optional Variables
```bash
# AI Services
AI_PROVIDER=openai
OPENAI_API_KEY=sk-your-openai-key

# Analytics
NEXT_PUBLIC_GA4_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX

# HubSpot Integration
HUBSPOT_ACCESS_TOKEN=
HUBSPOT_PORTAL_ID=
HUBSPOT_PRIVATE_APP_KEY=
```

## 3. Supabase Configuration

### Update CORS Settings
In your Supabase dashboard:
1. Go to **Settings > API**
2. Add your Netlify URL to **CORS origins**:
   ```
   https://your-site.netlify.app
   https://*.netlify.app
   ```

### Database Migrations
```bash
# Run migrations on your Supabase project
supabase db push --db-url "postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"
```

## 4. Build Configuration

The project uses these build settings configured in `netlify.toml`:

- **Base**: Root directory for monorepo support
- **Build Command**: `pnpm install && pnpm db:generate && pnpm --filter @wisdomos/web build`
- **Publish Directory**: `apps/web/out`
- **Node Version**: 20
- **PNPM Version**: 8.15.0

## 5. API Functions

The NestJS API is deployed as Netlify Functions via `netlify/functions/api.ts`. This handles:
- tRPC routes
- Authentication
- Database operations
- WebSocket connections (via polling)

## 6. Custom Domain (Optional)

1. In Netlify dashboard: **Site Settings > Domain Management**
2. Add your custom domain
3. Update environment variables:
   ```bash
   NEXTAUTH_URL=https://yourdomain.com
   CORS_ORIGIN=https://yourdomain.com
   ```

## 7. Testing Your Deployment

### Health Check
Visit `https://your-site.netlify.app/api/health` to verify API is running.

### Phoenix Dashboard
Visit your main site to test the full WisdomOS experience:
- User registration/login
- Dashboard with life areas
- Contribution displays
- Autobiography timeline

## 8. Continuous Deployment

With GitHub integration, deployments trigger automatically on:
- **Production**: Pushes to `main` branch
- **Preview**: Pull requests and other branches

## Troubleshooting

### Build Failures
```bash
# Common issues:
1. Missing environment variables
2. Prisma client not generated
3. Dependency version conflicts

# Debug locally:
pnpm install
pnpm db:generate
pnpm --filter @wisdomos/web build
```

### API Issues
```bash
# Check function logs in Netlify dashboard
# Verify environment variables are set
# Test API endpoints manually
```

### Database Connection
```bash
# Verify DATABASE_URL format
# Check Supabase project status
# Confirm RLS policies are set
```

## Performance Optimization

### Caching Strategy
- Static assets: 1 year cache
- Images: 1 day cache
- API responses: No cache (dynamic content)

### Bundle Optimization
- Next.js static export
- Image optimization disabled (Netlify handles this)
- Transpiled packages for compatibility

## Security

### Headers
Configured security headers in `netlify.toml`:
- Content Security Policy
- X-Frame-Options
- XSS Protection

### Environment Variables
- Never commit secrets to repository
- Use Netlify's secure environment variable storage
- Rotate keys regularly

## Monitoring

### Analytics
Configure Google Analytics or other tools via environment variables.

### Error Tracking
Consider adding Sentry or similar error tracking service.

### Performance
Use Netlify Analytics or Core Web Vitals monitoring.

## Support

For deployment issues:
1. Check Netlify build logs
2. Verify environment variables
3. Test locally with production environment
4. Review Supabase logs for database issues

---

**Phoenix rises on Netlify! 🔥**

Your WisdomOS platform is now live and ready to transform lives through the power of reflection, breakthrough, and renewal.