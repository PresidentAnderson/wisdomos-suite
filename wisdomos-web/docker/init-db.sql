-- WisdomOS Database Initialization Script
-- This script runs when the PostgreSQL container starts for the first time

-- Create additional databases if needed
-- CREATE DATABASE wisdomos_test;

-- Set up extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE wisdomos TO postgres;

-- Create application user (optional, for enhanced security)
-- CREATE USER wisdomos_app WITH PASSWORD 'app_password';
-- GRANT CONNECT ON DATABASE wisdomos TO wisdomos_app;
-- GRANT USAGE ON SCHEMA public TO wisdomos_app;
-- GRANT CREATE ON SCHEMA public TO wisdomos_app;

-- Note: Prisma will handle table creation via migrations
-- This script just sets up the database environment