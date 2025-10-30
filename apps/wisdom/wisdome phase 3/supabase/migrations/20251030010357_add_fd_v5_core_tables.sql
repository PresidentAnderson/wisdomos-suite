-- Safe idempotent FD v5 core tables creation

-- fd_area table
CREATE TABLE IF NOT EXISTS fd_area (
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
CREATE INDEX IF NOT EXISTS idx_fd_area_code ON fd_area(code);
CREATE INDEX IF NOT EXISTS idx_fd_area_active ON fd_area(is_active);

-- fd_dimension table
CREATE TABLE IF NOT EXISTS fd_dimension (
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
CREATE INDEX IF NOT EXISTS idx_fd_dimension_area ON fd_dimension(area_id);

-- fd_entry table
CREATE TABLE IF NOT EXISTS fd_entry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  content TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, entry_date)
);
CREATE INDEX IF NOT EXISTS idx_fd_entry_user_date ON fd_entry(user_id, entry_date);

-- fd_entry_link table
CREATE TABLE IF NOT EXISTS fd_entry_link (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES fd_entry(id) ON DELETE CASCADE,
  area_id UUID NOT NULL REFERENCES fd_area(id) ON DELETE CASCADE,
  dimension_id UUID REFERENCES fd_dimension(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(entry_id, area_id, dimension_id)
);
CREATE INDEX IF NOT EXISTS idx_fd_entry_link_entry ON fd_entry_link(entry_id);
CREATE INDEX IF NOT EXISTS idx_fd_entry_link_area ON fd_entry_link(area_id);

-- fd_score_raw table
CREATE TABLE IF NOT EXISTS fd_score_raw (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  area_id UUID NOT NULL REFERENCES fd_area(id) ON DELETE CASCADE,
  dimension_id UUID REFERENCES fd_dimension(id) ON DELETE SET NULL,
  score_date DATE NOT NULL,
  score_value DECIMAL(5,2) CHECK (score_value BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_fd_score_raw_user_date ON fd_score_raw(user_id, score_date);
CREATE INDEX IF NOT EXISTS idx_fd_score_raw_area ON fd_score_raw(area_id);

-- fd_entry_emotions table
CREATE TABLE IF NOT EXISTS fd_entry_emotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES fd_entry(id) ON DELETE CASCADE,
  emotion_name VARCHAR(50) NOT NULL,
  intensity INTEGER CHECK (intensity BETWEEN 1 AND 10),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_fd_entry_emotions_entry ON fd_entry_emotions(entry_id);

-- user_emotion_settings table
CREATE TABLE IF NOT EXISTS user_emotion_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  custom_emotions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_user_emotion_settings_user ON user_emotion_settings(user_id);

-- agent_queue table
CREATE TABLE IF NOT EXISTS agent_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_type VARCHAR(50) NOT NULL,
  payload JSONB NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_agent_queue_status ON agent_queue(status);
CREATE INDEX IF NOT EXISTS idx_agent_queue_type ON agent_queue(agent_type);

-- recommendations table
CREATE TABLE IF NOT EXISTS recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  area_id UUID REFERENCES fd_area(id) ON DELETE SET NULL,
  recommendation_text TEXT NOT NULL,
  priority INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_recommendations_user ON recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_area ON recommendations(area_id);
