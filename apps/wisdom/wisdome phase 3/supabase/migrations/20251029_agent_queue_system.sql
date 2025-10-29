-- =====================================================
-- WisdomOS Multi-Agent System (MAS) — Queue Infrastructure
-- =====================================================
-- Purpose: Event bus, job queue, and agent coordination
-- Version: 1.0
-- Date: 2025-10-29
-- =====================================================

-- =====================================================
-- 1. AGENT REGISTRY
-- =====================================================

CREATE TYPE agent_type AS ENUM (
  'PlannerAgent',
  'Orchestrator',
  'DatabaseAgent',
  'JournalAgent',
  'CommitmentAgent',
  'AreaGenerator',
  'FulfilmentAgent',
  'NarrativeAgent',
  'IntegrityAgent',
  'FinanceAgent',
  'JusticeAgent',
  'UIUXAgent',
  'AnalyticsAgent',
  'I18nAgent',
  'SecurityAgent',
  'DevOpsAgent'
);

CREATE TABLE IF NOT EXISTS agent_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name agent_type NOT NULL UNIQUE,
  version VARCHAR(20) NOT NULL DEFAULT 'v1.0',
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, paused, deprecated
  config JSONB DEFAULT '{}',
  rate_limit_per_min INTEGER DEFAULT 60,
  max_concurrent INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index
CREATE INDEX idx_agent_registry_status ON agent_registry(status);

-- =====================================================
-- 2. QUEUE: JOBS
-- =====================================================

CREATE TYPE job_status AS ENUM (
  'pending',
  'ready',
  'running',
  'completed',
  'failed',
  'cancelled'
);

CREATE TYPE job_intent AS ENUM (
  'plan',
  'execute',
  'validate',
  'report',
  'analyze',
  'transform'
);

CREATE TABLE IF NOT EXISTS queue_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),

  -- Routing
  agent agent_type NOT NULL,
  intent job_intent NOT NULL DEFAULT 'execute',
  task VARCHAR(255) NOT NULL,

  -- Payload
  payload JSONB NOT NULL DEFAULT '{}',

  -- Dependencies
  dependencies UUID[] DEFAULT '{}', -- Array of message_ids that must complete first
  deps_met BOOLEAN DEFAULT false,

  -- Scheduling
  run_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Status & Retry
  status job_status NOT NULL DEFAULT 'pending',
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  backoff_strategy VARCHAR(20) DEFAULT 'exponential', -- linear, exponential, fixed

  -- Provenance
  provenance JSONB DEFAULT '{"source":"system","version":"v1.0"}',
  created_by VARCHAR(100) DEFAULT 'system',

  -- TTL & Error
  ttl_sec INTEGER DEFAULT 600,
  last_error TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_queue_jobs_status ON queue_jobs(status);
CREATE INDEX idx_queue_jobs_agent_status ON queue_jobs(agent, status);
CREATE INDEX idx_queue_jobs_run_at ON queue_jobs(run_at) WHERE status IN ('pending', 'ready');
CREATE INDEX idx_queue_jobs_message_id ON queue_jobs(message_id);
CREATE INDEX idx_queue_jobs_deps ON queue_jobs USING GIN (dependencies);

-- =====================================================
-- 3. QUEUE: EVENTS
-- =====================================================

CREATE TYPE event_type AS ENUM (
  'journal.entry.created',
  'journal.entry.updated',
  'commitment.detected',
  'commitment.confirmed',
  'area.spawned',
  'area.updated',
  'fulfilment.rollup.requested',
  'fulfilment.rollup.completed',
  'autobiography.chapter.created',
  'autobiography.chapter.updated',
  'integrity.issue.raised',
  'integrity.issue.resolved',
  'finance.ledger.ingested',
  'justice.case.synced',
  'ui.snapshot.requested',
  'security.audit.logged',
  'deployment.completed',
  'plan.created',
  'job.completed',
  'job.failed'
);

CREATE TABLE IF NOT EXISTS queue_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type event_type NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',

  -- Processing tracking
  processed_by TEXT[] DEFAULT '{}', -- Array of agent names that handled this
  processing_complete BOOLEAN DEFAULT false,

  -- Metadata
  source VARCHAR(100) DEFAULT 'system',
  correlation_id UUID, -- Link related events

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_queue_events_type ON queue_events(type);
CREATE INDEX idx_queue_events_created_at ON queue_events(created_at DESC);
CREATE INDEX idx_queue_events_unprocessed ON queue_events(processing_complete) WHERE processing_complete = false;
CREATE INDEX idx_queue_events_correlation ON queue_events(correlation_id);

-- =====================================================
-- 4. AGENT LOGS
-- =====================================================

CREATE TYPE log_level AS ENUM ('debug', 'info', 'warn', 'error', 'critical');

CREATE TABLE IF NOT EXISTS agent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent agent_type NOT NULL,
  level log_level NOT NULL DEFAULT 'info',
  message TEXT NOT NULL,
  context JSONB DEFAULT '{}',
  job_id UUID, -- Optional link to job
  event_id UUID, -- Optional link to event
  user_id UUID, -- Optional user context

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_agent_logs_agent_level ON agent_logs(agent, level);
CREATE INDEX idx_agent_logs_created_at ON agent_logs(created_at DESC);
CREATE INDEX idx_agent_logs_level ON agent_logs(level) WHERE level IN ('error', 'critical');
CREATE INDEX idx_agent_logs_job ON agent_logs(job_id);

-- =====================================================
-- 5. PLANS (from PlannerAgent)
-- =====================================================

CREATE TABLE IF NOT EXISTS agent_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),

  -- Plan metadata
  objective TEXT NOT NULL,
  constraints JSONB DEFAULT '{}',
  current_state JSONB DEFAULT '{}',

  -- Tasks (DAG)
  tasks JSONB NOT NULL, -- Array of task objects with dependencies
  status VARCHAR(20) DEFAULT 'active', -- active, completed, cancelled

  -- Tracking
  tasks_total INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Index
CREATE INDEX idx_agent_plans_status ON agent_plans(status);

-- =====================================================
-- 6. FUNCTIONS: Queue Management
-- =====================================================

-- Function: Check if job dependencies are met
CREATE OR REPLACE FUNCTION fn_deps_met(p_job_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_dependencies UUID[];
  v_dependency_id UUID;
  v_all_completed BOOLEAN := true;
BEGIN
  -- Get job dependencies
  SELECT dependencies INTO v_dependencies
  FROM queue_jobs
  WHERE id = p_job_id;

  -- If no dependencies, return true
  IF v_dependencies IS NULL OR array_length(v_dependencies, 1) IS NULL THEN
    RETURN true;
  END IF;

  -- Check if all dependencies are completed
  FOREACH v_dependency_id IN ARRAY v_dependencies
  LOOP
    -- Check if this dependency job is completed
    IF NOT EXISTS (
      SELECT 1 FROM queue_jobs
      WHERE message_id = v_dependency_id
        AND status = 'completed'
    ) THEN
      v_all_completed := false;
      EXIT;
    END IF;
  END LOOP;

  RETURN v_all_completed;
END;
$$ LANGUAGE plpgsql;

-- Function: Get next runnable jobs
CREATE OR REPLACE FUNCTION fn_get_next_jobs(p_agent agent_type, p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  job_id UUID,
  message_id UUID,
  task VARCHAR,
  payload JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    j.id AS job_id,
    j.message_id,
    j.task,
    j.payload
  FROM queue_jobs j
  WHERE j.agent = p_agent
    AND j.status IN ('pending', 'ready')
    AND j.run_at <= NOW()
    AND j.attempts < j.max_attempts
    AND fn_deps_met(j.id) = true
  ORDER BY j.run_at ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function: Mark job as running
CREATE OR REPLACE FUNCTION fn_start_job(p_job_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE queue_jobs
  SET
    status = 'running',
    started_at = NOW(),
    attempts = attempts + 1,
    updated_at = NOW()
  WHERE id = p_job_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Mark job as completed
CREATE OR REPLACE FUNCTION fn_complete_job(p_job_id UUID, p_result JSONB DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
  UPDATE queue_jobs
  SET
    status = 'completed',
    completed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_job_id;

  -- Emit job.completed event
  INSERT INTO queue_events (type, payload)
  VALUES ('job.completed', jsonb_build_object('job_id', p_job_id, 'result', p_result));
END;
$$ LANGUAGE plpgsql;

-- Function: Mark job as failed (with retry logic)
CREATE OR REPLACE FUNCTION fn_fail_job(
  p_job_id UUID,
  p_error TEXT,
  p_retry BOOLEAN DEFAULT true
)
RETURNS VOID AS $$
DECLARE
  v_attempts INTEGER;
  v_max_attempts INTEGER;
BEGIN
  -- Get current attempts
  SELECT attempts, max_attempts
  INTO v_attempts, v_max_attempts
  FROM queue_jobs
  WHERE id = p_job_id;

  -- Check if we should retry
  IF p_retry AND v_attempts < v_max_attempts THEN
    -- Retry with backoff
    UPDATE queue_jobs
    SET
      status = 'pending',
      last_error = p_error,
      run_at = NOW() + (INTERVAL '1 minute' * POWER(2, attempts)), -- Exponential backoff
      updated_at = NOW()
    WHERE id = p_job_id;
  ELSE
    -- Fail permanently
    UPDATE queue_jobs
    SET
      status = 'failed',
      last_error = p_error,
      updated_at = NOW()
    WHERE id = p_job_id;

    -- Emit job.failed event
    INSERT INTO queue_events (type, payload)
    VALUES ('job.failed', jsonb_build_object('job_id', p_job_id, 'error', p_error));
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function: Emit event
CREATE OR REPLACE FUNCTION fn_emit_event(
  p_type event_type,
  p_payload JSONB,
  p_source VARCHAR DEFAULT 'system',
  p_correlation_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO queue_events (type, payload, source, correlation_id)
  VALUES (p_type, p_payload, p_source, p_correlation_id)
  RETURNING id INTO v_event_id;

  -- Notify listeners via Postgres NOTIFY
  PERFORM pg_notify('agent_events', json_build_object(
    'event_id', v_event_id,
    'type', p_type,
    'payload', p_payload
  )::text);

  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Log agent activity
CREATE OR REPLACE FUNCTION fn_log_agent(
  p_agent agent_type,
  p_level log_level,
  p_message TEXT,
  p_context JSONB DEFAULT '{}',
  p_job_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO agent_logs (agent, level, message, context, job_id)
  VALUES (p_agent, p_level, p_message, p_context, p_job_id)
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. TRIGGERS: Auto-update deps_met
-- =====================================================

-- Trigger to update deps_met when dependencies change
CREATE OR REPLACE FUNCTION trigger_update_deps_met()
RETURNS TRIGGER AS $$
BEGIN
  -- When a job completes, check all jobs waiting on it
  IF NEW.status = 'completed' THEN
    UPDATE queue_jobs
    SET deps_met = fn_deps_met(id)
    WHERE NEW.message_id = ANY(dependencies)
      AND status = 'pending';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_queue_jobs_update_deps
AFTER UPDATE OF status ON queue_jobs
FOR EACH ROW
WHEN (NEW.status = 'completed')
EXECUTE FUNCTION trigger_update_deps_met();

-- =====================================================
-- 8. SEED: Agent Registry
-- =====================================================

INSERT INTO agent_registry (name, version, status, rate_limit_per_min, max_concurrent) VALUES
('PlannerAgent', 'v1.0', 'active', 10, 2),
('Orchestrator', 'v1.0', 'active', 120, 10),
('DatabaseAgent', 'v1.0', 'active', 30, 3),
('JournalAgent', 'v1.0', 'active', 60, 5),
('CommitmentAgent', 'v1.0', 'active', 60, 5),
('AreaGenerator', 'v1.0', 'active', 30, 3),
('FulfilmentAgent', 'v1.0', 'active', 30, 3),
('NarrativeAgent', 'v1.0', 'active', 20, 2),
('IntegrityAgent', 'v1.0', 'active', 20, 2),
('FinanceAgent', 'v1.0', 'active', 30, 3),
('JusticeAgent', 'v1.0', 'active', 20, 2),
('UIUXAgent', 'v1.0', 'active', 60, 5),
('AnalyticsAgent', 'v1.0', 'active', 30, 3),
('I18nAgent', 'v1.0', 'active', 10, 1),
('SecurityAgent', 'v1.0', 'active', 20, 2),
('DevOpsAgent', 'v1.0', 'active', 10, 2)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 9. ROW LEVEL SECURITY
-- =====================================================

-- Jobs, events, and logs are system-level (no RLS needed)
-- But we can add audit trail for compliance

ALTER TABLE queue_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can access everything
CREATE POLICY queue_jobs_service_role ON queue_jobs
  FOR ALL USING (true);

CREATE POLICY queue_events_service_role ON queue_events
  FOR ALL USING (true);

CREATE POLICY agent_logs_service_role ON agent_logs
  FOR ALL USING (true);

-- =====================================================
-- 10. CLEANUP: Expire old jobs and events
-- =====================================================

-- Function to clean up old completed jobs (>7 days)
CREATE OR REPLACE FUNCTION fn_cleanup_old_jobs()
RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  WITH deleted AS (
    DELETE FROM queue_jobs
    WHERE status IN ('completed', 'failed')
      AND completed_at < NOW() - INTERVAL '7 days'
    RETURNING id
  )
  SELECT COUNT(*) INTO v_deleted_count FROM deleted;

  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old events (>30 days)
CREATE OR REPLACE FUNCTION fn_cleanup_old_events()
RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  WITH deleted AS (
    DELETE FROM queue_events
    WHERE processing_complete = true
      AND created_at < NOW() - INTERVAL '30 days'
    RETURNING id
  )
  SELECT COUNT(*) INTO v_deleted_count FROM deleted;

  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

COMMENT ON TABLE queue_jobs IS 'Agent job queue with dependency management';
COMMENT ON TABLE queue_events IS 'Event bus for agent communication';
COMMENT ON TABLE agent_logs IS 'Centralized logging for all agents';
COMMENT ON FUNCTION fn_deps_met IS 'Check if job dependencies are satisfied';
COMMENT ON FUNCTION fn_emit_event IS 'Emit event to bus with Postgres NOTIFY';
