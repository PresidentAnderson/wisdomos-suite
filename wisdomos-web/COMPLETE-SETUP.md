# 🚀 WisdomOS Complete Setup Guide

## Current Status
✅ **Application Deployed**: https://wisdomos-pn9z3w8iz-axaiinovation.vercel.app
✅ **GitHub Repository**: https://github.com/PresidentAnderson/wisdomos-web
✅ **Environment Variables**: JWT_SECRET configured in Vercel
⏳ **Database**: Needs PostgreSQL connection string

## Quick Setup (2 Options)

### Option 1: Use Supabase (Recommended - Free)

1. **Create Supabase Account & Project**:
   ```
   1. Go to https://supabase.com
   2. Sign up/Login
   3. Click "New Project"
   4. Name: wisdomos-database
   5. Password: [Generate strong password]
   6. Region: [Choose closest]
   7. Wait 1-2 minutes for setup
   ```

2. **Get Connection String**:
   ```
   Settings → Database → Connection string → URI
   Copy the string (looks like):
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

3. **Add to Vercel**:
   ```bash
   # Replace with your actual connection string
   echo "postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres" | vercel env add DATABASE_URL production
   ```

4. **Deploy**:
   ```bash
   vercel --prod --yes
   ```

### Option 2: Use Neon.tech (Alternative - Free)

1. **Create Neon Account & Database**:
   ```
   1. Go to https://neon.tech
   2. Sign up/Login
   3. Create database
   4. Copy connection string from dashboard
   ```

2. **Add to Vercel & Deploy**:
   ```bash
   echo "YOUR_NEON_CONNECTION_STRING" | vercel env add DATABASE_URL production
   vercel --prod --yes
   ```

## Local Development Setup

For immediate local testing with SQLite:

```bash
# 1. Install dependencies
npm install

# 2. Set up local database
DATABASE_URL="file:./prisma/dev.db" npx prisma db push --accept-data-loss

# 3. Seed database (optional)
DATABASE_URL="file:./prisma/dev.db" npx prisma db seed

# 4. Start development server
npm run dev
```

## Production Database Setup

Once you have your PostgreSQL connection string:

1. **Update Vercel Environment**:
   ```bash
   # Remove empty DATABASE_URL
   vercel env rm DATABASE_URL production
   
   # Add real DATABASE_URL
   echo "YOUR_POSTGRESQL_CONNECTION_STRING" | vercel env add DATABASE_URL production
   ```

2. **Switch Schema to PostgreSQL**:
   ```bash
   # Copy PostgreSQL schema
   cp prisma/schema.postgresql.prisma prisma/schema.prisma
   
   # Commit changes
   git add -A
   git commit -m "Switch to PostgreSQL for production"
   git push
   ```

3. **Initialize Production Database**:
   ```bash
   # Set your DATABASE_URL
   export DATABASE_URL="YOUR_POSTGRESQL_CONNECTION_STRING"
   
   # Push schema to production
   npx prisma db push
   
   # Seed with demo data (optional)
   npx prisma db seed
   ```

4. **Trigger Deployment**:
   ```bash
   vercel --prod --yes
   ```

## Features Available

### ✅ Implemented Features
- **Goals Management**: Create, track, mark as sprint goals
- **"Why Important" Field**: Deep purpose tracking for each goal
- **Sprint Goals**: Priority checkbox for urgent goals
- **Settings Page**: Feature toggles for all modules
- **Privacy Controls**: Hide/show journal entries
- **Contributions System**: Track strengths and acknowledgments
- **Autobiography**: Year-by-year life documentation
- **Toxicity Chart**: Life boundary tracking with radar visualization
- **Authentication**: Secure JWT-based login

### 🎯 Application Routes
- `/` - Homepage with login
- `/dashboard` - Main dashboard
- `/goals` - Goals management
- `/contributions` - Personal contributions
- `/autobiography` - Life timeline
- `/assessments` - Toxicity chart & boundaries
- `/settings` - User preferences

## Testing the Application

1. **Demo Login**:
   - Email: `demo@wisdomos.app`
   - Auto-creates account on first login

2. **Test Features**:
   - Create a goal with importance reason
   - Mark goals as sprint priorities
   - Toggle features in settings
   - Add contributions
   - Document autobiography years
   - Track boundaries in assessments

## Docker Deployment (Optional)

```bash
# Build Docker image
docker build -t wisdomos-web .

# Run with Docker Compose
docker-compose up -d

# Access at http://localhost:3000
```

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL allows connections from Vercel IPs
- For Supabase: Enable "Direct connections" in settings
- For Neon: Ensure database is active (not paused)

### Build Errors
```bash
# Clear cache and rebuild
vercel --force

# Check logs
vercel logs
```

### Environment Variables Not Working
- Redeploy after adding variables: `vercel --prod`
- Verify in Vercel dashboard: Settings → Environment Variables

## Support & Documentation

- **Live App**: https://wisdomos-pn9z3w8iz-axaiinovation.vercel.app
- **GitHub**: https://github.com/PresidentAnderson/wisdomos-web
- **Vercel Dashboard**: https://vercel.com/axaiinovation/wisdomos-web

## Next Steps

1. ✅ Create PostgreSQL database (Supabase/Neon)
2. ✅ Add DATABASE_URL to Vercel
3. ✅ Initialize database schema
4. ✅ Test all features
5. 🎉 Share with users!

---
*WisdomOS - Your Personal Growth Operating System*