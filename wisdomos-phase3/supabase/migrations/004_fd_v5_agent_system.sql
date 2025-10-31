-- =====================================================
-- WisdomOS FD-v5 Agent System Migration
-- Multi-Agent System (MAS) Blueprint
-- Timeline: 1975-2100
-- =====================================================

-- Enable pgcrypto for encryption if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- QUEUE SYSTEM TABLES
-- =====================================================

-- Queue Jobs table
CREATE TABLE IF NOT EXISTS queue_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent VARCHAR(50) NOT NULL,
    intent VARCHAR(20) NOT NULL CHECK (intent IN ('plan', 'execute', 'validate', 'report')),
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    status VARCHAR(20) NOT NULL DEFAULT 'ready' CHECK (status IN ('ready', 'running', 'completed', 'failed', 'cancelled')),
    run_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    attempts INTEGER DEFAULT 0,
    last_error TEXT,
    deps_met BOOLEAN DEFAULT true,
    dependencies JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_queue_jobs_status ON queue_jobs(status) WHERE status IN ('ready', 'running');
CREATE INDEX idx_queue_jobs_run_at ON queue_jobs(run_at) WHERE status = 'ready';
CREATE INDEX idx_queue_jobs_agent ON queue_jobs(agent);

-- Queue Events table
CREATE TABLE IF NOT EXISTS queue_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    processed_by TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_queue_events_type ON queue_events(type);
CREATE INDEX idx_queue_events_created_at ON queue_events(created_at);

-- Agent Logs table
CREATE TABLE IF NOT EXISTS agent_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent VARCHAR(50) NOT NULL,
    level VARCHAR(10) NOT NULL CHECK (level IN ('debug', 'info', 'warn', 'error', 'fatal')),
    message TEXT NOT NULL,
    context JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_agent_logs_agent ON agent_logs(agent);
CREATE INDEX idx_agent_logs_level ON agent_logs(level);
CREATE INDEX idx_agent_logs_created_at ON agent_logs(created_at);

-- =====================================================
-- FD-v5 CORE TABLES
-- =====================================================

-- FD Areas (extends existing life_areas)
CREATE TABLE IF NOT EXISTS fd_areas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    code VARCHAR(10) NOT NULL, -- WRK, REL, HEA, etc. or CMT_xxx
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_commitment_spawned BOOLEAN DEFAULT false,
    commitment_id UUID,
    weight DECIMAL(3,2) DEFAULT 1.00 CHECK (weight >= 0 AND weight <= 1),
    sort_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, code)
);

CREATE INDEX idx_fd_areas_user_id ON fd_areas(user_id);
CREATE INDEX idx_fd_areas_code ON fd_areas(code);
CREATE INDEX idx_fd_areas_commitment_id ON fd_areas(commitment_id) WHERE commitment_id IS NOT NULL;

-- FD Dimensions (aspects within each Area)
CREATE TABLE IF NOT EXISTS fd_dimensions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    area_id UUID NOT NULL REFERENCES fd_areas(id) ON DELETE CASCADE,
    code VARCHAR(10) NOT NULL, -- INT, FOR, etc.
    name VARCHAR(255) NOT NULL,
    description TEXT,
    weight DECIMAL(3,2) DEFAULT 1.00 CHECK (weight >= 0 AND weight <= 1),
    sort_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(area_id, code)
);

CREATE INDEX idx_fd_dimensions_area_id ON fd_dimensions(area_id);
CREATE INDEX idx_fd_dimensions_code ON fd_dimensions(code);

-- FD Journal Entries (extends existing journals)
CREATE TABLE IF NOT EXISTS fd_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    content_encrypted TEXT, -- encrypted version for sensitive entries
    entry_date DATE NOT NULL,
    entry_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    source VARCHAR(50) DEFAULT 'manual' CHECK (source IN ('manual', 'import', 'api', 'sync')),
    tags TEXT[] DEFAULT '{}',
    sentiment_score DECIMAL(3,2), -- -1.0 to +1.0
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    edit_locked_at TIMESTAMPTZ, -- time-lock for ±90 days
    edit_reason TEXT
);

CREATE INDEX idx_fd_entries_user_id ON fd_entries(user_id);
CREATE INDEX idx_fd_entries_entry_date ON fd_entries(entry_date);
CREATE INDEX idx_fd_entries_entry_timestamp ON fd_entries(entry_timestamp);

-- FD Entry Links (connects entries to Areas/Dimensions)
CREATE TABLE IF NOT EXISTS fd_entry_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_id UUID NOT NULL REFERENCES fd_entries(id) ON DELETE CASCADE,
    area_id UUID REFERENCES fd_areas(id) ON DELETE CASCADE,
    dimension_id UUID REFERENCES fd_dimensions(id) ON DELETE CASCADE,
    weight DECIMAL(3,2) DEFAULT 1.00 CHECK (weight >= 0 AND weight <= 1),
    confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
    signal_value DECIMAL(5,2), -- 0-5 scale
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(entry_id, area_id, dimension_id)
);

CREATE INDEX idx_fd_entry_links_entry_id ON fd_entry_links(entry_id);
CREATE INDEX idx_fd_entry_links_area_id ON fd_entry_links(area_id);
CREATE INDEX idx_fd_entry_links_dimension_id ON fd_entry_links(dimension_id);

-- FD Commitments
CREATE TABLE IF NOT EXISTS fd_commitments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    entry_id UUID REFERENCES fd_entries(id) ON DELETE SET NULL,
    statement TEXT NOT NULL,
    confidence DECIMAL(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    status VARCHAR(20) DEFAULT 'detected' CHECK (status IN ('detected', 'confirmed', 'active', 'fulfilled', 'broken', 'cancelled')),
    area_id UUID REFERENCES fd_areas(id) ON DELETE SET NULL,
    spawned_area_id UUID REFERENCES fd_areas(id) ON DELETE SET NULL,
    target_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fd_commitments_user_id ON fd_commitments(user_id);
CREATE INDEX idx_fd_commitments_status ON fd_commitments(status);
CREATE INDEX idx_fd_commitments_entry_id ON fd_commitments(entry_id);

-- FD Score Raw (individual observations)
CREATE TABLE IF NOT EXISTS fd_score_raw (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    area_id UUID REFERENCES fd_areas(id) ON DELETE CASCADE,
    dimension_id UUID REFERENCES fd_dimensions(id) ON DELETE CASCADE,
    score_date DATE NOT NULL,
    score_value DECIMAL(3,2) NOT NULL CHECK (score_value >= 0 AND score_value <= 5),
    confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
    source VARCHAR(50) DEFAULT 'journal',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fd_score_raw_user_id ON fd_score_raw(user_id);
CREATE INDEX idx_fd_score_raw_area_id ON fd_score_raw(area_id);
CREATE INDEX idx_fd_score_raw_dimension_id ON fd_score_raw(dimension_id);
CREATE INDEX idx_fd_score_raw_score_date ON fd_score_raw(score_date);

-- FD Score Rollups (monthly aggregations)
CREATE TABLE IF NOT EXISTS fd_score_rollups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    area_id UUID REFERENCES fd_areas(id) ON DELETE CASCADE,
    dimension_id UUID REFERENCES fd_dimensions(id) ON DELETE CASCADE,
    period_type VARCHAR(20) NOT NULL CHECK (period_type IN ('month', 'quarter', 'year')),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    score_avg DECIMAL(3,2) CHECK (score_avg >= 0 AND score_avg <= 5),
    score_trend DECIMAL(4,2), -- percentage change
    observations_count INTEGER DEFAULT 0,
    confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, area_id, dimension_id, period_type, period_start)
);

CREATE INDEX idx_fd_score_rollups_user_id ON fd_score_rollups(user_id);
CREATE INDEX idx_fd_score_rollups_period ON fd_score_rollups(period_start, period_end);

-- FD Actions (tied to commitments and areas)
CREATE TABLE IF NOT EXISTS fd_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    area_id UUID REFERENCES fd_areas(id) ON DELETE CASCADE,
    commitment_id UUID REFERENCES fd_commitments(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'cancelled')),
    due_date DATE,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fd_actions_user_id ON fd_actions(user_id);
CREATE INDEX idx_fd_actions_area_id ON fd_actions(area_id);
CREATE INDEX idx_fd_actions_status ON fd_actions(status);

-- =====================================================
-- AUTOBIOGRAPHY SYSTEM (1975-2100)
-- =====================================================

-- FD Eras (decades from 1975-2100)
CREATE TABLE IF NOT EXISTS fd_eras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) NOT NULL UNIQUE, -- 1975-1984, 1985-1994, etc.
    name VARCHAR(255) NOT NULL,
    start_year INTEGER NOT NULL,
    end_year INTEGER NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fd_eras_years ON fd_eras(start_year, end_year);

-- FD Autobiography Chapters
CREATE TABLE IF NOT EXISTS fd_autobiography_chapters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    era_id UUID REFERENCES fd_eras(id) ON DELETE CASCADE,
    area_id UUID REFERENCES fd_areas(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    coherence_score DECIMAL(3,2) CHECK (coherence_score >= 0 AND coherence_score <= 1),
    theme_tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, era_id, area_id)
);

CREATE INDEX idx_fd_autobiography_chapters_user_id ON fd_autobiography_chapters(user_id);
CREATE INDEX idx_fd_autobiography_chapters_era_id ON fd_autobiography_chapters(era_id);

-- FD Autobiography Links (entries to chapters)
CREATE TABLE IF NOT EXISTS fd_autobiography_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chapter_id UUID NOT NULL REFERENCES fd_autobiography_chapters(id) ON DELETE CASCADE,
    entry_id UUID NOT NULL REFERENCES fd_entries(id) ON DELETE CASCADE,
    relevance_score DECIMAL(3,2) CHECK (relevance_score >= 0 AND relevance_score <= 1),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(chapter_id, entry_id)
);

CREATE INDEX idx_fd_autobiography_links_chapter_id ON fd_autobiography_links(chapter_id);
CREATE INDEX idx_fd_autobiography_links_entry_id ON fd_autobiography_links(entry_id);

-- =====================================================
-- INTEGRITY SYSTEM
-- =====================================================

-- FD Integrity Logs
CREATE TABLE IF NOT EXISTS fd_integrity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    commitment_id UUID REFERENCES fd_commitments(id) ON DELETE CASCADE,
    action_id UUID REFERENCES fd_actions(id) ON DELETE CASCADE,
    issue_type VARCHAR(50) NOT NULL CHECK (issue_type IN ('promise_broken', 'action_missed', 'inconsistency', 'resolved')),
    description TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high')),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'acknowledged', 'resolved', 'dismissed')),
    resolved_at TIMESTAMPTZ,
    resolution_note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fd_integrity_logs_user_id ON fd_integrity_logs(user_id);
CREATE INDEX idx_fd_integrity_logs_status ON fd_integrity_logs(status);
CREATE INDEX idx_fd_integrity_logs_commitment_id ON fd_integrity_logs(commitment_id);

-- =====================================================
-- FINANCE SYSTEM
-- =====================================================

-- FD Finance Transactions
CREATE TABLE IF NOT EXISTS fd_finance_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    area_id UUID REFERENCES fd_areas(id) ON DELETE SET NULL, -- map to WRK, MUS, WRT, SPE
    transaction_date DATE NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'CAD',
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
    category VARCHAR(100),
    source VARCHAR(100), -- import source
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fd_finance_tx_user_id ON fd_finance_transactions(user_id);
CREATE INDEX idx_fd_finance_tx_area_id ON fd_finance_transactions(area_id);
CREATE INDEX idx_fd_finance_tx_date ON fd_finance_transactions(transaction_date);
CREATE INDEX idx_fd_finance_tx_type ON fd_finance_transactions(type);

-- =====================================================
-- JUSTICE/LAW SYSTEM
-- =====================================================

-- FD Law Cases
CREATE TABLE IF NOT EXISTS fd_law_cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    case_number VARCHAR(100) NOT NULL,
    case_title VARCHAR(255) NOT NULL,
    court VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'closed', 'appealed', 'settled')),
    filed_date DATE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, case_number)
);

CREATE INDEX idx_fd_law_cases_user_id ON fd_law_cases(user_id);
CREATE INDEX idx_fd_law_cases_status ON fd_law_cases(status);

-- FD Law Filings
CREATE TABLE IF NOT EXISTS fd_law_filings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES fd_law_cases(id) ON DELETE CASCADE,
    filing_date DATE NOT NULL,
    filing_type VARCHAR(100) NOT NULL,
    description TEXT,
    document_url TEXT,
    deadline_date DATE,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fd_law_filings_case_id ON fd_law_filings(case_id);
CREATE INDEX idx_fd_law_filings_filing_date ON fd_law_filings(filing_date);

-- =====================================================
-- PLANNER & PLAN TABLES
-- =====================================================

-- FD Plans
CREATE TABLE IF NOT EXISTS fd_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id VARCHAR(100) NOT NULL UNIQUE,
    objective TEXT NOT NULL,
    constraints JSONB DEFAULT '{}'::jsonb,
    state JSONB DEFAULT '{}'::jsonb,
    created_by VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- FD Plan Tasks
CREATE TABLE IF NOT EXISTS fd_plan_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id UUID NOT NULL REFERENCES fd_plans(id) ON DELETE CASCADE,
    task_id VARCHAR(100) NOT NULL,
    definition_of_done JSONB NOT NULL DEFAULT '[]'::jsonb,
    owner VARCHAR(50) NOT NULL,
    estimate_hours DECIMAL(5,2),
    inputs JSONB DEFAULT '{}'::jsonb,
    outputs JSONB DEFAULT '{}'::jsonb,
    tests JSONB DEFAULT '[]'::jsonb,
    dependencies JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(plan_id, task_id)
);

CREATE INDEX idx_fd_plan_tasks_plan_id ON fd_plan_tasks(plan_id);
CREATE INDEX idx_fd_plan_tasks_status ON fd_plan_tasks(status);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function: Check if job dependencies are met
CREATE OR REPLACE FUNCTION fn_deps_met(job_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    job_deps JSONB;
    dep TEXT;
    dep_status VARCHAR(20);
BEGIN
    SELECT dependencies INTO job_deps FROM queue_jobs WHERE id = job_id;

    IF jsonb_array_length(job_deps) = 0 THEN
        RETURN true;
    END IF;

    FOR dep IN SELECT jsonb_array_elements_text(job_deps) LOOP
        SELECT status INTO dep_status FROM queue_jobs WHERE id = dep::UUID;
        IF dep_status IS NULL OR dep_status != 'completed' THEN
            RETURN false;
        END IF;
    END LOOP;

    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Function: FD Monthly Rollup
CREATE OR REPLACE FUNCTION fn_fd_rollup_month(p_user_id UUID, p_month DATE)
RETURNS void AS $$
DECLARE
    v_period_start DATE;
    v_period_end DATE;
BEGIN
    v_period_start := date_trunc('month', p_month)::DATE;
    v_period_end := (date_trunc('month', p_month) + interval '1 month' - interval '1 day')::DATE;

    -- Insert or update rollups for each area/dimension
    INSERT INTO fd_score_rollups (
        user_id, area_id, dimension_id, period_type, period_start, period_end,
        score_avg, observations_count, confidence
    )
    SELECT
        p_user_id,
        area_id,
        dimension_id,
        'month',
        v_period_start,
        v_period_end,
        AVG(score_value),
        COUNT(*),
        AVG(confidence)
    FROM fd_score_raw
    WHERE user_id = p_user_id
      AND score_date BETWEEN v_period_start AND v_period_end
    GROUP BY area_id, dimension_id
    ON CONFLICT (user_id, area_id, dimension_id, period_type, period_start)
    DO UPDATE SET
        score_avg = EXCLUDED.score_avg,
        observations_count = EXCLUDED.observations_count,
        confidence = EXCLUDED.confidence,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function: Commitment Spawn Area
CREATE OR REPLACE FUNCTION fn_commitment_spawn(p_commitment_id UUID)
RETURNS UUID AS $$
DECLARE
    v_user_id UUID;
    v_statement TEXT;
    v_area_id UUID;
    v_area_code VARCHAR(10);
    v_counter INTEGER;
BEGIN
    -- Get commitment details
    SELECT user_id, statement INTO v_user_id, v_statement
    FROM fd_commitments WHERE id = p_commitment_id;

    -- Check for existing similar area (simplified - in production use vector similarity)
    -- For now, just create a new CMT area

    -- Generate unique CMT code
    SELECT COUNT(*) + 1 INTO v_counter
    FROM fd_areas
    WHERE user_id = v_user_id AND code LIKE 'CMT_%';

    v_area_code := 'CMT_' || LPAD(v_counter::TEXT, 3, '0');

    -- Create new area
    INSERT INTO fd_areas (user_id, code, name, description, is_commitment_spawned, commitment_id)
    VALUES (v_user_id, v_area_code, 'Commitment: ' || LEFT(v_statement, 50), v_statement, true, p_commitment_id)
    RETURNING id INTO v_area_id;

    -- Update commitment with spawned area
    UPDATE fd_commitments SET spawned_area_id = v_area_id WHERE id = p_commitment_id;

    RETURN v_area_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Enable RLS on all FD tables
ALTER TABLE fd_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE fd_dimensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fd_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE fd_entry_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE fd_commitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE fd_score_raw ENABLE ROW LEVEL SECURITY;
ALTER TABLE fd_score_rollups ENABLE ROW LEVEL SECURITY;
ALTER TABLE fd_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fd_autobiography_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE fd_autobiography_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE fd_integrity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE fd_finance_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fd_law_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE fd_law_filings ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data
CREATE POLICY fd_areas_policy ON fd_areas FOR ALL USING (auth.uid() = user_id);
CREATE POLICY fd_dimensions_policy ON fd_dimensions FOR ALL USING (
    EXISTS (SELECT 1 FROM fd_areas WHERE fd_areas.id = fd_dimensions.area_id AND fd_areas.user_id = auth.uid())
);
CREATE POLICY fd_entries_policy ON fd_entries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY fd_entry_links_policy ON fd_entry_links FOR ALL USING (
    EXISTS (SELECT 1 FROM fd_entries WHERE fd_entries.id = fd_entry_links.entry_id AND fd_entries.user_id = auth.uid())
);
CREATE POLICY fd_commitments_policy ON fd_commitments FOR ALL USING (auth.uid() = user_id);
CREATE POLICY fd_score_raw_policy ON fd_score_raw FOR ALL USING (auth.uid() = user_id);
CREATE POLICY fd_score_rollups_policy ON fd_score_rollups FOR ALL USING (auth.uid() = user_id);
CREATE POLICY fd_actions_policy ON fd_actions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY fd_autobiography_chapters_policy ON fd_autobiography_chapters FOR ALL USING (auth.uid() = user_id);
CREATE POLICY fd_autobiography_links_policy ON fd_autobiography_links FOR ALL USING (
    EXISTS (SELECT 1 FROM fd_autobiography_chapters WHERE fd_autobiography_chapters.id = fd_autobiography_links.chapter_id AND fd_autobiography_chapters.user_id = auth.uid())
);
CREATE POLICY fd_integrity_logs_policy ON fd_integrity_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY fd_finance_transactions_policy ON fd_finance_transactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY fd_law_cases_policy ON fd_law_cases FOR ALL USING (auth.uid() = user_id);
CREATE POLICY fd_law_filings_policy ON fd_law_filings FOR ALL USING (
    EXISTS (SELECT 1 FROM fd_law_cases WHERE fd_law_cases.id = fd_law_filings.case_id AND fd_law_cases.user_id = auth.uid())
);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to tables
CREATE TRIGGER update_fd_areas_updated_at BEFORE UPDATE ON fd_areas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fd_dimensions_updated_at BEFORE UPDATE ON fd_dimensions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fd_entries_updated_at BEFORE UPDATE ON fd_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fd_commitments_updated_at BEFORE UPDATE ON fd_commitments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fd_actions_updated_at BEFORE UPDATE ON fd_actions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_queue_jobs_updated_at BEFORE UPDATE ON queue_jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
