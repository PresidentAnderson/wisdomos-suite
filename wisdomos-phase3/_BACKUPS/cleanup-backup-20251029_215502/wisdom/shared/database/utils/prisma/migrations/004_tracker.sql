-- =============================================
-- Visual Tracker Feature Migration
-- =============================================
-- Color-coded tracker for life areas across months
-- =============================================

-- Create status enum for tracker
CREATE TYPE tracker_status AS ENUM ('green', 'yellow', 'red');

-- Create life area tracking table
CREATE TABLE life_area_tracker (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    life_area_id TEXT NOT NULL,
    life_area_name VARCHAR(255) NOT NULL,
    order_index INTEGER DEFAULT 999,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_life_area FOREIGN KEY (life_area_id) REFERENCES life_areas(id) ON DELETE CASCADE,
    CONSTRAINT unique_user_area UNIQUE (user_id, life_area_id)
);

-- Create monthly status tracking table
CREATE TABLE life_area_status (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    tracker_id INTEGER NOT NULL,
    year INTEGER NOT NULL CHECK (year >= 2000 AND year <= 2100),
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    status tracker_status NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_tracker FOREIGN KEY (tracker_id) REFERENCES life_area_tracker(id) ON DELETE CASCADE,
    CONSTRAINT unique_user_tracker_period UNIQUE (user_id, tracker_id, year, month)
);

-- Create indexes for performance
CREATE INDEX idx_life_area_tracker_user_id ON life_area_tracker(user_id);
CREATE INDEX idx_life_area_tracker_order ON life_area_tracker(user_id, order_index);
CREATE INDEX idx_life_area_status_user_period ON life_area_status(user_id, year, month);
CREATE INDEX idx_life_area_status_tracker ON life_area_status(tracker_id);

-- Function to auto-update status from events
CREATE OR REPLACE FUNCTION auto_update_tracker_from_event()
RETURNS TRIGGER AS $$
DECLARE
    v_tracker_id INTEGER;
    v_year INTEGER;
    v_month INTEGER;
    v_status tracker_status;
BEGIN
    -- Get or create tracker entry
    INSERT INTO life_area_tracker (user_id, life_area_id, life_area_name, order_index)
    SELECT 
        NEW.user_id,
        COALESCE(la.id, 'custom-' || NEW.life_area_name),
        NEW.life_area_name,
        COALESCE(la.order_index, 999)
    FROM life_areas la
    WHERE la.user_id = NEW.user_id 
    AND la.name = NEW.life_area_name
    ON CONFLICT (user_id, life_area_id) DO UPDATE
    SET updated_at = NOW()
    RETURNING id INTO v_tracker_id;

    -- Extract year and month
    v_year := EXTRACT(YEAR FROM NEW.created_at);
    v_month := EXTRACT(MONTH FROM NEW.created_at);
    
    -- Determine status based on contribution
    v_status := CASE
        WHEN NEW.impact_score >= 7 THEN 'green'::tracker_status
        WHEN NEW.impact_score >= 4 THEN 'yellow'::tracker_status
        ELSE 'red'::tracker_status
    END;
    
    -- Upsert status
    INSERT INTO life_area_status (user_id, tracker_id, year, month, status)
    VALUES (NEW.user_id, v_tracker_id, v_year, v_month, v_status)
    ON CONFLICT (user_id, tracker_id, year, month) 
    DO UPDATE SET 
        status = v_status,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update tracker on contribution
CREATE TRIGGER update_tracker_on_contribution
AFTER INSERT OR UPDATE ON contributions
FOR EACH ROW
EXECUTE FUNCTION auto_update_tracker_from_event();

-- Function to update tracker from fulfillment entries
CREATE OR REPLACE FUNCTION update_tracker_from_fulfillment()
RETURNS TRIGGER AS $$
DECLARE
    v_tracker_id INTEGER;
    v_year INTEGER;
    v_month INTEGER;
    v_status tracker_status;
    v_life_area_name VARCHAR(255);
BEGIN
    -- Get life area name
    SELECT name INTO v_life_area_name
    FROM life_areas
    WHERE id = NEW.life_area_id;
    
    -- Get or create tracker entry
    INSERT INTO life_area_tracker (user_id, life_area_id, life_area_name, order_index)
    VALUES (NEW.user_id, NEW.life_area_id, v_life_area_name, NEW.priority_score)
    ON CONFLICT (user_id, life_area_id) DO UPDATE
    SET updated_at = NOW()
    RETURNING id INTO v_tracker_id;
    
    -- Extract year and month
    v_year := EXTRACT(YEAR FROM NEW.created_at);
    v_month := EXTRACT(MONTH FROM NEW.created_at);
    
    -- Determine status based on score
    v_status := CASE
        WHEN NEW.priority_score >= 4 THEN 'green'::tracker_status
        WHEN NEW.priority_score >= 3 THEN 'yellow'::tracker_status
        ELSE 'red'::tracker_status
    END;
    
    -- Upsert status
    INSERT INTO life_area_status (user_id, tracker_id, year, month, status)
    VALUES (NEW.user_id, v_tracker_id, v_year, v_month, v_status)
    ON CONFLICT (user_id, tracker_id, year, month) 
    DO UPDATE SET 
        status = CASE 
            WHEN life_area_status.status = 'red' AND v_status = 'green' THEN 'yellow'::tracker_status
            WHEN life_area_status.status = 'green' AND v_status = 'red' THEN 'yellow'::tracker_status
            ELSE v_status
        END,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update tracker on fulfillment
CREATE TRIGGER update_tracker_on_fulfillment
AFTER INSERT OR UPDATE ON fulfillment_entries
FOR EACH ROW
EXECUTE FUNCTION update_tracker_from_fulfillment();

-- Add Music Production to canonical life areas if not exists
INSERT INTO life_area_canonical (slug, name, description, default_order)
VALUES (
    'music-production',
    'Music Production',
    'Creative expression through music composition, production, and sound design',
    14
) ON CONFLICT (slug) DO NOTHING;

-- RLS policies
ALTER TABLE life_area_tracker ENABLE ROW LEVEL SECURITY;
ALTER TABLE life_area_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY tracker_user_policy ON life_area_tracker
    FOR ALL USING (user_id = current_user_id());

CREATE POLICY status_user_policy ON life_area_status
    FOR ALL USING (user_id = current_user_id());

-- Seed initial tracker data for existing life areas
INSERT INTO life_area_tracker (user_id, life_area_id, life_area_name, order_index)
SELECT DISTINCT 
    la.user_id,
    la.id,
    la.name,
    la.order_index
FROM life_areas la
ON CONFLICT DO NOTHING;