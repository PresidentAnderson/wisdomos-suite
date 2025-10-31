-- === Core enums ===
CREATE TYPE interaction_channel AS ENUM (
  'call','sms','email','meeting','note','whatsapp','telegram','signal','messenger','other'
);
CREATE TYPE sentiment_label AS ENUM ('very_negative','negative','neutral','positive','very_positive');

-- === System housekeeping ===
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";

-- === Users (for auth) ===
CREATE TABLE users (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email        CITEXT UNIQUE NOT NULL,
  name         TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- === Contacts ===
CREATE TABLE contacts (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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
  UNIQUE (user_id, email) DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX contacts_user_idx ON contacts (user_id);
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
  icon        TEXT,
  description TEXT
);

-- === Many-to-many Contact ↔ LifeArea links ===
CREATE TABLE contact_life_area_links (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  contact_id    UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  life_area_id  SMALLINT NOT NULL REFERENCES life_areas(id) ON DELETE CASCADE,
  role_label    TEXT,                  -- e.g., "partner", "therapist", "ops support"
  frequency     TEXT,                  -- e.g., "daily", "weekly", "monthly"
  weight        NUMERIC(5,2),          -- 0..100 or 0..1
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
CREATE INDEX cla_user_idx ON contact_life_area_links (user_id);

-- === Contributions (Identity Layer) ===
CREATE TABLE contributions (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type      TEXT CHECK (type IN ('strength','acknowledgment','natural','quote')),
  title     TEXT NOT NULL,
  content   TEXT,
  source    TEXT,
  tags      TEXT[] DEFAULT '{}',
  color     TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX contributions_user_idx ON contributions (user_id);
CREATE TRIGGER trg_contributions_updated BEFORE UPDATE ON contributions
FOR EACH ROW EXECUTE PROCEDURE touch_updated_at();

-- === Autobiography Entries (Timeline Layer) ===
CREATE TABLE autobiography_entries (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  year        INT NOT NULL,
  title       TEXT,
  narrative   TEXT,
  earliest    TEXT,     -- earliest similar occurrence
  insight     TEXT,     -- what I made it mean
  commitment  TEXT,     -- new way of being
  life_areas  SMALLINT[] DEFAULT '{}', -- array of life_area ids
  tags        TEXT[] DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, year)
);

CREATE INDEX autobiography_user_year_idx ON autobiography_entries (user_id, year);
CREATE TRIGGER trg_autobiography_updated BEFORE UPDATE ON autobiography_entries
FOR EACH ROW EXECUTE PROCEDURE touch_updated_at();

-- === Fulfillment Areas (Commitments Map) ===
CREATE TABLE fulfillment_areas (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  life_area_id SMALLINT NOT NULL REFERENCES life_areas(id),
  status      TEXT CHECK (status IN ('thriving','attention','collapse')) DEFAULT 'thriving',
  attention   INT CHECK (attention >= 0 AND attention <= 100),
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, life_area_id)
);

CREATE INDEX fulfillment_user_idx ON fulfillment_areas (user_id);
CREATE TRIGGER trg_fulfillment_updated BEFORE UPDATE ON fulfillment_areas
FOR EACH ROW EXECUTE PROCEDURE touch_updated_at();

-- === Commitments ===
CREATE TABLE commitments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  area_id     UUID NOT NULL REFERENCES fulfillment_areas(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  outcome     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX commitments_user_idx ON commitments (user_id);
CREATE INDEX commitments_area_idx ON commitments (area_id);
CREATE TRIGGER trg_commitments_updated BEFORE UPDATE ON commitments
FOR EACH ROW EXECUTE PROCEDURE touch_updated_at();

-- === Interactions (for logging calls/emails/messages and AI analysis) ===
CREATE TABLE interactions (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  contact_id       UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  life_area_id     SMALLINT REFERENCES life_areas(id),
  occurred_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  channel          interaction_channel NOT NULL,
  direction        TEXT CHECK (direction IN ('inbound','outbound','internal')) DEFAULT 'internal',
  subject          TEXT,
  body_text        TEXT,
  body_html        TEXT,
  uri              TEXT,                         -- original source link
  -- AI-derived fields (optional)
  sentiment        sentiment_label,
  sentiment_score  NUMERIC(4,3),                 -- e.g., -1..1 or 0..1
  topics           TEXT[],                       -- extracted topics/labels
  entities         JSONB,                        -- {people:[], orgs:[], ...}
  meta             JSONB DEFAULT '{}'::jsonb,    -- any extra metadata
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX interactions_user_idx ON interactions (user_id);
CREATE INDEX interactions_contact_idx ON interactions (contact_id, occurred_at DESC);
CREATE INDEX interactions_area_idx ON interactions (life_area_id, occurred_at DESC);

-- === Relationship Assessments (Analytics Layer) ===
CREATE TABLE relationship_assessments (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  contact_id       UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  life_area_id     SMALLINT NOT NULL REFERENCES life_areas(id) ON DELETE CASCADE,
  assessed_on      DATE NOT NULL DEFAULT CURRENT_DATE,
  -- Landmark-style scores (1-5 scale)
  trust_score      NUMERIC(3,1) CHECK (trust_score >= 1 AND trust_score <= 5),
  communication    NUMERIC(3,1) CHECK (communication >= 1 AND communication <= 5),
  reliability      NUMERIC(3,1) CHECK (reliability >= 1 AND reliability <= 5),
  openness         NUMERIC(3,1) CHECK (openness >= 1 AND openness <= 5),
  growth           NUMERIC(3,1) CHECK (growth >= 1 AND growth <= 5),
  reciprocity      NUMERIC(3,1) CHECK (reciprocity >= 1 AND reciprocity <= 5),
  alignment        NUMERIC(3,1) CHECK (alignment >= 1 AND alignment <= 5),
  overall          NUMERIC(3,1), -- computed or manually entered
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, contact_id, life_area_id, assessed_on)
);

CREATE INDEX ra_user_idx ON relationship_assessments (user_id);
CREATE INDEX ra_contact_area_idx ON relationship_assessments (contact_id, life_area_id, assessed_on DESC);

-- === Boundary Audits ===
CREATE TABLE boundary_audits (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  life_area_id SMALLINT REFERENCES life_areas(id),
  timestamp   TIMESTAMPTZ NOT NULL DEFAULT now(),
  incident    TEXT NOT NULL,
  response    TEXT,
  learning    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX boundary_audits_user_idx ON boundary_audits (user_id, timestamp DESC);

-- === Seed Life Areas ===
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