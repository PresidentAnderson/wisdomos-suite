# Database Setup Guide for WisdomOS

## Step 1: Create Supabase Database

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in with your GitHub account
3. Click "New Project"
4. Fill in the project details:
   - **Name**: `wisdomos-production`
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose the region closest to your users
   - **Pricing Plan**: Free tier (sufficient for development)

5. Click "Create new project"
6. Wait for the database to be provisioned (2-3 minutes)

## Step 2: Get Database Connection String

1. In your Supabase project dashboard, go to **Settings** → **Database**
2. Scroll down to **Connection string**
3. Select **URI** tab
4. Copy the connection string (it will look like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with the password you created

## Step 3: Configure Environment Variables

### For Local Development
1. Update `.env.local` with your Supabase connection string:
   ```env
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?schema=public
   JWT_SECRET=wisdomos-production-secret-change-this-later
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

### For Vercel Production
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `wisdomos-web` project
3. Go to **Settings** → **Environment Variables**
4. Add these variables for **All Environments** (Production, Preview, Development):

   **DATABASE_URL**:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?schema=public
   ```

   **JWT_SECRET**:
   ```
   wisdomos-production-secret-change-this-later
   ```

   **NEXT_PUBLIC_APP_URL**:
   ```
   https://wisdomos-jvatg9rr9-axaiinovation.vercel.app
   ```

## Step 4: Run Database Migration

After setting up the database connection, run these commands:

```bash
# Navigate to project directory
cd /Volumes/DevOps/07-personal/wisdomos-fullstack/wisdomos-web

# Generate Prisma client with new schema
npm run prisma:generate

# Push the schema to the database
npm run prisma:push

# Seed the database with demo data
npm run prisma:seed
```

## Step 5: Deploy to Vercel

```bash
# Deploy the updated application
vercel --prod
```

## Step 6: Test the Application

1. Visit your deployed application
2. Try the demo login
3. Test the new Goals feature:
   - Create a new goal
   - Mark it as a sprint goal
   - Test the importance field
4. Test the Settings page:
   - Toggle feature settings
   - Change privacy settings
5. Verify all existing features still work

## Database Schema Overview

The database now includes:

### New Tables:
- **Goal**: User goals with importance and sprint flags
- **UserSettings**: Feature toggles and privacy preferences

### Existing Tables:
- **User**: Core user authentication
- **Contribution**: Strengths, acknowledgments, insights
- **AutobiographyEntry**: Life story documentation
- **Entry**: Journal and autobiography entries
- **Contact**: Relationship management
- **LifeArea**: Life area categorization
- **FulfillmentArea**: Life area status tracking
- **RelationshipAssessment**: Relationship evaluations
- **BoundaryAudit**: Boundary incident tracking

## Security Features

- All API routes are protected with JWT authentication
- Input validation with Zod schemas
- User isolation (users only see their own data)
- Proper error handling and logging
- Secure environment variable management

## Backup and Recovery

Supabase provides:
- Automatic daily backups (7 days retention on free tier)
- Point-in-time recovery
- Export capabilities via pg_dump

For additional backups, you can export data through:
1. Supabase dashboard → Database → Backups
2. API endpoints (when data export feature is implemented)
3. Direct PostgreSQL connection tools

## Monitoring

Monitor your database through:
1. **Supabase Dashboard**: 
   - Real-time usage metrics
   - Query performance
   - Connection statistics

2. **Vercel Analytics**: 
   - Application performance
   - Error tracking
   - User engagement

## Troubleshooting

### Common Issues:

1. **Connection String Format**: Ensure the connection string includes `?schema=public`
2. **Password Special Characters**: URL-encode special characters in passwords
3. **Environment Variables**: Ensure all environments have the same variables
4. **Prisma Generation**: Run `npm run prisma:generate` after schema changes

### Support Resources:
- [Supabase Documentation](https://supabase.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Vercel Documentation](https://vercel.com/docs)