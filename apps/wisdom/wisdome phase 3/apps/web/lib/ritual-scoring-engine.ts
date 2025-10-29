/**
 * Ritual Completion Tracking → Score Impact Engine
 *
 * Automatically updates fulfillment scores based on ritual completion rates.
 * Rituals are linked to life areas, and consistent completion improves scores.
 */

import { supabase } from '@/lib/supabase'

// Types
export interface Ritual {
  id: string
  user_id: string
  tenant_id: string
  title: string
  description: string | null
  cadence: 'daily' | 'weekly' | 'monthly' | 'custom'
  area_ids: string[] // Life areas this ritual impacts
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface RitualSession {
  id: string
  ritual_id: string
  user_id: string
  completed_at: string
  duration_minutes: number | null
  quality_rating: number | null // 1-5
  notes: string | null
  created_at: string
}

export interface RitualImpactScore {
  area_id: string
  area_name: string
  impact_score: number // 0-5
  completion_rate: number // 0-1
  consistency_bonus: number // 0-0.5
  quality_average: number // 0-5
  sessions_count: number
  reasoning: string
}

export interface RitualScoreResult {
  period: string
  impacts: RitualImpactScore[]
  overall_ritual_score: number
  total_sessions: number
  total_rituals_tracked: number
}

/**
 * Calculate ritual impact on fulfillment scores for a given period
 */
export async function calculateRitualImpact(
  userId: string,
  period: string, // YYYY-MM format
  tenantId: string = 'default-tenant'
): Promise<RitualScoreResult> {
  // Parse period
  const [year, month] = period.split('-').map(Number)
  const periodStart = new Date(year, month - 1, 1)
  const periodEnd = new Date(year, month, 0, 23, 59, 59)

  // 1. Fetch all active rituals for user
  const { data: rituals, error: ritualsError } = await supabase
    .from('rituals')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)

  if (ritualsError) throw new Error(`Failed to fetch rituals: ${ritualsError.message}`)
  if (!rituals || rituals.length === 0) {
    return {
      period,
      impacts: [],
      overall_ritual_score: 0,
      total_sessions: 0,
      total_rituals_tracked: 0
    }
  }

  // 2. Fetch all ritual sessions for this period
  const { data: sessions, error: sessionsError } = await supabase
    .from('ritual_sessions')
    .select('*')
    .eq('user_id', userId)
    .gte('completed_at', periodStart.toISOString())
    .lte('completed_at', periodEnd.toISOString())

  if (sessionsError) throw new Error(`Failed to fetch sessions: ${sessionsError.message}`)

  // 3. Group sessions by ritual
  const sessionsByRitual = new Map<string, RitualSession[]>()
  sessions?.forEach(session => {
    const existing = sessionsByRitual.get(session.ritual_id) || []
    sessionsByRitual.set(session.ritual_id, [...existing, session])
  })

  // 4. Calculate impact per area
  const areaImpacts = new Map<string, {
    scores: number[]
    sessions: number
    qualities: number[]
    rituals: Set<string>
  }>()

  rituals.forEach(ritual => {
    const ritualSessions = sessionsByRitual.get(ritual.id) || []
    if (ritualSessions.length === 0) return

    // Calculate completion rate
    const expectedCompletions = getExpectedCompletions(ritual.cadence, periodStart, periodEnd)
    const actualCompletions = ritualSessions.length
    const completionRate = Math.min(actualCompletions / expectedCompletions, 1.0)

    // Calculate quality average
    const qualityRatings = ritualSessions
      .map(s => s.quality_rating)
      .filter((q): q is number => q !== null)
    const qualityAverage = qualityRatings.length > 0
      ? qualityRatings.reduce((sum, q) => sum + q, 0) / qualityRatings.length
      : 3.0 // Default to neutral

    // Calculate consistency bonus (streak-based)
    const consistencyBonus = calculateConsistencyBonus(ritualSessions, ritual.cadence)

    // Base score: completion rate × quality
    const baseScore = (completionRate * 0.7 + qualityAverage / 5 * 0.3) * 5

    // Final score with consistency bonus
    const impactScore = Math.min(baseScore + consistencyBonus, 5.0)

    // Apply to all linked areas
    ritual.area_ids.forEach((areaId: string) => {
      const existing = areaImpacts.get(areaId) || {
        scores: [],
        sessions: 0,
        qualities: [],
        rituals: new Set<string>()
      }

      existing.scores.push(impactScore)
      existing.sessions += ritualSessions.length
      existing.qualities.push(qualityAverage)
      existing.rituals.add(ritual.id)

      areaImpacts.set(areaId, existing)
    })
  })

  // 5. Fetch area names
  const areaIds = Array.from(areaImpacts.keys())
  const { data: areas } = await supabase
    .from('fd_area')
    .select('id, name')
    .in('id', areaIds)

  const areaNameMap = new Map(areas?.map(a => [a.id, a.name]) || [])

  // 6. Build impact scores
  const impacts: RitualImpactScore[] = Array.from(areaImpacts.entries()).map(([areaId, data]) => {
    const avgScore = data.scores.reduce((sum, s) => sum + s, 0) / data.scores.length
    const avgQuality = data.qualities.reduce((sum, q) => sum + q, 0) / data.qualities.length
    const completionRate = avgScore / 5 // Approximate
    const consistencyBonus = Math.max(...data.scores) - (completionRate * 5)

    return {
      area_id: areaId,
      area_name: areaNameMap.get(areaId) || 'Unknown Area',
      impact_score: avgScore,
      completion_rate: completionRate,
      consistency_bonus: consistencyBonus,
      quality_average: avgQuality,
      sessions_count: data.sessions,
      reasoning: generateReasoning(data.scores.length, data.sessions, completionRate, avgQuality)
    }
  })

  // 7. Calculate overall ritual score
  const overallScore = impacts.length > 0
    ? impacts.reduce((sum, i) => sum + i.impact_score, 0) / impacts.length
    : 0

  return {
    period,
    impacts,
    overall_ritual_score: overallScore,
    total_sessions: sessions?.length || 0,
    total_rituals_tracked: rituals.length
  }
}

/**
 * Get expected number of completions for a ritual in the given period
 */
function getExpectedCompletions(
  cadence: string,
  periodStart: Date,
  periodEnd: Date
): number {
  const days = Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24))

  switch (cadence) {
    case 'daily':
      return days
    case 'weekly':
      return Math.ceil(days / 7)
    case 'monthly':
      return 1
    case 'custom':
      return Math.ceil(days / 7) // Default to weekly
    default:
      return days
  }
}

/**
 * Calculate consistency bonus based on streak and regularity
 */
function calculateConsistencyBonus(
  sessions: RitualSession[],
  cadence: string
): number {
  if (sessions.length < 2) return 0

  // Sort sessions by date
  const sorted = sessions.sort((a, b) =>
    new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime()
  )

  // Calculate gaps between sessions
  const gaps: number[] = []
  for (let i = 1; i < sorted.length; i++) {
    const prevDate = new Date(sorted[i - 1].completed_at)
    const currDate = new Date(sorted[i].completed_at)
    const gapDays = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
    gaps.push(gapDays)
  }

  // Expected gap based on cadence
  const expectedGap = cadence === 'daily' ? 1 : cadence === 'weekly' ? 7 : 30

  // Calculate consistency (how close gaps are to expected)
  const avgGap = gaps.reduce((sum, g) => sum + g, 0) / gaps.length
  const gapVariance = gaps.reduce((sum, g) => sum + Math.abs(g - avgGap), 0) / gaps.length

  // Lower variance = higher consistency
  const consistencyScore = Math.max(0, 1 - (gapVariance / expectedGap))

  // Bonus: 0 to 0.5 points
  return consistencyScore * 0.5
}

/**
 * Generate human-readable reasoning for impact score
 */
function generateReasoning(
  ritualCount: number,
  sessionCount: number,
  completionRate: number,
  quality: number
): string {
  const parts: string[] = []

  // Completion rate feedback
  if (completionRate >= 0.9) {
    parts.push('Exceptional consistency')
  } else if (completionRate >= 0.7) {
    parts.push('Strong completion rate')
  } else if (completionRate >= 0.5) {
    parts.push('Moderate completion')
  } else {
    parts.push('Sporadic completion')
  }

  // Quality feedback
  if (quality >= 4.5) {
    parts.push('outstanding quality')
  } else if (quality >= 3.5) {
    parts.push('good quality')
  } else if (quality >= 2.5) {
    parts.push('average quality')
  } else {
    parts.push('needs improvement')
  }

  // Session count
  parts.push(`${sessionCount} sessions`)

  // Ritual count
  if (ritualCount > 1) {
    parts.push(`across ${ritualCount} rituals`)
  }

  return parts.join(', ')
}

/**
 * Save ritual impacts as fulfillment scores
 */
export async function saveRitualImpactsAsScores(
  userId: string,
  tenantId: string,
  result: RitualScoreResult
): Promise<{ saved: number; errors: string[] }> {
  const errors: string[] = []
  let saved = 0

  for (const impact of result.impacts) {
    try {
      const { error } = await supabase
        .from('fd_score_raw')
        .insert({
          user_id: userId,
          tenant_id: tenantId,
          area_id: impact.area_id,
          period: result.period,
          score: impact.impact_score,
          confidence: 0.85, // High confidence for ritual-based scores
          source: 'ritual_tracking',
          metadata: {
            completion_rate: impact.completion_rate,
            consistency_bonus: impact.consistency_bonus,
            quality_average: impact.quality_average,
            sessions_count: impact.sessions_count,
            reasoning: impact.reasoning
          }
        })

      if (error) {
        errors.push(`${impact.area_name}: ${error.message}`)
      } else {
        saved++
      }
    } catch (err: any) {
      errors.push(`${impact.area_name}: ${err.message}`)
    }
  }

  return { saved, errors }
}

/**
 * Fetch ritual completion rate for a specific area
 */
export async function getRitualCompletionRateForArea(
  userId: string,
  areaId: string,
  periodStart: Date,
  periodEnd: Date
): Promise<{ rate: number; sessions: number; expected: number }> {
  // Fetch rituals linked to this area
  const { data: rituals } = await supabase
    .from('rituals')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .contains('area_ids', [areaId])

  if (!rituals || rituals.length === 0) {
    return { rate: 0, sessions: 0, expected: 0 }
  }

  // Fetch sessions for these rituals
  const ritualIds = rituals.map(r => r.id)
  const { data: sessions } = await supabase
    .from('ritual_sessions')
    .select('*')
    .in('ritual_id', ritualIds)
    .gte('completed_at', periodStart.toISOString())
    .lte('completed_at', periodEnd.toISOString())

  const actualSessions = sessions?.length || 0

  // Calculate expected sessions
  let expectedSessions = 0
  rituals.forEach(ritual => {
    expectedSessions += getExpectedCompletions(ritual.cadence, periodStart, periodEnd)
  })

  const rate = expectedSessions > 0 ? actualSessions / expectedSessions : 0

  return {
    rate: Math.min(rate, 1.0),
    sessions: actualSessions,
    expected: expectedSessions
  }
}
