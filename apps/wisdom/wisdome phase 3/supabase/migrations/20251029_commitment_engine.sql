-- =====================================================
-- WisdomOS Commitment Engine — Database Schema
-- =====================================================
-- "Commitments Spawn Fulfilment" — Structural Doctrine
-- Version: 1.0
-- Date: 2025-10-29
-- =====================================================

-- =====================================================
-- FOUNDATIONAL PRINCIPLE:
-- Every commitment (declared intention) is the seed
-- of a new Area of Fulfilment. The system dynamically
-- creates, weights, and retires Areas based on the
-- evolving commitment log.
-- =====================================================

-- =====================================================
-- 1. COMMITMENTS TABLE
-- =====================================================

CREATE TYPE fd_commitment_source AS ENUM ('journal', 'voice', 'import', 'system');
CREATE TYPE fd_commitment_status AS ENUM ('active', 'completed', 'released', 'archived');

CREATE TABLE IF NOT EXISTS fd_commitment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tenant_id UUID NOT NULL,

  -- Commitment Details
  statement TEXT NOT NULL,
  summary VARCHAR(255), -- AI-generated short form
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  source fd_commitment_source NOT NULL DEFAULT 'journal',
  status fd_commitment_status NOT NULL DEFAULT 'active',

  -- NLP Analysis
  confidence DECIMAL(3,2) NOT NULL DEFAULT 0.5, -- 0-1 NLP certainty
  intent_verbs TEXT[], -- ['commit', 'will', 'plan', 'aim']
  entities JSONB, -- Extracted subjects, projects, people

  -- Temporal Anchoring (1975-2100 timeline)
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  projected_end DATE, -- Auto = +5 years (editable)
  active_era VARCHAR(50), -- Derived from year: "Era of Expansion 2025–2030"

  -- Relationships
  linked_area_id UUID, -- Foreign key to fd_area
  linked_chapter_id UUID, -- Foreign key to fd_autobiography_chapter
  parent_commitment_id UUID, -- For hierarchical commitments

  -- Fulfillment Tracking
  progress_ratio DECIMAL(4,3) DEFAULT 0.0, -- 0-1 derived from area.score
  last_reviewed_at TIMESTAMPTZ,

  -- Metadata
  tags TEXT[] DEFAULT '{}',
  notes_md TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at TIMESTAMPTZ, -- Soft delete

  -- Constraints
  CONSTRAINT fk_linked_area FOREIGN KEY (linked_area_id) REFERENCES fd_area(id) ON DELETE SET NULL,
  CONSTRAINT fk_linked_chapter FOREIGN KEY (linked_chapter_id) REFERENCES fd_autobiography_chapter(id) ON DELETE SET NULL,
  CONSTRAINT fk_parent_commitment FOREIGN KEY (parent_commitment_id) REFERENCES fd_commitment(id) ON DELETE SET NULL,
  CONSTRAINT chk_confidence CHECK (confidence >= 0 AND confidence <= 1),
  CONSTRAINT chk_progress CHECK (progress_ratio >= 0 AND progress_ratio <= 1)
);

-- Indexes
CREATE INDEX idx_fd_commitment_user ON fd_commitment(user_id);
CREATE INDEX idx_fd_commitment_user_status ON fd_commitment(user_id, status);
CREATE INDEX idx_fd_commitment_date ON fd_commitment(date DESC);
CREATE INDEX idx_fd_commitment_linked_area ON fd_commitment(linked_area_id);
CREATE INDEX idx_fd_commitment_era ON fd_commitment(active_era);
CREATE INDEX idx_fd_commitment_search ON fd_commitment USING GIN (to_tsvector('english', statement));

-- =====================================================
-- 2. COMMITMENT LINKS (Many-to-Many relationships)
-- =====================================================

CREATE TABLE IF NOT EXISTS fd_commitment_link (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commitment_id UUID NOT NULL REFERENCES fd_commitment(id) ON DELETE CASCADE,
  area_id UUID NOT NULL REFERENCES fd_area(id) ON DELETE CASCADE,
  relation_strength DECIMAL(3,2) DEFAULT 1.0, -- 0-1 how strongly linked
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(commitment_id, area_id)
);

-- Indexes
CREATE INDEX idx_fd_commitment_link_commitment ON fd_commitment_link(commitment_id);
CREATE INDEX idx_fd_commitment_link_area ON fd_commitment_link(area_id);

-- =====================================================
-- 3. COMMITMENT ENTRY LINKS (Commitments ← Entries)
-- =====================================================

CREATE TABLE IF NOT EXISTS fd_commitment_entry_link (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commitment_id UUID NOT NULL REFERENCES fd_commitment(id) ON DELETE CASCADE,
  entry_id UUID NOT NULL REFERENCES fd_entry(id) ON DELETE CASCADE,
  extraction_confidence DECIMAL(3,2) DEFAULT 0.8, -- NLP confidence
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(commitment_id, entry_id)
);

-- Indexes
CREATE INDEX idx_fd_commitment_entry_commitment ON fd_commitment_entry_link(commitment_id);
CREATE INDEX idx_fd_commitment_entry_entry ON fd_commitment_entry_link(entry_id);

-- =====================================================
-- 4. COMMITMENT-SPAWNED AREAS (Tracking origin)
-- =====================================================

-- Add origin tracking to fd_area
ALTER TABLE fd_area ADD COLUMN IF NOT EXISTS origin_commitment_id UUID;
ALTER TABLE fd_area ADD COLUMN IF NOT EXISTS is_auto_generated BOOLEAN DEFAULT false;
ALTER TABLE fd_area ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ;

ALTER TABLE fd_area ADD CONSTRAINT fk_area_origin_commitment
  FOREIGN KEY (origin_commitment_id) REFERENCES fd_commitment(id) ON DELETE SET NULL;

CREATE INDEX idx_fd_area_origin ON fd_area(origin_commitment_id);
CREATE INDEX idx_fd_area_activity ON fd_area(last_activity_at DESC);

-- =====================================================
-- 5. TEMPORAL ERAS (1975-2100 Timeline)
-- =====================================================

CREATE TABLE IF NOT EXISTS fd_era (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL, -- "Era of Expansion 2025–2030"
  start_year INTEGER NOT NULL,
  end_year INTEGER NOT NULL,
  description TEXT,
  theme VARCHAR(255), -- "Expansion", "Consolidation", "Emergence"
  chapter_id UUID, -- Link to autobiography chapter
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, start_year)
);

-- Index
CREATE INDEX idx_fd_era_user ON fd_era(user_id);
CREATE INDEX idx_fd_era_years ON fd_era(start_year, end_year);

-- =====================================================
-- 6. COMMITMENT FULFILLMENT INDEX (CFI)
-- =====================================================

-- Function to calculate Commitment Fulfillment Index
CREATE OR REPLACE FUNCTION fn_fd_calculate_cfi(p_user_id UUID)
RETURNS DECIMAL(5,2) AS $$
DECLARE
  v_cfi DECIMAL(5,2);
BEGIN
  -- CFI = Σ(active_commitments.progress_ratio × area.weight) × 100
  WITH active_commitments AS (
    SELECT
      c.id,
      c.progress_ratio,
      COALESCE(a.weight_default, 0.05) AS weight
    FROM fd_commitment c
    LEFT JOIN fd_area a ON a.id = c.linked_area_id
    WHERE c.user_id = p_user_id
      AND c.status = 'active'
      AND c.archived_at IS NULL
  )
  SELECT ROUND((SUM(progress_ratio * weight) * 100)::NUMERIC, 2)
  INTO v_cfi
  FROM active_commitments;

  RETURN COALESCE(v_cfi, 0.0);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. COMMITMENT DETECTION TRIGGERS
-- =====================================================

-- Auto-update progress_ratio when linked area scores change
CREATE OR REPLACE FUNCTION fn_fd_update_commitment_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- Update all commitments linked to this area
  UPDATE fd_commitment c
  SET
    progress_ratio = (
      SELECT AVG(d.score / 5.0) -- Normalize to 0-1
      FROM fd_dimension dim
      LEFT JOIN fd_score_raw d ON d.dimension_id = dim.id
        AND d.user_id = c.user_id
        AND d.period = to_char(CURRENT_DATE, 'YYYY-MM')
      WHERE dim.area_id = NEW.area_id
    ),
    last_reviewed_at = NOW()
  WHERE c.linked_area_id = NEW.area_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_fd_update_commitment_progress
AFTER INSERT OR UPDATE ON fd_score_raw
FOR EACH ROW
EXECUTE FUNCTION fn_fd_update_commitment_progress();

-- =====================================================
-- 8. AUTO-ARCHIVE STALE COMMITMENTS
-- =====================================================

-- Function to archive commitments inactive for 6+ months
CREATE OR REPLACE FUNCTION fn_fd_archive_dormant_commitments()
RETURNS INTEGER AS $$
DECLARE
  v_archived_count INTEGER;
BEGIN
  WITH archived AS (
    UPDATE fd_commitment
    SET
      status = 'archived',
      archived_at = NOW()
    WHERE status = 'active'
      AND (
        last_reviewed_at < NOW() - INTERVAL '6 months'
        OR (last_reviewed_at IS NULL AND created_at < NOW() - INTERVAL '6 months')
      )
    RETURNING id
  )
  SELECT COUNT(*) INTO v_archived_count FROM archived;

  RETURN v_archived_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 9. ERA AUTO-ASSIGNMENT
-- =====================================================

-- Function to assign commitment to era based on date
CREATE OR REPLACE FUNCTION fn_fd_assign_era(p_commitment_id UUID)
RETURNS VARCHAR(50) AS $$
DECLARE
  v_commitment_date DATE;
  v_year INTEGER;
  v_era_name VARCHAR(50);
  v_user_id UUID;
BEGIN
  -- Get commitment date and user
  SELECT date, EXTRACT(YEAR FROM date)::INTEGER, user_id
  INTO v_commitment_date, v_year, v_user_id
  FROM fd_commitment
  WHERE id = p_commitment_id;

  -- Find matching era
  SELECT name INTO v_era_name
  FROM fd_era
  WHERE user_id = v_user_id
    AND v_year >= start_year
    AND v_year <= end_year
  LIMIT 1;

  -- If no era exists, create default
  IF v_era_name IS NULL THEN
    -- Create 5-year era
    INSERT INTO fd_era (user_id, name, start_year, end_year, theme)
    VALUES (
      v_user_id,
      'Era of ' || v_year || '–' || (v_year + 4),
      v_year,
      v_year + 4,
      'Expansion'
    )
    RETURNING name INTO v_era_name;
  END IF;

  -- Update commitment with era
  UPDATE fd_commitment
  SET active_era = v_era_name
  WHERE id = p_commitment_id;

  RETURN v_era_name;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-assign era on commitment creation
CREATE OR REPLACE FUNCTION trigger_fd_auto_assign_era()
RETURNS TRIGGER AS $$
BEGIN
  NEW.active_era := fn_fd_assign_era(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_fd_commitment_assign_era
AFTER INSERT ON fd_commitment
FOR EACH ROW
EXECUTE FUNCTION trigger_fd_auto_assign_era();

-- =====================================================
-- 10. ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE fd_commitment ENABLE ROW LEVEL SECURITY;
ALTER TABLE fd_commitment_link ENABLE ROW LEVEL SECURITY;
ALTER TABLE fd_commitment_entry_link ENABLE ROW LEVEL SECURITY;
ALTER TABLE fd_era ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY fd_commitment_user_policy ON fd_commitment
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY fd_commitment_link_user_policy ON fd_commitment_link
  FOR ALL USING (
    commitment_id IN (
      SELECT id FROM fd_commitment WHERE user_id = auth.uid()
    )
  );

CREATE POLICY fd_commitment_entry_link_user_policy ON fd_commitment_entry_link
  FOR ALL USING (
    commitment_id IN (
      SELECT id FROM fd_commitment WHERE user_id = auth.uid()
    )
  );

CREATE POLICY fd_era_user_policy ON fd_era
  FOR ALL USING (user_id = auth.uid());

-- =====================================================
-- 11. UPDATED_AT TRIGGERS
-- =====================================================

CREATE TRIGGER set_fd_commitment_updated_at BEFORE UPDATE ON fd_commitment
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- =====================================================
-- 12. SEED DEFAULT ERAS (Example)
-- =====================================================

-- Example: Create default eras for timeline 1975-2100
CREATE OR REPLACE FUNCTION fn_fd_seed_default_eras(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO fd_era (user_id, name, start_year, end_year, theme) VALUES
    (p_user_id, 'Foundations 1975–1990', 1975, 1990, 'Foundation'),
    (p_user_id, 'Creative Emergence 1990–2005', 1990, 2005, 'Emergence'),
    (p_user_id, 'The Hostel Years 2005–2025', 2005, 2025, 'Building'),
    (p_user_id, 'Era of Expansion 2025–2030', 2025, 2030, 'Expansion'),
    (p_user_id, 'Legacy Consolidation 2030–2040', 2030, 2040, 'Consolidation'),
    (p_user_id, 'Wisdom Sharing 2040–2100', 2040, 2100, 'Legacy')
  ON CONFLICT (user_id, start_year) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

COMMENT ON TABLE fd_commitment IS 'Commitment Engine: "Commitments Spawn Fulfilment" — Every commitment seeds a new Area';
COMMENT ON FUNCTION fn_fd_calculate_cfi IS 'Calculate Commitment Fulfillment Index (CFI) for user';
COMMENT ON FUNCTION fn_fd_archive_dormant_commitments IS 'Auto-archive commitments inactive for 6+ months';
