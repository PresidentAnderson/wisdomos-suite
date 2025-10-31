
BEGIN;
CREATE EXTENSION IF NOT EXISTS pgtap;
SELECT plan(6);

SELECT has_function('public','status_color_numeric(numeric,numeric,numeric,numeric)','status_color_numeric exists');
SELECT has_function('public','status_color_bool(boolean)','status_color_bool exists');

SELECT has_view('public','vw_dashboard_status','vw_dashboard_status exists');
SELECT has_view('public','vw_dashboard_overall','vw_dashboard_overall exists');

SELECT is( (SELECT public.status_color_numeric(8,7,5,null)::text), 'green', '8 with 7/5 thresholds => green');
SELECT is( (SELECT public.status_color_bool(false)::text), 'red', 'false => red');

SELECT * FROM finish();
ROLLBACK;
