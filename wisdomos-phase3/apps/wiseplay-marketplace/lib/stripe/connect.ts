import { stripe } from './config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Create a Stripe Connect account for a provider
 */
export async function createConnectAccount(userId: string, email: string) {
  try {
    const account = await stripe.accounts.create({
      type: 'express',
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      settings: {
        payouts: {
          schedule: {
            interval: 'daily',
            delay_days: 2,
          },
        },
      },
    });

    // Update provider profile with Stripe account ID
    await prisma.providerProfile.update({
      where: { userId },
      data: {
        stripeAccountId: account.id,
      },
    });

    return account;
  } catch (error) {
    console.error('Error creating Stripe Connect account:', error);
    throw new Error('Failed to create Stripe Connect account');
  }
}

/**
 * Create an account link for onboarding
 */
export async function createAccountLink(
  stripeAccountId: string,
  returnUrl: string,
  refreshUrl: string
) {
  try {
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });

    return accountLink;
  } catch (error) {
    console.error('Error creating account link:', error);
    throw new Error('Failed to create account link');
  }
}

/**
 * Retrieve Stripe Connect account details
 */
export async function getConnectAccount(stripeAccountId: string) {
  try {
    const account = await stripe.accounts.retrieve(stripeAccountId);
    return account;
  } catch (error) {
    console.error('Error retrieving Stripe account:', error);
    throw new Error('Failed to retrieve Stripe account');
  }
}

/**
 * Check if a Connect account is fully onboarded
 */
export async function isAccountOnboarded(stripeAccountId: string): Promise<boolean> {
  try {
    const account = await stripe.accounts.retrieve(stripeAccountId);
    return (
      account.charges_enabled === true &&
      account.payouts_enabled === true &&
      account.details_submitted === true
    );
  } catch (error) {
    console.error('Error checking account status:', error);
    return false;
  }
}

/**
 * Update provider profile with Stripe account status
 */
export async function updateProviderStripeStatus(
  userId: string,
  stripeAccountId: string
) {
  try {
    const account = await stripe.accounts.retrieve(stripeAccountId);

    await prisma.providerProfile.update({
      where: { userId },
      data: {
        stripeChargesEnabled: account.charges_enabled || false,
        stripePayoutsEnabled: account.payouts_enabled || false,
        stripeOnboardingComplete: account.details_submitted || false,
        stripeBankConnected: (account.external_accounts?.data?.length ?? 0) > 0,
      },
    });

    return account;
  } catch (error) {
    console.error('Error updating provider Stripe status:', error);
    throw new Error('Failed to update provider Stripe status');
  }
}

/**
 * Create a login link for provider to access Stripe Dashboard
 */
export async function createLoginLink(stripeAccountId: string) {
  try {
    const loginLink = await stripe.accounts.createLoginLink(stripeAccountId);
    return loginLink;
  } catch (error) {
    console.error('Error creating login link:', error);
    throw new Error('Failed to create login link');
  }
}
