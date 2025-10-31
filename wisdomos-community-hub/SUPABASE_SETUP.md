# Supabase Setup Guide for WisdomOS Community Hub

This guide will walk you through setting up a Supabase project for the WisdomOS Community Hub application.

## Prerequisites

- A Supabase account (sign up at [supabase.com](https://supabase.com))
- Basic understanding of SQL databases

## Step 1: Create a New Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Fill in the project details:
   - **Name**: WisdomOS Community Hub
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the closest region to your users
   - **Pricing Plan**: Start with the free tier
5. Click "Create new project"
6. Wait for the project to be created (this may take a few minutes)

## Step 2: Configure Database Schema

1. Once your project is ready, go to the **SQL Editor** in your Supabase dashboard
2. Copy the contents of the `supabase-schema.sql` file from this repository
3. Paste it into the SQL editor
4. Click "Run" to execute the schema
5. Verify that all tables were created successfully by checking the **Table Editor**

You should see the following tables:
- `profiles`
- `documents`
- `activities`
- `notifications`
- `analytics_events`
- `courses`

## Step 3: Configure Authentication

1. Go to **Authentication** → **Settings** in your Supabase dashboard
2. Configure the following settings:

### Site URL
- **Site URL**: `https://your-app-domain.vercel.app` (or your custom domain)
- **Redirect URLs**: Add the following URLs:
  - `https://your-app-domain.vercel.app/auth/callback`
  - `http://localhost:3000/auth/callback` (for development)

### Email Settings
1. Go to **Authentication** → **Settings** → **SMTP Settings**
2. Either use Supabase's built-in SMTP or configure your own
3. For production, it's recommended to use your own SMTP provider (SendGrid, Mailgun, etc.)

### OAuth Providers

#### Google OAuth Setup
1. Go to **Authentication** → **Settings** → **Auth Providers**
2. Enable Google provider
3. You'll need to create a Google OAuth app:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing one
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs:
     - `https://your-project-id.supabase.co/auth/v1/callback`
   - Copy Client ID and Client Secret to Supabase

#### GitHub OAuth Setup
1. Enable GitHub provider in Supabase
2. Create a GitHub OAuth App:
   - Go to GitHub Settings → Developer settings → OAuth Apps
   - Create a new OAuth App
   - **Authorization callback URL**: `https://your-project-id.supabase.co/auth/v1/callback`
   - Copy Client ID and Client Secret to Supabase

## Step 4: Configure Row Level Security (RLS)

The schema automatically enables RLS and creates the necessary policies. Verify they're active:

1. Go to **Authentication** → **Policies**
2. You should see policies for each table
3. If any are missing, you can create them manually using the SQL editor

## Step 5: Set Up Real-time

1. Go to **Database** → **Replication**
2. Enable real-time for the following tables:
   - `documents`
   - `activities`
   - `notifications`
3. This enables real-time subscriptions for live updates

## Step 6: Get Your Environment Variables

1. Go to **Settings** → **API**
2. Copy the following values:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

3. Add these to your `.env.local` file in your Next.js project

## Step 7: Configure Storage (Optional)

If you plan to store files (like profile pictures or document attachments):

1. Go to **Storage**
2. Create a new bucket called `documents` or `avatars`
3. Set up policies for file access
4. Configure file upload limits and allowed file types

## Step 8: Set Up Edge Functions (Optional)

For advanced features like email notifications or background processing:

1. Go to **Edge Functions**
2. Deploy functions for:
   - Sending welcome emails
   - Processing analytics data
   - Generating reports

## Step 9: Production Configuration

### Security Settings
1. **JWT Settings**: Verify JWT expiry times
2. **Rate Limiting**: Configure appropriate limits
3. **CORS**: Set up proper CORS policies

### Performance
1. **Connection Pooling**: Enable for better performance
2. **Database Optimization**: Add indexes as needed
3. **Caching**: Configure appropriate caching strategies

## Step 10: Testing Your Setup

1. Deploy your Next.js application
2. Test user registration and login
3. Verify database connections
4. Test real-time features
5. Check that all policies work correctly

## Analytics Setup (Optional)

If you want detailed analytics:

1. Enable the **Analytics** extension in Supabase
2. Set up custom events tracking
3. Create dashboards for monitoring user activity

## Backup and Monitoring

1. **Backups**: Supabase automatically creates backups, but consider additional backup strategies for production
2. **Monitoring**: Set up alerts for:
   - Database performance
   - Authentication issues
   - Error rates
   - Storage usage

## Environment Variables Summary

Add these to your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Analytics Configuration (Optional)
NEXT_PUBLIC_GA_ID=your_ga4_tracking_id
NEXT_PUBLIC_GTM_ID=your_gtm_container_id
NEXT_PUBLIC_FB_PIXEL_ID=your_facebook_pixel_id
NEXT_PUBLIC_CLARITY_PROJECT_ID=your_clarity_project_id

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-app-domain.vercel.app
NEXTAUTH_URL=https://your-app-domain.vercel.app
NEXTAUTH_SECRET=your_nextauth_secret
```

## Troubleshooting

### Common Issues

1. **Authentication not working**: Check redirect URLs and OAuth app configuration
2. **Database connection errors**: Verify environment variables and network settings
3. **RLS policies blocking queries**: Check policy definitions and user permissions
4. **Real-time not working**: Ensure replication is enabled for the correct tables

### Getting Help

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord Community](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)

## Security Best Practices

1. Never commit service role keys to version control
2. Use environment variables for all sensitive data
3. Regularly rotate API keys
4. Monitor database access logs
5. Keep Supabase and dependencies updated
6. Use HTTPS everywhere
7. Implement proper error handling to avoid exposing sensitive information

## Cost Management

1. Monitor database usage in the Supabase dashboard
2. Set up usage alerts
3. Optimize queries to reduce compute costs
4. Consider upgrading to Pro plan for production workloads
5. Use connection pooling to reduce connection costs

Your Supabase setup is now complete! The WisdomOS Community Hub should be able to connect to your database and provide all the intended functionality.