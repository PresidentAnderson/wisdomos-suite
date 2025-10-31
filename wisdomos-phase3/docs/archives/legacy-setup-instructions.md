# WisdomOS Full Stack Setup Instructions

## Current Status
- ✅ Frontend deployed: https://wisdomos-phoenix-frontend.vercel.app
- ✅ Backend API deployed: https://api-hehupjoe3-axaiinovation.vercel.app  
- ✅ Database schema created
- ⚠️ Database connection needed

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/log in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `wisdomos-database`
   - Database Password: (generate a secure password)
   - Region: Choose closest to your users
5. Click "Create new project"
6. Wait for the project to be created (2-3 minutes)

## Step 2: Get Database Credentials

Once your project is ready:

1. Go to Project Settings → API
2. Copy these values:
   - **Project URL**: `https://your-project-ref.supabase.co`
   - **anon/public key**: `eyJ...` (public key)
   - **service_role key**: `eyJ...` (secret key)

## Step 3: Run Database Migrations

1. Open SQL Editor in your Supabase dashboard
2. Run the core schema migration:
   ```sql
   -- Copy and paste the contents of /supabase/migrations/000_core_schema.sql
   ```
3. Run the phase 3 schema migration:
   ```sql
   -- Copy and paste the contents of /supabase/migrations/001_phase3_schema.sql
   ```
4. Run the seed data:
   ```sql
   -- Copy and paste the contents of /supabase/seed.sql
   ```

## Step 4: Update Backend Environment Variables

Update the API deployment with Supabase credentials:

```bash
cd apps/api
vercel env add NEXT_PUBLIC_SUPABASE_URL
# Enter: https://your-project-ref.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY  
# Enter: your_anon_key

vercel env add SUPABASE_SERVICE_KEY
# Enter: your_service_role_key

vercel env add SUPABASE_URL
# Enter: https://your-project-ref.supabase.co

# Deploy with new environment variables
vercel --prod
```

## Step 5: Update Frontend Environment Variables

Update the web app deployment:

```bash
cd apps/web
vercel env add NEXT_PUBLIC_SUPABASE_URL
# Enter: https://your-project-ref.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# Enter: your_anon_key

vercel env add SUPABASE_SERVICE_ROLE_KEY
# Enter: your_service_role_key

vercel env add NEXT_PUBLIC_API_URL
# Enter: https://api-hehupjoe3-axaiinovation.vercel.app

# Deploy with new environment variables
vercel --prod
```

## Step 6: Test the Application

1. Visit your frontend: https://wisdomos-phoenix-frontend.vercel.app
2. Try creating an account
3. Test journal entries
4. Test life area updates
5. Verify data persistence

## Automated Setup Script

Alternatively, you can use the automated setup script:

```bash
# Update .env.local with your Supabase credentials
cp .env.local.example .env.local
# Edit .env.local with your actual credentials

# Run the setup script
./setup-database.sh
```

## Environment Variables Summary

### Required for Backend (API):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY`
- `SUPABASE_URL` (same as NEXT_PUBLIC_SUPABASE_URL)

### Required for Frontend (Web):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_API_URL`

## Verification Checklist

After setup, verify these features work:

- [ ] User registration/login
- [ ] Create journal entries
- [ ] View life areas
- [ ] Update life area scores
- [ ] Create assessments
- [ ] Manage contacts
- [ ] Upset inquiry process
- [ ] Contribution displays
- [ ] Data persistence across sessions

## Troubleshooting

### Database Connection Issues
- Verify environment variables are set correctly
- Check Supabase project is active
- Ensure RLS policies are applied

### Authentication Issues
- Verify Supabase Auth is enabled
- Check JWT secrets match
- Ensure user creation works

### API Connection Issues
- Verify CORS origins are set correctly
- Check API endpoints are responding
- Ensure environment variables are deployed

## Support

If you encounter issues:
1. Check the browser console for errors
2. Check Vercel deployment logs
3. Check Supabase logs in the dashboard
4. Verify all environment variables are set correctly