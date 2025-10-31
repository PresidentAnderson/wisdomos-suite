# Deployment Guide

Complete guide for deploying WisdomOS to production.

## Quick Deploy

Choose your platform for one-click deployment:

| Platform | Web App | API Server | Best For |
|----------|---------|------------|----------|
| [Vercel](./vercel.md) | ✅ Yes | ✅ Yes | Easiest, recommended |
| [Netlify](./netlify.md) | ✅ Yes | ❌ No | Static sites, edge functions |
| [Docker](./docker.md) | ✅ Yes | ✅ Yes | Self-hosted, full control |

## Prerequisites

Before deploying, ensure you have:

### Required
- ✅ GitHub repository with your code
- ✅ Supabase project with database
- ✅ Domain name (for production)
- ✅ Environment variables prepared

### Optional
- HubSpot account (for CRM integration)
- Sentry account (for error tracking)
- SendGrid/Resend account (for emails)
- Custom domain with wildcard DNS (for multi-tenancy)

## Deployment Checklist

Use this checklist before going live:

### 1. Environment Configuration
- [ ] All environment variables set
- [ ] Secrets stored securely (not in code)
- [ ] `NODE_ENV=production`
- [ ] `NEXTAUTH_SECRET` generated (32+ characters)
- [ ] Database URL configured
- [ ] API URL configured

### 2. Database Setup
- [ ] Production database created
- [ ] Migrations applied: `pnpm db:migrate`
- [ ] RLS policies enabled
- [ ] Backup strategy configured
- [ ] Connection pooling enabled

### 3. Security
- [ ] HTTPS enabled (SSL certificate)
- [ ] CORS origins configured correctly
- [ ] Rate limiting enabled
- [ ] Secrets checklist completed
- [ ] Security headers configured

### 4. Performance
- [ ] Image optimization enabled
- [ ] Caching configured
- [ ] CDN for static assets
- [ ] Database indexes created
- [ ] Monitoring setup

### 5. Features
- [ ] Authentication working
- [ ] Database queries working
- [ ] File uploads working (if enabled)
- [ ] Email sending working (if enabled)
- [ ] HubSpot webhooks working (if enabled)

### 6. Testing
- [ ] Run production build locally
- [ ] Test all critical user flows
- [ ] Verify environment variables loaded
- [ ] Check error tracking
- [ ] Load test (optional)

### 7. Monitoring
- [ ] Error tracking (Sentry) configured
- [ ] Analytics configured
- [ ] Uptime monitoring setup
- [ ] Log aggregation setup

## Deployment Architecture

### Simple Setup (Small Team)
```
┌─────────────────┐
│   Vercel        │
│  ┌───────────┐  │
│  │ Web + API │  │
│  └─────┬─────┘  │
└────────┼────────┘
         │
         ▼
┌─────────────────┐
│   Supabase      │
│   PostgreSQL    │
└─────────────────┘
```

### Scalable Setup (Production)
```
┌─────────────────┐      ┌─────────────────┐
│   Vercel        │      │   Railway       │
│  ┌───────────┐  │      │  ┌───────────┐  │
│  │ Web (SSR) │  │      │  │ API (NestJS) │
│  └─────┬─────┘  │      │  └─────┬─────┘  │
└────────┼────────┘      └────────┼────────┘
         │                        │
         │    ┌───────────────────┘
         │    │
         ▼    ▼
┌─────────────────────┐
│   Supabase          │
│   PostgreSQL        │
│   + Edge Functions  │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│   External Services │
│   - HubSpot CRM     │
│   - SendGrid Email  │
│   - Sentry Errors   │
└─────────────────────┘
```

### Self-Hosted Setup (Docker)
```
┌──────────────────────────────┐
│   Docker Compose             │
│   ┌────────┐  ┌────────┐    │
│   │  Web   │  │  API   │    │
│   └───┬────┘  └───┬────┘    │
│       │           │          │
│   ┌───┴───────────┴────┐    │
│   │   PostgreSQL DB    │    │
│   └────────────────────┘    │
│                              │
│   ┌────────────────────┐    │
│   │   Nginx Reverse    │    │
│   │   Proxy + SSL      │    │
│   └────────────────────┘    │
└──────────────────────────────┘
```

## Environment Variables

### Core Variables

```env
# Node Environment
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:password@host:5432/db

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Authentication
NEXTAUTH_SECRET=your-32-char-secret-here
NEXTAUTH_URL=https://your-domain.com

# API
NEXT_PUBLIC_API_URL=https://api.your-domain.com
```

### Optional Variables

```env
# HubSpot Integration
HUBSPOT_API_KEY=pat-na1-xxxxx
HUBSPOT_WEBHOOK_SECRET=your-webhook-secret

# Email Service
SENDGRID_API_KEY=SG.xxxxx
# OR
RESEND_API_KEY=re_xxxxx

# Error Tracking
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx

# Analytics
NEXT_PUBLIC_GA4_ID=G-XXXXXXXXXX
```

## Platform-Specific Guides

### Vercel (Recommended)
**Best for:** Most use cases, automatic scaling, easy setup

[Complete Vercel Guide →](./vercel.md)

**Pros:**
- One-click deployment
- Automatic SSL
- Edge network (global CDN)
- Serverless functions for API
- Built-in CI/CD

**Cons:**
- Function execution limits (10s default)
- Cold starts for serverless functions

### Netlify
**Best for:** Static sites, JAMstack architecture

[Complete Netlify Guide →](./netlify.md)

**Pros:**
- Easy deployment
- Edge functions
- Split testing
- Form handling

**Cons:**
- No built-in API server hosting
- Need separate service for NestJS API

### Docker
**Best for:** Self-hosted, full control, hybrid cloud

[Complete Docker Guide →](./docker.md)

**Pros:**
- Complete control
- Run anywhere
- Easier local replication
- No platform lock-in

**Cons:**
- More setup required
- Manual scaling
- Infrastructure management

## Multi-Tenancy Deployment

For organizations with subdomains (`org.yourdomain.com`):

### 1. Configure Wildcard DNS

**Cloudflare:**
```
Type: CNAME
Name: *
Content: your-app.vercel.app
Proxy: On
```

**AWS Route 53:**
```
Type: A
Name: *.yourdomain.com
Value: Your-ALB-DNS
```

### 2. Set Environment Variable

```env
NEXT_PUBLIC_APP_DOMAIN=yourdomain.com
```

### 3. Configure SSL

Most platforms (Vercel, Netlify) handle wildcard SSL automatically.

For custom setups, use Let's Encrypt:
```bash
certbot certonly --dns-cloudflare \
  --dns-cloudflare-credentials ~/.secrets/certbot/cloudflare.ini \
  -d yourdomain.com -d *.yourdomain.com
```

See [Multi-Tenancy Guide](../../features/multi-tenancy.md) for details.

## Database Migration

For production deployments:

```bash
# Never use db:push in production!
# Always use migrations:

# Create migration
pnpm db:migrate dev --name your-migration-name

# Apply to production
pnpm db:migrate deploy
```

## Rollback Strategy

If deployment fails:

### Vercel/Netlify
1. Go to Deployments
2. Find last working deployment
3. Click "Promote to Production"

### Docker
```bash
# Rollback to previous image
docker-compose down
docker-compose up -d --image previous-tag
```

### Database
```bash
# Rollback last migration
pnpm db:migrate resolve --rolled-back <migration-name>
```

## Monitoring Production

### Health Checks

Set up monitoring for:
- **Web**: `https://your-domain.com/api/health`
- **API**: `https://api.your-domain.com/health`
- **Database**: Connection status

Tools:
- UptimeRobot (free tier available)
- Pingdom
- StatusCake

### Error Tracking

Configure Sentry:
```bash
# Install Sentry
pnpm add @sentry/nextjs @sentry/node

# Configure in next.config.js and API
```

### Performance Monitoring

Monitor:
- Response times
- Database query performance
- Memory usage
- Error rates

Tools:
- Vercel Analytics
- New Relic
- Datadog

## Scaling Considerations

### Vertical Scaling
Upgrade your plan:
- More compute resources
- Increased memory
- Higher function duration limits

### Horizontal Scaling
- Enable database connection pooling
- Use Redis for session storage
- CDN for static assets
- Separate API servers per region

### Database Scaling
- Add read replicas
- Enable connection pooling
- Optimize queries and indexes
- Consider sharding for very large datasets

## Troubleshooting

### Build Failures

1. Check build logs for specific errors
2. Verify all dependencies are in `package.json`
3. Ensure `NODE_VERSION` matches local
4. Try building locally: `pnpm build`

### Runtime Errors

1. Check application logs
2. Verify environment variables are set
3. Test database connectivity
4. Check for missing secrets

### Performance Issues

1. Enable caching
2. Optimize database queries
3. Add CDN for static assets
4. Review Prisma queries for N+1 problems

## Security Hardening

See [Production Checklist](./production-checklist.md) for:
- Security headers configuration
- Rate limiting setup
- DDoS protection
- API key rotation
- Audit logging

## Next Steps

1. Choose your deployment platform
2. Follow platform-specific guide
3. Complete [Production Checklist](./production-checklist.md)
4. Set up monitoring and alerts
5. Test all critical flows

---

**Ready to deploy?** Choose your platform:
- [Vercel Deployment →](./vercel.md)
- [Netlify Deployment →](./netlify.md)
- [Docker Deployment →](./docker.md)
