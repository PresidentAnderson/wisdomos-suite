/**
 * WisdomOS Fulfillment Tracker Import Script
 *
 * Imports life area data from YAML files into Prisma database
 * Supports both demo data and blank templates for new tenants
 *
 * Usage:
 *   import { importFulfillmentTracker } from '@/lib/tenant/import_fulfillment_tracker'
 *   await importFulfillmentTracker(prisma, 'demo')  // For demo data
 *   await importFulfillmentTracker(prisma, 'null')  // For new tenant
 */

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import * as yaml from 'js-yaml'

// Type definitions matching YAML structure
interface LifeAreaData {
  id: number
  slug: string
  name: string
  phoenix_name: string
  category: string
  cluster: string
  description: string
  score: number | null
  status: string | null
  emoji: string | null
  last_event: string | null
  last_event_date: string | null
  recent_insights: string[]
}

interface FulfillmentTrackerData {
  tenant: {
    id: string | null
    name: string | null
    created_at: string | null
    last_updated: string | null
  }
  overall_fulfillment: {
    score: number | null
    status: string | null
    trend: string | null
    emoji: string | null
  }
  domains: LifeAreaData[]
  statistics: {
    total_areas: number
    thriving: number
    needs_attention: number
    breakdown: number
    average_score: number | null
    highest_scoring: string[]
    lowest_scoring: string[]
    trend: string | null
    insights: string[]
  }
  next_actions: Array<{
    area: string
    action: string
    priority: string
  }>
}

/**
 * Import fulfillment tracker data from YAML file
 *
 * @param prisma - Prisma client instance (can be tenant-scoped)
 * @param templateType - 'demo' or 'null'
 * @param tenantSchemaName - Optional schema name for multi-tenant setup
 * @returns Promise with import results
 */
export async function importFulfillmentTracker(
  prisma: PrismaClient,
  templateType: 'demo' | 'null' = 'null',
  tenantSchemaName?: string
): Promise<{
  success: boolean
  areasImported: number
  message: string
  errors: string[]
}> {
  const errors: string[] = []

  try {
    // Load YAML file
    const yamlFileName = templateType === 'demo'
      ? 'fulfillment_tracker_demo.yaml'
      : 'fulfillment_tracker_null.yaml'

    const yamlPath = path.join(process.cwd(), 'seed_data', yamlFileName)

    if (!fs.existsSync(yamlPath)) {
      throw new Error(`YAML file not found: ${yamlPath}`)
    }

    const yamlContent = fs.readFileSync(yamlPath, 'utf8')
    const data = yaml.load(yamlContent) as FulfillmentTrackerData

    console.log(`📥 Importing ${data.domains.length} life areas from ${yamlFileName}...`)

    // Validate data structure
    if (!data.domains || !Array.isArray(data.domains)) {
      throw new Error('Invalid YAML structure: domains array not found')
    }

    if (data.domains.length !== 30) {
      console.warn(`⚠️  Expected 30 life areas, found ${data.domains.length}`)
    }

    // Import each life area
    let imported = 0

    for (const area of data.domains) {
      try {
        // Map YAML category to Prisma enum
        const clusterEnum = mapCategoryToCluster(area.cluster)

        // Upsert life area (insert or update if exists)
        await prisma.lifeArea.upsert({
          where: { slug: area.slug },
          update: {
            name: area.name,
            phoenixName: area.phoenix_name,
            cluster: clusterEnum,
            description: area.description,
            currentScore: area.score,
            lastCalculatedAt: area.score !== null ? new Date() : null,
            sortOrder: area.id
          },
          create: {
            slug: area.slug,
            name: area.name,
            phoenixName: area.phoenix_name,
            cluster: clusterEnum,
            description: area.description,
            currentScore: area.score,
            lastCalculatedAt: area.score !== null ? new Date() : null,
            sortOrder: area.id
          }
        })

        imported++

        // If demo data with score, create initial event
        if (templateType === 'demo' && area.score !== null && area.last_event) {
          const lifeArea = await prisma.lifeArea.findUnique({
            where: { slug: area.slug }
          })

          if (lifeArea) {
            // Check if demo event already exists
            const existingEvent = await prisma.event.findFirst({
              where: {
                lifeAreaId: lifeArea.id,
                title: area.last_event
              }
            })

            if (!existingEvent) {
              await prisma.event.create({
                data: {
                  lifeAreaId: lifeArea.id,
                  type: inferEventType(area.score),
                  category: 'PERSONAL',
                  tone: area.score >= 70 ? 'POSITIVE' : area.score >= 50 ? 'NEUTRAL' : 'NEGATIVE',
                  title: area.last_event,
                  description: `Demo event for ${area.name}`,
                  occurredAt: area.last_event_date
                    ? new Date(area.last_event_date)
                    : new Date(),
                  emotionalCharge: Math.floor((area.score - 50) / 10), // -5 to +5 scale
                  tags: [area.category.toLowerCase(), 'demo']
                }
              })
            }
          }
        }

      } catch (areaError) {
        const errorMsg = `Failed to import ${area.name}: ${areaError}`
        console.error(`❌ ${errorMsg}`)
        errors.push(errorMsg)
      }
    }

    console.log(`✅ Successfully imported ${imported}/${data.domains.length} life areas`)

    // Import next actions if demo data
    if (templateType === 'demo' && data.next_actions && data.next_actions.length > 0) {
      console.log(`📋 Importing ${data.next_actions.length} recommended actions...`)

      for (const action of data.next_actions) {
        try {
          const lifeArea = await prisma.lifeArea.findFirst({
            where: {
              name: {
                contains: action.area
              }
            }
          })

          if (lifeArea) {
            // Create as insight/recommendation
            await prisma.insight.create({
              data: {
                type: 'RECOMMENDATION',
                confidence: action.priority === 'high' ? 0.9 : action.priority === 'medium' ? 0.7 : 0.5,
                title: `Action: ${action.area}`,
                description: action.action,
                affectedAreas: [lifeArea.id],
                metadata: {
                  priority: action.priority,
                  source: 'yaml_import'
                }
              }
            })
          }
        } catch (actionError) {
          console.error(`⚠️  Failed to import action for ${action.area}:`, actionError)
        }
      }
    }

    return {
      success: true,
      areasImported: imported,
      message: `Successfully imported ${imported} life areas from ${yamlFileName}`,
      errors
    }

  } catch (error) {
    console.error('❌ Import failed:', error)
    return {
      success: false,
      areasImported: 0,
      message: `Import failed: ${error}`,
      errors: [String(error)]
    }
  }
}

/**
 * Map YAML category to Prisma LifeAreaCluster enum
 */
function mapCategoryToCluster(category: string): string {
  const mapping: Record<string, string> = {
    'SYSTEMIC_STRUCTURAL': 'SYSTEMIC_STRUCTURAL',
    'FOUNDATIONAL': 'SYSTEMIC_STRUCTURAL',
    'RELATIONAL': 'RELATIONAL',
    'CREATIVE': 'CREATIVE_EXPRESSIVE',
    'CREATIVE_EXPRESSIVE': 'CREATIVE_EXPRESSIVE',
    'EXPERIENTIAL': 'EXPERIENTIAL',
    'LEGACY': 'LEGACY_IMPACT',
    'LEGACY_IMPACT': 'LEGACY_IMPACT',
    'SPIRITUAL': 'SPIRITUAL_TRANSCENDENT'
  }

  return mapping[category] || 'SYSTEMIC_STRUCTURAL'
}

/**
 * Infer event type from score
 */
function inferEventType(score: number | null): string {
  if (score === null) return 'NEUTRAL'
  if (score >= 90) return 'BREAKTHROUGH'
  if (score >= 70) return 'WIN'
  if (score >= 50) return 'NEUTRAL'
  if (score >= 30) return 'UPSET'
  return 'BOUNDARY_VIOLATION'
}

/**
 * Import from flat JSON table (alternative format)
 */
export async function importFromFlatTable(
  prisma: PrismaClient,
  jsonPath?: string
): Promise<{
  success: boolean
  areasImported: number
  errors: string[]
}> {
  const errors: string[] = []

  try {
    const filePath = jsonPath || path.join(process.cwd(), 'seed_data', 'flat_table.json')

    if (!fs.existsSync(filePath)) {
      throw new Error(`JSON file not found: ${filePath}`)
    }

    const jsonContent = fs.readFileSync(filePath, 'utf8')
    const areas = JSON.parse(jsonContent) as Array<{
      id: number
      slug: string
      name: string
      phoenixName: string
      category: string
      cluster: string
      description: string
      order: number
    }>

    console.log(`📥 Importing ${areas.length} life areas from flat_table.json...`)

    let imported = 0

    for (const area of areas) {
      try {
        const clusterEnum = mapCategoryToCluster(area.cluster)

        await prisma.lifeArea.upsert({
          where: { slug: area.slug },
          update: {
            name: area.name,
            phoenixName: area.phoenixName,
            cluster: clusterEnum,
            description: area.description,
            sortOrder: area.order
          },
          create: {
            slug: area.slug,
            name: area.name,
            phoenixName: area.phoenixName,
            cluster: clusterEnum,
            description: area.description,
            sortOrder: area.order,
            currentScore: null,
            lastCalculatedAt: null
          }
        })

        imported++

      } catch (areaError) {
        const errorMsg = `Failed to import ${area.name}: ${areaError}`
        console.error(`❌ ${errorMsg}`)
        errors.push(errorMsg)
      }
    }

    console.log(`✅ Successfully imported ${imported}/${areas.length} life areas from JSON`)

    return {
      success: true,
      areasImported: imported,
      errors
    }

  } catch (error) {
    console.error('❌ JSON import failed:', error)
    return {
      success: false,
      areasImported: 0,
      errors: [String(error)]
    }
  }
}

/**
 * Utility: Validate YAML file structure
 */
export function validateYamlStructure(yamlPath: string): {
  valid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  try {
    if (!fs.existsSync(yamlPath)) {
      errors.push(`File not found: ${yamlPath}`)
      return { valid: false, errors, warnings }
    }

    const yamlContent = fs.readFileSync(yamlPath, 'utf8')
    const data = yaml.load(yamlContent) as FulfillmentTrackerData

    // Check required fields
    if (!data.domains) {
      errors.push('Missing "domains" field')
    }

    if (!Array.isArray(data.domains)) {
      errors.push('"domains" must be an array')
    }

    if (data.domains && data.domains.length !== 30) {
      warnings.push(`Expected 30 life areas, found ${data.domains.length}`)
    }

    // Validate each domain
    data.domains?.forEach((area, index) => {
      if (!area.slug) errors.push(`Domain ${index + 1} missing slug`)
      if (!area.name) errors.push(`Domain ${index + 1} missing name`)
      if (!area.phoenix_name) warnings.push(`Domain ${index + 1} missing phoenix_name`)
      if (!area.category) errors.push(`Domain ${index + 1} missing category`)
      if (!area.cluster) errors.push(`Domain ${index + 1} missing cluster`)
    })

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }

  } catch (error) {
    errors.push(`YAML parsing error: ${error}`)
    return { valid: false, errors, warnings }
  }
}

export default importFulfillmentTracker
