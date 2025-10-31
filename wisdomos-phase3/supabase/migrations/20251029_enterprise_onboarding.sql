-- ═══════════════════════════════════════════════════════════════════════
-- PHOENIX RISING WISDOMOS - ENTERPRISE ONBOARDING SYSTEM
-- ═══════════════════════════════════════════════════════════════════════
--
-- This migration creates a production-ready onboarding system that:
-- ✅ Auto-assigns users to organizations based on email domain
-- ✅ Supports both individual and enterprise customers
-- ✅ Provides audit trail for compliance
-- ✅ Enables SSO and team management
--
-- ═══════════════════════════════════════════════════════════════════════

-- ─────────── ORGANIZATIONS TABLE ───────────
-- Represents companies, teams, or individual workspaces
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT UNIQUE NOT NULL,  -- e.g., landmark.com, johndoe.com
  slug TEXT UNIQUE NOT NULL,     -- URL-friendly identifier
  plan TEXT NOT NULL DEFAULT 'individual' CHECK (plan IN ('individual', 'team', 'enterprise', 'custom')),

  -- Enterprise features
  sso_enabled BOOLEAN DEFAULT FALSE,
  sso_provider TEXT,             -- 'saml', 'okta', 'azure', etc.
  sso_metadata JSONB,            -- Provider-specific config

  -- Billing & limits
  max_users INTEGER,             -- NULL = unlimited
  max_storage_gb INTEGER,
  billing_email TEXT,

  -- Customization
  logo_url TEXT,
  primary_color TEXT DEFAULT '#FF6B35', -- Phoenix orange
  custom_domain TEXT,            -- e.g., wisdom.landmark.com

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'trial', 'churned')),
  trial_ends_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_organizations_domain ON public.organizations(domain);
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON public.organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_status ON public.organizations(status);

-- ─────────── USER ROLES / MEMBERSHIP ───────────
-- Links users to organizations with specific roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id UUID NOT NULL,         -- References auth.users(id) but no FK to avoid circular deps
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer', 'guest')),

  -- Permissions
  can_invite BOOLEAN DEFAULT FALSE,
  can_manage_billing BOOLEAN DEFAULT FALSE,
  can_manage_integrations BOOLEAN DEFAULT FALSE,

  -- Department/Team (optional)
  department TEXT,
  title TEXT,

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'invited', 'suspended', 'removed')),
  invited_by UUID,               -- References auth.users(id)
  invited_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  PRIMARY KEY (user_id, organization_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_organization ON public.user_roles(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_status ON public.user_roles(status);

-- ─────────── ONBOARDING EVENTS (AUDIT TRAIL) ───────────
-- Tracks all onboarding-related events for compliance and analytics
CREATE TABLE IF NOT EXISTS public.onboarding_events (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID,                  -- References auth.users(id)
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- Event details
  event TEXT NOT NULL,           -- 'signup', 'org_created', 'invited', 'sso_configured', etc.
  source TEXT,                   -- 'trigger', 'webhook', 'admin', 'api'

  -- Context
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_onboarding_events_user ON public.onboarding_events(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_events_org ON public.onboarding_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_events_created ON public.onboarding_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_onboarding_events_event ON public.onboarding_events(event);

-- ─────────── INVITATION SYSTEM ───────────
-- Manages pending team invitations
CREATE TABLE IF NOT EXISTS public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer', 'guest')),

  -- Invitation details
  invited_by UUID NOT NULL,      -- References auth.users(id)
  token TEXT UNIQUE NOT NULL,    -- Secure token for acceptance
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  accepted_at TIMESTAMPTZ,
  accepted_by UUID,              -- References auth.users(id) if they had existing account

  -- Metadata
  message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(organization_id, email)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_invitations_organization ON public.invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON public.invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON public.invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON public.invitations(status);

-- ═══════════════════════════════════════════════════════════════════════
-- FUNCTIONS & TRIGGERS
-- ═══════════════════════════════════════════════════════════════════════

-- ─────────── AUTO-ASSIGNMENT FUNCTION ───────────
-- Automatically assigns new users to organizations based on email domain
CREATE OR REPLACE FUNCTION public.handle_after_signup()
RETURNS TRIGGER AS $$
DECLARE
  org_id UUID;
  email_domain TEXT;
  username TEXT;
  org_slug TEXT;
  pending_invitation RECORD;
BEGIN
  -- Extract domain from email
  email_domain := split_part(NEW.email, '@', 2);
  username := split_part(NEW.email, '@', 1);

  -- Check for pending invitation first (highest priority)
  SELECT * INTO pending_invitation
  FROM public.invitations
  WHERE email = NEW.email
    AND status = 'pending'
    AND expires_at > NOW()
  LIMIT 1;

  IF pending_invitation IS NOT NULL THEN
    -- Accept invitation automatically
    UPDATE public.invitations
    SET status = 'accepted',
        accepted_at = NOW(),
        accepted_by = NEW.id
    WHERE id = pending_invitation.id;

    INSERT INTO public.user_roles (user_id, organization_id, role, invited_by, invited_at)
    VALUES (NEW.id, pending_invitation.organization_id, pending_invitation.role, pending_invitation.invited_by, pending_invitation.created_at);

    INSERT INTO public.onboarding_events (user_id, organization_id, event, source, metadata)
    VALUES (NEW.id, pending_invitation.organization_id, 'invitation_accepted', 'trigger',
            jsonb_build_object('invitation_id', pending_invitation.id));

    RETURN NEW;
  END IF;

  -- Check if domain matches an existing organization
  SELECT id INTO org_id
  FROM public.organizations
  WHERE lower(domain) = lower(email_domain)
    AND status = 'active';

  IF org_id IS NOT NULL THEN
    -- Organization exists → attach user as member
    INSERT INTO public.user_roles (user_id, organization_id, role)
    VALUES (NEW.id, org_id, 'member');

    INSERT INTO public.onboarding_events (user_id, organization_id, event, source)
    VALUES (NEW.id, org_id, 'auto_assigned_member', 'trigger');

  ELSE
    -- No org found → create individual workspace
    -- Generate unique slug
    org_slug := lower(regexp_replace(username, '[^a-zA-Z0-9]', '-', 'g'));
    org_slug := org_slug || '-' || substr(md5(random()::text), 1, 6);

    INSERT INTO public.organizations (name, domain, slug, plan, status)
    VALUES (
      COALESCE(NEW.raw_user_meta_data->>'name', username) || '''s Workspace',
      email_domain,
      org_slug,
      'individual',
      'active'
    )
    RETURNING id INTO org_id;

    -- Make user the owner
    INSERT INTO public.user_roles (user_id, organization_id, role, can_invite, can_manage_billing, can_manage_integrations)
    VALUES (NEW.id, org_id, 'owner', TRUE, TRUE, TRUE);

    INSERT INTO public.onboarding_events (user_id, organization_id, event, source)
    VALUES (NEW.id, org_id, 'org_created_individual', 'trigger');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────── TRIGGER ON AUTH.USERS ───────────
-- Note: This assumes you're using Supabase auth
-- If using custom auth, adjust accordingly
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_after_signup();
  END IF;
END $$;

-- ─────────── UPDATE TIMESTAMP TRIGGER ───────────
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS organizations_updated_at ON public.organizations;
CREATE TRIGGER organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ═══════════════════════════════════════════════════════════════════════
-- HELPER VIEWS
-- ═══════════════════════════════════════════════════════════════════════

-- View: Organization members with user details
CREATE OR REPLACE VIEW public.v_organization_members AS
SELECT
  ur.organization_id,
  ur.user_id,
  ur.role,
  ur.status,
  ur.department,
  ur.title,
  ur.joined_at,
  ur.last_active_at,
  o.name as organization_name,
  o.plan as organization_plan
FROM public.user_roles ur
JOIN public.organizations o ON ur.organization_id = o.id
WHERE ur.status = 'active';

-- View: Organization stats
CREATE OR REPLACE VIEW public.v_organization_stats AS
SELECT
  o.id,
  o.name,
  o.plan,
  o.status,
  COUNT(DISTINCT ur.user_id) FILTER (WHERE ur.status = 'active') as active_users,
  COUNT(DISTINCT i.id) FILTER (WHERE i.status = 'pending') as pending_invitations,
  o.max_users,
  o.created_at
FROM public.organizations o
LEFT JOIN public.user_roles ur ON o.id = ur.organization_id
LEFT JOIN public.invitations i ON o.id = i.organization_id
GROUP BY o.id;

-- ═══════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════════════

-- Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Organizations: Users can only see their own orgs
CREATE POLICY "Users can view their organizations"
  ON public.organizations FOR SELECT
  USING (
    id IN (
      SELECT organization_id FROM public.user_roles
      WHERE user_id = auth.uid()
    )
  );

-- Organizations: Only owners/admins can update
CREATE POLICY "Owners and admins can update organizations"
  ON public.organizations FOR UPDATE
  USING (
    id IN (
      SELECT organization_id FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );

-- User roles: Users can view members of their orgs
CREATE POLICY "Users can view org members"
  ON public.user_roles FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.user_roles
      WHERE user_id = auth.uid()
    )
  );

-- Invitations: Members can view invitations for their org
CREATE POLICY "Members can view org invitations"
  ON public.invitations FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.user_roles
      WHERE user_id = auth.uid()
    )
  );

-- Invitations: Admins can create invitations
CREATE POLICY "Admins can create invitations"
  ON public.invitations FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin')
        AND can_invite = TRUE
    )
  );

-- ═══════════════════════════════════════════════════════════════════════
-- SEED DATA (OPTIONAL)
-- ═══════════════════════════════════════════════════════════════════════

-- Example: Pre-create enterprise organizations
-- Uncomment and customize as needed

-- INSERT INTO public.organizations (name, domain, slug, plan, sso_enabled, max_users)
-- VALUES
--   ('Landmark Worldwide', 'landmark.com', 'landmark', 'enterprise', TRUE, NULL),
--   ('Axai Innovations', 'axai.com', 'axai', 'enterprise', FALSE, 100)
-- ON CONFLICT (domain) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════
-- COMMENTS FOR DOCUMENTATION
-- ═══════════════════════════════════════════════════════════════════════

COMMENT ON TABLE public.organizations IS 'Organizations (companies, teams, or individual workspaces)';
COMMENT ON TABLE public.user_roles IS 'User membership and roles within organizations';
COMMENT ON TABLE public.onboarding_events IS 'Audit trail for all onboarding and org-related events';
COMMENT ON TABLE public.invitations IS 'Pending team invitations with secure tokens';

COMMENT ON FUNCTION public.handle_after_signup() IS 'Automatically assigns new users to organizations based on email domain or pending invitations';
