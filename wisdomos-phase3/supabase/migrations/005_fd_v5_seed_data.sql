-- =====================================================
-- WisdomOS FD-v5 Seed Data
-- Eras (1975-2100) and Standard Area/Dimension Definitions
-- =====================================================

-- =====================================================
-- SEED ERAS (1975-2100 Timeline)
-- =====================================================

INSERT INTO fd_eras (code, name, start_year, end_year, description, sort_order) VALUES
('1975-1984', 'Foundation Years (1975-1984)', 1975, 1984, 'The formative decade - establishing core values and early experiences', 1),
('1985-1994', 'Growth Decade (1985-1994)', 1985, 1994, 'Period of learning, development, and building foundations', 2),
('1995-2004', 'Digital Age Entry (1995-2004)', 1995, 2004, 'Embracing technology and new opportunities', 3),
('2005-2014', 'Expansion Era (2005-2014)', 2005, 2014, 'Professional growth and family development', 4),
('2015-2024', 'Transformation (2015-2024)', 2015, 2024, 'Major life changes and personal evolution', 5),
('2025-2034', 'Mastery Phase (2025-2034)', 2025, 2034, 'Achieving expertise and making impact', 6),
('2035-2044', 'Legacy Building (2035-2044)', 2035, 2044, 'Creating lasting contributions', 7),
('2045-2054', 'Wisdom Years (2045-2054)', 2045, 2054, 'Sharing knowledge and mentoring', 8),
('2055-2064', 'Elder Sage (2055-2064)', 2055, 2064, 'Deep reflection and guidance', 9),
('2065-2074', 'Transcendence (2065-2074)', 2065, 2074, 'Spiritual depth and universal perspective', 10),
('2075-2084', 'Completion (2075-2084)', 2075, 2084, 'Fulfillment of life purpose', 11),
('2085-2094', 'Integration (2085-2094)', 2085, 2094, 'Wholeness and unity', 12),
('2095-2100', 'Finale (2095-2100)', 2095, 2100, 'Final chapters and ultimate legacy', 13)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE fd_eras IS 'Timeline eras from 1975 to 2100 for autobiography chapters';

-- =====================================================
-- STANDARD AREA CODES (for reference - actual areas are user-specific)
-- =====================================================

-- These are the standard area codes that can be used:
-- WRK - Work/Career
-- REL - Relationships
-- HEA - Health & Fitness
-- FIN - Finances
-- LRN - Learning & Growth
-- CRE - Creativity
-- SPR - Spirituality
-- FUN - Fun & Recreation
-- ENV - Environment
-- LEG - Legacy & Contribution
-- MUS - Music (specific to user)
-- WRT - Writing (specific to user)
-- SPE - Speaking (specific to user)
-- LAW - Legal/Justice
-- CMT_xxx - Commitment-spawned areas (auto-generated)

-- =====================================================
-- STANDARD DIMENSION CODES (for reference - actual dimensions are area-specific)
-- =====================================================

-- These are the standard dimension codes:
-- INT - Internal (self-development, mindset, skills)
-- FOR - Forward (goals, progress, achievements)
-- CON - Contribution (impact on others, giving back)
-- FUL - Fulfillment (satisfaction, joy, meaning)
-- GRO - Growth (learning, improvement, expansion)
-- STA - Stability (security, consistency, foundation)

-- =====================================================
-- FD-v5 METADATA
-- =====================================================

-- Create metadata table for system configuration
CREATE TABLE IF NOT EXISTS fd_system_metadata (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert system metadata
INSERT INTO fd_system_metadata (key, value, description) VALUES
('fd_version', '"5.0.0"'::jsonb, 'FD system version'),
('timeline_start', '1975'::jsonb, 'Autobiography timeline start year'),
('timeline_end', '2100'::jsonb, 'Autobiography timeline end year'),
('score_scale_min', '0'::jsonb, 'Minimum score value'),
('score_scale_max', '5'::jsonb, 'Maximum score value'),
('default_confidence_threshold', '0.75'::jsonb, 'Default confidence threshold for auto-actions'),
('commitment_spawn_threshold', '0.75'::jsonb, 'Confidence threshold to auto-spawn commitment areas'),
('integrity_time_lock_days', '90'::jsonb, 'Number of days for entry edit time-lock (±90)'),
('rollup_schedule_timezone', '"America/Toronto"'::jsonb, 'Timezone for scheduled rollups'),
('rollup_schedule_hour', '2'::jsonb, 'Hour of day for scheduled rollups (02:00)')
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- STANDARD AREA/DIMENSION TEMPLATES
-- =====================================================

-- Create template table for standard area/dimension definitions
CREATE TABLE IF NOT EXISTS fd_area_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(10) NOT NULL UNIQUE,
    name_en VARCHAR(255) NOT NULL,
    name_fr VARCHAR(255),
    description_en TEXT,
    description_fr TEXT,
    icon VARCHAR(50),
    default_weight DECIMAL(3,2) DEFAULT 1.00,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed standard area templates
INSERT INTO fd_area_templates (code, name_en, name_fr, description_en, description_fr, icon, default_weight, sort_order) VALUES
('WRK', 'Work & Career', 'Travail et Carrière', 'Professional life, career development, and work achievements', 'Vie professionnelle, développement de carrière et réalisations', 'briefcase', 1.00, 1),
('REL', 'Relationships', 'Relations', 'Family, friends, romantic partnerships, and social connections', 'Famille, amis, partenaires romantiques et connexions sociales', 'users', 1.00, 2),
('HEA', 'Health & Fitness', 'Santé et Forme', 'Physical health, fitness, nutrition, and wellness', 'Santé physique, forme, nutrition et bien-être', 'heart', 1.00, 3),
('FIN', 'Finances', 'Finances', 'Money management, investments, and financial security', 'Gestion de l''argent, investissements et sécurité financière', 'dollar-sign', 1.00, 4),
('LRN', 'Learning & Growth', 'Apprentissage et Croissance', 'Education, skills development, and personal growth', 'Éducation, développement des compétences et croissance personnelle', 'book', 1.00, 5),
('CRE', 'Creativity', 'Créativité', 'Creative expression, art, and innovation', 'Expression créative, art et innovation', 'palette', 1.00, 6),
('SPR', 'Spirituality', 'Spiritualité', 'Spiritual practice, meaning, and inner peace', 'Pratique spirituelle, sens et paix intérieure', 'sun', 1.00, 7),
('FUN', 'Fun & Recreation', 'Loisirs et Divertissement', 'Hobbies, entertainment, and enjoyment', 'Passe-temps, divertissement et plaisir', 'smile', 1.00, 8),
('ENV', 'Environment', 'Environnement', 'Living space, surroundings, and environmental impact', 'Espace de vie, environnement et impact écologique', 'home', 1.00, 9),
('LEG', 'Legacy & Contribution', 'Héritage et Contribution', 'Impact on others and lasting contributions', 'Impact sur les autres et contributions durables', 'gift', 1.00, 10)
ON CONFLICT (code) DO NOTHING;

-- Create template table for standard dimension definitions
CREATE TABLE IF NOT EXISTS fd_dimension_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(10) NOT NULL UNIQUE,
    name_en VARCHAR(255) NOT NULL,
    name_fr VARCHAR(255),
    description_en TEXT,
    description_fr TEXT,
    default_weight DECIMAL(3,2) DEFAULT 1.00,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed standard dimension templates
INSERT INTO fd_dimension_templates (code, name_en, name_fr, description_en, description_fr, default_weight, sort_order) VALUES
('INT', 'Internal', 'Interne', 'Self-development, mindset, skills, and inner work', 'Développement personnel, état d''esprit, compétences et travail intérieur', 1.00, 1),
('FOR', 'Forward', 'Avancer', 'Goals, progress, achievements, and future orientation', 'Objectifs, progrès, réalisations et orientation future', 1.00, 2),
('CON', 'Contribution', 'Contribution', 'Impact on others, giving back, and service', 'Impact sur les autres, redonner et service', 1.00, 3),
('FUL', 'Fulfillment', 'Épanouissement', 'Satisfaction, joy, meaning, and purpose', 'Satisfaction, joie, sens et but', 1.00, 4),
('GRO', 'Growth', 'Croissance', 'Learning, improvement, and expansion', 'Apprentissage, amélioration et expansion', 1.00, 5),
('STA', 'Stability', 'Stabilité', 'Security, consistency, and foundation', 'Sécurité, cohérence et fondation', 1.00, 6)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_fd_area_templates_code ON fd_area_templates(code);
CREATE INDEX IF NOT EXISTS idx_fd_dimension_templates_code ON fd_dimension_templates(code);

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE fd_area_templates IS 'Standard area templates with bilingual names (EN/FR)';
COMMENT ON TABLE fd_dimension_templates IS 'Standard dimension templates with bilingual names (EN/FR)';
COMMENT ON TABLE fd_system_metadata IS 'System-wide configuration and metadata for FD-v5';
