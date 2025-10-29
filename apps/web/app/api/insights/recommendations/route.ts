import { NextResponse } from 'next/server'
import OpenAI from 'openai'

// Initialize OpenAI client
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

interface Recommendation {
  recommendation: string
  reasoning: string
  dataPoint: string
}

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

// Generate recommendations using OpenAI GPT-4
async function generateWithOpenAI(patternData: any): Promise<Recommendation[]> {
  if (!openai) {
    throw new Error('OpenAI client not initialized')
  }

  const { patterns, averages, trends } = patternData

  // Identify peak and low days
  const lowEnergyDays = patterns
    .filter((p: any) => p.energy < 70)
    .map((p: any) => p.date)

  const highPerformanceDays = patterns
    .filter((p: any) => p.energy > 80 && p.focus > 80)
    .map((p: any) => p.date)

  const prompt = `You are a personal productivity coach providing actionable insights. Based on the user's energy, focus, and fulfillment patterns, generate exactly 5 recommendations with explanations.

PATTERN DATA:
- Averages: Energy ${averages.energy}/100, Focus ${averages.focus}/100, Fulfillment ${averages.fulfillment}/100
- Trends: Energy is ${trends.energy}, Focus is ${trends.focus}, Fulfillment is ${trends.fulfillment}
${lowEnergyDays.length > 0 ? `- Low energy days: ${lowEnergyDays.join(', ')}` : ''}
${highPerformanceDays.length > 0 ? `- Peak performance days: ${highPerformanceDays.join(', ')}` : ''}
- Daily patterns: ${patterns.map((p: any) => `${p.date}: E${p.energy} F${p.focus} Fu${p.fulfillment}`).join(', ')}

REQUIREMENTS:
- Provide exactly 5 recommendations
- For each recommendation, provide:
  1. The recommendation (under 25 words, actionable advice)
  2. The reasoning (2-3 sentences explaining WHY this matters based on behavioral science or productivity principles)
  3. The specific data point that triggered this recommendation

Format each recommendation as JSON with keys: recommendation, reasoning, dataPoint
Return a JSON array of 5 recommendation objects.`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are a productivity coach. Return recommendations as a JSON array with recommendation, reasoning, and dataPoint fields.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 2000,
    response_format: { type: 'json_object' }
  })

  const content = completion.choices[0]?.message?.content || ''
  const parsed = JSON.parse(content)
  const recommendations: Recommendation[] = parsed.recommendations || []

  if (recommendations.length < 5) {
    throw new Error('OpenAI returned fewer than 5 recommendations')
  }

  return recommendations.slice(0, 5)
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
    let recommendations: string[]
    let usingOpenAI = false

    // Try OpenAI first
    if (openai) {
      try {
        recommendations = await generateWithOpenAI(patternData)
        usingOpenAI = true
        console.log('Successfully generated recommendations using OpenAI')
      } catch (openaiError) {
        console.warn('OpenAI generation failed, falling back to rule-based:', openaiError)
        recommendations = await generateRecommendations(patternData)
      }
    } else {
      console.log('OpenAI not configured, using rule-based recommendations')
      recommendations = await generateRecommendations(patternData)
    }

    return NextResponse.json({
      recommendations,
      generatedAt: new Date().toISOString(),
      usingAI: usingOpenAI,
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
      usingAI: false,
      basedOn: { dataPoints: 7, averageEnergy: 78, averageFocus: 74, averageFulfillment: 81 }
    })
  }
}
