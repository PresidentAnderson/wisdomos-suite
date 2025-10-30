-- ============================================================================
-- KNOWLEDGE GRAPH SYSTEM MIGRATION
-- Description: Creates tables for 3D knowledge graph with real-time collaboration
-- Version: 004
-- Date: 2025-10-30
-- ============================================================================

-- Tag Clusters Table
CREATE TABLE IF NOT EXISTS tag_clusters (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,

    name TEXT NOT NULL,
    summary TEXT NOT NULL,
    color TEXT NOT NULL,
    tags TEXT[] NOT NULL DEFAULT '{}',

    source_type TEXT NOT NULL CHECK (source_type IN ('autobiography', 'coach')),
    confidence REAL NOT NULL DEFAULT 0 CHECK (confidence >= 0 AND confidence <= 1),

    first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    event_count INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tag_clusters_user_source ON tag_clusters(user_id, source_type);
CREATE INDEX idx_tag_clusters_user_last_seen ON tag_clusters(user_id, last_seen_at);
CREATE INDEX idx_tag_clusters_tags ON tag_clusters USING GIN(tags);

-- Tag Relationships Table
CREATE TABLE IF NOT EXISTS tag_relationships (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,

    source_tag TEXT NOT NULL,
    target_tag TEXT NOT NULL,
    strength REAL NOT NULL CHECK (strength >= 0 AND strength <= 1),
    relationship_type TEXT NOT NULL CHECK (relationship_type IN ('similar', 'hierarchical', 'temporal', 'causal')),

    source_type TEXT NOT NULL CHECK (source_type IN ('autobiography', 'coach')),
    cooccurrence_count INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tag_relationships_user_source ON tag_relationships(user_id, source_tag);
CREATE INDEX idx_tag_relationships_user_target ON tag_relationships(user_id, target_tag);
CREATE INDEX idx_tag_relationships_source_type ON tag_relationships(source_type);

-- Meeting Transcripts Table
CREATE TABLE IF NOT EXISTS meeting_transcripts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,

    title TEXT NOT NULL,
    participants TEXT[] NOT NULL DEFAULT '{}',
    audio_url TEXT,
    transcript TEXT NOT NULL,
    summary TEXT NOT NULL,

    tags TEXT[] NOT NULL DEFAULT '{}',
    duration INTEGER,
    clusters_generated JSONB,

    highlights JSONB,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_meeting_transcripts_user_created ON meeting_transcripts(user_id, created_at DESC);
CREATE INDEX idx_meeting_transcripts_tags ON meeting_transcripts USING GIN(tags);

-- Graph Annotations Table
CREATE TABLE IF NOT EXISTS graph_annotations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,

    node_id TEXT NOT NULL,
    node_type TEXT NOT NULL CHECK (node_type IN ('tag', 'cluster', 'event')),
    graph_type TEXT NOT NULL CHECK (graph_type IN ('autobiography', 'coach')),

    content TEXT NOT NULL,
    position JSONB,

    attachments JSONB,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_graph_annotations_user_graph ON graph_annotations(user_id, graph_type);
CREATE INDEX idx_graph_annotations_node ON graph_annotations(node_id);

-- Collaboration Sessions Table
CREATE TABLE IF NOT EXISTS collaboration_sessions (
    id TEXT PRIMARY KEY,
    graph_type TEXT NOT NULL CHECK (graph_type IN ('autobiography', 'coach')),
    session_token TEXT NOT NULL UNIQUE,

    participants JSONB NOT NULL DEFAULT '[]',

    owner_user_id TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_collaboration_sessions_token ON collaboration_sessions(session_token);
CREATE INDEX idx_collaboration_sessions_owner ON collaboration_sessions(owner_user_id);
CREATE INDEX idx_collaboration_sessions_active ON collaboration_sessions(is_active, expires_at);

-- Share Tokens Table
CREATE TABLE IF NOT EXISTS share_tokens (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,

    graph_type TEXT NOT NULL CHECK (graph_type IN ('autobiography', 'coach')),
    token TEXT NOT NULL UNIQUE,

    access_level TEXT NOT NULL CHECK (access_level IN ('view', 'edit')),

    allowed_emails TEXT[] NOT NULL DEFAULT '{}',
    max_uses INTEGER,
    current_uses INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

CREATE INDEX idx_share_tokens_token ON share_tokens(token);
CREATE INDEX idx_share_tokens_user ON share_tokens(user_id);
CREATE INDEX idx_share_tokens_expires ON share_tokens(expires_at) WHERE expires_at IS NOT NULL;

-- Replay Keyframes Table
CREATE TABLE IF NOT EXISTS replay_keyframes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,

    replay_id TEXT NOT NULL,
    graph_type TEXT NOT NULL CHECK (graph_type IN ('autobiography', 'coach')),

    timestamp REAL NOT NULL,
    camera_position JSONB NOT NULL,
    camera_target JSONB NOT NULL,

    audio_url TEXT,
    audio_start REAL,

    visible_nodes JSONB,
    cluster_state JSONB,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_replay_keyframes_user_replay ON replay_keyframes(user_id, replay_id);
CREATE INDEX idx_replay_keyframes_replay_time ON replay_keyframes(replay_id, timestamp);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE tag_clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE tag_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE graph_annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE replay_keyframes ENABLE ROW LEVEL SECURITY;

-- Tag Clusters Policies
CREATE POLICY "Users can view their own tag clusters"
    ON tag_clusters FOR SELECT
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own tag clusters"
    ON tag_clusters FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own tag clusters"
    ON tag_clusters FOR UPDATE
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own tag clusters"
    ON tag_clusters FOR DELETE
    USING (auth.uid()::text = user_id);

-- Tag Relationships Policies
CREATE POLICY "Users can view their own tag relationships"
    ON tag_relationships FOR SELECT
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own tag relationships"
    ON tag_relationships FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own tag relationships"
    ON tag_relationships FOR UPDATE
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own tag relationships"
    ON tag_relationships FOR DELETE
    USING (auth.uid()::text = user_id);

-- Meeting Transcripts Policies
CREATE POLICY "Users can view their own meeting transcripts"
    ON meeting_transcripts FOR SELECT
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own meeting transcripts"
    ON meeting_transcripts FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own meeting transcripts"
    ON meeting_transcripts FOR UPDATE
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own meeting transcripts"
    ON meeting_transcripts FOR DELETE
    USING (auth.uid()::text = user_id);

-- Graph Annotations Policies
CREATE POLICY "Users can view their own annotations"
    ON graph_annotations FOR SELECT
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own annotations"
    ON graph_annotations FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own annotations"
    ON graph_annotations FOR UPDATE
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own annotations"
    ON graph_annotations FOR DELETE
    USING (auth.uid()::text = user_id);

-- Collaboration Sessions Policies
CREATE POLICY "Users can view active collaboration sessions"
    ON collaboration_sessions FOR SELECT
    USING (is_active = true AND expires_at > NOW());

CREATE POLICY "Users can create collaboration sessions"
    ON collaboration_sessions FOR INSERT
    WITH CHECK (auth.uid()::text = owner_user_id);

CREATE POLICY "Users can update their own collaboration sessions"
    ON collaboration_sessions FOR UPDATE
    USING (auth.uid()::text = owner_user_id);

-- Share Tokens Policies
CREATE POLICY "Users can view their own share tokens"
    ON share_tokens FOR SELECT
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create share tokens"
    ON share_tokens FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own share tokens"
    ON share_tokens FOR UPDATE
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own share tokens"
    ON share_tokens FOR DELETE
    USING (auth.uid()::text = user_id);

-- Replay Keyframes Policies
CREATE POLICY "Users can view their own replay keyframes"
    ON replay_keyframes FOR SELECT
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own replay keyframes"
    ON replay_keyframes FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own replay keyframes"
    ON replay_keyframes FOR DELETE
    USING (auth.uid()::text = user_id);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tag_clusters_updated_at
    BEFORE UPDATE ON tag_clusters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tag_relationships_updated_at
    BEFORE UPDATE ON tag_relationships
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meeting_transcripts_updated_at
    BEFORE UPDATE ON meeting_transcripts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_graph_annotations_updated_at
    BEFORE UPDATE ON graph_annotations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Auto-cleanup expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM collaboration_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup (run daily)
-- Note: This requires pg_cron extension which may not be available in all environments
-- If using Supabase, this can be replaced with Edge Function scheduled via cron

-- ============================================================================
-- AUDIO STORAGE BUCKET SETUP
-- ============================================================================

-- Create storage bucket for audio files (Supabase specific)
INSERT INTO storage.buckets (id, name, public)
VALUES ('knowledge-graph-audio', 'knowledge-graph-audio', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for audio bucket
CREATE POLICY "Users can upload their own audio"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'knowledge-graph-audio' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view their own audio"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'knowledge-graph-audio' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own audio"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'knowledge-graph-audio' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- ============================================================================
-- UTILITY VIEWS
-- ============================================================================

-- View for active clusters with recent activity
CREATE OR REPLACE VIEW active_clusters AS
SELECT
    tc.*,
    COUNT(DISTINCT tr.id) as relationship_count
FROM tag_clusters tc
LEFT JOIN tag_relationships tr ON (
    tc.user_id = tr.user_id AND
    tc.source_type = tr.source_type AND
    (tr.source_tag = ANY(tc.tags) OR tr.target_tag = ANY(tc.tags))
)
WHERE tc.last_seen_at > NOW() - INTERVAL '30 days'
GROUP BY tc.id;

-- View for collaboration session participants
CREATE OR REPLACE VIEW collaboration_participants AS
SELECT
    cs.id as session_id,
    cs.graph_type,
    cs.session_token,
    cs.owner_user_id,
    jsonb_array_elements(cs.participants) as participant
FROM collaboration_sessions cs
WHERE cs.is_active = true AND cs.expires_at > NOW();

COMMENT ON TABLE tag_clusters IS 'AI-generated thematic clusters of tags for knowledge graph visualization';
COMMENT ON TABLE tag_relationships IS 'Edges between tags showing semantic relationships';
COMMENT ON TABLE meeting_transcripts IS 'Group meeting recordings with transcription and analysis';
COMMENT ON TABLE graph_annotations IS 'Collaborative notes attached to graph nodes';
COMMENT ON TABLE collaboration_sessions IS 'Active real-time collaboration sessions';
COMMENT ON TABLE share_tokens IS 'Public/private sharing links for knowledge graphs';
COMMENT ON TABLE replay_keyframes IS 'Camera positions and state for session replay animations';
