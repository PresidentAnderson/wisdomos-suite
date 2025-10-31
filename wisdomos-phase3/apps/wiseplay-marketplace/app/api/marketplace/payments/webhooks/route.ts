import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/config';
import { handlePaymentSuccess, handlePaymentFailure } from '@/lib/stripe/payments';
import { headers } from 'next/headers';

/**
 * POST /api/marketplace/payments/webhooks
 * Handle Stripe webhook events
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = headers().get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Verify webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object.id);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object.id);
        break;

      case 'account.updated':
        // Handle Connect account updates
        console.log('Account updated:', event.data.object.id);
        break;

      case 'charge.succeeded':
        console.log('Charge succeeded:', event.data.object.id);
        break;

      case 'charge.refunded':
        console.log('Charge refunded:', event.data.object.id);
        break;

      default:
        console.log('Unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
