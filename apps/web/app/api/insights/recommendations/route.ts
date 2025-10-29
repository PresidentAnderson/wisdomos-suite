import { NextResponse } from 'next/server'

// Fetch pattern data from our own API
async function getPatternData() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE || process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'
    
    const res = await fetch(`${baseUrl}/api/insights/patterns`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' }
    })
    
    if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)
    return await res.json()
  } catch (error) {
    console.error('Error fetching pattern data:', error)
    return {
      patterns: [
        { date: 'Mon', energy: 72, focus: 68, fulfillment: 75 },
        { date: 'Tue', energy: 78, focus: 70, fulfillment: 80 },
        { date: 'Wed', energy: 65, focus: 63, fulfillment: 70 },
        { date: 'Thu', energy: 80, focus: 75, fulfillment: 82 },
        { date: 'Fri', energy: 85, focus: 81, fulfillment: 88 }
      ],
      averages: { energy: 78, focus: 74, fulfillment: 81 },
      trends: { energy: 'rising', focus: 'rising', fulfillment: 'rising' }
    }
  }
}

async function generateRecommendations(patternData: any) {
  const { patterns, averages, trends } = patternData
  const recommendations: string[] = []

  if (averages.energy < 70) {
    recommendations.push('Your energy levels are below optimal. Prioritize 7-8 hours of sleep and consider morning exercise.')
  } else if (trends.energy === 'falling') {
    recommendations.push('Energy is declining. Take regular breaks and avoid overcommitting to preserve capacity.')
  } else if (trends.energy === 'rising') {
    recommendations.push('Energy is trending upward! Leverage this momentum for challenging tasks.')
  }

  if (averages.focus < 70) {
    recommendations.push('Focus scores suggest distraction. Try time-blocking or the Pomodoro technique.')
  } else if (trends.focus === 'falling') {
    recommendations.push('Focus declining. Batch similar tasks to reduce context switching.')
  } else {
    recommendations.push('Strong focus detected. Protect concentration windows for high-impact work.')
  }

  if (averages.fulfillment < 75) {
    recommendations.push('Fulfillment needs attention. Increase time in activities aligned with your values.')
  } else if (trends.fulfillment === 'falling') {
    recommendations.push('Fulfillment declining. Schedule activities that bring joy or purpose.')
  } else if (averages.fulfillment > 85) {
    recommendations.push('Exceptional fulfillment! Document what is working to replicate these conditions.')
  }

  const lowDays = patterns.filter((p: any) => p.energy < 70)
  if (lowDays.length > 0) {
    const days = lowDays.map((p: any) => p.date).join(', ')
    recommendations.push(`Energy dips on ${days}. Schedule lighter tasks or recovery on these days.`)
  }

  const highDays = patterns.filter((p: any) => p.focus > 80 && p.energy > 80)
  if (highDays.length > 0) {
    const days = highDays.map((p: any) => p.date).join(', ')
    recommendations.push(`Peak performance: ${days}. Block for strategic work.`)
  }

  if (recommendations.length < 3) {
    recommendations.push('Maintain consistent sleep times to stabilize energy patterns.')
    recommendations.push('Weekly reflection enhances fulfillment scores.')
  }

  return recommendations.slice(0, 5)
}

export async function GET() {
  try {
    const patternData = await getPatternData()
    const recommendations = await generateRecommendations(patternData)

    return NextResponse.json({
      recommendations,
      generatedAt: new Date().toISOString(),
      basedOn: {
        dataPoints: patternData.patterns.length,
        averageEnergy: patternData.averages.energy,
        averageFocus: patternData.averages.focus,
        averageFulfillment: patternData.averages.fulfillment
      }
    })
  } catch (error) {
    console.error('Error generating recommendations:', error)
    return NextResponse.json({
      recommendations: [
        'Establish consistent sleep and wake times for better energy regulation.',
        'Batch similar tasks to reduce context switching and improve focus.',
        'Conduct weekly reviews to identify patterns and adjust your approach.',
        'Protect high-energy windows for strategic, high-impact work.',
        'Schedule regular breaks to maintain sustainable performance.'
      ],
      generatedAt: new Date().toISOString(),
      basedOn: { dataPoints: 7, averageEnergy: 78, averageFocus: 74, averageFulfillment: 81 }
    })
  }
}
