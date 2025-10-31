# WisePlay Marketplace - Sub-Pages Implementation Plan

## Overview
Building out the complete user experience for the WisePlay Marketplace with service browsing, booking flow, and user dashboards.

---

## Page Structure

### Public Pages (No Auth Required)
```
/marketplace                           ✅ DONE - Landing page
/marketplace/services                  🔨 Build - Browse all services
/marketplace/services/[serviceId]      🔨 Build - Service detail with booking
/marketplace/providers                 🔨 Build - Browse providers
/marketplace/providers/[providerId]    🔨 Build - Provider profile
/marketplace/categories/[categoryId]   🔨 Build - Category browse
```

### Protected Pages (Auth Required)
```
/dashboard                             🔨 Build - Main dashboard (router)
/dashboard/buyer                       🔨 Build - Buyer dashboard
/dashboard/buyer/bookings              🔨 Build - My bookings
/dashboard/buyer/bookings/[bookingId]  🔨 Build - Booking detail
/dashboard/buyer/reviews               🔨 Build - My reviews
/dashboard/provider                    🔨 Build - Provider dashboard
/dashboard/provider/services           🔨 Build - My services
/dashboard/provider/services/create    🔨 Build - Create service
/dashboard/provider/services/[id]/edit 🔨 Build - Edit service
/dashboard/provider/bookings           🔨 Build - Incoming bookings
/dashboard/provider/earnings           🔨 Build - Earnings & payouts
/dashboard/settings                    🔨 Build - User settings
/dashboard/settings/profile            🔨 Build - Profile settings
/dashboard/settings/provider           🔨 Build - Provider onboarding
```

### Flow Pages
```
/booking/[serviceId]                   🔨 Build - Booking flow
/booking/[serviceId]/confirm           🔨 Build - Confirm booking
/booking/[serviceId]/payment           🔨 Build - Payment page
/booking/[serviceId]/success           🔨 Build - Success page
```

---

## Priority Implementation Order

### Phase 1: Core Browsing (Week 1)
**Goal:** Users can browse and view services

1. **Service List Page** - `/marketplace/services`
   - Grid of all services
   - Filters (category, price, rating)
   - Search functionality
   - Pagination
   - Sort options

2. **Service Detail Page** - `/marketplace/services/[serviceId]`
   - Service information (title, description, media)
   - Provider profile card
   - Pricing information
   - Reviews and ratings
   - Book Now CTA
   - Related services

3. **Provider Profile Page** - `/marketplace/providers/[providerId]`
   - Provider bio and photo
   - Verification badge
   - Services list
   - Reviews received
   - Contact/message option

### Phase 2: Booking Flow (Week 2)
**Goal:** Users can book and pay for services

4. **Booking Form** - `/booking/[serviceId]`
   - Date/time selection (if applicable)
   - Message to provider
   - Quantity/duration selection
   - Price calculation
   - Next: Confirm

5. **Booking Confirmation** - `/booking/[serviceId]/confirm`
   - Review booking details
   - Terms and conditions
   - Payment method selection
   - Confirm & Pay button

6. **Payment Page** - `/booking/[serviceId]/payment`
   - Stripe payment form
   - Order summary
   - Processing state
   - Error handling

7. **Success Page** - `/booking/[serviceId]/success`
   - Confirmation message
   - Booking ID
   - Next steps
   - Provider contact info
   - Email sent notification

### Phase 3: Buyer Dashboard (Week 3)
**Goal:** Buyers can manage their bookings

8. **Dashboard Router** - `/dashboard`
   - Detect user type (buyer/provider/both)
   - Redirect to appropriate dashboard

9. **Buyer Dashboard** - `/dashboard/buyer`
   - Upcoming bookings
   - Past bookings
   - Recent reviews
   - Quick actions

10. **My Bookings** - `/dashboard/buyer/bookings`
    - All bookings list
    - Filter by status
    - Cancel option
    - Contact provider

11. **Booking Detail** - `/dashboard/buyer/bookings/[bookingId]`
    - Full booking information
    - Provider contact
    - Cancel/reschedule
    - Leave review (if completed)
    - Messages/conversation

### Phase 4: Provider Dashboard (Week 4)
**Goal:** Providers can manage services and bookings

12. **Provider Dashboard** - `/dashboard/provider`
    - Pending bookings count
    - Recent earnings
    - Active services
    - Quick stats
    - Action items

13. **My Services** - `/dashboard/provider/services`
    - List of services
    - Edit/delete actions
    - Active/inactive toggle
    - Create new service button
    - Performance metrics

14. **Create Service** - `/dashboard/provider/services/create`
    - Multi-step form
    - Basic info (title, description, category)
    - Pricing and delivery
    - Media upload
    - Preview
    - Publish

15. **Edit Service** - `/dashboard/provider/services/[id]/edit`
    - Same form as create
    - Pre-filled with existing data
    - Update button

16. **Provider Bookings** - `/dashboard/provider/bookings`
    - Incoming bookings
    - Accept/decline
    - Mark as completed
    - Filter by status
    - Calendar view

17. **Earnings Dashboard** - `/dashboard/provider/earnings`
    - Total earnings
    - Pending payouts
    - Payout history
    - Request payout button
    - Stripe Connect status

### Phase 5: Settings & Profile (Week 5)
**Goal:** Users can manage their account

18. **User Settings** - `/dashboard/settings`
    - Profile settings
    - Become a provider
    - Notification preferences
    - Account settings

19. **Profile Settings** - `/dashboard/settings/profile`
    - Name, email, photo
    - Bio
    - Location
    - Social links

20. **Provider Onboarding** - `/dashboard/settings/provider`
    - Stripe Connect setup
    - Provider verification
    - Business information
    - Payout preferences

---

## Component Structure

### Shared Components
```tsx
components/
├── marketplace/
│   ├── ServiceCard.tsx          ✅ DONE
│   ├── ServiceGrid.tsx          🔨 Build
│   ├── ServiceFilters.tsx       🔨 Build
│   ├── ProviderCard.tsx         🔨 Build
│   ├── ReviewCard.tsx           🔨 Build
│   └── BookingCard.tsx          🔨 Build
├── booking/
│   ├── BookingForm.tsx          🔨 Build
│   ├── DateTimePicker.tsx       🔨 Build
│   ├── PaymentForm.tsx          🔨 Build
│   └── OrderSummary.tsx         🔨 Build
├── dashboard/
│   ├── DashboardLayout.tsx      🔨 Build
│   ├── StatsCard.tsx            🔨 Build
│   ├── BookingList.tsx          🔨 Build
│   └── EarningsChart.tsx        🔨 Build
└── ui/                          ✅ DONE (shadcn/ui)
```

---

## Database Queries Needed

### Services
- `getServiceById(id)` - Full service details
- `getServicesByProvider(providerId)` - Provider's services
- `searchServices(filters)` - Advanced search ✅ EXISTS
- `getFeaturedServices(limit)` - Featured services ✅ EXISTS
- `getRelatedServices(serviceId)` - Similar services

### Bookings
- `createBooking(data)` - Create booking
- `getBookingById(id)` - Booking details
- `getUserBookings(userId, role)` - User's bookings
- `updateBookingStatus(id, status)` - Update status
- `cancelBooking(id)` - Cancel booking

### Providers
- `getProviderById(id)` - Provider profile
- `getAllProviders(filters)` - Browse providers
- `getProviderStats(id)` - Provider statistics
- `updateProviderProfile(id, data)` - Update profile

### Reviews
- `createReview(data)` - Leave review
- `getServiceReviews(serviceId)` - Service reviews
- `getUserReviews(userId)` - User's reviews

### Payments
- `createPaymentIntent(bookingId)` - Stripe intent ✅ EXISTS
- `processPayment(data)` - Process payment
- `getProviderEarnings(providerId)` - Earnings data
- `requestPayout(providerId, amount)` - Request payout

---

## Tech Stack for Sub-Pages

### Frontend
- **Next.js 14 App Router** - Server/client components
- **React Hook Form** - Forms with validation
- **Zod** - Schema validation
- **TanStack Query** - Data fetching/caching
- **Zustand** - Client state management
- **shadcn/ui** - UI components
- **Tailwind CSS** - Styling

### Backend
- **Next.js API Routes** - REST endpoints ✅ PARTIAL
- **Prisma** - Database ORM ✅ EXISTS
- **Stripe** - Payment processing ✅ PARTIAL
- **NextAuth** - Authentication ✅ EXISTS

---

## API Routes to Build

```typescript
// Service Routes ✅ EXISTS
GET  /api/marketplace/services
POST /api/marketplace/services
GET  /api/marketplace/services/[id]
PUT  /api/marketplace/services/[id]
DELETE /api/marketplace/services/[id]

// Booking Routes ✅ PARTIAL
GET  /api/marketplace/bookings          ✅ EXISTS
POST /api/marketplace/bookings          🔨 Build
GET  /api/marketplace/bookings/[id]     🔨 Build
PUT  /api/marketplace/bookings/[id]     🔨 Build
DELETE /api/marketplace/bookings/[id]   🔨 Build

// Provider Routes ✅ PARTIAL
GET  /api/marketplace/providers         ✅ EXISTS
GET  /api/marketplace/providers/[id]    🔨 Build
PUT  /api/marketplace/providers/[id]    🔨 Build

// Review Routes
POST /api/marketplace/reviews           🔨 Build
GET  /api/marketplace/reviews/service/[id] 🔨 Build

// Payment Routes ✅ PARTIAL
POST /api/marketplace/payments/intent   ✅ EXISTS
POST /api/marketplace/payments/confirm  🔨 Build
POST /api/marketplace/payments/webhooks ✅ EXISTS

// Payout Routes
GET  /api/marketplace/payouts           🔨 Build
POST /api/marketplace/payouts/request   🔨 Build
```

---

## Key Features by Page

### Service Detail Page
- ✅ Responsive image gallery
- ✅ Provider info with verification badge
- ✅ Clear pricing (with platform fee breakdown)
- ✅ Reviews and ratings
- ✅ Book Now prominent CTA
- ✅ Related services
- ✅ Share functionality
- ✅ Report/flag option

### Booking Flow
- ✅ Multi-step wizard
- ✅ Real-time price calculation
- ✅ Calendar date picker
- ✅ Stripe payment integration
- ✅ Email confirmations
- ✅ SMS notifications (optional)
- ✅ Booking cancellation policy

### Provider Dashboard
- ✅ Earnings overview
- ✅ Booking management
- ✅ Service performance metrics
- ✅ Quick actions
- ✅ Notification center
- ✅ Stripe Connect integration

### Buyer Dashboard
- ✅ Upcoming bookings
- ✅ Booking history
- ✅ Saved services
- ✅ Reviews written
- ✅ Messages with providers

---

## Design Principles

### Visual Design
- **Color Scheme:** Orange/Amber/Yellow gradient (Landmark-inspired)
- **Typography:** Inter/System fonts, clear hierarchy
- **Spacing:** Generous whitespace, clear sections
- **Components:** shadcn/ui for consistency

### UX Principles
- **Clarity:** Clear CTAs, obvious next steps
- **Trust:** Provider verification, reviews, secure payments
- **Community:** Warm language, connection-focused
- **Simplicity:** Minimal clicks to complete actions
- **Mobile-First:** Responsive on all devices

### Accessibility
- **ARIA labels** on interactive elements
- **Keyboard navigation** support
- **Color contrast** WCAG AA compliance
- **Screen reader** friendly
- **Focus indicators** visible

---

## Success Metrics

### User Engagement
- Time on service detail page
- Services viewed per session
- Bookmark/save rate
- Share rate

### Conversion
- Service view → booking rate
- Booking completion rate
- Payment success rate
- Provider sign-up rate

### Quality
- Average review rating
- Review completion rate
- Booking cancellation rate
- Dispute rate

---

## Timeline Summary

| Phase | Pages | Duration | Key Deliverables |
|-------|-------|----------|------------------|
| 1 | Service browsing | 1 week | Service list, detail, provider profile |
| 2 | Booking flow | 1 week | Booking form, payment, confirmation |
| 3 | Buyer dashboard | 1 week | Dashboard, bookings, reviews |
| 4 | Provider dashboard | 1 week | Dashboard, services, earnings |
| 5 | Settings | 3-5 days | Profile, provider setup |

**Total:** ~5 weeks to complete MVP sub-pages

---

## Next Immediate Actions

1. ✅ Create this plan document
2. 🔨 Build service list page (`/marketplace/services`)
3. 🔨 Build service detail page (`/marketplace/services/[serviceId]`)
4. 🔨 Create necessary components (ServiceGrid, Filters, etc.)
5. 🔨 Add API endpoints for missing functionality

---

**Status:** Plan complete, ready to implement Phase 1
**Last Updated:** October 30, 2025
