/**
 * Send Webhook Edge Function
 *
 * Purpose: Delivers webhook events to external subscribers
 * with retry logic and HMAC signing for security.
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { createHmac } from 'https://deno.land/std@0.177.0/hash/mod.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface WebhookPayload {
  event_type: string;
  profile_id: string;
  data: any;
  timestamp: string;
}

interface WebhookRequest {
  profile_id: string;
  event_type: string;
  data: any;
}

const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 5000, 15000]; // 1s, 5s, 15s

serve(async (req) => {
  try {
    // CORS handling
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { profile_id, event_type, data }: WebhookRequest = await req.json();

    if (!profile_id || !event_type) {
      return new Response(
        JSON.stringify({ error: 'profile_id and event_type are required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`Processing webhook: ${event_type} for profile ${profile_id}`);

    // 1. Fetch active webhooks for this profile and event type
    const { data: webhooks, error: webhooksError } = await supabase
      .from('fd_webhook')
      .select('*')
      .eq('profile_id', profile_id)
      .eq('is_active', true)
      .contains('events', [event_type]);

    if (webhooksError) throw webhooksError;

    if (!webhooks || webhooks.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No active webhooks found for this event',
          delivered: 0,
        }),
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 2. Prepare payload
    const payload: WebhookPayload = {
      event_type,
      profile_id,
      data,
      timestamp: new Date().toISOString(),
    };

    // 3. Deliver to each webhook
    const deliveryResults = await Promise.all(
      webhooks.map((webhook) => deliverWebhook(webhook, payload, supabase))
    );

    const successful = deliveryResults.filter((r) => r.success).length;
    const failed = deliveryResults.filter((r) => !r.success).length;

    return new Response(
      JSON.stringify({
        success: true,
        event_type,
        profile_id,
        webhooks_total: webhooks.length,
        delivered: successful,
        failed,
        results: deliveryResults,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in send-webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});

/**
 * Deliver webhook to a single endpoint with retry logic
 */
async function deliverWebhook(
  webhook: any,
  payload: WebhookPayload,
  supabase: any
): Promise<any> {
  const startTime = Date.now();
  let attempt = 0;
  let lastError: string | null = null;

  // Sign payload with HMAC
  const signature = await signPayload(JSON.stringify(payload), webhook.secret);

  while (attempt < MAX_RETRIES) {
    try {
      console.log(`Delivering webhook to ${webhook.url} (attempt ${attempt + 1}/${MAX_RETRIES})`);

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': payload.event_type,
          'X-Webhook-Timestamp': payload.timestamp,
          'User-Agent': 'WisdomOS-Webhook/1.0',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000), // 10s timeout
      });

      if (response.ok) {
        // Success!
        const duration = Date.now() - startTime;

        // Update webhook success status
        await supabase
          .from('fd_webhook')
          .update({
            last_success_at: new Date().toISOString(),
            failure_count: 0,
          })
          .eq('id', webhook.id);

        return {
          success: true,
          webhook_id: webhook.id,
          url: webhook.url,
          status_code: response.status,
          duration_ms: duration,
          attempts: attempt + 1,
        };
      } else {
        lastError = `HTTP ${response.status}: ${await response.text()}`;
        console.error(`Webhook delivery failed: ${lastError}`);
      }
    } catch (error) {
      lastError = error.message;
      console.error(`Webhook delivery error: ${lastError}`);
    }

    // Retry with exponential backoff
    attempt++;
    if (attempt < MAX_RETRIES) {
      await sleep(RETRY_DELAYS[attempt - 1]);
    }
  }

  // All retries failed
  const duration = Date.now() - startTime;

  // Update webhook failure status
  await supabase
    .from('fd_webhook')
    .update({
      last_failure_at: new Date().toISOString(),
      failure_count: webhook.failure_count + 1,
    })
    .eq('id', webhook.id);

  // Disable webhook if too many failures
  if (webhook.failure_count + 1 >= 10) {
    console.warn(`Disabling webhook ${webhook.id} due to repeated failures`);
    await supabase
      .from('fd_webhook')
      .update({ is_active: false })
      .eq('id', webhook.id);
  }

  return {
    success: false,
    webhook_id: webhook.id,
    url: webhook.url,
    error: lastError,
    duration_ms: duration,
    attempts: MAX_RETRIES,
  };
}

/**
 * Sign payload with HMAC-SHA256
 */
async function signPayload(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(payload);

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, messageData);

  // Convert to hex string
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
