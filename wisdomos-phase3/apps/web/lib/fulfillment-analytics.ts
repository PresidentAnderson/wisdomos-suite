/**
 * Fulfillment Analytics Service
 *
 * Provides comprehensive analytics for fulfillment data including:
 * - Month-over-Month (MoM) comparisons
 * - Year-over-Year (YoY) comparisons
 * - Trend analysis
 * - Top movers identification
 * - AI-generated insights
 */

import { supabase } from './supabase'
import type {
  FDArea,
  FDScoreRollup,
  FDReviewMonth
} from '@/../../packages/types/fulfillment-display'

// =====================================================
// TYPES
// =====================================================

export interface AnalyticsAreaScore {
  area: FDArea
  currentScore: number
  lastMonthScore: number | null
  lastYearScore: number | null
  momChange: number | null // Month-over-Month change
  yoyChange: number | null // Year-over-Year change
  momPercentage: number | null
  yoyPercentage: number | null
  trend: 'up' | 'down' | 'stable'
  confidence: number
}

export interface AnalyticsSummary {
  currentGFS: number
  lastMonthGFS: number | null
  lastYearGFS: number | null
  momGFSChange: number | null
  yoyGFSChange: number | null
  momGFSPercentage: number | null
  yoyGFSPercentage: number | null
  topImproving: AnalyticsAreaScore[]
  topDeclining: AnalyticsAreaScore[]
  insights: string[]
}

export interface MonthlyTrendPoint {
  period: string // 'YYYY-MM'
  gfs: number
  timestamp: number
}

export interface HeatmapDay {
  date: string // 'YYYY-MM-DD'
  gfs: number
  level: 0 | 1 | 2 | 3 | 4 // GitHub-style contribution levels
}

export interface AnalyticsData {
  summary: AnalyticsSummary
  areaScores: AnalyticsAreaScore[]
  trendData: MonthlyTrendPoint[]
  heatmapData: HeatmapDay[]
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Get period string for a given date
 */
function getPeriod(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

/**
 * Get date N months ago
 */
function getMonthsAgo(months: number): string {
  const date = new Date()
  date.setMonth(date.getMonth() - months)
  return getPeriod(date)
}

/**
 * Calculate GFS from area scores
 */
function calculateGFS(areas: Array<{ score: number; weight: number }>): number {
  if (areas.length === 0) return 0

  const totalWeight = areas.reduce((sum, a) => sum + a.weight, 0)
  const weightedScore = areas.reduce((sum, a) => sum + (a.score * a.weight), 0)

  return Math.round((weightedScore / totalWeight) * 20)
}

/**
 * Calculate percentage change
 */
function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

/**
 * Get GitHub-style contribution level (0-4)
 */
function getContributionLevel(gfs: number): 0 | 1 | 2 | 3 | 4 {
  if (gfs >= 80) return 4
  if (gfs >= 60) return 3
  if (gfs >= 40) return 2
  if (gfs >= 20) return 1
  return 0
}

/**
 * Generate AI insights based on data
 */
function generateInsights(summary: AnalyticsSummary, areaScores: AnalyticsAreaScore[]): string[] {
  const insights: string[] = []

  // Overall GFS insights
  if (summary.currentGFS >= 80) {
    insights.push(`Exceptional! Your overall fulfillment is at ${summary.currentGFS}/100 - you're thriving across most life areas.`)
  } else if (summary.currentGFS >= 60) {
    insights.push(`Strong foundation! Your fulfillment score is ${summary.currentGFS}/100 with opportunities to optimize.`)
  } else if (summary.currentGFS >= 40) {
    insights.push(`Building momentum. Your score is ${summary.currentGFS}/100 - focus areas identified below.`)
  } else {
    insights.push(`Let's rise together. Your score is ${summary.currentGFS}/100 - we've identified key areas for transformation.`)
  }

  // Month-over-Month insights
  if (summary.momGFSChange !== null) {
    if (summary.momGFSChange > 10) {
      insights.push(`Outstanding progress! You've improved by ${summary.momGFSChange.toFixed(1)} points (${summary.momGFSPercentage?.toFixed(1)}%) this month.`)
    } else if (summary.momGFSChange > 5) {
      insights.push(`Solid improvement of ${summary.momGFSChange.toFixed(1)} points (${summary.momGFSPercentage?.toFixed(1)}%) since last month.`)
    } else if (summary.momGFSChange < -10) {
      insights.push(`Attention needed: Your score has declined by ${Math.abs(summary.momGFSChange).toFixed(1)} points since last month. Let's address this together.`)
    } else if (summary.momGFSChange < -5) {
      insights.push(`Slight decline of ${Math.abs(summary.momGFSChange).toFixed(1)} points - consider reviewing your recent patterns.`)
    }
  }

  // Year-over-Year insights
  if (summary.yoyGFSChange !== null) {
    if (summary.yoyGFSChange > 15) {
      insights.push(`Remarkable year! You've grown ${summary.yoyGFSChange.toFixed(1)} points (${summary.yoyGFSPercentage?.toFixed(1)}%) since last year.`)
    } else if (summary.yoyGFSChange > 0) {
      insights.push(`Year-over-year growth of ${summary.yoyGFSChange.toFixed(1)} points shows sustained progress.`)
    } else if (summary.yoyGFSChange < 0) {
      insights.push(`Year-over-year comparison shows a ${Math.abs(summary.yoyGFSChange).toFixed(1)} point change - let's explore what shifted.`)
    }
  }

  // Top improving areas
  if (summary.topImproving.length > 0) {
    const topArea = summary.topImproving[0]
    if (topArea.momChange && topArea.momChange > 0.5) {
      insights.push(`${topArea.area.emoji} ${topArea.area.name} is your star performer, up ${topArea.momChange.toFixed(1)} points!`)
    }
  }

  // Top declining areas
  if (summary.topDeclining.length > 0) {
    const declineArea = summary.topDeclining[0]
    if (declineArea.momChange && declineArea.momChange < -0.5) {
      insights.push(`${declineArea.area.emoji} ${declineArea.area.name} needs attention - down ${Math.abs(declineArea.momChange).toFixed(1)} points.`)
    }
  }

  // Area balance insights
  const excellentAreas = areaScores.filter(a => a.currentScore >= 4.5).length
  const criticalAreas = areaScores.filter(a => a.currentScore < 2).length

  if (excellentAreas > 8) {
    insights.push(`${excellentAreas} areas are thriving (≥4.5/5) - exceptional balance!`)
  }

  if (criticalAreas > 0) {
    insights.push(`Focus opportunity: ${criticalAreas} area${criticalAreas > 1 ? 's' : ''} below 2.0 would benefit from attention.`)
  }

  return insights
}

// =====================================================
// MAIN ANALYTICS FUNCTIONS
// =====================================================

/**
 * Fetch comprehensive analytics data for a user
 */
export async function fetchAnalytics(userId: string): Promise<AnalyticsData> {
  const currentPeriod = getPeriod(new Date())
  const lastMonthPeriod = getMonthsAgo(1)
  const lastYearPeriod = getMonthsAgo(12)

  // Fetch all active areas
  const { data: areas, error: areasError } = await supabase
    .from('fd_areas')
    .select('*')
    .eq('is_active', true)
    .order('code')

  if (areasError) throw areasError
  if (!areas || areas.length === 0) {
    throw new Error('No areas found')
  }

  // Fetch current month reviews
  const { data: currentReviews } = await supabase
    .from('fd_review_month')
    .select('*')
    .eq('user_id', userId)
    .eq('month', currentPeriod)
    .single()

  // Fetch last month reviews
  const { data: lastMonthReviews } = await supabase
    .from('fd_review_month')
    .select('*')
    .eq('user_id', userId)
    .eq('month', lastMonthPeriod)
    .single()

  // Fetch last year reviews
  const { data: lastYearReviews } = await supabase
    .from('fd_review_month')
    .select('*')
    .eq('user_id', userId)
    .eq('month', lastYearPeriod)
    .single()

  // Fetch score rollups for all three periods
  const { data: currentScores } = await supabase
    .from('fd_score_rollup')
    .select('*')
    .eq('user_id', userId)
    .eq('period', currentPeriod)

  const { data: lastMonthScores } = await supabase
    .from('fd_score_rollup')
    .select('*')
    .eq('user_id', userId)
    .eq('period', lastMonthPeriod)

  const { data: lastYearScores } = await supabase
    .from('fd_score_rollup')
    .select('*')
    .eq('user_id', userId)
    .eq('period', lastYearPeriod)

  // Build area scores with comparisons
  const areaScores: AnalyticsAreaScore[] = areas.map(area => {
    const current = currentScores?.find(s => s.area_id === area.id)
    const lastMonth = lastMonthScores?.find(s => s.area_id === area.id)
    const lastYear = lastYearScores?.find(s => s.area_id === area.id)

    const currentScore = current?.score || 2.5
    const lastMonthScore = lastMonth?.score || null
    const lastYearScore = lastYear?.score || null

    const momChange = lastMonthScore !== null ? currentScore - lastMonthScore : null
    const yoyChange = lastYearScore !== null ? currentScore - lastYearScore : null

    const momPercentage = lastMonthScore !== null
      ? calculatePercentageChange(currentScore, lastMonthScore)
      : null

    const yoyPercentage = lastYearScore !== null
      ? calculatePercentageChange(currentScore, lastYearScore)
      : null

    let trend: 'up' | 'down' | 'stable' = 'stable'
    if (momChange !== null) {
      if (momChange > 0.2) trend = 'up'
      else if (momChange < -0.2) trend = 'down'
    }

    return {
      area,
      currentScore,
      lastMonthScore,
      lastYearScore,
      momChange,
      yoyChange,
      momPercentage,
      yoyPercentage,
      trend,
      confidence: current?.confidence || 0.5,
    }
  })

  // Calculate GFS values
  const currentGFS = currentReviews?.gfs || calculateGFS(
    areaScores.map(as => ({ score: as.currentScore, weight: as.area.weight_default }))
  )

  const lastMonthGFS = lastMonthReviews?.gfs || (
    lastMonthScores && lastMonthScores.length > 0
      ? calculateGFS(
          areaScores.map(as => ({
            score: as.lastMonthScore || as.currentScore,
            weight: as.area.weight_default
          }))
        )
      : null
  )

  const lastYearGFS = lastYearReviews?.gfs || (
    lastYearScores && lastYearScores.length > 0
      ? calculateGFS(
          areaScores.map(as => ({
            score: as.lastYearScore || as.currentScore,
            weight: as.area.weight_default
          }))
        )
      : null
  )

  const momGFSChange = lastMonthGFS !== null ? currentGFS - lastMonthGFS : null
  const yoyGFSChange = lastYearGFS !== null ? currentGFS - lastYearGFS : null

  const momGFSPercentage = lastMonthGFS !== null
    ? calculatePercentageChange(currentGFS, lastMonthGFS)
    : null

  const yoyGFSPercentage = lastYearGFS !== null
    ? calculatePercentageChange(currentGFS, lastYearGFS)
    : null

  // Identify top movers
  const topImproving = [...areaScores]
    .filter(a => a.momChange !== null && a.momChange > 0)
    .sort((a, b) => (b.momChange || 0) - (a.momChange || 0))
    .slice(0, 5)

  const topDeclining = [...areaScores]
    .filter(a => a.momChange !== null && a.momChange < 0)
    .sort((a, b) => (a.momChange || 0) - (b.momChange || 0))
    .slice(0, 5)

  // Build summary with insights
  const summaryWithoutInsights: Omit<AnalyticsSummary, 'insights'> = {
    currentGFS,
    lastMonthGFS,
    lastYearGFS,
    momGFSChange,
    yoyGFSChange,
    momGFSPercentage,
    yoyGFSPercentage,
    topImproving,
    topDeclining,
  }

  const summary: AnalyticsSummary = {
    ...summaryWithoutInsights,
    insights: generateInsights(summaryWithoutInsights as AnalyticsSummary, areaScores),
  }

  // Fetch trend data (last 12 months)
  const trendData = await fetchTrendData(userId, 12)

  // Fetch heatmap data (last 365 days)
  const heatmapData = await fetchHeatmapData(userId, 365)

  return {
    summary,
    areaScores,
    trendData,
    heatmapData,
  }
}

/**
 * Fetch GFS trend data for the last N months
 */
export async function fetchTrendData(
  userId: string,
  months: number = 12
): Promise<MonthlyTrendPoint[]> {
  const periods: string[] = []

  for (let i = 0; i < months; i++) {
    periods.push(getMonthsAgo(i))
  }

  const { data: reviews } = await supabase
    .from('fd_review_month')
    .select('month, gfs')
    .eq('user_id', userId)
    .in('month', periods)
    .order('month', { ascending: true })

  if (!reviews || reviews.length === 0) {
    // Return empty data with periods
    return periods.reverse().map(period => ({
      period,
      gfs: 0,
      timestamp: new Date(period + '-01').getTime(),
    }))
  }

  return reviews.map(review => ({
    period: review.month,
    gfs: review.gfs,
    timestamp: new Date(review.month + '-01').getTime(),
  }))
}

/**
 * Fetch heatmap data (daily GFS values)
 * Note: This is an approximation since we store monthly data
 * For daily granularity, we'd need to compute from daily entries
 */
export async function fetchHeatmapData(
  userId: string,
  days: number = 365
): Promise<HeatmapDay[]> {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const endDate = new Date()

  // Fetch monthly reviews for the date range
  const startPeriod = getPeriod(startDate)
  const endPeriod = getPeriod(endDate)

  const { data: reviews } = await supabase
    .from('fd_review_month')
    .select('month, gfs')
    .eq('user_id', userId)
    .gte('month', startPeriod)
    .lte('month', endPeriod)
    .order('month', { ascending: true })

  // Generate daily data (approximated from monthly)
  const heatmapData: HeatmapDay[] = []
  const currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    const period = getPeriod(currentDate)
    const review = reviews?.find(r => r.month === period)
    const gfs = review?.gfs || 0

    heatmapData.push({
      date: currentDate.toISOString().split('T')[0],
      gfs,
      level: getContributionLevel(gfs),
    })

    currentDate.setDate(currentDate.getDate() + 1)
  }

  return heatmapData
}

/**
 * Fetch area comparison data (current vs last month vs last year)
 */
export async function fetchAreaComparison(
  userId: string,
  areaId: string
): Promise<{
  area: FDArea
  current: number
  lastMonth: number | null
  lastYear: number | null
  trend: MonthlyTrendPoint[]
}> {
  const currentPeriod = getPeriod(new Date())
  const lastMonthPeriod = getMonthsAgo(1)
  const lastYearPeriod = getMonthsAgo(12)

  // Fetch area details
  const { data: area, error: areaError } = await supabase
    .from('fd_areas')
    .select('*')
    .eq('id', areaId)
    .single()

  if (areaError) throw areaError

  // Fetch scores for all three periods
  const { data: currentScore } = await supabase
    .from('fd_score_rollup')
    .select('*')
    .eq('user_id', userId)
    .eq('area_id', areaId)
    .eq('period', currentPeriod)
    .single()

  const { data: lastMonthScore } = await supabase
    .from('fd_score_rollup')
    .select('*')
    .eq('user_id', userId)
    .eq('area_id', areaId)
    .eq('period', lastMonthPeriod)
    .single()

  const { data: lastYearScore } = await supabase
    .from('fd_score_rollup')
    .select('*')
    .eq('user_id', userId)
    .eq('area_id', areaId)
    .eq('period', lastYearPeriod)
    .single()

  // Fetch 12-month trend
  const periods: string[] = []
  for (let i = 0; i < 12; i++) {
    periods.push(getMonthsAgo(i))
  }

  const { data: trendScores } = await supabase
    .from('fd_score_rollup')
    .select('period, score')
    .eq('user_id', userId)
    .eq('area_id', areaId)
    .in('period', periods)
    .order('period', { ascending: true })

  const trend: MonthlyTrendPoint[] = (trendScores || []).map(s => ({
    period: s.period,
    gfs: Math.round(s.score * 20), // Convert 0-5 to 0-100 scale
    timestamp: new Date(s.period + '-01').getTime(),
  }))

  return {
    area,
    current: currentScore?.score || 0,
    lastMonth: lastMonthScore?.score || null,
    lastYear: lastYearScore?.score || null,
    trend,
  }
}
