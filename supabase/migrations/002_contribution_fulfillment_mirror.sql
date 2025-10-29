-- ============================================================================
-- Contribution to Fulfillment Mirror Feature
-- ============================================================================
-- This migration creates the data model for mirroring contributions to 
-- fulfillment entries in Work & Purpose and Creativity & Expression life areas
-- ============================================================================

-- 1. Life Areas table with canonical slugs
CREATE TABLE IF NOT EXISTS life_areas (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          text UNIQUE NOT NULL,  -- e.g., 'work-purpose', 'creativity-expression'
  name          text NOT NULL,
  description   text,
  icon          text,
  color         text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- 2. Contribution entries (Contribution Display)
CREATE TABLE IF NOT EXISTS contributions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  category        text NOT NULL,          -- 'Doing', 'Being', 'Having'
  title           text NOT NULL,          -- 'Software Design'
  description     text,
  contributions   jsonb NOT NULL,         -- array of contribution strings
  impact          text,
  commitment      text,
  tags            text[],
  visibility      text DEFAULT 'private', -- 'private', 'shared', 'public'
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- 3. Fulfillment Display entries (per Life Area)
CREATE TABLE IF NOT EXISTS fulfillment_entries (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  life_area_id     uuid NOT NULL REFERENCES life_areas(id) ON DELETE CASCADE,
  source_type      text NOT NULL,                -- 'contribution' | 'manual' | 'journal' | 'assessment'
  source_id        uuid,                         -- link back to contributions.id or other source
  title            text NOT NULL,                -- mirrored title or synthesized
  description      text,
  meta             jsonb NOT NULL DEFAULT '{}'::jsonb, -- alignment rules, tags, relationships, etc.
  status           text DEFAULT 'active',        -- 'active', 'paused', 'completed', 'archived'
  priority         integer DEFAULT 3,            -- 1-5 scale
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, life_area_id, source_type, source_id)  -- idempotency: one mirror per area per user
);

-- 4. Audit log for tracking changes
CREATE TABLE IF NOT EXISTS audit_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type  text NOT NULL,
  entity_type text NOT NULL,
  entity_id   uuid,
  payload     jsonb NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- 5. Optional: Mirror rules per user (for future customization)
CREATE TABLE IF NOT EXISTS mirror_rules (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  source_type     text NOT NULL,
  target_areas    text[],  -- array of life_area slugs
  is_active       boolean DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, source_type)
);

-- ============================================================================
-- Seed the 13 canonical life areas
-- ============================================================================
INSERT INTO life_areas (slug, name, description, icon, color) VALUES
  ('work-purpose', 'Work & Purpose', 'Your professional life and sense of meaning', '💼', '#3B82F6'),
  ('creativity-expression', 'Creativity & Expression', 'Your creative outlets and self-expression', '🎨', '#8B5CF6'),
  ('health-recovery', 'Health & Recovery', 'Physical and mental wellbeing', '🏃', '#10B981'),
  ('finance', 'Finance', 'Financial health and resource management', '💰', '#F59E0B'),
  ('intimacy', 'Intimacy', 'Close personal relationships and connection', '❤️', '#EF4444'),
  ('friendship', 'Friendship', 'Social connections and community', '🤝', '#06B6D4'),
  ('family', 'Family', 'Family relationships and responsibilities', '👨‍👩‍👧‍👦', '#EC4899'),
  ('spirituality-practice', 'Spirituality & Practice', 'Spiritual growth and practices', '🧘', '#9333EA'),
  ('education-growth', 'Education & Growth', 'Learning and personal development', '📚', '#6366F1'),
  ('adventure-travel', 'Adventure & Travel', 'Exploration and new experiences', '✈️', '#0EA5E9'),
  ('home-environment', 'Home & Environment', 'Living space and surroundings', '🏡', '#84CC16'),
  ('community-contribution', 'Community & Contribution', 'Service and community involvement', '🌍', '#14B8A6'),
  ('fun-recreation', 'Fun & Recreation', 'Leisure and enjoyment', '🎮', '#F97316')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  updated_at = now();

-- ============================================================================
-- Database Triggers for Automatic Mirroring
-- ============================================================================

-- Function to mirror contributions to fulfillment entries
CREATE OR REPLACE FUNCTION mirror_contribution_into_fulfillment()
RETURNS trigger AS $$
DECLARE
  work_id uuid;
  creat_id uuid;
  comm_id uuid;
  full_description text;
  meta_data jsonb;
BEGIN
  -- Get the IDs for target life areas
  SELECT id INTO work_id FROM life_areas WHERE slug = 'work-purpose';
  SELECT id INTO creat_id FROM life_areas WHERE slug = 'creativity-expression';
  SELECT id INTO comm_id FROM life_areas WHERE slug = 'community-contribution';

  -- Build description with impact
  full_description := COALESCE(NEW.description, '');
  IF NEW.impact IS NOT NULL AND NEW.impact != '' THEN
    full_description := full_description || E'\n\n🎯 Impact: ' || NEW.impact;
  END IF;
  IF NEW.commitment IS NOT NULL AND NEW.commitment != '' THEN
    full_description := full_description || E'\n\n✅ Commitment: ' || NEW.commitment;
  END IF;

  -- Build metadata
  meta_data := jsonb_build_object(
    'category', NEW.category,
    'bullets', NEW.contributions,
    'commitment', NEW.commitment,
    'impact', NEW.impact,
    'tags', COALESCE(NEW.tags, ARRAY[]::text[]),
    'mirrored_at', now(),
    'source', 'contribution_mirror'
  );

  -- Mirror to Work & Purpose
  INSERT INTO fulfillment_entries (
    user_id, life_area_id, source_type, source_id, 
    title, description, meta, priority
  )
  VALUES (
    NEW.user_id, work_id, 'contribution', NEW.id,
    NEW.title, full_description, meta_data, 4
  )
  ON CONFLICT (user_id, life_area_id, source_type, source_id) 
  DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    meta = EXCLUDED.meta,
    updated_at = now();

  -- Mirror to Creativity & Expression
  INSERT INTO fulfillment_entries (
    user_id, life_area_id, source_type, source_id,
    title, description, meta, priority
  )
  VALUES (
    NEW.user_id, creat_id, 'contribution', NEW.id,
    NEW.title, full_description, meta_data, 3
  )
  ON CONFLICT (user_id, life_area_id, source_type, source_id)
  DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    meta = EXCLUDED.meta,
    updated_at = now();

  -- Optionally mirror to Community & Contribution if it has community impact
  IF NEW.category = 'Doing' OR (NEW.tags IS NOT NULL AND 'community' = ANY(NEW.tags)) THEN
    INSERT INTO fulfillment_entries (
      user_id, life_area_id, source_type, source_id,
      title, description, meta, priority
    )
    VALUES (
      NEW.user_id, comm_id, 'contribution', NEW.id,
      NEW.title, full_description, meta_data, 3
    )
    ON CONFLICT (user_id, life_area_id, source_type, source_id)
    DO UPDATE SET
      title = EXCLUDED.title,
      description = EXCLUDED.description,
      meta = EXCLUDED.meta,
      updated_at = now();
  END IF;

  -- Log the mirroring event
  INSERT INTO audit_log (user_id, event_type, entity_type, entity_id, payload)
  VALUES (
    NEW.user_id,
    'contribution_mirrored',
    'contribution',
    NEW.id,
    jsonb_build_object(
      'title', NEW.title,
      'mirrored_to', ARRAY['work-purpose', 'creativity-expression'],
      'timestamp', now()
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update fulfillment entries when contribution is updated
CREATE OR REPLACE FUNCTION update_fulfillment_on_contribution_update()
RETURNS trigger AS $$
DECLARE
  full_description text;
  meta_data jsonb;
BEGIN
  -- Only proceed if relevant fields changed
  IF OLD.title = NEW.title AND 
     OLD.description IS NOT DISTINCT FROM NEW.description AND
     OLD.impact IS NOT DISTINCT FROM NEW.impact AND
     OLD.commitment IS NOT DISTINCT FROM NEW.commitment AND
     OLD.contributions::text = NEW.contributions::text THEN
    RETURN NEW;
  END IF;

  -- Build updated description
  full_description := COALESCE(NEW.description, '');
  IF NEW.impact IS NOT NULL AND NEW.impact != '' THEN
    full_description := full_description || E'\n\n🎯 Impact: ' || NEW.impact;
  END IF;
  IF NEW.commitment IS NOT NULL AND NEW.commitment != '' THEN
    full_description := full_description || E'\n\n✅ Commitment: ' || NEW.commitment;
  END IF;

  -- Build updated metadata
  meta_data := jsonb_build_object(
    'category', NEW.category,
    'bullets', NEW.contributions,
    'commitment', NEW.commitment,
    'impact', NEW.impact,
    'tags', COALESCE(NEW.tags, ARRAY[]::text[]),
    'last_mirrored', now(),
    'source', 'contribution_mirror'
  );

  -- Update all mirrored fulfillment entries
  UPDATE fulfillment_entries
  SET 
    title = NEW.title,
    description = full_description,
    meta = meta_data,
    updated_at = now()
  WHERE 
    source_type = 'contribution' 
    AND source_id = NEW.id
    AND user_id = NEW.user_id;

  -- Log the update
  INSERT INTO audit_log (user_id, event_type, entity_type, entity_id, payload)
  VALUES (
    NEW.user_id,
    'contribution_updated',
    'contribution',
    NEW.id,
    jsonb_build_object(
      'title', NEW.title,
      'changes', jsonb_build_object(
        'old_title', OLD.title,
        'new_title', NEW.title,
        'old_impact', OLD.impact,
        'new_impact', NEW.impact
      ),
      'timestamp', now()
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up fulfillment entries when contribution is deleted
CREATE OR REPLACE FUNCTION cleanup_fulfillment_on_contribution_delete()
RETURNS trigger AS $$
BEGIN
  -- Delete all mirrored fulfillment entries
  DELETE FROM fulfillment_entries
  WHERE source_type = 'contribution' 
    AND source_id = OLD.id
    AND user_id = OLD.user_id;

  -- Log the deletion
  INSERT INTO audit_log (user_id, event_type, entity_type, entity_id, payload)
  VALUES (
    OLD.user_id,
    'contribution_deleted',
    'contribution',
    OLD.id,
    jsonb_build_object(
      'title', OLD.title,
      'deleted_at', now()
    )
  );

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Create the triggers
-- ============================================================================

DROP TRIGGER IF EXISTS trg_contrib_mirror ON contributions;
CREATE TRIGGER trg_contrib_mirror
AFTER INSERT ON contributions
FOR EACH ROW EXECUTE FUNCTION mirror_contribution_into_fulfillment();

DROP TRIGGER IF EXISTS trg_contrib_update ON contributions;
CREATE TRIGGER trg_contrib_update
AFTER UPDATE ON contributions
FOR EACH ROW EXECUTE FUNCTION update_fulfillment_on_contribution_update();

DROP TRIGGER IF EXISTS trg_contrib_delete ON contributions;
CREATE TRIGGER trg_contrib_delete
BEFORE DELETE ON contributions
FOR EACH ROW EXECUTE FUNCTION cleanup_fulfillment_on_contribution_delete();

-- ============================================================================
-- Indexes for performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_contributions_user_id ON contributions(user_id);
CREATE INDEX IF NOT EXISTS idx_contributions_category ON contributions(category);
CREATE INDEX IF NOT EXISTS idx_contributions_created_at ON contributions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_fulfillment_entries_user_id ON fulfillment_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_fulfillment_entries_life_area_id ON fulfillment_entries(life_area_id);
CREATE INDEX IF NOT EXISTS idx_fulfillment_entries_source ON fulfillment_entries(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_fulfillment_entries_status ON fulfillment_entries(status);

CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_event_type ON audit_log(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at DESC);

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fulfillment_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE mirror_rules ENABLE ROW LEVEL SECURITY;

-- Contributions: Users can only see/modify their own
CREATE POLICY "Users can view own contributions" ON contributions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own contributions" ON contributions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contributions" ON contributions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own contributions" ON contributions
  FOR DELETE USING (auth.uid() = user_id);

-- Fulfillment entries: Users can only see/modify their own
CREATE POLICY "Users can view own fulfillment entries" ON fulfillment_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own fulfillment entries" ON fulfillment_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own fulfillment entries" ON fulfillment_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own fulfillment entries" ON fulfillment_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Audit log: Users can only see their own logs
CREATE POLICY "Users can view own audit logs" ON audit_log
  FOR SELECT USING (auth.uid() = user_id);

-- Mirror rules: Users can only see/modify their own rules
CREATE POLICY "Users can view own mirror rules" ON mirror_rules
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own mirror rules" ON mirror_rules
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mirror rules" ON mirror_rules
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- Helper functions for the application
-- ============================================================================

-- Function to backfill existing contributions (safe due to unique constraint)
CREATE OR REPLACE FUNCTION backfill_contributions_to_fulfillment()
RETURNS void AS $$
DECLARE
  contrib RECORD;
BEGIN
  FOR contrib IN SELECT * FROM contributions LOOP
    -- Trigger will handle the mirroring
    UPDATE contributions 
    SET updated_at = now() 
    WHERE id = contrib.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to get fulfillment entries with contribution details
CREATE OR REPLACE FUNCTION get_fulfillment_with_contributions(
  p_user_id uuid,
  p_life_area_slug text DEFAULT NULL
)
RETURNS TABLE (
  entry_id uuid,
  life_area_name text,
  life_area_slug text,
  title text,
  description text,
  source_type text,
  contribution_category text,
  contribution_bullets jsonb,
  priority integer,
  status text,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    fe.id as entry_id,
    la.name as life_area_name,
    la.slug as life_area_slug,
    fe.title,
    fe.description,
    fe.source_type,
    fe.meta->>'category' as contribution_category,
    fe.meta->'bullets' as contribution_bullets,
    fe.priority,
    fe.status,
    fe.created_at
  FROM fulfillment_entries fe
  JOIN life_areas la ON fe.life_area_id = la.id
  WHERE fe.user_id = p_user_id
    AND (p_life_area_slug IS NULL OR la.slug = p_life_area_slug)
  ORDER BY fe.priority DESC, fe.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Grant permissions
-- ============================================================================

GRANT ALL ON life_areas TO authenticated;
GRANT ALL ON contributions TO authenticated;
GRANT ALL ON fulfillment_entries TO authenticated;
GRANT ALL ON audit_log TO authenticated;
GRANT ALL ON mirror_rules TO authenticated;