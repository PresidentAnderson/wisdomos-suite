-- Apply only FD v5 core tables if they don't exist
-- This is a safe idempotent script

-- Check and create fd_area
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'fd_area') THEN
        EXECUTE '
        CREATE TABLE fd_area (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          code VARCHAR(10) UNIQUE NOT NULL,
          name VARCHAR(100) NOT NULL,
          emoji VARCHAR(10) NOT NULL,
          color VARCHAR(7) NOT NULL,
          weight_default DECIMAL(4,3) NOT NULL DEFAULT 0.0625,
          is_active BOOLEAN NOT NULL DEFAULT true,
          description TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        CREATE INDEX idx_fd_area_code ON fd_area(code);
        CREATE INDEX idx_fd_area_active ON fd_area(is_active);
        ';
    END IF;
END $$;

-- Check and create fd_dimension
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'fd_dimension') THEN
        EXECUTE '
        CREATE TABLE fd_dimension (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          area_id UUID NOT NULL REFERENCES fd_area(id) ON DELETE CASCADE,
          code VARCHAR(50) NOT NULL,
          name VARCHAR(100) NOT NULL,
          weight_default DECIMAL(4,3) NOT NULL DEFAULT 1.0,
          description TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          UNIQUE(area_id, code)
        );
        CREATE INDEX idx_fd_dimension_area ON fd_dimension(area_id);
        ';
    END IF;
END $$;

-- Check and create fd_entry
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'fd_entry') THEN
        EXECUTE '
        CREATE TABLE fd_entry (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          entry_date DATE NOT NULL,
          content TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          UNIQUE(user_id, entry_date)
        );
        CREATE INDEX idx_fd_entry_user_date ON fd_entry(user_id, entry_date);
        ';
    END IF;
END $$;

-- Check and create fd_entry_emotions
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'fd_entry_emotions') THEN
        EXECUTE '
        CREATE TABLE fd_entry_emotions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          entry_id UUID NOT NULL REFERENCES fd_entry(id) ON DELETE CASCADE,
          emotion_name VARCHAR(50) NOT NULL,
          intensity INTEGER CHECK (intensity BETWEEN 1 AND 10),
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        CREATE INDEX idx_fd_entry_emotions_entry ON fd_entry_emotions(entry_id);
        ';
    END IF;
END $$;

-- Check and create user_emotion_settings
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_emotion_settings') THEN
        EXECUTE '
        CREATE TABLE user_emotion_settings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
          custom_emotions JSONB DEFAULT ''[]''::jsonb,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        CREATE INDEX idx_user_emotion_settings_user ON user_emotion_settings(user_id);
        ';
    END IF;
END $$;

-- Check and create agent_queue
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'agent_queue') THEN
        EXECUTE '
        CREATE TABLE agent_queue (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          agent_type VARCHAR(50) NOT NULL,
          payload JSONB NOT NULL,
          status VARCHAR(20) NOT NULL DEFAULT ''pending'',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        CREATE INDEX idx_agent_queue_status ON agent_queue(status);
        ';
    END IF;
END $$;

-- Check and create recommendations
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'recommendations') THEN
        EXECUTE '
        CREATE TABLE recommendations (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          area_id UUID REFERENCES fd_area(id) ON DELETE SET NULL,
          recommendation_text TEXT NOT NULL,
          priority INTEGER DEFAULT 0,
          status VARCHAR(20) DEFAULT ''active'',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        CREATE INDEX idx_recommendations_user ON recommendations(user_id);
        ';
    END IF;
END $$;

SELECT 'FD v5 tables created successfully' AS result;
