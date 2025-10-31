/**
 * Pattern Recognition Jobs
 *
 * Scheduled jobs for automated insight generation:
 * - Daily pattern detection (runs at 2 AM)
 * - Weekly summaries (runs Sunday at midnight)
 * - Monthly rollups (runs 1st of month)
 */

import { PrismaClient } from '@prisma/client'
import { detectPatterns, saveInsights } from './recognizer'
import { createTenantPrismaClient } from '@/lib/tenant/provisioning'

export interface JobResult {
  tenantId: string
  tenantSchema: string
  success: boolean
  patternsDetected: number
  insightsCreated: number
  error?: string
  executionTime: number
}

/**
 * Run pattern detection for a single tenant
 */
export async function runPatternDetectionForTenant(
  tenantSchema: string,
  windowDays: number = 90
): Promise<JobResult> {
  const startTime = Date.now()

  try {
    // Create tenant-scoped Prisma client
    const prisma = createTenantPrismaClient(tenantSchema)

    // Detect patterns
    const result = await detectPatterns(prisma, windowDays)

    // Save insights
    if (result.insights.length > 0) {
      await saveInsights(prisma, result.insights)
    }

    const executionTime = Date.now() - startTime

    console.log(`[Pattern Job] ${tenantSchema}: Detected ${result.totalPatternsDetected} patterns in ${executionTime}ms`)

    return {
      tenantId: tenantSchema,
      tenantSchema,
      success: true,
      patternsDetected: result.totalPatternsDetected,
      insightsCreated: result.insights.length,
      executionTime
    }
  } catch (error) {
    const executionTime = Date.now() - startTime
    console.error(`[Pattern Job] ${tenantSchema}: Error`, error)

    return {
      tenantId: tenantSchema,
      tenantSchema,
      success: false,
      patternsDetected: 0,
      insightsCreated: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
      executionTime
    }
  }
}

/**
 * Run pattern detection for all active tenants
 */
export async function runPatternDetectionForAllTenants(
  windowDays: number = 90
): Promise<JobResult[]> {
  const systemPrisma = new PrismaClient()

  try {
    // Fetch all active tenants
    const tenants = await systemPrisma.tenant.findMany({
      where: { status: 'ACTIVE' }
    })

    console.log(`[Pattern Job] Running for ${tenants.length} active tenants`)

    // Run pattern detection for each tenant
    const results: JobResult[] = []

    for (const tenant of tenants) {
      const result = await runPatternDetectionForTenant(tenant.schemaName, windowDays)
      results.push(result)
    }

    // Summary
    const totalPatterns = results.reduce((sum, r) => sum + r.patternsDetected, 0)
    const totalInsights = results.reduce((sum, r) => sum + r.insightsCreated, 0)
    const successCount = results.filter(r => r.success).length
    const failureCount = results.filter(r => !r.success).length

    console.log(`[Pattern Job] Complete: ${successCount} succeeded, ${failureCount} failed, ${totalPatterns} patterns, ${totalInsights} insights`)

    return results
  } catch (error) {
    console.error('[Pattern Job] Fatal error:', error)
    throw error
  } finally {
    await systemPrisma.$disconnect()
  }
}

/**
 * Daily pattern detection job
 * Runs at 2 AM every day
 */
export async function dailyPatternDetection(): Promise<void> {
  console.log('[Daily Pattern Job] Starting...')

  const results = await runPatternDetectionForAllTenants(90)

  // Log failures
  const failures = results.filter(r => !r.success)
  if (failures.length > 0) {
    console.error('[Daily Pattern Job] Failures:', failures)
  }

  console.log('[Daily Pattern Job] Complete')
}

/**
 * Weekly summary job
 * Runs Sunday at midnight
 * Generates weekly insights and sends notifications
 */
export async function weeklyPatternSummary(): Promise<void> {
  console.log('[Weekly Summary Job] Starting...')

  const systemPrisma = new PrismaClient()

  try {
    const tenants = await systemPrisma.tenant.findMany({
      where: { status: 'ACTIVE' }
    })

    for (const tenant of tenants) {
      const prisma = createTenantPrismaClient(tenant.schemaName)

      // Get insights from last 7 days
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const weeklyInsights = await prisma.insight.findMany({
        where: {
          createdAt: {
            gte: sevenDaysAgo
          },
          status: 'ACTIVE'
        },
        orderBy: { confidence: 'desc' }
      })

      // Get events from last 7 days
      const weeklyEvents = await prisma.event.findMany({
        where: {
          occurredAt: {
            gte: sevenDaysAgo
          }
        }
      })

      // Calculate average emotional charge
      const avgCharge = weeklyEvents.length > 0
        ? weeklyEvents.reduce((sum, e) => sum + e.emotionalCharge, 0) / weeklyEvents.length
        : 0

      // Create weekly summary insight
      await prisma.insight.create({
        data: {
          type: 'WEEKLY_SUMMARY',
          category: 'SYSTEMIC',
          title: 'Weekly Reflection',
          description: generateWeeklySummary(weeklyEvents.length, weeklyInsights.length, avgCharge),
          confidence: 1.0,
          metadata: {
            weekStart: sevenDaysAgo.toISOString(),
            weekEnd: new Date().toISOString(),
            eventCount: weeklyEvents.length,
            insightCount: weeklyInsights.length,
            avgEmotionalCharge: avgCharge
          },
          status: 'ACTIVE'
        }
      })

      console.log(`[Weekly Summary] ${tenant.schemaName}: ${weeklyEvents.length} events, ${weeklyInsights.length} insights`)
    }
  } catch (error) {
    console.error('[Weekly Summary Job] Error:', error)
    throw error
  } finally {
    await systemPrisma.$disconnect()
  }

  console.log('[Weekly Summary Job] Complete')
}

/**
 * Monthly rollup job
 * Runs on 1st of each month
 * Creates monthly metric snapshots
 */
export async function monthlyRollup(): Promise<void> {
  console.log('[Monthly Rollup Job] Starting...')

  const systemPrisma = new PrismaClient()

  try {
    const tenants = await systemPrisma.tenant.findMany({
      where: { status: 'ACTIVE' }
    })

    for (const tenant of tenants) {
      const prisma = createTenantPrismaClient(tenant.schemaName)

      // Get last month's date range
      const now = new Date()
      const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

      // Fetch all life areas
      const lifeAreas = await prisma.lifeArea.findMany({
        where: { isActive: true }
      })

      // Create monthly snapshot for each life area
      for (const area of lifeAreas) {
        // Get events from last month
        const monthlyEvents = await prisma.event.findMany({
          where: {
            lifeAreaId: area.id,
            occurredAt: {
              gte: firstDayLastMonth,
              lte: lastDayLastMonth
            }
          }
        })

        // Get commitments status
        const commitments = await prisma.commitment.findMany({
          where: { lifeAreaId: area.id }
        })

        const completedCommitments = commitments.filter(c =>
          c.status === 'COMPLETED' || c.status === 'INTEGRATED'
        ).length

        // Create metric snapshot
        await prisma.metricSnapshot.create({
          data: {
            lifeAreaId: area.id,
            snapshotDate: lastDayLastMonth,
            score: area.currentScore,
            status: area.status,
            eventCount: monthlyEvents.length,
            commitmentCount: commitments.length,
            commitmentCompletionRate: commitments.length > 0
              ? completedCommitments / commitments.length
              : 0,
            metadata: {
              month: lastDayLastMonth.toISOString().substring(0, 7), // YYYY-MM
              avgEmotionalCharge: monthlyEvents.length > 0
                ? monthlyEvents.reduce((sum, e) => sum + e.emotionalCharge, 0) / monthlyEvents.length
                : 0
            }
          }
        })
      }

      console.log(`[Monthly Rollup] ${tenant.schemaName}: Created snapshots for ${lifeAreas.length} life areas`)
    }
  } catch (error) {
    console.error('[Monthly Rollup Job] Error:', error)
    throw error
  } finally {
    await systemPrisma.$disconnect()
  }

  console.log('[Monthly Rollup Job] Complete')
}

/**
 * Generate weekly summary description
 */
function generateWeeklySummary(
  eventCount: number,
  insightCount: number,
  avgCharge: number
): string {
  const mood = avgCharge > 2 ? 'positive and uplifting' :
                avgCharge < -2 ? 'challenging' :
                'balanced'

  return `This week you logged ${eventCount} event${eventCount !== 1 ? 's' : ''} with an overall ${mood} tone. ` +
         `${insightCount} pattern${insightCount !== 1 ? 's were' : ' was'} detected in your life areas. ` +
         (avgCharge > 2 ? 'Keep building on this momentum!' :
          avgCharge < -2 ? 'Consider reviewing your boundaries and commitments for areas that need support.' :
          'Continue tracking your progress and stay mindful of emerging patterns.')
}

/**
 * Clean up old insights (older than 1 year)
 */
export async function cleanupOldInsights(): Promise<void> {
  console.log('[Cleanup Job] Starting...')

  const systemPrisma = new PrismaClient()

  try {
    const tenants = await systemPrisma.tenant.findMany({
      where: { status: 'ACTIVE' }
    })

    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

    for (const tenant of tenants) {
      const prisma = createTenantPrismaClient(tenant.schemaName)

      // Archive old insights (change status to ARCHIVED instead of deleting)
      const result = await prisma.insight.updateMany({
        where: {
          createdAt: {
            lt: oneYearAgo
          },
          status: 'ACTIVE'
        },
        data: {
          status: 'ARCHIVED'
        }
      })

      console.log(`[Cleanup] ${tenant.schemaName}: Archived ${result.count} old insights`)
    }
  } catch (error) {
    console.error('[Cleanup Job] Error:', error)
    throw error
  } finally {
    await systemPrisma.$disconnect()
  }

  console.log('[Cleanup Job] Complete')
}
