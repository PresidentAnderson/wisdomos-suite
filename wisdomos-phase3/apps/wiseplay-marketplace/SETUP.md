# WisePlay Marketplace Setup Guide

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database
- Stripe account
- OAuth provider credentials (Google, GitHub, etc.)

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure your values:

```bash
cp .env.example .env.local
```

Edit `.env.local` and configure the following:

#### Database Configuration
- `DATABASE_URL`: Your PostgreSQL connection string
  - Example: `postgresql://user:password@localhost:5432/wiseplay?schema=public`

#### NextAuth Configuration
- `NEXTAUTH_URL`: Your application URL (http://localhost:3000 for development)
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`

#### OAuth Providers
- Google: Get credentials from [Google Cloud Console](https://console.cloud.google.com/)
- GitHub: Get credentials from [GitHub OAuth Apps](https://github.com/settings/developers)

#### Stripe Configuration
1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys from the Stripe Dashboard
3. Configure:
   - `STRIPE_SECRET_KEY`: Your secret key (starts with sk_test_)
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Your publishable key (starts with pk_test_)
   - `STRIPE_WEBHOOK_SECRET`: Webhook signing secret (see webhook setup below)

### 3. Database Setup

Run Prisma migrations to create database tables:

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Open Prisma Studio to view database
npx prisma studio
```

### 4. Stripe Webhook Setup (Local Development)

To test Stripe webhooks locally, use the Stripe CLI:

#### Install Stripe CLI
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows (with Scoop)
scoop install stripe

# Linux
wget https://github.com/stripe/stripe-cli/releases/download/v1.17.0/stripe_1.17.0_linux_x86_64.tar.gz
tar -xvf stripe_1.17.0_linux_x86_64.tar.gz
```

#### Login to Stripe
```bash
stripe login
```

#### Forward webhooks to local server
```bash
stripe listen --forward-to localhost:3000/api/marketplace/payments/webhooks
```

This command will output a webhook signing secret. Add this to your `.env.local` as `STRIPE_WEBHOOK_SECRET`.

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Stripe Connect Setup

For providers to receive payments, they need to complete Stripe Connect onboarding:

1. Provider creates an account and becomes a provider
2. Provider navigates to dashboard and clicks "Connect Stripe"
3. Provider completes Stripe Connect onboarding flow
4. Once complete, provider can create services and accept bookings

## Platform Fee Configuration

The marketplace charges a **6% platform fee** on all transactions:
- Configuration in: `lib/stripe/config.ts`
- Fee is automatically calculated and applied during payment processing
- Providers receive 94% of the booking price
- Platform retains 6% as application fee

## Testing Stripe Integration

Use Stripe test cards for testing:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Authentication Required: `4000 0025 0000 3155`

More test cards: [Stripe Testing Documentation](https://stripe.com/docs/testing)

## API Routes

### Marketplace APIs
- `GET /api/marketplace/providers` - List providers
- `POST /api/marketplace/providers` - Create provider profile
- `GET /api/marketplace/services` - Search services
- `POST /api/marketplace/services` - Create service
- `GET /api/marketplace/bookings` - List bookings
- `POST /api/marketplace/bookings` - Create booking
- `POST /api/marketplace/payments/intent` - Create payment intent
- `POST /api/marketplace/payments/webhooks` - Stripe webhooks

### Authentication
- NextAuth is configured with Google and GitHub providers
- Session strategy: Database
- Add more providers in `app/api/auth/[...nextauth]/route.ts`

## Database Schema

Key models:
- **User**: User accounts with marketplace roles
- **ProviderProfile**: Provider information and Stripe Connect details
- **Service**: Services offered by providers
- **Booking**: Scheduled bookings with payment tracking
- **Transaction**: Payment records with platform fee tracking
- **Review**: Reviews and ratings
- **Conversation & Message**: Built-in messaging system

See `prisma/schema.prisma` for complete schema.

## Deployment

### Environment Variables for Production

Ensure you set all environment variables in your production environment:
- Use production Stripe keys (starts with `sk_live_` and `pk_live_`)
- Configure production database URL
- Set secure NEXTAUTH_SECRET
- Configure production webhook endpoint

### Vercel Deployment

1. Push code to GitHub
2. Connect repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy

### Stripe Webhook for Production

1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://yourdomain.com/api/marketplace/payments/webhooks`
3. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `account.updated`
   - `charge.succeeded`
   - `charge.refunded`
4. Copy the webhook signing secret to your production environment

## Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL is correct
- Ensure PostgreSQL is running
- Check database user permissions

### Stripe Webhook Issues
- Verify STRIPE_WEBHOOK_SECRET is set correctly
- Check Stripe CLI is forwarding to correct port
- Review webhook logs in Stripe Dashboard

### Authentication Issues
- Verify OAuth credentials are correct
- Check NEXTAUTH_URL matches your domain
- Ensure NEXTAUTH_SECRET is set

## Support

For issues or questions:
- Check the Prisma documentation: https://www.prisma.io/docs
- Stripe documentation: https://stripe.com/docs
- NextAuth documentation: https://next-auth.js.org

