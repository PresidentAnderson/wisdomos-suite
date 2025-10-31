/**
 * Score Calculation Engine
 *
 * Calculates fulfillment scores for life areas based on:
 * 1. Event momentum (recent events)
 * 2. Commitment integrity ratio
 * 3. Boundary violations
 * 4. Upset frequency
 * 5. Breakthrough count
 */

import { PrismaClient } from '@prisma/client'

export interface ScoreResult {
  score: number
  status: 'CRISIS' | 'STRUGGLING' | 'BALANCED' | 'THRIVING' | 'FLOURISHING'
  breakdown: {
    baseScore: number
    eventMomentum: number
    commitmentScore: number
    boundaryPenalty: number
    upsetPenalty: number
    breakthroughBonus: number
  }
}

/**
 * Calculate fulfillment score for a life area
 */
export async function calculateAreaScore(
  lifeAreaId: string,
  prisma: PrismaClient
): Promise<ScoreResult> {
  // Get events from last 90 days
  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

  const recentEvents = await prisma.event.findMany({
    where: {
      lifeAreaId,
      occurredAt: {
        gte: ninetyDaysAgo
      }
    },
    orderBy: { occurredAt: 'desc' }
  })

  // Get commitments for this area
  const commitments = await prisma.commitment.findMany({
    where: { lifeAreaId }
  })

  // Get boundaries for this area
  const boundaries = await prisma.boundary.findMany({
    where: { lifeAreaId }
  })

  // Calculate each component
  const baseScore = 50 // Starting point

  // 1. Event Momentum (+/- 20 points)
  const eventMomentum = calculateEventMomentum(recentEvents)

  // 2. Commitment Integrity (+/- 15 points)
  const commitmentScore = calculateCommitmentScore(commitments)

  // 3. Boundary Violations (-10 points each, max -30)
  const boundaryPenalty = calculateBoundaryPenalty(boundaries)

  // 4. Upset Frequency (-5 points each, max -20)
  const upsetPenalty = calculateUpsetPenalty(recentEvents)

  // 5. Breakthrough Bonus (+15 points each, max +30)
  const breakthroughBonus = calculateBreakthroughBonus(recentEvents)

  // Calculate final score
  const rawScore = baseScore +
    eventMomentum +
    commitmentScore -
    boundaryPenalty -
    upsetPenalty +
    breakthroughBonus

  // Clamp to 0-100
  const score = Math.max(0, Math.min(100, rawScore))

  // Determine status
  const status = getStatusFromScore(score)

  return {
    score: Math.round(score * 10) / 10,
    status,
    breakdown: {
      baseScore,
      eventMomentum,
      commitmentScore,
      boundaryPenalty,
      upsetPenalty,
      breakthroughBonus
    }
  }
}

/**
 * Calculate momentum from recent events
 * Positive events = positive momentum, negative events = negative momentum
 */
function calculateEventMomentum(events: any[]): number {
  if (events.length === 0) return 0

  // Weight by recency (more recent events have more weight)
  let totalWeight = 0
  let weightedSum = 0

  events.forEach((event, index) => {
    const recencyWeight = 1 - (index / events.length) * 0.5 // 1.0 for most recent, 0.5 for oldest
    const eventScore = event.emotionalCharge * 2 // -10 to +10 scale

    weightedSum += eventScore * recencyWeight
    totalWeight += recencyWeight
  })

  const momentum = weightedSum / totalWeight

  // Scale to +/- 20
  return Math.max(-20, Math.min(20, momentum))
}

/**
 * Calculate commitment integrity ratio
 * completed / total commitments
 */
function calculateCommitmentScore(commitments: any[]): number {
  if (commitments.length === 0) return 0

  const completed = commitments.filter(c => c.status === 'COMPLETED' || c.status === 'INTEGRATED').length
  const active = commitments.filter(c => c.status === 'ACTIVE').length
  const total = commitments.length

  // Ratio of completed to total
  const completionRatio = completed / total

  // Active commitments show engagement (small bonus)
  const activeBonus = Math.min(active * 2, 5)

  return (completionRatio * 10) + activeBonus
}

/**
 * Calculate boundary violation penalty
 */
function calculateBoundaryPenalty(boundaries: any[]): number {
  const violations = boundaries.reduce((sum, b) => sum + b.violationCount, 0)
  return Math.min(violations * 10, 30)
}

/**
 * Calculate upset frequency penalty
 */
function calculateUpsetPenalty(events: any[]): number {
  const upsets = events.filter(e => e.type === 'UPSET')
  return Math.min(upsets.length * 5, 20)
}

/**
 * Calculate breakthrough bonus
 */
function calculateBreakthroughBonus(events: any[]): number {
  const breakthroughs = events.filter(e => e.type === 'BREAKTHROUGH' || e.type === 'MILESTONE')
  return Math.min(breakthroughs.length * 15, 30)
}

/**
 * Determine status from score
 */
export function getStatusFromScore(score: number): 'CRISIS' | 'STRUGGLING' | 'BALANCED' | 'THRIVING' | 'FLOURISHING' {
  if (score < 20) return 'CRISIS'
  if (score < 40) return 'STRUGGLING'
  if (score < 70) return 'BALANCED'
  if (score < 90) return 'THRIVING'
  return 'FLOURISHING'
}

/**
 * Recalculate all life area scores for a tenant
 */
export async function recalculateAllScores(prisma: PrismaClient): Promise<void> {
  const lifeAreas = await prisma.lifeArea.findMany()

  for (const area of lifeAreas) {
    const result = await calculateAreaScore(area.id, prisma)

    await prisma.lifeArea.update({
      where: { id: area.id },
      data: {
        currentScore: result.score,
        status: result.status
      }
    })

    console.log(`[Scoring] Updated ${area.slug}: ${result.score} (${result.status})`)
  }
}
