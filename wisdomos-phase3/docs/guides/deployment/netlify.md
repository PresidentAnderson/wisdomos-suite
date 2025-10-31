# Netlify Deployment Guide

Deploy WisdomOS web application to Netlify.

## Prerequisites

- GitHub repository
- Netlify account (free tier available)
- Supabase database
- Separate API server hosting (Railway, Render, etc.)

## Quick Deploy

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/wisdomos)

## Step-by-Step Deployment

### 1. Import from Git

1. Go to [app.netlify.com](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Choose GitHub and select your repository
4. Configure build settings

### 2. Build Settings

```yaml
# Base directory
base = "apps/web"

# Build command
[build]
  command = "pnpm install && pnpm db:generate && pnpm build"
  publish = "apps/web/out"  # or .next if using SSR

# Node version
[build.environment]
  NODE_VERSION = "20"
  PNPM_VERSION = "8.15.0"
```

Or configure in UI:
- **Base directory**: `apps/web`
- **Build command**: `pnpm install && pnpm db:generate && pnpm build`
- **Publish directory**: `apps/web/out`

### 3. Environment Variables

Add in Site Settings → Environment Variables:

```env
# Node
NODE_ENV=production
NODE_VERSION=20

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Auth
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-site.netlify.app

# API URL (must be separate service)
NEXT_PUBLIC_API_URL=https://your-api.railway.app

# Optional: HubSpot
HUBSPOT_API_KEY=pat-na1-xxxxx
```

### 4. Deploy

Click "Deploy site" and wait for build to complete.

## Custom Domain

### Add Domain

1. Go to Site Settings → Domain management
2. Click "Add custom domain"
3. Enter your domain: `yourdomain.com`

### Configure DNS

**Option A: Netlify DNS (Recommended)**
```
Update nameservers at your registrar:
dns1.p01.nsone.net
dns2.p01.nsone.net
dns3.p01.nsone.net
dns4.p01.nsone.net
```

**Option B: External DNS**
```
Type: CNAME
Name: www
Value: your-site.netlify.app

Type: A
Name: @
Value: 75.2.60.5
```

### SSL Certificate

Netlify automatically provisions Let's Encrypt SSL. Enable:
- Force HTTPS
- HSTS headers

## API Server Deployment

Netlify doesn't host long-running servers. Deploy your NestJS API separately:

### Recommended API Hosts

**Railway** (Easy)
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

**Render** (Free tier)
```bash
# Connect repository in dashboard
# Add environment variables
# Deploy automatically on push
```

**Fly.io** (Global edge)
```bash
flyctl launch
flyctl deploy
```

Then update in Netlify:
```env
NEXT_PUBLIC_API_URL=https://your-api.railway.app
```

## Netlify Functions (Serverless)

For simple API endpoints, use Netlify Functions:

### Create Function

```ts
// netlify/functions/hello.ts
import type { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Hello from Netlify!' })
  };
};
```

### Access Function

```
https://your-site.netlify.app/.netlify/functions/hello
```

### Environment in Functions

```ts
const dbUrl = process.env.DATABASE_URL;
```

## netlify.toml Configuration

Create `netlify.toml` in root:

```toml
[build]
  base = "apps/web"
  command = "pnpm install && pnpm db:generate && pnpm build"
  publish = "apps/web/out"

[build.environment]
  NODE_VERSION = "20"
  PNPM_VERSION = "8.15.0"

# Redirect rules
[[redirects]]
  from = "/api/*"
  to = "https://your-api.railway.app/api/:splat"
  status = 200
  force = true

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Headers
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

# Edge functions
[[edge_functions]]
  function = "geolocation"
  path = "/api/location"
```

## Split Testing

Test different versions:

```bash
# Create branch deploy
git checkout -b experiment
git push origin experiment

# Configure split in Netlify UI:
# Site Settings → Split Testing
# 50% to main branch
# 50% to experiment branch
```

## Forms Integration

Netlify can handle form submissions:

```tsx
<form name="contact" method="POST" data-netlify="true">
  <input type="hidden" name="form-name" value="contact" />
  <input type="email" name="email" required />
  <textarea name="message" required></textarea>
  <button type="submit">Submit</button>
</form>
```

View submissions in: Site Settings → Forms

## Build Hooks

Trigger builds programmatically:

1. Site Settings → Build & deploy → Build hooks
2. Create hook named "Content Update"
3. Get webhook URL
4. Trigger: `curl -X POST -d {} https://api.netlify.com/build_hooks/xxxxx`

## Troubleshooting

### Build Fails

Check build log for errors. Common issues:
- Missing dependencies
- Wrong Node version
- Environment variables not set

### API Requests Fail

Ensure CORS is configured on API server:
```ts
app.enableCors({
  origin: 'https://your-site.netlify.app',
  credentials: true
});
```

### Functions Timeout

Netlify Functions timeout at 10s (free) or 26s (pro).
Use background functions for longer tasks:

```ts
// netlify/functions/background-task.ts
import type { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  // Long running task
  return { statusCode: 202 };
};
```

## Monitoring

### Analytics

Enable in: Site Settings → Analytics

Tracks:
- Pageviews
- Unique visitors
- Top pages
- Not found pages

### Logs

View in: Deploys → [Your deployment] → Functions

```bash
# Or via CLI
netlify logs:function hello
```

## Cost Overview

### Free Tier
- 300 build minutes/month
- 100 GB bandwidth
- Unlimited sites
- Basic analytics

### Pro ($19/month)
- 1000 build minutes
- 400 GB bandwidth
- Background functions
- Split testing
- Role-based access

## Next Steps

1. ✅ Deploy web application
2. ✅ Deploy API server separately
3. ✅ Configure custom domain
4. ✅ Set up SSL
5. ✅ Review [Production Checklist](./production-checklist.md)

---

**Deployed to Netlify?** Make sure API is hosted separately, then continue to [Production Checklist](./production-checklist.md) →
