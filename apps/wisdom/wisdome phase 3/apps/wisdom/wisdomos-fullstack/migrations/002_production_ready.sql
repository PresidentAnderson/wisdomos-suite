-- === WisdomOS Production-Ready Migration ===
-- This migration creates the complete schema for contact management, 
-- life areas, interactions, and assessments with HubSpot sync support

-- === Extensions ===
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS citext;

-- === Enums ===
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'interaction_channel') THEN
    CREATE TYPE interaction_channel AS ENUM (
      'call','sms','email','meeting','note','whatsapp','telegram','signal','messenger','other'
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sentiment_label') THEN
    CREATE TYPE sentiment_label AS ENUM ('very_negative','negative','neutral','positive','very_positive');
  END IF;
END $$;

-- === Trigger helper ===
CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;

-- === Drop existing tables if needed (be careful in production!) ===
-- Uncomment these lines only if you want to reset everything
-- DROP TABLE IF EXISTS integration_events CASCADE;
-- DROP TABLE IF EXISTS integrations CASCADE;
-- DROP TABLE IF EXISTS relationship_assessments CASCADE;
-- DROP TABLE IF EXISTS interactions CASCADE;
-- DROP TABLE IF EXISTS contact_life_area_links CASCADE;
-- DROP TABLE IF EXISTS life_areas CASCADE;
-- DROP TABLE IF EXISTS contacts CASCADE;

-- === Core: contacts ===
CREATE TABLE IF NOT EXISTS contacts (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name     TEXT NOT NULL,
  last_name      TEXT NOT NULL,
  email          CITEXT,
  phone_e164     TEXT,                -- store in +1XXXXXXXXXX
  hubspot_id     TEXT,
  salesforce_id  TEXT,
  notes          TEXT,
  tags           TEXT[] DEFAULT '{}',
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT email_unique UNIQUE (email) DEFERRABLE INITIALLY DEFERRED
);
CREATE INDEX IF NOT EXISTS contacts_name_idx  ON contacts (last_name, first_name);
CREATE INDEX IF NOT EXISTS contacts_email_idx ON contacts (email);
CREATE INDEX IF NOT EXISTS contacts_phone_idx ON contacts (phone_e164);
CREATE TRIGGER trg_contacts_updated BEFORE UPDATE ON contacts
FOR EACH ROW EXECUTE PROCEDURE touch_updated_at();

-- === Life areas (13) from your Fulfillment Display ===
CREATE TABLE IF NOT EXISTS life_areas (
  id          smallint PRIMARY KEY,
  name        TEXT UNIQUE NOT NULL,
  icon        TEXT,
  description TEXT
);

-- === Link: contact ↔ life_area (many-to-many) ===
CREATE TABLE IF NOT EXISTS contact_life_area_links (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id    UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  life_area_id  smallint NOT NULL REFERENCES life_areas(id) ON DELETE CASCADE,
  role_label    TEXT,
  frequency     TEXT,               -- 'daily', 'weekly', 'monthly', 'as-needed'
  weight        NUMERIC(5,2),       -- 0..1 or 0..100 (pick one and stick to it)
  outcomes      TEXT,
  notes         TEXT,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (contact_id, life_area_id)
);
CREATE INDEX IF NOT EXISTS cla_contact_idx   ON contact_life_area_links (contact_id);
CREATE INDEX IF NOT EXISTS cla_lifearea_idx  ON contact_life_area_links (life_area_id);
CREATE TRIGGER trg_cla_updated BEFORE UPDATE ON contact_life_area_links
FOR EACH ROW EXECUTE PROCEDURE touch_updated_at();

-- === Interactions (for logging calls/emails/messages and AI analysis) ===
CREATE TABLE IF NOT EXISTS interactions (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id       UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  life_area_id     smallint REFERENCES life_areas(id),
  occurred_at      timestamptz NOT NULL DEFAULT now(),
  channel          interaction_channel NOT NULL,
  direction        TEXT CHECK (direction IN ('inbound','outbound','internal')) DEFAULT 'internal',
  subject          TEXT,
  body_text        TEXT,
  body_html        TEXT,
  uri              TEXT,               -- external message id, email id, etc.
  sentiment        sentiment_label,
  sentiment_score  NUMERIC(4,3),       -- e.g. -1..1 or 0..1, pick a convention
  topics           TEXT[],
  entities         JSONB,
  embeddings_vec   BYTEA,              -- or use pgvector if you enable it
  meta             JSONB DEFAULT '{}'::jsonb,
  created_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS interactions_contact_idx ON interactions (contact_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS interactions_area_idx    ON interactions (life_area_id, occurred_at DESC);

-- === Assessments (Landmark-style relationship ratings over time) ===
CREATE TABLE IF NOT EXISTS relationship_assessments (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id       UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  life_area_id     smallint NOT NULL REFERENCES life_areas(id) ON DELETE CASCADE,
  assessed_on      DATE NOT NULL DEFAULT CURRENT_DATE,
  trust_score      NUMERIC(3,1) CHECK (trust_score IS NULL OR (trust_score >= 1 AND trust_score <= 5)),
  communication    NUMERIC(3,1) CHECK (communication IS NULL OR (communication >= 1 AND communication <= 5)),
  reliability      NUMERIC(3,1) CHECK (reliability IS NULL OR (reliability >= 1 AND reliability <= 5)),
  openness         NUMERIC(3,1) CHECK (openness IS NULL OR (openness >= 1 AND openness <= 5)),
  growth           NUMERIC(3,1) CHECK (growth IS NULL OR (growth >= 1 AND growth <= 5)),
  reciprocity      NUMERIC(3,1) CHECK (reciprocity IS NULL OR (reciprocity >= 1 AND reciprocity <= 5)),
  alignment        NUMERIC(3,1) CHECK (alignment IS NULL OR (alignment >= 1 AND alignment <= 5)),
  overall          NUMERIC(3,1),
  notes            TEXT,
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (contact_id, life_area_id, assessed_on)
);
CREATE INDEX IF NOT EXISTS ra_contact_area_idx ON relationship_assessments (contact_id, life_area_id, assessed_on DESC);

-- Optional: compute overall if NULL as rounded avg of sub-scores
CREATE OR REPLACE FUNCTION compute_overall() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.overall IS NULL THEN
    DECLARE
      score_sum NUMERIC := 0;
      score_count INT := 0;
    BEGIN
      IF NEW.trust_score IS NOT NULL THEN
        score_sum := score_sum + NEW.trust_score;
        score_count := score_count + 1;
      END IF;
      IF NEW.communication IS NOT NULL THEN
        score_sum := score_sum + NEW.communication;
        score_count := score_count + 1;
      END IF;
      IF NEW.reliability IS NOT NULL THEN
        score_sum := score_sum + NEW.reliability;
        score_count := score_count + 1;
      END IF;
      IF NEW.openness IS NOT NULL THEN
        score_sum := score_sum + NEW.openness;
        score_count := score_count + 1;
      END IF;
      IF NEW.growth IS NOT NULL THEN
        score_sum := score_sum + NEW.growth;
        score_count := score_count + 1;
      END IF;
      IF NEW.reciprocity IS NOT NULL THEN
        score_sum := score_sum + NEW.reciprocity;
        score_count := score_count + 1;
      END IF;
      IF NEW.alignment IS NOT NULL THEN
        score_sum := score_sum + NEW.alignment;
        score_count := score_count + 1;
      END IF;
      
      IF score_count > 0 THEN
        NEW.overall := ROUND(score_sum / score_count, 1);
      END IF;
    END;
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ra_overall ON relationship_assessments;
CREATE TRIGGER trg_ra_overall BEFORE INSERT OR UPDATE
ON relationship_assessments FOR EACH ROW EXECUTE PROCEDURE compute_overall();

-- === Integrations (HubSpot, etc.) ===
CREATE TABLE IF NOT EXISTS integrations (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kind          TEXT NOT NULL CHECK (kind IN ('hubspot','salesforce','gmail','ms365','twilio','slack','custom')),
  status        TEXT NOT NULL CHECK (status IN ('connected','error','disabled')) DEFAULT 'connected',
  external_app  TEXT,
  auth_meta     JSONB,
  settings      JSONB,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_integrations_updated BEFORE UPDATE ON integrations
FOR EACH ROW EXECUTE PROCEDURE touch_updated_at();

-- Webhook ledger (optional)
CREATE TABLE IF NOT EXISTS integration_events (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  integration_id UUID REFERENCES integrations(id) ON DELETE SET NULL,
  received_at    timestamptz NOT NULL DEFAULT now(),
  event_type     TEXT,
  event_raw      JSONB,
  processed_ok   BOOLEAN DEFAULT FALSE
);

-- === Seed: 13 life areas (from your Fulfillment Display) ===
INSERT INTO life_areas (id, name, icon, description) VALUES
(1,'Work & Purpose','💼','PVT Hostel, Meta-Agent, JSF, StudioNYNE'),
(2,'Health','❤️','Recovery, vitality, mobility'),
(3,'Finance','💰','Wealth strategy, clean records'),
(4,'Intimacy & Love','💕','Relationship with Djamel'),
(5,'Time & Energy Management','⏰','Focus blocks, pacing'),
(6,'Spiritual Alignment','✨','Inner guidance, sacred silence'),
(7,'Creativity & Expression','🎨','Writing, design, media'),
(8,'Friendship & Community','👥','Non-transactional support'),
(9,'Learning & Growth','📚','Tech, social justice, systems thinking'),
(10,'Home & Environment','🏡','Space comfort, order'),
(11,'Sexuality','🔥','Exploration, embodiment'),
(12,'Emotional Regulation & Inner Child','🧘','Reparenting, emotional clarity'),
(13,'Legacy & Archives','📜','Preservation/access to body of work')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description;

-- === Seed: Example contacts from Fulfillment Display ===
-- Note: These are examples, replace with actual data
INSERT INTO contacts (first_name, last_name, notes, tags) VALUES
('Djamel', '', 'Partner across intimacy, health, spirituality, sexuality', ARRAY['partner','core']),
('Michael', '', 'Friend / operations reflection', ARRAY['friend','ops']),
('Zied', '', 'Tactical & design insight', ARRAY['friend','design']),
('Therapist', '(Name)', 'Professional support: emotional & intimacy', ARRAY['professional','therapy']),
('Accountant', '(Name)', 'Finance advisor', ARRAY['professional','finance']),
('Bank', 'Advisor', 'Banking support', ARRAY['professional','finance']),
('Legal', 'Support', 'Dispute/legal support', ARRAY['professional','legal'])
ON CONFLICT (email) DO NOTHING;

-- === Link contacts to life areas (examples) ===
-- Djamel - multiple areas
WITH djamel AS (SELECT id FROM contacts WHERE first_name = 'Djamel' LIMIT 1)
INSERT INTO contact_life_area_links (contact_id, life_area_id, role_label, frequency, weight, outcomes)
SELECT d.id, la.id, 
  CASE 
    WHEN la.id = 4 THEN 'partner'
    WHEN la.id = 2 THEN 'support'
    WHEN la.id = 6 THEN 'companion'
    WHEN la.id = 11 THEN 'partner'
  END,
  'daily', 
  CASE 
    WHEN la.id = 4 THEN 0.9
    WHEN la.id = 2 THEN 0.7
    WHEN la.id = 6 THEN 0.6
    WHEN la.id = 11 THEN 0.8
  END,
  CASE la.id
    WHEN 4 THEN 'Presence, honesty, shared vision'
    WHEN 2 THEN 'Meal/rest support & encouragement'
    WHEN 6 THEN 'Occasional spiritual dialogue'
    WHEN 11 THEN 'Embodiment/erotic safety'
  END
FROM djamel d, life_areas la 
WHERE la.id IN (2,4,6,11)
ON CONFLICT (contact_id, life_area_id) DO NOTHING;

-- Michael - Work & Community
WITH michael AS (SELECT id FROM contacts WHERE first_name = 'Michael' LIMIT 1)
INSERT INTO contact_life_area_links (contact_id, life_area_id, role_label, frequency, weight, outcomes)
SELECT m.id, la.id, 
  CASE 
    WHEN la.id = 1 THEN 'ops support'
    WHEN la.id = 8 THEN 'friend'
  END,
  'weekly', 0.6,
  CASE la.id
    WHEN 1 THEN 'Tasks & ops reflection'
    WHEN 8 THEN 'Friendship balance'
  END
FROM michael m, life_areas la 
WHERE la.id IN (1,8)
ON CONFLICT (contact_id, life_area_id) DO NOTHING;

-- Therapist - Emotional & Intimacy
WITH therapist AS (SELECT id FROM contacts WHERE first_name = 'Therapist' LIMIT 1)
INSERT INTO contact_life_area_links (contact_id, life_area_id, role_label, frequency, weight, outcomes)
SELECT t.id, la.id, 'therapist', 'weekly', 0.7,
  CASE la.id
    WHEN 12 THEN 'Reparenting/clarity'
    WHEN 4 THEN 'Intimacy unpacking'
  END
FROM therapist t, life_areas la 
WHERE la.id IN (12,4)
ON CONFLICT (contact_id, life_area_id) DO NOTHING;

-- Finance contacts
WITH finance_contacts AS (
  SELECT id, first_name FROM contacts 
  WHERE first_name IN ('Accountant', 'Bank', 'Legal')
)
INSERT INTO contact_life_area_links (contact_id, life_area_id, role_label, frequency, weight, outcomes)
SELECT fc.id, 3, -- Finance area
  CASE fc.first_name
    WHEN 'Accountant' THEN 'accountant'
    WHEN 'Bank' THEN 'bank advisor'
    WHEN 'Legal' THEN 'legal support'
  END,
  CASE fc.first_name
    WHEN 'Accountant' THEN 'monthly'
    WHEN 'Bank' THEN 'quarterly'
    WHEN 'Legal' THEN 'as-needed'
  END,
  CASE fc.first_name
    WHEN 'Accountant' THEN 0.6
    WHEN 'Bank' THEN 0.4
    WHEN 'Legal' THEN 0.3
  END,
  CASE fc.first_name
    WHEN 'Accountant' THEN 'Planning & clean records'
    WHEN 'Bank' THEN 'Cashflow options'
    WHEN 'Legal' THEN 'Dispute resolution'
  END
FROM finance_contacts fc
ON CONFLICT (contact_id, life_area_id) DO NOTHING;

-- === Create views for easy reporting ===

-- View: Contact summary with life areas
CREATE OR REPLACE VIEW v_contact_summary AS
SELECT 
  c.id,
  c.first_name,
  c.last_name,
  c.email,
  c.phone_e164,
  c.hubspot_id,
  c.tags,
  c.notes,
  COALESCE(
    string_agg(
      DISTINCT la.name || ' (' || cla.role_label || ')',
      ', ' ORDER BY la.id
    ),
    'No areas linked'
  ) as life_areas,
  COUNT(DISTINCT cla.life_area_id) as area_count,
  MAX(cla.weight) as max_weight
FROM contacts c
LEFT JOIN contact_life_area_links cla ON c.id = cla.contact_id
LEFT JOIN life_areas la ON cla.life_area_id = la.id
GROUP BY c.id, c.first_name, c.last_name, c.email, c.phone_e164, c.hubspot_id, c.tags, c.notes;

-- View: Latest assessment per contact/area
CREATE OR REPLACE VIEW v_latest_assessments AS
WITH ranked_assessments AS (
  SELECT 
    ra.*,
    c.first_name,
    c.last_name,
    la.name as life_area_name,
    ROW_NUMBER() OVER (
      PARTITION BY ra.contact_id, ra.life_area_id 
      ORDER BY ra.assessed_on DESC
    ) as rn
  FROM relationship_assessments ra
  JOIN contacts c ON ra.contact_id = c.id
  JOIN life_areas la ON ra.life_area_id = la.id
)
SELECT * FROM ranked_assessments WHERE rn = 1;

-- View: Interaction frequency by contact and area
CREATE OR REPLACE VIEW v_interaction_frequency AS
SELECT 
  c.id as contact_id,
  c.first_name,
  c.last_name,
  la.name as life_area,
  COUNT(*) as interaction_count,
  MAX(i.occurred_at) as last_interaction,
  DATE_PART('day', NOW() - MAX(i.occurred_at)) as days_since_last
FROM interactions i
JOIN contacts c ON i.contact_id = c.id
LEFT JOIN life_areas la ON i.life_area_id = la.id
WHERE i.occurred_at > NOW() - INTERVAL '90 days'
GROUP BY c.id, c.first_name, c.last_name, la.name
ORDER BY interaction_count DESC;

-- === Grant permissions (adjust for your user) ===
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO your_app_user;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO your_app_user;