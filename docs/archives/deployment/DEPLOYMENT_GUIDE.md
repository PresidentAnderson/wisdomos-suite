# WisdomOS Multi-Tenancy Deployment Guide

## Quick Start

### Development Setup
```bash
# Clone and setup
git clone <your-repo-url>
cd wisdomOS

# Setup development environment
./scripts/setup-environment.sh development

# Start development server
pnpm dev
```

### Production Setup
```bash
# Setup production environment
./scripts/setup-environment.sh production

# Deploy to your platform (Vercel/Railway/AWS)
vercel deploy --prod
```

## Environment Configuration

### Development
- Uses SQLite database (`dev.db`)
- Subdomains work via localhost:3000
- Test mode for all integrations

### Production
- Requires PostgreSQL database
- Wildcard DNS for subdomains (*.wisdomos.app)
- Live integrations (Stripe, Email, etc.)

## Database Setup

### PostgreSQL (Production)
```bash
# Using Supabase
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres"

# Using Railway
railway add postgresql
export DATABASE_URL=$(railway variables get DATABASE_URL)

# Using AWS RDS
# Create RDS PostgreSQL instance and use connection string
```

### Apply Schema
```bash
pnpm db:push
```

## DNS Configuration

### Wildcard Subdomain Setup

**Cloudflare:**
```
Type: CNAME
Name: *
Content: your-app.vercel.app
Proxy: Yes
```

**AWS Route 53:**
```
Type: A
Name: *.wisdomos.app
Value: Your-Load-Balancer-IP
```

**Custom DNS Provider:**
```
*.wisdomos.app CNAME your-app.vercel.app
```

## Deployment Platforms

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
vercel env add STRIPE_SECRET_KEY
# ... add all production variables

# Deploy to production
vercel --prod
```

### Railway
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway link
railway up

# Set environment variables
railway variables set DATABASE_URL=...
railway variables set NEXTAUTH_SECRET=...
```

### Docker Deployment
```bash
# Build Docker image
docker build -t wisdomos:latest .

# Run with environment variables
docker run -d \
  --name wisdomos \
  -p 3000:3000 \
  --env-file .env.production \
  wisdomos:latest
```

## Required Environment Variables

### Core Variables
```bash
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="32-char-minimum-secret"
NEXTAUTH_URL="https://wisdomos.app"
NEXT_PUBLIC_APP_DOMAIN="wisdomos.app"
```

### Stripe (Billing)
```bash
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### Email (Invitations)
```bash
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASS="your-sendgrid-api-key"
FROM_EMAIL="noreply@wisdomos.app"
```

## Security Considerations

### SSL/TLS
- Enable HTTPS for all domains
- Use secure cookies in production
- Set proper CORS origins

### Database Security
- Use connection pooling
- Enable SSL for database connections
- Regular backups

### API Security
- Rate limiting on API routes
- Input validation
- CSRF protection

## Monitoring & Analytics

### Application Monitoring
```bash
# Sentry for error tracking
SENTRY_DSN="https://...@sentry.io/..."

# Vercel Analytics
VERCEL_ANALYTICS_ID="..."
```

### Business Analytics
```bash
# Google Analytics
NEXT_PUBLIC_GA4_ID="G-XXXXXXXXXX"

# Custom analytics
NEXT_PUBLIC_GTM_ID="GTM-XXXXXXX"
```

## Testing in Production

### Create Test Tenant
```bash
# Visit your deployment
https://wisdomos.app/onboarding

# Create test tenant
Organization: "Test Company"
Subdomain: "test-company"
# Results in: https://test-company.wisdomos.app
```

### Test Features
1. **Tenant Isolation**: Create multiple tenants, verify data separation
2. **Subdomain Routing**: Test different subdomains
3. **User Management**: Invite users, test roles
4. **Billing**: Test plan upgrades (if Stripe configured)

## Troubleshooting

### Common Issues

**Subdomain Not Working**
- Check DNS propagation
- Verify wildcard certificate
- Check middleware configuration

**Database Connection Failed**
- Verify DATABASE_URL format
- Check database server status
- Verify SSL requirements

**Tenant Creation Fails**
- Check database schema is up to date
- Verify unique constraints
- Check validation rules

### Debug Commands
```bash
# Check database connection
pnpm db:status

# Run schema tests
npx tsx scripts/test-basic-schema.ts

# Check tenant middleware
curl -H "Host: test.wisdomos.app" http://localhost:3000/api/tenant/current
```

## Performance Optimization

### Database
- Add proper indexes on tenantId columns
- Use connection pooling
- Consider read replicas for analytics

### Caching
```bash
# Redis for session storage
REDIS_URL="redis://..."

# Enable Vercel Edge Caching
export const runtime = 'edge'
```

### CDN
- Use Vercel Edge Network
- Optimize images with next/image
- Enable compression

## Quick Reference Commands

```bash
# Development
./scripts/setup-environment.sh development
pnpm dev

# Production Setup
./scripts/setup-environment.sh production
pnpm build

# Database Operations
pnpm db:generate
pnpm db:push
pnpm db:studio

# Testing
npx tsx scripts/test-basic-schema.ts

# Deployment
vercel --prod
railway up
```