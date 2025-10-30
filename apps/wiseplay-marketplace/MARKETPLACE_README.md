# WisePlay - Complete Implementation Guide

**Where Landmark Community Creates Possibility**

## Project Overview

WisePlay is a community contribution platform built on Next.js 14 with Stripe integration, PostgreSQL database, and a 6% community sustainability contribution model. It enables community members to offer their unique gifts and find authentic partnerships for transformation.

## What Has Been Completed

### ✅ Core Infrastructure

1. **Database Schema** (in `@wisdomos/database` package)
   - User management with WisdomOS integration
   - Provider profiles with Stripe Connect
   - Services with categories and tags
   - Bookings with payment tracking
   - Reviews and ratings
   - Transactions with platform fee tracking
   - Wishlists and notifications

2. **Package Configuration**
   - Updated `package.json` with workspace dependency
   - Added database scripts for Prisma operations
   - Configured development server on port 3012
   - Added TypeScript and build configurations

3. **Environment Setup**
   - Created `.env.local` template with all required variables
   - Configured database, NextAuth, Stripe, and platform settings
   - Set 6% platform fee as default

4. **Stripe Integration**
   - `lib/stripe/config.ts`: Stripe client and fee calculation
   - `lib/stripe/connect.ts`: Stripe Connect account management
   - `lib/stripe/payments.ts`: Payment intent creation with platform fees

5. **Marketplace Utilities**
   - `lib/marketplace/db.ts`: Prisma client singleton
   - `lib/marketplace/auth.ts`: Authentication middleware
   - `lib/marketplace/search.ts`: Advanced service search and filtering

6. **Configuration**
   - Updated `next.config.js` with image domains and environment variables
   - Configured TypeScript compilation
   - Set up ESLint and code quality tools

7. **Documentation**
   - **DEPLOYMENT.md**: Complete deployment guide for Vercel
   - **IMPLEMENTATION_SUMMARY.md**: Full code for API routes, pages, and components
   - **MARKETPLACE_README.md**: This file - comprehensive project guide

## What Needs to Be Implemented

All the code has been written and documented in `IMPLEMENTATION_SUMMARY.md`. You need to copy the code from that file into the following locations:

### API Routes (5 files)

1. `app/api/marketplace/services/route.ts` - Service search and creation
2. `app/api/marketplace/providers/route.ts` - Provider listing and profile creation
3. `app/api/marketplace/bookings/route.ts` - Booking management
4. `app/api/marketplace/payments/intent/route.ts` - Payment intent creation
5. `app/api/marketplace/payments/webhooks/route.ts` - Stripe webhook handling

### Pages (3 files)

1. `app/(marketplace)/marketplace/page.tsx` - Marketplace homepage
2. `app/(marketplace)/marketplace/services/page.tsx` - Services listing with filters
3. `app/(marketplace)/marketplace/providers/page.tsx` - Provider directory

### Components (3 files)

1. `components/marketplace/ServiceCard.tsx` - Service display card
2. `components/marketplace/ProviderCard.tsx` - Provider profile card
3. `components/marketplace/SearchFilters.tsx` - Service filtering UI

## Quick Start Guide

### 1. Install Dependencies

```bash
cd /Volumes/DevOPS\ 2025/01_DEVOPS_PLATFORM/wisdomOS\ 2026/apps/wiseplay-marketplace
pnpm install
```

### 2. Set Up Environment Variables

Edit `.env.local` and add your actual values:

```bash
# Database - Get from Supabase
DATABASE_URL="postgresql://postgres:password@db.xxx.supabase.co:5432/postgres"

# NextAuth - Generate secret with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3012"
NEXTAUTH_SECRET="your-generated-secret-here"

# Stripe - Get from Stripe Dashboard
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..." # Will get this after setting up webhooks

# Platform
NEXT_PUBLIC_PLATFORM_FEE_PERCENT=6
NEXT_PUBLIC_APP_URL="http://localhost:3012"
```

### 3. Initialize Database

```bash
# Generate Prisma client from shared database package
pnpm db:generate

# Push schema to database
pnpm db:push
```

### 4. Implement Missing Files

Copy all the code from `IMPLEMENTATION_SUMMARY.md` into the respective files listed above.

### 5. Run Development Server

```bash
pnpm dev
```

Visit http://localhost:3012

## Architecture Overview

### Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TailwindCSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (Supabase recommended)
- **Payments**: Stripe Connect with platform fee
- **Authentication**: NextAuth.js
- **TypeScript**: Full type safety throughout

### Key Design Decisions

1. **6% Platform Fee**: Automatically calculated on all transactions
2. **Stripe Connect**: Providers receive payouts directly to their accounts
3. **WisdomOS Integration**: Uses shared database package for user management
4. **Server Components**: Leverages Next.js 14 server components for performance
5. **Type Safety**: Full TypeScript coverage with Prisma types

### Data Flow

```
User → Browse Services → Create Booking → Payment Intent
                                              ↓
                                         Stripe Payment
                                              ↓
                                    Webhook Confirmation
                                              ↓
                               Update Booking + Transaction
                                              ↓
                              Provider Receives 94% Payout
                              Platform Receives 6% Fee
```

## File Structure

```
wiseplay-marketplace/
├── app/
│   ├── api/
│   │   └── marketplace/
│   │       ├── services/route.ts
│   │       ├── providers/route.ts
│   │       ├── bookings/route.ts
│   │       └── payments/
│   │           ├── intent/route.ts
│   │           └── webhooks/route.ts
│   ├── (marketplace)/
│   │   └── marketplace/
│   │       ├── page.tsx
│   │       ├── services/page.tsx
│   │       └── providers/page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── marketplace/
│   │   ├── ServiceCard.tsx
│   │   ├── ProviderCard.tsx
│   │   └── SearchFilters.tsx
│   └── ui/ (existing UI components)
├── lib/
│   ├── stripe/
│   │   ├── config.ts
│   │   ├── connect.ts
│   │   └── payments.ts
│   ├── marketplace/
│   │   ├── db.ts
│   │   ├── auth.ts
│   │   └── search.ts
│   └── utils.ts
├── .env.local
├── next.config.js
├── package.json
├── tsconfig.json
├── DEPLOYMENT.md
├── IMPLEMENTATION_SUMMARY.md
└── MARKETPLACE_README.md
```

## Key Features

### For Providers
- Create and manage services
- Stripe Connect onboarding
- Receive direct payouts (94% of transaction)
- View booking history
- Manage reviews and ratings
- Dashboard with analytics

### For Buyers
- Browse and search services
- Filter by category, price, rating
- Book services with scheduling
- Secure payment processing
- Leave reviews
- Wishlist functionality
- Booking history

### For Platform
- 6% fee on all transactions
- Stripe webhook handling
- Transaction tracking
- User management via WisdomOS
- Analytics and reporting

## Testing Strategy

### Local Testing

1. **Provider Flow**
   ```bash
   # Create provider profile
   POST /api/marketplace/providers

   # Create service
   POST /api/marketplace/services
   ```

2. **Buyer Flow**
   ```bash
   # Search services
   GET /api/marketplace/services?query=coaching

   # Create booking
   POST /api/marketplace/bookings

   # Create payment intent
   POST /api/marketplace/payments/intent
   ```

3. **Webhook Testing**
   ```bash
   # Use Stripe CLI for local testing
   stripe listen --forward-to localhost:3012/api/marketplace/payments/webhooks

   # Trigger test payment
   stripe trigger payment_intent.succeeded
   ```

### Production Testing

1. Test with Stripe test mode first
2. Verify all webhook events are received
3. Check database records are created correctly
4. Test edge cases (failed payments, cancellations)
5. Monitor Vercel logs for errors

## Common Issues & Solutions

### Issue: Prisma Client Not Found

**Solution**:
```bash
cd ../../packages/database
pnpm prisma generate
cd ../../apps/wiseplay-marketplace
```

### Issue: Stripe Webhook Signature Failed

**Solution**:
- Verify `STRIPE_WEBHOOK_SECRET` is correct
- Check webhook URL matches exactly
- Ensure raw body parsing is enabled

### Issue: Database Connection Error

**Solution**:
- Verify `DATABASE_URL` is correct
- Check Supabase connection pooling is enabled
- Ensure SSL mode is set for production

### Issue: Build Failures

**Solution**:
```bash
# Clear cache
rm -rf .next node_modules
pnpm install
pnpm build
```

## Performance Optimization

### Database Optimization
- Add indexes on frequently queried fields
- Use Prisma's `select` to limit returned fields
- Implement pagination on all list endpoints
- Use database connection pooling

### Application Optimization
- Enable Next.js Image Optimization
- Implement caching for frequently accessed data
- Use Vercel Edge Functions for API routes
- Minimize client-side JavaScript

### Monitoring
- Set up Vercel Analytics
- Monitor Stripe webhook delivery
- Track database query performance
- Set up error tracking (Sentry)

## Security Best Practices

1. **Never Commit Secrets**
   - Keep `.env.local` in `.gitignore`
   - Use different keys for dev/staging/prod
   - Rotate secrets regularly

2. **Validate All Inputs**
   - Use Zod schemas for validation
   - Sanitize user inputs
   - Check file uploads

3. **Implement Rate Limiting**
   - Prevent abuse of API endpoints
   - Use Vercel's built-in DDoS protection
   - Implement request throttling

4. **Secure Payments**
   - Always verify Stripe webhook signatures
   - Use idempotency keys
   - Never store card details

## Deployment Checklist

- [ ] Copy all code from IMPLEMENTATION_SUMMARY.md
- [ ] Update environment variables
- [ ] Run database migrations
- [ ] Test locally thoroughly
- [ ] Create GitHub repository
- [ ] Deploy to Vercel
- [ ] Set up Stripe webhooks
- [ ] Configure custom domain
- [ ] Test production deployment
- [ ] Set up monitoring
- [ ] Enable error tracking
- [ ] Configure email notifications

## Next Steps

1. **Immediate**: Implement the missing files from IMPLEMENTATION_SUMMARY.md
2. **Short-term**:
   - Add email notifications
   - Implement admin dashboard
   - Add service categories seeding
   - Create provider onboarding flow
3. **Long-term**:
   - Add advanced search (Algolia/Elasticsearch)
   - Implement real-time chat
   - Add video call integration
   - Create mobile app

## Support Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Stripe Connect**: https://stripe.com/docs/connect
- **Vercel Docs**: https://vercel.com/docs
- **WisdomOS Integration**: See main platform documentation

## Contributing

When making changes:
1. Create a feature branch
2. Test thoroughly locally
3. Update documentation
4. Submit PR with detailed description
5. Ensure all tests pass

## License

Proprietary - WisdomOS Platform

---

**Ready to launch?** Follow the Quick Start Guide above and refer to DEPLOYMENT.md for production deployment instructions.
