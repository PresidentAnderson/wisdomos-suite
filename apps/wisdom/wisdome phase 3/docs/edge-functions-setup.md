# Supabase Edge Functions Setup

## Overview

Edge Functions are serverless TypeScript functions deployed on Supabase's global edge network. They provide:

- **Heavy Computation**: AI processing, batch operations
- **Webhooks**: Outgoing webhook delivery
- **Scheduled Tasks**: Complex pg_cron job logic
- **Third-party Integrations**: OpenAI, Stripe, etc.

## Architecture

```
supabase/functions/
├── _shared/           # Shared utilities
│   ├── cors.ts
│   ├── supabase.ts
│   └── types.ts
├── journal-ai-analysis/
│   └── index.ts
├── send-webhook/
│   └── index.ts
├── generate-monthly-review/
│   └── index.ts
├── process-batch-scores/
│   └── index.ts
└── export-data/
    └── index.ts
```

## Core Edge Functions

### 1. Journal AI Analysis

**Purpose**: Analyze journal entries for sentiment, topics, and insights

**Trigger**: Called after journal entry creation
**Input**: `{ entry_id: UUID }`
**Output**: `{ sentiment: number, topics: string[], ai_summary: string }`

```typescript
// supabase/functions/journal-ai-analysis/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  const { entry_id } = await req.json()
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!
  )

  // Fetch entry
  const { data: entry } = await supabase
    .from('fd_entry')
    .select('*')
    .eq('id', entry_id)
    .single()

  // Call OpenAI for analysis
  const openai_response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Analyze this journal entry for sentiment (-1 to 1), key topics (array), and provide a 2-sentence summary.'
        },
        {
          role: 'user',
          content: entry.content_md
        }
      ]
    })
  })

  const analysis = await openai_response.json()
  // Parse and update entry...

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

### 2. Send Webhook

**Purpose**: Deliver webhooks to user-configured endpoints

**Trigger**: Called by pg_cron or direct invocation
**Input**: `{ webhook_id: UUID, event: string, payload: object }`
**Output**: `{ delivered: boolean, response_status: number }`

```typescript
// supabase/functions/send-webhook/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts"

serve(async (req) => {
  const { webhook_id, event, payload } = await req.json()
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Fetch webhook config
  const { data: webhook } = await supabase
    .from('webhooks')
    .select('*')
    .eq('id', webhook_id)
    .single()

  if (!webhook || !webhook.is_active) {
    return new Response('Webhook not found or inactive', { status: 404 })
  }

  // Sign payload
  const signature = createHmac('sha256', webhook.secret)
    .update(JSON.stringify(payload))
    .digest('hex')

  // Deliver webhook
  try {
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Fulfillment-Signature': signature,
        'X-Fulfillment-Event': event,
      },
      body: JSON.stringify(payload),
    })

    // Log delivery
    await supabase.from('webhook_deliveries').insert({
      webhook_id,
      event,
      payload,
      response_status: response.status,
      response_body: await response.text(),
      delivered_at: new Date().toISOString(),
    })

    // Update webhook stats
    await supabase
      .from('webhooks')
      .update({
        last_triggered_at: new Date().toISOString(),
        failure_count: response.ok ? 0 : webhook.failure_count + 1,
      })
      .eq('id', webhook_id)

    return new Response(JSON.stringify({ delivered: response.ok }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    await supabase.from('webhook_deliveries').insert({
      webhook_id,
      event,
      payload,
      response_status: 0,
      response_body: error.message,
      delivered_at: new Date().toISOString(),
    })

    return new Response(JSON.stringify({ delivered: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
```

### 3. Generate Monthly Review

**Purpose**: Create comprehensive monthly review with AI insights

**Trigger**: Called by pg_cron on 1st of month
**Input**: `{ profile_id: UUID, month: string }`
**Output**: `{ review_id: UUID, gfs: number }`

### 4. Process Batch Scores

**Purpose**: Batch process score calculations for performance

**Trigger**: Manual or scheduled
**Input**: `{ profile_ids: UUID[], period: string }`
**Output**: `{ processed: number, errors: number }`

### 5. Export Data

**Purpose**: Generate comprehensive data exports (JSON, CSV, PDF)

**Trigger**: User-initiated
**Input**: `{ profile_id: UUID, format: string, date_range: object }`
**Output**: `{ export_url: string, expires_at: string }`

## Deployment

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to project
supabase link --project-ref your-project-ref

# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy journal-ai-analysis

# Set secrets
supabase secrets set OPENAI_API_KEY=sk-...
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
```

## Environment Variables

Required secrets for Edge Functions:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_test_... (optional)
```

## Testing

```bash
# Serve locally
supabase functions serve

# Invoke function locally
curl -i --location --request POST 'http://localhost:54321/functions/v1/journal-ai-analysis' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"entry_id": "123e4567-e89b-12d3-a456-426614174000"}'
```

## Monitoring

- **Logs**: `supabase functions logs journal-ai-analysis`
- **Metrics**: View in Supabase Dashboard → Edge Functions
- **Alerts**: Configure in Supabase Dashboard → Settings → Alerts

## Security

- **Authentication**: All functions verify JWT tokens via `Authorization: Bearer` header
- **RLS**: Functions use service role key but respect RLS policies
- **Secrets**: Never expose secrets in function code; use Supabase Secrets
- **CORS**: Configure CORS headers for browser invocations
- **Rate Limiting**: Implement rate limiting per profile/API key

## Cost Optimization

- **Minimize Cold Starts**: Keep functions warm with scheduled invocations
- **Batch Processing**: Process multiple items per invocation
- **Caching**: Cache frequently accessed data (e.g., area definitions)
- **Timeouts**: Set reasonable timeouts (default 10s, max 150s)

## Next Steps

1. Implement shared utilities in `_shared/`
2. Create each Edge Function following the templates above
3. Deploy to staging environment first
4. Test thoroughly with production-like data
5. Deploy to production
6. Monitor logs and metrics
7. Iterate based on performance data
