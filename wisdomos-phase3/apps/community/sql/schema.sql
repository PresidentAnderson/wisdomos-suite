-- WisdomOS Community Hub Database Schema
-- This file contains the complete database schema for Supabase

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret-here';

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles with gamification data
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    bio TEXT,
    location TEXT,
    website TEXT,
    wisdom_level INTEGER DEFAULT 1,
    contribution_points INTEGER DEFAULT 0,
    streak_count INTEGER DEFAULT 0,
    badges JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wisdom circles (groups/communities)
CREATE TABLE public.wisdom_circles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    creator_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    privacy_level TEXT CHECK (privacy_level IN ('public', 'private', 'invite-only')) DEFAULT 'public',
    member_count INTEGER DEFAULT 0,
    tags JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Circle memberships
CREATE TABLE public.circle_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    circle_id UUID NOT NULL REFERENCES public.wisdom_circles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('member', 'moderator', 'admin')) DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(circle_id, user_id)
);

-- Contributions (posts, content shared in circles)
CREATE TABLE public.contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    circle_id UUID REFERENCES public.wisdom_circles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    media_urls JSONB DEFAULT '[]'::jsonb,
    tags JSONB DEFAULT '[]'::jsonb,
    feedback_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    visibility TEXT CHECK (visibility IN ('public', 'circle', 'private')) DEFAULT 'public',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Boundary audit tool data
CREATE TABLE public.boundary_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT CHECK (category IN ('personal', 'professional', 'family', 'social')),
    current_boundary TEXT NOT NULL,
    desired_boundary TEXT NOT NULL,
    action_steps JSONB DEFAULT '[]'::jsonb,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    status TEXT CHECK (status IN ('draft', 'active', 'completed')) DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Upset documentation tool data
CREATE TABLE public.upset_documentations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    trigger_event TEXT NOT NULL,
    emotional_response TEXT NOT NULL,
    underlying_values JSONB DEFAULT '[]'::jsonb,
    reframe_perspective TEXT,
    action_items JSONB DEFAULT '[]'::jsonb,
    learned_wisdom TEXT,
    status TEXT CHECK (status IN ('processing', 'resolved', 'archived')) DEFAULT 'processing',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fulfillment display tool data
CREATE TABLE public.fulfillment_displays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    fulfillment_areas JSONB DEFAULT '[]'::jsonb,
    goals JSONB DEFAULT '[]'::jsonb,
    achievements JSONB DEFAULT '[]'::jsonb,
    reflection TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User achievements for gamification
CREATE TABLE public.user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    achievement_type TEXT NOT NULL,
    achievement_name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Autobiography timeline entries
CREATE TABLE public.autobiography_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    date_occurred DATE NOT NULL,
    description TEXT NOT NULL,
    emotional_impact INTEGER CHECK (emotional_impact BETWEEN 1 AND 10),
    life_area TEXT NOT NULL,
    lessons_learned JSONB DEFAULT '[]'::jsonb,
    reframe_notes TEXT,
    media_urls JSONB DEFAULT '[]'::jsonb,
    is_milestone BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX idx_circle_memberships_user_id ON public.circle_memberships(user_id);
CREATE INDEX idx_circle_memberships_circle_id ON public.circle_memberships(circle_id);
CREATE INDEX idx_contributions_user_id ON public.contributions(user_id);
CREATE INDEX idx_contributions_circle_id ON public.contributions(circle_id);
CREATE INDEX idx_contributions_created_at ON public.contributions(created_at DESC);
CREATE INDEX idx_boundary_audits_user_id ON public.boundary_audits(user_id);
CREATE INDEX idx_upset_documentations_user_id ON public.upset_documentations(user_id);
CREATE INDEX idx_fulfillment_displays_user_id ON public.fulfillment_displays(user_id);
CREATE INDEX idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX idx_autobiography_entries_user_id ON public.autobiography_entries(user_id);
CREATE INDEX idx_autobiography_entries_date ON public.autobiography_entries(date_occurred DESC);

-- Row Level Security (RLS) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wisdom_circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boundary_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upset_documentations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fulfillment_displays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.autobiography_entries ENABLE ROW LEVEL SECURITY;

-- Users can view their own data
CREATE POLICY "Users can view own data" ON public.users
    FOR ALL USING (auth.uid() = id);

-- User profiles
CREATE POLICY "Users can manage own profile" ON public.user_profiles
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public can view profiles" ON public.user_profiles
    FOR SELECT USING (true);

-- Wisdom circles
CREATE POLICY "Users can view public circles" ON public.wisdom_circles
    FOR SELECT USING (privacy_level = 'public');

CREATE POLICY "Users can manage own circles" ON public.wisdom_circles
    FOR ALL USING (auth.uid() = creator_id);

-- Circle memberships
CREATE POLICY "Users can view own memberships" ON public.circle_memberships
    FOR ALL USING (auth.uid() = user_id);

-- Contributions
CREATE POLICY "Users can manage own contributions" ON public.contributions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view public contributions" ON public.contributions
    FOR SELECT USING (visibility = 'public');

-- Tool-specific policies (users can only access their own data)
CREATE POLICY "Users can manage own boundary audits" ON public.boundary_audits
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own upset docs" ON public.upset_documentations
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own fulfillment displays" ON public.fulfillment_displays
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own achievements" ON public.user_achievements
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own autobiography" ON public.autobiography_entries
    FOR ALL USING (auth.uid() = user_id);

-- Functions for updating updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wisdom_circles_updated_at BEFORE UPDATE ON public.wisdom_circles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contributions_updated_at BEFORE UPDATE ON public.contributions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_boundary_audits_updated_at BEFORE UPDATE ON public.boundary_audits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_upset_documentations_updated_at BEFORE UPDATE ON public.upset_documentations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fulfillment_displays_updated_at BEFORE UPDATE ON public.fulfillment_displays FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_autobiography_entries_updated_at BEFORE UPDATE ON public.autobiography_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();