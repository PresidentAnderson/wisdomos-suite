
## Dashboard Status Layer
After applying migrations 0001–0003, you can query:
```sql
select * from vw_dashboard_status;
select * from vw_dashboard_overall;
```

## Testing (pgTAP)
Create extension and run tests:
```sql
CREATE EXTENSION IF NOT EXISTS pgtap;
```
```bash
supabase db push
psql $SUPABASE_DB_URL -f tests/pgTAP/schema_tests.sql
psql $SUPABASE_DB_URL -f tests/pgTAP/rls_tests.sql
psql $SUPABASE_DB_URL -f tests/pgTAP/dashboard_tests.sql
```
