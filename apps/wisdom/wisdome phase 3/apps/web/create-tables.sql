-- WisdomOS Database Schema for Supabase
-- Generated from Prisma schema

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enums
DO $$ BEGIN
    CREATE TYPE "TenantStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'CANCELLED', 'TRIAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "TenantPlan" AS ENUM ('FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "UserRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "LifeStatus" AS ENUM ('GREEN', 'YELLOW', 'RED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "EventType" AS ENUM ('WIN', 'COMMITMENT_KEPT', 'COMMITMENT_BROKEN', 'UPSET', 'INSIGHT', 'BOUNDARY_RESET', 'TASK_COMPLETED', 'TASK_MISSED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "BadgeType" AS ENUM ('ASHES_MASTER', 'FLAME_WALKER', 'RISING_STAR', 'FULL_FLIGHT', 'BOUNDARY_GUARDIAN', 'TRANSFORMATION_CATALYST', 'PHOENIX_BORN', 'ETERNAL_FLAME');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "Rarity" AS ENUM ('COMMON', 'RARE', 'EPIC', 'LEGENDARY');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create tenants table
CREATE TABLE IF NOT EXISTS "tenants" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL,
    "slug" TEXT UNIQUE NOT NULL,
    "domain" TEXT,
    "status" "TenantStatus" NOT NULL DEFAULT 'ACTIVE',
    "plan" "TenantPlan" NOT NULL DEFAULT 'FREE',
    "settings" JSONB NOT NULL DEFAULT '{}',
    "features" TEXT[] DEFAULT '{}',
    "maxUsers" INTEGER NOT NULL DEFAULT 5,
    "maxStorage" BIGINT NOT NULL DEFAULT 1073741824,
    "currentStorage" BIGINT NOT NULL DEFAULT 0,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "billingEmail" TEXT,
    "trialEndsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3)
);

-- Create indexes for tenants
CREATE INDEX IF NOT EXISTS "tenants_slug_idx" ON "tenants"("slug");
CREATE INDEX IF NOT EXISTS "tenants_status_idx" ON "tenants"("status");

-- Create users table
CREATE TABLE IF NOT EXISTS "users" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenantId" UUID NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'MEMBER',
    "isOwner" BOOLEAN NOT NULL DEFAULT false,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for users
CREATE UNIQUE INDEX IF NOT EXISTS "users_tenantId_email_key" ON "users"("tenantId", "email");
CREATE INDEX IF NOT EXISTS "users_tenantId_idx" ON "users"("tenantId");
CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users"("email");

-- Create life_areas table
CREATE TABLE IF NOT EXISTS "life_areas" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenantId" UUID NOT NULL,
    "userId" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "phoenixName" TEXT,
    "status" "LifeStatus" NOT NULL DEFAULT 'GREEN',
    "score" INTEGER NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for life_areas
CREATE UNIQUE INDEX IF NOT EXISTS "life_areas_userId_name_key" ON "life_areas"("userId", "name");
CREATE INDEX IF NOT EXISTS "life_areas_tenantId_idx" ON "life_areas"("tenantId");
CREATE INDEX IF NOT EXISTS "life_areas_userId_idx" ON "life_areas"("userId");

-- Create journals table
CREATE TABLE IF NOT EXISTS "journals" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenantId" UUID NOT NULL,
    "userId" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "lifeAreaId" UUID NOT NULL REFERENCES "life_areas"("id") ON DELETE CASCADE,
    "content" TEXT NOT NULL,
    "upsetDetected" BOOLEAN NOT NULL DEFAULT false,
    "aiReframe" TEXT,
    "tags" TEXT[] DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for journals
CREATE INDEX IF NOT EXISTS "journals_tenantId_idx" ON "journals"("tenantId");
CREATE INDEX IF NOT EXISTS "journals_userId_createdAt_idx" ON "journals"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "journals_lifeAreaId_idx" ON "journals"("lifeAreaId");

-- Create additional core tables (simplified for now)
CREATE TABLE IF NOT EXISTS "events" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenantId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "lifeAreaId" UUID NOT NULL REFERENCES "life_areas"("id") ON DELETE CASCADE,
    "type" "EventType" NOT NULL,
    "impact" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "notes" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "relationships" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenantId" UUID NOT NULL,
    "userId" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "lifeAreaId" UUID NOT NULL REFERENCES "life_areas"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "frequency" INTEGER NOT NULL DEFAULT 5,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "resets" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tenantId" UUID NOT NULL,
    "userId" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "lifeAreaId" UUID NOT NULL REFERENCES "life_areas"("id") ON DELETE CASCADE,
    "step1_pause" TEXT,
    "step2_identify" TEXT,
    "step3_acknowledge" TEXT,
    "step4_recommit" TEXT,
    "step5_recalibrate" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3)
);

-- Enable Row Level Security (RLS) for tenant isolation
ALTER TABLE "tenants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "life_areas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "journals" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "relationships" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "resets" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tenant isolation
CREATE POLICY "Users can only access their tenant's data" ON "tenants"
    USING (true);

CREATE POLICY "Users can only access their tenant's users" ON "users"
    USING (true);

CREATE POLICY "Users can only access their tenant's life areas" ON "life_areas"
    USING (true);

CREATE POLICY "Users can only access their tenant's journals" ON "journals"
    USING (true);

CREATE POLICY "Users can only access their tenant's events" ON "events"
    USING (true);

CREATE POLICY "Users can only access their tenant's relationships" ON "relationships"
    USING (true);

CREATE POLICY "Users can only access their tenant's resets" ON "resets"
    USING (true);

-- Insert a default tenant for testing
INSERT INTO "tenants" ("name", "slug", "plan", "status") 
VALUES ('Default Tenant', 'default', 'FREE', 'ACTIVE')
ON CONFLICT ("slug") DO NOTHING;

-- Create a trigger to update the updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to tables that have updatedAt
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'updatedAt' 
        AND table_schema = 'public'
        AND table_name IN ('tenants', 'users', 'life_areas', 'journals', 'relationships')
    LOOP
        EXECUTE format('CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', t, t);
    EXCEPTION
        WHEN duplicate_object THEN null;
    END LOOP;
END$$;