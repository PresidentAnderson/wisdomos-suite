/**
 * Tenant Provisioning System
 *
 * Handles creation of isolated tenant schemas with:
 * - Dedicated PostgreSQL schema per tenant
 * - Schema migration execution
 * - Default data seeding
 * - Tenant-scoped Prisma client creation
 */

import { PrismaClient } from '@prisma/client'
import { customAlphabet } from 'nanoid'
import { lifeAreasSeedData } from './seedData'

// Create URL-safe tenant IDs
const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 12)

// Base Prisma client for public schema
const prisma = new PrismaClient()

export interface TenantProvisioningResult {
  tenantId: string
  schemaName: string
  success: boolean
  error?: string
}

/**
 * Generate a unique tenant schema name
 * Format: tenant_abc123xyz456
 */
export function generateTenantSchemaName(): string {
  return `tenant_${nanoid()}`
}

/**
 * Create a new tenant with isolated schema
 *
 * Process:
 * 1. Validate schema name uniqueness
 * 2. Create tenant record in public schema
 * 3. Create dedicated PostgreSQL schema
 * 4. Run migrations on new schema
 * 5. Seed default data (30 life areas, coach configs, etc.)
 * 6. Return tenant context
 */
export async function provisionTenant(
  ownerId: string,
  workspaceName: string
): Promise<TenantProvisioningResult> {
  const schemaName = generateTenantSchemaName()

  try {
    // Step 1: Create tenant record in public schema
    const tenant = await prisma.tenant.create({
      data: {
        name: workspaceName,
        schemaName,
        ownerId,
        status: 'ACTIVE'
      }
    })

    console.log(`[Provisioning] Created tenant record: ${tenant.id}`)

    // Step 2: Create dedicated PostgreSQL schema
    await createSchema(schemaName)
    console.log(`[Provisioning] Created schema: ${schemaName}`)

    // Step 3: Run migrations on new schema
    await runMigrationsForSchema(schemaName)
    console.log(`[Provisioning] Ran migrations on schema: ${schemaName}`)

    // Step 4: Seed default data
    await seedTenantData(schemaName)
    console.log(`[Provisioning] Seeded data for schema: ${schemaName}`)

    return {
      tenantId: tenant.id,
      schemaName: tenant.schemaName,
      success: true
    }
  } catch (error) {
    console.error('[Provisioning] Error:', error)

    // Cleanup: delete tenant record if schema creation failed
    try {
      await prisma.tenant.delete({ where: { schemaName } })
    } catch {}

    return {
      tenantId: '',
      schemaName: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Create a new PostgreSQL schema
 */
async function createSchema(schemaName: string): Promise<void> {
  await prisma.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`)
}

/**
 * Run Prisma migrations on a specific schema
 *
 * This executes all the table creation, indexes, and constraints
 * defined in the Prisma schema for the tenant-specific models
 */
async function runMigrationsForSchema(schemaName: string): Promise<void> {
  const tenantPrisma = createTenantPrismaClient(schemaName)

  try {
    // Execute migration SQL
    // Note: In production, you'd use Prisma Migrate programmatically
    // For now, we'll create tables manually using raw SQL
    await createTenantTables(schemaName, tenantPrisma)
  } finally {
    await tenantPrisma.$disconnect()
  }
}

/**
 * Create all tenant-specific tables
 */
async function createTenantTables(schemaName: string, client: PrismaClient): Promise<void> {
  // Life Areas table
  await client.$executeRawUnsafe(`
    CREATE TABLE "${schemaName}"."life_areas" (
      "id" TEXT PRIMARY KEY,
      "slug" TEXT UNIQUE NOT NULL,
      "name" TEXT NOT NULL,
      "description" TEXT,
      "cluster" TEXT NOT NULL,
      "sort_order" INTEGER DEFAULT 0,
      "is_active" BOOLEAN DEFAULT true,
      "current_score" DOUBLE PRECISION DEFAULT 50.0,
      "status" TEXT DEFAULT 'BALANCED',
      "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
      "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
    )
  `)

  await client.$executeRawUnsafe(`
    CREATE INDEX "${schemaName}_life_areas_cluster_idx" ON "${schemaName}"."life_areas"("cluster")
  `)

  await client.$executeRawUnsafe(`
    CREATE INDEX "${schemaName}_life_areas_status_idx" ON "${schemaName}"."life_areas"("status")
  `)

  await client.$executeRawUnsafe(`
    CREATE INDEX "${schemaName}_life_areas_sort_order_idx" ON "${schemaName}"."life_areas"("sort_order")
  `)

  // Events table
  await client.$executeRawUnsafe(`
    CREATE TABLE "${schemaName}"."events" (
      "id" TEXT PRIMARY KEY,
      "life_area_id" TEXT NOT NULL,
      "type" TEXT NOT NULL,
      "category" TEXT NOT NULL,
      "tone" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "description" TEXT NOT NULL,
      "narrative" TEXT,
      "occurred_at" TIMESTAMP(3) NOT NULL,
      "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
      "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
      "emotional_charge" INTEGER NOT NULL,
      "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
      FOREIGN KEY ("life_area_id") REFERENCES "${schemaName}"."life_areas"("id") ON DELETE CASCADE
    )
  `)

  await client.$executeRawUnsafe(`
    CREATE INDEX "${schemaName}_events_life_area_id_idx" ON "${schemaName}"."events"("life_area_id")
  `)

  await client.$executeRawUnsafe(`
    CREATE INDEX "${schemaName}_events_type_idx" ON "${schemaName}"."events"("type")
  `)

  await client.$executeRawUnsafe(`
    CREATE INDEX "${schemaName}_events_occurred_at_idx" ON "${schemaName}"."events"("occurred_at")
  `)

  // Insights table
  await client.$executeRawUnsafe(`
    CREATE TABLE "${schemaName}"."insights" (
      "id" TEXT PRIMARY KEY,
      "event_id" TEXT,
      "type" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "description" TEXT NOT NULL,
      "is_recurring" BOOLEAN DEFAULT false,
      "frequency" INTEGER DEFAULT 1,
      "related_events" TEXT[] DEFAULT ARRAY[]::TEXT[],
      "applied" BOOLEAN DEFAULT false,
      "applied_at" TIMESTAMP(3),
      "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
      "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("event_id") REFERENCES "${schemaName}"."events"("id") ON DELETE SET NULL
    )
  `)

  await client.$executeRawUnsafe(`
    CREATE INDEX "${schemaName}_insights_type_idx" ON "${schemaName}"."insights"("type")
  `)

  await client.$executeRawUnsafe(`
    CREATE INDEX "${schemaName}_insights_is_recurring_idx" ON "${schemaName}"."insights"("is_recurring")
  `)

  // Commitments table
  await client.$executeRawUnsafe(`
    CREATE TABLE "${schemaName}"."commitments" (
      "id" TEXT PRIMARY KEY,
      "life_area_id" TEXT,
      "event_id" TEXT,
      "insight_id" TEXT,
      "statement" TEXT NOT NULL,
      "intention" TEXT NOT NULL,
      "measurable" TEXT,
      "status" TEXT DEFAULT 'ACTIVE',
      "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
      "completed_at" TIMESTAMP(3),
      "reviewed_at" TIMESTAMP(3),
      FOREIGN KEY ("life_area_id") REFERENCES "${schemaName}"."life_areas"("id") ON DELETE SET NULL,
      FOREIGN KEY ("event_id") REFERENCES "${schemaName}"."events"("id") ON DELETE SET NULL,
      FOREIGN KEY ("insight_id") REFERENCES "${schemaName}"."insights"("id") ON DELETE SET NULL
    )
  `)

  await client.$executeRawUnsafe(`
    CREATE INDEX "${schemaName}_commitments_status_idx" ON "${schemaName}"."commitments"("status")
  `)

  await client.$executeRawUnsafe(`
    CREATE INDEX "${schemaName}_commitments_life_area_id_idx" ON "${schemaName}"."commitments"("life_area_id")
  `)

  // Boundaries table
  await client.$executeRawUnsafe(`
    CREATE TABLE "${schemaName}"."boundaries" (
      "id" TEXT PRIMARY KEY,
      "life_area_id" TEXT NOT NULL,
      "statement" TEXT NOT NULL,
      "reason" TEXT NOT NULL,
      "consequence" TEXT,
      "status" TEXT DEFAULT 'ACTIVE',
      "last_violated_at" TIMESTAMP(3),
      "violation_count" INTEGER DEFAULT 0,
      "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
      "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("life_area_id") REFERENCES "${schemaName}"."life_areas"("id") ON DELETE CASCADE
    )
  `)

  await client.$executeRawUnsafe(`
    CREATE INDEX "${schemaName}_boundaries_life_area_id_idx" ON "${schemaName}"."boundaries"("life_area_id")
  `)

  await client.$executeRawUnsafe(`
    CREATE INDEX "${schemaName}_boundaries_status_idx" ON "${schemaName}"."boundaries"("status")
  `)

  // Metric Snapshots table
  await client.$executeRawUnsafe(`
    CREATE TABLE "${schemaName}"."metric_snapshots" (
      "id" TEXT PRIMARY KEY,
      "life_area_id" TEXT NOT NULL,
      "date" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
      "score" DOUBLE PRECISION NOT NULL,
      "status" TEXT NOT NULL,
      "event_count" INTEGER DEFAULT 0,
      "upset_count" INTEGER DEFAULT 0,
      "breakthrough_count" INTEGER DEFAULT 0,
      "notes" TEXT,
      FOREIGN KEY ("life_area_id") REFERENCES "${schemaName}"."life_areas"("id") ON DELETE CASCADE,
      UNIQUE ("life_area_id", "date")
    )
  `)

  await client.$executeRawUnsafe(`
    CREATE INDEX "${schemaName}_metric_snapshots_life_area_id_idx" ON "${schemaName}"."metric_snapshots"("life_area_id")
  `)

  await client.$executeRawUnsafe(`
    CREATE INDEX "${schemaName}_metric_snapshots_date_idx" ON "${schemaName}"."metric_snapshots"("date")
  `)

  // Autobiography Entries table
  await client.$executeRawUnsafe(`
    CREATE TABLE "${schemaName}"."autobiography_entries" (
      "id" TEXT PRIMARY KEY,
      "era_id" TEXT NOT NULL,
      "year" INTEGER NOT NULL,
      "month" INTEGER,
      "title" TEXT NOT NULL,
      "narrative" TEXT NOT NULL,
      "event_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
      "life_area_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
      "is_public" BOOLEAN DEFAULT false,
      "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
      "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
    )
  `)

  await client.$executeRawUnsafe(`
    CREATE INDEX "${schemaName}_autobiography_entries_era_id_idx" ON "${schemaName}"."autobiography_entries"("era_id")
  `)

  await client.$executeRawUnsafe(`
    CREATE INDEX "${schemaName}_autobiography_entries_year_idx" ON "${schemaName}"."autobiography_entries"("year")
  `)

  // Coach Factory tables
  await client.$executeRawUnsafe(`
    CREATE TABLE "${schemaName}"."coach_factory_config" (
      "id" TEXT PRIMARY KEY,
      "life_area_id" TEXT UNIQUE NOT NULL,
      "coach_name" TEXT NOT NULL,
      "restoration_prompt" TEXT NOT NULL,
      "play_prompt" TEXT NOT NULL,
      "dialogue_policies" JSONB NOT NULL,
      "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
      "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
    )
  `)

  await client.$executeRawUnsafe(`
    CREATE INDEX "${schemaName}_coach_factory_config_life_area_id_idx" ON "${schemaName}"."coach_factory_config"("life_area_id")
  `)

  await client.$executeRawUnsafe(`
    CREATE TABLE "${schemaName}"."coach_sessions_extended" (
      "id" TEXT PRIMARY KEY,
      "session_id" TEXT UNIQUE NOT NULL,
      "life_area_id" TEXT NOT NULL,
      "area_score" DOUBLE PRECISION NOT NULL,
      "coach_mode" TEXT NOT NULL,
      "relationship_id" TEXT,
      "relationship_name" TEXT,
      "we_score" INTEGER,
      "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
    )
  `)

  await client.$executeRawUnsafe(`
    CREATE INDEX "${schemaName}_coach_sessions_extended_session_id_idx" ON "${schemaName}"."coach_sessions_extended"("session_id")
  `)

  await client.$executeRawUnsafe(`
    CREATE INDEX "${schemaName}_coach_sessions_extended_life_area_id_idx" ON "${schemaName}"."coach_sessions_extended"("life_area_id")
  `)

  await client.$executeRawUnsafe(`
    CREATE TABLE "${schemaName}"."fulfillment_signals" (
      "id" TEXT PRIMARY KEY,
      "session_id" TEXT,
      "life_area_id" TEXT NOT NULL,
      "signal_type" TEXT NOT NULL,
      "emotional_charge" DOUBLE PRECISION NOT NULL,
      "area_score_before" DOUBLE PRECISION,
      "area_score_after" DOUBLE PRECISION,
      "description" TEXT,
      "occurred_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
      "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
    )
  `)

  await client.$executeRawUnsafe(`
    CREATE INDEX "${schemaName}_fulfillment_signals_life_area_id_idx" ON "${schemaName}"."fulfillment_signals"("life_area_id")
  `)

  await client.$executeRawUnsafe(`
    CREATE INDEX "${schemaName}_fulfillment_signals_occurred_at_idx" ON "${schemaName}"."fulfillment_signals"("occurred_at")
  `)

  await client.$executeRawUnsafe(`
    CREATE TABLE "${schemaName}"."we_assessment_triggers" (
      "id" TEXT PRIMARY KEY,
      "session_id" TEXT NOT NULL,
      "relationship_name" TEXT NOT NULL,
      "trigger_reason" TEXT NOT NULL,
      "completed" BOOLEAN DEFAULT false,
      "completed_at" TIMESTAMP(3),
      "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
    )
  `)

  await client.$executeRawUnsafe(`
    CREATE INDEX "${schemaName}_we_assessment_triggers_session_id_idx" ON "${schemaName}"."we_assessment_triggers"("session_id")
  `)

  await client.$executeRawUnsafe(`
    CREATE INDEX "${schemaName}_we_assessment_triggers_completed_idx" ON "${schemaName}"."we_assessment_triggers"("completed")
  `)
}

/**
 * Seed default data for a new tenant
 */
async function seedTenantData(schemaName: string): Promise<void> {
  const tenantPrisma = createTenantPrismaClient(schemaName)

  try {
    // Seed 30 life areas
    for (const area of lifeAreasSeedData) {
      await tenantPrisma.$executeRawUnsafe(`
        INSERT INTO "${schemaName}"."life_areas"
        (id, slug, name, description, cluster, sort_order, current_score, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `,
        area.id,
        area.slug,
        area.name,
        area.description,
        area.cluster,
        area.sortOrder,
        area.currentScore,
        area.status
      )
    }

    console.log(`[Seed] Inserted ${lifeAreasSeedData.length} life areas`)
  } finally {
    await tenantPrisma.$disconnect()
  }
}

/**
 * Create a Prisma client scoped to a specific tenant schema
 */
export function createTenantPrismaClient(schemaName: string): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable not set')
  }

  // Append schema to connection string
  const url = `${databaseUrl}?schema=${schemaName}`

  return new PrismaClient({
    datasources: {
      db: { url }
    }
  })
}

/**
 * Delete a tenant and all its data
 * WARNING: This is destructive and cannot be undone
 */
export async function deprovisionTenant(tenantId: string): Promise<void> {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId }
  })

  if (!tenant) {
    throw new Error(`Tenant ${tenantId} not found`)
  }

  // Drop the entire schema (cascades to all tables)
  await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${tenant.schemaName}" CASCADE`)

  // Delete tenant record
  await prisma.tenant.delete({
    where: { id: tenantId }
  })

  console.log(`[Deprovisioning] Deleted tenant ${tenantId} and schema ${tenant.schemaName}`)
}

/**
 * Get tenant information by schema name
 */
export async function getTenantBySchema(schemaName: string) {
  return await prisma.tenant.findUnique({
    where: { schemaName },
    include: {
      users: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          }
        }
      }
    }
  })
}

/**
 * Get all tenants for a user
 */
export async function getUserTenants(userId: string) {
  return await prisma.userTenant.findMany({
    where: { userId },
    include: {
      tenant: true
    }
  })
}
