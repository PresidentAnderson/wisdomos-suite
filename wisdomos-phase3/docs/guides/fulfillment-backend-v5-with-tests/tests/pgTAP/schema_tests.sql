
BEGIN;
CREATE EXTENSION IF NOT EXISTS pgtap;
SELECT plan(12);

SELECT has_table('public','areas','areas table exists');
SELECT has_table('public','dimensions','dimensions table exists');
SELECT has_table('public','metrics','metrics table exists');
SELECT has_table('public','metric_entries','metric_entries exists');
SELECT has_table('public','journals','journals exists');
SELECT has_table('public','journal_entries','journal_entries exists');
SELECT has_table('public','work_finance_integrations','wfi exists');
SELECT has_table('public','wfi_periods','wfi_periods exists');

SELECT has_view('public','vw_metric_latest','vw_metric_latest exists');
SELECT has_view('public','vw_metric_30d','vw_metric_30d exists');
SELECT has_view('public','vw_wfi_period_summary','vw_wfi_period_summary exists');
SELECT has_view('public','vw_dashboard_current','vw_dashboard_current exists');

SELECT * FROM finish();
ROLLBACK;
