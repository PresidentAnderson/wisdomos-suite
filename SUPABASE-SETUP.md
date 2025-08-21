# WisdomOS Supabase Database Setup Guide

## Prerequisites
- Supabase account (free tier available)
- Node.js and npm installed
- WisdomOS project cloned locally

## Step 1: Create Supabase Project

1. Visit [https://supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in project details:
   - **Name**: `wisdomos-database` (or your preference)
   - **Database Password**: Generate a strong password (save it securely!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is sufficient for development

## Step 2: Get Database Connection String

1. In your Supabase dashboard, go to **Settings** → **Database**
2. Find the "Connection string" section
3. Copy the **URI** format connection string
4. It should look like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

## Step 3: Configure Environment Variables

1. Update `.env.local` in your project root:
   ```env
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   JWT_SECRET=7e412fda0c6593b748c07a84a79a5a77bd00e9e59ff79edd77e44a0ca47a68d9aecd96c7981553072d155d36b0e167d7df78676765ae83718b04ec9aafc7ceef
   ```

2. Replace `[YOUR-PASSWORD]` and `[PROJECT-REF]` with your actual values

## Step 4: Initialize Database

Run the setup script:
```bash
./setup-database.sh
```

Or manually run the commands:
```bash
# Generate Prisma client
npm run prisma:generate

# Push schema to database
npm run prisma:push

# Seed with demo data
npm run prisma:seed
```

## Step 5: Verify Setup

1. **Check tables in Supabase**:
   - Go to your Supabase dashboard
   - Navigate to Table Editor
   - You should see all WisdomOS tables created

2. **Test locally**:
   ```bash
   # View data in Prisma Studio
   npm run prisma:studio
   
   # Start development server
   npm run dev
   ```

3. **Login with demo account**:
   - Email: `demo@wisdomos.app`
   - The app uses JWT auth, so any password will work for demo

## Step 6: Deploy to Vercel

1. **Add environment variables to Vercel**:
   ```bash
   vercel env add DATABASE_URL
   vercel env add JWT_SECRET
   ```

2. **Or via Vercel dashboard**:
   - Go to your project settings
   - Add environment variables:
     - `DATABASE_URL`: Your Supabase connection string
     - `JWT_SECRET`: The generated secret from .env.local

## Database Schema Overview

The WisdomOS database includes these main entities:

- **Users**: User accounts and authentication
- **LifeAreas**: 13 predefined life areas (Work, Health, Finance, etc.)
- **Contacts**: People in your network
- **Contributions**: Strengths, acknowledgments, natural gifts
- **AutobiographyEntries**: Life story documentation
- **Goals**: Personal objectives and sprint goals
- **Interactions**: Communication tracking
- **Assessments**: Relationship evaluations
- **Settings**: User preferences

## Demo Data

The seed script creates:
- Demo user: `demo@wisdomos.app`
- 13 life areas with icons and descriptions
- Sample contacts (partner, friend, therapist, mentor)
- Example contributions and goals
- Relationship assessments and interactions

## Security Notes

- **Never commit** your actual DATABASE_URL to version control
- Use strong, unique passwords for your Supabase project
- The JWT_SECRET should be kept secure and regenerated for production
- Consider enabling Row Level Security (RLS) in Supabase for additional protection

## Troubleshooting

- **Connection errors**: Verify your DATABASE_URL format and credentials
- **Migration issues**: Check Supabase logs in your dashboard
- **Seed failures**: Ensure all tables are created before seeding
- **Auth issues**: Verify JWT_SECRET is properly set

## Useful Commands

```bash
# View database in browser
npm run prisma:studio

# Reset database (recreate all tables)
npm run prisma:push --force-reset

# Re-seed database
npm run prisma:seed

# Generate new Prisma client after schema changes
npm run prisma:generate
```