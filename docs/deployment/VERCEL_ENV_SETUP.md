# Vercel Environment Variables Setup

**Status**: Ready to configure
**Project**: wisdomos-phoenix-frontend
**Date**: October 29, 2025

---

## 🔑 REQUIRED ENVIRONMENT VARIABLES

Set these in Vercel Dashboard: https://vercel.com/axaiinovation/wisdomos-phoenix-frontend/settings/environment-variables

### 1. Database (Supabase)

```bash
# Pooled connection for Prisma (Port 6543)
DATABASE_URL=postgresql://postgres.yvssmqyphqgvpkwudeoa:[YOUR_PASSWORD]@aws-0-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true

# Direct connection for migrations (Port 5432)
DIRECT_URL=postgresql://postgres.yvssmqyphqgvpkwudeoa:[YOUR_PASSWORD]@aws-0-us-east-2.pooler.supabase.com:5432/postgres
```

**Get Database Password**: https://supabase.com/dashboard/project/yvssmqyphqgvpkwudeoa/settings/database

---

### 2. Supabase Client

```bash
# Supabase Project URL
NEXT_PUBLIC_SUPABASE_URL=https://yvssmqyphqgvpkwudeoa.supabase.co

# Supabase Anonymous Key (Public - safe to expose)
NEXT_PUBLIC_SUPABASE_ANON_KEY=[GET_FROM_SUPABASE_DASHBOARD]

# Supabase Service Role Key (Private - server-side only)
SUPABASE_SERVICE_ROLE_KEY=[GET_FROM_SUPABASE_DASHBOARD]
```

**Get API Keys**: https://supabase.com/dashboard/project/yvssmqyphqgvpkwudeoa/settings/api

---

### 3. NextAuth Configuration

```bash
# NextAuth URL (Update after deployment)
NEXTAUTH_URL=https://wisdomos-phoenix-frontend.vercel.app

# NextAuth Secret (GENERATED BELOW)
NEXTAUTH_SECRET=i4NigNl52tlYyQ2m6WuUqJ2eGnm//OQwdkYFk+065B4=
```

**Note**: Update `NEXTAUTH_URL` to your actual Vercel deployment URL after first deploy.

---

### 4. Site Configuration

```bash
# Public Site URL
NEXT_PUBLIC_SITE_URL=https://wisdomos-phoenix-frontend.vercel.app

# API Base URL
NEXT_PUBLIC_API_BASE=https://wisdomos-phoenix-frontend.vercel.app/api

# App Domain
NEXT_PUBLIC_APP_DOMAIN=wisdomos-phoenix-frontend.vercel.app
```

---

### 5. Build Configuration

```bash
# Node Environment
NODE_ENV=production

# Disable Next.js Telemetry
NEXT_TELEMETRY_DISABLED=1

# Build Platform
NEXT_PUBLIC_BUILD_PLATFORM=vercel

# Phoenix Mode
NEXT_PUBLIC_PHOENIX_MODE=production
```

---

## 📋 STEP-BY-STEP SETUP

### Option 1: Via Vercel Dashboard (Recommended)

1. **Go to Environment Variables**:
   https://vercel.com/axaiinovation/wisdomos-phoenix-frontend/settings/environment-variables

2. **Add Each Variable**:
   - Click "Add New"
   - Enter Variable Name
   - Enter Value
   - Select Environment: **Production, Preview, Development** (all three)
   - Click "Save"

3. **Required Variables** (in order):
   ```
   DATABASE_URL → [See above]
   DIRECT_URL → [See above]
   NEXT_PUBLIC_SUPABASE_URL → https://yvssmqyphqgvpkwudeoa.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY → [From Supabase Dashboard]
   SUPABASE_SERVICE_ROLE_KEY → [From Supabase Dashboard]
   NEXTAUTH_URL → https://wisdomos-phoenix-frontend.vercel.app
   NEXTAUTH_SECRET → i4NigNl52tlYyQ2m6WuUqJ2eGnm//OQwdkYFk+065B4=
   NEXT_PUBLIC_SITE_URL → https://wisdomos-phoenix-frontend.vercel.app
   NEXT_PUBLIC_API_BASE → https://wisdomos-phoenix-frontend.vercel.app/api
   ```

4. **Redeploy**:
   After adding all variables, trigger a new deployment

---

### Option 2: Via Vercel CLI

```bash
cd "/Volumes/DevOPS 2025/01_DEVOPS_PLATFORM/wisdomOS 2026/apps/web"

# Set production environment variables
vercel env add DATABASE_URL production
# Paste: postgresql://postgres.yvssmqyphqgvpkwudeoa:[PASSWORD]@aws-0-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true

vercel env add DIRECT_URL production
# Paste: postgresql://postgres.yvssmqyphqgvpkwudeoa:[PASSWORD]@aws-0-us-east-2.pooler.supabase.com:5432/postgres

vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Paste: https://yvssmqyphqgvpkwudeoa.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Paste: [Your anon key from Supabase]

vercel env add SUPABASE_SERVICE_ROLE_KEY production
# Paste: [Your service role key from Supabase]

vercel env add NEXTAUTH_URL production
# Paste: https://wisdomos-phoenix-frontend.vercel.app

vercel env add NEXTAUTH_SECRET production
# Paste: i4NigNl52tlYyQ2m6WuUqJ2eGnm//OQwdkYFk+065B4=

vercel env add NEXT_PUBLIC_SITE_URL production
# Paste: https://wisdomos-phoenix-frontend.vercel.app

vercel env add NEXT_PUBLIC_API_BASE production
# Paste: https://wisdomos-phoenix-frontend.vercel.app/api
```

---

## 🔍 GET SUPABASE CREDENTIALS

### Database Password
1. Go to: https://supabase.com/dashboard/project/yvssmqyphqgvpkwudeoa/settings/database
2. Click "Database Password" section
3. Use existing password or reset it
4. Copy password for DATABASE_URL and DIRECT_URL

### API Keys
1. Go to: https://supabase.com/dashboard/project/yvssmqyphqgvpkwudeoa/settings/api
2. Find "Project API keys"
3. Copy:
   - **anon public** → NEXT_PUBLIC_SUPABASE_ANON_KEY
   - **service_role** → SUPABASE_SERVICE_ROLE_KEY

---

## ✅ VERIFICATION CHECKLIST

After setting all variables:

- [ ] DATABASE_URL set (with port 6543 and ?pgbouncer=true)
- [ ] DIRECT_URL set (with port 5432)
- [ ] NEXT_PUBLIC_SUPABASE_URL set
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY set
- [ ] SUPABASE_SERVICE_ROLE_KEY set
- [ ] NEXTAUTH_URL set
- [ ] NEXTAUTH_SECRET set (generated above)
- [ ] NEXT_PUBLIC_SITE_URL set
- [ ] NEXT_PUBLIC_API_BASE set
- [ ] All variables applied to Production environment

---

## 🚀 DEPLOY AFTER SETUP

### Via Vercel Dashboard
1. Go to: https://vercel.com/axaiinovation/wisdomos-phoenix-frontend
2. Click "Redeploy" on latest deployment
3. Select "Use existing build cache" or "Rebuild"
4. Click "Redeploy"

### Via Vercel CLI
```bash
cd "/Volumes/DevOPS 2025/01_DEVOPS_PLATFORM/wisdomOS 2026/apps/web"
vercel --prod
```

---

## 🐛 TROUBLESHOOTING

### Error: "Prisma Client could not locate the Query Engine"

**Cause**: DATABASE_URL not set or invalid

**Solution**:
1. Verify DATABASE_URL is set in Vercel
2. Check password is correct
3. Ensure port is 6543 with ?pgbouncer=true

---

### Error: "Invalid Supabase URL"

**Cause**: NEXT_PUBLIC_SUPABASE_URL not set or wrong

**Solution**:
1. Set to: https://yvssmqyphqgvpkwudeoa.supabase.co
2. No trailing slash

---

### Error: "NextAuth configuration error"

**Cause**: NEXTAUTH_URL or NEXTAUTH_SECRET not set

**Solution**:
1. Set NEXTAUTH_URL to your Vercel URL
2. Use the generated secret above
3. Redeploy

---

## 📊 EXPECTED BUILD OUTPUT

After setting variables, deployment should:

```
✓ Installing dependencies
✓ Generating Prisma Client
✓ Building Next.js application
✓ Collecting page data
✓ Finalizing page optimization
✓ Collecting build traces
✓ Uploading deployment
✓ Deployment ready
```

**Build Time**: ~3-5 minutes

---

## 🎯 FINAL STEP

After successful deployment:

1. **Get Deployment URL** from Vercel
2. **Update NEXTAUTH_URL** environment variable with actual URL
3. **Test Application**:
   - Visit deployment URL
   - Test authentication
   - Check API routes
   - Verify database connection

---

## 📞 SUPPORT LINKS

- **Vercel Dashboard**: https://vercel.com/axaiinovation/wisdomos-phoenix-frontend
- **Environment Variables**: https://vercel.com/axaiinovation/wisdomos-phoenix-frontend/settings/environment-variables
- **Supabase Dashboard**: https://supabase.com/dashboard/project/yvssmqyphqgvpkwudeoa
- **Supabase API Keys**: https://supabase.com/dashboard/project/yvssmqyphqgvpkwudeoa/settings/api

---

**Status**: Environment variables documented and ready to configure
**NextAuth Secret Generated**: ✅
**Next Step**: Add variables in Vercel Dashboard and deploy
