import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { LifeStatus } from '@prisma/client'

interface DimensionMetric {
  lifeAreaName: string
  lifeAreaId: string
  subdomainName: string
  dimensionName: string
  metric: number
  focus: string
}

interface LifeAreaAnalytics {
  id: string
  name: string
  phoenixName: string | null
  score: number
  status: string
  subdomainCount: number
  avgMetric: number
}

export async function GET(request: Request) {
  try {
    // TODO: Get userId and tenantId from auth
    const userId = 'demo-user-001' // Placeholder
    const tenantId = 'demo-tenant-001' // Placeholder

    // Fetch all life areas with their subdomains and dimensions
    const lifeAreas = await prisma.lifeArea.findMany({
      where: { userId, tenantId },
      include: {
        subdomains: {
          include: {
            dimensions: {
              select: {
                id: true,
                name: true,
                focus: true,
                metric: true,
              }
            }
          }
        }
      },
      orderBy: { sortOrder: 'asc' }
    })

    // ==================== CALCULATE OVERVIEW METRICS ====================

    let totalMetricsSum = 0
    let totalMetricsCount = 0
    let thrivingCount = 0 // GREEN status
    let needsAttentionCount = 0 // YELLOW status
    let breakdownCount = 0 // RED status

    // Count life areas by status
    lifeAreas.forEach(area => {
      if (area.status === LifeStatus.GREEN) {
        thrivingCount++
      } else if (area.status === LifeStatus.YELLOW) {
        needsAttentionCount++
      } else if (area.status === LifeStatus.RED) {
        breakdownCount++
      }
    })

    // ==================== COLLECT DIMENSION METRICS ====================

    const dimensionMetrics: DimensionMetric[] = []
    const dimensionAggregates: {
      [key: string]: { sum: number; count: number }
    } = {
      BEING: { sum: 0, count: 0 },
      DOING: { sum: 0, count: 0 },
      HAVING: { sum: 0, count: 0 },
      RELATING: { sum: 0, count: 0 },
      BECOMING: { sum: 0, count: 0 }
    }

    lifeAreas.forEach(lifeArea => {
      lifeArea.subdomains.forEach(subdomain => {
        subdomain.dimensions.forEach(dimension => {
          if (dimension.metric !== null) {
            // Collect for overall metrics
            totalMetricsSum += dimension.metric
            totalMetricsCount++

            // Aggregate by dimension type
            const dimensionType = dimension.name
            if (dimensionAggregates[dimensionType]) {
              dimensionAggregates[dimensionType].sum += dimension.metric
              dimensionAggregates[dimensionType].count++
            }

            // Store full dimension data for sorting
            dimensionMetrics.push({
              lifeAreaName: lifeArea.name,
              lifeAreaId: lifeArea.id,
              subdomainName: subdomain.name,
              dimensionName: dimension.name,
              metric: dimension.metric,
              focus: dimension.focus
            })
          }
        })
      })
    })

    // ==================== CALCULATE DIMENSION AVERAGES ====================

    const dimensionAverages = {
      being: dimensionAggregates.BEING.count > 0
        ? dimensionAggregates.BEING.sum / dimensionAggregates.BEING.count
        : 0,
      doing: dimensionAggregates.DOING.count > 0
        ? dimensionAggregates.DOING.sum / dimensionAggregates.DOING.count
        : 0,
      having: dimensionAggregates.HAVING.count > 0
        ? dimensionAggregates.HAVING.sum / dimensionAggregates.HAVING.count
        : 0,
      relating: dimensionAggregates.RELATING.count > 0
        ? dimensionAggregates.RELATING.sum / dimensionAggregates.RELATING.count
        : 0,
      becoming: dimensionAggregates.BECOMING.count > 0
        ? dimensionAggregates.BECOMING.sum / dimensionAggregates.BECOMING.count
        : 0
    }

    // ==================== GET TOP AND BOTTOM DIMENSIONS ====================

    const sortedByMetric = [...dimensionMetrics].sort((a, b) => b.metric - a.metric)
    const topDimensions = sortedByMetric.slice(0, 5).map(dim => ({
      lifeAreaName: dim.lifeAreaName,
      subdomainName: dim.subdomainName,
      dimensionName: dim.dimensionName,
      metric: dim.metric,
      focus: dim.focus
    }))

    const bottomDimensions = sortedByMetric.slice(-5).reverse().map(dim => ({
      lifeAreaName: dim.lifeAreaName,
      subdomainName: dim.subdomainName,
      dimensionName: dim.dimensionName,
      metric: dim.metric,
      focus: dim.focus
    }))

    // ==================== CALCULATE LIFE AREA BREAKDOWN ====================

    const lifeAreaBreakdown: LifeAreaAnalytics[] = lifeAreas.map(lifeArea => {
      let areaMetricsSum = 0
      let areaMetricsCount = 0
      let subdomainCount = 0

      lifeArea.subdomains.forEach(subdomain => {
        subdomainCount++
        subdomain.dimensions.forEach(dimension => {
          if (dimension.metric !== null) {
            areaMetricsSum += dimension.metric
            areaMetricsCount++
          }
        })
      })

      const avgMetric = areaMetricsCount > 0
        ? areaMetricsSum / areaMetricsCount
        : 0

      return {
        id: lifeArea.id,
        name: lifeArea.name,
        phoenixName: lifeArea.phoenixName,
        score: lifeArea.score,
        status: lifeArea.status,
        subdomainCount,
        avgMetric: Math.round(avgMetric * 100) / 100 // Round to 2 decimals
      }
    })

    // ==================== CALCULATE OVERALL AVERAGE SCORE ====================

    const averageScore = totalMetricsCount > 0
      ? Math.round((totalMetricsSum / totalMetricsCount) * 100) / 100
      : 0

    // ==================== CONSTRUCT RESPONSE ====================

    const response = {
      overview: {
        totalLifeAreas: lifeAreas.length,
        averageScore,
        thrivingCount,
        needsAttentionCount,
        breakdownCount
      },
      dimensionAverages: {
        being: Math.round(dimensionAverages.being * 100) / 100,
        doing: Math.round(dimensionAverages.doing * 100) / 100,
        having: Math.round(dimensionAverages.having * 100) / 100,
        relating: Math.round(dimensionAverages.relating * 100) / 100,
        becoming: Math.round(dimensionAverages.becoming * 100) / 100
      },
      topDimensions,
      bottomDimensions,
      lifeAreaBreakdown
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error calculating fulfillment v5 analytics:', error)
    return NextResponse.json(
      { error: 'Failed to calculate analytics' },
      { status: 500 }
    )
  }
}
