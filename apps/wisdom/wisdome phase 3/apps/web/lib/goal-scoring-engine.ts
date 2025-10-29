/**
 * Goal Progress → Score Impact Engine
 *
 * Automatically updates fulfillment scores based on goal progress and completion.
 * Goals are linked to life areas, and progress/completion improves scores.
 */

import { supabase } from '@/lib/supabase'

// Types
export interface Goal {
  id: string
  user_id: string
  tenant_id: string
  title: string
  description: string | null
  area_ids: string[] // Life areas this goal impacts
  status: 'planned' | 'active' | 'paused' | 'done' | 'dropped'
  progress_percent: number // 0-100
  target_date: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface GoalKeyResult {
  id: string
  goal_id: string
  title: string
  target_value: number
  current_value: number
  unit: string
  is_completed: boolean
  created_at: string
  updated_at: string
}

export interface GoalImpactScore {
  area_id: string
  area_name: string
  impact_score: number // 0-5
  goals_count: number
  completed_count: number
  in_progress_count: number
  avg_progress: number // 0-100
  on_track_count: number
  overdue_count: number
  reasoning: string
}

export interface GoalScoreResult {
  period: string
  impacts: GoalImpactScore[]
  overall_goal_score: number
  total_goals: number
  completion_rate: number
}

/**
 * Calculate goal impact on fulfillment scores for a given period
 */
export async function calculateGoalImpact(
  userId: string,
  period: string, // YYYY-MM format
  tenantId: string = 'default-tenant'
): Promise<GoalScoreResult> {
  // Parse period
  const [year, month] = period.split('-').map(Number)
  const periodStart = new Date(year, month - 1, 1)
  const periodEnd = new Date(year, month, 0, 23, 59, 59)

  // 1. Fetch all goals for user (active, completed in period, or created in period)
  const { data: goals, error: goalsError } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .or(`status.eq.active,status.eq.done,created_at.gte.${periodStart.toISOString()}`)

  if (goalsError) throw new Error(`Failed to fetch goals: ${goalsError.message}`)
  if (!goals || goals.length === 0) {
    return {
      period,
      impacts: [],
      overall_goal_score: 0,
      total_goals: 0,
      completion_rate: 0
    }
  }

  // 2. Fetch key results for these goals
  const goalIds = goals.map(g => g.id)
  const { data: keyResults } = await supabase
    .from('goal_key_results')
    .select('*')
    .in('goal_id', goalIds)

  const keyResultsByGoal = new Map<string, GoalKeyResult[]>()
  keyResults?.forEach(kr => {
    const existing = keyResultsByGoal.get(kr.goal_id) || []
    keyResultsByGoal.set(kr.goal_id, [...existing, kr])
  })

  // 3. Calculate impact per area
  const areaImpacts = new Map<string, {
    goals: Goal[]
    completed: number
    inProgress: number
    progressSum: number
    onTrack: number
    overdue: number
  }>()

  const now = new Date()

  goals.forEach(goal => {
    const goalKRs = keyResultsByGoal.get(goal.id) || []

    // Calculate if goal is on track
    const isOnTrack = goal.target_date
      ? goal.progress_percent >= getExpectedProgress(new Date(goal.created_at), new Date(goal.target_date), now)
      : goal.progress_percent > 0

    const isOverdue = goal.target_date
      ? new Date(goal.target_date) < now && goal.status !== 'done'
      : false

    // Apply to all linked areas
    goal.area_ids.forEach((areaId: string) => {
      const existing = areaImpacts.get(areaId) || {
        goals: [],
        completed: 0,
        inProgress: 0,
        progressSum: 0,
        onTrack: 0,
        overdue: 0
      }

      existing.goals.push(goal)
      existing.progressSum += goal.progress_percent

      if (goal.status === 'done') {
        existing.completed++
      } else if (goal.status === 'active') {
        existing.inProgress++
      }

      if (isOnTrack) existing.onTrack++
      if (isOverdue) existing.overdue++

      areaImpacts.set(areaId, existing)
    })
  })

  // 4. Fetch area names
  const areaIds = Array.from(areaImpacts.keys())
  const { data: areas } = await supabase
    .from('fd_area')
    .select('id, name')
    .in('id', areaIds)

  const areaNameMap = new Map(areas?.map(a => [a.id, a.name]) || [])

  // 5. Build impact scores
  const impacts: GoalImpactScore[] = Array.from(areaImpacts.entries()).map(([areaId, data]) => {
    const goalsCount = data.goals.length
    const avgProgress = goalsCount > 0 ? data.progressSum / goalsCount : 0
    const completionRate = goalsCount > 0 ? data.completed / goalsCount : 0

    // Calculate impact score (0-5)
    let impactScore = 0

    // Base score from completion rate (0-2 points)
    impactScore += completionRate * 2

    // Progress score for active goals (0-2 points)
    impactScore += (avgProgress / 100) * 2

    // Bonus for on-track goals (0-0.5 points)
    const onTrackRate = goalsCount > 0 ? data.onTrack / goalsCount : 0
    impactScore += onTrackRate * 0.5

    // Penalty for overdue goals (up to -0.5 points)
    const overdueRate = goalsCount > 0 ? data.overdue / goalsCount : 0
    impactScore -= overdueRate * 0.5

    // Cap at 0-5 range
    impactScore = Math.max(0, Math.min(5, impactScore))

    return {
      area_id: areaId,
      area_name: areaNameMap.get(areaId) || 'Unknown Area',
      impact_score: impactScore,
      goals_count: goalsCount,
      completed_count: data.completed,
      in_progress_count: data.inProgress,
      avg_progress: avgProgress,
      on_track_count: data.onTrack,
      overdue_count: data.overdue,
      reasoning: generateGoalReasoning(data)
    }
  })

  // 6. Calculate overall goal score
  const totalGoals = goals.length
  const completedGoals = goals.filter(g => g.status === 'done').length
  const completionRate = totalGoals > 0 ? completedGoals / totalGoals : 0

  const overallScore = impacts.length > 0
    ? impacts.reduce((sum, i) => sum + i.impact_score, 0) / impacts.length
    : 0

  return {
    period,
    impacts,
    overall_goal_score: overallScore,
    total_goals: totalGoals,
    completion_rate: completionRate
  }
}

/**
 * Get expected progress percentage at current date
 */
function getExpectedProgress(
  startDate: Date,
  targetDate: Date,
  currentDate: Date
): number {
  const totalDuration = targetDate.getTime() - startDate.getTime()
  const elapsed = currentDate.getTime() - startDate.getTime()

  if (elapsed <= 0) return 0
  if (elapsed >= totalDuration) return 100

  return (elapsed / totalDuration) * 100
}

/**
 * Generate human-readable reasoning for goal impact
 */
function generateGoalReasoning(data: {
  goals: Goal[]
  completed: number
  inProgress: number
  progressSum: number
  onTrack: number
  overdue: number
}): string {
  const parts: string[] = []
  const goalsCount = data.goals.length
  const avgProgress = goalsCount > 0 ? data.progressSum / goalsCount : 0

  // Completion feedback
  if (data.completed > 0) {
    parts.push(`${data.completed} completed`)
  }

  // Progress feedback
  if (data.inProgress > 0) {
    parts.push(`${data.inProgress} in progress (${Math.round(avgProgress)}% avg)`)
  }

  // On-track feedback
  if (data.onTrack > 0) {
    parts.push(`${data.onTrack} on track`)
  }

  // Overdue warning
  if (data.overdue > 0) {
    parts.push(`⚠️ ${data.overdue} overdue`)
  }

  return parts.length > 0 ? parts.join(', ') : `${goalsCount} goals tracked`
}

/**
 * Save goal impacts as fulfillment scores
 */
export async function saveGoalImpactsAsScores(
  userId: string,
  tenantId: string,
  result: GoalScoreResult
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
          confidence: 0.80, // High confidence for goal-based scores
          source: 'goal_tracking',
          metadata: {
            goals_count: impact.goals_count,
            completed_count: impact.completed_count,
            in_progress_count: impact.in_progress_count,
            avg_progress: impact.avg_progress,
            on_track_count: impact.on_track_count,
            overdue_count: impact.overdue_count,
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
 * Get goal progress for a specific area
 */
export async function getGoalProgressForArea(
  userId: string,
  areaId: string
): Promise<{
  total: number
  completed: number
  inProgress: number
  avgProgress: number
}> {
  const { data: goals } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .contains('area_ids', [areaId])

  if (!goals || goals.length === 0) {
    return { total: 0, completed: 0, inProgress: 0, avgProgress: 0 }
  }

  const completed = goals.filter(g => g.status === 'done').length
  const inProgress = goals.filter(g => g.status === 'active').length
  const progressSum = goals.reduce((sum, g) => sum + g.progress_percent, 0)
  const avgProgress = progressSum / goals.length

  return {
    total: goals.length,
    completed,
    inProgress,
    avgProgress
  }
}
