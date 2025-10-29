# WisdomOS Community Hub - Deployment Guide

This guide walks you through deploying the WisdomOS Community Hub to Vercel with all the required configurations.

## Prerequisites

- Node.js 18+ installed locally
- Git repository set up
- Vercel account
- Supabase project configured (see `SUPABASE_SETUP.md`)

## Pre-Deployment Checklist

### 1. Environment Variables

Ensure all required environment variables are set in your `.env.local`:

```env
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Analytics Configuration (Optional but Recommended)
NEXT_PUBLIC_GA_ID=your_ga4_tracking_id
NEXT_PUBLIC_GTM_ID=your_gtm_container_id
NEXT_PUBLIC_FB_PIXEL_ID=your_facebook_pixel_id
NEXT_PUBLIC_CLARITY_PROJECT_ID=your_clarity_project_id

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-app-domain.vercel.app
NEXTAUTH_URL=https://your-app-domain.vercel.app
NEXTAUTH_SECRET=your_nextauth_secret_32_characters_minimum

# Push Notifications (Optional)
NEXT_PUBLIC_VAPID_KEY=your_vapid_public_key

# Site Verification (Optional)
GOOGLE_SITE_VERIFICATION=your_google_verification_code
```

### 2. Dependencies Installation

Install all dependencies locally to verify everything works:

```bash
# Install dependencies
npm install

# If npm install fails due to conflicts, try:
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### 3. Build Test

Test the build locally before deploying:

```bash
npm run build
npm run start
```

Visit `http://localhost:3000` to ensure everything works correctly.

## Deployment Steps

### Method 1: Automatic Deployment via Vercel CLI (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy from project directory:**
   ```bash
   # First deployment
   vercel
   
   # Follow the prompts:
   # ? Set up and deploy "~/wisdomos-community-hub"? [Y/n] y
   # ? Which scope do you want to deploy to? [Select your team]
   # ? Link to existing project? [N/y] n
   # ? What's your project's name? wisdomos-community-hub
   # ? In which directory is your code located? ./
   ```

4. **Set environment variables:**
   ```bash
   # Set each environment variable
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   # ... continue for all variables
   ```

5. **Deploy to production:**
   ```bash
   vercel --prod
   ```

### Method 2: GitHub Integration Deployment

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Initial deployment setup"
   git push origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure project settings

3. **Set environment variables in Vercel dashboard:**
   - Go to Project Settings → Environment Variables
   - Add all required environment variables
   - Set them for Production, Preview, and Development

4. **Deploy:**
   - Vercel will automatically deploy on push to main branch

## Post-Deployment Configuration

### 1. Update Supabase URLs

In your Supabase project:
1. Go to Authentication → Settings
2. Update Site URL to: `https://your-app-domain.vercel.app`
3. Add redirect URLs:
   - `https://your-app-domain.vercel.app/auth/callback`
   - `https://your-app-domain.vercel.app/auth/reset-password`

### 2. Update OAuth Providers

#### Google OAuth:
- Update authorized redirect URIs in Google Cloud Console:
  - `https://your-project-id.supabase.co/auth/v1/callback`

#### GitHub OAuth:
- Update callback URL in GitHub OAuth App:
  - `https://your-project-id.supabase.co/auth/v1/callback`

### 3. Configure Custom Domain (Optional)

1. In Vercel dashboard:
   - Go to Project Settings → Domains
   - Add your custom domain
   - Configure DNS records as instructed

2. Update environment variables:
   - Change `NEXT_PUBLIC_APP_URL` to your custom domain
   - Update OAuth redirect URLs

### 4. Set Up Analytics

If you included analytics configuration:

1. **Google Analytics:**
   - Verify GA4_ID is correct
   - Check data is flowing in GA dashboard

2. **Google Tag Manager:**
   - Verify GTM container is loading
   - Test tag firing

3. **Facebook Pixel:**
   - Verify pixel is firing
   - Check Facebook Events Manager

4. **Microsoft Clarity:**
   - Verify session recording is working
   - Check heatmap data

## Performance Optimization

### 1. Enable Edge Functions (Optional)

For better performance in certain regions:

```bash
# Create vercel.json
{
  "functions": {
    "src/app/api/**/*.ts": {
      "runtime": "edge"
    }
  }
}
```

### 2. Configure Caching

The Next.js config already includes:
- Static asset caching
- Image optimization
- Compression enabled

### 3. Monitor Performance

- Use Vercel Analytics (enable in project settings)
- Monitor Core Web Vitals
- Check loading times from different regions

## Security Configuration

### 1. Environment Variables Security

✅ **Properly configured:**
- All API keys are in environment variables
- No secrets committed to git
- Production and preview environments separated

### 2. Security Headers

✅ **Already configured in next.config.ts:**
- Content Security Policy
- HSTS
- X-Frame-Options
- XSS Protection

### 3. Database Security

✅ **Supabase RLS enabled:**
- Row Level Security policies active
- User data isolation enforced
- Admin-only routes protected

## Monitoring and Maintenance

### 1. Error Monitoring

Consider adding error tracking:
- Sentry integration
- Custom error boundaries
- Performance monitoring

### 2. Uptime Monitoring

Set up monitoring for:
- Application availability
- Database connectivity
- Third-party service status

### 3. Backup Strategy

- Supabase automatic backups enabled
- Export user data capabilities built-in
- Environment variables backed up securely

## Troubleshooting

### Common Issues

1. **Build Failures:**
   ```bash
   # Clear Next.js cache
   rm -rf .next
   npm run build
   ```

2. **Environment Variable Issues:**
   ```bash
   # Check variables are set
   vercel env ls
   
   # Pull environment variables locally
   vercel env pull .env.local
   ```

3. **Supabase Connection Issues:**
   - Verify URLs and keys are correct
   - Check Supabase project status
   - Ensure RLS policies allow access

4. **OAuth Not Working:**
   - Verify redirect URLs are updated
   - Check OAuth app configurations
   - Ensure domain matches exactly

### Getting Help

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)

## Scaling Considerations

As your application grows:

1. **Vercel Plan Upgrades:**
   - Monitor function invocations
   - Check bandwidth usage
   - Consider Pro plan for higher limits

2. **Supabase Plan Upgrades:**
   - Monitor database size
   - Check API request limits
   - Consider Pro plan for production workloads

3. **CDN Optimization:**
   - Use Vercel's Edge Network
   - Optimize images and static assets
   - Consider additional CDN for global users

## Final Deployment Verification

After deployment, verify these features work:

- [ ] User registration and login
- [ ] Social logins (Google, GitHub)
- [ ] Dashboard loads correctly
- [ ] Document creation and editing
- [ ] Real-time features
- [ ] Analytics tracking
- [ ] PWA installation
- [ ] Push notifications (if enabled)
- [ ] Admin panel (for admin users)
- [ ] Data export functionality
- [ ] Mobile responsiveness

## Success Metrics

Monitor these KPIs post-deployment:

- User registration rates
- Daily/Monthly active users
- Document creation rates
- Session duration
- Mobile vs desktop usage
- Page load performance
- Error rates
- Conversion funnel completion

Your WisdomOS Community Hub is now successfully deployed! 🎉

## Next Steps

- Set up monitoring and alerts
- Plan user onboarding flow
- Create user documentation
- Set up customer support channels
- Plan feature roadmap based on user feedback