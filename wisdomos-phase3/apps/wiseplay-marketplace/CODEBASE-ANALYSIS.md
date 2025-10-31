# WisePlay Marketplace — Complete Codebase Analysis

## Executive Summary

**WisePlay Marketplace** is a sophisticated multi-tenant marketplace platform for educational games and wisdom services built with Next.js 14, designed to connect service providers (creators/educators) with buyers through a commission-based model similar to Fiverr or Udemy.

**Current Status:** Phase 1 (Landing page, authentication, basic browsing)
**Tech Stack:** Next.js 14 (App Router), TypeScript, PostgreSQL (Prisma), Stripe Connect, NextAuth
**Platform Fee:** 6% on all transactions
**Port:** 3012

---

## Project Architecture

### High-Level Overview

```
wiseplay-marketplace/
├── app/                    # Next.js 14 App Router
│   ├── (marketplace)/     # Marketplace route group
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── marketplace/      # Domain-specific components
├── lib/                   # Core business logic
│   ├── db.ts             # Database exports
│   ├── prisma.ts         # Prisma client singleton
│   ├── stripe/           # Stripe integration
│   ├── supabase.ts       # Supabase client (file storage)
│   ├── marketplace/      # Marketplace domain logic
│   └── utils.ts          # Utility functions
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript definitions
├── prisma/               # Database schema & migrations
│   └── schema.prisma     # Complete database schema
├── public/               # Static assets
└── .env.example          # Environment variables template
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Framework** | Next.js 14 (App Router) | Server-side rendering, routing, API routes |
| **Language** | TypeScript | Type safety |
| **Styling** | TailwindCSS | Utility-first CSS |
| **UI Components** | Radix UI + shadcn/ui | Accessible component primitives |
| **Database** | PostgreSQL | Relational data storage |
| **ORM** | Prisma | Type-safe database client |
| **Authentication** | NextAuth.js v4 | OAuth & session management |
| **File Storage** | Supabase Storage | Images, videos, documents |
| **Payments** | Stripe Connect | Payment processing + provider payouts |
| **State Management** | Zustand | Lightweight state management |
| **Form Handling** | React Hook Form | Form validation & submission |
| **Validation** | Zod | Schema validation |
| **Icons** | Lucide React | Icon library |

---

## Database Architecture

### Entity Relationship Overview

```
Users
  ├── 1:1  ProviderProfile (if isProvider=true)
  ├── 1:N  Bookings (as buyer)
  ├── 1:N  Bookings (as provider)
  ├── 1:N  Reviews (written)
  ├── 1:N  Reviews (received, as provider)
  ├── 1:N  Messages
  ├── M:N  Conversations
  ├── 1:N  Wishlists
  ├── 1:N  Notifications
  └── 1:N  Transactions

ProviderProfile
  ├── 1:N  Services
  └── 1:1  Stripe Connect Account

Service
  ├── 1:1  ProviderProfile
  ├── M:N  ServiceCategories
  ├── M:N  ServiceTags
  ├── 1:N  Bookings
  ├── 1:N  Reviews
  └── 1:N  Wishlists

Booking
  ├── 1:1  Service
  ├── 1:1  Buyer (User)
  ├── 1:1  Provider (User)
  ├── 1:1  Transaction
  └── 0:1  Review

Transaction
  ├── 1:1  Booking
  ├── 1:1  Buyer (User)
  └── 1:1  Stripe Payment Intent
```

### Core Database Models

#### 1. User & Authentication

**User** (`users` table)
- Core user account with email, name, profile image
- Roles: `isProvider`, `isAdmin`
- Profile fields: bio, phone, location, timezone, language
- NextAuth integration (sessions, accounts, verification tokens)

**ProviderProfile** (`provider_profiles` table)
- Extended profile for service providers
- Business information (name, website, email, phone)
- **Stripe Connect integration:**
  - `stripeAccountId` - Connected Stripe account
  - `stripeOnboardingComplete` - Onboarding status
  - `stripeChargesEnabled` - Can accept payments
  - `stripePayoutsEnabled` - Can receive payouts
  - `stripeBankConnected` - Bank account linked
- Stats: totalBookings, totalEarnings, averageRating, responseTime
- Settings: autoAcceptBookings, instantBooking, requiresApproval
- Availability schedule (JSON format for flexible scheduling)

#### 2. Services & Marketplace

**Service** (`services` table)
- Core marketplace offering
- **Pricing:**
  - `basePrice` - Service price (Decimal 10,2)
  - `currency` - Default USD
  - `priceType` - FIXED, HOURLY, or PACKAGE
- **Duration:**
  - `duration` - Service duration in minutes
  - `bufferTime` - Buffer between bookings
- **Booking Settings:**
  - `maxAdvanceBooking` - How far ahead can book
  - `minAdvanceBooking` - Minimum notice required
  - `maxBookingsPerDay` - Provider capacity limit
- **Content:**
  - `title`, `slug`, `description`, `shortDescription`
  - `images[]` - Array of image URLs
  - `videoUrl` - Optional video preview
  - `requirements` - What buyer needs to provide
  - `deliverables` - What's included in service
- **Status:**
  - `isActive` - Available for booking
  - `isPublished` - Visible in marketplace
- **Stats:** totalBookings, totalRevenue, averageRating, viewCount

**ServiceCategory** (`service_categories` table)
- Hierarchical category system
- Self-referential: `parentId` → `parent` / `children`
- Examples: "Education" → "Math" → "Algebra"

**ServiceTag** (`service_tags` table)
- Flexible tagging system
- Examples: "beginner-friendly", "certification", "1-on-1"

#### 3. Bookings & Scheduling

**Booking** (`bookings` table)
- Core transaction between buyer and provider
- **Parties:**
  - `buyerId` - Customer
  - `providerId` - Service provider
  - `serviceId` - Which service
- **Scheduling:**
  - `scheduledAt` - Booking start time
  - `endTime` - Booking end time
  - `duration` - Duration in minutes
  - `timezone` - Booking timezone
- **Status** (enum):
  - `PENDING` - Awaiting provider approval
  - `CONFIRMED` - Provider accepted
  - `PAID` - Payment received
  - `IN_PROGRESS` - Service being delivered
  - `COMPLETED` - Service completed
  - `CANCELLED` - Cancelled by buyer or provider
  - `REFUNDED` - Payment refunded
  - `DISPUTED` - In dispute
- **Pricing:**
  - `basePrice` - Service price
  - `platformFee` - 6% platform commission
  - `totalPrice` - Total charged to buyer
- **Payment:**
  - `paymentStatus` - PENDING, PROCESSING, SUCCEEDED, FAILED, REFUNDED, CANCELLED
  - `paymentIntentId` - Stripe Payment Intent ID
  - `paidAt` - Payment timestamp
- **Meeting:**
  - `meetingUrl` - Zoom/Google Meet link
  - `meetingId` - Meeting identifier
  - `location` - Physical location (if applicable)
  - `notes` - Booking notes

#### 4. Payments & Transactions

**Transaction** (`transactions` table)
- Financial record of all payments
- **Amounts (in cents for precision):**
  - `amount` - Total amount charged
  - `platformFeeAmount` - 6% platform fee (amount × 0.06)
  - `providerAmount` - Amount provider receives (amount - platformFeeAmount)
- **Stripe References:**
  - `stripePaymentIntentId` - Payment intent
  - `stripeChargeId` - Charge ID
  - `stripeTransferId` - Transfer to provider's connected account
  - `stripeRefundId` - Refund ID (if refunded)
- **Status:** PENDING, PROCESSING, COMPLETED, FAILED, REFUNDED, DISPUTED
- **Refunds:**
  - `refundAmount` - Refund amount in cents
  - `refundReason` - Refund reason
  - `refundedAt` - Refund timestamp

**Platform Fee Calculation:**
```typescript
// Example: $100 service
basePrice = 100.00
platformFee = basePrice * 0.06 = 6.00
providerReceives = basePrice - platformFee = 94.00
```

#### 5. Reviews & Ratings

**Review** (`reviews` table)
- Post-booking review system
- **Core Rating:**
  - `rating` - Overall rating (1-5 stars)
  - `title` - Review title (optional)
  - `comment` - Review text
- **Detailed Ratings (1-5 each):**
  - `communication` - How well provider communicated
  - `quality` - Quality of service delivered
  - `value` - Value for money
  - `punctuality` - Timeliness
- **Provider Response:**
  - `response` - Provider's response to review
  - `respondedAt` - Response timestamp
- **Moderation:**
  - `isPublished` - Visible in marketplace
  - `isFlagged` - Flagged for review
  - `flagReason` - Why flagged
- **Relationships:**
  - Tied to specific booking (1:1)
  - Links reviewer, provider, and service

#### 6. Messaging & Conversations

**Conversation** (`conversations` table)
- Chat thread between users
- Can be tied to a booking (`bookingId`)
- `lastMessageAt` - For sorting

**ConversationParticipant** (`conversation_participants` table)
- Many-to-many: users ↔ conversations
- **Status:**
  - `lastReadAt` - When user last read messages
  - `unreadCount` - Number of unread messages
  - `isMuted` - Muted conversation

**Message** (`messages` table)
- Individual messages within conversation
- `content` - Message text
- `attachments[]` - Array of attachment URLs
- **Status:**
  - `isRead` - Message read status
  - `readAt` - Read timestamp
  - `isEdited` - Has been edited
  - `editedAt` - Edit timestamp

#### 7. Wishlist & Notifications

**Wishlist** (`wishlists` table)
- User's saved/favorited services
- Unique constraint: `[userId, serviceId]`

**Notification** (`notifications` table)
- System notifications for users
- **Types:**
  - BOOKING_REQUEST
  - BOOKING_CONFIRMED
  - BOOKING_CANCELLED
  - BOOKING_REMINDER
  - PAYMENT_RECEIVED
  - PAYMENT_FAILED
  - REVIEW_RECEIVED
  - MESSAGE_RECEIVED
  - PAYOUT_PROCESSED
  - SYSTEM
- **Status:**
  - `isRead` - Notification read
  - `readAt` - Read timestamp
- **Content:**
  - `title` - Notification title
  - `message` - Notification message
  - `actionUrl` - Link to related content
  - `metadata` - Additional JSON data

---

## API Routes

### Current Implementation

#### Authentication
- `POST /api/auth/[...nextauth]` - NextAuth OAuth endpoints (Google, GitHub)

#### Marketplace - Services
- `GET /api/marketplace/services` - Search/list services
  - Query params: `query`, `categoryId`, `tags`, `minPrice`, `maxPrice`, `priceType`, `duration`, `sortBy`, `sortOrder`, `page`, `limit`
  - Returns: Paginated service list with filters
- `POST /api/marketplace/services` - Create new service (provider only)
  - Validation: Zod schema
  - Requires: Stripe onboarding complete
  - Checks: Unique slug

#### Marketplace - Providers
- `GET /api/marketplace/providers` - List providers
- `POST /api/marketplace/providers` - Create provider profile

#### Marketplace - Bookings
- `GET /api/marketplace/bookings` - List user bookings
- `POST /api/marketplace/bookings` - Create booking request

#### Marketplace - Payments
- `POST /api/marketplace/payments/intent` - Create Stripe payment intent
  - Creates payment with platform fee
  - Transfers to provider's connected account
- `POST /api/marketplace/payments/webhooks` - Stripe webhook handler
  - Handles: payment_intent.succeeded, payment_intent.failed, charge.succeeded, etc.

---

## Stripe Integration Architecture

### Stripe Connect Model

WisePlay uses **Stripe Connect** with the **destination charges** pattern:

1. **Provider Onboarding:**
   - Provider creates account → Redirected to Stripe Connect onboarding
   - Stripe creates connected account → Returns `stripeAccountId`
   - Provider completes onboarding → Stripe sends webhooks
   - Platform stores: `stripeOnboardingComplete`, `stripeChargesEnabled`, `stripePayoutsEnabled`

2. **Payment Flow:**
   ```
   Buyer pays $100
     ↓
   Stripe charges buyer $100
     ↓
   Platform receives $6 (platform fee)
     ↓
   Provider receives $94 (transferred to connected account)
   ```

3. **Implementation:**
   ```typescript
   const paymentIntent = await stripe.paymentIntents.create({
     amount: 10000, // $100 in cents
     currency: 'usd',
     application_fee_amount: 600, // $6 (6% platform fee)
     transfer_data: {
       destination: providerStripeAccountId,
     },
     metadata: { bookingId, buyerId, providerId }
   });
   ```

### Payment Status Flow

```
Booking Created (PENDING)
  ↓
Payment Intent Created (PROCESSING)
  ↓
Buyer completes payment → Stripe charges card
  ↓
Webhook: payment_intent.succeeded
  ↓
Update Booking (PAID)
Update Transaction (COMPLETED)
Transfer funds to provider's connected account
  ↓
Provider delivers service
  ↓
Buyer/Provider marks complete (COMPLETED)
  ↓
(Optional) Buyer leaves review
```

### Webhook Events Handled

- `payment_intent.succeeded` - Payment succeeded
- `payment_intent.failed` - Payment failed
- `charge.succeeded` - Charge completed
- `charge.failed` - Charge failed
- `charge.refunded` - Refund processed
- `account.updated` - Provider connected account status changed
- `payout.paid` - Payout to provider completed

---

## Business Logic Modules

### `/lib/stripe/`

**config.ts**
- Stripe client initialization
- Platform fee constant (6%)
- Currency conversion utilities

**connect.ts**
- Provider onboarding flow
- Create connected account
- Generate onboarding link
- Check account status

**payments.ts**
- `createPaymentIntent()` - Create payment with platform fee
- `confirmPaymentIntent()` - Confirm payment
- `cancelPaymentIntent()` - Cancel payment
- `createRefund()` - Process refund
- `handlePaymentSuccess()` - Update booking & create transaction
- `handlePaymentFailure()` - Handle failed payment

### `/lib/marketplace/`

**auth.ts**
- `requireAuth()` - Require authenticated user
- `requireProvider()` - Require provider account
- `requireAdmin()` - Require admin privileges

**search.ts**
- `searchServices()` - Full-text search with filters
  - Filters: query, category, tags, price range, duration, sort
  - Pagination: page, limit
  - Returns: services[], totalCount, totalPages

---

## Type System

### Core Types (`/types/index.ts`)

Currently defined (legacy, needs sync with Prisma schema):
- `User` - User account
- `Game` - Legacy naming (should be `Service`)
- `Purchase` - Legacy naming (should be `Booking`)
- `Review` - Review schema

**Note:** Types should be generated from Prisma schema using:
```bash
npm run db:generate
```

This creates TypeScript types in `node_modules/.prisma/client`.

### NextAuth Types (`/types/next-auth.d.ts`)

Extended NextAuth session with custom fields:
```typescript
interface Session {
  user: {
    id: string;
    email: string;
    name?: string;
    image?: string;
    role: "USER" | "CREATOR" | "ADMIN";
  }
}
```

---

## Frontend Components

### UI Components (`/components/ui/`)

shadcn/ui components (Radix UI primitives):
- `button.tsx` - Button component
- `card.tsx` - Card container
- `toast.ts` - Toast notifications (hook)

### Marketplace Components (`/components/marketplace/`)

**game-card.tsx** (Should be renamed to `service-card.tsx`)
- Displays service in grid/list view
- Shows: image, title, price, rating, provider
- Actions: Wishlist, view details

---

## Current Implementation Status

### ✅ Completed (Phase 1)

**Infrastructure:**
- Next.js 14 App Router setup
- TypeScript configuration
- TailwindCSS + shadcn/ui integration
- Prisma schema (complete)
- NextAuth setup (Google, GitHub OAuth)
- Supabase client (file storage)
- Stripe integration architecture

**Database:**
- Complete schema for all entities
- Indexes on frequently queried fields
- Enum types for status fields
- Relationship modeling

**API Routes:**
- Authentication endpoints
- Services CRUD (GET, POST)
- Providers endpoints
- Bookings endpoints
- Payments endpoints (intent creation, webhooks)

**Pages:**
- Landing page with hero, features, stats
- Basic routing structure

### 🚧 In Progress / Needed (Phase 2)

**Frontend:**
- [ ] Marketplace browse page (`/marketplace/page.tsx`)
- [ ] Service detail page (`/marketplace/services/[slug]/page.tsx`)
- [ ] Provider dashboard (`/dashboard/provider/*`)
- [ ] Buyer dashboard (`/dashboard/buyer/*`)
- [ ] Booking flow UI
- [ ] Payment checkout page
- [ ] Review submission UI

**Backend:**
- [ ] Complete Stripe Connect onboarding flow
- [ ] Booking approval/decline logic
- [ ] Email notifications (SendGrid/Resend)
- [ ] Real-time messaging (Pusher/Ably)
- [ ] Search with Algolia or MeiliSearch
- [ ] File upload to Supabase Storage

**Features:**
- [ ] Service creation wizard (multi-step)
- [ ] Calendar/availability system
- [ ] Provider earnings dashboard
- [ ] Dispute resolution system
- [ ] Admin moderation panel

### 🔮 Future (Phase 3)

**Advanced Features:**
- [ ] Video conferencing integration (Zoom API)
- [ ] Advanced analytics dashboard
- [ ] Subscription services (recurring bookings)
- [ ] Affiliate/referral program
- [ ] Multi-language support (i18n)
- [ ] Mobile apps (React Native)
- [ ] AI-powered service recommendations
- [ ] Automated payout scheduling

---

## Key Insights & Observations

### 1. Misalignment Between Types and Schema

**Issue:** `/types/index.ts` references "Game" and "Purchase" but Prisma schema uses "Service" and "Booking".

**Impact:** Type safety broken, potential runtime errors.

**Solution:**
- Remove manual types in `/types/index.ts`
- Use Prisma-generated types: `import { Service, Booking, User } from '@prisma/client'`
- Add custom types as extensions, not replacements

### 2. Incomplete Frontend Implementation

**Observation:** Database schema and API routes are production-ready, but frontend is minimal.

**Current state:**
- Landing page only
- No marketplace browse page
- No service detail pages
- No dashboards

**Priority:** Build core user flows (browse → view → book → pay).

### 3. Strong Stripe Integration Foundation

**Strengths:**
- Proper Stripe Connect architecture
- Platform fee handling (6%)
- Webhook infrastructure
- Transaction tracking

**Missing:**
- Actual onboarding flow UI
- Payout scheduling
- Refund UI
- Dispute handling

### 4. Comprehensive Database Design

**Strengths:**
- Well-normalized schema
- Proper indexes
- Clear separation of concerns
- Flexible JSON fields where appropriate (availability, metadata)

**Excellent decisions:**
- Using `Decimal` for money (no floating-point errors)
- Storing amounts in cents (integers) in Transaction table
- Enum types for status fields
- Hierarchical categories (self-referential)

### 5. Missing Critical Features

**For MVP:**
- Email notifications (booking confirmations, reminders)
- File upload for service images
- Availability/calendar system
- Search with faceted filters
- Real-time messaging or at least async messaging UI

### 6. Security Considerations

**Current:**
- Auth middleware exists (`requireAuth`, `requireProvider`)
- NextAuth handles sessions

**Needs:**
- Rate limiting (prevent abuse)
- Input sanitization (XSS prevention)
- CORS configuration
- CSP headers
- API key rotation strategy

### 7. Testing Strategy Missing

**Observation:** No test files present.

**Recommendations:**
- Unit tests: Business logic in `/lib/`
- Integration tests: API routes
- E2E tests: Critical user flows (Playwright)
- Test database: Separate DATABASE_URL for tests

---

## Development Workflow

### Initial Setup

```bash
# 1. Clone and navigate
cd apps/wiseplay-marketplace

# 2. Install dependencies
pnpm install

# 3. Set up environment
cp .env.example .env.local
# Edit .env.local with actual credentials

# 4. Set up database
pnpm db:generate  # Generate Prisma client
pnpm db:push      # Push schema to database

# 5. Start development server
pnpm dev          # Runs on http://localhost:3012
```

### Database Workflow

```bash
# Generate Prisma client (after schema changes)
pnpm db:generate

# Push schema changes to database (dev)
pnpm db:push

# Create migration (production)
pnpm db:migrate

# Open Prisma Studio (database GUI)
pnpm db:studio
```

### Common Commands

```bash
# Development
pnpm dev                # Start dev server (port 3012)
pnpm build              # Build for production
pnpm start              # Start production server
pnpm lint               # Run ESLint
pnpm type-check         # TypeScript type checking
```

---

## Environment Variables

### Required Variables

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/wiseplay"

# NextAuth
NEXTAUTH_URL="http://localhost:3012"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_ID="your-github-id"
GITHUB_SECRET="your-github-secret"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### Optional (Recommended)

```env
# Supabase (for file storage)
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# Email (SendGrid, Resend, etc.)
SENDGRID_API_KEY="SG.xxx"
EMAIL_FROM="noreply@wiseplay.com"

# Real-time messaging
PUSHER_APP_ID="xxx"
PUSHER_KEY="xxx"
PUSHER_SECRET="xxx"
PUSHER_CLUSTER="us2"

# Analytics
NEXT_PUBLIC_GOOGLE_ANALYTICS="G-XXXXXXXXXX"
```

---

## Recommendations & Next Steps

### Immediate Priorities (Sprint 1-2)

1. **Fix Type Alignment**
   - Remove manual types in `/types/index.ts`
   - Use Prisma-generated types
   - Add type extensions where needed

2. **Build Core Pages**
   - Marketplace browse page with filters
   - Service detail page with booking CTA
   - Basic provider dashboard
   - Basic buyer dashboard

3. **Complete Booking Flow**
   - Service selection → Calendar view → Payment → Confirmation
   - Integrate Stripe payment intent creation
   - Handle webhooks for payment success/failure

4. **Add Email Notifications**
   - Booking confirmation (buyer + provider)
   - Payment receipt
   - Booking reminders (24h before)
   - Use SendGrid or Resend

### Medium-Term (Sprint 3-5)

5. **Provider Onboarding**
   - Stripe Connect onboarding flow
   - Service creation wizard (multi-step form)
   - Upload service images to Supabase Storage
   - Set availability schedule

6. **Messaging System**
   - Real-time or async messaging UI
   - Conversation list
   - Message composer
   - File attachments

7. **Reviews & Ratings**
   - Post-booking review form
   - Display reviews on service pages
   - Provider response to reviews
   - Rating aggregation

8. **Search & Discovery**
   - Implement full-text search (PostgreSQL full-text or Algolia)
   - Faceted filters (category, price range, duration)
   - Sort options (popularity, price, rating)
   - "Similar services" recommendations

### Long-Term (Sprint 6+)

9. **Admin Panel**
   - User management
   - Service moderation
   - Transaction monitoring
   - Dispute resolution

10. **Advanced Features**
    - Video conferencing integration
    - Subscription services
    - Affiliate program
    - Mobile app

### Technical Debt

- [ ] Add comprehensive error handling
- [ ] Implement logging (Winston, Pino)
- [ ] Set up monitoring (Sentry)
- [ ] Add API rate limiting
- [ ] Write tests (unit, integration, E2E)
- [ ] Add OpenAPI/Swagger documentation
- [ ] Implement caching strategy (Redis)
- [ ] Set up CI/CD pipeline

---

## Conclusion

**WisePlay Marketplace** has a **solid foundation** with a well-designed database schema, proper Stripe integration architecture, and modern tech stack. The backend API structure is production-ready.

**Current Gap:** Minimal frontend implementation. The priority is building out the user-facing pages and completing the core booking flow.

**Estimated Effort to MVP:**
- Core pages: 2-3 weeks
- Booking flow: 1-2 weeks
- Provider dashboard: 1 week
- Email notifications: 3-5 days
- Testing & bug fixes: 1 week

**Total: 6-8 weeks to production-ready MVP**

---

**Last Updated:** October 30, 2025
**Analyzed By:** Claude Code
**Classification:** Internal/Development Documentation
