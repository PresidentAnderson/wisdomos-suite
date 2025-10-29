# Netlify Deployment Guide — WisdomOS Sprint-0

**Version:** Sprint-0
**Date:** 2025-10-29
**Status:** ✅ Ready for Deployment

---

## 🎯 Overview

This guide covers deploying the complete WisdomOS platform to Netlify, including:
- **Next.js Web Application** (apps/web)
- **Netlify Edge Functions** (AI interpretations, GFS calculation)
- **Supabase Backend** (Database + Auth + Storage)
- **Multi-Agent System** (Queue-based agent execution)

---

## 📋 Prerequisites

### Required Accounts
- ✅ **Netlify Account**: [netlify.com](https://netlify.com)
- ✅ **Supabase Project**: [supabase.com](https://supabase.com)
- ⚠️ **OpenAI API Key** (optional, for AI features): [platform.openai.com](https://platform.openai.com)

### Required Tools
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Install pnpm (if not already installed)
npm install -g pnpm

# Login to Netlify
netlify login
```

---

## 🚀 Quick Deployment

### Option 1: Automated Script (Recommended)

```bash
# 1. Set environment variables
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="eyJhbGc..."
export DATABASE_URL="postgresql://postgres:password@host:6543/postgres"
export OPENAI_API_KEY="sk-proj-..." # Optional

# 2. Run deployment script
./scripts/deploy-netlify.sh
```

### Option 2: Manual Deployment

```bash
# 1. Install dependencies
pnpm install

# 2. Generate Prisma client
pnpm db:generate

# 3. Build application
pnpm build

# 4. Deploy to Netlify
netlify deploy --prod

# 5. Set environment variables (see below)
```

---

## 🔧 Configuration

### Environment Variables

Set these in **Netlify Dashboard** → **Site settings** → **Environment variables**:

#### Required Variables

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:6543/postgres

# NextAuth
NEXTAUTH_SECRET=your-random-secret-here
NEXTAUTH_URL=https://your-site.netlify.app
```

#### Optional Variables

```bash
# OpenAI (for AI features)
OPENAI_API_KEY=sk-proj-...

# Stripe (for payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
```

### Using Netlify CLI to Set Variables

```bash
# Production environment
netlify env:set SUPABASE_URL "https://your-project.supabase.co"
netlify env:set SUPABASE_SERVICE_ROLE_KEY "your-key-here"
netlify env:set DATABASE_URL "your-db-url"
netlify env:set OPENAI_API_KEY "your-openai-key"

# Verify
netlify env:list
```

---

## 📁 Project Structure

```
wisdomos/
├── apps/
│   └── web/                    # Next.js app
│       ├── app/                # App router pages
│       ├── components/         # React components
│       └── lib/                # Utilities
├── netlify/
│   ├── edge-functions/         # Edge Functions
│   │   ├── generate-interpretations.ts
│   │   └── calculate-gfs.ts
│   └── functions/              # Serverless functions (if needed)
├── supabase/
│   ├── migrations/             # Database migrations
│   └── functions/              # Supabase functions (reference)
├── netlify.toml                # Netlify configuration
└── scripts/
    └── deploy-netlify.sh       # Deployment script
```

---

## 🌐 Edge Functions

Netlify Edge Functions are deployed automatically with your site.

### Available Functions

| Function | Endpoint | Purpose |
|----------|----------|---------|
| `generate-interpretations` | `/functions/generate-interpretations` | AI-powered pattern analysis |
| `calculate-gfs` | `/functions/calculate-gfs` | Global Fulfillment Score (0-100) |

### Testing Edge Functions

```bash
# Test locally
netlify dev

# Test generate-interpretations
curl -X POST http://localhost:8888/functions/generate-interpretations \
  -H "Content-Type: application/json" \
  -d '{
    "profile_id": "user-uuid-here",
    "period": "2025-10"
  }'

# Test calculate-gfs
curl -X POST http://localhost:8888/functions/calculate-gfs \
  -H "Content-Type: application/json" \
  -d '{
    "profile_id": "user-uuid-here",
    "period": "2025-10"
  }'
```

---

## 🗄️ Database Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Note down your project credentials

### 2. Run Migrations

```bash
# Link to Supabase project
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push

# Or manually via psql
psql $DATABASE_URL < supabase/migrations/20251029_fulfillment_display_v5.sql
psql $DATABASE_URL < supabase/migrations/20251029_fulfillment_display_v5_seed.sql
psql $DATABASE_URL < supabase/migrations/20251029_fulfillment_backend_complete.sql
```

### 3. Verify Schema

```sql
-- Check tables created
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'fd_%';

-- Check seed data
SELECT COUNT(*) FROM fd_area;  -- Should return 16
SELECT COUNT(*) FROM fd_dimension;  -- Should return 60+
```

---

## 🔐 Security Checklist

- [ ] Environment variables set in Netlify (not committed to repo)
- [ ] Supabase RLS policies enabled
- [ ] NEXTAUTH_SECRET is random and secure
- [ ] Service role key only used server-side
- [ ] CORS configured correctly
- [ ] Rate limiting enabled (Netlify Pro+)
- [ ] Custom domain has SSL (automatic with Netlify)

---

## 🧪 Testing

### Local Development

```bash
# Start Netlify dev server (includes Edge Functions)
netlify dev

# Access at http://localhost:8888
```

### Production Testing

```bash
# After deployment, test endpoints
SITE_URL=$(netlify status | grep -oP 'URL:\s+\K\S+')

# Test homepage
curl -I $SITE_URL

# Test Edge Function
curl -X POST $SITE_URL/functions/calculate-gfs \
  -H "Content-Type: application/json" \
  -d '{"profile_id":"test","period":"2025-10"}'
```

---

## 📊 Monitoring

### Netlify Dashboard

Access at: `https://app.netlify.com/sites/[your-site]/overview`

**Key Metrics:**
- Build status & logs
- Function invocations
- Bandwidth usage
- Error rates

### Function Logs

```bash
# View real-time logs
netlify logs --functions

# View specific function
netlify functions:invoke generate-interpretations --identity
```

### Database Monitoring

Access Supabase Dashboard:
- **Database**: `https://app.supabase.com/project/[ref]/database/tables`
- **Logs**: `https://app.supabase.com/project/[ref]/logs/postgres-logs`
- **Query Performance**: `https://app.supabase.com/project/[ref]/database/query-performance`

---

## 🚨 Troubleshooting

### Build Fails

**Issue**: Prisma client generation fails
```bash
# Solution: Ensure DATABASE_URL is set
netlify env:set DATABASE_URL "your-connection-string"

# Rebuild
netlify deploy --prod --force
```

**Issue**: pnpm install fails
```bash
# Solution: Clear cache
rm -rf node_modules .pnpm-store
pnpm install
```

### Edge Functions Not Working

**Issue**: 500 error from function
```bash
# Check logs
netlify logs --functions

# Test locally
netlify dev
```

**Issue**: Environment variables not available
```bash
# Verify variables are set
netlify env:list

# Set missing variables
netlify env:set VARIABLE_NAME "value"
```

### Database Connection Issues

**Issue**: Cannot connect to database
```bash
# Test connection
psql $DATABASE_URL -c "SELECT NOW();"

# Check firewall (Supabase allows all by default)
# Verify connection string format:
# postgresql://postgres:[PASSWORD]@[HOST]:6543/postgres
```

---

## 🎯 Post-Deployment

### 1. Custom Domain (Optional)

```bash
# Add custom domain
netlify domains:add yourdomain.com

# Configure DNS (Netlify will provide instructions)
# SSL certificate is automatic
```

### 2. Enable Analytics

```bash
# Enable Netlify Analytics
netlify addons:create netlify-analytics

# Or use PostHog/Sentry (set env vars)
```

### 3. Set Up Monitoring

- **Uptime**: [uptimerobot.com](https://uptimerobot.com)
- **Error Tracking**: Sentry (set `NEXT_PUBLIC_SENTRY_DSN`)
- **Analytics**: PostHog (set `NEXT_PUBLIC_POSTHOG_KEY`)

---

## 📈 Performance Optimization

### Netlify Configuration

Already configured in `netlify.toml`:
- ✅ Edge Functions for low latency
- ✅ Automatic CDN distribution
- ✅ Brotli compression
- ✅ Image optimization (Next.js)
- ✅ Static asset caching

### Database Optimization

```sql
-- Add indexes if missing
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fd_entry_user_date
  ON fd_entry(user_id, date DESC);

-- Analyze tables
ANALYZE fd_entry;
ANALYZE fd_score_rollup;
```

---

## 🔄 CI/CD with GitHub

### GitHub Integration

1. **Connect Repository**:
   - Go to Netlify Dashboard → **Site settings** → **Build & deploy**
   - Connect to GitHub repository
   - Select branch (e.g., `main`)

2. **Auto-Deploy**:
   - Push to `main` → Automatic deployment
   - Pull Request → Preview deployment

3. **Build Settings**:
   - Already configured in `netlify.toml`
   - No manual configuration needed

---

## 📝 Deployment Checklist

### Pre-Deployment
- [ ] Supabase project created
- [ ] Database migrations applied
- [ ] Seed data loaded (16 areas)
- [ ] Environment variables ready
- [ ] Netlify CLI installed and authenticated
- [ ] Dependencies installed (`pnpm install`)

### Deployment
- [ ] Run `./scripts/deploy-netlify.sh` or `netlify deploy --prod`
- [ ] Set environment variables in Netlify
- [ ] Verify build succeeds
- [ ] Test Edge Functions
- [ ] Test database connectivity

### Post-Deployment
- [ ] Verify site is accessible
- [ ] Test user registration/login
- [ ] Test journal entry creation
- [ ] Test AI interpretations (if OpenAI key set)
- [ ] Test GFS calculation
- [ ] Set up custom domain (optional)
- [ ] Enable monitoring (Sentry, PostHog)
- [ ] Configure backups (Supabase automatic)

---

## 🎉 Success!

Your WisdomOS platform is now live on Netlify! 🚀

**Site URL**: `https://your-site.netlify.app`

**Edge Functions**:
- `https://your-site.netlify.app/functions/generate-interpretations`
- `https://your-site.netlify.app/functions/calculate-gfs`

**Admin Dashboards**:
- Netlify: `https://app.netlify.com/sites/[your-site]`
- Supabase: `https://app.supabase.com/project/[your-ref]`

---

## 📞 Support

- **Netlify Docs**: https://docs.netlify.com
- **Supabase Docs**: https://supabase.com/docs
- **WisdomOS Issues**: https://github.com/your-org/wisdomos/issues
- **Email**: support@wisdomos.com

---

**Happy Deploying! 🎊**
