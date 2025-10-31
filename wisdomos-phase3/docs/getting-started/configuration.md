# Configuration Guide

Complete environment configuration for WisdomOS.

## Environment Files

WisdomOS uses environment-specific configuration files:

```
.env.local           # Local development (gitignored)
.env.example         # Template with all variables
.env.production      # Production environment
.env.test            # Testing environment
```

## Required Configuration

### 1. Supabase Database

Create a Supabase project at [supabase.com](https://supabase.com):

```env
# Project URL from Supabase Dashboard → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co

# Anon/Public key from Settings → API
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Service role key (keep secret!) from Settings → API
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database connection string from Settings → Database
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

### 2. API Configuration

```env
# API server URL (development)
NEXT_PUBLIC_API_URL=http://localhost:8080

# API server URL (production)
# NEXT_PUBLIC_API_URL=https://api.yourdomain.com

# Port for API server (optional, auto-discovers if not set)
API_PORT=8080
```

### 3. Application Settings

```env
# Domain for multi-tenancy (production)
NEXT_PUBLIC_APP_DOMAIN=wisdomos.app

# Environment
NODE_ENV=development

# Web app port (default: 3011 in dev, 3000 in prod)
PORT=3011
```

## Optional Configuration

### HubSpot Integration

For CRM integration:

```env
# HubSpot API Key from Settings → Integrations → Private Apps
HUBSPOT_API_KEY=pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# Webhook secret for validating HubSpot webhooks
HUBSPOT_WEBHOOK_SECRET=your-webhook-secret-here
```

Set up webhooks in HubSpot:
1. Go to Settings → Integrations → Webhooks
2. Create webhook pointing to: `https://your-domain.com/api/webhooks/hubspot`
3. Subscribe to contact property changes

See [HubSpot Integration Guide](../features/hubspot-integration.md) for details.

### Authentication

NextAuth.js configuration:

```env
# NextAuth secret (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET=your-secret-key-here

# NextAuth URL (development)
NEXTAUTH_URL=http://localhost:3011

# NextAuth URL (production)
# NEXTAUTH_URL=https://your-domain.com
```

### Email Service (Optional)

For sending emails (invitations, notifications):

```env
# SendGrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxx

# Or Resend
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxx

# Or SMTP
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-password
SMTP_FROM=noreply@yourdomain.com
```

### Storage (Optional)

For file uploads and avatars:

```env
# Supabase Storage
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=wisdomos-uploads

# Or AWS S3
AWS_S3_BUCKET=wisdomos-uploads
AWS_ACCESS_KEY_ID=AKIAxxxxxxxxxxxxxxxx
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AWS_REGION=us-east-1
```

### Analytics (Optional)

```env
# Google Analytics 4
NEXT_PUBLIC_GA4_ID=G-XXXXXXXXXX

# Google Tag Manager
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### Error Tracking (Optional)

```env
# Sentry
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
SENTRY_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Per-App Configuration

### Web App (`apps/web/.env.local`)

```env
# All Supabase variables
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# API connection
NEXT_PUBLIC_API_URL=http://localhost:8080

# NextAuth
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3011
```

### API Server (`apps/api/.env.local`)

```env
# Database
DATABASE_URL=...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_KEY=...

# HubSpot (if using)
HUBSPOT_API_KEY=...
HUBSPOT_WEBHOOK_SECRET=...

# Port
API_PORT=8080
```

### Mobile App (`apps/mobile/.env.local`)

```env
# API connection
EXPO_PUBLIC_API_URL=http://localhost:8080

# Supabase
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

## Feature Flags

Configure feature availability:

```env
# Enable/disable features
FEATURE_AI_REFRAMING=true
FEATURE_MULTI_TENANCY=true
FEATURE_HUBSPOT_SYNC=false
FEATURE_MOBILE_APP=true
```

## Security Configuration

### JWT Configuration

```env
# JWT signing secret (generate with: openssl rand -hex 64)
JWT_SECRET=your-jwt-secret-here

# Token expiration
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d
```

### CORS Configuration

```env
# Allowed origins (comma-separated)
CORS_ORIGINS=http://localhost:3011,https://your-domain.com

# Allowed credentials
CORS_CREDENTIALS=true
```

### Rate Limiting

```env
# Requests per minute
RATE_LIMIT_REQUESTS=100

# Rate limit window (minutes)
RATE_LIMIT_WINDOW=1
```

## Development vs Production

### Development Settings
```env
NODE_ENV=development
LOG_LEVEL=debug
ENABLE_QUERY_LOGGING=true
CACHE_ENABLED=false
```

### Production Settings
```env
NODE_ENV=production
LOG_LEVEL=error
ENABLE_QUERY_LOGGING=false
CACHE_ENABLED=true
FORCE_HTTPS=true
```

## Validation

Verify your configuration:

```bash
# Check environment variables are loaded
pnpm run env:check

# Test database connection
pnpm run db:test

# Validate all required variables
pnpm run config:validate
```

## Secrets Management

### Local Development
Store in `.env.local` (gitignored)

### Production Deployment

Use platform secret managers:

**Vercel:**
```bash
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

**Netlify:**
```bash
netlify env:set SUPABASE_SERVICE_ROLE_KEY "your-key"
```

**Docker:**
```bash
docker secret create supabase_key ./secrets/supabase_key.txt
```

See [Secrets Management](../security/secrets-management.md) for best practices.

## Troubleshooting

### Variables Not Loading

1. Ensure `.env.local` exists in project root
2. Restart development server after changes
3. Check for syntax errors in `.env` file
4. Verify variable names match exactly

### Database Connection Issues

1. Test connection string:
```bash
psql "$DATABASE_URL"
```

2. Check Supabase IP allowlist
3. Verify password doesn't have special characters that need escaping

### API Not Connecting

1. Verify API is running: `curl http://localhost:8080/health`
2. Check CORS settings
3. Ensure `NEXT_PUBLIC_API_URL` is set correctly

## Next Steps

Configuration complete? Move on to:
- [First Steps](./first-steps.md) - Start using WisdomOS
- [Development Guide](../guides/development/README.md) - Development workflow
- [Deployment](../guides/deployment/README.md) - Deploy to production

---

**Configuration set up?** Continue to [First Steps](./first-steps.md) →
