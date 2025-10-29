-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- CONTRIBUTION DISPLAY TABLES
-- =====================================================

CREATE TABLE contribution_displays (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    entries JSONB DEFAULT '[]'::jsonb,
    feedback JSONB DEFAULT '[]'::jsonb,
    visibility VARCHAR(20) DEFAULT 'private' CHECK (visibility IN ('private', 'circles', 'public')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contribution_displays_user_id ON contribution_displays(user_id);
CREATE INDEX idx_contribution_displays_visibility ON contribution_displays(visibility);

-- =====================================================
-- AUTOBIOGRAPHY TABLES
-- =====================================================

CREATE TABLE autobiographies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    events JSONB DEFAULT '[]'::jsonb,
    future_visions JSONB DEFAULT '[]'::jsonb,
    cultural_context JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_autobiographies_user_id ON autobiographies(user_id);

-- =====================================================
-- LEGACY VAULT TABLES
-- =====================================================

CREATE TABLE legacy_vaults (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    documents JSONB DEFAULT '[]'::jsonb,
    trustees JSONB DEFAULT '[]'::jsonb,
    backup_email VARCHAR(255),
    last_accessed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_legacy_vaults_user_id ON legacy_vaults(user_id);

-- Vault encryption keys (stored separately for security)
CREATE TABLE vault_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vault_id UUID NOT NULL UNIQUE REFERENCES legacy_vaults(id) ON DELETE CASCADE,
    encrypted_key TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Succession plans
CREATE TABLE succession_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    vault_id UUID NOT NULL REFERENCES legacy_vaults(id) ON DELETE CASCADE,
    instructions TEXT NOT NULL,
    emergency_contacts JSONB DEFAULT '[]'::jsonb,
    legal_documents JSONB DEFAULT '[]'::jsonb,
    digital_assets JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_succession_plans_user_id ON succession_plans(user_id);
CREATE INDEX idx_succession_plans_vault_id ON succession_plans(vault_id);

-- Export bundles
CREATE TABLE export_bundles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    vault_id UUID NOT NULL REFERENCES legacy_vaults(id) ON DELETE CASCADE,
    format VARCHAR(20) CHECK (format IN ('pdf', 'markdown', 'notion', 'json')),
    include_documents BOOLEAN DEFAULT false,
    include_metadata BOOLEAN DEFAULT false,
    encryption_password TEXT,
    qr_verification_code VARCHAR(255),
    download_url TEXT,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_export_bundles_user_id ON export_bundles(user_id);
CREATE INDEX idx_export_bundles_expires_at ON export_bundles(expires_at);

-- =====================================================
-- COMMUNITY HUB TABLES
-- =====================================================

CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) DEFAULT 'circle' CHECK (type IN ('circle', 'event', 'workshop', 'community')),
    visibility VARCHAR(20) DEFAULT 'private' CHECK (visibility IN ('private', 'invite_only', 'public')),
    creator_id UUID NOT NULL REFERENCES auth.users(id),
    max_members INTEGER DEFAULT 50,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_groups_creator_id ON groups(creator_id);
CREATE INDEX idx_groups_type ON groups(type);
CREATE INDEX idx_groups_visibility ON groups(visibility);

-- Group memberships
CREATE TABLE group_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'moderator', 'member')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_group_members_user_id ON group_members(user_id);

-- Group journals/threads
CREATE TABLE group_journals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    content TEXT NOT NULL,
    visibility VARCHAR(20) DEFAULT 'group' CHECK (visibility IN ('group', 'public')),
    tags TEXT[],
    reactions JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_group_journals_group_id ON group_journals(group_id);
CREATE INDEX idx_group_journals_author_id ON group_journals(author_id);

-- Events & Gatherings
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    host_id UUID NOT NULL REFERENCES auth.users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) CHECK (type IN ('gathering', 'workshop', 'circle', 'retreat')),
    location_type VARCHAR(20) CHECK (location_type IN ('online', 'in_person', 'hybrid')),
    location_details JSONB,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    max_attendees INTEGER,
    qr_code VARCHAR(255),
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_group_id ON events(group_id);
CREATE INDEX idx_events_host_id ON events(host_id);
CREATE INDEX idx_events_start_time ON events(start_time);

-- Event attendees
CREATE TABLE event_attendees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'cancelled')),
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    attended_at TIMESTAMPTZ,
    UNIQUE(event_id, user_id)
);

CREATE INDEX idx_event_attendees_event_id ON event_attendees(event_id);
CREATE INDEX idx_event_attendees_user_id ON event_attendees(user_id);

-- =====================================================
-- GAMIFICATION TABLES
-- =====================================================

CREATE TABLE user_streaks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'reset_ritual', 'journaling', 'contribution', etc.
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, type)
);

CREATE INDEX idx_user_streaks_user_id ON user_streaks(user_id);
CREATE INDEX idx_user_streaks_type ON user_streaks(type);

-- Badges & Achievements
CREATE TABLE badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon_url TEXT,
    category VARCHAR(50),
    criteria JSONB NOT NULL, -- conditions to earn the badge
    points INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    progress JSONB DEFAULT '{}'::jsonb,
    UNIQUE(user_id, badge_id)
);

CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_user_badges_badge_id ON user_badges(badge_id);

-- =====================================================
-- REMINDERS & NOTIFICATIONS
-- =====================================================

CREATE TABLE reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    target_id UUID,
    message TEXT NOT NULL,
    scheduled_for TIMESTAMPTZ NOT NULL,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reminders_user_id ON reminders(user_id);
CREATE INDEX idx_reminders_scheduled_for ON reminders(scheduled_for);
CREATE INDEX idx_reminders_sent_at ON reminders(sent_at);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- =====================================================
-- ANALYTICS TABLES
-- =====================================================

CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    properties JSONB DEFAULT '{}'::jsonb,
    session_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE contribution_displays ENABLE ROW LEVEL SECURITY;
ALTER TABLE autobiographies ENABLE ROW LEVEL SECURITY;
ALTER TABLE legacy_vaults ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE succession_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Contribution Displays policies
CREATE POLICY "Users can view own contribution displays" ON contribution_displays
    FOR SELECT USING (auth.uid() = user_id OR visibility = 'public');

CREATE POLICY "Users can create own contribution displays" ON contribution_displays
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contribution displays" ON contribution_displays
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own contribution displays" ON contribution_displays
    FOR DELETE USING (auth.uid() = user_id);

-- Autobiographies policies
CREATE POLICY "Users can view own autobiography" ON autobiographies
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own autobiography" ON autobiographies
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own autobiography" ON autobiographies
    FOR UPDATE USING (auth.uid() = user_id);

-- Legacy Vaults policies
CREATE POLICY "Users can view own vaults" ON legacy_vaults
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own vaults" ON legacy_vaults
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vaults" ON legacy_vaults
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own vaults" ON legacy_vaults
    FOR DELETE USING (auth.uid() = user_id);

-- Groups policies
CREATE POLICY "Users can view public groups or groups they're members of" ON groups
    FOR SELECT USING (
        visibility = 'public' OR 
        EXISTS (SELECT 1 FROM group_members WHERE group_id = groups.id AND user_id = auth.uid())
    );

CREATE POLICY "Users can create groups" ON groups
    FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Group admins can update groups" ON groups
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM group_members 
            WHERE group_id = groups.id 
            AND user_id = auth.uid() 
            AND role IN ('owner', 'admin')
        )
    );

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to tables
CREATE TRIGGER update_contribution_displays_updated_at BEFORE UPDATE ON contribution_displays
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_autobiographies_updated_at BEFORE UPDATE ON autobiographies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_legacy_vaults_updated_at BEFORE UPDATE ON legacy_vaults
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_succession_plans_updated_at BEFORE UPDATE ON succession_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_group_journals_updated_at BEFORE UPDATE ON group_journals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_streaks_updated_at BEFORE UPDATE ON user_streaks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update streak
CREATE OR REPLACE FUNCTION update_streak(
    p_user_id UUID,
    p_type VARCHAR(50)
) RETURNS void AS $$
DECLARE
    v_last_date DATE;
    v_current_streak INTEGER;
    v_longest_streak INTEGER;
BEGIN
    SELECT last_activity_date, current_streak, longest_streak
    INTO v_last_date, v_current_streak, v_longest_streak
    FROM user_streaks
    WHERE user_id = p_user_id AND type = p_type;

    IF NOT FOUND THEN
        INSERT INTO user_streaks (user_id, type, current_streak, longest_streak, last_activity_date)
        VALUES (p_user_id, p_type, 1, 1, CURRENT_DATE);
    ELSIF v_last_date = CURRENT_DATE THEN
        -- Already updated today
        RETURN;
    ELSIF v_last_date = CURRENT_DATE - INTERVAL '1 day' THEN
        -- Continuing streak
        v_current_streak := v_current_streak + 1;
        v_longest_streak := GREATEST(v_longest_streak, v_current_streak);
        
        UPDATE user_streaks
        SET current_streak = v_current_streak,
            longest_streak = v_longest_streak,
            last_activity_date = CURRENT_DATE
        WHERE user_id = p_user_id AND type = p_type;
    ELSE
        -- Streak broken, start over
        UPDATE user_streaks
        SET current_streak = 1,
            last_activity_date = CURRENT_DATE
        WHERE user_id = p_user_id AND type = p_type;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SEED DATA FOR BADGES
-- =====================================================

INSERT INTO badges (name, description, category, criteria, points) VALUES
('First Contribution', 'Created your first Contribution Display', 'contribution', '{"type": "contribution_created", "count": 1}', 10),
('Contribution Master', 'Created 10 Contribution Displays', 'contribution', '{"type": "contribution_created", "count": 10}', 100),
('Autobiography Beginner', 'Added your first life event', 'autobiography', '{"type": "autobiography_entry", "count": 1}', 10),
('Life Chronicler', 'Added 50 life events', 'autobiography', '{"type": "autobiography_entry", "count": 50}', 200),
('Reframe Master', 'Reframed 10 incidents', 'autobiography', '{"type": "reframe_completed", "count": 10}', 150),
('Vault Creator', 'Created your first Legacy Vault', 'legacy', '{"type": "vault_created", "count": 1}', 20),
('Trustee', 'Assigned as a trustee for someone', 'legacy', '{"type": "trustee_assigned", "count": 1}', 50),
('Community Builder', 'Created your first group', 'community', '{"type": "group_created", "count": 1}', 30),
('Event Host', 'Hosted your first event', 'community', '{"type": "event_hosted", "count": 1}', 40),
('7-Day Streak', 'Maintained a 7-day streak', 'streak', '{"type": "any_streak", "days": 7}', 25),
('30-Day Streak', 'Maintained a 30-day streak', 'streak', '{"type": "any_streak", "days": 30}', 100),
('100-Day Streak', 'Maintained a 100-day streak', 'streak', '{"type": "any_streak", "days": 100}', 500),
('Reset Warrior', 'Completed 30 reset rituals', 'wellness', '{"type": "reset_ritual", "count": 30}', 75),
('Journal Master', 'Written 100 journal entries', 'wellness', '{"type": "journal_entry", "count": 100}', 150),
('Future Visionary', 'Created visions for 3 future decades', 'autobiography', '{"type": "future_vision", "count": 3}', 60);