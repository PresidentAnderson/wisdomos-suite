-- WisdomOS AI Recommendations System
-- Stores AI-generated recommendations with historical tracking

-- Create recommendations table
CREATE TABLE IF NOT EXISTS recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'energy', 'focus', 'fulfillment', 'relationships', 'growth'
    priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'

    -- Analytics metadata
    metadata JSONB DEFAULT '{}', -- Store trend data, scores, context
    energy_score INTEGER, -- Current energy score when generated
    focus_score INTEGER, -- Current focus score
    fulfillment_score INTEGER, -- Current fulfillment score

    -- Trend indicators
    energy_trend VARCHAR(20), -- 'rising', 'stable', 'falling'
    focus_trend VARCHAR(20),
    fulfillment_trend VARCHAR(20),

    -- Action tracking
    is_actioned BOOLEAN DEFAULT FALSE,
    actioned_at TIMESTAMP WITH TIME ZONE,
    feedback_rating INTEGER CHECK (feedback_rating BETWEEN 1 AND 5),
    feedback_text TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE, -- Optional expiration for time-sensitive recommendations

    -- Indexes
    CONSTRAINT valid_category CHECK (category IN ('energy', 'focus', 'fulfillment', 'relationships', 'growth', 'health', 'work', 'general')),
    CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high', 'critical'))
);

-- Indexes for performance
CREATE INDEX idx_recommendations_user_id ON recommendations(user_id);
CREATE INDEX idx_recommendations_created_at ON recommendations(created_at DESC);
CREATE INDEX idx_recommendations_category ON recommendations(category);
CREATE INDEX idx_recommendations_priority ON recommendations(priority);
CREATE INDEX idx_recommendations_actioned ON recommendations(is_actioned);
CREATE INDEX idx_recommendations_user_created ON recommendations(user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own recommendations"
    ON recommendations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recommendations"
    ON recommendations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recommendations"
    ON recommendations FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recommendations"
    ON recommendations FOR DELETE
    USING (auth.uid() = user_id);

-- Create recommendation history view (aggregated insights)
CREATE OR REPLACE VIEW recommendation_history AS
SELECT
    user_id,
    category,
    COUNT(*) as total_recommendations,
    COUNT(*) FILTER (WHERE is_actioned = true) as actioned_count,
    ROUND(AVG(feedback_rating), 2) as avg_rating,
    AVG(energy_score) as avg_energy_at_recommendation,
    AVG(focus_score) as avg_focus_at_recommendation,
    AVG(fulfillment_score) as avg_fulfillment_at_recommendation,
    DATE_TRUNC('week', created_at) as week_start
FROM recommendations
GROUP BY user_id, category, DATE_TRUNC('week', created_at);

-- Function to clean up expired recommendations
CREATE OR REPLACE FUNCTION cleanup_expired_recommendations()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM recommendations
    WHERE expires_at IS NOT NULL
    AND expires_at < NOW();

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get trending recommendation categories
CREATE OR REPLACE FUNCTION get_trending_categories(p_user_id UUID, p_days INTEGER DEFAULT 30)
RETURNS TABLE(category VARCHAR, count BIGINT, avg_rating NUMERIC) AS $$
BEGIN
    RETURN QUERY
    SELECT
        r.category,
        COUNT(*) as count,
        ROUND(AVG(r.feedback_rating), 2) as avg_rating
    FROM recommendations r
    WHERE r.user_id = p_user_id
    AND r.created_at >= NOW() - (p_days || ' days')::INTERVAL
    GROUP BY r.category
    ORDER BY count DESC, avg_rating DESC NULLS LAST
    LIMIT 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT SELECT ON recommendation_history TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_recommendations() TO authenticated;
GRANT EXECUTE ON FUNCTION get_trending_categories(UUID, INTEGER) TO authenticated;

-- Create trigger to auto-expire old recommendations (optional)
-- Recommendations older than 30 days are considered stale
CREATE OR REPLACE FUNCTION set_recommendation_expiration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.expires_at IS NULL THEN
        NEW.expires_at := NEW.created_at + INTERVAL '30 days';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_recommendation_expiration
    BEFORE INSERT ON recommendations
    FOR EACH ROW
    EXECUTE FUNCTION set_recommendation_expiration();

-- Comments for documentation
COMMENT ON TABLE recommendations IS 'Stores AI-generated personalized recommendations with historical tracking';
COMMENT ON COLUMN recommendations.metadata IS 'JSON metadata including trend data, context, and generation parameters';
COMMENT ON COLUMN recommendations.energy_trend IS 'Energy pattern trend at time of recommendation: rising, stable, or falling';
COMMENT ON COLUMN recommendations.is_actioned IS 'Whether user has acted on this recommendation';
COMMENT ON COLUMN recommendations.feedback_rating IS 'User rating of recommendation helpfulness (1-5 stars)';
