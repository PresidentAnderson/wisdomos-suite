
BEGIN;
CREATE EXTENSION IF NOT EXISTS pgtap;
SELECT plan(10);

SELECT ok((SELECT relrowsecurity FROM pg_class WHERE relname = 'areas') = true, 'areas has RLS');
SELECT ok((SELECT relrowsecurity FROM pg_class WHERE relname = 'dimensions') = true, 'dimensions has RLS');
SELECT ok((SELECT relrowsecurity FROM pg_class WHERE relname = 'journal_entries') = true, 'journal_entries has RLS');
SELECT ok((SELECT relrowsecurity FROM pg_class WHERE relname = 'attachments') = true, 'attachments has RLS');
SELECT ok((SELECT relrowsecurity FROM pg_class WHERE relname = 'integrity_events') = true, 'integrity_events has RLS');
SELECT ok((SELECT relrowsecurity FROM pg_class WHERE relname = 'forgiveness_logs') = true, 'forgiveness_logs has RLS');
SELECT ok((SELECT relrowsecurity FROM pg_class WHERE relname = 'reconciliation_logs') = true, 'reconciliation_logs has RLS');
SELECT ok((SELECT relrowsecurity FROM pg_class WHERE relname = 'wfi_periods') = true, 'wfi_periods has RLS');
SELECT ok((SELECT relrowsecurity FROM pg_class WHERE relname = 'dashboards') = true, 'dashboards has RLS');
SELECT ok((SELECT relrowsecurity FROM pg_class WHERE relname = 'dashboard_snapshots') = true, 'dashboard_snapshots has RLS');

SELECT * FROM finish();
ROLLBACK;
