-- HubSpot Integration Tables

-- Integration cursors for incremental sync
CREATE TABLE IF NOT EXISTS integration_cursors (
  object_type TEXT PRIMARY KEY,
  last_synced_at TIMESTAMPTZ,
  last_after TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick lookup
CREATE INDEX IF NOT EXISTS idx_integration_cursors_object_type ON integration_cursors(object_type);

-- Add HubSpot fields to contributions if they don't exist
ALTER TABLE contributions 
ADD COLUMN IF NOT EXISTS hubspot_id TEXT,
ADD COLUMN IF NOT EXISTS hubspot_object_type TEXT,
ADD COLUMN IF NOT EXISTS hubspot_event_type TEXT,
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';

-- Index for HubSpot ID lookups
CREATE INDEX IF NOT EXISTS idx_contributions_hubspot_id ON contributions(hubspot_id);
CREATE INDEX IF NOT EXISTS idx_contributions_source ON contributions(source);

-- Webhook event log for tracking
CREATE TABLE IF NOT EXISTS webhook_events (
  id SERIAL PRIMARY KEY,
  event_type TEXT NOT NULL,
  object_type TEXT NOT NULL,
  object_id TEXT NOT NULL,
  properties JSONB,
  status TEXT DEFAULT 'pending', -- pending, processed, failed
  error_message TEXT,
  received_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for webhook events
CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON webhook_events(status);
CREATE INDEX IF NOT EXISTS idx_webhook_events_object ON webhook_events(object_type, object_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_received ON webhook_events(received_at DESC);

-- Relationship tracking for HubSpot entities
CREATE TABLE IF NOT EXISTS hubspot_relationships (
  id SERIAL PRIMARY KEY,
  from_type TEXT NOT NULL,
  from_id TEXT NOT NULL,
  to_type TEXT NOT NULL,
  to_id TEXT NOT NULL,
  relationship_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(from_type, from_id, to_type, to_id, relationship_type)
);

-- Indexes for relationship queries
CREATE INDEX IF NOT EXISTS idx_hubspot_relationships_from ON hubspot_relationships(from_type, from_id);
CREATE INDEX IF NOT EXISTS idx_hubspot_relationships_to ON hubspot_relationships(to_type, to_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for integration_cursors
DROP TRIGGER IF EXISTS update_integration_cursors_updated_at ON integration_cursors;
CREATE TRIGGER update_integration_cursors_updated_at
  BEFORE UPDATE ON integration_cursors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for webhook_events
DROP TRIGGER IF EXISTS update_webhook_events_updated_at ON webhook_events;
CREATE TRIGGER update_webhook_events_updated_at
  BEFORE UPDATE ON webhook_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();