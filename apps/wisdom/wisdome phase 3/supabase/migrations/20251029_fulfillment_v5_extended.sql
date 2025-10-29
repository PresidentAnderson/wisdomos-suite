-- =====================================================
-- Fulfillment Display v5 — Extended Schema
-- =====================================================
-- Purpose: Complete remaining v5 components
-- Extends: 20251029_fulfillment_display_v5.sql
-- Date: 2025-10-29
-- =====================================================

-- =====================================================
-- 1. PROFILES (Extended from auth.users)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  locale TEXT DEFAULT 'en-CA',
  timezone TEXT DEFAULT 'America/Toronto',
  avatar_url TEXT,
  bio TEXT,
  preferences JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger for updated_at
CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_user_policy ON public.profiles
  FOR ALL USING (id = auth.uid());

-- =====================================================
-- 2. RITUALS & PRACTICES
-- =====================================================

CREATE TYPE ritual_cadence AS ENUM ('daily', 'weekly', 'monthly', 'custom');

CREATE TABLE IF NOT EXISTS public.rituals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  cadence ritual_cadence NOT NULL DEFAULT 'daily',
  custom_cron TEXT, -- For custom cadences (cron expression)
  instructions TEXT, -- Markdown
  reminder_enabled BOOLEAN DEFAULT TRUE,
  reminder_time TIME,
  area_id UUID REFERENCES fd_area(id) ON DELETE SET NULL,
  position INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ritual_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ritual_id UUID NOT NULL REFERENCES public.rituals(id) ON DELETE CASCADE,
  did_happen BOOLEAN DEFAULT TRUE,
  duration_minutes INT,
  mood INT CHECK (mood BETWEEN 1 AND 10),
  notes TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_rituals_profile ON public.rituals(profile_id);
CREATE INDEX idx_rituals_area ON public.rituals(area_id);
CREATE INDEX idx_ritual_sessions_ritual ON public.ritual_sessions(ritual_id);
CREATE INDEX idx_ritual_sessions_occurred ON public.ritual_sessions(occurred_at DESC);

-- Triggers
CREATE TRIGGER set_rituals_updated_at BEFORE UPDATE ON public.rituals
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- RLS
ALTER TABLE public.rituals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ritual_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY rituals_user_policy ON public.rituals
  FOR ALL USING (profile_id = auth.uid());

CREATE POLICY ritual_sessions_user_policy ON public.ritual_sessions
  FOR ALL USING (ritual_id IN (SELECT id FROM public.rituals WHERE profile_id = auth.uid()));

-- =====================================================
-- 3. RELATIONSHIPS GRAPH (Enhanced)
-- =====================================================

CREATE TYPE relation_kind AS ENUM (
  'mother_child',
  'father_child',
  'sibling_playmate',
  'admired',
  'admiring',
  'partner',
  'friend',
  'colleague',
  'mentor',
  'mentee',
  'other'
);

CREATE TYPE relationship_status AS ENUM (
  'active',
  'distant',
  'estranged',
  'ended',
  'deceased'
);

CREATE TABLE IF NOT EXISTS public.relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  person_name TEXT NOT NULL,
  kind relation_kind NOT NULL,
  status relationship_status DEFAULT 'active',
  area_id UUID REFERENCES fd_area(id) ON DELETE SET NULL,
  frequency_desired INT CHECK (frequency_desired BETWEEN 1 AND 10),
  frequency_actual INT CHECK (frequency_actual BETWEEN 1 AND 10),
  quality_rating INT CHECK (quality_rating BETWEEN 1 AND 10),
  started_on DATE,
  ended_on DATE,
  notes TEXT, -- Markdown
  private_notes TEXT, -- Extra private notes
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.relationship_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  relationship_id UUID NOT NULL REFERENCES public.relationships(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  detail TEXT, -- Markdown
  event_type TEXT, -- 'meeting', 'conflict', 'milestone', 'communication', etc.
  mood INT CHECK (mood BETWEEN 1 AND 10),
  occurred_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_relationships_profile ON public.relationships(profile_id);
CREATE INDEX idx_relationships_area ON public.relationships(area_id);
CREATE INDEX idx_relationships_status ON public.relationships(status);
CREATE INDEX idx_relationship_events_rel ON public.relationship_events(relationship_id);
CREATE INDEX idx_relationship_events_occurred ON public.relationship_events(occurred_at DESC);

-- Triggers
CREATE TRIGGER set_relationships_updated_at BEFORE UPDATE ON public.relationships
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- RLS
ALTER TABLE public.relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relationship_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY relationships_user_policy ON public.relationships
  FOR ALL USING (profile_id = auth.uid());

CREATE POLICY relationship_events_user_policy ON public.relationship_events
  FOR ALL USING (relationship_id IN (SELECT id FROM public.relationships WHERE profile_id = auth.uid()));

-- =====================================================
-- 4. GOALS (OKR-style)
-- =====================================================

CREATE TYPE goal_status AS ENUM ('planned', 'active', 'paused', 'done', 'dropped');
CREATE TYPE goal_priority AS ENUM ('low', 'medium', 'high', 'critical');

CREATE TABLE IF NOT EXISTS public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT, -- Markdown
  area_id UUID REFERENCES fd_area(id) ON DELETE SET NULL,
  dimension_id UUID REFERENCES fd_dimension(id) ON DELETE SET NULL,
  status goal_status NOT NULL DEFAULT 'planned',
  priority goal_priority DEFAULT 'medium',
  progress DECIMAL(5,2) DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  target_date DATE,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  parent_goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL, -- For sub-goals
  position INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.goal_key_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  metric_type TEXT, -- 'boolean', 'numeric', 'percentage'
  target_value NUMERIC,
  current_value NUMERIC DEFAULT 0,
  unit TEXT,
  position INT DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.goal_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  summary TEXT, -- Markdown
  progress NUMERIC CHECK (progress >= 0 AND progress <= 100),
  mood INT CHECK (mood BETWEEN 1 AND 10),
  blockers TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_goals_profile ON public.goals(profile_id);
CREATE INDEX idx_goals_area ON public.goals(area_id);
CREATE INDEX idx_goals_status ON public.goals(status);
CREATE INDEX idx_goals_target_date ON public.goals(target_date);
CREATE INDEX idx_goal_key_results_goal ON public.goal_key_results(goal_id);
CREATE INDEX idx_goal_updates_goal ON public.goal_updates(goal_id);
CREATE INDEX idx_goal_updates_created ON public.goal_updates(created_at DESC);

-- Triggers
CREATE TRIGGER set_goals_updated_at BEFORE UPDATE ON public.goals
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_goal_key_results_updated_at BEFORE UPDATE ON public.goal_key_results
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- RLS
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_key_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY goals_user_policy ON public.goals
  FOR ALL USING (profile_id = auth.uid());

CREATE POLICY goal_key_results_user_policy ON public.goal_key_results
  FOR ALL USING (goal_id IN (SELECT id FROM public.goals WHERE profile_id = auth.uid()));

CREATE POLICY goal_updates_user_policy ON public.goal_updates
  FOR ALL USING (goal_id IN (SELECT id FROM public.goals WHERE profile_id = auth.uid()));

-- =====================================================
-- 5. WORK & FINANCE INTEGRATION
-- =====================================================

CREATE TABLE IF NOT EXISTS public.work_finance_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  framework_version TEXT DEFAULT 'v5',
  work_area_id UUID REFERENCES fd_area(id) ON DELETE SET NULL,
  finance_area_id UUID REFERENCES fd_area(id) ON DELETE SET NULL,
  integration_enabled BOOLEAN DEFAULT TRUE,
  config JSONB DEFAULT '{}'::JSONB, -- API keys, sync settings, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id)
);

CREATE TABLE IF NOT EXISTS public.wfi_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES public.work_finance_integrations(id) ON DELETE CASCADE,
  period VARCHAR(10) NOT NULL, -- 'YYYY-MM' or 'YYYY-QQ'
  work_hours NUMERIC,
  work_projects_completed INT,
  work_satisfaction INT CHECK (work_satisfaction BETWEEN 1 AND 10),
  income NUMERIC,
  expenses NUMERIC,
  savings_rate NUMERIC,
  financial_health INT CHECK (financial_health BETWEEN 1 AND 10),
  notes TEXT, -- Markdown
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(integration_id, period)
);

-- Indexes
CREATE INDEX idx_wfi_profile ON public.work_finance_integrations(profile_id);
CREATE INDEX idx_wfi_periods_integration ON public.wfi_periods(integration_id);
CREATE INDEX idx_wfi_periods_period ON public.wfi_periods(period);

-- Triggers
CREATE TRIGGER set_wfi_updated_at BEFORE UPDATE ON public.work_finance_integrations
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_wfi_periods_updated_at BEFORE UPDATE ON public.wfi_periods
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- RLS
ALTER TABLE public.work_finance_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wfi_periods ENABLE ROW LEVEL SECURITY;

CREATE POLICY wfi_user_policy ON public.work_finance_integrations
  FOR ALL USING (profile_id = auth.uid());

CREATE POLICY wfi_periods_user_policy ON public.wfi_periods
  FOR ALL USING (integration_id IN (SELECT id FROM public.work_finance_integrations WHERE profile_id = auth.uid()));

-- =====================================================
-- 6. ATTACHMENTS (Polymorphic)
-- =====================================================

CREATE TYPE attachment_resource_type AS ENUM (
  'journal_entry',
  'goal',
  'ritual_session',
  'relationship_event',
  'integrity_event',
  'forgiveness_log',
  'reconciliation_log',
  'autobiography_chapter'
);

CREATE TABLE IF NOT EXISTS public.attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  resource_type attachment_resource_type NOT NULL,
  resource_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL, -- MIME type
  file_size INT NOT NULL, -- bytes
  storage_path TEXT NOT NULL, -- Path in Supabase Storage
  url TEXT, -- Signed URL (generated on demand)
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_attachments_profile ON public.attachments(profile_id);
CREATE INDEX idx_attachments_resource ON public.attachments(resource_type, resource_id);

-- RLS
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY attachments_user_policy ON public.attachments
  FOR ALL USING (profile_id = auth.uid());

-- =====================================================
-- 7. NOTIFICATIONS
-- =====================================================

CREATE TYPE notification_type AS ENUM (
  'ritual_reminder',
  'goal_due',
  'integrity_alert',
  'monthly_review',
  'quarterly_review',
  'system'
);

CREATE TYPE notification_channel AS ENUM ('in_app', 'email', 'push');
CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'read', 'failed');

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  channel notification_channel NOT NULL DEFAULT 'in_app',
  status notification_status NOT NULL DEFAULT 'pending',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  resource_type TEXT,
  resource_id UUID,
  metadata JSONB DEFAULT '{}'::JSONB,
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notifications_profile ON public.notifications(profile_id);
CREATE INDEX idx_notifications_status ON public.notifications(status);
CREATE INDEX idx_notifications_scheduled ON public.notifications(scheduled_for) WHERE status = 'pending';
CREATE INDEX idx_notifications_created ON public.notifications(created_at DESC);

-- RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY notifications_user_policy ON public.notifications
  FOR ALL USING (profile_id = auth.uid());

-- =====================================================
-- 8. WEBHOOKS
-- =====================================================

CREATE TYPE webhook_event AS ENUM (
  'entry.created',
  'goal.completed',
  'ritual.completed',
  'review.monthly',
  'review.quarterly',
  'integrity.created',
  'forgiveness.completed'
);

CREATE TABLE IF NOT EXISTS public.webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  events webhook_event[] NOT NULL,
  secret TEXT NOT NULL, -- For signing payloads
  is_active BOOLEAN DEFAULT TRUE,
  last_triggered_at TIMESTAMPTZ,
  failure_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID NOT NULL REFERENCES public.webhooks(id) ON DELETE CASCADE,
  event webhook_event NOT NULL,
  payload JSONB NOT NULL,
  response_status INT,
  response_body TEXT,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_webhooks_profile ON public.webhooks(profile_id);
CREATE INDEX idx_webhooks_active ON public.webhooks(is_active);
CREATE INDEX idx_webhook_deliveries_webhook ON public.webhook_deliveries(webhook_id);
CREATE INDEX idx_webhook_deliveries_created ON public.webhook_deliveries(created_at DESC);

-- Triggers
CREATE TRIGGER set_webhooks_updated_at BEFORE UPDATE ON public.webhooks
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- RLS
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY webhooks_user_policy ON public.webhooks
  FOR ALL USING (profile_id = auth.uid());

CREATE POLICY webhook_deliveries_user_policy ON public.webhook_deliveries
  FOR ALL USING (webhook_id IN (SELECT id FROM public.webhooks WHERE profile_id = auth.uid()));

-- =====================================================
-- 9. API KEYS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE, -- bcrypt hash of the actual key
  key_prefix TEXT NOT NULL, -- First 8 chars for display
  scopes TEXT[] NOT NULL DEFAULT ARRAY['read'], -- 'read', 'write', 'delete'
  is_active BOOLEAN DEFAULT TRUE,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_api_keys_profile ON public.api_keys(profile_id);
CREATE INDEX idx_api_keys_hash ON public.api_keys(key_hash);
CREATE INDEX idx_api_keys_active ON public.api_keys(is_active);

-- Triggers
CREATE TRIGGER set_api_keys_updated_at BEFORE UPDATE ON public.api_keys
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- RLS
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY api_keys_user_policy ON public.api_keys
  FOR ALL USING (profile_id = auth.uid());

-- =====================================================
-- 10. AUDIT LOG (Enhanced)
-- =====================================================

CREATE TYPE audit_action AS ENUM (
  'create',
  'update',
  'delete',
  'login',
  'logout',
  'export',
  'import',
  'api_call'
);

CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action audit_action NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  changes JSONB, -- Before/after snapshots
  ip_address INET,
  user_agent TEXT,
  api_key_id UUID REFERENCES public.api_keys(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_audit_log_profile ON public.audit_log(profile_id);
CREATE INDEX idx_audit_log_resource ON public.audit_log(resource_type, resource_id);
CREATE INDEX idx_audit_log_created ON public.audit_log(created_at DESC);

-- Partitioning by month (optional, for large datasets)
-- CREATE TABLE audit_log_y2025m10 PARTITION OF audit_log
--   FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');

-- RLS (admins can see all, users see their own)
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY audit_log_user_policy ON public.audit_log
  FOR SELECT USING (profile_id = auth.uid());

-- =====================================================
-- 11. INTERPRETATION KEYS (Auto-interpretation)
-- =====================================================

CREATE TYPE interpretation_context AS ENUM (
  'journal_entry',
  'goal_progress',
  'relationship_dynamic',
  'integrity_pattern',
  'monthly_review',
  'quarterly_review'
);

CREATE TABLE IF NOT EXISTS public.interpretations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  context interpretation_context NOT NULL,
  resource_id UUID,
  insight TEXT NOT NULL, -- AI-generated insight
  confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
  tags TEXT[], -- Topic tags
  feedback INT CHECK (feedback BETWEEN -1 AND 1), -- User feedback: -1 bad, 0 neutral, 1 good
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_interpretations_profile ON public.interpretations(profile_id);
CREATE INDEX idx_interpretations_context ON public.interpretations(context, resource_id);
CREATE INDEX idx_interpretations_created ON public.interpretations(created_at DESC);

-- RLS
ALTER TABLE public.interpretations ENABLE ROW LEVEL SECURITY;

CREATE POLICY interpretations_user_policy ON public.interpretations
  FOR ALL USING (profile_id = auth.uid());

-- =====================================================
-- 12. DASHBOARD SNAPSHOTS (Holistic Stability)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  layout JSONB NOT NULL, -- Widget configuration
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.dashboard_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id UUID NOT NULL REFERENCES public.dashboards(id) ON DELETE CASCADE,
  period VARCHAR(10) NOT NULL, -- 'YYYY-MM-DD' or 'YYYY-MM'
  data JSONB NOT NULL, -- Complete dashboard state
  gfs INT, -- Global Fulfillment Score
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(dashboard_id, period)
);

-- Indexes
CREATE INDEX idx_dashboards_profile ON public.dashboards(profile_id);
CREATE INDEX idx_dashboard_snapshots_dashboard ON public.dashboard_snapshots(dashboard_id);
CREATE INDEX idx_dashboard_snapshots_period ON public.dashboard_snapshots(period DESC);

-- Triggers
CREATE TRIGGER set_dashboards_updated_at BEFORE UPDATE ON public.dashboards
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- RLS
ALTER TABLE public.dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY dashboards_user_policy ON public.dashboards
  FOR ALL USING (profile_id = auth.uid());

CREATE POLICY dashboard_snapshots_user_policy ON public.dashboard_snapshots
  FOR ALL USING (dashboard_id IN (SELECT id FROM public.dashboards WHERE profile_id = auth.uid()));

-- =====================================================
-- 13. TAGS (Reusable across system)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT,
  category TEXT, -- 'emotion', 'topic', 'person', 'project', etc.
  usage_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, name)
);

-- Indexes
CREATE INDEX idx_tags_profile ON public.tags(profile_id);
CREATE INDEX idx_tags_name ON public.tags(name);
CREATE INDEX idx_tags_category ON public.tags(category);

-- RLS
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY tags_user_policy ON public.tags
  FOR ALL USING (profile_id = auth.uid());

-- =====================================================
-- 14. HELPER FUNCTIONS
-- =====================================================

-- Calculate GFS (Global Fulfillment Score) for a user
CREATE OR REPLACE FUNCTION fn_calculate_gfs(
  p_profile_id UUID,
  p_period VARCHAR(10)
) RETURNS INT AS $$
DECLARE
  v_gfs NUMERIC;
BEGIN
  WITH area_scores AS (
    SELECT
      COALESCE(AVG(sr.score), 0) AS score,
      COALESCE(w.weight, a.weight_default) AS weight
    FROM fd_area a
    LEFT JOIN fd_score_raw sr ON sr.area_id = a.id
      AND sr.user_id = p_profile_id
      AND sr.period = p_period
    LEFT JOIN fd_user_area_weight w ON w.area_id = a.id
      AND w.user_id = p_profile_id
      AND w.effective_from <= (p_period || '-01')::DATE
    WHERE a.is_active = TRUE
    GROUP BY a.id, a.weight_default, w.weight
  )
  SELECT ROUND((SUM(score * weight) * 20)::NUMERIC, 0)
  INTO v_gfs
  FROM area_scores;

  RETURN COALESCE(v_gfs::INT, 0);
END;
$$ LANGUAGE plpgsql;

-- Get area health status (GREEN, YELLOW, RED)
CREATE OR REPLACE FUNCTION fn_area_health_status(
  p_score NUMERIC
) RETURNS TEXT AS $$
BEGIN
  CASE
    WHEN p_score >= 4.0 THEN RETURN 'GREEN';
    WHEN p_score >= 2.5 THEN RETURN 'YELLOW';
    ELSE RETURN 'RED';
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Generate period strings
CREATE OR REPLACE FUNCTION fn_current_period(p_type TEXT DEFAULT 'month')
RETURNS TEXT AS $$
BEGIN
  CASE p_type
    WHEN 'month' THEN RETURN TO_CHAR(CURRENT_DATE, 'YYYY-MM');
    WHEN 'quarter' THEN RETURN TO_CHAR(CURRENT_DATE, 'YYYY-"Q"Q');
    WHEN 'year' THEN RETURN TO_CHAR(CURRENT_DATE, 'YYYY');
    ELSE RETURN TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD');
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- 15. VIEWS (Convenience queries)
-- =====================================================

-- Active rituals with next scheduled time
CREATE OR REPLACE VIEW v_rituals_active AS
SELECT
  r.*,
  (
    SELECT MAX(occurred_at)
    FROM ritual_sessions rs
    WHERE rs.ritual_id = r.id
  ) AS last_completed_at,
  (
    SELECT COUNT(*)
    FROM ritual_sessions rs
    WHERE rs.ritual_id = r.id
      AND rs.did_happen = TRUE
      AND rs.occurred_at >= CURRENT_DATE - INTERVAL '30 days'
  ) AS completed_last_30_days
FROM rituals r
WHERE r.is_active = TRUE;

-- Overdue goals
CREATE OR REPLACE VIEW v_goals_overdue AS
SELECT
  g.*,
  a.name AS area_name,
  (CURRENT_DATE - g.target_date) AS days_overdue
FROM goals g
LEFT JOIN fd_area a ON a.id = g.area_id
WHERE g.status IN ('planned', 'active')
  AND g.target_date < CURRENT_DATE;

-- Relationship health summary
CREATE OR REPLACE VIEW v_relationships_health AS
SELECT
  r.*,
  a.name AS area_name,
  (r.frequency_actual - r.frequency_desired) AS frequency_gap,
  (
    SELECT COUNT(*)
    FROM relationship_events re
    WHERE re.relationship_id = r.id
      AND re.occurred_at >= CURRENT_DATE - INTERVAL '30 days'
  ) AS events_last_30_days
FROM relationships r
LEFT JOIN fd_area a ON a.id = r.area_id
WHERE r.status = 'active';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

COMMENT ON SCHEMA public IS 'Fulfillment Display v5 Extended — Complete backend schema';
