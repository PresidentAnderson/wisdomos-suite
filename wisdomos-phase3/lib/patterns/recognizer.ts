/**
 * Pattern Recognition Engine
 *
 * Analyzes events to detect recurring patterns and generate insights:
 * 1. Semantic clustering (group similar events)
 * 2. Frequency detection (recurring themes)
 * 3. Emotional patterns (mood cycles)
 * 4. Temporal patterns (time-based trends)
 * 5. Cross-area correlations
 */

import { PrismaClient } from '@prisma/client'
import { nanoid } from 'nanoid'

export interface PatternResult {
  type: 'RECURRING_THEME' | 'EMOTIONAL_CYCLE' | 'CORRELATION' | 'TREND'
  confidence: number // 0-1
  title: string
  description: string
  affectedAreas: string[]
  evidenceEventIds: string[]
  metadata: Record<string, any>
}

export interface InsightGenerationResult {
  insights: PatternResult[]
  totalPatternsDetected: number
  analysisWindow: {
    startDate: Date
    endDate: Date
    totalEvents: number
  }
}

/**
 * Main pattern recognition function
 * Analyzes last 90 days of events and generates insights
 */
export async function detectPatterns(
  prisma: PrismaClient,
  windowDays: number = 90
): Promise<InsightGenerationResult> {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - windowDays)
  const endDate = new Date()

  // Fetch events from analysis window
  const events = await prisma.event.findMany({
    where: {
      occurredAt: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      lifeArea: true
    },
    orderBy: { occurredAt: 'asc' }
  })

  if (events.length < 3) {
    return {
      insights: [],
      totalPatternsDetected: 0,
      analysisWindow: { startDate, endDate, totalEvents: events.length }
    }
  }

  const patterns: PatternResult[] = []

  // 1. Detect recurring themes (by tags and description similarity)
  const recurringThemes = detectRecurringThemes(events)
  patterns.push(...recurringThemes)

  // 2. Detect emotional cycles (mood swings)
  const emotionalCycles = detectEmotionalCycles(events)
  patterns.push(...emotionalCycles)

  // 3. Detect cross-area correlations
  const correlations = detectCrossAreaCorrelations(events)
  patterns.push(...correlations)

  // 4. Detect trends (improving/declining areas)
  const trends = detectTrends(events)
  patterns.push(...trends)

  return {
    insights: patterns,
    totalPatternsDetected: patterns.length,
    analysisWindow: { startDate, endDate, totalEvents: events.length }
  }
}

/**
 * Detect recurring themes by analyzing tags and keywords
 */
function detectRecurringThemes(events: any[]): PatternResult[] {
  const patterns: PatternResult[] = []

  // Group events by tags
  const tagGroups = new Map<string, any[]>()

  events.forEach(event => {
    if (event.tags && Array.isArray(event.tags)) {
      event.tags.forEach((tag: string) => {
        if (!tagGroups.has(tag)) {
          tagGroups.set(tag, [])
        }
        tagGroups.get(tag)!.push(event)
      })
    }
  })

  // Find tags that appear frequently (>= 3 times)
  tagGroups.forEach((tagEvents, tag) => {
    if (tagEvents.length >= 3) {
      // Calculate confidence based on frequency and recency
      const confidence = Math.min(1.0, tagEvents.length / 10)

      // Get affected life areas
      const affectedAreas = [...new Set(tagEvents.map(e => e.lifeAreaId))]

      patterns.push({
        type: 'RECURRING_THEME',
        confidence,
        title: `Recurring pattern: "${tag}"`,
        description: `This theme appeared ${tagEvents.length} times across ${affectedAreas.length} life area(s) in the last 90 days.`,
        affectedAreas,
        evidenceEventIds: tagEvents.map(e => e.id),
        metadata: {
          tag,
          frequency: tagEvents.length,
          firstOccurrence: tagEvents[0].occurredAt,
          lastOccurrence: tagEvents[tagEvents.length - 1].occurredAt
        }
      })
    }
  })

  // Group events by description similarity (basic keyword matching)
  const keywords = extractKeywords(events)
  keywords.forEach(keyword => {
    const matchingEvents = events.filter(e =>
      e.description.toLowerCase().includes(keyword.toLowerCase()) ||
      e.title.toLowerCase().includes(keyword.toLowerCase())
    )

    if (matchingEvents.length >= 3) {
      const affectedAreas = [...new Set(matchingEvents.map(e => e.lifeAreaId))]
      const confidence = Math.min(1.0, matchingEvents.length / 8)

      patterns.push({
        type: 'RECURRING_THEME',
        confidence,
        title: `Recurring topic: "${keyword}"`,
        description: `Events related to "${keyword}" occurred ${matchingEvents.length} times.`,
        affectedAreas,
        evidenceEventIds: matchingEvents.map(e => e.id),
        metadata: {
          keyword,
          frequency: matchingEvents.length
        }
      })
    }
  })

  return patterns
}

/**
 * Detect emotional cycles (alternating positive/negative periods)
 */
function detectEmotionalCycles(events: any[]): PatternResult[] {
  const patterns: PatternResult[] = []

  if (events.length < 5) return patterns

  // Sort by occurrence date
  const sortedEvents = [...events].sort((a, b) =>
    a.occurredAt.getTime() - b.occurredAt.getTime()
  )

  // Detect mood swings (alternating emotional charge)
  let swingCount = 0
  let previousCharge = sortedEvents[0].emotionalCharge

  for (let i = 1; i < sortedEvents.length; i++) {
    const currentCharge = sortedEvents[i].emotionalCharge

    // Swing detected if sign changed significantly
    if ((previousCharge > 2 && currentCharge < -2) ||
        (previousCharge < -2 && currentCharge > 2)) {
      swingCount++
    }

    previousCharge = currentCharge
  }

  // If significant swings detected (>= 3), create pattern
  if (swingCount >= 3) {
    const confidence = Math.min(1.0, swingCount / 5)
    const affectedAreas = [...new Set(sortedEvents.map(e => e.lifeAreaId))]

    patterns.push({
      type: 'EMOTIONAL_CYCLE',
      confidence,
      title: 'Emotional fluctuation detected',
      description: `You experienced ${swingCount} significant mood swings in the last 90 days. Consider exploring what triggers these emotional shifts.`,
      affectedAreas,
      evidenceEventIds: sortedEvents.map(e => e.id),
      metadata: {
        swingCount,
        averageCharge: sortedEvents.reduce((sum, e) => sum + e.emotionalCharge, 0) / sortedEvents.length
      }
    })
  }

  // Detect prolonged negative/positive periods
  const negativeEvents = events.filter(e => e.emotionalCharge < -2)
  const positiveEvents = events.filter(e => e.emotionalCharge > 2)

  if (negativeEvents.length >= 5) {
    const affectedAreas = [...new Set(negativeEvents.map(e => e.lifeAreaId))]
    patterns.push({
      type: 'EMOTIONAL_CYCLE',
      confidence: 0.8,
      title: 'Prolonged challenging period',
      description: `${negativeEvents.length} challenging events recorded. This may indicate areas needing support or boundaries that need reinforcement.`,
      affectedAreas,
      evidenceEventIds: negativeEvents.map(e => e.id),
      metadata: {
        negativeEventCount: negativeEvents.length,
        tone: 'NEGATIVE'
      }
    })
  }

  if (positiveEvents.length >= 5) {
    const affectedAreas = [...new Set(positiveEvents.map(e => e.lifeAreaId))]
    patterns.push({
      type: 'EMOTIONAL_CYCLE',
      confidence: 0.8,
      title: 'Period of growth and breakthrough',
      description: `${positiveEvents.length} positive events recorded. You're experiencing momentum - consider what's working and how to sustain it.`,
      affectedAreas,
      evidenceEventIds: positiveEvents.map(e => e.id),
      metadata: {
        positiveEventCount: positiveEvents.length,
        tone: 'POSITIVE'
      }
    })
  }

  return patterns
}

/**
 * Detect cross-area correlations
 * (e.g., events in area A often followed by events in area B)
 */
function detectCrossAreaCorrelations(events: any[]): PatternResult[] {
  const patterns: PatternResult[] = []

  if (events.length < 6) return patterns

  // Sort by date
  const sortedEvents = [...events].sort((a, b) =>
    a.occurredAt.getTime() - b.occurredAt.getTime()
  )

  // Build correlation matrix (area A -> area B within 7 days)
  const correlations = new Map<string, { areaB: string; count: number; events: any[] }>()

  for (let i = 0; i < sortedEvents.length - 1; i++) {
    const eventA = sortedEvents[i]
    const eventB = sortedEvents[i + 1]

    // Check if events are within 7 days
    const daysDiff = (eventB.occurredAt.getTime() - eventA.occurredAt.getTime()) / (1000 * 60 * 60 * 24)

    if (daysDiff <= 7 && eventA.lifeAreaId !== eventB.lifeAreaId) {
      const key = `${eventA.lifeAreaId}->${eventB.lifeAreaId}`

      if (!correlations.has(key)) {
        correlations.set(key, { areaB: eventB.lifeAreaId, count: 0, events: [] })
      }

      const corr = correlations.get(key)!
      corr.count++
      corr.events.push(eventA, eventB)
    }
  }

  // Find significant correlations (>= 3 occurrences)
  correlations.forEach((data, key) => {
    if (data.count >= 3) {
      const [areaA, areaB] = key.split('->')
      const confidence = Math.min(1.0, data.count / 5)

      patterns.push({
        type: 'CORRELATION',
        confidence,
        title: 'Cross-area connection detected',
        description: `Events in one life area often precede events in another (${data.count} instances). These areas may be interconnected.`,
        affectedAreas: [areaA, areaB],
        evidenceEventIds: [...new Set(data.events.map(e => e.id))],
        metadata: {
          correlation: key,
          frequency: data.count
        }
      })
    }
  })

  return patterns
}

/**
 * Detect trends (improving or declining areas)
 */
function detectTrends(events: any[]): PatternResult[] {
  const patterns: PatternResult[] = []

  // Group events by life area
  const areaGroups = new Map<string, any[]>()
  events.forEach(event => {
    if (!areaGroups.has(event.lifeAreaId)) {
      areaGroups.set(event.lifeAreaId, [])
    }
    areaGroups.get(event.lifeAreaId)!.push(event)
  })

  // Analyze each area for trends
  areaGroups.forEach((areaEvents, lifeAreaId) => {
    if (areaEvents.length < 4) return

    // Sort by date
    const sorted = [...areaEvents].sort((a, b) =>
      a.occurredAt.getTime() - b.occurredAt.getTime()
    )

    // Split into first half and second half
    const midpoint = Math.floor(sorted.length / 2)
    const firstHalf = sorted.slice(0, midpoint)
    const secondHalf = sorted.slice(midpoint)

    const avgChargeFirst = firstHalf.reduce((sum, e) => sum + e.emotionalCharge, 0) / firstHalf.length
    const avgChargeSecond = secondHalf.reduce((sum, e) => sum + e.emotionalCharge, 0) / secondHalf.length

    const difference = avgChargeSecond - avgChargeFirst

    // Significant trend if difference > 2 points
    if (Math.abs(difference) > 2) {
      const isImproving = difference > 0
      const confidence = Math.min(1.0, Math.abs(difference) / 5)

      patterns.push({
        type: 'TREND',
        confidence,
        title: isImproving ? 'Upward trend detected' : 'Downward trend detected',
        description: isImproving
          ? `This life area shows improvement over time. Recent events are more positive than earlier ones.`
          : `This life area shows decline over time. Recent events are more challenging than earlier ones. Consider reviewing boundaries and commitments.`,
        affectedAreas: [lifeAreaId],
        evidenceEventIds: sorted.map(e => e.id),
        metadata: {
          trendDirection: isImproving ? 'IMPROVING' : 'DECLINING',
          avgChargeFirst,
          avgChargeSecond,
          difference
        }
      })
    }
  })

  return patterns
}

/**
 * Extract common keywords from event descriptions
 */
function extractKeywords(events: any[]): string[] {
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
    'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had', 'do',
    'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
    'i', 'me', 'my', 'we', 'our', 'you', 'your', 'it', 'its', 'this', 'that'
  ])

  const wordCounts = new Map<string, number>()

  events.forEach(event => {
    const text = `${event.title} ${event.description}`.toLowerCase()
    const words = text.match(/\b[a-z]{4,}\b/g) || [] // Extract words 4+ chars

    words.forEach(word => {
      if (!stopWords.has(word)) {
        wordCounts.set(word, (wordCounts.get(word) || 0) + 1)
      }
    })
  })

  // Return words that appear >= 3 times
  return Array.from(wordCounts.entries())
    .filter(([_, count]) => count >= 3)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10) // Top 10 keywords
    .map(([word]) => word)
}

/**
 * Save detected patterns as Insights in the database
 */
export async function saveInsights(
  prisma: PrismaClient,
  patterns: PatternResult[]
): Promise<void> {
  for (const pattern of patterns) {
    await prisma.insight.create({
      data: {
        id: nanoid(),
        type: 'PATTERN_RECOGNIZED',
        category: mapPatternTypeToCategory(pattern.type),
        title: pattern.title,
        description: pattern.description,
        confidence: pattern.confidence,
        metadata: pattern.metadata,
        sourceEventIds: pattern.evidenceEventIds,
        status: 'ACTIVE'
      }
    })
  }
}

/**
 * Map pattern type to insight category
 */
function mapPatternTypeToCategory(type: PatternResult['type']): string {
  switch (type) {
    case 'RECURRING_THEME':
      return 'BEHAVIORAL'
    case 'EMOTIONAL_CYCLE':
      return 'EMOTIONAL'
    case 'CORRELATION':
      return 'RELATIONAL'
    case 'TREND':
      return 'SYSTEMIC'
    default:
      return 'OTHER'
  }
}
