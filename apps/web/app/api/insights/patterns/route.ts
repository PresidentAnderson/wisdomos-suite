import { NextResponse } from 'next/server'

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

  // Calculate trends (rising/falling)
  const energyTrend = patterns[patterns.length - 1].energy - patterns[0].energy
  const focusTrend = patterns[patterns.length - 1].focus - patterns[0].focus
  const fulfillmentTrend = patterns[patterns.length - 1].fulfillment - patterns[0].fulfillment

  return {
    patterns,
    insights,
    averages: {
      energy: Math.round(avgEnergy),
      focus: Math.round(avgFocus),
      fulfillment: Math.round(avgFulfillment)
    },
    trends: {
      energy: energyTrend > 0 ? 'rising' : 'falling',
      focus: focusTrend > 0 ? 'rising' : 'falling',
      fulfillment: fulfillmentTrend > 0 ? 'rising' : 'falling',
      energyChange: energyTrend,
      focusChange: focusTrend,
      fulfillmentChange: fulfillmentTrend
    },
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
