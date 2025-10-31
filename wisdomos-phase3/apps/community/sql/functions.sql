-- Additional SQL functions for WisdomOS Community Hub

-- Function to increment wisdom circle member count
CREATE OR REPLACE FUNCTION increment_circle_members(circle_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE wisdom_circles 
    SET member_count = member_count + 1,
        updated_at = NOW()
    WHERE id = circle_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement wisdom circle member count
CREATE OR REPLACE FUNCTION decrement_circle_members(circle_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE wisdom_circles 
    SET member_count = GREATEST(member_count - 1, 0),
        updated_at = NOW()
    WHERE id = circle_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment contribution points for user
CREATE OR REPLACE FUNCTION add_contribution_points(user_id UUID, points INTEGER DEFAULT 10)
RETURNS VOID AS $$
BEGIN
    UPDATE user_profiles 
    SET contribution_points = contribution_points + points,
        updated_at = NOW()
    WHERE user_id = add_contribution_points.user_id;
    
    -- Check for level up (every 100 points = 1 level)
    UPDATE user_profiles 
    SET wisdom_level = FLOOR(contribution_points / 100) + 1,
        updated_at = NOW()
    WHERE user_id = add_contribution_points.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user streak
CREATE OR REPLACE FUNCTION update_user_streak(user_id UUID)
RETURNS VOID AS $$
DECLARE
    last_activity DATE;
    current_date DATE := CURRENT_DATE;
BEGIN
    -- Get the last activity date for this user
    SELECT MAX(DATE(created_at)) INTO last_activity
    FROM (
        SELECT created_at FROM boundary_audits WHERE boundary_audits.user_id = update_user_streak.user_id
        UNION ALL
        SELECT created_at FROM upset_documentations WHERE upset_documentations.user_id = update_user_streak.user_id
        UNION ALL
        SELECT created_at FROM fulfillment_displays WHERE fulfillment_displays.user_id = update_user_streak.user_id
        UNION ALL
        SELECT created_at FROM autobiography_entries WHERE autobiography_entries.user_id = update_user_streak.user_id
        UNION ALL
        SELECT created_at FROM contributions WHERE contributions.user_id = update_user_streak.user_id
    ) activities;

    -- Update streak based on activity
    IF last_activity IS NULL THEN
        -- First activity ever
        UPDATE user_profiles 
        SET streak_count = 1,
            updated_at = NOW()
        WHERE user_id = update_user_streak.user_id;
    ELSIF last_activity = current_date THEN
        -- Activity today, keep current streak
        -- Do nothing
        NULL;
    ELSIF last_activity = current_date - INTERVAL '1 day' THEN
        -- Activity yesterday, increment streak
        UPDATE user_profiles 
        SET streak_count = streak_count + 1,
            updated_at = NOW()
        WHERE user_id = update_user_streak.user_id;
    ELSE
        -- Streak broken, reset to 1
        UPDATE user_profiles 
        SET streak_count = 1,
            updated_at = NOW()
        WHERE user_id = update_user_streak.user_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user dashboard stats
CREATE OR REPLACE FUNCTION get_user_dashboard_stats(user_id UUID)
RETURNS JSON AS $$
DECLARE
    stats JSON;
BEGIN
    SELECT json_build_object(
        'boundary_audits_count', (
            SELECT COUNT(*) FROM boundary_audits WHERE boundary_audits.user_id = get_user_dashboard_stats.user_id
        ),
        'upset_docs_count', (
            SELECT COUNT(*) FROM upset_documentations WHERE upset_documentations.user_id = get_user_dashboard_stats.user_id
        ),
        'fulfillment_displays_count', (
            SELECT COUNT(*) FROM fulfillment_displays WHERE fulfillment_displays.user_id = get_user_dashboard_stats.user_id
        ),
        'autobiography_entries_count', (
            SELECT COUNT(*) FROM autobiography_entries WHERE autobiography_entries.user_id = get_user_dashboard_stats.user_id
        ),
        'contributions_count', (
            SELECT COUNT(*) FROM contributions WHERE contributions.user_id = get_user_dashboard_stats.user_id
        ),
        'circles_count', (
            SELECT COUNT(*) FROM circle_memberships WHERE circle_memberships.user_id = get_user_dashboard_stats.user_id
        ),
        'achievements_count', (
            SELECT COUNT(*) FROM user_achievements WHERE user_achievements.user_id = get_user_dashboard_stats.user_id
        ),
        'recent_activity', (
            SELECT json_agg(
                json_build_object(
                    'type', activity_type,
                    'title', title,
                    'date', created_at
                )
                ORDER BY created_at DESC
            )
            FROM (
                SELECT 'boundary_audit' as activity_type, title, created_at
                FROM boundary_audits WHERE boundary_audits.user_id = get_user_dashboard_stats.user_id
                UNION ALL
                SELECT 'upset_documentation' as activity_type, title, created_at
                FROM upset_documentations WHERE upset_documentations.user_id = get_user_dashboard_stats.user_id
                UNION ALL
                SELECT 'fulfillment_display' as activity_type, title, created_at
                FROM fulfillment_displays WHERE fulfillment_displays.user_id = get_user_dashboard_stats.user_id
                UNION ALL
                SELECT 'autobiography_entry' as activity_type, title, created_at
                FROM autobiography_entries WHERE autobiography_entries.user_id = get_user_dashboard_stats.user_id
                UNION ALL
                SELECT 'contribution' as activity_type, title, created_at
                FROM contributions WHERE contributions.user_id = get_user_dashboard_stats.user_id
            ) all_activities
            ORDER BY created_at DESC
            LIMIT 10
        )
    ) INTO stats;
    
    RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update contribution points when a new contribution is created
CREATE OR REPLACE FUNCTION trigger_add_contribution_points()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM add_contribution_points(NEW.user_id, 10);
    PERFORM update_user_streak(NEW.user_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update streak when any content is created
CREATE OR REPLACE FUNCTION trigger_update_streak()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM update_user_streak(NEW.user_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER add_points_on_contribution
    AFTER INSERT ON contributions
    FOR EACH ROW
    EXECUTE FUNCTION trigger_add_contribution_points();

CREATE TRIGGER update_streak_boundary_audit
    AFTER INSERT ON boundary_audits
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_streak();

CREATE TRIGGER update_streak_upset_doc
    AFTER INSERT ON upset_documentations
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_streak();

CREATE TRIGGER update_streak_fulfillment
    AFTER INSERT ON fulfillment_displays
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_streak();

CREATE TRIGGER update_streak_autobiography
    AFTER INSERT ON autobiography_entries
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_streak();