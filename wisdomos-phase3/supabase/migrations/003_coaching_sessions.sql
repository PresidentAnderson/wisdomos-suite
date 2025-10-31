-- Phoenix Wisdom Coach - Coaching Sessions Schema
-- Migration: Add coaching sessions with AI analysis support

-- Enable pgvector extension for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- Create coaching sessions table
CREATE TABLE IF NOT EXISTS coaching_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Session metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration INTEGER, -- seconds

  -- Content
  transcript TEXT NOT NULL,
  audio_url TEXT,

  -- AI Analysis
  tags TEXT[] DEFAULT '{}',
  sentiment JSONB,
  themes TEXT[],
  insights TEXT,

  -- Semantic search
  embedding VECTOR(1536),

  -- Session context
  session_type TEXT DEFAULT 'reflection', -- reflection, goal_setting, breakthrough, etc.
  mood_before TEXT,
  mood_after TEXT,
  life_area_id UUID REFERENCES life_areas(id),

  -- Privacy
  is_private BOOLEAN DEFAULT true,

  CONSTRAINT valid_duration CHECK (duration >= 0)
);

-- Create indexes for performance
CREATE INDEX idx_coaching_sessions_user_id ON coaching_sessions(user_id);
CREATE INDEX idx_coaching_sessions_created_at ON coaching_sessions(created_at DESC);
CREATE INDEX idx_coaching_sessions_tags ON coaching_sessions USING GIN(tags);
CREATE INDEX idx_coaching_sessions_life_area ON coaching_sessions(life_area_id);

-- Create index for semantic search with pgvector
CREATE INDEX idx_coaching_sessions_embedding ON coaching_sessions
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create session insights table for aggregated analytics
CREATE TABLE IF NOT EXISTS coaching_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Time period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  period_type TEXT NOT NULL, -- daily, weekly, monthly

  -- Aggregated data
  session_count INTEGER DEFAULT 0,
  total_duration INTEGER DEFAULT 0,
  top_tags TEXT[],
  sentiment_trend JSONB,
  growth_score DECIMAL(5,2),

  -- AI-generated summaries
  summary TEXT,
  recommendations TEXT[],

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT unique_user_period UNIQUE(user_id, period_start, period_end, period_type)
);

CREATE INDEX idx_coaching_insights_user_id ON coaching_insights(user_id);
CREATE INDEX idx_coaching_insights_period ON coaching_insights(period_start, period_end);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_coaching_sessions_updated_at
  BEFORE UPDATE ON coaching_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to find similar sessions using cosine similarity
CREATE OR REPLACE FUNCTION find_similar_sessions(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5,
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  transcript TEXT,
  tags TEXT[],
  similarity FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cs.id,
    cs.transcript,
    cs.tags,
    1 - (cs.embedding <=> query_embedding) AS similarity
  FROM coaching_sessions cs
  WHERE
    (p_user_id IS NULL OR cs.user_id = p_user_id)
    AND 1 - (cs.embedding <=> query_embedding) > match_threshold
  ORDER BY cs.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS)
ALTER TABLE coaching_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaching_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies for coaching_sessions
CREATE POLICY "Users can view their own sessions"
  ON coaching_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions"
  ON coaching_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON coaching_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
  ON coaching_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for coaching_insights
CREATE POLICY "Users can view their own insights"
  ON coaching_insights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own insights"
  ON coaching_insights FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON coaching_sessions TO authenticated;
GRANT ALL ON coaching_insights TO authenticated;
GRANT EXECUTE ON FUNCTION find_similar_sessions TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE coaching_sessions IS 'Stores voice and text coaching sessions with AI analysis';
COMMENT ON TABLE coaching_insights IS 'Aggregated coaching analytics and insights per time period';
COMMENT ON FUNCTION find_similar_sessions IS 'Find semantically similar coaching sessions using vector embeddings';
