-- =====================================================
-- Fulfillment Display v5 — Database Schema
-- =====================================================
-- Purpose: Life-ops dashboard tracking fulfillment across Areas
-- Version: 5.0
-- Date: 2025-10-29
-- =====================================================

-- =====================================================
-- 1. AREAS (Canonical Life Dimensions)
-- =====================================================

CREATE TABLE IF NOT EXISTS fd_area (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(10) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  emoji VARCHAR(10) NOT NULL,
  color VARCHAR(7) NOT NULL, -- Hex color
  weight_default DECIMAL(4,3) NOT NULL DEFAULT 0.0625, -- 1/16 for 16 areas
  is_active BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for lookups
CREATE INDEX idx_fd_area_code ON fd_area(code);
CREATE INDEX idx_fd_area_active ON fd_area(is_active);

-- =====================================================
-- 2. DIMENSIONS (Sub-metrics per Area)
-- =====================================================

CREATE TABLE IF NOT EXISTS fd_dimension (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area_id UUID NOT NULL REFERENCES fd_area(id) ON DELETE CASCADE,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  weight_default DECIMAL(4,3) NOT NULL DEFAULT 1.0,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(area_id, code)
);

-- Index for area dimensions lookup
CREATE INDEX idx_fd_dimension_area ON fd_dimension(area_id);

-- =====================================================
-- 3. JOURNAL ENTRIES (Daily reflections)
-- =====================================================

CREATE TABLE IF NOT EXISTS fd_entry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  content_md TEXT NOT NULL,
  sentiment DECIMAL(4,3), -- -1 to 1
  ai_summary TEXT,
  lang VARCHAR(5) DEFAULT 'en',
  sources JSONB DEFAULT '[]', -- Array of source references
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for queries
CREATE INDEX idx_fd_entry_user_date ON fd_entry(user_id, date DESC);
CREATE INDEX idx_fd_entry_tenant ON fd_entry(tenant_id);
CREATE INDEX idx_fd_entry_date ON fd_entry(date DESC);
CREATE INDEX idx_fd_entry_content_search ON fd_entry USING GIN (to_tsvector('english', content_md));

-- =====================================================
-- 4. ENTRY LINKS (Entries → Areas/Dimensions)
-- =====================================================

CREATE TABLE IF NOT EXISTS fd_entry_link (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES fd_entry(id) ON DELETE CASCADE,
  area_id UUID NOT NULL REFERENCES fd_area(id) ON DELETE CASCADE,
  dimension_id UUID REFERENCES fd_dimension(id) ON DELETE SET NULL,
  strength DECIMAL(3,2) DEFAULT 1.0, -- 0-1 relevance weight
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_fd_entry_link_entry ON fd_entry_link(entry_id);
CREATE INDEX idx_fd_entry_link_area ON fd_entry_link(area_id);
CREATE INDEX idx_fd_entry_link_dimension ON fd_entry_link(dimension_id);

-- =====================================================
-- 5. ACTIONS (Commitments & Follow-ups)
-- =====================================================

CREATE TYPE fd_action_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');

CREATE TABLE IF NOT EXISTS fd_action (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  area_id UUID NOT NULL REFERENCES fd_area(id) ON DELETE CASCADE,
  dimension_id UUID REFERENCES fd_dimension(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status fd_action_status NOT NULL DEFAULT 'pending',
  due_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_fd_action_user ON fd_action(user_id);
CREATE INDEX idx_fd_action_user_status ON fd_action(user_id, status);
CREATE INDEX idx_fd_action_area ON fd_action(area_id);
CREATE INDEX idx_fd_action_due ON fd_action(due_date);

-- =====================================================
-- 6. RAW SCORES (Manual & AI-generated)
-- =====================================================

CREATE TYPE fd_score_source AS ENUM ('manual', 'ai', 'computed');

CREATE TABLE IF NOT EXISTS fd_score_raw (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  area_id UUID NOT NULL REFERENCES fd_area(id) ON DELETE CASCADE,
  dimension_id UUID REFERENCES fd_dimension(id) ON DELETE CASCADE,
  period VARCHAR(10) NOT NULL, -- 'YYYY-MM' or 'YYYY-QQ'
  score DECIMAL(3,1) NOT NULL, -- 0.0 to 5.0
  source fd_score_source NOT NULL DEFAULT 'manual',
  provenance TEXT, -- Who/what created this score
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_fd_score_raw_user_period ON fd_score_raw(user_id, period);
CREATE INDEX idx_fd_score_raw_area ON fd_score_raw(area_id);
CREATE INDEX idx_fd_score_raw_dimension ON fd_score_raw(dimension_id);

-- Constraint: score must be 0-5
ALTER TABLE fd_score_raw ADD CONSTRAINT chk_score_range CHECK (score >= 0 AND score <= 5);

-- =====================================================
-- 7. SCORE ROLLUPS (Aggregated scores)
-- =====================================================

CREATE TABLE IF NOT EXISTS fd_score_rollup (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  area_id UUID NOT NULL REFERENCES fd_area(id) ON DELETE CASCADE,
  period VARCHAR(10) NOT NULL, -- 'YYYY-MM' or 'YYYY-QQ'
  score DECIMAL(4,2) NOT NULL, -- 0.00 to 5.00
  confidence DECIMAL(3,2) NOT NULL DEFAULT 0.5, -- 0-1
  trend_7d DECIMAL(4,2), -- Delta from 7 days ago
  trend_30d DECIMAL(4,2), -- Delta from 30 days ago
  trend_90d DECIMAL(4,2), -- Delta from 90 days ago
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, area_id, period)
);

-- Indexes
CREATE INDEX idx_fd_score_rollup_user_period ON fd_score_rollup(user_id, period);
CREATE INDEX idx_fd_score_rollup_area ON fd_score_rollup(area_id);

-- =====================================================
-- 8. MONTHLY REVIEWS
-- =====================================================

CREATE TABLE IF NOT EXISTS fd_review_month (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  month VARCHAR(7) NOT NULL, -- 'YYYY-MM'
  report_json JSONB NOT NULL,
  gfs INTEGER NOT NULL, -- Global Fulfillment Score 0-100
  confidence DECIMAL(3,2) NOT NULL DEFAULT 0.5,
  notes_md TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, month)
);

-- Index
CREATE INDEX idx_fd_review_month_user ON fd_review_month(user_id, month DESC);

-- =====================================================
-- 9. QUARTERLY REVIEWS
-- =====================================================

CREATE TABLE IF NOT EXISTS fd_review_quarter (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  quarter VARCHAR(7) NOT NULL, -- 'YYYY-Q1', 'YYYY-Q2', etc.
  report_json JSONB NOT NULL,
  gfs INTEGER NOT NULL, -- Global Fulfillment Score 0-100
  confidence DECIMAL(3,2) NOT NULL DEFAULT 0.5,
  reweights_json JSONB, -- Area weight adjustments
  notes_md TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, quarter)
);

-- Index
CREATE INDEX idx_fd_review_quarter_user ON fd_review_quarter(user_id, quarter DESC);

-- =====================================================
-- 10. INTEGRITY LOG (Promises vs. Actions)
-- =====================================================

CREATE TABLE IF NOT EXISTS fd_integrity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  area_id UUID NOT NULL REFERENCES fd_area(id) ON DELETE CASCADE,
  entry_id UUID REFERENCES fd_entry(id) ON DELETE SET NULL,
  issue TEXT NOT NULL, -- Description of integrity breach
  severity VARCHAR(10) DEFAULT 'medium', -- low, medium, high
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_fd_integrity_user ON fd_integrity_log(user_id);
CREATE INDEX idx_fd_integrity_user_unresolved ON fd_integrity_log(user_id) WHERE resolved_at IS NULL;
CREATE INDEX idx_fd_integrity_area ON fd_integrity_log(area_id);

-- =====================================================
-- 11. FORGIVENESS LOG (Amends & Reconciliation)
-- =====================================================

CREATE TYPE fd_forgiveness_act AS ENUM ('reflection', 'letter', 'conversation', 'amends', 'release');

CREATE TABLE IF NOT EXISTS fd_forgiveness_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  area_id UUID NOT NULL REFERENCES fd_area(id) ON DELETE CASCADE,
  entry_id UUID REFERENCES fd_entry(id) ON DELETE SET NULL,
  act_type fd_forgiveness_act NOT NULL,
  description TEXT NOT NULL,
  completed_at TIMESTAMPTZ,
  emotional_relief DECIMAL(3,2), -- 0-1 scale
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_fd_forgiveness_user ON fd_forgiveness_log(user_id);
CREATE INDEX idx_fd_forgiveness_area ON fd_forgiveness_log(area_id);

-- =====================================================
-- 12. AUTOBIOGRAPHY CHAPTERS (Narrative structure)
-- =====================================================

CREATE TYPE fd_chapter_status AS ENUM ('draft', 'in_progress', 'review', 'published');

CREATE TABLE IF NOT EXISTS fd_autobiography_chapter (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  chapter_number INTEGER,
  status fd_chapter_status NOT NULL DEFAULT 'draft',
  content_md TEXT,
  coherence_score DECIMAL(3,2), -- 0-1 narrative coherence
  date_range_start DATE,
  date_range_end DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_fd_chapter_user ON fd_autobiography_chapter(user_id);
CREATE INDEX idx_fd_chapter_user_status ON fd_autobiography_chapter(user_id, status);

-- =====================================================
-- 13. AUTOBIOGRAPHY LINKS (Entries → Chapters)
-- =====================================================

CREATE TABLE IF NOT EXISTS fd_autobiography_link (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID NOT NULL REFERENCES fd_autobiography_chapter(id) ON DELETE CASCADE,
  entry_id UUID NOT NULL REFERENCES fd_entry(id) ON DELETE CASCADE,
  weight DECIMAL(3,2) DEFAULT 1.0, -- Relevance weight
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(chapter_id, entry_id)
);

-- Indexes
CREATE INDEX idx_fd_auto_link_chapter ON fd_autobiography_link(chapter_id);
CREATE INDEX idx_fd_auto_link_entry ON fd_autobiography_link(entry_id);

-- =====================================================
-- 14. USER AREA WEIGHTS (Custom weights per user)
-- =====================================================

CREATE TABLE IF NOT EXISTS fd_user_area_weight (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  area_id UUID NOT NULL REFERENCES fd_area(id) ON DELETE CASCADE,
  weight DECIMAL(4,3) NOT NULL,
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, area_id, effective_from)
);

-- Index
CREATE INDEX idx_fd_user_weight_user ON fd_user_area_weight(user_id);

-- =====================================================
-- 15. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all user-specific tables
ALTER TABLE fd_entry ENABLE ROW LEVEL SECURITY;
ALTER TABLE fd_action ENABLE ROW LEVEL SECURITY;
ALTER TABLE fd_score_raw ENABLE ROW LEVEL SECURITY;
ALTER TABLE fd_score_rollup ENABLE ROW LEVEL SECURITY;
ALTER TABLE fd_review_month ENABLE ROW LEVEL SECURITY;
ALTER TABLE fd_review_quarter ENABLE ROW LEVEL SECURITY;
ALTER TABLE fd_integrity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE fd_forgiveness_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE fd_autobiography_chapter ENABLE ROW LEVEL SECURITY;
ALTER TABLE fd_user_area_weight ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only access their own data
CREATE POLICY fd_entry_user_policy ON fd_entry
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY fd_action_user_policy ON fd_action
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY fd_score_raw_user_policy ON fd_score_raw
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY fd_score_rollup_user_policy ON fd_score_rollup
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY fd_review_month_user_policy ON fd_review_month
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY fd_review_quarter_user_policy ON fd_review_quarter
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY fd_integrity_log_user_policy ON fd_integrity_log
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY fd_forgiveness_log_user_policy ON fd_forgiveness_log
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY fd_autobiography_chapter_user_policy ON fd_autobiography_chapter
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY fd_user_area_weight_user_policy ON fd_user_area_weight
  FOR ALL USING (user_id = auth.uid());

-- =====================================================
-- 16. FUNCTIONS: Monthly Rollup
-- =====================================================

CREATE OR REPLACE FUNCTION fn_fd_rollup_month(
  p_user_id UUID,
  p_month VARCHAR(7)
) RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
  v_gfs DECIMAL(5,2);
  v_areas JSONB;
BEGIN
  -- Calculate area scores
  WITH area_scores AS (
    SELECT
      a.code,
      a.name,
      a.emoji,
      COALESCE(AVG(sr.score), 0) AS score,
      COUNT(sr.id) AS data_points,
      COALESCE(w.weight, a.weight_default) AS weight
    FROM fd_area a
    LEFT JOIN fd_score_raw sr ON sr.area_id = a.id
      AND sr.user_id = p_user_id
      AND sr.period = p_month
    LEFT JOIN fd_user_area_weight w ON w.area_id = a.id
      AND w.user_id = p_user_id
      AND w.effective_from <= (p_month || '-01')::DATE
    WHERE a.is_active = true
    GROUP BY a.id, a.code, a.name, a.emoji, a.weight_default, w.weight
  )
  SELECT jsonb_agg(
    jsonb_build_object(
      'code', code,
      'name', name,
      'emoji', emoji,
      'score', ROUND(score::NUMERIC, 2),
      'weight', weight,
      'data_points', data_points
    )
  )
  INTO v_areas
  FROM area_scores;

  -- Calculate Global Fulfillment Score (GFS)
  WITH area_scores AS (
    SELECT
      COALESCE(AVG(sr.score), 0) AS score,
      COALESCE(w.weight, a.weight_default) AS weight
    FROM fd_area a
    LEFT JOIN fd_score_raw sr ON sr.area_id = a.id
      AND sr.user_id = p_user_id
      AND sr.period = p_month
    LEFT JOIN fd_user_area_weight w ON w.area_id = a.id
      AND w.user_id = p_user_id
      AND w.effective_from <= (p_month || '-01')::DATE
    WHERE a.is_active = true
    GROUP BY a.id, a.weight_default, w.weight
  )
  SELECT ROUND((SUM(score * weight) * 20)::NUMERIC, 0)
  INTO v_gfs
  FROM area_scores;

  -- Build result
  v_result := jsonb_build_object(
    'period', p_month,
    'gfs', COALESCE(v_gfs, 0),
    'areas', COALESCE(v_areas, '[]'::JSONB)
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 17. FUNCTIONS: Quarterly Rollup
-- =====================================================

CREATE OR REPLACE FUNCTION fn_fd_rollup_quarter(
  p_user_id UUID,
  p_quarter VARCHAR(7) -- 'YYYY-Q1'
) RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
  v_months TEXT[];
  v_month TEXT;
  v_monthly_data JSONB := '[]'::JSONB;
BEGIN
  -- Determine months in quarter
  CASE
    WHEN p_quarter LIKE '%-Q1' THEN
      v_months := ARRAY[
        SUBSTRING(p_quarter FROM 1 FOR 4) || '-01',
        SUBSTRING(p_quarter FROM 1 FOR 4) || '-02',
        SUBSTRING(p_quarter FROM 1 FOR 4) || '-03'
      ];
    WHEN p_quarter LIKE '%-Q2' THEN
      v_months := ARRAY[
        SUBSTRING(p_quarter FROM 1 FOR 4) || '-04',
        SUBSTRING(p_quarter FROM 1 FOR 4) || '-05',
        SUBSTRING(p_quarter FROM 1 FOR 4) || '-06'
      ];
    WHEN p_quarter LIKE '%-Q3' THEN
      v_months := ARRAY[
        SUBSTRING(p_quarter FROM 1 FOR 4) || '-07',
        SUBSTRING(p_quarter FROM 1 FOR 4) || '-08',
        SUBSTRING(p_quarter FROM 1 FOR 4) || '-09'
      ];
    WHEN p_quarter LIKE '%-Q4' THEN
      v_months := ARRAY[
        SUBSTRING(p_quarter FROM 1 FOR 4) || '-10',
        SUBSTRING(p_quarter FROM 1 FOR 4) || '-11',
        SUBSTRING(p_quarter FROM 1 FOR 4) || '-12'
      ];
  END CASE;

  -- Aggregate monthly data
  FOREACH v_month IN ARRAY v_months
  LOOP
    v_monthly_data := v_monthly_data || fn_fd_rollup_month(p_user_id, v_month);
  END LOOP;

  -- Build result
  v_result := jsonb_build_object(
    'quarter', p_quarter,
    'months', v_monthly_data
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 18. TRIGGERS: Updated timestamps
-- =====================================================

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER set_fd_area_updated_at BEFORE UPDATE ON fd_area
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_fd_dimension_updated_at BEFORE UPDATE ON fd_dimension
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_fd_entry_updated_at BEFORE UPDATE ON fd_entry
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_fd_action_updated_at BEFORE UPDATE ON fd_action
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_fd_score_raw_updated_at BEFORE UPDATE ON fd_score_raw
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_fd_score_rollup_updated_at BEFORE UPDATE ON fd_score_rollup
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_fd_review_month_updated_at BEFORE UPDATE ON fd_review_month
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_fd_review_quarter_updated_at BEFORE UPDATE ON fd_review_quarter
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_fd_integrity_log_updated_at BEFORE UPDATE ON fd_integrity_log
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_fd_forgiveness_log_updated_at BEFORE UPDATE ON fd_forgiveness_log
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_fd_autobiography_chapter_updated_at BEFORE UPDATE ON fd_autobiography_chapter
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Add comment to schema
COMMENT ON SCHEMA public IS 'Fulfillment Display v5 — Life-ops dashboard';
