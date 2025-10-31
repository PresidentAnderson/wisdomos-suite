-- WisdomOS PostgreSQL Schema
-- Integrated relationship management system aligned with Fulfillment Display and Assessment Tools

-- === Core enums ===
CREATE TYPE interaction_channel AS ENUM (
  'call','sms','email','meeting','note','whatsapp','telegram','signal','messenger','other'
);
CREATE TYPE sentiment_label AS ENUM ('very_negative','negative','neutral','positive','very_positive');

-- === System housekeeping ===
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- === Contacts ===
CREATE TABLE contacts (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name     TEXT NOT NULL,
  last_name      TEXT NOT NULL,
  email          CITEXT,
  phone_e164     TEXT,                           -- store in +1XXXXXXXXXX format
  hubspot_id     TEXT,                           -- external CRM IDs (nullable)
  salesforce_id  TEXT,
  notes          TEXT,
  tags           TEXT[] DEFAULT '{}',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (email) DEFERRABLE INITIALLY DEFERRED    -- allow staged inserts, then enforce
);

CREATE INDEX contacts_name_idx ON contacts (last_name, first_name);
CREATE INDEX contacts_email_idx ON contacts (email);
CREATE INDEX contacts_phone_idx ON contacts (phone_e164);

-- keep updated_at fresh
CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER trg_contacts_updated BEFORE UPDATE ON contacts
FOR EACH ROW EXECUTE PROCEDURE touch_updated_at();

-- === Life Areas (13 areas from Fulfillment Display) ===
CREATE TABLE life_areas (
  id          SMALLINT PRIMARY KEY,
  name        TEXT UNIQUE NOT NULL,
  description TEXT
);

-- === Many-to-many Contact ↔ LifeArea links ===
CREATE TABLE contact_life_area_links (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id    UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  life_area_id  SMALLINT NOT NULL REFERENCES life_areas(id) ON DELETE CASCADE,
  role_label    TEXT,                  -- e.g., "partner", "therapist", "ops support"
  frequency     TEXT,                  -- e.g., "daily", "weekly", "monthly"
  weight        NUMERIC(5,2),          -- 0..100 or 0..1, your choice
  outcomes      TEXT,                  -- expected outcomes (freeform)
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (contact_id, life_area_id)
);
CREATE TRIGGER trg_cla_updated BEFORE UPDATE ON contact_life_area_links
FOR EACH ROW EXECUTE PROCEDURE touch_updated_at();

CREATE INDEX cla_contact_idx ON contact_life_area_links (contact_id);
CREATE INDEX cla_lifearea_idx ON contact_life_area_links (life_area_id);

-- === Interactions (for logging calls/emails/messages and AI analysis) ===
CREATE TABLE interactions (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id       UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  life_area_id     SMALLINT REFERENCES life_areas(id),
  occurred_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  channel          interaction_channel NOT NULL,
  direction        TEXT CHECK (direction IN ('inbound','outbound','internal')) DEFAULT 'internal',
  subject          TEXT,
  body_text        TEXT,
  body_html        TEXT,
  uri              TEXT,                         -- original source link (email id, message id)
  -- AI-derived fields (optional, fill later)
  sentiment        sentiment_label,
  sentiment_score  NUMERIC(4,3),                 -- e.g., -1..1 or 0..1
  topics           TEXT[],                       -- extracted topics/labels
  entities         JSONB,                        -- {people:[], orgs:[], ...}
  embeddings_vec   BYTEA,                        -- if you store raw vectors in PG (or use pgvector)
  meta             JSONB DEFAULT '{}'::jsonb,    -- any extra metadata
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX interactions_contact_idx ON interactions (contact_id, occurred_at DESC);
CREATE INDEX interactions_area_idx ON interactions (life_area_id, occurred_at DESC);

-- === Assessments (Landmark-style relationship ratings over time) ===
CREATE TABLE relationship_assessments (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id       UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  life_area_id     SMALLINT NOT NULL REFERENCES life_areas(id) ON DELETE CASCADE,
  assessed_on      DATE NOT NULL DEFAULT CURRENT_DATE,
  -- Model rows to match Google Sheet prompts (e.g., 1-5 scale)
  trust_score      NUMERIC(3,1),      -- 1..5
  communication    NUMERIC(3,1),      -- 1..5
  reliability      NUMERIC(3,1),
  alignment        NUMERIC(3,1),
  overall          NUMERIC(3,1),      -- computed or manually entered
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (contact_id, life_area_id, assessed_on)
);
CREATE INDEX ra_contact_area_idx ON relationship_assessments (contact_id, life_area_id, assessed_on DESC);

-- === Integrations (HubSpot, etc.) ===
CREATE TABLE integrations (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kind          TEXT NOT NULL CHECK (kind IN ('hubspot','salesforce','gmail','ms365','twilio','slack','custom')),
  status        TEXT NOT NULL CHECK (status IN ('connected','error','disabled')) DEFAULT 'connected',
  external_app  TEXT,                 -- app or instance name
  auth_meta     JSONB,                -- tokens, refresh, scopes (encrypt at app layer)
  settings      JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_integrations_updated BEFORE UPDATE ON integrations
FOR EACH ROW EXECUTE PROCEDURE touch_updated_at();

-- === Webhook ledger (optional) ===
CREATE TABLE integration_events (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  integration_id UUID REFERENCES integrations(id) ON DELETE SET NULL,
  received_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  event_type   TEXT,
  event_raw    JSONB,
  processed_ok BOOLEAN DEFAULT FALSE
);

-- === Autobiography Entries (from editable autobiography system) ===
CREATE TABLE autobiography_entries (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL,
  year                  INTEGER NOT NULL,
  title                 TEXT,
  narrative             TEXT,
  earliest_occurrence   JSONB,  -- {year: number, description: string}
  meaning               TEXT,
  insight               TEXT,
  commitment            TEXT,
  life_areas            TEXT[] DEFAULT '{}',
  tags                  TEXT[] DEFAULT '{}',
  emotional_charge      NUMERIC(3,1),
  category              TEXT,
  people                JSONB DEFAULT '[]'::jsonb,
  completion_status     TEXT DEFAULT 'draft',
  is_reframed           BOOLEAN DEFAULT FALSE,
  reframed_narrative    TEXT,
  version               INTEGER DEFAULT 1,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_dirty              BOOLEAN DEFAULT FALSE,
  last_auto_save        TIMESTAMPTZ,
  UNIQUE (user_id, year)
);

CREATE INDEX autobiography_user_year_idx ON autobiography_entries (user_id, year);
CREATE TRIGGER trg_autobiography_updated BEFORE UPDATE ON autobiography_entries
FOR EACH ROW EXECUTE PROCEDURE touch_updated_at();

-- === Autobiography Revisions ===
CREATE TABLE autobiography_revisions (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entry_id         UUID NOT NULL REFERENCES autobiography_entries(id) ON DELETE CASCADE,
  version          INTEGER NOT NULL,
  fields           JSONB NOT NULL,
  changed_fields   TEXT[] DEFAULT '{}',
  change_note      TEXT,
  edited_by        TEXT,
  edited_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX autobiography_revisions_entry_idx ON autobiography_revisions (entry_id, version DESC);