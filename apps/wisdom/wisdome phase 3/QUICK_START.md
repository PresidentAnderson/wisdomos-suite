# 🚀 WisdomOS Phase 3 - Quick Start Guide

## ✅ What's Already Done

- ✅ Repository imported from GitHub
- ✅ Dependencies installed (180 packages)
- ✅ Supabase anon key configured
- ✅ Security secrets generated (JWT, NextAuth, Encryption Key)
- ✅ `.env.local` file created with partial configuration
- ✅ 1Password setup script ready

## 🔐 1Password Setup (Recommended)

### Option A: Automated Setup with Script

1. **Install 1Password CLI** (if not already installed):
   ```bash
   brew install --cask 1password-cli
   ```

2. **Sign in to 1Password**:
   ```bash
   op signin
   ```

3. **Run the setup script**:
   ```bash
   ./setup-1password.sh
   ```

   The script will prompt you for:
   - Supabase Service Role Key
   - Supabase JWT Secret
   - Database Password

4. **Run commands with secrets injected**:
   ```bash
   # Use 1Password CLI to inject secrets
   op run -- npm run dev
   op run -- npm run db:generate
   ```

### Option B: Manual 1Password Setup

See `1PASSWORD_CREDENTIALS.md` for detailed instructions on manually storing credentials in 1Password.

## ⚙️ Manual Configuration (Without 1Password)

If you prefer not to use 1Password, complete these steps:

### 1. Get Missing Supabase Credentials

Go to: https://supabase.com/dashboard/project/yvssmqyphqgvpkwudeoa

Navigate to **Project Settings → API** and copy:

- **Service Role Key**: The `service_role` secret key
- **JWT Secret**: From the JWT Settings section

### 2. Update .env.local

Edit `.env.local` and replace:

```bash
# Add your service role key
SUPABASE_SERVICE_KEY=eyJ... (your actual service role key)

# Add your JWT secret
SUPABASE_JWT_SECRET=your_actual_jwt_secret

# Add your database password
DATABASE_URL=postgresql://postgres.yvssmqyphqgvpkwudeoa:YOUR_ACTUAL_PASSWORD@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

## 🗄️ Database Setup

Once your credentials are configured:

### 1. Generate Prisma Client
```bash
npm run db:generate
```

### 2. Initialize Database
```bash
npm run db:init
```

Or manually run migrations in Supabase SQL Editor:
1. Open: https://supabase.com/dashboard/project/yvssmqyphqgvpkwudeoa/editor
2. Run: `supabase/migrations/000_core_schema.sql`
3. Run: `supabase/migrations/001_phase3_schema.sql`

### 3. Test Database Connection
```bash
npm run db:test
```

### 4. Seed Demo Data (Optional)
```bash
npm run db:seed:demo
```

## 🚀 Start Development

### Start All Services
```bash
# With 1Password CLI
op run -- npm run dev

# Or without 1Password
npm run dev
```

This starts:
- **Web App**: http://localhost:3000
- **API Server**: http://localhost:4000
- **Community Hub**: http://localhost:3002

### Start Individual Services

```bash
# Web frontend only
npm run web:dev

# API backend only
npm run api:dev

# Mobile app
npm run mobile:dev
npm run mobile:ios
npm run mobile:android
```

## 📊 Database Tools

```bash
# Open Prisma Studio (Database GUI)
npm run db:studio

# Push schema changes
npm run db:push

# Create new migration
npm run db:migrate

# Reset database (careful!)
npm run db:reset
```

## 🧪 Testing

```bash
# Run all tests
npm run test

# API tests
npm run --filter @wisdomos/api test

# E2E tests
npm run --filter @wisdomos/api test:e2e

# Type checking
npm run --filter @wisdomos/web type-check
```

## 🔍 Verify Setup

### Checklist:
- [ ] Supabase project accessible
- [ ] All environment variables set in `.env.local`
- [ ] Prisma client generated
- [ ] Database migrations applied
- [ ] Development servers start without errors
- [ ] Can access http://localhost:3000
- [ ] Can access http://localhost:4000/health

### Test the Stack:

1. **Visit Web App**: http://localhost:3000
2. **Try creating an account**
3. **Check API health**: http://localhost:4000/health
4. **View database**: `npm run db:studio`

## 📁 Project Structure

```
wisdomos-phase3/
├── apps/
│   ├── api/          # NestJS backend API
│   ├── web/          # Next.js web frontend
│   ├── mobile/       # React Native mobile app
│   └── community/    # Community hub
├── packages/
│   ├── database/     # Prisma schema & migrations
│   ├── ui/          # Shared UI components
│   ├── core/        # Business logic
│   └── types/       # TypeScript definitions
├── supabase/
│   └── migrations/  # Database migrations
└── scripts/         # Utility scripts
```

## 🛠️ Common Commands

```bash
# Development
npm run dev              # Start all services
npm run build            # Build for production
npm run lint             # Run linters

# Database
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema changes
npm run db:studio        # Open database GUI
npm run db:seed:demo     # Seed demo data

# Individual Apps
npm run web:dev          # Web app
npm run api:dev          # API server
npm run mobile:dev       # Mobile app

# Testing
npm run test             # Run all tests
npm run test:e2e         # E2E tests
```

## 🔒 Security Notes

### Generated Secrets (Already in .env.local):
- ✅ NextAuth Secret: `6ltD7aFeOw/xo+bnT4xT4B74Cw0l4kmtZbfuqXPQXRY=`
- ✅ JWT Secret: `EkcRMPMod1rZdCWiSvtlBChqeFgAutkg3uuDAvzqJZk=`
- ✅ Master Encryption Key: `OW4DTrpH26TcIC8cfmzEwvNXPa9KzmFsV5ASfdWqLss=`

### Still Needed:
- ⚠️ Supabase Service Role Key (from dashboard)
- ⚠️ Supabase JWT Secret (from dashboard)
- ⚠️ Database Password (from project setup)

### Important:
- 🔒 `.env.local` is in `.gitignore` - never commit it
- 🔄 Consider rotating the Supabase anon key (it was shared in conversation)
- 🛡️ Use different credentials for production
- 📦 Store production secrets in Vercel/deployment platform

## 🆘 Troubleshooting

### Database Connection Errors
```bash
# Check your DATABASE_URL is correct
echo $DATABASE_URL

# Test connection
npm run db:test

# Regenerate Prisma client
npm run db:generate
```

### Port Already in Use
```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change port in .env.local
PORT=3001 npm run web:dev
```

### Module Not Found Errors
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## 📚 Additional Resources

- **Setup Instructions**: `SETUP_INSTRUCTIONS.md`
- **Brand Guidelines**: `BRAND-GUIDELINES.md`
- **Deployment Guide**: `DEPLOYMENT_GUIDE.md`
- **1Password Setup**: `1PASSWORD_CREDENTIALS.md`
- **Multi-Tenancy**: `MULTI_TENANCY_GUIDE.md`
- **Contributing**: `CONTRIBUTION_FULFILLMENT_DOCUMENTATION.md`

## 🎯 Next Steps

1. ✅ Complete missing Supabase credentials
2. ✅ Run database migrations
3. ✅ Start development servers
4. ✅ Create test user account
5. ✅ Explore the Phoenix dashboard
6. 📖 Read `BRAND-GUIDELINES.md` for design principles
7. 🎨 Start building features!

---

**Need Help?**
- Check troubleshooting section above
- Review documentation in project root
- Check Supabase logs: https://supabase.com/dashboard/project/yvssmqyphqgvpkwudeoa/logs

**Ready to build?** Run `npm run dev` and visit http://localhost:3000 🚀
