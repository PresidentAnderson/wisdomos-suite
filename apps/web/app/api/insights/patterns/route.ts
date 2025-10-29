import { NextResponse } from 'next/server'

// Types for trend analysis
type TrendDirection = 'rising' | 'falling' | 'flat'
type TrendStrength = 'weak' | 'moderate' | 'strong'

interface TrendAnalysis {
  direction: TrendDirection
  consecutiveDays: number
  strength: TrendStrength
  isSignificant: boolean
}

/**
 * Detects consecutive rising or falling trends in a metric over time
 * @param values - Array of metric values (e.g., energy scores for each day)
 * @returns TrendAnalysis object with direction, consecutive days, and strength
 */
function detectConsecutiveTrend(values: number[]): TrendAnalysis {
  if (values.length < 2) {
    return {
      direction: 'flat',
      consecutiveDays: 0,
      strength: 'weak',
      isSignificant: false
    }
  }

  // Track the longest consecutive trend ending at the most recent day
  let currentConsecutiveDays = 0
  let currentDirection: TrendDirection = 'flat'

  // Start from the end (most recent) and work backwards
  for (let i = values.length - 1; i > 0; i--) {
    const currentValue = values[i]
    const previousValue = values[i - 1]
    const difference = currentValue - previousValue

    // Determine direction (with small threshold to handle noise)
    let dayDirection: TrendDirection
    if (Math.abs(difference) < 0.5) {
      dayDirection = 'flat'
    } else if (difference > 0) {
      dayDirection = 'rising'
    } else {
      dayDirection = 'falling'
    }

    // Initialize on first comparison
    if (i === values.length - 1) {
      currentDirection = dayDirection
      currentConsecutiveDays = dayDirection === 'flat' ? 0 : 1
      continue
    }

    // Check if trend continues
    if (dayDirection === currentDirection && dayDirection !== 'flat') {
      currentConsecutiveDays++
    } else {
      // Trend broke, stop counting
      break
    }
  }

  // Calculate trend strength based on consecutive days
  let strength: TrendStrength
  if (currentConsecutiveDays <= 2) {
    strength = 'weak'
  } else if (currentConsecutiveDays <= 4) {
    strength = 'moderate'
  } else {
    strength = 'strong'
  }

  // Flag as significant if 3+ consecutive days
  const isSignificant = currentConsecutiveDays >= 3

  return {
    direction: currentDirection,
    consecutiveDays: currentConsecutiveDays,
    strength,
    isSignificant
  }
}

// Mock data - In production, this would query your database
// based on user authentication and real behavioral metrics
function generatePatternData() {
  const patterns = [
    { date: 'Mon', energy: 72, focus: 68, fulfillment: 75 },
    { date: 'Tue', energy: 78, focus: 70, fulfillment: 80 },
    { date: 'Wed', energy: 65, focus: 63, fulfillment: 70 },
    { date: 'Thu', energy: 80, focus: 75, fulfillment: 82 },
    { date: 'Fri', energy: 85, focus: 81, fulfillment: 88 },
    { date: 'Sat', energy: 90, focus: 88, fulfillment: 92 },
    { date: 'Sun', energy: 76, focus: 70, fulfillment: 78 }
  ]

  const insights = [
    {
      title: 'Peak Performance Window',
      description: 'Your focus peaks between Thursday and Saturday. Schedule high-impact work during these days.',
      icon: 'trending-up'
    },
    {
      title: 'Mid-Week Dip',
      description: 'Energy consistently drops on Wednesdays. Consider lighter tasks or self-care activities.',
      icon: 'activity'
    },
    {
      title: 'Weekend Recovery',
      description: 'Fulfillment scores rise sharply on weekends, indicating effective rest and restoration.',
      icon: 'brain'
    }
  ]

  const avgEnergy = patterns.reduce((sum, d) => sum + d.energy, 0) / patterns.length
  const avgFocus = patterns.reduce((sum, d) => sum + d.focus, 0) / patterns.length
  const avgFulfillment = patterns.reduce((sum, d) => sum + d.fulfillment, 0) / patterns.length

  // Extract metric values for trend analysis
  const energyValues = patterns.map(p => p.energy)
  const focusValues = patterns.map(p => p.focus)
  const fulfillmentValues = patterns.map(p => p.fulfillment)

  // Analyze consecutive trends for each metric
  const energyTrendAnalysis = detectConsecutiveTrend(energyValues)
  const focusTrendAnalysis = detectConsecutiveTrend(focusValues)
  const fulfillmentTrendAnalysis = detectConsecutiveTrend(fulfillmentValues)

  // Calculate overall change (first to last day)
  const energyChange = patterns[patterns.length - 1].energy - patterns[0].energy
  const focusChange = patterns[patterns.length - 1].focus - patterns[0].focus
  const fulfillmentChange = patterns[patterns.length - 1].fulfillment - patterns[0].fulfillment

  // Identify significant trends for recommendations engine
  const significantTrends = []
  if (energyTrendAnalysis.isSignificant) {
    significantTrends.push({
      metric: 'energy',
      direction: energyTrendAnalysis.direction,
      consecutiveDays: energyTrendAnalysis.consecutiveDays,
      strength: energyTrendAnalysis.strength
    })
  }
  if (focusTrendAnalysis.isSignificant) {
    significantTrends.push({
      metric: 'focus',
      direction: focusTrendAnalysis.direction,
      consecutiveDays: focusTrendAnalysis.consecutiveDays,
      strength: focusTrendAnalysis.strength
    })
  }
  if (fulfillmentTrendAnalysis.isSignificant) {
    significantTrends.push({
      metric: 'fulfillment',
      direction: fulfillmentTrendAnalysis.direction,
      consecutiveDays: fulfillmentTrendAnalysis.consecutiveDays,
      strength: fulfillmentTrendAnalysis.strength
    })
  }

  return {
    patterns,
    insights,
    averages: {
      energy: Math.round(avgEnergy),
      focus: Math.round(avgFocus),
      fulfillment: Math.round(avgFulfillment)
    },
    trends: {
      energy: {
        direction: energyTrendAnalysis.direction,
        change: energyChange,
        consecutiveDays: energyTrendAnalysis.consecutiveDays,
        trendStrength: energyTrendAnalysis.strength,
        isSignificant: energyTrendAnalysis.isSignificant
      },
      focus: {
        direction: focusTrendAnalysis.direction,
        change: focusChange,
        consecutiveDays: focusTrendAnalysis.consecutiveDays,
        trendStrength: focusTrendAnalysis.strength,
        isSignificant: focusTrendAnalysis.isSignificant
      },
      fulfillment: {
        direction: fulfillmentTrendAnalysis.direction,
        change: fulfillmentChange,
        consecutiveDays: fulfillmentTrendAnalysis.consecutiveDays,
        trendStrength: fulfillmentTrendAnalysis.strength,
        isSignificant: fulfillmentTrendAnalysis.isSignificant
      }
    },
    significantTrends,
    aiInsight: 'Your patterns indicate stronger alignment when structured routines precede creative work. Try scheduling your highest-impact activities between 9–11am on high-energy days (Thu-Sat).'
  }
}

export async function GET() {
  try {
    // TODO: Add user authentication and fetch real user data
    // const session = await getServerSession()
    // const userId = session?.user?.id
    // const data = await db.patterns.findMany({ where: { userId } })

    const data = generatePatternData()
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching patterns:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pattern data' },
      { status: 500 }
    )
  }
}
