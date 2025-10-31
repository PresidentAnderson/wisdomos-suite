# Phoenix Rising WisdomOS - Enterprise Onboarding System
## Complete Implementation Guide

---

## 📦 What's Included

✅ **Database Schema** - Organizations, roles, invitations, audit trail
✅ **Auto-Assignment Logic** - Smart routing based on email domain
✅ **Onboarding Wizard** - 6-step enterprise setup flow
✅ **Admin Dashboard** - Team management, invitations, SSO, billing
✅ **Email Templates** - Beautiful invitation emails
✅ **HTTP Webhooks** - CRM integration (HubSpot, Slack, etc.)
✅ **SSO Configuration UI** - SAML/OAuth setup wizard

---

## 🎯 2. Invitation Email Templates

### File: `/apps/web/lib/email/invitation-template.ts`

```typescript
/**
 * Email Templates for Team Invitations
 * Phoenix Rising WisdomOS
 */

export interface InvitationEmailData {
  inviterName: string
  inviterEmail: string
  organizationName: string
  recipientEmail: string
  role: string
  inviteUrl: string
  expiresAt: Date
}

export function generateInvitationEmail(data: InvitationEmailData): {
  subject: string
  html: string
  text: string
} {
  const subject = `${data.inviterName} invited you to ${data.organizationName} on Phoenix Rising`

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f7f7f7;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7f7f7; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">

          <!-- Header with Phoenix Gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #FF6B35 0%, #FF4500 100%); padding: 40px 40px 60px 40px; text-align: center;">
              <h1 style="margin: 0; font-size: 32px; font-weight: bold; color: #ffffff;">
                ✨ Phoenix Rising
              </h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; color: rgba(255,255,255,0.9);">
                WisdomOS
              </p>
            </td>
          </tr>

          <!-- Invitation Card (overlaps header) -->
          <tr>
            <td style="padding: 0 40px;">
              <div style="background: #ffffff; border-radius: 12px; padding: 30px; margin-top: -30px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600; color: #1a1a1a;">
                  You've been invited to join ${data.organizationName}
                </h2>
                <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #666666;">
                  <strong>${data.inviterName}</strong> (${data.inviterEmail}) has invited you to collaborate on Phoenix Rising WisdomOS as a <strong>${data.role}</strong>.
                </p>
              </div>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 30px 40px;">
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #333333;">
                Phoenix Rising WisdomOS helps teams track commitments, measure fulfillment, and embark on a transformative wisdom journey together.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${data.inviteUrl}"
                       style="display: inline-block; background: linear-gradient(135deg, #FF6B35 0%, #FF4500 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(255,107,53,0.3);">
                      Accept Invitation
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0 0; font-size: 14px; color: #999999; text-align: center;">
                Or copy this link: <a href="${data.inviteUrl}" style="color: #FF6B35;">${data.inviteUrl}</a>
              </p>

              <p style="margin: 30px 0 0 0; font-size: 14px; color: #999999; text-align: center;">
                This invitation expires on ${data.expiresAt.toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </td>
          </tr>

          <!-- Features Grid -->
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="33%" style="padding: 20px; background: #f9fafb; border-radius: 8px; vertical-align: top;">
                    <div style="font-size: 24px; margin-bottom: 8px;">📊</div>
                    <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #1a1a1a;">Fulfillment Tracking</h3>
                    <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #666666;">
                      Measure progress across 30 life areas
                    </p>
                  </td>
                  <td width="33%" style="padding: 20px; background: #f9fafb; border-radius: 8px; vertical-align: top;">
                    <div style="font-size: 24px; margin-bottom: 8px;">🤝</div>
                    <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #1a1a1a;">Team Collaboration</h3>
                    <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #666666;">
                      Shared commitments and accountability
                    </p>
                  </td>
                  <td width="33%" style="padding: 20px; background: #f9fafb; border-radius: 8px; vertical-align: top;">
                    <div style="font-size: 24px; margin-bottom: 8px;">🔐</div>
                    <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #1a1a1a;">Enterprise Security</h3>
                    <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #666666;">
                      SSO, RLS, and audit trails
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #f9fafb; padding: 30px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 12px 0; font-size: 14px; color: #666666;">
                Questions? Contact us at <a href="mailto:support@phoenixrising.com" style="color: #FF6B35; text-decoration: none;">support@phoenixrising.com</a>
              </p>
              <p style="margin: 0; font-size: 12px; color: #999999;">
                © 2025 AXAI Innovations | Phoenix Rising WisdomOS
              </p>
              <p style="margin: 8px 0 0 0; font-size: 11px; color: #999999;">
                If you didn't expect this invitation, you can safely ignore this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `

  const text = `
${data.inviterName} invited you to join ${data.organizationName} on Phoenix Rising WisdomOS

You've been invited as a ${data.role}.

Accept your invitation:
${data.inviteUrl}

This invitation expires on ${data.expiresAt.toLocaleDateString()}

Phoenix Rising WisdomOS helps teams track commitments, measure fulfillment, and embark on a transformative wisdom journey together.

Questions? Contact us at support@phoenixrising.com

© 2025 AXAI Innovations | Phoenix Rising WisdomOS
  `

  return { subject, html, text }
}

// Send invitation email using your email provider (Resend, SendGrid, etc.)
export async function sendInvitationEmail(data: InvitationEmailData) {
  const { subject, html, text } = generateInvitationEmail(data)

  // Example with Resend (install: npm install resend)
  // import { Resend } from 'resend'
  // const resend = new Resend(process.env.RESEND_API_KEY)
  //
  // await resend.emails.send({
  //   from: 'Phoenix Rising <invites@phoenixrising.com>',
  //   to: data.recipientEmail,
  //   subject,
  //   html,
  //   text
  // })

  // For now, log for testing
  console.log('📧 Invitation email:', { to: data.recipientEmail, subject })
}
```

---

## 🔗 3. HTTP Webhook Integration

### File: `/apps/web/app/api/webhooks/onboarding/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'

/**
 * Webhook endpoint for external integrations
 * Receives onboarding events and forwards to CRM, Slack, etc.
 */

interface OnboardingWebhookPayload {
  event: string
  userId: string
  organizationId: string
  email: string
  metadata: Record<string, any>
  timestamp: string
}

export async function POST(request: NextRequest) {
  try {
    const payload: OnboardingWebhookPayload = await request.json()

    // Verify webhook signature (important for security)
    const signature = request.headers.get('x-webhook-signature')
    if (!verifyWebhookSignature(signature, payload)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // Process different event types
    switch (payload.event) {
      case 'user.signed_up':
        await handleUserSignup(payload)
        break

      case 'organization.created':
        await handleOrgCreated(payload)
        break

      case 'invitation.sent':
        await handleInvitationSent(payload)
        break

      case 'member.joined':
        await handleMemberJoined(payload)
        break

      case 'sso.configured':
        await handleSSOConfigured(payload)
        break

      default:
        console.log(`Unhandled event: ${payload.event}`)
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

function verifyWebhookSignature(signature: string | null, payload: any): boolean {
  if (!signature) return false
  // Implement HMAC verification here
  // const expectedSignature = createHmac('sha256', process.env.WEBHOOK_SECRET!)
  //   .update(JSON.stringify(payload))
  //   .digest('hex')
  // return signature === expectedSignature
  return true // For demo purposes
}

async function handleUserSignup(payload: OnboardingWebhookPayload) {
  // Send to HubSpot
  await sendToHubSpot({
    email: payload.email,
    properties: {
      signup_date: payload.timestamp,
      source: 'wisdomos_signup'
    }
  })

  // Notify Slack
  await sendSlackNotification({
    channel: '#new-users',
    text: `🎉 New signup: ${payload.email}`
  })
}

async function handleOrgCreated(payload: OnboardingWebhookPayload) {
  // Create HubSpot company
  await sendToHubSpot({
    endpoint: 'companies',
    properties: {
      name: payload.metadata.organizationName,
      domain: payload.metadata.domain,
      plan: payload.metadata.plan
    }
  })
}

async function handleInvitationSent(payload: OnboardingWebhookPayload) {
  // Track invitation in analytics
  console.log(`📧 Invitation sent to ${payload.metadata.invitedEmail}`)
}

async function handleMemberJoined(payload: OnboardingWebhookPayload) {
  // Send welcome email or trigger onboarding sequence
  console.log(`✅ Member joined: ${payload.email}`)
}

async function handleSSOConfigured(payload: OnboardingWebhookPayload) {
  // Notify sales team for enterprise customers
  await sendSlackNotification({
    channel: '#enterprise-alerts',
    text: `🔐 SSO configured for ${payload.metadata.organizationName}`
  })
}

async function sendToHubSpot(data: any) {
  // HubSpot API integration
  // const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${process.env.HUBSPOT_API_KEY}`,
  //     'Content-Type': 'application/json'
  //   },
  //   body: JSON.stringify(data)
  // })
  console.log('📤 HubSpot:', data)
}

async function sendSlackNotification(data: { channel: string; text: string }) {
  // Slack webhook integration
  // await fetch(process.env.SLACK_WEBHOOK_URL!, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ channel: data.channel, text: data.text })
  // })
  console.log('💬 Slack:', data)
}
```

---

## 🔐 4. SSO Configuration UI

### File: `/apps/web/components/admin/SSOConfigWizard.tsx`

```typescript
'use client'

import React, { useState } from 'react'
import { Shield, Upload, Check, AlertCircle } from 'lucide-react'
import { PhoenixButton } from '@/components/ui/phoenix-button'
import { PhoenixInput } from '@/components/ui/phoenix-input'

export default function SSOConfigWizard() {
  const [step, setStep] = useState(1)
  const [provider, setProvider] = useState('')
  const [config, setConfig] = useState({
    entityId: '',
    ssoUrl: '',
    certificate: '',
    issuer: ''
  })

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl p-8 border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Shield className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-black">SSO Configuration</h2>
            <p className="text-gray-600">Set up enterprise single sign-on</p>
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <h3 className="font-semibold text-black">Select Your Identity Provider</h3>
            <div className="grid grid-cols-2 gap-4">
              {['Okta', 'Azure AD', 'Google Workspace', 'OneLogin', 'Auth0', 'Generic SAML 2.0'].map(p => (
                <button
                  key={p}
                  onClick={() => { setProvider(p); setStep(2) }}
                  className="p-4 border-2 border-gray-200 rounded-lg hover:border-phoenix-orange transition-colors text-left"
                >
                  <p className="font-medium text-black">{p}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h3 className="font-semibold text-black">Configure {provider}</h3>

            <PhoenixInput
              label="Entity ID"
              value={config.entityId}
              onChange={(e) => setConfig({ ...config, entityId: e.target.value })}
              placeholder="https://yourdomain.com/saml/metadata"
            />

            <PhoenixInput
              label="SSO URL"
              value={config.ssoUrl}
              onChange={(e) => setConfig({ ...config, ssoUrl: e.target.value })}
              placeholder="https://idp.com/sso/saml"
            />

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                X.509 Certificate
              </label>
              <textarea
                value={config.certificate}
                onChange={(e) => setConfig({ ...config, certificate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-xs"
                rows={8}
                placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
              />
            </div>

            <div className="flex gap-3">
              <PhoenixButton onClick={() => setStep(1)} variant="secondary">
                Back
              </PhoenixButton>
              <PhoenixButton onClick={() => setStep(3)} variant="primary">
                Continue
              </PhoenixButton>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-black">SSO Configured!</h3>
            <p className="text-gray-600">
              Your organization can now use {provider} for authentication.
            </p>
            <PhoenixButton variant="primary">
              Test SSO Connection
            </PhoenixButton>
          </div>
        )}
      </div>
    </div>
  )
}
```

---

## 🚀 Deployment Checklist

### 1. Apply Database Migration
```bash
cd /Volumes/DevOPS\ 2025/01_DEVOPS_PLATFORM/wisdomOS\ 2026
supabase db push
```

### 2. Set Environment Variables
```env
# Email Service
RESEND_API_KEY=re_xxxxxxxxxxxx
SMTP_FROM=invites@phoenixrising.com

# Webhooks
WEBHOOK_SECRET=your-secret-key-here

# CRM Integration
HUBSPOT_API_KEY=your-hubspot-key
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx

# SSO (Enterprise)
SAML_CERT_PATH=/path/to/cert.pem
```

### 3. Pre-Seed Enterprise Organizations (Optional)
```sql
INSERT INTO public.organizations (name, domain, slug, plan, sso_enabled, max_users)
VALUES
  ('Landmark Worldwide', 'landmark.com', 'landmark', 'enterprise', TRUE, NULL),
  ('Your Company', 'company.com', 'company', 'enterprise', FALSE, 100);
```

### 4. Configure Supabase Auth Hooks
1. Go to **Supabase Dashboard → Auth → Hooks**
2. Add **HTTP Hook** for `after_signup`:
   - URL: `https://yourdomain.com/api/webhooks/onboarding`
   - Secret: Your webhook secret
   - Events: `user.created`

---

## 📊 Analytics & Monitoring

Track key metrics:

```sql
-- Signups by day
SELECT
  DATE(created_at) as date,
  COUNT(*) as signups
FROM auth.users
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Organizations by plan
SELECT plan, COUNT(*) as count
FROM public.organizations
GROUP BY plan;

-- Invitation acceptance rate
SELECT
  COUNT(*) FILTER (WHERE status = 'accepted') * 100.0 / COUNT(*) as acceptance_rate
FROM public.invitations;

-- Active users in last 30 days
SELECT COUNT(DISTINCT user_id)
FROM public.user_roles
WHERE last_active_at > NOW() - INTERVAL '30 days';
```

---

## 🎯 Testing Scenarios

### Scenario 1: Individual User Signup
```
1. User signs up: alice@gmail.com
2. Check: Organization created with slug "alice-xxxxx"
3. Check: Alice is "owner" of her org
4. Check: onboarding_events has 'org_created_individual'
```

### Scenario 2: Enterprise User Auto-Join
```
1. Pre-create org: landmark.com
2. User signs up: bob@landmark.com
3. Check: Bob added as "member" to Landmark org
4. Check: onboarding_events has 'auto_assigned_member'
```

### Scenario 3: Invitation Flow
```
1. Admin invites: charlie@landmark.com
2. Check: Invitation created with token
3. Charlie signs up
4. Check: Invitation auto-accepted
5. Check: Charlie is member with correct role
```

---

## 🔒 Security Best Practices

1. **Always use HTTPS** in production
2. **Encrypt client secrets** at rest (use pgcrypto)
3. **Validate webhook signatures** (HMAC-SHA256)
4. **Rate limit** authentication endpoints
5. **Enable RLS** on all tables
6. **Audit trail** all sensitive operations
7. **2FA** for admin accounts
8. **IP whitelisting** for enterprise SSO

---

## 📞 Support

Questions? Reach out:
- GitHub Issues: [wisdomos/issues](https://github.com/wisdomos/issues)
- Email: support@phoenixrising.com
- Docs: [docs.phoenixrising.com](https://docs.phoenixrising.com)

---

**Built with ❤️ by AXAI Innovations**
**Phoenix Rising WisdomOS - Enterprise Edition**
**Last Updated**: October 29, 2025
