-- Auth Providers Configuration
-- Allows admin to enable/disable and configure authentication providers

-- Auth Provider table
CREATE TABLE IF NOT EXISTS auth_provider (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES "Tenant"(id) ON DELETE CASCADE,
  provider_key TEXT NOT NULL, -- email, phone, google, github, etc.
  provider_name TEXT NOT NULL,
  provider_type TEXT NOT NULL, -- oauth, saml, email, phone, web3
  enabled BOOLEAN DEFAULT FALSE,
  icon_url TEXT,
  display_order INTEGER DEFAULT 0,

  -- OAuth/OIDC Configuration
  client_id TEXT,
  client_secret TEXT, -- Encrypted in production
  authorization_url TEXT,
  token_url TEXT,
  user_info_url TEXT,
  redirect_uri TEXT,
  scopes TEXT[], -- Array of scopes like ['email', 'profile']

  -- SAML Configuration
  saml_entity_id TEXT,
  saml_sso_url TEXT,
  saml_certificate TEXT,
  saml_issuer TEXT,

  -- Web3 Configuration
  web3_chain_id INTEGER,
  web3_contract_address TEXT,

  -- Email/Phone Configuration
  email_templates JSONB, -- Custom templates for email verification
  phone_provider TEXT, -- twilio, vonage, etc.

  -- Additional metadata
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(tenant_id, provider_key)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_auth_provider_tenant ON auth_provider(tenant_id);
CREATE INDEX IF NOT EXISTS idx_auth_provider_enabled ON auth_provider(tenant_id, enabled) WHERE enabled = TRUE;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_auth_provider_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS auth_provider_updated_at ON auth_provider;
CREATE TRIGGER auth_provider_updated_at
  BEFORE UPDATE ON auth_provider
  FOR EACH ROW
  EXECUTE FUNCTION update_auth_provider_updated_at();

-- Seed default providers (disabled by default)
-- This creates a template that admins can enable and configure

INSERT INTO auth_provider (id, tenant_id, provider_key, provider_name, provider_type, enabled, display_order)
SELECT
  gen_random_uuid()::text,
  t.id,
  'email',
  'Email',
  'email',
  TRUE, -- Email enabled by default
  1
FROM "Tenant" t
WHERE NOT EXISTS (
  SELECT 1 FROM auth_provider ap
  WHERE ap.tenant_id = t.id AND ap.provider_key = 'email'
)
ON CONFLICT (tenant_id, provider_key) DO NOTHING;

-- Function to seed all default providers for a tenant
CREATE OR REPLACE FUNCTION seed_auth_providers(p_tenant_id TEXT)
RETURNS void AS $$
DECLARE
  providers TEXT[][] := ARRAY[
    ['email', 'Email', 'email', '1'],
    ['phone', 'Phone', 'phone', '2'],
    ['saml', 'SAML 2.0', 'saml', '3'],
    ['web3', 'Web3 Wallet', 'web3', '4'],
    ['apple', 'Apple', 'oauth', '5'],
    ['azure', 'Azure', 'oauth', '6'],
    ['bitbucket', 'Bitbucket', 'oauth', '7'],
    ['discord', 'Discord', 'oauth', '8'],
    ['facebook', 'Facebook', 'oauth', '9'],
    ['figma', 'Figma', 'oauth', '10'],
    ['github', 'GitHub', 'oauth', '11'],
    ['gitlab', 'GitLab', 'oauth', '12'],
    ['google', 'Google', 'oauth', '13'],
    ['kakao', 'Kakao', 'oauth', '14'],
    ['keycloak', 'KeyCloak', 'oauth', '15'],
    ['linkedin_oidc', 'LinkedIn (OIDC)', 'oauth', '16'],
    ['notion', 'Notion', 'oauth', '17'],
    ['twitch', 'Twitch', 'oauth', '18'],
    ['twitter', 'Twitter', 'oauth', '19'],
    ['slack_oidc', 'Slack (OIDC)', 'oauth', '20'],
    ['slack', 'Slack (Deprecated)', 'oauth', '21'],
    ['spotify', 'Spotify', 'oauth', '22'],
    ['workos', 'WorkOS', 'oauth', '23'],
    ['zoom', 'Zoom', 'oauth', '24']
  ];
  provider TEXT[];
BEGIN
  FOREACH provider SLICE 1 IN ARRAY providers
  LOOP
    INSERT INTO auth_provider (
      id,
      tenant_id,
      provider_key,
      provider_name,
      provider_type,
      enabled,
      display_order
    )
    VALUES (
      gen_random_uuid()::text,
      p_tenant_id,
      provider[1],
      provider[2],
      provider[3],
      CASE WHEN provider[1] = 'email' THEN TRUE ELSE FALSE END,
      provider[4]::INTEGER
    )
    ON CONFLICT (tenant_id, provider_key) DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Seed providers for all existing tenants
DO $$
DECLARE
  tenant_record RECORD;
BEGIN
  FOR tenant_record IN SELECT id FROM "Tenant"
  LOOP
    PERFORM seed_auth_providers(tenant_record.id);
  END LOOP;
END $$;

-- Add comment for documentation
COMMENT ON TABLE auth_provider IS 'Stores authentication provider configurations for multi-tenant SSO and OAuth integrations';
COMMENT ON COLUMN auth_provider.client_secret IS 'Should be encrypted at rest in production using pgcrypto or application-level encryption';
