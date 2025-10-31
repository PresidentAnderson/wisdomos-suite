-- =============================================
-- Commitments Feature Migration
-- =============================================
-- This migration adds commitment tracking to WisdomOS
-- Commitments are promises/goals tied to life areas
-- =============================================

-- Create commitment status enum
CREATE TYPE commitment_status AS ENUM ('active', 'completed', 'paused', 'cancelled');

-- Create commitment size enum
CREATE TYPE commitment_size AS ENUM ('small', 'medium', 'large', 'epic');

-- Create commitments table
CREATE TABLE commitments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    life_area_id TEXT,
    
    -- Basic info
    title VARCHAR(255) NOT NULL,
    description TEXT,
    size commitment_size DEFAULT 'medium',
    status commitment_status DEFAULT 'active',
    
    -- Tracking
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    target_date TIMESTAMP WITH TIME ZONE,
    completed_date TIMESTAMP WITH TIME ZONE,
    
    -- Metrics
    effort_hours DECIMAL(10,2) DEFAULT 0,
    impact_score INTEGER DEFAULT 5 CHECK (impact_score >= 1 AND impact_score <= 10),
    priority INTEGER DEFAULT 3 CHECK (priority >= 1 AND priority <= 5),
    
    -- Relations
    parent_commitment_id UUID REFERENCES commitments(id) ON DELETE SET NULL,
    contribution_id TEXT,
    
    -- Metadata
    tags TEXT[],
    notes TEXT,
    reminder_frequency VARCHAR(50), -- daily, weekly, monthly
    next_reminder TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_life_area FOREIGN KEY (life_area_id) REFERENCES life_areas(id) ON DELETE SET NULL
);

-- Create commitment milestones table
CREATE TABLE commitment_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    commitment_id UUID NOT NULL REFERENCES commitments(id) ON DELETE CASCADE,
    
    title VARCHAR(255) NOT NULL,
    description TEXT,
    target_date TIMESTAMP WITH TIME ZONE,
    completed_date TIMESTAMP WITH TIME ZONE,
    is_completed BOOLEAN DEFAULT FALSE,
    order_index INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create commitment check-ins table
CREATE TABLE commitment_checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    commitment_id UUID NOT NULL REFERENCES commitments(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    
    progress INTEGER NOT NULL CHECK (progress >= 0 AND progress <= 100),
    mood INTEGER CHECK (mood >= 1 AND mood <= 10),
    energy INTEGER CHECK (energy >= 1 AND energy <= 10),
    
    notes TEXT,
    blockers TEXT[],
    wins TEXT[],
    
    checkin_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create commitment habits table (for recurring commitments)
CREATE TABLE commitment_habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    commitment_id UUID NOT NULL REFERENCES commitments(id) ON DELETE CASCADE,
    
    frequency VARCHAR(50) NOT NULL, -- daily, weekly, monthly
    specific_days INTEGER[], -- 0-6 for days of week, 1-31 for days of month
    time_of_day TIME,
    
    streak_current INTEGER DEFAULT 0,
    streak_best INTEGER DEFAULT 0,
    total_completions INTEGER DEFAULT 0,
    last_completed TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create commitment accountability partners
CREATE TABLE commitment_partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    commitment_id UUID NOT NULL REFERENCES commitments(id) ON DELETE CASCADE,
    partner_user_id TEXT NOT NULL,
    
    role VARCHAR(50) DEFAULT 'supporter', -- supporter, mentor, accountability
    can_view_progress BOOLEAN DEFAULT TRUE,
    can_send_reminders BOOLEAN DEFAULT FALSE,
    
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_commitments_user_id ON commitments(user_id);
CREATE INDEX idx_commitments_life_area_id ON commitments(life_area_id);
CREATE INDEX idx_commitments_status ON commitments(status);
CREATE INDEX idx_commitments_created_at ON commitments(created_at DESC);
CREATE INDEX idx_commitment_milestones_commitment_id ON commitment_milestones(commitment_id);
CREATE INDEX idx_commitment_checkins_commitment_id ON commitment_checkins(commitment_id);
CREATE INDEX idx_commitment_checkins_date ON commitment_checkins(checkin_date DESC);

-- Create function to update commitment progress based on milestones
CREATE OR REPLACE FUNCTION update_commitment_progress()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE commitments
    SET progress = (
        SELECT ROUND(
            (COUNT(CASE WHEN is_completed THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC) * 100
        )
        FROM commitment_milestones
        WHERE commitment_id = NEW.commitment_id
    ),
    updated_at = NOW()
    WHERE id = NEW.commitment_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for milestone completion
CREATE TRIGGER update_commitment_on_milestone_change
AFTER INSERT OR UPDATE ON commitment_milestones
FOR EACH ROW
EXECUTE FUNCTION update_commitment_progress();

-- Create function to auto-complete commitment when progress reaches 100
CREATE OR REPLACE FUNCTION auto_complete_commitment()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.progress = 100 AND NEW.status = 'active' THEN
        NEW.status = 'completed';
        NEW.completed_date = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-completion
CREATE TRIGGER auto_complete_on_progress
BEFORE UPDATE ON commitments
FOR EACH ROW
WHEN (NEW.progress = 100)
EXECUTE FUNCTION auto_complete_commitment();

-- Create function to create contribution when commitment is completed
CREATE OR REPLACE FUNCTION create_contribution_from_commitment()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        -- Insert into contributions table
        INSERT INTO contributions (
            id,
            user_id,
            category,
            title,
            description,
            contributions,
            impact,
            commitment,
            tags,
            visibility,
            created_at
        )
        VALUES (
            gen_random_uuid()::text,
            NEW.user_id,
            'Doing',
            'Completed: ' || NEW.title,
            'Successfully completed commitment: ' || COALESCE(NEW.description, NEW.title),
            ARRAY['Achieved commitment', 'Followed through on promise'],
            'Personal growth through commitment completion',
            'Continue setting and achieving meaningful goals',
            COALESCE(NEW.tags, ARRAY[]::text[]),
            'private',
            NOW()
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for contribution creation
CREATE TRIGGER create_contribution_on_completion
AFTER UPDATE ON commitments
FOR EACH ROW
WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
EXECUTE FUNCTION create_contribution_from_commitment();

-- Add RLS policies
ALTER TABLE commitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE commitment_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE commitment_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE commitment_habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE commitment_partners ENABLE ROW LEVEL SECURITY;

-- User can only see their own commitments
CREATE POLICY commitments_user_policy ON commitments
    FOR ALL USING (user_id = current_user_id());

CREATE POLICY milestones_user_policy ON commitment_milestones
    FOR ALL USING (
        commitment_id IN (
            SELECT id FROM commitments WHERE user_id = current_user_id()
        )
    );

CREATE POLICY checkins_user_policy ON commitment_checkins
    FOR ALL USING (user_id = current_user_id());

CREATE POLICY habits_user_policy ON commitment_habits
    FOR ALL USING (
        commitment_id IN (
            SELECT id FROM commitments WHERE user_id = current_user_id()
        )
    );

CREATE POLICY partners_user_policy ON commitment_partners
    FOR ALL USING (
        commitment_id IN (
            SELECT id FROM commitments WHERE user_id = current_user_id()
        )
        OR partner_user_id = current_user_id()
    );

-- Insert sample commitment templates
INSERT INTO commitments (user_id, title, description, size, tags) VALUES
('system', 'Daily Meditation', 'Practice mindfulness meditation for inner peace', 'small', ARRAY['wellness', 'mindfulness']),
('system', 'Learn New Skill', 'Dedicate time to learning and mastering a new skill', 'large', ARRAY['growth', 'learning']),
('system', 'Exercise Routine', 'Maintain regular physical activity for health', 'medium', ARRAY['health', 'fitness']),
('system', 'Read Books Monthly', 'Read at least one book per month', 'medium', ARRAY['learning', 'growth'])
ON CONFLICT DO NOTHING;