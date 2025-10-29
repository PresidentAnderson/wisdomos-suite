-- WisdomOS Production Migration
-- Complete relationship management system with HubSpot integration support

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

-- === Life areas (13) from Fulfillment Display ===
CREATE TABLE IF NOT EXISTS life_areas (
  id          smallint PRIMARY KEY,
  name        TEXT UNIQUE NOT NULL,
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
  trust_score      NUMERIC(3,1),
  communication    NUMERIC(3,1),
  reliability      NUMERIC(3,1),
  alignment        NUMERIC(3,1),
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
    NEW.overall := ROUND((
      COALESCE(NEW.trust_score,0) +
      COALESCE(NEW.communication,0) +
      COALESCE(NEW.reliability,0) +
      COALESCE(NEW.alignment,0)
    ) / NULLIF( (CASE WHEN NEW.trust_score IS NOT NULL THEN 1 ELSE 0 END +
                 CASE WHEN NEW.communication IS NOT NULL THEN 1 ELSE 0 END +
                 CASE WHEN NEW.reliability IS NOT NULL THEN 1 ELSE 0 END +
                 CASE WHEN NEW.alignment IS NOT NULL THEN 1 ELSE 0 END), 0 )::numeric, 1);
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

-- === Seed: 13 life areas (from Fulfillment Display) ===
INSERT INTO life_areas (id, name, description) VALUES
(1,'Work & Purpose','PVT Hostel, Meta-Agent, JSF, StudioNYNE'),
(2,'Health','Recovery, vitality, mobility'),
(3,'Finance','Wealth strategy, clean records'),
(4,'Intimacy & Love','Relationship with Djamel'),
(5,'Time & Energy Management','Focus blocks, pacing'),
(6,'Spiritual Alignment','Inner guidance, sacred silence'),
(7,'Creativity & Expression','Writing, design, media'),
(8,'Friendship & Community','Non-transactional support'),
(9,'Learning & Growth','Tech, social justice, systems thinking'),
(10,'Home & Environment','Space comfort, order'),
(11,'Sexuality','Exploration, embodiment'),
(12,'Emotional Regulation & Inner Child','Reparenting, emotional clarity'),
(13,'Legacy & Archives','Preservation/access to body of work')
ON CONFLICT (id) DO NOTHING;