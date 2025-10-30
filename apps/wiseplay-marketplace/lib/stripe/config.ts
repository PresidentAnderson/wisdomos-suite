import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia',
  typescript: true,
});

// Platform fee configuration (6%)
export const PLATFORM_FEE_PERCENTAGE = 6;
export const PLATFORM_FEE_DECIMAL = 0.06;

/**
 * Calculate platform fee from base price
 * @param basePrice - Base price in cents or decimal
 * @returns Platform fee amount
 */
export function calculatePlatformFee(basePrice: number): number {
  return Math.round(basePrice * PLATFORM_FEE_DECIMAL);
}

/**
 * Calculate provider amount after platform fee
 * @param basePrice - Base price in cents or decimal
 * @returns Amount provider receives
 */
export function calculateProviderAmount(basePrice: number): number {
  return basePrice - calculatePlatformFee(basePrice);
}

/**
 * Convert dollar amount to cents for Stripe
 * @param amount - Amount in dollars
 * @returns Amount in cents
 */
export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Convert cents to dollar amount
 * @param cents - Amount in cents
 * @returns Amount in dollars
 */
export function toDollars(cents: number): number {
  return cents / 100;
}

/**
 * Format currency for display
 * @param amount - Amount in cents
 * @param currency - Currency code (default: USD)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(toDollars(amount));
}

// Stripe publishable key for client-side
export const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
