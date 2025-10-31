/**
 * Monthly & Quarterly Review Generator
 *
 * Automatically generates comprehensive fulfillment reviews with:
 * - Period summary (scores, trends, insights)
 * - Area-by-area analysis
 * - Top wins and challenges
 * - Recommendations for next period
 * - AI-generated insights
 */

import { supabase } from '@/lib/supabase'

// Types
export interface ReviewPeriod {
  type: 'monthly' | 'quarterly' | 'yearly'
  year: number
  month?: number // 1-12 for monthly
  quarter?: number // 1-4 for quarterly
  label: string // e.g., "January 2025", "Q1 2025"
}

export interface AreaReview {
  area_id: string
  area_code: string
  area_name: string
  emoji: string
  start_score: number | null
  end_score: number | null
  avg_score: number
  change: number | null
  trend: 'improving' | 'declining' | 'stable'
  data_points: number
  status: 'excellent' | 'healthy' | 'friction' | 'critical'
  highlights: string[]
  challenges: string[]
  recommendation: string
}

export interface FulfillmentReview {
  id: string
  user_id: string
  tenant_id: string
  period: ReviewPeriod
  generated_at: string

  // Overall Metrics
  gfs_start: number | null
  gfs_end: number
  gfs_avg: number
  gfs_change: number | null

  // Area Reviews
  areas: AreaReview[]

  // Insights
  top_wins: string[]
  top_challenges: string[]
  top_improving_areas: AreaReview[]
  top_declining_areas: AreaReview[]

  // Recommendations
  focus_areas: string[]
  suggested_actions: string[]

  // AI Insights
  ai_summary: string
  ai_insights: string[]

  // Metadata
  total_scores_recorded: number
  areas_tracked: number
  completion_rate: number
}

/**
 * Generate a monthly review for a user
 */
export async function generateMonthlyReview(
  userId: string,
  year: number,
  month: number, // 1-12
  tenantId: string = 'default-tenant'
): Promise<FulfillmentReview> {
  const period: ReviewPeriod = {
    type: 'monthly',
    year,
    month,
    label: `${getMonthName(month)} ${year}`
  }

  return await generateReview(userId, period, tenantId)
}

/**
 * Generate a quarterly review for a user
 */
export async function generateQuarterlyReview(
  userId: string,
  year: number,
  quarter: number, // 1-4
  tenantId: string = 'default-tenant'
): Promise<FulfillmentReview> {
  const period: ReviewPeriod = {
    type: 'quarterly',
    year,
    quarter,
    label: `Q${quarter} ${year}`
  }

  return await generateReview(userId, period, tenantId)
}

/**
 * Core review generation logic
 */
async function generateReview(
  userId: string,
  period: ReviewPeriod,
  tenantId: string
): Promise<FulfillmentReview> {
  // 1. Calculate period dates
  const { startDate, endDate } = getPeriodDates(period)
  const prevPeriod = getPreviousPeriod(period)
  const { startDate: prevStartDate, endDate: prevEndDate } = getPeriodDates(prevPeriod)

  // 2. Fetch all active areas
  const { data: areas } = await supabase
    .from('fd_areas')
    .select('*')
    .eq('is_active', true)
    .order('code')

  if (!areas) throw new Error('No areas found')

  // 3. Fetch scores for current period
  const { data: currentScores } = await supabase
    .from('fd_score_raw')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  // 4. Fetch scores for previous period
  const { data: prevScores } = await supabase
    .from('fd_score_raw')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', prevStartDate.toISOString())
    .lte('created_at', prevEndDate.toISOString())

  // 5. Build area reviews
  const areaReviews: AreaReview[] = await Promise.all(
    areas.map(async area => {
      const areaCurrentScores = currentScores?.filter(s => s.area_id === area.id) || []
      const areaPrevScores = prevScores?.filter(s => s.area_id === area.id) || []

      const avgScore = areaCurrentScores.length > 0
        ? areaCurrentScores.reduce((sum, s) => sum + s.score, 0) / areaCurrentScores.length
        : 0

      const startScore = areaCurrentScores.length > 0
        ? areaCurrentScores[0].score
        : null

      const endScore = areaCurrentScores.length > 0
        ? areaCurrentScores[areaCurrentScores.length - 1].score
        : avgScore

      const prevAvgScore = areaPrevScores.length > 0
        ? areaPrevScores.reduce((sum, s) => sum + s.score, 0) / areaPrevScores.length
        : null

      const change = prevAvgScore !== null ? avgScore - prevAvgScore : null

      const trend = change === null ? 'stable'
        : change > 0.3 ? 'improving'
        : change < -0.3 ? 'declining'
        : 'stable'

      const status = avgScore >= 4.5 ? 'excellent'
        : avgScore >= 3.5 ? 'healthy'
        : avgScore >= 2.0 ? 'friction'
        : 'critical'

      return {
        area_id: area.id,
        area_code: area.code,
        area_name: area.name,
        emoji: area.emoji,
        start_score: startScore,
        end_score: endScore,
        avg_score: avgScore,
        change,
        trend,
        data_points: areaCurrentScores.length,
        status,
        highlights: generateHighlights(area, areaCurrentScores, trend),
        challenges: generateChallenges(area, areaCurrentScores, trend, status),
        recommendation: generateRecommendation(area, avgScore, trend, status)
      }
    })
  )

  // 6. Calculate GFS
  const calculateGFS = (scores: typeof currentScores) => {
    if (!scores || scores.length === 0) return 0
    const areaScores = new Map<string, number[]>()
    scores.forEach(s => {
      const existing = areaScores.get(s.area_id) || []
      areaScores.set(s.area_id, [...existing, s.score])
    })
    const avgByArea = Array.from(areaScores.values()).map(scores =>
      scores.reduce((sum, s) => sum + s, 0) / scores.length
    )
    const overallAvg = avgByArea.reduce((sum, s) => sum + s, 0) / avgByArea.length
    return Math.round(overallAvg * 20)
  }

  const gfsEnd = calculateGFS(currentScores)
  const gfsAvg = gfsEnd // For now, same as end
  const gfsStart = prevScores && prevScores.length > 0 ? calculateGFS(prevScores) : null
  const gfsChange = gfsStart !== null ? gfsEnd - gfsStart : null

  // 7. Identify top movers
  const improving = areaReviews
    .filter(a => a.trend === 'improving')
    .sort((a, b) => (b.change || 0) - (a.change || 0))
    .slice(0, 3)

  const declining = areaReviews
    .filter(a => a.trend === 'declining')
    .sort((a, b) => (a.change || 0) - (b.change || 0))
    .slice(0, 3)

  // 8. Generate insights
  const topWins = generateTopWins(areaReviews, gfsChange)
  const topChallenges = generateTopChallenges(areaReviews, gfsChange)
  const focusAreas = generateFocusAreas(areaReviews)
  const suggestedActions = generateSuggestedActions(areaReviews, focusAreas)

  // 9. AI summary and insights
  const aiSummary = generateAISummary(period, gfsEnd, gfsChange, areaReviews)
  const aiInsights = generateAIInsights(areaReviews, improving, declining)

  // 10. Build final review
  const review: FulfillmentReview = {
    id: crypto.randomUUID(),
    user_id: userId,
    tenant_id: tenantId,
    period,
    generated_at: new Date().toISOString(),
    gfs_start: gfsStart,
    gfs_end: gfsEnd,
    gfs_avg: gfsAvg,
    gfs_change: gfsChange,
    areas: areaReviews,
    top_wins: topWins,
    top_challenges: topChallenges,
    top_improving_areas: improving,
    top_declining_areas: declining,
    focus_areas: focusAreas,
    suggested_actions: suggestedActions,
    ai_summary: aiSummary,
    ai_insights: aiInsights,
    total_scores_recorded: currentScores?.length || 0,
    areas_tracked: areaReviews.filter(a => a.data_points > 0).length,
    completion_rate: areaReviews.filter(a => a.data_points > 0).length / areas.length
  }

  return review
}

// Helper functions

function getPeriodDates(period: ReviewPeriod): { startDate: Date; endDate: Date } {
  if (period.type === 'monthly') {
    const startDate = new Date(period.year, period.month! - 1, 1)
    const endDate = new Date(period.year, period.month!, 0, 23, 59, 59)
    return { startDate, endDate }
  } else if (period.type === 'quarterly') {
    const startMonth = (period.quarter! - 1) * 3
    const startDate = new Date(period.year, startMonth, 1)
    const endDate = new Date(period.year, startMonth + 3, 0, 23, 59, 59)
    return { startDate, endDate }
  }
  throw new Error('Yearly reviews not yet supported')
}

function getPreviousPeriod(period: ReviewPeriod): ReviewPeriod {
  if (period.type === 'monthly') {
    const prevMonth = period.month! === 1 ? 12 : period.month! - 1
    const prevYear = period.month! === 1 ? period.year - 1 : period.year
    return {
      type: 'monthly',
      year: prevYear,
      month: prevMonth,
      label: `${getMonthName(prevMonth)} ${prevYear}`
    }
  } else {
    const prevQuarter = period.quarter! === 1 ? 4 : period.quarter! - 1
    const prevYear = period.quarter! === 1 ? period.year - 1 : period.year
    return {
      type: 'quarterly',
      year: prevYear,
      quarter: prevQuarter,
      label: `Q${prevQuarter} ${prevYear}`
    }
  }
}

function getMonthName(month: number): string {
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']
  return months[month - 1]
}

function generateHighlights(area: any, scores: any[], trend: string): string[] {
  const highlights: string[] = []
  if (scores.length > 0) {
    highlights.push(`${scores.length} scores recorded`)
  }
  if (trend === 'improving') {
    highlights.push('Showing improvement trend')
  }
  return highlights
}

function generateChallenges(area: any, scores: any[], trend: string, status: string): string[] {
  const challenges: string[] = []
  if (status === 'critical' || status === 'friction') {
    challenges.push('Score below healthy threshold')
  }
  if (trend === 'declining') {
    challenges.push('Declining trend detected')
  }
  if (scores.length === 0) {
    challenges.push('No data recorded this period')
  }
  return challenges
}

function generateRecommendation(area: any, score: number, trend: string, status: string): string {
  if (status === 'excellent') {
    return `Maintain momentum in ${area.name}`
  }
  if (trend === 'declining') {
    return `Focus on reversing decline in ${area.name}`
  }
  if (status === 'critical') {
    return `Urgent: ${area.name} needs immediate attention`
  }
  return `Continue progress in ${area.name}`
}

function generateTopWins(areas: AreaReview[], gfsChange: number | null): string[] {
  const wins: string[] = []
  if (gfsChange && gfsChange > 5) {
    wins.push(`GFS improved by ${gfsChange} points!`)
  }
  areas.filter(a => a.trend === 'improving').slice(0, 3).forEach(a => {
    wins.push(`${a.area_name}: +${a.change?.toFixed(1)} improvement`)
  })
  return wins
}

function generateTopChallenges(areas: AreaReview[], gfsChange: number | null): string[] {
  const challenges: string[] = []
  if (gfsChange && gfsChange < -5) {
    challenges.push(`GFS declined by ${Math.abs(gfsChange)} points`)
  }
  areas.filter(a => a.status === 'critical').forEach(a => {
    challenges.push(`${a.area_name}: Critical status (${a.avg_score.toFixed(1)}/5)`)
  })
  return challenges
}

function generateFocusAreas(areas: AreaReview[]): string[] {
  return areas
    .filter(a => a.status === 'critical' || a.status === 'friction')
    .sort((a, b) => a.avg_score - b.avg_score)
    .slice(0, 3)
    .map(a => a.area_name)
}

function generateSuggestedActions(areas: AreaReview[], focusAreas: string[]): string[] {
  return areas
    .filter(a => focusAreas.includes(a.area_name))
    .map(a => a.recommendation)
}

function generateAISummary(
  period: ReviewPeriod,
  gfs: number,
  gfsChange: number | null,
  areas: AreaReview[]
): string {
  const changeText = gfsChange
    ? gfsChange > 0
      ? `up ${gfsChange} points`
      : `down ${Math.abs(gfsChange)} points`
    : 'stable'

  return `In ${period.label}, your Global Fulfillment Score was ${gfs}/100 (${changeText}). You tracked ${areas.filter(a => a.data_points > 0).length} life areas with ${areas.reduce((sum, a) => sum + a.data_points, 0)} total scores recorded.`
}

function generateAIInsights(
  areas: AreaReview[],
  improving: AreaReview[],
  declining: AreaReview[]
): string[] {
  const insights: string[] = []

  if (improving.length > 0) {
    insights.push(`Your strongest growth was in ${improving[0].area_name} (+${improving[0].change?.toFixed(1)})`)
  }

  if (declining.length > 0) {
    insights.push(`${declining[0].area_name} needs attention (${declining[0].change?.toFixed(1)})`)
  }

  const excellent = areas.filter(a => a.status === 'excellent').length
  if (excellent > 0) {
    insights.push(`${excellent} areas in excellent condition`)
  }

  return insights
}

/**
 * Save review to database
 */
export async function saveReview(review: FulfillmentReview): Promise<void> {
  const { error } = await supabase
    .from('fd_review')
    .insert({
      id: review.id,
      user_id: review.user_id,
      tenant_id: review.tenant_id,
      review_type: review.period.type,
      year: review.period.year,
      month: review.period.month,
      quarter: review.period.quarter,
      gfs_start: review.gfs_start,
      gfs_end: review.gfs_end,
      gfs_change: review.gfs_change,
      review_data: review,
      generated_at: review.generated_at
    })

  if (error) throw new Error(`Failed to save review: ${error.message}`)
}
