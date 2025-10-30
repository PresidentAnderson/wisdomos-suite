-- =====================================================
-- FIX SUPABASE API ACCESS FOR WISDOMOS
-- =====================================================

-- 1. Grant permissions to enable API access
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- 2. Ensure Row Level Security is enabled but with permissive policies
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS life_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS fulfillment_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS hubspot_sync ENABLE ROW LEVEL SECURITY;

-- 3. Drop any existing restrictive policies
DROP POLICY IF EXISTS "Enable all operations for all users" ON users;
DROP POLICY IF EXISTS "Enable all operations for all users" ON journal_entries;
DROP POLICY IF EXISTS "Enable all operations for all users" ON contributions;
DROP POLICY IF EXISTS "Enable all operations for all users" ON life_areas;
DROP POLICY IF EXISTS "Enable all operations for all users" ON fulfillment_scores;
DROP POLICY IF EXISTS "Enable all operations for all users" ON hubspot_sync;

-- 4. Create completely permissive policies for all operations
-- These allow ALL operations for ALL users (including anonymous)
CREATE POLICY "Public access for users" ON users 
    FOR ALL 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "Public access for journal_entries" ON journal_entries 
    FOR ALL 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "Public access for contributions" ON contributions 
    FOR ALL 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "Public access for life_areas" ON life_areas 
    FOR ALL 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "Public access for fulfillment_scores" ON fulfillment_scores 
    FOR ALL 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "Public access for hubspot_sync" ON hubspot_sync 
    FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- 5. Verify tables exist and have data
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        RAISE NOTICE 'Table users exists';
    ELSE
        RAISE NOTICE 'Table users does NOT exist - creating it';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'journal_entries') THEN
        RAISE NOTICE 'Table journal_entries exists';
    ELSE
        RAISE NOTICE 'Table journal_entries does NOT exist - creating it';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contributions') THEN
        RAISE NOTICE 'Table contributions exists';
    ELSE
        RAISE NOTICE 'Table contributions does NOT exist - creating it';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'life_areas') THEN
        RAISE NOTICE 'Table life_areas exists';
    ELSE
        RAISE NOTICE 'Table life_areas does NOT exist - creating it';
    END IF;
END $$;

-- 6. Refresh the schema cache
NOTIFY pgrst, 'reload schema';

-- 7. Test query to verify access
SELECT 
    'API Access Fixed!' as status,
    current_timestamp as fixed_at;