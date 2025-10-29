-- =====================================================
-- pg_cron Jobs Configuration
-- =====================================================
-- Purpose: Automated scheduled tasks for Fulfillment v5
-- Requires: pg_cron extension
-- Date: 2025-10-29
-- =====================================================

-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- =====================================================
-- 1. DAILY ROLLUP JOBS
-- =====================================================

-- Daily score aggregation (runs at 1 AM daily)
SELECT cron.schedule(
  'daily-score-rollup',
  '0 1 * * *', -- 1 AM daily
  $$
  INSERT INTO fd_score_rollup (user_id, tenant_id, area_id, period, score, confidence)
  SELECT
    sr.user_id,
    sr.tenant_id,
    sr.area_id,
    TO_CHAR(CURRENT_DATE - INTERVAL '1 day', 'YYYY-MM') AS period,
    AVG(sr.score) AS score,
    CASE
      WHEN COUNT(*) >= 10 THEN 0.9
      WHEN COUNT(*) >= 5 THEN 0.7
      WHEN COUNT(*) >= 2 THEN 0.5
      ELSE 0.3
    END AS confidence
  FROM fd_score_raw sr
  WHERE sr.created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 day')
    AND sr.created_at < DATE_TRUNC('month', CURRENT_DATE)
  GROUP BY sr.user_id, sr.tenant_id, sr.area_id
  ON CONFLICT (user_id, area_id, period)
  DO UPDATE SET
    score = EXCLUDED.score,
    confidence = EXCLUDED.confidence,
    updated_at = NOW();
  $$
);

-- Daily ritual reminders (runs at 8 AM daily)
SELECT cron.schedule(
  'daily-ritual-reminders',
  '0 8 * * *', -- 8 AM daily
  $$
  INSERT INTO public.notifications (profile_id, type, channel, title, message, scheduled_for)
  SELECT
    r.profile_id,
    'ritual_reminder'::notification_type,
    'in_app'::notification_channel,
    'Time for: ' || r.title,
    'Your daily ritual awaits. Take a moment to practice: ' || r.title,
    NOW()
  FROM public.rituals r
  WHERE r.is_active = TRUE
    AND r.cadence = 'daily'
    AND r.reminder_enabled = TRUE
    AND NOT EXISTS (
      SELECT 1
      FROM public.ritual_sessions rs
      WHERE rs.ritual_id = r.id
        AND DATE(rs.occurred_at) = CURRENT_DATE
    );
  $$
);

-- Daily goal check (runs at 9 AM daily)
SELECT cron.schedule(
  'daily-goal-check',
  '0 9 * * *', -- 9 AM daily
  $$
  INSERT INTO public.notifications (profile_id, type, channel, title, message, resource_type, resource_id, scheduled_for)
  SELECT
    g.profile_id,
    'goal_due'::notification_type,
    'in_app'::notification_channel,
    'Goal Due: ' || g.title,
    'Your goal "' || g.title || '" is due soon. Time to make progress!',
    'goal',
    g.id,
    NOW()
  FROM public.goals g
  WHERE g.status = 'active'
    AND g.target_date <= CURRENT_DATE + INTERVAL '7 days'
    AND g.target_date >= CURRENT_DATE
    AND NOT EXISTS (
      SELECT 1
      FROM public.notifications n
      WHERE n.profile_id = g.profile_id
        AND n.resource_id = g.id
        AND n.type = 'goal_due'
        AND DATE(n.created_at) = CURRENT_DATE
    );
  $$
);

-- Daily integrity check (runs at 7 PM daily)
SELECT cron.schedule(
  'daily-integrity-check',
  '0 19 * * *', -- 7 PM daily
  $$
  INSERT INTO public.notifications (profile_id, type, channel, title, message, scheduled_for)
  SELECT DISTINCT
    il.user_id AS profile_id,
    'integrity_alert'::notification_type,
    'in_app'::notification_channel,
    'Unresolved Integrity Items',
    'You have ' || COUNT(*) || ' unresolved integrity items that need attention.',
    NOW()
  FROM fd_integrity_log il
  WHERE il.resolved_at IS NULL
    AND il.created_at < CURRENT_DATE - INTERVAL '7 days'
  GROUP BY il.user_id
  HAVING COUNT(*) > 0;
  $$
);

-- =====================================================
-- 2. WEEKLY ROLLUP JOBS
-- =====================================================

-- Weekly ritual report (runs Sunday at 6 PM)
SELECT cron.schedule(
  'weekly-ritual-report',
  '0 18 * * 0', -- 6 PM every Sunday
  $$
  INSERT INTO public.notifications (profile_id, type, channel, title, message, metadata, scheduled_for)
  SELECT
    r.profile_id,
    'system'::notification_type,
    'in_app'::notification_channel,
    'Weekly Ritual Report',
    'You completed ' || COUNT(CASE WHEN rs.did_happen THEN 1 END) || ' out of ' || COUNT(*) || ' rituals this week.',
    jsonb_build_object(
      'total', COUNT(*),
      'completed', COUNT(CASE WHEN rs.did_happen THEN 1 END),
      'rate', ROUND(COUNT(CASE WHEN rs.did_happen THEN 1 END)::NUMERIC / NULLIF(COUNT(*), 0) * 100, 1)
    ),
    NOW()
  FROM public.rituals r
  LEFT JOIN public.ritual_sessions rs ON rs.ritual_id = r.id
    AND rs.occurred_at >= DATE_TRUNC('week', CURRENT_DATE)
    AND rs.occurred_at < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '1 week'
  WHERE r.is_active = TRUE
  GROUP BY r.profile_id;
  $$
);

-- Weekly relationship check (runs Friday at 5 PM)
SELECT cron.schedule(
  'weekly-relationship-check',
  '0 17 * * 5', -- 5 PM every Friday
  $$
  INSERT INTO public.notifications (profile_id, type, channel, title, message, resource_type, resource_id, scheduled_for)
  SELECT
    r.profile_id,
    'system'::notification_type,
    'in_app'::notification_channel,
    'Relationship Check-In',
    'You haven''t logged activity with ' || r.person_name || ' recently. Consider reaching out!',
    'relationship',
    r.id,
    NOW()
  FROM public.relationships r
  WHERE r.status = 'active'
    AND r.frequency_desired >= 5
    AND NOT EXISTS (
      SELECT 1
      FROM public.relationship_events re
      WHERE re.relationship_id = r.id
        AND re.occurred_at >= CURRENT_DATE - INTERVAL '14 days'
    );
  $$
);

-- =====================================================
-- 3. MONTHLY ROLLUP JOBS
-- =====================================================

-- Monthly review generation (runs 1st of month at 2 AM)
SELECT cron.schedule(
  'monthly-review-generation',
  '0 2 1 * *', -- 2 AM on 1st of month
  $$
  INSERT INTO fd_review_month (user_id, tenant_id, month, report_json, gfs, confidence)
  SELECT
    p.id AS user_id,
    'SYSTEM' AS tenant_id, -- Replace with actual tenant_id logic
    TO_CHAR(DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month'), 'YYYY-MM') AS month,
    fn_fd_rollup_month(p.id, TO_CHAR(DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month'), 'YYYY-MM')) AS report_json,
    fn_calculate_gfs(p.id, TO_CHAR(DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month'), 'YYYY-MM')) AS gfs,
    0.75 AS confidence
  FROM public.profiles p
  ON CONFLICT (user_id, month) DO NOTHING;
  $$
);

-- Monthly review notification (runs 1st of month at 9 AM)
SELECT cron.schedule(
  'monthly-review-notification',
  '0 9 1 * *', -- 9 AM on 1st of month
  $$
  INSERT INTO public.notifications (profile_id, type, channel, title, message, scheduled_for)
  SELECT
    p.id AS profile_id,
    'monthly_review'::notification_type,
    'in_app'::notification_channel,
    'Monthly Review Ready',
    'Your monthly review for ' || TO_CHAR(CURRENT_DATE - INTERVAL '1 month', 'Month YYYY') || ' is ready!',
    NOW()
  FROM public.profiles p;
  $$
);

-- Monthly dashboard snapshot (runs 1st of month at 3 AM)
SELECT cron.schedule(
  'monthly-dashboard-snapshot',
  '0 3 1 * *', -- 3 AM on 1st of month
  $$
  INSERT INTO public.dashboard_snapshots (dashboard_id, period, data, gfs)
  SELECT
    d.id AS dashboard_id,
    TO_CHAR(DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month'), 'YYYY-MM') AS period,
    jsonb_build_object(
      'layout', d.layout,
      'gfs', fn_calculate_gfs(d.profile_id, TO_CHAR(DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month'), 'YYYY-MM')),
      'captured_at', NOW()
    ) AS data,
    fn_calculate_gfs(d.profile_id, TO_CHAR(DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month'), 'YYYY-MM')) AS gfs
  FROM public.dashboards d
  WHERE d.is_default = TRUE
  ON CONFLICT (dashboard_id, period) DO NOTHING;
  $$
);

-- =====================================================
-- 4. QUARTERLY ROLLUP JOBS
-- =====================================================

-- Quarterly review generation (runs 1st of quarter at 2 AM)
SELECT cron.schedule(
  'quarterly-review-generation',
  '0 2 1 1,4,7,10 *', -- 2 AM on Jan 1, Apr 1, Jul 1, Oct 1
  $$
  INSERT INTO fd_review_quarter (user_id, tenant_id, quarter, report_json, gfs, confidence)
  SELECT
    p.id AS user_id,
    'SYSTEM' AS tenant_id, -- Replace with actual tenant_id logic
    TO_CHAR(DATE_TRUNC('quarter', CURRENT_DATE - INTERVAL '1 quarter'), 'YYYY-"Q"Q') AS quarter,
    fn_fd_rollup_quarter(p.id, TO_CHAR(DATE_TRUNC('quarter', CURRENT_DATE - INTERVAL '1 quarter'), 'YYYY-"Q"Q')) AS report_json,
    fn_calculate_gfs(p.id, TO_CHAR(DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month'), 'YYYY-MM')) AS gfs,
    0.85 AS confidence
  FROM public.profiles p
  ON CONFLICT (user_id, quarter) DO NOTHING;
  $$
);

-- Quarterly review notification (runs 1st of quarter at 9 AM)
SELECT cron.schedule(
  'quarterly-review-notification',
  '0 9 1 1,4,7,10 *', -- 9 AM on Jan 1, Apr 1, Jul 1, Oct 1
  $$
  INSERT INTO public.notifications (profile_id, type, channel, title, message, scheduled_for)
  SELECT
    p.id AS profile_id,
    'quarterly_review'::notification_type,
    'in_app'::notification_channel,
    'Quarterly Review Ready',
    'Your quarterly review for ' || TO_CHAR(DATE_TRUNC('quarter', CURRENT_DATE - INTERVAL '1 quarter'), '"Q"Q YYYY') || ' is ready!',
    NOW()
  FROM public.profiles p;
  $$
);

-- =====================================================
-- 5. MAINTENANCE JOBS
-- =====================================================

-- Clean old notifications (runs daily at 2 AM)
SELECT cron.schedule(
  'cleanup-old-notifications',
  '0 2 * * *', -- 2 AM daily
  $$
  DELETE FROM public.notifications
  WHERE status = 'read'
    AND read_at < CURRENT_DATE - INTERVAL '90 days';
  $$
);

-- Clean old webhook deliveries (runs weekly on Monday at 3 AM)
SELECT cron.schedule(
  'cleanup-old-webhook-deliveries',
  '0 3 * * 1', -- 3 AM every Monday
  $$
  DELETE FROM public.webhook_deliveries
  WHERE created_at < CURRENT_DATE - INTERVAL '30 days';
  $$
);

-- Update API key usage stats (runs hourly)
SELECT cron.schedule(
  'update-api-key-stats',
  '0 * * * *', -- Every hour
  $$
  -- Could aggregate API usage from logs
  -- This is a placeholder for future implementation
  SELECT 1;
  $$
);

-- Archive old audit logs (runs monthly on 1st at 4 AM)
SELECT cron.schedule(
  'archive-old-audit-logs',
  '0 4 1 * *', -- 4 AM on 1st of month
  $$
  -- Archive to cold storage or separate table
  CREATE TABLE IF NOT EXISTS public.audit_log_archive (LIKE public.audit_log INCLUDING ALL);

  WITH archived AS (
    DELETE FROM public.audit_log
    WHERE created_at < CURRENT_DATE - INTERVAL '6 months'
    RETURNING *
  )
  INSERT INTO public.audit_log_archive
  SELECT * FROM archived;
  $$
);

-- =====================================================
-- 6. MONITORING JOBS
-- =====================================================

-- Check system health (runs every 15 minutes)
SELECT cron.schedule(
  'system-health-check',
  '*/15 * * * *', -- Every 15 minutes
  $$
  -- Log system metrics to monitoring table
  INSERT INTO public.audit_log (action, resource_type, metadata)
  VALUES (
    'api_call'::audit_action,
    'system_health',
    jsonb_build_object(
      'timestamp', NOW(),
      'active_users_24h', (
        SELECT COUNT(DISTINCT profile_id)
        FROM public.audit_log
        WHERE created_at >= NOW() - INTERVAL '24 hours'
      ),
      'notifications_pending', (
        SELECT COUNT(*)
        FROM public.notifications
        WHERE status = 'pending'
      ),
      'goals_overdue', (
        SELECT COUNT(*)
        FROM public.goals
        WHERE status = 'active' AND target_date < CURRENT_DATE
      )
    )
  );
  $$
);

-- =====================================================
-- 7. VIEW JOB STATUS
-- =====================================================

-- Query to view all scheduled jobs
-- SELECT * FROM cron.job ORDER BY jobname;

-- Query to view job run history
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 100;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

COMMENT ON EXTENSION pg_cron IS 'Automated job scheduler for Fulfillment v5 backend';
