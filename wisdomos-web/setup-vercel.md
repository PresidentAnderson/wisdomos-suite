# Deploy WisdomOS to Vercel

## Quick Setup

### 1. Get a Free PostgreSQL Database

Choose one option:

#### Option A: Supabase (Recommended - Free)
1. Go to https://supabase.com
2. Click "Start your project"
3. Create new project
4. Go to Settings → Database
5. Copy the "Connection string" (URI)

#### Option B: Neon.tech (Free)
1. Go to https://neon.tech
2. Sign up and create database
3. Copy connection string from dashboard

#### Option C: Vercel Postgres
1. In Vercel dashboard → Storage
2. Create Postgres database
3. Copy connection string

### 2. Deploy to Vercel

```bash
# Deploy (when prompted, use these values)
vercel

# When asked for environment variables, skip and set them in dashboard
```

### 3. Set Environment Variables in Vercel Dashboard

1. Go to your project on https://vercel.com
2. Navigate to Settings → Environment Variables
3. Add these variables:

```
DATABASE_URL = [Your PostgreSQL connection string from step 1]
JWT_SECRET = any-secret-string-change-this-in-production
```

4. Click "Save" for each variable

### 4. Redeploy

```bash
vercel --prod
```

### 5. Initialize Database

After successful deployment:

```bash
# Set your DATABASE_URL locally
export DATABASE_URL="your-connection-string"

# Push schema to production database
npx prisma db push

# Seed with demo data (optional)
npx prisma db seed
```

### 6. Access Your App

Your app is now live at: `https://[your-project].vercel.app`

Demo login: `demo@wisdomos.app`

## Troubleshooting

### Database Connection Issues
- Make sure your database allows connections from Vercel IPs
- For Supabase: Check that "Allow direct connections" is enabled
- For Neon: Ensure the database is active (not suspended)

### Build Errors
- Clear cache: `vercel --force`
- Check logs: `vercel logs`

### Environment Variables Not Working
- Redeploy after adding variables: `vercel --prod`
- Ensure no typos in variable names
- Check that DATABASE_URL includes `?schema=public` at the end