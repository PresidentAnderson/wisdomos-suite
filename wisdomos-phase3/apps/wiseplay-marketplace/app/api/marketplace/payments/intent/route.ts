import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/marketplace/auth';
import { createPaymentIntent } from '@/lib/stripe/payments';
import { z } from 'zod';

// Validation schema
const createPaymentIntentSchema = z.object({
  bookingId: z.string(),
});

/**
 * POST /api/marketplace/payments/intent
 * Create a Stripe payment intent for a booking
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (user instanceof NextResponse) {
      return user; // Return error response
    }

    const userId = user.id;
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 400 });
    }

    const body = await request.json();
    const { bookingId } = createPaymentIntentSchema.parse(body);

    // Get booking details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        service: {
          include: {
            provider: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Verify user is the buyer
    if (booking.buyerId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Check if booking already has a payment intent
    if (booking.paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment intent already exists for this booking' },
        { status: 400 }
      );
    }

    // Check if provider has Stripe account
    if (!booking.service.provider.stripeAccountId) {
      return NextResponse.json(
        { error: 'Provider has not set up payment processing' },
        { status: 400 }
      );
    }

    // Create payment intent
    const paymentIntent = await createPaymentIntent({
      amount: parseFloat(booking.totalPrice.toString()),
      currency: booking.currency,
      buyerId: booking.buyerId,
      providerId: booking.providerId,
      bookingId: booking.id,
      stripeAccountId: booking.service.provider.stripeAccountId,
      metadata: {
        serviceId: booking.serviceId,
        serviceTitle: booking.service.title,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
