-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
ALTER DATABASE postgres SET row_security = on;

-- Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    owner_id UUID NOT NULL,
    plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'premium', 'enterprise')),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar TEXT,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- Add foreign key constraint for organizations.owner_id after users table exists
ALTER TABLE organizations ADD CONSTRAINT organizations_owner_id_fkey 
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE RESTRICT;

-- Create contacts table (unified contact system)
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    avatar TEXT,
    categories TEXT[] DEFAULT '{}',
    role TEXT,
    relationship_status TEXT DEFAULT 'green' CHECK (relationship_status IN ('green', 'yellow', 'red')),
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_contact_at TIMESTAMP WITH TIME ZONE
);

-- Create life_areas table
CREATE TABLE IF NOT EXISTS life_areas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phoenix_name TEXT NOT NULL,
    color TEXT NOT NULL,
    position JSONB NOT NULL DEFAULT '{"x": 0, "y": 0}',
    size INTEGER DEFAULT 75,
    fulfillment_score REAL DEFAULT 5.0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contact_life_area_links table (key table for unified contact system)
CREATE TABLE IF NOT EXISTS contact_life_area_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    life_area_id UUID NOT NULL REFERENCES life_areas(id) ON DELETE CASCADE,
    influence_score REAL DEFAULT 5.0,
    relationship_type TEXT,
    frequency INTEGER DEFAULT 5,
    position JSONB DEFAULT '{"x": 0, "y": 0}',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(contact_id, life_area_id)
);

-- Create journal_entries table
CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    mood TEXT,
    tags TEXT[] DEFAULT '{}',
    is_private BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create upset_inquiries table
CREATE TABLE IF NOT EXISTS upset_inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    upset_description TEXT NOT NULL,
    trigger_event TEXT,
    body_sensations TEXT,
    emotions_felt TEXT,
    stories_told TEXT,
    actions_taken TEXT,
    insights_gained TEXT,
    resolution_status TEXT DEFAULT 'pending' CHECK (resolution_status IN ('pending', 'in_progress', 'resolved')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create priority_items table
CREATE TABLE IF NOT EXISTS priority_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    importance INTEGER NOT NULL CHECK (importance >= 1 AND importance <= 10),
    urgency INTEGER NOT NULL CHECK (urgency >= 1 AND urgency <= 10),
    quadrant INTEGER NOT NULL CHECK (quadrant IN (1, 2, 3, 4)),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contributions table
CREATE TABLE IF NOT EXISTS contributions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    impact_level INTEGER DEFAULT 5 CHECK (impact_level >= 1 AND impact_level <= 10),
    beneficiaries TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed', 'paused')),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create autobiography_events table
CREATE TABLE IF NOT EXISTS autobiography_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    event_date DATE NOT NULL,
    event_type TEXT NOT NULL,
    life_stage TEXT NOT NULL,
    emotional_impact INTEGER DEFAULT 5 CHECK (emotional_impact >= 1 AND emotional_impact <= 10),
    lessons_learned TEXT,
    people_involved TEXT[] DEFAULT '{}',
    location TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create analytics_data table
CREATE TABLE IF NOT EXISTS analytics_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    data_type TEXT NOT NULL,
    data_value JSONB NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_contacts_organization_id ON contacts(organization_id);
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_categories ON contacts USING gin(categories);
CREATE INDEX IF NOT EXISTS idx_life_areas_organization_id ON life_areas(organization_id);
CREATE INDEX IF NOT EXISTS idx_life_areas_user_id ON life_areas(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_life_area_links_contact_id ON contact_life_area_links(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_life_area_links_life_area_id ON contact_life_area_links(life_area_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_organization_id ON journal_entries(organization_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_tags ON journal_entries USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_upset_inquiries_organization_id ON upset_inquiries(organization_id);
CREATE INDEX IF NOT EXISTS idx_upset_inquiries_user_id ON upset_inquiries(user_id);
CREATE INDEX IF NOT EXISTS idx_priority_items_organization_id ON priority_items(organization_id);
CREATE INDEX IF NOT EXISTS idx_priority_items_user_id ON priority_items(user_id);
CREATE INDEX IF NOT EXISTS idx_priority_items_quadrant ON priority_items(quadrant);
CREATE INDEX IF NOT EXISTS idx_contributions_organization_id ON contributions(organization_id);
CREATE INDEX IF NOT EXISTS idx_contributions_user_id ON contributions(user_id);
CREATE INDEX IF NOT EXISTS idx_autobiography_events_organization_id ON autobiography_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_autobiography_events_user_id ON autobiography_events(user_id);
CREATE INDEX IF NOT EXISTS idx_autobiography_events_event_date ON autobiography_events(event_date);
CREATE INDEX IF NOT EXISTS idx_analytics_data_organization_id ON analytics_data(organization_id);
CREATE INDEX IF NOT EXISTS idx_analytics_data_user_id ON analytics_data(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_data_type ON analytics_data(data_type);
CREATE INDEX IF NOT EXISTS idx_analytics_data_timestamp ON analytics_data(timestamp);

-- Enable Row Level Security on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE life_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_life_area_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE upset_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE priority_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE autobiography_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Organizations
CREATE POLICY "Users can view their organization" ON organizations
    FOR SELECT USING (
        id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Organization owners can update their organization" ON organizations
    FOR UPDATE USING (
        owner_id = auth.uid()
    );

-- RLS Policies for Users
CREATE POLICY "Users can view users in their organization" ON users
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (id = auth.uid());

-- RLS Policies for Contacts (multi-tenant with sharing)
CREATE POLICY "Users can view contacts in their organization" ON contacts
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can create contacts in their organization" ON contacts
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
        AND user_id = auth.uid()
    );

CREATE POLICY "Contact owners and admins can update contacts" ON contacts
    FOR UPDATE USING (
        user_id = auth.uid() OR 
        organization_id IN (
            SELECT organization_id FROM users 
            WHERE id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Contact owners and admins can delete contacts" ON contacts
    FOR DELETE USING (
        user_id = auth.uid() OR 
        organization_id IN (
            SELECT organization_id FROM users 
            WHERE id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- RLS Policies for Life Areas
CREATE POLICY "Users can view life areas in their organization" ON life_areas
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can create life areas in their organization" ON life_areas
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
        AND user_id = auth.uid()
    );

CREATE POLICY "Life area owners can update their life areas" ON life_areas
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Life area owners can delete their life areas" ON life_areas
    FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for Contact Life Area Links
CREATE POLICY "Users can view contact-life area links in their organization" ON contact_life_area_links
    FOR SELECT USING (
        contact_id IN (
            SELECT id FROM contacts WHERE organization_id IN (
                SELECT organization_id FROM users WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can create contact-life area links" ON contact_life_area_links
    FOR INSERT WITH CHECK (
        contact_id IN (
            SELECT id FROM contacts WHERE organization_id IN (
                SELECT organization_id FROM users WHERE id = auth.uid()
            )
        )
        AND life_area_id IN (
            SELECT id FROM life_areas WHERE organization_id IN (
                SELECT organization_id FROM users WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can update contact-life area links" ON contact_life_area_links
    FOR UPDATE USING (
        contact_id IN (
            SELECT id FROM contacts WHERE organization_id IN (
                SELECT organization_id FROM users WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can delete contact-life area links" ON contact_life_area_links
    FOR DELETE USING (
        contact_id IN (
            SELECT id FROM contacts WHERE organization_id IN (
                SELECT organization_id FROM users WHERE id = auth.uid()
            )
        )
    );

-- RLS Policies for Journal Entries
CREATE POLICY "Users can view their journal entries and shared ones" ON journal_entries
    FOR SELECT USING (
        user_id = auth.uid() OR 
        (is_private = false AND organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        ))
    );

CREATE POLICY "Users can create journal entries in their organization" ON journal_entries
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
        AND user_id = auth.uid()
    );

CREATE POLICY "Users can update their own journal entries" ON journal_entries
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own journal entries" ON journal_entries
    FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for Upset Inquiries
CREATE POLICY "Users can view their own upset inquiries" ON upset_inquiries
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create upset inquiries in their organization" ON upset_inquiries
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
        AND user_id = auth.uid()
    );

CREATE POLICY "Users can update their own upset inquiries" ON upset_inquiries
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own upset inquiries" ON upset_inquiries
    FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for Priority Items
CREATE POLICY "Users can view their own priority items" ON priority_items
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create priority items in their organization" ON priority_items
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
        AND user_id = auth.uid()
    );

CREATE POLICY "Users can update their own priority items" ON priority_items
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own priority items" ON priority_items
    FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for Contributions
CREATE POLICY "Users can view contributions in their organization" ON contributions
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can create contributions in their organization" ON contributions
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
        AND user_id = auth.uid()
    );

CREATE POLICY "Contribution owners can update their contributions" ON contributions
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Contribution owners can delete their contributions" ON contributions
    FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for Autobiography Events
CREATE POLICY "Users can view their own autobiography events" ON autobiography_events
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create autobiography events in their organization" ON autobiography_events
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
        AND user_id = auth.uid()
    );

CREATE POLICY "Users can update their own autobiography events" ON autobiography_events
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own autobiography events" ON autobiography_events
    FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for Analytics Data
CREATE POLICY "Users can view analytics data in their organization" ON analytics_data
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can create analytics data in their organization" ON analytics_data
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
        AND user_id = auth.uid()
    );

-- Function to automatically update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_life_areas_updated_at BEFORE UPDATE ON life_areas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contact_life_area_links_updated_at BEFORE UPDATE ON contact_life_area_links FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_journal_entries_updated_at BEFORE UPDATE ON journal_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_upset_inquiries_updated_at BEFORE UPDATE ON upset_inquiries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_priority_items_updated_at BEFORE UPDATE ON priority_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contributions_updated_at BEFORE UPDATE ON contributions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_autobiography_events_updated_at BEFORE UPDATE ON autobiography_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();