# Authentication Providers Admin Panel

## Overview

The Authentication Providers Admin Panel allows workspace owners to configure and enable multiple authentication methods for their users, including:

- **Email** (enabled by default)
- **Phone** (SMS verification)
- **Social OAuth** (Google, GitHub, Facebook, Twitter, etc.)
- **Enterprise SSO** (SAML 2.0, Azure, WorkOS)
- **Web3** (Wallet-based authentication)

## Features

### Admin Dashboard (`/admin/auth-providers`)

- **Enable/Disable Providers**: Toggle authentication methods on/off with a single click
- **Configure OAuth**: Set client IDs, secrets, scopes, and URLs
- **Configure SAML**: Upload certificates, set entity IDs, SSO URLs
- **Configure Web3**: Specify chain IDs and contract addresses
- **Search & Filter**: Find providers quickly
- **Real-time Status**: See which providers are enabled
- **Visual Feedback**: Color-coded status indicators

### Dynamic Login Experience

The login page automatically displays only enabled authentication providers, giving users a clean, focused authentication experience.

## Architecture

### Database Schema

**Table**: `auth_provider`

```sql
CREATE TABLE auth_provider (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  provider_key TEXT NOT NULL,        -- 'google', 'github', etc.
  provider_name TEXT NOT NULL,       -- 'Google', 'GitHub', etc.
  provider_type TEXT NOT NULL,       -- 'oauth', 'saml', 'email', 'phone', 'web3'
  enabled BOOLEAN DEFAULT FALSE,

  -- OAuth/OIDC Configuration
  client_id TEXT,
  client_secret TEXT,
  authorization_url TEXT,
  token_url TEXT,
  user_info_url TEXT,
  redirect_uri TEXT,
  scopes TEXT[],

  -- SAML Configuration
  saml_entity_id TEXT,
  saml_sso_url TEXT,
  saml_certificate TEXT,
  saml_issuer TEXT,

  -- Web3 Configuration
  web3_chain_id INTEGER,
  web3_contract_address TEXT,

  -- Email/Phone Configuration
  email_templates JSONB,
  phone_provider TEXT,

  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(tenant_id, provider_key)
);
```

### API Endpoints

#### GET `/api/admin/auth-providers`
Fetch all auth providers for the current tenant.

**Response:**
```json
{
  "providers": [
    {
      "id": "uuid",
      "providerKey": "google",
      "providerName": "Google",
      "providerType": "oauth",
      "enabled": true,
      "clientId": "...",
      "scopes": ["email", "profile"]
    }
  ],
  "tenantId": "tenant-id"
}
```

#### PATCH `/api/admin/auth-providers/[id]`
Toggle provider enabled status.

**Request:**
```json
{
  "enabled": true
}
```

#### PUT `/api/admin/auth-providers/[id]`
Update provider configuration.

**Request:**
```json
{
  "clientId": "your-client-id",
  "clientSecret": "your-client-secret",
  "authorizationUrl": "https://provider.com/oauth/authorize",
  "tokenUrl": "https://provider.com/oauth/token",
  "userInfoUrl": "https://provider.com/oauth/userinfo",
  "redirectUri": "https://yourdomain.com/auth/callback",
  "scopes": ["email", "profile", "openid"]
}
```

## Provider Configuration Guides

### OAuth Providers (Google, GitHub, etc.)

1. **Navigate to Admin Panel**: `/admin/auth-providers`
2. **Find Provider**: Search for "Google", "GitHub", etc.
3. **Click "Configure"**: Expand configuration form
4. **Enter Credentials**:
   - Client ID (from provider's developer console)
   - Client Secret
   - Scopes (e.g., `email, profile`)
5. **Set Redirect URI**: `https://yourdomain.com/auth/callback`
6. **Save Configuration**
7. **Toggle Enable**: Turn on the provider

#### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth client ID
5. Set authorized redirect URI: `https://yourdomain.com/auth/callback`
6. Copy Client ID and Client Secret
7. In WisdomOS Admin:
   - Client ID: `your-client-id.apps.googleusercontent.com`
   - Client Secret: `your-client-secret`
   - Scopes: `email, profile, openid`
   - Authorization URL: `https://accounts.google.com/o/oauth2/v2/auth`
   - Token URL: `https://oauth2.googleapis.com/token`
   - User Info URL: `https://www.googleapis.com/oauth2/v3/userinfo`

#### GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Set Authorization callback URL: `https://yourdomain.com/auth/callback`
4. Copy Client ID and generate Client Secret
5. In WisdomOS Admin:
   - Client ID: `your-github-client-id`
   - Client Secret: `your-github-client-secret`
   - Scopes: `user:email, read:user`
   - Authorization URL: `https://github.com/login/oauth/authorize`
   - Token URL: `https://github.com/login/oauth/access_token`
   - User Info URL: `https://api.github.com/user`

### SAML 2.0 Setup

1. **Get SAML Metadata** from your Identity Provider (Okta, OneLogin, etc.)
2. **Configure in WisdomOS**:
   - Entity ID: Your SP entity ID
   - SSO URL: IdP's single sign-on URL
   - Certificate: X.509 certificate (PEM format)
   - Issuer: IdP's issuer URI
3. **Provide SP Metadata** to your IdP:
   - ACS URL: `https://yourdomain.com/auth/saml/acs`
   - Entity ID: `https://yourdomain.com/saml/metadata`

### Web3 Wallet Setup

1. **Select Blockchain Network**:
   - Ethereum Mainnet: Chain ID `1`
   - Polygon: Chain ID `137`
   - Arbitrum: Chain ID `42161`
2. **(Optional) Contract Address**: If using token-gated auth
3. **Users will connect** via MetaMask, WalletConnect, or Coinbase Wallet

### Phone Authentication Setup

1. **Choose SMS Provider**:
   - Twilio
   - Vonage
   - MessageBird
2. **Configure API Credentials** (add to environment variables):
   ```env
   TWILIO_ACCOUNT_SID=your-account-sid
   TWILIO_AUTH_TOKEN=your-auth-token
   TWILIO_PHONE_NUMBER=+1234567890
   ```

## Usage

### For Admins

1. Navigate to `/admin/auth-providers`
2. Enable desired authentication methods
3. Configure OAuth/SAML credentials
4. Save changes
5. Test login flow

### For End Users

Users will see only enabled authentication providers on the login page:

```tsx
import DynamicLoginProviders from '@/components/auth/DynamicLoginProviders'

<DynamicLoginProviders
  onProviderClick={(provider) => {
    console.log('User clicked:', provider.providerName)
  }}
  excludeEmail={false}
/>
```

## Supported Providers (24 Total)

### Identity & Email
- ✅ **Email** (enabled by default)
- ⚪ **Phone** (SMS verification)

### Social Login
- ⚪ **Google**
- ⚪ **Facebook**
- ⚪ **GitHub**
- ⚪ **GitLab**
- ⚪ **Bitbucket**
- ⚪ **Twitter**
- ⚪ **Discord**
- ⚪ **Apple**
- ⚪ **Spotify**
- ⚪ **Twitch**
- ⚪ **Kakao**

### Professional/Enterprise
- ⚪ **LinkedIn (OIDC)**
- ⚪ **Slack (OIDC)**
- ⚪ **Slack (Deprecated)**
- ⚪ **Microsoft Azure**
- ⚪ **WorkOS**
- ⚪ **Zoom**
- ⚪ **SAML 2.0**
- ⚪ **KeyCloak**

### Creative/Productivity
- ⚪ **Figma**
- ⚪ **Notion**

### Web3
- ⚪ **Web3 Wallet** (MetaMask, WalletConnect, etc.)

## Security Considerations

### Client Secret Encryption

**IMPORTANT**: In production, `client_secret` should be encrypted at rest.

Recommended approaches:
1. Use PostgreSQL `pgcrypto` extension
2. Application-level encryption with KMS
3. Use environment variables + secrets manager

Example with pgcrypto:
```sql
-- Enable extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Encrypt secret
UPDATE auth_provider
SET client_secret = pgp_sym_encrypt(client_secret, 'your-encryption-key')
WHERE provider_type = 'oauth';

-- Decrypt secret
SELECT pgp_sym_decrypt(client_secret::bytea, 'your-encryption-key')
FROM auth_provider;
```

### HTTPS Required

All OAuth redirect URIs MUST use HTTPS in production. HTTP is only acceptable for `localhost` development.

### CORS Configuration

Ensure your OAuth callbacks are whitelisted in your CORS policy.

### Rate Limiting

Implement rate limiting on authentication endpoints to prevent brute force attacks.

## Troubleshooting

### Provider Not Showing on Login Page

1. **Check if enabled**: Go to `/admin/auth-providers` and ensure toggle is ON
2. **Check API response**: Open DevTools → Network → Check `/api/admin/auth-providers`
3. **Clear cache**: Hard refresh the login page (Cmd+Shift+R / Ctrl+Shift+R)

### OAuth Redirect URI Mismatch

**Error**: "redirect_uri_mismatch"

**Solution**:
1. Check provider's developer console
2. Ensure redirect URI exactly matches (including protocol, trailing slash, etc.)
3. Common format: `https://yourdomain.com/auth/callback`

### SAML Signature Validation Failed

**Error**: "Invalid signature"

**Solution**:
1. Verify X.509 certificate is correct and not expired
2. Ensure certificate is in PEM format (with `-----BEGIN CERTIFICATE-----` headers)
3. Check clock sync between SP and IdP (time drift can cause failures)

### Web3 Wallet Not Connecting

**Common Issues**:
1. User doesn't have MetaMask installed
2. Wrong network selected (switch to correct chain ID)
3. Wallet extension blocked by browser

## Migration Guide

### From Supabase Auth

If migrating from Supabase's built-in auth:

```sql
-- Migrate existing Supabase auth providers
INSERT INTO auth_provider (id, tenant_id, provider_key, provider_name, provider_type, enabled)
SELECT
  gen_random_uuid()::text,
  'your-tenant-id',
  provider,
  initcap(provider),
  CASE
    WHEN provider IN ('email') THEN 'email'
    WHEN provider IN ('google', 'github', 'facebook') THEN 'oauth'
    WHEN provider IN ('azure') THEN 'saml'
    ELSE 'oauth'
  END,
  enabled
FROM auth.providers;
```

### From Auth0

Export Auth0 connections and map to WisdomOS providers:

```javascript
// auth0-migration.js
const auth0Connections = [
  { name: 'google-oauth2', clientId: '...' },
  { name: 'github', clientId: '...' }
]

auth0Connections.forEach(async (conn) => {
  await fetch('/api/admin/auth-providers', {
    method: 'POST',
    body: JSON.stringify({
      providerKey: conn.name.replace('-oauth2', ''),
      providerName: capitalize(conn.name),
      providerType: 'oauth',
      enabled: true,
      clientId: conn.clientId
    })
  })
})
```

## Roadmap

### Planned Features

- [ ] **Multi-factor Authentication (MFA)**: Add 2FA support for all providers
- [ ] **Passwordless Magic Links**: Email-based passwordless login
- [ ] **Biometric Auth**: WebAuthn/FIDO2 support
- [ ] **Custom OAuth Providers**: Allow admins to add arbitrary OAuth providers
- [ ] **Provider Analytics**: Track login success rates per provider
- [ ] **A/B Testing**: Test different provider configurations
- [ ] **Auto-Discovery**: OIDC discovery for automatic configuration

## References

- [OAuth 2.0 RFC](https://datatracker.ietf.org/doc/html/rfc6749)
- [SAML 2.0 Specification](https://docs.oasis-open.org/security/saml/Post2.0/sstc-saml-tech-overview-2.0.html)
- [OpenID Connect](https://openid.net/connect/)
- [Web3 Sign-In with Ethereum](https://eips.ethereum.org/EIPS/eip-4361)

## Support

For issues or questions:
- GitHub Issues: [wisdomos/issues](https://github.com/wisdomos/issues)
- Documentation: [docs.wisdomos.com/auth](https://docs.wisdomos.com/auth)
- Community: [discord.gg/wisdomos](https://discord.gg/wisdomos)

---

**Last Updated**: October 29, 2025
**Version**: 1.0.0
**Maintained by**: AXAI Innovations
