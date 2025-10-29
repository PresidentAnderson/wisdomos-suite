-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- CORE WISDOMOS TABLES
-- =====================================================

-- Life Areas table
CREATE TABLE life_areas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phoenix_name VARCHAR(255),
    status VARCHAR(10) DEFAULT 'GREEN' CHECK (status IN ('GREEN', 'YELLOW', 'RED')),
    score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_life_areas_user_id ON life_areas(user_id);
CREATE INDEX idx_life_areas_sort_order ON life_areas(sort_order);

-- Journals table
CREATE TABLE journals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    life_area_id UUID REFERENCES life_areas(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    upset_detected BOOLEAN DEFAULT FALSE,
    ai_reframe TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_journals_user_id ON journals(user_id);
CREATE INDEX idx_journals_life_area_id ON journals(life_area_id);
CREATE INDEX idx_journals_created_at ON journals(created_at);
CREATE INDEX idx_journals_upset_detected ON journals(upset_detected);

-- Assessments table
CREATE TABLE assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    questions JSONB DEFAULT '[]'::jsonb,
    responses JSONB DEFAULT '{}'::jsonb,
    score INTEGER,
    insights TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_assessments_user_id ON assessments(user_id);
CREATE INDEX idx_assessments_type ON assessments(type);

-- Contacts table
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    relationship VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contacts_user_id ON contacts(user_id);
CREATE INDEX idx_contacts_name ON contacts(name);

-- Priority Items table
CREATE TABLE priority_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    life_area_id UUID REFERENCES life_areas(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(10) DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_priority_items_user_id ON priority_items(user_id);
CREATE INDEX idx_priority_items_life_area_id ON priority_items(life_area_id);
CREATE INDEX idx_priority_items_status ON priority_items(status);
CREATE INDEX idx_priority_items_priority ON priority_items(priority);

-- Upset Inquiries table
CREATE TABLE upset_inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    journal_id UUID REFERENCES journals(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    situation TEXT NOT NULL,
    feelings JSONB DEFAULT '[]'::jsonb,
    thoughts JSONB DEFAULT '[]'::jsonb,
    reframes JSONB DEFAULT '[]'::jsonb,
    actions JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'IN_PROGRESS', 'COMPLETED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_upset_inquiries_user_id ON upset_inquiries(user_id);
CREATE INDEX idx_upset_inquiries_journal_id ON upset_inquiries(journal_id);
CREATE INDEX idx_upset_inquiries_status ON upset_inquiries(status);

-- User Profiles table (extended user info)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name VARCHAR(255),
    avatar_url TEXT,
    bio TEXT,
    timezone VARCHAR(50) DEFAULT 'UTC',
    preferences JSONB DEFAULT '{}'::jsonb,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE life_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE priority_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE upset_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Life Areas policies
CREATE POLICY "Users can view own life areas" ON life_areas
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own life areas" ON life_areas
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own life areas" ON life_areas
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own life areas" ON life_areas
    FOR DELETE USING (auth.uid() = user_id);

-- Journals policies
CREATE POLICY "Users can view own journals" ON journals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own journals" ON journals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journals" ON journals
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own journals" ON journals
    FOR DELETE USING (auth.uid() = user_id);

-- Assessments policies
CREATE POLICY "Users can view own assessments" ON assessments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own assessments" ON assessments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assessments" ON assessments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own assessments" ON assessments
    FOR DELETE USING (auth.uid() = user_id);

-- Contacts policies
CREATE POLICY "Users can view own contacts" ON contacts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own contacts" ON contacts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contacts" ON contacts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own contacts" ON contacts
    FOR DELETE USING (auth.uid() = user_id);

-- Priority Items policies
CREATE POLICY "Users can view own priority items" ON priority_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own priority items" ON priority_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own priority items" ON priority_items
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own priority items" ON priority_items
    FOR DELETE USING (auth.uid() = user_id);

-- Upset Inquiries policies
CREATE POLICY "Users can view own upset inquiries" ON upset_inquiries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own upset inquiries" ON upset_inquiries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own upset inquiries" ON upset_inquiries
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own upset inquiries" ON upset_inquiries
    FOR DELETE USING (auth.uid() = user_id);

-- User Profiles policies
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

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
CREATE TRIGGER update_life_areas_updated_at BEFORE UPDATE ON life_areas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journals_updated_at BEFORE UPDATE ON journals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON assessments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_priority_items_updated_at BEFORE UPDATE ON priority_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_upset_inquiries_updated_at BEFORE UPDATE ON upset_inquiries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create default life areas for new users
CREATE OR REPLACE FUNCTION create_default_life_areas()
RETURNS TRIGGER AS $$
DECLARE
    life_area_names TEXT[] := ARRAY[
        'Sacred Relationship',
        'Physical Temple', 
        'Soul Purpose Work',
        'Creative Expression',
        'Mind & Learning',
        'Family Constellation',
        'Tribe & Community',
        'Financial Flow',
        'Home Sanctuary',
        'Life Adventure',
        'Spiritual Path',
        'Service & Contribution',
        'Joy & Celebration'
    ];
    area_name TEXT;
    sort_idx INTEGER := 0;
BEGIN
    -- Create user profile
    INSERT INTO user_profiles (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Create default life areas
    FOREACH area_name IN ARRAY life_area_names
    LOOP
        INSERT INTO life_areas (user_id, name, phoenix_name, sort_order)
        VALUES (
            NEW.id, 
            area_name, 
            'Your ' || area_name || ' Fire',
            sort_idx
        );
        sort_idx := sort_idx + 1;
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create default data for new users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_default_life_areas();