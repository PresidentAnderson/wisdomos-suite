import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getTenantPrismaClient, withTenant } from '@/lib/tenant/prisma-tenant-client'
import { getUserFromRequest } from '@/lib/auth'

// Cache duration: 1 hour
const CACHE_DURATION_MS = 60 * 60 * 1000

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
- Each recommendation must be under 25 words and actionable
- Be direct, encouraging, and concise
- Focus on advice based on the trends (rising/falling patterns)
- Reference specific days when relevant (peak/low days)
- For each recommendation, provide:
  1. recommendation: The actionable advice (under 25 words)
  2. reasoning: 2-3 sentences explaining WHY this matters based on behavioral science or productivity principles
  3. dataPoint: The specific data that triggered this recommendation

Format each as JSON with keys: recommendation, reasoning, dataPoint
Return a JSON object with a "recommendations" key containing an array of 5 recommendation objects.`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are a concise productivity coach. Provide direct, actionable recommendations under 25 words each with reasoning and data points. Return as JSON.'
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

async function generateRecommendations(patternData: any): Promise<Recommendation[]> {
  const { patterns, averages, trends } = patternData
  const recommendations: Recommendation[] = []

  // Energy-based recommendations
  if (averages.energy < 70) {
    recommendations.push({
      recommendation: 'Your energy levels are below optimal. Prioritize 7-8 hours of sleep and consider morning exercise.',
      reasoning: 'Consistent sleep and morning exercise boost energy production by regulating circadian rhythms and increasing mitochondrial efficiency. Low energy compounds over time, reducing cognitive performance and emotional resilience.',
      dataPoint: `Average energy: ${averages.energy} (below 70 threshold)`
    })
  } else if (trends.energy === 'falling') {
    // Calculate energy drop details
    const energyValues = patterns.map((p: any) => ({ date: p.date, value: p.energy }))
    const maxEnergy = Math.max(...energyValues.map((e: any) => e.value))
    const minEnergy = Math.min(...energyValues.map((e: any) => e.value))
    const maxDay = energyValues.find((e: any) => e.value === maxEnergy)?.date
    const minDay = energyValues.find((e: any) => e.value === minEnergy)?.date
    const drop = maxEnergy - minEnergy

    recommendations.push({
      recommendation: 'Energy is declining. Take regular breaks and avoid overcommitting.',
      reasoning: 'Taking breaks prevents burnout and helps maintain sustainable performance when energy levels are falling. Declining energy indicates accumulated fatigue that requires active recovery, not just more work.',
      dataPoint: `Energy decreased by ${drop} points from ${maxDay} (${maxEnergy}) to ${minDay} (${minEnergy})`
    })
  } else if (trends.energy === 'rising') {
    const energyValues = patterns.map((p: any) => ({ date: p.date, value: p.energy }))
    const firstEnergy = energyValues[0].value
    const lastEnergy = energyValues[energyValues.length - 1].value
    const gain = lastEnergy - firstEnergy

    recommendations.push({
      recommendation: 'Energy is trending upward! Leverage this momentum for challenging tasks.',
      reasoning: 'Rising energy creates a window of opportunity for high-impact work. Tackle strategic projects now while your capacity is expanding, as this momentum may not last indefinitely.',
      dataPoint: `Energy increased by ${gain} points from ${energyValues[0].date} (${firstEnergy}) to ${energyValues[energyValues.length - 1].date} (${lastEnergy})`
    })
  }

  // Focus-based recommendations
  if (averages.focus < 70) {
    recommendations.push({
      recommendation: 'Focus scores suggest distraction. Try time-blocking or the Pomodoro technique.',
      reasoning: 'Time-blocking and Pomodoro reduce decision fatigue and create structured focus sessions. Low focus often results from task-switching overhead, which these techniques eliminate by enforcing single-tasking.',
      dataPoint: `Average focus: ${averages.focus} (below 70 threshold)`
    })
  } else if (trends.focus === 'falling') {
    const focusValues = patterns.map((p: any) => ({ date: p.date, value: p.focus }))
    const maxFocus = Math.max(...focusValues.map((f: any) => f.value))
    const minFocus = Math.min(...focusValues.map((f: any) => f.value))
    const maxDay = focusValues.find((f: any) => f.value === maxFocus)?.date
    const minDay = focusValues.find((f: any) => f.value === minFocus)?.date

    recommendations.push({
      recommendation: 'Focus declining. Batch similar tasks to reduce context switching.',
      reasoning: 'Context switching depletes focus by forcing your brain to rebuild mental models repeatedly. Batching similar tasks maintains cognitive continuity and preserves attentional resources.',
      dataPoint: `Focus dropped from ${maxDay} (${maxFocus}) to ${minDay} (${minFocus})`
    })
  } else {
    const focusValues = patterns.filter((p: any) => p.focus > 75)
    if (focusValues.length > 0) {
      const days = focusValues.map((p: any) => p.date).join(', ')
      recommendations.push({
        recommendation: 'Strong focus detected. Protect concentration windows for high-impact work.',
        reasoning: 'High focus is a limited resource that should be allocated to tasks requiring deep thinking. Protecting these windows from meetings and interruptions maximizes the value of your most productive hours.',
        dataPoint: `High focus days: ${days} (all above 75)`
      })
    }
  }

  // Fulfillment-based recommendations
  if (averages.fulfillment < 75) {
    recommendations.push({
      recommendation: 'Fulfillment needs attention. Increase time in activities aligned with your values.',
      reasoning: 'Fulfillment drives long-term motivation and prevents burnout. Low fulfillment indicates a misalignment between your actions and core values, which eventually leads to disengagement.',
      dataPoint: `Average fulfillment: ${averages.fulfillment} (below 75 threshold)`
    })
  } else if (trends.fulfillment === 'falling') {
    const fulfillmentValues = patterns.map((p: any) => ({ date: p.date, value: p.fulfillment }))
    const startValue = fulfillmentValues[0].value
    const endValue = fulfillmentValues[fulfillmentValues.length - 1].value
    const decline = startValue - endValue

    recommendations.push({
      recommendation: 'Fulfillment declining. Schedule activities that bring joy or purpose.',
      reasoning: 'Declining fulfillment signals growing disconnection from meaningful work. Proactively scheduling purposeful activities prevents this trend from becoming chronic dissatisfaction.',
      dataPoint: `Fulfillment decreased by ${decline} points from ${fulfillmentValues[0].date} (${startValue}) to ${fulfillmentValues[fulfillmentValues.length - 1].date} (${endValue})`
    })
  } else if (averages.fulfillment > 85) {
    recommendations.push({
      recommendation: 'Exceptional fulfillment! Document what is working to replicate these conditions.',
      reasoning: 'High fulfillment conditions are worth studying and replicating. Documenting the factors contributing to this state helps you intentionally recreate these circumstances in the future.',
      dataPoint: `Average fulfillment: ${averages.fulfillment} (above 85 excellence threshold)`
    })
  }

  // Pattern-based recommendations
  const lowDays = patterns.filter((p: any) => p.energy < 70)
  if (lowDays.length > 0) {
    const days = lowDays.map((p: any) => p.date).join(', ')
    const energyValues = lowDays.map((p: any) => `${p.date} (${p.energy})`).join(', ')
    recommendations.push({
      recommendation: `Energy dips on ${days}. Schedule lighter tasks or recovery on these days.`,
      reasoning: 'Recurring low-energy days suggest biological or schedule patterns. Aligning task difficulty with natural energy rhythms reduces resistance and improves overall productivity.',
      dataPoint: `Low energy days detected: ${energyValues}`
    })
  }

  const highDays = patterns.filter((p: any) => p.focus > 80 && p.energy > 80)
  if (highDays.length > 0) {
    const days = highDays.map((p: any) => p.date).join(', ')
    const values = highDays.map((p: any) => `${p.date} (E:${p.energy}, F:${p.focus})`).join(', ')
    recommendations.push({
      recommendation: `Peak performance detected on ${days}. Block for strategic work.`,
      reasoning: 'Peak performance windows are rare and valuable. Protecting these times for strategic thinking, complex problem-solving, or creative work yields disproportionate returns.',
      dataPoint: `Peak days: ${values}`
    })
  }

  // Default recommendations if few were generated
  if (recommendations.length < 3) {
    recommendations.push({
      recommendation: 'Maintain consistent sleep times to stabilize energy patterns.',
      reasoning: 'Sleep consistency regulates cortisol and melatonin rhythms, stabilizing energy throughout the day. Irregular sleep creates hormonal chaos that makes energy unpredictable.',
      dataPoint: 'General wellness recommendation'
    })
    recommendations.push({
      recommendation: 'Weekly reflection enhances fulfillment scores.',
      reasoning: 'Reflection creates awareness of progress and meaning, which directly increases fulfillment. Without reflection, achievements go unnoticed and purpose becomes unclear.',
      dataPoint: 'General wellness recommendation'
    })
  }

  return recommendations.slice(0, 5)
}

// Check for cached recommendations (within last hour)
async function getCachedRecommendations(userId: string, tenantId: string) {
  const prisma = getTenantPrismaClient()
  const oneHourAgo = new Date(Date.now() - CACHE_DURATION_MS)

  const cached = await withTenant(tenantId, async () => {
    return await prisma.userRecommendation.findMany({
      where: {
        userId,
        generatedAt: {
          gte: oneHourAgo
        }
      },
      orderBy: {
        generatedAt: 'desc'
      },
      take: 5
    })
  })

  return cached
}

// Save recommendations to database
async function saveRecommendations(
  userId: string,
  tenantId: string,
  recommendations: Recommendation[]
) {
  const prisma = getTenantPrismaClient()

  await withTenant(tenantId, async () => {
    // Create new recommendations
    await prisma.userRecommendation.createMany({
      data: recommendations.map(rec => ({
        tenantId,
        userId,
        recommendation: rec.recommendation,
        reasoning: rec.reasoning,
        dataPoint: rec.dataPoint ? JSON.stringify({ dataPoint: rec.dataPoint }) : null,
        viewed: false
      }))
    })
  })
}

export async function GET(request: Request) {
  try {
    // TODO: Wire up authentication with NextAuth or your auth system
    const authResult = await getUserFromRequest(request as any)

    let userId: string | null = null
    let tenantId: string | null = null

    // Check if user is authenticated
    if (!('error' in authResult)) {
      userId = authResult.user.id
      tenantId = authResult.user.tenantId

      // Check for cached recommendations
      const cached = await getCachedRecommendations(userId, tenantId)

      if (cached.length > 0) {
        console.log('Returning cached recommendations from database')
        return NextResponse.json({
          recommendations: cached.map(c => ({
            recommendation: c.recommendation,
            reasoning: c.reasoning || 'No reasoning provided',
            dataPoint: c.dataPoint ? JSON.parse(c.dataPoint as string).dataPoint : 'Cached recommendation'
          })),
          generatedAt: cached[0].generatedAt.toISOString(),
          usingAI: false,
          cached: true,
          basedOn: { dataPoints: 7, averageEnergy: 78, averageFocus: 74, averageFulfillment: 81 }
        })
      }
    }

    // Generate fresh recommendations
    const patternData = await getPatternData()
    let recommendations: Recommendation[]
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

    // Save to database if authenticated
    if (userId && tenantId) {
      try {
        await saveRecommendations(userId, tenantId, recommendations)
        console.log('Saved recommendations to database')
      } catch (dbError) {
        console.error('Failed to save recommendations to database:', dbError)
        // Continue anyway - don't fail the request
      }
    }

    return NextResponse.json({
      recommendations,
      generatedAt: new Date().toISOString(),
      usingAI: usingOpenAI,
      cached: false,
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
        {
          recommendation: 'Establish consistent sleep and wake times for better energy regulation.',
          reasoning: 'Sleep consistency regulates cortisol and melatonin rhythms, stabilizing energy throughout the day. This creates predictable energy patterns that make planning easier.',
          dataPoint: 'Fallback recommendation'
        },
        {
          recommendation: 'Batch similar tasks to reduce context switching and improve focus.',
          reasoning: 'Task batching eliminates the cognitive overhead of context switching. Each switch costs 15-25 minutes of focus recovery time.',
          dataPoint: 'Fallback recommendation'
        },
        {
          recommendation: 'Conduct weekly reviews to identify patterns and adjust your approach.',
          reasoning: 'Weekly reviews create awareness of what is working and what is not. This metacognition enables continuous improvement in your systems.',
          dataPoint: 'Fallback recommendation'
        },
        {
          recommendation: 'Protect high-energy windows for strategic, high-impact work.',
          reasoning: 'Peak energy times are limited and should be reserved for your most important work. Tactical tasks can be done during lower-energy periods.',
          dataPoint: 'Fallback recommendation'
        },
        {
          recommendation: 'Schedule regular breaks to maintain sustainable performance.',
          reasoning: 'Breaks prevent mental fatigue and maintain cognitive performance throughout the day. Working without breaks leads to diminishing returns.',
          dataPoint: 'Fallback recommendation'
        }
      ],
      generatedAt: new Date().toISOString(),
      usingAI: false,
      cached: false,
      basedOn: { dataPoints: 7, averageEnergy: 78, averageFocus: 74, averageFulfillment: 81 }
    })
  }
}
