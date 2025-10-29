-- =====================================================
-- Fulfillment Display v5 — Backend Completion
-- =====================================================
-- Purpose: Complete backend schema with Work/Finance,
-- Dashboards, Interpretations, Attachments, Audit, etc.
-- Version: 5.0
-- Date: 2025-10-29
-- =====================================================

-- =====================================================
-- 1. WORK & FINANCE INTEGRATION
-- =====================================================

CREATE TABLE IF NOT EXISTS fd_work_finance_integration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  framework_version TEXT DEFAULT 'v5',
  stripe_account_id TEXT,
  quickbooks_realm_id TEXT,
  config_json JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_fd_wfi_profile ON fd_work_finance_integration(profile_id);

CREATE TABLE IF NOT EXISTS fd_wfi_period (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wfi_id UUID NOT NULL REFERENCES fd_work_finance_integration(id) ON DELETE CASCADE,
  period_type TEXT CHECK (period_type IN ('monthly','quarterly','annual')) DEFAULT 'monthly',
  period_key TEXT NOT NULL, -- 'YYYY-MM', 'YYYY-Q1', 'YYYY'
  revenue DECIMAL(12,2) DEFAULT 0,
  expenses DECIMAL(12,2) DEFAULT 0,
  net_income DECIMAL(12,2) DEFAULT 0,
  hours_worked DECIMAL(8,2) DEFAULT 0,
  projects_completed INTEGER DEFAULT 0,
  invoices_sent INTEGER DEFAULT 0,
  invoices_paid INTEGER DEFAULT 0,
  cash_balance DECIMAL(12,2) DEFAULT 0,
  metadata_json JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(wfi_id, period_key)
);

CREATE INDEX idx_fd_wfi_period_wfi ON fd_wfi_period(wfi_id);
CREATE INDEX idx_fd_wfi_period_key ON fd_wfi_period(period_key);

-- RLS for work/finance tables
ALTER TABLE fd_work_finance_integration ENABLE ROW LEVEL SECURITY;
ALTER TABLE fd_wfi_period ENABLE ROW LEVEL SECURITY;

CREATE POLICY fd_wfi_user_policy ON fd_work_finance_integration
  FOR ALL USING (profile_id IN (SELECT id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY fd_wfi_period_user_policy ON fd_wfi_period
  FOR ALL USING (wfi_id IN (
    SELECT id FROM fd_work_finance_integration
    WHERE profile_id IN (SELECT id FROM public.profiles WHERE id = auth.uid())
  ));

-- =====================================================
-- 2. HOLISTIC STABILITY DASHBOARDS
-- =====================================================

CREATE TYPE fd_dashboard_type AS ENUM ('personal', 'team', 'shared');

CREATE TABLE IF NOT EXISTS fd_dashboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  dashboard_type fd_dashboard_type NOT NULL DEFAULT 'personal',
  layout_json JSONB DEFAULT '{}', -- Widget positions, config
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_fd_dashboard_profile ON fd_dashboard(profile_id);
CREATE INDEX idx_fd_dashboard_type ON fd_dashboard(dashboard_type);

CREATE TABLE IF NOT EXISTS fd_dashboard_snapshot (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id UUID NOT NULL REFERENCES fd_dashboard(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  gfs INTEGER NOT NULL, -- Global Fulfillment Score
  data_json JSONB NOT NULL, -- Full snapshot data
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_fd_dashboard_snapshot_dashboard ON fd_dashboard_snapshot(dashboard_id);
CREATE INDEX idx_fd_dashboard_snapshot_date ON fd_dashboard_snapshot(snapshot_date DESC);

-- RLS for dashboard tables
ALTER TABLE fd_dashboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE fd_dashboard_snapshot ENABLE ROW LEVEL SECURITY;

CREATE POLICY fd_dashboard_user_policy ON fd_dashboard
  FOR ALL USING (profile_id = auth.uid());

CREATE POLICY fd_dashboard_snapshot_user_policy ON fd_dashboard_snapshot
  FOR ALL USING (dashboard_id IN (
    SELECT id FROM fd_dashboard WHERE profile_id = auth.uid()
  ));

-- =====================================================
-- 3. INTERPRETATION KEYS (AI Analysis)
-- =====================================================

CREATE TYPE fd_interpretation_type AS ENUM (
  'pattern',
  'insight',
  'warning',
  'celebration',
  'suggestion'
);

CREATE TABLE IF NOT EXISTS fd_interpretation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  interpretation_type fd_interpretation_type NOT NULL,
  title TEXT NOT NULL,
  content_md TEXT NOT NULL,
  confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
  related_area_id UUID REFERENCES fd_area(id) ON DELETE SET NULL,
  related_dimension_id UUID REFERENCES fd_dimension(id) ON DELETE SET NULL,
  related_entry_id UUID REFERENCES fd_entry(id) ON DELETE SET NULL,
  source TEXT DEFAULT 'ai', -- 'ai', 'manual', 'system'
  is_acknowledged BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMPTZ,
  valid_from DATE DEFAULT CURRENT_DATE,
  valid_to DATE,
  metadata_json JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_fd_interpretation_profile ON fd_interpretation(profile_id);
CREATE INDEX idx_fd_interpretation_type ON fd_interpretation(interpretation_type);
CREATE INDEX idx_fd_interpretation_area ON fd_interpretation(related_area_id);
CREATE INDEX idx_fd_interpretation_unack ON fd_interpretation(profile_id)
  WHERE is_acknowledged = false;

-- RLS for interpretations
ALTER TABLE fd_interpretation ENABLE ROW LEVEL SECURITY;

CREATE POLICY fd_interpretation_user_policy ON fd_interpretation
  FOR ALL USING (profile_id = auth.uid());

-- =====================================================
-- 4. ATTACHMENTS (Polymorphic)
-- =====================================================

CREATE TYPE fd_attachment_entity AS ENUM (
  'entry',
  'action',
  'integrity_event',
  'forgiveness_log',
  'reconciliation_log',
  'relationship_event',
  'goal',
  'chapter',
  'ritual'
);

CREATE TABLE IF NOT EXISTS fd_attachment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  entity_type fd_attachment_entity NOT NULL,
  entity_id UUID NOT NULL,
  storage_path TEXT NOT NULL, -- Supabase Storage path
  file_name TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  metadata_json JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_fd_attachment_profile ON fd_attachment(profile_id);
CREATE INDEX idx_fd_attachment_entity ON fd_attachment(entity_type, entity_id);

-- RLS for attachments
ALTER TABLE fd_attachment ENABLE ROW LEVEL SECURITY;

CREATE POLICY fd_attachment_user_policy ON fd_attachment
  FOR ALL USING (profile_id = auth.uid());

-- =====================================================
-- 5. NOTIFICATIONS
-- =====================================================

CREATE TYPE fd_notification_type AS ENUM (
  'integrity_breach',
  'goal_deadline',
  'interpretation_new',
  'review_due',
  'ritual_reminder',
  'system'
);

CREATE TYPE fd_notification_status AS ENUM ('pending', 'sent', 'read', 'dismissed');

CREATE TABLE IF NOT EXISTS fd_notification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  notification_type fd_notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  status fd_notification_status NOT NULL DEFAULT 'pending',
  priority INTEGER DEFAULT 0, -- Higher = more urgent
  action_url TEXT,
  metadata_json JSONB DEFAULT '{}',
  sent_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_fd_notification_profile ON fd_notification(profile_id);
CREATE INDEX idx_fd_notification_status ON fd_notification(status);
CREATE INDEX idx_fd_notification_unread ON fd_notification(profile_id)
  WHERE status = 'sent';

-- RLS for notifications
ALTER TABLE fd_notification ENABLE ROW LEVEL SECURITY;

CREATE POLICY fd_notification_user_policy ON fd_notification
  FOR ALL USING (profile_id = auth.uid());

-- =====================================================
-- 6. WEBHOOKS (Outbound event subscriptions)
-- =====================================================

CREATE TYPE fd_webhook_event AS ENUM (
  'entry.created',
  'entry.updated',
  'action.completed',
  'goal.achieved',
  'review.generated',
  'integrity.breach',
  'score.threshold'
);

CREATE TABLE IF NOT EXISTS fd_webhook (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  events fd_webhook_event[] NOT NULL,
  secret TEXT NOT NULL, -- HMAC signing secret
  is_active BOOLEAN DEFAULT true,
  last_success_at TIMESTAMPTZ,
  last_failure_at TIMESTAMPTZ,
  failure_count INTEGER DEFAULT 0,
  metadata_json JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_fd_webhook_profile ON fd_webhook(profile_id);
CREATE INDEX idx_fd_webhook_active ON fd_webhook(is_active);

-- RLS for webhooks
ALTER TABLE fd_webhook ENABLE ROW LEVEL SECURITY;

CREATE POLICY fd_webhook_user_policy ON fd_webhook
  FOR ALL USING (profile_id = auth.uid());

-- =====================================================
-- 7. API KEYS (For external integrations)
-- =====================================================

CREATE TABLE IF NOT EXISTS fd_api_key (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  key_hash TEXT NOT NULL UNIQUE, -- bcrypt hash of actual key
  key_prefix TEXT NOT NULL, -- First 8 chars for identification
  name TEXT NOT NULL,
  scopes TEXT[] DEFAULT ARRAY['read'], -- read, write, delete
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_fd_api_key_profile ON fd_api_key(profile_id);
CREATE INDEX idx_fd_api_key_hash ON fd_api_key(key_hash);
CREATE INDEX idx_fd_api_key_active ON fd_api_key(is_active);

-- RLS for API keys
ALTER TABLE fd_api_key ENABLE ROW LEVEL SECURITY;

CREATE POLICY fd_api_key_user_policy ON fd_api_key
  FOR ALL USING (profile_id = auth.uid());

-- =====================================================
-- 8. AUDIT LOG (Comprehensive activity tracking)
-- =====================================================

CREATE TYPE fd_audit_action AS ENUM (
  'create',
  'update',
  'delete',
  'login',
  'logout',
  'export',
  'share',
  'api_call'
);

CREATE TABLE IF NOT EXISTS fd_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action fd_audit_action NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  changes_json JSONB, -- Before/after for updates
  ip_address INET,
  user_agent TEXT,
  api_key_id UUID REFERENCES fd_api_key(id) ON DELETE SET NULL,
  metadata_json JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_fd_audit_profile ON fd_audit_log(profile_id);
CREATE INDEX idx_fd_audit_action ON fd_audit_log(action);
CREATE INDEX idx_fd_audit_entity ON fd_audit_log(entity_type, entity_id);
CREATE INDEX idx_fd_audit_created ON fd_audit_log(created_at DESC);

-- RLS for audit log (users can only see their own)
ALTER TABLE fd_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY fd_audit_log_user_policy ON fd_audit_log
  FOR SELECT USING (profile_id = auth.uid());

-- =====================================================
-- 9. TRIGGER: Auto-create audit log entries
-- =====================================================

CREATE OR REPLACE FUNCTION fn_fd_audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO fd_audit_log (profile_id, action, entity_type, entity_id, changes_json)
    VALUES (
      COALESCE(NEW.profile_id, NEW.user_id),
      'create',
      TG_TABLE_NAME,
      NEW.id,
      to_jsonb(NEW)
    );
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO fd_audit_log (profile_id, action, entity_type, entity_id, changes_json)
    VALUES (
      COALESCE(NEW.profile_id, NEW.user_id),
      'update',
      TG_TABLE_NAME,
      NEW.id,
      jsonb_build_object('before', to_jsonb(OLD), 'after', to_jsonb(NEW))
    );
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO fd_audit_log (profile_id, action, entity_type, entity_id, changes_json)
    VALUES (
      COALESCE(OLD.profile_id, OLD.user_id),
      'delete',
      TG_TABLE_NAME,
      OLD.id,
      to_jsonb(OLD)
    );
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply audit trigger to key tables
CREATE TRIGGER audit_fd_entry AFTER INSERT OR UPDATE OR DELETE ON fd_entry
  FOR EACH ROW EXECUTE FUNCTION fn_fd_audit_trigger();

CREATE TRIGGER audit_fd_action AFTER INSERT OR UPDATE OR DELETE ON fd_action
  FOR EACH ROW EXECUTE FUNCTION fn_fd_audit_trigger();

CREATE TRIGGER audit_fd_score_raw AFTER INSERT OR UPDATE OR DELETE ON fd_score_raw
  FOR EACH ROW EXECUTE FUNCTION fn_fd_audit_trigger();

CREATE TRIGGER audit_fd_integrity_log AFTER INSERT OR UPDATE OR DELETE ON fd_integrity_log
  FOR EACH ROW EXECUTE FUNCTION fn_fd_audit_trigger();

-- =====================================================
-- 10. FUNCTIONS: Generate Notification
-- =====================================================

CREATE OR REPLACE FUNCTION fn_fd_create_notification(
  p_profile_id UUID,
  p_type fd_notification_type,
  p_title TEXT,
  p_message TEXT,
  p_action_url TEXT DEFAULT NULL,
  p_priority INTEGER DEFAULT 0
) RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO fd_notification (
    profile_id,
    notification_type,
    title,
    message,
    action_url,
    priority
  ) VALUES (
    p_profile_id,
    p_type,
    p_title,
    p_message,
    p_action_url,
    p_priority
  ) RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 11. FUNCTIONS: Generate Dashboard Snapshot
-- =====================================================

CREATE OR REPLACE FUNCTION fn_fd_snapshot_dashboard(
  p_dashboard_id UUID,
  p_snapshot_date DATE DEFAULT CURRENT_DATE
) RETURNS UUID AS $$
DECLARE
  v_profile_id UUID;
  v_gfs INTEGER;
  v_data JSONB;
  v_snapshot_id UUID;
BEGIN
  -- Get profile_id from dashboard
  SELECT profile_id INTO v_profile_id
  FROM fd_dashboard
  WHERE id = p_dashboard_id;

  -- Calculate GFS for current month
  SELECT COALESCE(gfs, 0) INTO v_gfs
  FROM fd_review_month
  WHERE profile_id = v_profile_id
    AND month = TO_CHAR(p_snapshot_date, 'YYYY-MM')
  ORDER BY created_at DESC
  LIMIT 1;

  -- Build snapshot data
  WITH area_scores AS (
    SELECT
      a.code,
      a.name,
      a.emoji,
      a.color,
      COALESCE(sr.score, 0) as score
    FROM fd_area a
    LEFT JOIN fd_score_rollup sr ON sr.area_id = a.id
      AND sr.profile_id = v_profile_id
      AND sr.period = TO_CHAR(p_snapshot_date, 'YYYY-MM')
    WHERE a.is_active = true
  )
  SELECT jsonb_build_object(
    'date', p_snapshot_date,
    'gfs', v_gfs,
    'areas', jsonb_agg(
      jsonb_build_object(
        'code', code,
        'name', name,
        'emoji', emoji,
        'color', color,
        'score', score
      )
    )
  ) INTO v_data
  FROM area_scores;

  -- Insert snapshot
  INSERT INTO fd_dashboard_snapshot (
    dashboard_id,
    snapshot_date,
    gfs,
    data_json
  ) VALUES (
    p_dashboard_id,
    p_snapshot_date,
    COALESCE(v_gfs, 0),
    v_data
  ) RETURNING id INTO v_snapshot_id;

  RETURN v_snapshot_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 12. TRIGGERS: Updated timestamps
-- =====================================================

CREATE TRIGGER set_fd_wfi_updated_at BEFORE UPDATE ON fd_work_finance_integration
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_fd_wfi_period_updated_at BEFORE UPDATE ON fd_wfi_period
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_fd_dashboard_updated_at BEFORE UPDATE ON fd_dashboard
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_fd_interpretation_updated_at BEFORE UPDATE ON fd_interpretation
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_fd_webhook_updated_at BEFORE UPDATE ON fd_webhook
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- =====================================================
-- 13. VIEWS: Useful aggregations
-- =====================================================

-- User summary view
CREATE OR REPLACE VIEW vw_fd_user_summary AS
SELECT
  p.id as profile_id,
  p.display_name,
  COUNT(DISTINCT e.id) as total_entries,
  COUNT(DISTINCT a.id) as total_actions,
  COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'completed') as completed_actions,
  COUNT(DISTINCT il.id) FILTER (WHERE il.resolved_at IS NULL) as open_integrity_issues,
  COUNT(DISTINCT g.id) as total_goals,
  COUNT(DISTINCT g.id) FILTER (WHERE g.status = 'done') as completed_goals,
  MAX(rm.gfs) as latest_gfs,
  MAX(rm.month) as latest_review_month
FROM public.profiles p
LEFT JOIN fd_entry e ON e.profile_id = p.id
LEFT JOIN fd_action a ON a.profile_id = p.id
LEFT JOIN fd_integrity_log il ON il.profile_id = p.id
LEFT JOIN public.goals g ON g.profile_id = p.id
LEFT JOIN fd_review_month rm ON rm.profile_id = p.id
GROUP BY p.id, p.display_name;

-- Area performance view (latest month)
CREATE OR REPLACE VIEW vw_fd_area_performance AS
SELECT
  sr.profile_id,
  a.code,
  a.name,
  a.emoji,
  a.color,
  sr.period,
  sr.score,
  sr.trend_7d,
  sr.trend_30d,
  sr.trend_90d
FROM fd_score_rollup sr
JOIN fd_area a ON a.id = sr.area_id
WHERE sr.period = TO_CHAR(CURRENT_DATE, 'YYYY-MM');

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

COMMENT ON TABLE fd_work_finance_integration IS 'Work and finance data integration config';
COMMENT ON TABLE fd_dashboard IS 'User-configurable dashboards';
COMMENT ON TABLE fd_interpretation IS 'AI-generated insights and patterns';
COMMENT ON TABLE fd_attachment IS 'Polymorphic file attachments';
COMMENT ON TABLE fd_notification IS 'User notifications and reminders';
COMMENT ON TABLE fd_webhook IS 'Outbound webhook subscriptions';
COMMENT ON TABLE fd_api_key IS 'API authentication keys';
COMMENT ON TABLE fd_audit_log IS 'Comprehensive activity audit trail';
