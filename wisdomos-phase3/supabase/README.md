# Supabase Configuration

## Purpose
Supabase backend configuration including migrations, functions, and local development setup.

## What's Inside

### migrations/
SQL migration files for database schema changes:
- Chronologically ordered migration files
- Row-Level Security (RLS) policies
- Database functions and triggers
- Table definitions

### functions/
Supabase Edge Functions (Deno):
- Serverless API endpoints
- Webhook handlers
- Background jobs
- Custom business logic

### config.toml
Supabase project configuration:
- Database settings
- Auth providers
- Storage configuration
- Edge function settings

## Key Features
- PostgreSQL database
- Row-Level Security (RLS)
- Realtime subscriptions
- Authentication
- File storage
- Edge Functions

## Development
```bash
# Start local Supabase
supabase start

# Create new migration
supabase migration new migration_name

# Apply migrations
supabase db push

# Deploy edge function
supabase functions deploy function_name
```

## Importance: ⭐⭐⭐⭐⭐
Critical - This is the backend infrastructure for WisdomOS.
