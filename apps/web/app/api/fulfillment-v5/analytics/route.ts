import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

interface DimensionMetric {
  lifeAreaName: string
  lifeAreaId: number
  subdomainName: string
  dimensionName: string
  metric: number
  focus: string
}

interface LifeAreaAnalytics {
  id: number
  name: string
  phoenixName: string | null
  subdomainCount: number
  avgMetric: number
}

export async function GET(request: NextRequest) {
  try {
    // Get auth token from request headers
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create Supabase client with user's token
    const token = authHeader.replace('Bearer ', '')
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } }
    })

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all life areas with their subdomains and dimensions
    const { data: lifeAreas, error: lifeAreasError } = await supabase
      .from('life_areas')
      .select(`
        *,
        subdomains (
          *,
          dimensions (
            id,
            name,
            focus,
            metric
          )
        )
      `)
      .eq('user_id', user.id)

    if (lifeAreasError) {
      console.error('Error fetching life areas:', lifeAreasError)
      return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
    }

    // ==================== CALCULATE OVERVIEW METRICS ====================

    let totalMetricsSum = 0
    let totalMetricsCount = 0

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

    lifeAreas?.forEach((lifeArea: any) => {
      lifeArea.subdomains?.forEach((subdomain: any) => {
        subdomain.dimensions?.forEach((dimension: any) => {
          if (dimension.metric !== null && dimension.metric !== undefined) {
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

    const lifeAreaBreakdown: LifeAreaAnalytics[] = lifeAreas?.map((lifeArea: any) => {
      let areaMetricsSum = 0
      let areaMetricsCount = 0
      let subdomainCount = 0

      lifeArea.subdomains?.forEach((subdomain: any) => {
        subdomainCount++
        subdomain.dimensions?.forEach((dimension: any) => {
          if (dimension.metric !== null && dimension.metric !== undefined) {
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
        phoenixName: lifeArea.phoenix_name,
        subdomainCount,
        avgMetric: Math.round(avgMetric * 100) / 100 // Round to 2 decimals
      }
    }) || []

    // ==================== CALCULATE OVERALL AVERAGE SCORE ====================

    const averageScore = totalMetricsCount > 0
      ? Math.round((totalMetricsSum / totalMetricsCount) * 100) / 100
      : 0

    // ==================== CONSTRUCT RESPONSE ====================

    const response = {
      overview: {
        totalLifeAreas: lifeAreas?.length || 0,
        averageScore,
        thrivingCount: 0, // Not using status in this implementation
        needsAttentionCount: 0,
        breakdownCount: 0
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
