-- Enable Row Level Security on all tenant-scoped tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE life_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE resets ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_audit_logs ENABLE ROW LEVEL SECURITY;

-- Create a function to get the current tenant ID from JWT
CREATE OR REPLACE FUNCTION auth.tenant_id()
RETURNS TEXT AS $$
BEGIN
  RETURN current_setting('app.current_tenant_id', true)::TEXT;
END;
$$ LANGUAGE plpgsql STABLE;

-- Create a function to get the current user ID from JWT
CREATE OR REPLACE FUNCTION auth.user_id()
RETURNS TEXT AS $$
BEGIN
  RETURN auth.uid()::TEXT;
END;
$$ LANGUAGE plpgsql STABLE;

-- Create a function to check if user belongs to tenant
CREATE OR REPLACE FUNCTION auth.user_belongs_to_tenant(tenant_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.user_id()
    AND "tenantId" = tenant_id
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- ==================== TENANT TABLE POLICIES ====================

-- Tenants can only be viewed by their members
CREATE POLICY "Tenants are viewable by members"
  ON tenants FOR SELECT
  USING (
    auth.user_belongs_to_tenant(id)
  );

-- Only tenant owners can update tenant settings
CREATE POLICY "Tenants are updatable by owners"
  ON tenants FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.user_id()
      AND "tenantId" = tenants.id
      AND "isOwner" = true
    )
  );

-- ==================== USER TABLE POLICIES ====================

-- Users can only see other users in their tenant
CREATE POLICY "Users are viewable by tenant members"
  ON users FOR SELECT
  USING (
    "tenantId" = auth.tenant_id()
  );

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (
    id = auth.user_id()
  );

-- Admins and owners can update other users in their tenant
CREATE POLICY "Admins can update tenant users"
  ON users FOR UPDATE
  USING (
    "tenantId" = auth.tenant_id()
    AND EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.user_id()
      AND "tenantId" = users."tenantId"
      AND role IN ('ADMIN', 'OWNER')
    )
  );

-- Users can only be created by admins/owners in the tenant
CREATE POLICY "Users can be created by admins"
  ON users FOR INSERT
  WITH CHECK (
    "tenantId" = auth.tenant_id()
    AND EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.user_id()
      AND "tenantId" = auth.tenant_id()
      AND role IN ('ADMIN', 'OWNER')
    )
  );

-- ==================== LIFE AREA TABLE POLICIES ====================

-- Life areas are only viewable by the owner user
CREATE POLICY "Life areas are viewable by owner"
  ON life_areas FOR SELECT
  USING (
    "tenantId" = auth.tenant_id()
    AND "userId" = auth.user_id()
  );

-- Life areas can only be created by the authenticated user for themselves
CREATE POLICY "Life areas can be created by user"
  ON life_areas FOR INSERT
  WITH CHECK (
    "tenantId" = auth.tenant_id()
    AND "userId" = auth.user_id()
  );

-- Life areas can only be updated by the owner
CREATE POLICY "Life areas can be updated by owner"
  ON life_areas FOR UPDATE
  USING (
    "tenantId" = auth.tenant_id()
    AND "userId" = auth.user_id()
  );

-- Life areas can only be deleted by the owner
CREATE POLICY "Life areas can be deleted by owner"
  ON life_areas FOR DELETE
  USING (
    "tenantId" = auth.tenant_id()
    AND "userId" = auth.user_id()
  );

-- ==================== JOURNAL TABLE POLICIES ====================

-- Journals are only viewable by the owner user
CREATE POLICY "Journals are viewable by owner"
  ON journals FOR SELECT
  USING (
    "tenantId" = auth.tenant_id()
    AND "userId" = auth.user_id()
  );

-- Journals can only be created by the authenticated user
CREATE POLICY "Journals can be created by user"
  ON journals FOR INSERT
  WITH CHECK (
    "tenantId" = auth.tenant_id()
    AND "userId" = auth.user_id()
  );

-- Journals can only be updated by the owner
CREATE POLICY "Journals can be updated by owner"
  ON journals FOR UPDATE
  USING (
    "tenantId" = auth.tenant_id()
    AND "userId" = auth.user_id()
  );

-- Journals can only be deleted by the owner
CREATE POLICY "Journals can be deleted by owner"
  ON journals FOR DELETE
  USING (
    "tenantId" = auth.tenant_id()
    AND "userId" = auth.user_id()
  );

-- ==================== EVENT TABLE POLICIES ====================

-- Events are only viewable by the life area owner
CREATE POLICY "Events are viewable by life area owner"
  ON events FOR SELECT
  USING (
    "tenantId" = auth.tenant_id()
    AND EXISTS (
      SELECT 1 FROM life_areas
      WHERE id = events."lifeAreaId"
      AND "userId" = auth.user_id()
    )
  );

-- Events can be created by the life area owner
CREATE POLICY "Events can be created by life area owner"
  ON events FOR INSERT
  WITH CHECK (
    "tenantId" = auth.tenant_id()
    AND EXISTS (
      SELECT 1 FROM life_areas
      WHERE id = events."lifeAreaId"
      AND "userId" = auth.user_id()
    )
  );

-- ==================== RELATIONSHIP TABLE POLICIES ====================

-- Relationships are only viewable by the owner user
CREATE POLICY "Relationships are viewable by owner"
  ON relationships FOR SELECT
  USING (
    "tenantId" = auth.tenant_id()
    AND "userId" = auth.user_id()
  );

-- Relationships can be created by the user
CREATE POLICY "Relationships can be created by user"
  ON relationships FOR INSERT
  WITH CHECK (
    "tenantId" = auth.tenant_id()
    AND "userId" = auth.user_id()
  );

-- Relationships can be updated by the owner
CREATE POLICY "Relationships can be updated by owner"
  ON relationships FOR UPDATE
  USING (
    "tenantId" = auth.tenant_id()
    AND "userId" = auth.user_id()
  );

-- Relationships can be deleted by the owner
CREATE POLICY "Relationships can be deleted by owner"
  ON relationships FOR DELETE
  USING (
    "tenantId" = auth.tenant_id()
    AND "userId" = auth.user_id()
  );

-- ==================== RESET TABLE POLICIES ====================

-- Resets are only viewable by the owner user
CREATE POLICY "Resets are viewable by owner"
  ON resets FOR SELECT
  USING (
    "tenantId" = auth.tenant_id()
    AND "userId" = auth.user_id()
  );

-- Resets can be created by the user
CREATE POLICY "Resets can be created by user"
  ON resets FOR INSERT
  WITH CHECK (
    "tenantId" = auth.tenant_id()
    AND "userId" = auth.user_id()
  );

-- Resets can be updated by the owner
CREATE POLICY "Resets can be updated by owner"
  ON resets FOR UPDATE
  USING (
    "tenantId" = auth.tenant_id()
    AND "userId" = auth.user_id()
  );

-- ==================== BADGE TABLE POLICIES ====================

-- Badges are only viewable by the owner user
CREATE POLICY "Badges are viewable by owner"
  ON badges FOR SELECT
  USING (
    "tenantId" = auth.tenant_id()
    AND "userId" = auth.user_id()
  );

-- Badges are system-generated, no direct insert allowed
-- They should be created through application logic

-- ==================== VAULT TABLE POLICIES ====================

-- Private vault items are only viewable by the owner
CREATE POLICY "Private vault items are viewable by owner"
  ON vault_items FOR SELECT
  USING (
    "tenantId" = auth.tenant_id()
    AND (
      "userId" = auth.user_id()
      OR "accessLevel" IN ('SHARED', 'PUBLIC')
    )
  );

-- Vault items can be created by the user
CREATE POLICY "Vault items can be created by user"
  ON vault_items FOR INSERT
  WITH CHECK (
    "tenantId" = auth.tenant_id()
    AND "userId" = auth.user_id()
  );

-- Vault items can be updated by the owner
CREATE POLICY "Vault items can be updated by owner"
  ON vault_items FOR UPDATE
  USING (
    "tenantId" = auth.tenant_id()
    AND "userId" = auth.user_id()
  );

-- Vault items can be deleted by the owner
CREATE POLICY "Vault items can be deleted by owner"
  ON vault_items FOR DELETE
  USING (
    "tenantId" = auth.tenant_id()
    AND "userId" = auth.user_id()
  );

-- ==================== AUDIT TABLE POLICIES ====================

-- Audits are only viewable by the owner user
CREATE POLICY "Audits are viewable by owner"
  ON audits FOR SELECT
  USING (
    "tenantId" = auth.tenant_id()
    AND "userId" = auth.user_id()
  );

-- Audits can be created by the user
CREATE POLICY "Audits can be created by user"
  ON audits FOR INSERT
  WITH CHECK (
    "tenantId" = auth.tenant_id()
    AND "userId" = auth.user_id()
  );

-- ==================== TENANT AUDIT LOG POLICIES ====================

-- Tenant audit logs are viewable by admins and owners
CREATE POLICY "Tenant audit logs are viewable by admins"
  ON tenant_audit_logs FOR SELECT
  USING (
    "tenantId" = auth.tenant_id()
    AND EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.user_id()
      AND "tenantId" = tenant_audit_logs."tenantId"
      AND role IN ('ADMIN', 'OWNER')
    )
  );

-- Audit logs are system-generated, no direct modifications allowed

-- ==================== HELPER FUNCTIONS ====================

-- Function to check if a user is a tenant admin
CREATE OR REPLACE FUNCTION auth.is_tenant_admin(tenant_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.user_id()
    AND "tenantId" = tenant_id
    AND role IN ('ADMIN', 'OWNER')
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to check if a user is the tenant owner
CREATE OR REPLACE FUNCTION auth.is_tenant_owner(tenant_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.user_id()
    AND "tenantId" = tenant_id
    AND "isOwner" = true
  );
END;
$$ LANGUAGE plpgsql STABLE;