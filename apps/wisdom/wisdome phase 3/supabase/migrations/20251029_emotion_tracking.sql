-- =====================================================
-- Emotion Tracking System Migration
-- =====================================================
-- Purpose: Store user emotion preferences and usage
-- Date: 2025-10-29
-- Version: 1.0
-- =====================================================

-- Create user_emotion_settings table
CREATE TABLE IF NOT EXISTS public.user_emotion_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled_emotion_ids TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create fd_entry_emotions table (links emotions to journal entries)
CREATE TABLE IF NOT EXISTS public.fd_entry_emotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  entry_id UUID NOT NULL REFERENCES fd_entry(id) ON DELETE CASCADE,
  emotion_id TEXT NOT NULL, -- References emotion library (not FK, library is in code)
  intensity INTEGER CHECK (intensity BETWEEN 1 AND 5), -- Optional intensity rating
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_emotion_settings_user_id
  ON public.user_emotion_settings(user_id);

CREATE INDEX IF NOT EXISTS idx_fd_entry_emotions_user_id
  ON public.fd_entry_emotions(user_id);

CREATE INDEX IF NOT EXISTS idx_fd_entry_emotions_entry_id
  ON public.fd_entry_emotions(entry_id);

CREATE INDEX IF NOT EXISTS idx_fd_entry_emotions_emotion_id
  ON public.fd_entry_emotions(emotion_id);

CREATE INDEX IF NOT EXISTS idx_fd_entry_emotions_created_at
  ON public.fd_entry_emotions(created_at DESC);

-- Composite index for usage queries
CREATE INDEX IF NOT EXISTS idx_fd_entry_emotions_user_emotion_date
  ON public.fd_entry_emotions(user_id, emotion_id, created_at DESC);

-- =====================================================
-- Row-Level Security (RLS) Policies
-- =====================================================

-- Enable RLS
ALTER TABLE public.user_emotion_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fd_entry_emotions ENABLE ROW LEVEL SECURITY;

-- user_emotion_settings policies
CREATE POLICY "Users can view own emotion settings"
  ON public.user_emotion_settings
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own emotion settings"
  ON public.user_emotion_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own emotion settings"
  ON public.user_emotion_settings
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own emotion settings"
  ON public.user_emotion_settings
  FOR DELETE
  USING (auth.uid() = user_id);

-- fd_entry_emotions policies
CREATE POLICY "Users can view own entry emotions"
  ON public.fd_entry_emotions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own entry emotions"
  ON public.fd_entry_emotions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own entry emotions"
  ON public.fd_entry_emotions
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own entry emotions"
  ON public.fd_entry_emotions
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- Helper Functions
-- =====================================================

-- Function to get emotion usage statistics for a user
CREATE OR REPLACE FUNCTION get_emotion_usage_stats(
  p_user_id UUID,
  p_days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
  emotion_id TEXT,
  usage_count BIGINT,
  last_used TIMESTAMP WITH TIME ZONE,
  avg_intensity NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.emotion_id,
    COUNT(*)::BIGINT AS usage_count,
    MAX(e.created_at) AS last_used,
    AVG(e.intensity)::NUMERIC AS avg_intensity
  FROM public.fd_entry_emotions e
  WHERE e.user_id = p_user_id
    AND e.created_at >= NOW() - (p_days_back || ' days')::INTERVAL
  GROUP BY e.emotion_id
  ORDER BY usage_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get top emotions for a time period
CREATE OR REPLACE FUNCTION get_top_emotions(
  p_user_id UUID,
  p_start_date TIMESTAMP WITH TIME ZONE,
  p_end_date TIMESTAMP WITH TIME ZONE,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  emotion_id TEXT,
  usage_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.emotion_id,
    COUNT(*)::BIGINT AS usage_count
  FROM public.fd_entry_emotions e
  WHERE e.user_id = p_user_id
    AND e.created_at >= p_start_date
    AND e.created_at <= p_end_date
  GROUP BY e.emotion_id
  ORDER BY usage_count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get emotion trends (week over week)
CREATE OR REPLACE FUNCTION get_emotion_trends(
  p_user_id UUID,
  p_emotion_id TEXT
)
RETURNS TABLE (
  week_start DATE,
  usage_count BIGINT,
  avg_intensity NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE_TRUNC('week', e.created_at)::DATE AS week_start,
    COUNT(*)::BIGINT AS usage_count,
    AVG(e.intensity)::NUMERIC AS avg_intensity
  FROM public.fd_entry_emotions e
  WHERE e.user_id = p_user_id
    AND e.emotion_id = p_emotion_id
    AND e.created_at >= NOW() - INTERVAL '90 days'
  GROUP BY week_start
  ORDER BY week_start DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Triggers for updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_emotion_settings_updated_at
  BEFORE UPDATE ON public.user_emotion_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Comments for documentation
-- =====================================================

COMMENT ON TABLE public.user_emotion_settings IS
  'Stores which emotions each user has enabled for their journal entries';

COMMENT ON TABLE public.fd_entry_emotions IS
  'Links emotions to journal entries and tracks usage over time';

COMMENT ON COLUMN public.user_emotion_settings.enabled_emotion_ids IS
  'Array of emotion IDs from the emotion library that the user wants to see';

COMMENT ON COLUMN public.fd_entry_emotions.emotion_id IS
  'References emotion from the emotion library (defined in application code)';

COMMENT ON COLUMN public.fd_entry_emotions.intensity IS
  'Optional 1-5 rating of how intensely the emotion was felt';

-- =====================================================
-- Grant permissions
-- =====================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_emotion_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fd_entry_emotions TO authenticated;

GRANT EXECUTE ON FUNCTION get_emotion_usage_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_top_emotions TO authenticated;
GRANT EXECUTE ON FUNCTION get_emotion_trends TO authenticated;

-- =====================================================
-- Migration Complete
-- =====================================================

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Emotion tracking system migration completed successfully';
  RAISE NOTICE '   - user_emotion_settings table created';
  RAISE NOTICE '   - fd_entry_emotions table created';
  RAISE NOTICE '   - Indexes created for performance';
  RAISE NOTICE '   - RLS policies enabled';
  RAISE NOTICE '   - Helper functions created';
END $$;
