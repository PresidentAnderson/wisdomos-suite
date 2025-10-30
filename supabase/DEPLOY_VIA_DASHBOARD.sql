-- =====================================================
-- FD-v5 AGENT SYSTEM - DASHBOARD DEPLOYMENT
-- =====================================================
-- Run this file directly in Supabase SQL Editor
-- Dashboard: https://supabase.com/dashboard/project/yvssmqyphqgvpkwudeoa/sql
-- =====================================================

-- Check what tables already exist
DO $$
BEGIN
  RAISE NOTICE 'Checking existing FD-v5 tables...';
END $$;

SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'queue_jobs')
    THEN '✓ queue_jobs exists'
    ELSE '✗ queue_jobs missing'
  END as queue_status,
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'fd_areas')
    THEN '✓ fd_areas exists'
    ELSE '✗ fd_areas missing'
  END as fd_areas_status,
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'fd_eras')
    THEN '✓ fd_eras exists'
    ELSE '✗ fd_eras missing'
  END as fd_eras_status;

-- Create missing tables

\echo 'Creating queue system tables...'

CREATE TABLE IF NOT EXISTS queue_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent VARCHAR(50) NOT NULL,
  intent VARCHAR(20) NOT NULL CHECK (intent IN ('plan', 'execute', 'validate', 'report')),
  task VARCHAR(255) NOT NULL,
  payload JSONB DEFAULT '{}'::jsonb,
  status VARCHAR(20) DEFAULT 'ready' CHECK (status IN ('ready', 'running', 'completed', 'failed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  run_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  attempts INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  ttl_sec INTEGER DEFAULT 3600,
  deps_met BOOLEAN DEFAULT FALSE,
  dependencies JSONB DEFAULT '[]'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_queue_jobs_status_run_at ON queue_jobs(status, run_at);
CREATE INDEX IF NOT EXISTS idx_queue_jobs_agent ON queue_jobs(agent);

CREATE TABLE IF NOT EXISTS queue_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(100) NOT NULL,
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_queue_events_type_processed ON queue_events(type, processed);

CREATE TABLE IF NOT EXISTS agent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent VARCHAR(50) NOT NULL,
  level VARCHAR(10) DEFAULT 'info' CHECK (level IN ('debug', 'info', 'warn', 'error')),
  message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_logs_agent_created_at ON agent_logs(agent, created_at DESC);

\echo 'Creating FD core tables...'

CREATE TABLE IF NOT EXISTS fd_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  code VARCHAR(10) NOT NULL,
  name VARCHAR(255) NOT NULL,
  is_commitment_spawned BOOLEAN DEFAULT FALSE,
  commitment_id UUID,
  weight DECIMAL(3,2) DEFAULT 1.00,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, code)
);

CREATE INDEX IF NOT EXISTS idx_fd_areas_user_id ON fd_areas(user_id);
CREATE INDEX IF NOT EXISTS idx_fd_areas_commitment_spawned ON fd_areas(is_commitment_spawned);

CREATE TABLE IF NOT EXISTS fd_dimensions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  code VARCHAR(10) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, code)
);

CREATE TABLE IF NOT EXISTS fd_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  content_encrypted TEXT,
  entry_date DATE NOT NULL,
  sentiment_score DECIMAL(3,2),
  edit_locked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fd_entries_user_date ON fd_entries(user_id, entry_date DESC);

CREATE TABLE IF NOT EXISTS fd_entry_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL,
  area_id UUID,
  dimension_id UUID,
  confidence DECIMAL(3,2) DEFAULT 0.50,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fd_entry_links_entry ON fd_entry_links(entry_id);

CREATE TABLE IF NOT EXISTS fd_commitments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  entry_id UUID,
  statement TEXT NOT NULL,
  confidence DECIMAL(3,2) DEFAULT 0.75,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'fulfilled', 'broken', 'cancelled')),
  target_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fd_commitments_user_status ON fd_commitments(user_id, status);

CREATE TABLE IF NOT EXISTS fd_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  commitment_id UUID,
  area_id UUID,
  description TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  due_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fd_actions_user_status ON fd_actions(user_id, status);

CREATE TABLE IF NOT EXISTS fd_score_raw (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  area_id UUID,
  dimension_id UUID,
  entry_id UUID,
  score DECIMAL(4,2) CHECK (score >= 0 AND score <= 5),
  confidence DECIMAL(3,2) DEFAULT 0.50,
  scored_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fd_score_raw_user_area ON fd_score_raw(user_id, area_id, scored_at DESC);

CREATE TABLE IF NOT EXISTS fd_score_rollups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  area_id UUID,
  dimension_id UUID,
  period_type VARCHAR(20) CHECK (period_type IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  score_avg DECIMAL(4,2),
  score_trend VARCHAR(10),
  observations INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, area_id, dimension_id, period_type, period_start)
);

CREATE INDEX IF NOT EXISTS idx_fd_score_rollups_user_period ON fd_score_rollups(user_id, period_start DESC);

\echo 'Creating autobiography tables...'

CREATE TABLE IF NOT EXISTS fd_eras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  start_year INTEGER NOT NULL,
  end_year INTEGER NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS fd_autobiography_chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  era_id UUID NOT NULL,
  area_id UUID,
  title VARCHAR(255),
  summary TEXT,
  themes TEXT[],
  coherence_score DECIMAL(3,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, era_id, area_id)
);

CREATE INDEX IF NOT EXISTS idx_fd_autobiography_user_era ON fd_autobiography_chapters(user_id, era_id);

CREATE TABLE IF NOT EXISTS fd_autobiography_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID NOT NULL,
  entry_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(chapter_id, entry_id)
);

\echo 'Creating integrity tables...'

CREATE TABLE IF NOT EXISTS fd_integrity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  commitment_id UUID,
  action_id UUID,
  issue_type VARCHAR(50),
  description TEXT,
  severity VARCHAR(10) CHECK (severity IN ('low', 'medium', 'high')),
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'acknowledged', 'resolved', 'dismissed')),
  resolved_at TIMESTAMPTZ,
  resolution_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fd_integrity_user_status ON fd_integrity_logs(user_id, status);

\echo 'Creating finance tables...'

CREATE TABLE IF NOT EXISTS fd_finance_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  area_code VARCHAR(10),
  transaction_date DATE NOT NULL,
  description TEXT,
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  type VARCHAR(20) CHECK (type IN ('income', 'expense', 'transfer')),
  category VARCHAR(50),
  source VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fd_finance_user_date ON fd_finance_transactions(user_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_fd_finance_user_area ON fd_finance_transactions(user_id, area_code);

\echo 'Creating legal tables...'

CREATE TABLE IF NOT EXISTS fd_law_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  case_number VARCHAR(100),
  court VARCHAR(255),
  status VARCHAR(50),
  filed_date DATE,
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fd_law_filings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID,
  filing_date DATE NOT NULL,
  document_type VARCHAR(100),
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

\echo 'Creating planning tables...'

CREATE TABLE IF NOT EXISTS fd_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  objective TEXT NOT NULL,
  constraints JSONB DEFAULT '{}'::jsonb,
  state JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by VARCHAR(50) DEFAULT 'PlannerAgent'
);

CREATE TABLE IF NOT EXISTS fd_plan_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL,
  task_id UUID NOT NULL,
  definition_of_done JSONB DEFAULT '[]'::jsonb,
  owner VARCHAR(50),
  estimate_hours DECIMAL(5,2),
  inputs JSONB DEFAULT '{}'::jsonb,
  outputs JSONB DEFAULT '{}'::jsonb,
  tests JSONB DEFAULT '[]'::jsonb,
  dependencies JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fd_plan_tasks_plan ON fd_plan_tasks(plan_id);

\echo 'Creating template tables...'

CREATE TABLE IF NOT EXISTS fd_area_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(10) NOT NULL UNIQUE,
  name_en VARCHAR(255) NOT NULL,
  name_fr VARCHAR(255),
  description_en TEXT,
  description_fr TEXT,
  icon VARCHAR(50),
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS fd_dimension_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(10) NOT NULL UNIQUE,
  name_en VARCHAR(255) NOT NULL,
  name_fr VARCHAR(255),
  description_en TEXT,
  description_fr TEXT,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS fd_system_metadata (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

\echo 'Creating PostgreSQL functions...'

-- Function: Check if job dependencies are met
CREATE OR REPLACE FUNCTION fn_deps_met(p_job_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_dependencies JSONB;
  v_dep_id TEXT;
  v_all_met BOOLEAN := TRUE;
BEGIN
  SELECT dependencies INTO v_dependencies FROM queue_jobs WHERE id = p_job_id;

  IF v_dependencies IS NULL OR jsonb_array_length(v_dependencies) = 0 THEN
    RETURN TRUE;
  END IF;

  FOR v_dep_id IN SELECT jsonb_array_elements_text(v_dependencies) LOOP
    IF NOT EXISTS (SELECT 1 FROM queue_jobs WHERE id = v_dep_id::UUID AND status = 'completed') THEN
      v_all_met := FALSE;
      EXIT;
    END IF;
  END LOOP;

  RETURN v_all_met;
END;
$$ LANGUAGE plpgsql;

-- Function: Monthly rollup
CREATE OR REPLACE FUNCTION fn_fd_rollup_month(p_user_id UUID, p_month DATE)
RETURNS VOID AS $$
DECLARE
  v_area RECORD;
  v_score_avg DECIMAL(4,2);
  v_observations INTEGER;
BEGIN
  FOR v_area IN SELECT id FROM fd_areas WHERE user_id = p_user_id AND active = TRUE LOOP
    SELECT AVG(score), COUNT(*) INTO v_score_avg, v_observations
    FROM fd_score_raw
    WHERE user_id = p_user_id
      AND area_id = v_area.id
      AND scored_at >= p_month
      AND scored_at < p_month + INTERVAL '1 month';

    IF v_observations > 0 THEN
      INSERT INTO fd_score_rollups (user_id, area_id, period_type, period_start, period_end, score_avg, observations)
      VALUES (p_user_id, v_area.id, 'monthly', p_month, p_month + INTERVAL '1 month' - INTERVAL '1 day', v_score_avg, v_observations)
      ON CONFLICT (user_id, area_id, dimension_id, period_type, period_start)
      DO UPDATE SET score_avg = v_score_avg, observations = v_observations;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function: Commitment spawning
CREATE OR REPLACE FUNCTION fn_commitment_spawn(p_commitment_id UUID)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
  v_statement TEXT;
  v_area_code VARCHAR(10);
  v_counter INTEGER;
  v_area_id UUID;
BEGIN
  SELECT user_id, statement INTO v_user_id, v_statement
  FROM fd_commitments WHERE id = p_commitment_id;

  SELECT COUNT(*) + 1 INTO v_counter
  FROM fd_areas WHERE user_id = v_user_id AND code LIKE 'CMT_%';

  v_area_code := 'CMT_' || LPAD(v_counter::TEXT, 3, '0');

  INSERT INTO fd_areas (user_id, code, name, is_commitment_spawned, commitment_id)
  VALUES (v_user_id, v_area_code, LEFT(v_statement, 100), TRUE, p_commitment_id)
  RETURNING id INTO v_area_id;

  RETURN v_area_id;
END;
$$ LANGUAGE plpgsql;

\echo 'Inserting seed data...'

-- Insert eras
INSERT INTO fd_eras (code, name, start_year, end_year, description, sort_order) VALUES
  ('1975-1984', 'Foundation Years (1975-1984)', 1975, 1984, 'The formative decade', 1),
  ('1985-1994', 'Growth Decade (1985-1994)', 1985, 1994, 'Learning and development', 2),
  ('1995-2004', 'Millennium Turn (1995-2004)', 1995, 2004, 'Digital age begins', 3),
  ('2005-2014', 'Expansion Era (2005-2014)', 2005, 2014, 'Career and family building', 4),
  ('2015-2024', 'Transformation Period (2015-2024)', 2015, 2024, 'Major life changes', 5),
  ('2025-2034', 'Prime Years (2025-2034)', 2025, 2034, 'Peak productivity', 6),
  ('2035-2044', 'Mastery Decade (2035-2044)', 2035, 2044, 'Expert and mentor', 7),
  ('2045-2054', 'Wisdom Era (2045-2054)', 2045, 2054, 'Sharing knowledge', 8),
  ('2055-2064', 'Legacy Building (2055-2064)', 2055, 2064, 'Creating lasting impact', 9),
  ('2065-2074', 'Elder Years (2065-2074)', 2065, 2074, 'Reflection and guidance', 10),
  ('2075-2084', 'Centennial (2075-2084)', 2075, 2084, 'A century of life', 11),
  ('2085-2094', 'Beyond Century (2085-2094)', 2085, 2094, 'Extended wisdom', 12),
  ('2095-2100', 'Final Chapter (2095-2100)', 2095, 2100, 'Life completion', 13)
ON CONFLICT (code) DO NOTHING;

-- Insert area templates
INSERT INTO fd_area_templates (code, name_en, name_fr, description_en, icon, sort_order) VALUES
  ('WRK', 'Work & Career', 'Travail et Carrière', 'Professional life, career development, business ventures', 'briefcase', 1),
  ('REL', 'Relationships', 'Relations', 'Family, friends, romantic relationships', 'users', 2),
  ('HEA', 'Health & Fitness', 'Santé et Forme', 'Physical health, exercise, nutrition', 'heart', 3),
  ('FIN', 'Finance', 'Finances', 'Money, investments, financial planning', 'dollar-sign', 4),
  ('LRN', 'Learning & Growth', 'Apprentissage', 'Education, skills, personal development', 'book', 5),
  ('CRE', 'Creativity', 'Créativité', 'Art, music, writing, creative projects', 'palette', 6),
  ('SPR', 'Spirituality', 'Spiritualité', 'Inner peace, meditation, faith', 'sun', 7),
  ('FUN', 'Fun & Recreation', 'Loisirs', 'Hobbies, entertainment, relaxation', 'smile', 8),
  ('ENV', 'Environment', 'Environnement', 'Home, possessions, surroundings', 'home', 9),
  ('LEG', 'Legal & Justice', 'Justice', 'Legal matters, advocacy, rights', 'scale', 10)
ON CONFLICT (code) DO NOTHING;

-- Insert dimension templates
INSERT INTO fd_dimension_templates (code, name_en, name_fr, description_en, sort_order) VALUES
  ('INT', 'Internal', 'Interne', 'Self-development, mindset, inner world', 1),
  ('FOR', 'Forward', 'Avancer', 'Goals, progress, future orientation', 2),
  ('REW', 'Reward', 'Récompense', 'Pleasure, satisfaction, enjoyment', 3),
  ('LEA', 'Learning', 'Apprentissage', 'Knowledge, skills, understanding', 4),
  ('CON', 'Contribution', 'Contribution', 'Giving back, helping others, impact', 5),
  ('EXP', 'Expression', 'Expression', 'Creativity, sharing, communication', 6)
ON CONFLICT (code) DO NOTHING;

-- Insert system metadata
INSERT INTO fd_system_metadata (key, value) VALUES
  ('version', '"1.0.0"'::jsonb),
  ('schema_version', '"fd-v5"'::jsonb),
  ('deployment_date', to_jsonb(NOW())),
  ('agent_system_enabled', 'true'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

\echo ''
\echo '========================================='
\echo 'FD-v5 Agent System deployed successfully!'
\echo '========================================='
\echo ''

-- Verify deployment
SELECT
  'Queue Tables' as category,
  COUNT(*) FILTER (WHERE table_name IN ('queue_jobs', 'queue_events', 'agent_logs')) as table_count,
  3 as expected
FROM information_schema.tables WHERE table_schema = 'public'
UNION ALL
SELECT
  'FD Core Tables',
  COUNT(*) FILTER (WHERE table_name LIKE 'fd_%'),
  23
FROM information_schema.tables WHERE table_schema = 'public'
UNION ALL
SELECT
  'Eras',
  COUNT(*)::integer,
  13
FROM fd_eras
UNION ALL
SELECT
  'Area Templates',
  COUNT(*)::integer,
  10
FROM fd_area_templates
UNION ALL
SELECT
  'Dimension Templates',
  COUNT(*)::integer,
  6
FROM fd_dimension_templates;
