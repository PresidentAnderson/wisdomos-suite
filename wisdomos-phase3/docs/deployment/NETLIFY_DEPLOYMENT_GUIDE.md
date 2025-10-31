# Netlify Deployment Guide - WisdomOS Web Frontend

**Status**: Ready to Deploy via Dashboard
**Date**: October 29, 2025
**Repository**: https://github.com/PresidentAnderson/wisdomos-phase3

---

## 🚀 OPTION 1: Deploy via Netlify Dashboard (Recommended)

The Netlify CLI has interactive prompt issues with the monorepo structure. The easiest way is through the dashboard:

### Step 1: Go to Netlify Dashboard
Visit: https://app.netlify.com/

### Step 2: Import from GitHub
1. Click "Add new site" → "Import an existing project"
2. Choose "GitHub" as your Git provider
3. Authorize Netlify to access your GitHub account if needed
4. Select repository: **PresidentAnderson/wisdomos-phase3**

### Step 3: Configure Build Settings

**Base directory**: `apps/web`

**Build command**:
```bash
npm install && npm run build
```

**Publish directory**:
```
apps/web/.next
```

**Functions directory** (optional):
```
netlify/functions
```

### Step 4: Environment Variables

Add these in Netlify Dashboard → Site settings → Environment variables:

#### Required
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://yvssmqyphqgvpkwudeoa.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Database
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-east-2.pooler.supabase.com:6543/postgres
```

#### Optional
```bash
# Build configuration
NODE_VERSION=20
NEXT_TELEMETRY_DISABLED=1
NEXT_PUBLIC_SITE_URL=https://your-site.netlify.app
```

### Step 5: Deploy

Click **"Deploy site"**

Netlify will:
1. Clone your repository
2. Install dependencies
3. Run the build command
4. Deploy to CDN

**Deployment time**: ~3-5 minutes

---

## 🚀 OPTION 2: Deploy via Netlify CLI (Manual)

If you want to try CLI deployment without interactive prompts:

### Create Site First
```bash
cd "/Volumes/DevOPS 2025/01_DEVOPS_PLATFORM/wisdomOS 2026"

# Create site non-interactively
netlify api createSite --data='{"name":"wisdomos-web","account_slug":"presidentanderson"}' > netlify-site.json

# Get site ID
SITE_ID=$(cat netlify-site.json | grep -o '"id":"[^"]*' | cut -d'"' -f4)
echo $SITE_ID
```

### Link Directory
```bash
cd apps/web
netlify link --id=$SITE_ID
```

### Build and Deploy
```bash
# Build the app
npm install
npm run build

# Deploy
netlify deploy --prod --dir=.next --site=$SITE_ID
```

---

## 🚀 OPTION 3: Deploy via GitHub Actions (CI/CD)

Create `.github/workflows/deploy-netlify.yml`:

```yaml
name: Deploy to Netlify

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        working-directory: ./apps/web
        run: npm install

      - name: Build
        working-directory: ./apps/web
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}

      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v2.0
        with:
          publish-dir: './apps/web/.next'
          production-branch: main
          github-token: ${{ secrets.GITHUB_TOKEN }}
          deploy-message: "Deploy from GitHub Actions"
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

---

## 📊 WHAT GETS DEPLOYED

### Frontend Application
- **Framework**: Next.js 14
- **Type**: React SPA with API routes
- **Pages**: Dashboard, Journal, Fulfillment, etc.
- **Components**: Full UI component library

### Features
- ✅ Server-side rendering (SSR)
- ✅ Static generation (SSG)
- ✅ API routes
- ✅ Supabase integration
- ✅ Authentication
- ✅ Real-time updates

### Security Headers (from netlify.toml)
- X-Frame-Options: DENY
- X-XSS-Protection
- Content-Security-Policy
- HSTS
- Phoenix branding headers

---

## 🔍 VERIFY DEPLOYMENT

Once deployed, check:

### 1. Site URL
Your site will be available at:
```
https://[random-name].netlify.app
```

Or custom domain if configured.

### 2. Build Logs
Check build logs in Netlify dashboard:
https://app.netlify.com/sites/[your-site]/deploys

### 3. Function Logs
If using Netlify Functions:
https://app.netlify.com/sites/[your-site]/functions

### 4. Test the Site
```bash
# Test home page
curl https://your-site.netlify.app

# Test API route
curl https://your-site.netlify.app/api/health

# Test with browser
open https://your-site.netlify.app
```

---

## 🐛 TROUBLESHOOTING

### Issue: Build Fails

**Check**:
1. Build logs in Netlify dashboard
2. Node version (should be 20)
3. Environment variables are set
4. Database connection string is correct

**Solution**:
```bash
# Test build locally first
cd apps/web
npm install
npm run build
```

### Issue: API Routes Not Working

**Solution**:
- Add Netlify Functions plugin
- Configure redirects in netlify.toml (already done)
- Check environment variables

### Issue: Supabase Connection Fails

**Solution**:
1. Verify NEXT_PUBLIC_SUPABASE_URL is correct
2. Verify NEXT_PUBLIC_SUPABASE_ANON_KEY is set
3. Check Supabase project is accessible
4. Test connection:
```bash
curl https://yvssmqyphqgvpkwudeoa.supabase.co/rest/v1/
```

### Issue: Next.js Build Error

**Common causes**:
- Missing environment variables
- Database schema not applied
- TypeScript errors
- Missing dependencies

**Solution**:
```bash
# Check for errors
cd apps/web
npm run lint
npm run type-check
```

---

## 🎯 POST-DEPLOYMENT

### 1. Configure Custom Domain (Optional)
1. Go to Netlify → Site settings → Domain management
2. Add custom domain
3. Configure DNS records
4. Enable HTTPS (automatic)

### 2. Set Up Continuous Deployment
Netlify will automatically:
- Deploy on every push to `main`
- Create preview deployments for PRs
- Run build commands
- Invalidate CDN cache

### 3. Monitor Performance
- **Analytics**: Enable Netlify Analytics
- **Logs**: Check Function logs
- **Speed**: Use Lighthouse scores

### 4. Connect to Supabase
Ensure environment variables are set:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
DATABASE_URL (for server-side)
```

---

## 📋 DEPLOYMENT CHECKLIST

- [ ] GitHub repository is public or Netlify has access
- [ ] netlify.toml configuration is correct
- [ ] Environment variables are prepared
- [ ] Supabase project is running
- [ ] Database schema is deployed
- [ ] Build tested locally
- [ ] Deployed to Netlify
- [ ] Site URL accessible
- [ ] API routes working
- [ ] Supabase connection tested
- [ ] Custom domain configured (optional)

---

## 🎉 SUCCESS CRITERIA

Your deployment is successful when:

✅ Build completes without errors
✅ Site is accessible at Netlify URL
✅ Home page loads correctly
✅ API routes respond
✅ Supabase connection works
✅ Authentication flow works
✅ No console errors in browser

---

## 📞 SUPPORT

### Netlify Dashboard
https://app.netlify.com/

### Build Logs
Check real-time logs during deployment

### Community Support
- Netlify Community: https://answers.netlify.com/
- Netlify Docs: https://docs.netlify.com/

---

## 🚀 RECOMMENDED: Use Dashboard Deployment

**Why?**
- Visual configuration
- Easier debugging
- Automatic continuous deployment
- Preview deployments for PRs
- Built-in analytics

**Steps**: Just follow Option 1 above!

---

**Current Status**: Repository pushed to GitHub ✅
**Next Step**: Deploy via Netlify Dashboard
**Estimated Time**: 5 minutes

**GitHub Repo**: https://github.com/PresidentAnderson/wisdomos-phase3
**Netlify Dashboard**: https://app.netlify.com/
