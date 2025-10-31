-- === WisdomOS Privacy System Migration ===
-- Adds granular privacy controls for entries with visibility, display, and export scopes

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- === Core Entries Table (unified journal + autobiography) ===
CREATE TABLE IF NOT EXISTS entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('journal','autobiography')),
  title TEXT,
  body TEXT NOT NULL,
  
  -- Year field for autobiography entries
  year INT,
  
  -- Wisdom Course specific fields (for autobiography)
  earliest TEXT,  -- earliest similar occurrence
  insight TEXT,   -- what I made it mean
  commitment TEXT, -- new way of being
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Visibility: who may see this entry
  visibility TEXT NOT NULL DEFAULT 'private'
    CHECK (visibility IN ('private','cohort','coach','public','anonymous')),
  
  -- Display scope: whether entry affects shared displays
  display_scope TEXT NOT NULL DEFAULT 'owner_only'
    CHECK (display_scope IN ('owner_only','include_for_me','include_for_shared')),
  
  -- Export scope: how entry is handled in exports
  export_scope TEXT NOT NULL DEFAULT 'owner_only'
    CHECK (export_scope IN ('owner_only','anonymized','exclude','include')),
  
  -- Sensitive flag for automatic redaction
  is_sensitive BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Soft delete
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Indexes for performance
  CONSTRAINT unique_autobiography_year UNIQUE (user_id, year, type)
);

CREATE INDEX idx_entries_user_type ON entries(user_id, type);
CREATE INDEX idx_entries_visibility ON entries(visibility);
CREATE INDEX idx_entries_year ON entries(year) WHERE type = 'autobiography';
CREATE INDEX idx_entries_archived ON entries(is_archived);

-- === Entry Versioning (edit history) ===
CREATE TABLE IF NOT EXISTS entry_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  version INT NOT NULL,
  title TEXT,
  body TEXT NOT NULL,
  earliest TEXT,
  insight TEXT,
  commitment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

CREATE UNIQUE INDEX idx_entry_versions_unique ON entry_versions(entry_id, version);
CREATE INDEX idx_entry_versions_entry ON entry_versions(entry_id);

-- === Entry Tags ===
CREATE TABLE IF NOT EXISTS entry_tags (
  entry_id UUID REFERENCES entries(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  PRIMARY KEY (entry_id, tag)
);

CREATE INDEX idx_entry_tags_tag ON entry_tags(tag);

-- === Entry Life Areas ===
CREATE TABLE IF NOT EXISTS entry_life_areas (
  entry_id UUID REFERENCES entries(id) ON DELETE CASCADE,
  life_area_id INT NOT NULL REFERENCES life_areas(id),
  impact SMALLINT NOT NULL CHECK (impact >= -2 AND impact <= 2),
  PRIMARY KEY (entry_id, life_area_id)
);

CREATE INDEX idx_entry_life_areas_area ON entry_life_areas(life_area_id);

-- === Privacy Templates (user defaults) ===
CREATE TABLE IF NOT EXISTS privacy_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('journal','autobiography')),
  default_visibility TEXT NOT NULL DEFAULT 'private'
    CHECK (default_visibility IN ('private','cohort','coach','public','anonymous')),
  default_display_scope TEXT NOT NULL DEFAULT 'owner_only'
    CHECK (default_display_scope IN ('owner_only','include_for_me','include_for_shared')),
  default_export_scope TEXT NOT NULL DEFAULT 'owner_only'
    CHECK (default_export_scope IN ('owner_only','anonymized','exclude','include')),
  auto_mark_sensitive BOOLEAN NOT NULL DEFAULT FALSE,
  sensitive_keywords TEXT[], -- regex patterns for auto-detection
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, entry_type)
);

-- === Cohort Memberships ===
CREATE TABLE IF NOT EXISTS cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cohort_members (
  cohort_id UUID NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member','coach','admin')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (cohort_id, user_id)
);

CREATE INDEX idx_cohort_members_user ON cohort_members(user_id);

-- === Export Audit Log ===
CREATE TABLE IF NOT EXISTS export_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  export_type TEXT NOT NULL,
  profile TEXT NOT NULL, -- personal_archive, cohort_share, coach_review, public_portfolio
  entries_included INT NOT NULL DEFAULT 0,
  entries_anonymized INT NOT NULL DEFAULT 0,
  entries_excluded INT NOT NULL DEFAULT 0,
  exported_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);

CREATE INDEX idx_export_logs_user ON export_logs(user_id, exported_at DESC);

-- === Triggers for updated_at ===
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_entries_updated
  BEFORE UPDATE ON entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_privacy_templates_updated
  BEFORE UPDATE ON privacy_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- === Trigger for auto-versioning ===
CREATE OR REPLACE FUNCTION create_entry_version()
RETURNS TRIGGER AS $$
DECLARE
  new_version INT;
BEGIN
  -- Only create version if content actually changed
  IF OLD.body IS DISTINCT FROM NEW.body OR 
     OLD.title IS DISTINCT FROM NEW.title OR
     OLD.earliest IS DISTINCT FROM NEW.earliest OR
     OLD.insight IS DISTINCT FROM NEW.insight OR
     OLD.commitment IS DISTINCT FROM NEW.commitment THEN
    
    -- Get next version number
    SELECT COALESCE(MAX(version), 0) + 1 INTO new_version
    FROM entry_versions
    WHERE entry_id = NEW.id;
    
    -- Insert version record
    INSERT INTO entry_versions (
      entry_id, version, title, body, earliest, insight, commitment
    ) VALUES (
      NEW.id, new_version, OLD.title, OLD.body, OLD.earliest, OLD.insight, OLD.commitment
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_entry_versioning
  BEFORE UPDATE ON entries
  FOR EACH ROW
  EXECUTE FUNCTION create_entry_version();

-- === Default Privacy Templates ===
-- These will be created for each user on signup
-- Journal: Private by default
-- Autobiography: Anonymous by default for sharing wisdom without personal details

-- === Views for easier querying ===

-- View for entries with life area counts
CREATE OR REPLACE VIEW v_entries_with_areas AS
SELECT 
  e.*,
  ARRAY_AGG(DISTINCT ela.life_area_id) AS life_area_ids,
  ARRAY_AGG(DISTINCT et.tag) AS tags
FROM entries e
LEFT JOIN entry_life_areas ela ON e.id = ela.entry_id
LEFT JOIN entry_tags et ON e.id = et.entry_id
WHERE e.is_archived = FALSE
GROUP BY e.id;

-- View for cohort-visible entries
CREATE OR REPLACE VIEW v_cohort_entries AS
SELECT e.*, cm.cohort_id
FROM entries e
JOIN cohort_members cm ON cm.user_id = e.user_id
WHERE e.visibility IN ('cohort', 'public', 'anonymous')
  AND e.is_archived = FALSE;

-- === Helper Functions ===

-- Check if user can view entry
CREATE OR REPLACE FUNCTION can_view_entry(
  p_entry_id UUID,
  p_viewer_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_entry RECORD;
  v_is_coach BOOLEAN;
  v_same_cohort BOOLEAN;
BEGIN
  -- Get entry details
  SELECT * INTO v_entry FROM entries WHERE id = p_entry_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Owner can always view
  IF v_entry.user_id = p_viewer_id THEN
    RETURN TRUE;
  END IF;
  
  -- Check visibility
  CASE v_entry.visibility
    WHEN 'private' THEN
      RETURN FALSE;
    WHEN 'public', 'anonymous' THEN
      RETURN TRUE;
    WHEN 'coach' THEN
      -- Check if viewer is a coach for this user
      SELECT EXISTS(
        SELECT 1 FROM cohort_members cm1
        JOIN cohort_members cm2 ON cm1.cohort_id = cm2.cohort_id
        WHERE cm1.user_id = v_entry.user_id
          AND cm2.user_id = p_viewer_id
          AND cm2.role = 'coach'
      ) INTO v_is_coach;
      RETURN v_is_coach;
    WHEN 'cohort' THEN
      -- Check if in same cohort
      SELECT EXISTS(
        SELECT 1 FROM cohort_members cm1
        JOIN cohort_members cm2 ON cm1.cohort_id = cm2.cohort_id
        WHERE cm1.user_id = v_entry.user_id
          AND cm2.user_id = p_viewer_id
      ) INTO v_same_cohort;
      RETURN v_same_cohort;
    ELSE
      RETURN FALSE;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- === Seed Default Life Areas if not exist ===
INSERT INTO life_areas (id, name, icon, description) VALUES
(1,'Work & Purpose','💼','Career, business, meaningful work'),
(2,'Health','❤️','Physical vitality, recovery, wellness'),
(3,'Finance','💰','Wealth strategy, financial security'),
(4,'Intimacy & Love','💕','Romantic partnership, deep connection'),
(5,'Time & Energy','⏰','Focus blocks, energy management'),
(6,'Spiritual Alignment','✨','Inner guidance, spiritual practice'),
(7,'Creativity & Expression','🎨','Art, writing, creative projects'),
(8,'Friendship & Community','👥','Social connections, support network'),
(9,'Learning & Growth','📚','Personal development, skill building'),
(10,'Home & Environment','🏡','Living space, comfort, order'),
(11,'Sexuality','🔥','Embodiment, erotic expression'),
(12,'Emotional Regulation','🧘','Inner child work, emotional clarity'),
(13,'Legacy & Archives','📜','Life documentation, contribution preservation')
ON CONFLICT (id) DO NOTHING;