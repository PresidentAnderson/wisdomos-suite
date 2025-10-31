-- =====================================================
-- CREATE WISDOMOS TABLES
-- =====================================================

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 2. Life Areas table
CREATE TABLE IF NOT EXISTS life_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phoenix_name TEXT,
    description TEXT,
    color TEXT,
    icon TEXT,
    status TEXT DEFAULT 'active',
    score INTEGER DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Journal Entries table
CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT,
    mood TEXT,
    type TEXT DEFAULT 'journal',
    tags TEXT[] DEFAULT '{}',
    linked_life_areas UUID[] DEFAULT '{}',
    reset_ritual_applied BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 4. Contributions table (Being/Doing/Having)
CREATE TABLE IF NOT EXISTS contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    external_id TEXT UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('being', 'doing', 'having')),
    title TEXT NOT NULL,
    description TEXT,
    entity TEXT,
    entity_id TEXT,
    properties JSONB DEFAULT '{}'::jsonb,
    associations JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'active',
    source TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    synced_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 5. Fulfillment Scores table
CREATE TABLE IF NOT EXISTS fulfillment_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    life_area_id UUID REFERENCES life_areas(id) ON DELETE CASCADE,
    score DECIMAL(3,1) CHECK (score >= 0 AND score <= 10),
    contributions UUID[] DEFAULT '{}',
    measured_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 6. HubSpot Sync Status table
CREATE TABLE IF NOT EXISTS hubspot_sync (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    last_synced_at TIMESTAMPTZ,
    sync_status TEXT DEFAULT 'pending',
    error_message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(entity_type, entity_id)
);

-- 7. Commitments table
CREATE TABLE IF NOT EXISTS commitments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    life_area_id UUID REFERENCES life_areas(id),
    status TEXT DEFAULT 'active',
    due_date DATE,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 8. Monthly Audits table
CREATE TABLE IF NOT EXISTS monthly_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    life_area_scores JSONB DEFAULT '{}'::jsonb,
    total_score DECIMAL(4,1),
    insights TEXT,
    boundaries_set TEXT[],
    celebrations TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,
    UNIQUE(user_id, month, year)
);

-- 9. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_created_at ON journal_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contributions_user_id ON contributions(user_id);
CREATE INDEX IF NOT EXISTS idx_contributions_external_id ON contributions(external_id);
CREATE INDEX IF NOT EXISTS idx_contributions_type ON contributions(type);
CREATE INDEX IF NOT EXISTS idx_life_areas_user_id ON life_areas(user_id);
CREATE INDEX IF NOT EXISTS idx_fulfillment_scores_user_id ON fulfillment_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_fulfillment_scores_life_area_id ON fulfillment_scores(life_area_id);
CREATE INDEX IF NOT EXISTS idx_hubspot_sync_entity ON hubspot_sync(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_commitments_user_id ON commitments(user_id);
CREATE INDEX IF NOT EXISTS idx_commitments_status ON commitments(status);

-- 10. Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 11. Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_life_areas_updated_at BEFORE UPDATE ON life_areas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at BEFORE UPDATE ON journal_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contributions_updated_at BEFORE UPDATE ON contributions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hubspot_sync_updated_at BEFORE UPDATE ON hubspot_sync
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_commitments_updated_at BEFORE UPDATE ON commitments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 12. Insert default life areas for new users
CREATE OR REPLACE FUNCTION create_default_life_areas()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO life_areas (user_id, name, phoenix_name, color, icon) VALUES
    (NEW.id, 'Health & Vitality', 'Phoenix of Vitality', '#ef4444', 'heart'),
    (NEW.id, 'Career & Purpose', 'Phoenix of Purpose', '#f59e0b', 'briefcase'),
    (NEW.id, 'Relationships', 'Phoenix of Connection', '#ec4899', 'users'),
    (NEW.id, 'Finance & Resources', 'Phoenix of Abundance', '#10b981', 'dollar-sign'),
    (NEW.id, 'Personal Growth', 'Phoenix of Wisdom', '#8b5cf6', 'book'),
    (NEW.id, 'Recreation & Joy', 'Phoenix of Joy', '#06b6d4', 'smile'),
    (NEW.id, 'Environment', 'Phoenix of Sanctuary', '#6366f1', 'home'),
    (NEW.id, 'Community & Contribution', 'Phoenix of Service', '#f97316', 'gift');
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER create_user_life_areas AFTER INSERT ON users
    FOR EACH ROW EXECUTE FUNCTION create_default_life_areas();

-- 13. Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- 14. Verify setup
SELECT 
    'WisdomOS Database Setup Complete!' as status,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') as table_count,
    NOW() as completed_at;