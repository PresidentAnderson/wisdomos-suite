-- =====================================================
-- ADD FULFILLMENT DISPLAY V5 TABLES
-- =====================================================

-- 1. Create DimensionName enum type
DO $$ BEGIN
    CREATE TYPE dimension_name AS ENUM ('BEING', 'DOING', 'HAVING', 'RELATING', 'BECOMING');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Subdomains table (Creative, Operational, Strategic)
CREATE TABLE IF NOT EXISTS subdomains (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    tenant_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    life_area_id BIGINT REFERENCES life_areas(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Dimensions table (BEING, DOING, HAVING, RELATING, BECOMING)
CREATE TABLE IF NOT EXISTS dimensions (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    tenant_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subdomain_id BIGINT REFERENCES subdomains(id) ON DELETE CASCADE,
    name dimension_name NOT NULL,
    focus TEXT NOT NULL,
    inquiry TEXT NOT NULL,
    practices TEXT[] DEFAULT '{}',
    metric INTEGER CHECK (metric IS NULL OR (metric >= 1 AND metric <= 5)),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(subdomain_id, name)
);

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subdomains_user_id ON subdomains(user_id);
CREATE INDEX IF NOT EXISTS idx_subdomains_life_area_id ON subdomains(life_area_id);
CREATE INDEX IF NOT EXISTS idx_dimensions_user_id ON dimensions(user_id);
CREATE INDEX IF NOT EXISTS idx_dimensions_subdomain_id ON dimensions(subdomain_id);

-- 5. Apply updated_at triggers
CREATE TRIGGER update_subdomains_updated_at BEFORE UPDATE ON subdomains
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dimensions_updated_at BEFORE UPDATE ON dimensions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. Enable Row Level Security
ALTER TABLE subdomains ENABLE ROW LEVEL SECURITY;
ALTER TABLE dimensions ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies for subdomains
CREATE POLICY "Users can view own subdomains" ON subdomains
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert own subdomains" ON subdomains
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own subdomains" ON subdomains
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own subdomains" ON subdomains
    FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- 8. Create RLS policies for dimensions
CREATE POLICY "Users can view own dimensions" ON dimensions
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert own dimensions" ON dimensions
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own dimensions" ON dimensions
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own dimensions" ON dimensions
    FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- 9. Grant permissions
GRANT ALL ON subdomains TO authenticated;
GRANT ALL ON dimensions TO authenticated;

-- 7. Verify setup
SELECT
    'Fulfillment V5 Tables Created!' as status,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name IN ('subdomains', 'dimensions')) as v5_tables_count,
    NOW() as completed_at;
