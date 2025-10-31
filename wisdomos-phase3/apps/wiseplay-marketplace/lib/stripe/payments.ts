import { stripe } from './config';
import { calculatePlatformFee, toCents } from './config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CreatePaymentIntentParams {
  amount: number; // Amount in dollars
  currency?: string;
  buyerId: string;
  providerId: string;
  bookingId: string;
  stripeAccountId: string;
  metadata?: Record<string, string>;
}

/**
 * Create a payment intent with platform fee
 */
export async function createPaymentIntent({
  amount,
  currency = 'USD',
  buyerId,
  providerId,
  bookingId,
  stripeAccountId,
  metadata = {},
}: CreatePaymentIntentParams) {
  try {
    const amountInCents = toCents(amount);
    const platformFee = calculatePlatformFee(amountInCents);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      application_fee_amount: platformFee,
      transfer_data: {
        destination: stripeAccountId,
      },
      metadata: {
        buyerId,
        providerId,
        bookingId,
        platformFee: platformFee.toString(),
        ...metadata,
      },
    });

    // Update booking with payment intent ID
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentIntentId: paymentIntent.id,
        paymentStatus: 'PROCESSING',
      },
    });

    return paymentIntent;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw new Error('Failed to create payment intent');
  }
}

/**
 * Confirm a payment intent
 */
export async function confirmPaymentIntent(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Error confirming payment intent:', error);
    throw new Error('Failed to confirm payment intent');
  }
}

/**
 * Retrieve a payment intent
 */
export async function retrievePaymentIntent(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    throw new Error('Failed to retrieve payment intent');
  }
}

/**
 * Cancel a payment intent
 */
export async function cancelPaymentIntent(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Error cancelling payment intent:', error);
    throw new Error('Failed to cancel payment intent');
  }
}

/**
 * Create a refund for a payment
 */
export async function createRefund(
  paymentIntentId: string,
  amount?: number,
  reason?: string
) {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount,
      reason: reason as any,
    });

    return refund;
  } catch (error) {
    console.error('Error creating refund:', error);
    throw new Error('Failed to create refund');
  }
}

/**
 * Handle successful payment
 */
export async function handlePaymentSuccess(paymentIntentId: string) {
  try {
    const booking = await prisma.booking.findFirst({
      where: { paymentIntentId },
      include: { service: true },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    const amountInCents = toCents(parseFloat(booking.totalPrice.toString()));
    const platformFee = calculatePlatformFee(amountInCents);
    const providerAmount = amountInCents - platformFee;

    // Update booking
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        paymentStatus: 'SUCCEEDED',
        status: 'PAID',
        paidAt: new Date(),
      },
    });

    // Create transaction record
    await prisma.transaction.create({
      data: {
        buyerId: booking.buyerId,
        bookingId: booking.id,
        amount: amountInCents,
        platformFeeAmount: platformFee,
        providerAmount,
        currency: booking.currency,
        stripePaymentIntentId: paymentIntentId,
        status: 'COMPLETED',
      },
    });

    return booking;
  } catch (error) {
    console.error('Error handling payment success:', error);
    throw new Error('Failed to handle payment success');
  }
}

/**
 * Handle failed payment
 */
export async function handlePaymentFailure(paymentIntentId: string) {
  try {
    const booking = await prisma.booking.findFirst({
      where: { paymentIntentId },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        paymentStatus: 'FAILED',
        status: 'CANCELLED',
      },
    });

    return booking;
  } catch (error) {
    console.error('Error handling payment failure:', error);
    throw new Error('Failed to handle payment failure');
  }
}
