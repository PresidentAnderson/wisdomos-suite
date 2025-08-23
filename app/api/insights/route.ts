import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'

// Simple pattern analysis without external AI API
function analyzePatterns(entries: any[]) {
  const insights: any[] = []
  
  // Mood patterns
  const moodCounts: Record<string, number> = {}
  entries.forEach(entry => {
    if (entry.mood) {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1
    }
  })
  
  const dominantMood = Object.entries(moodCounts)
    .sort((a, b) => b[1] - a[1])[0]
  
  if (dominantMood) {
    insights.push({
      type: 'mood_pattern',
      title: 'Dominant Mood Pattern',
      description: `Your most common mood has been "${dominantMood[0]}" appearing in ${dominantMood[1]} entries.`,
      recommendation: dominantMood[0] === 'anxious' || dominantMood[0] === 'sad' 
        ? 'Consider incorporating more mindfulness or relaxation practices.'
        : 'Keep nurturing the positive emotions you\'re experiencing.'
    })
  }
  
  // Writing frequency
  const dates = entries.map(e => new Date(e.createdAt))
  const daysSinceFirst = dates.length > 0 
    ? (Date.now() - Math.min(...dates.map(d => d.getTime()))) / (1000 * 60 * 60 * 24)
    : 0
  const frequency = daysSinceFirst > 0 ? entries.length / daysSinceFirst : 0
  
  insights.push({
    type: 'frequency',
    title: 'Writing Consistency',
    description: `You're averaging ${frequency.toFixed(1)} entries per day.`,
    recommendation: frequency < 0.5 
      ? 'Try to write more regularly to build a consistent reflection practice.'
      : 'Great consistency! Keep up the regular writing habit.'
  })
  
  // Common themes (simple keyword analysis)
  const words: Record<string, number> = {}
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who', 'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just'])
  
  entries.forEach(entry => {
    const text = (entry.body + ' ' + (entry.title || '')).toLowerCase()
    const entryWords = text.match(/\b[a-z]{4,}\b/g) || []
    entryWords.forEach(word => {
      if (!stopWords.has(word)) {
        words[word] = (words[word] || 0) + 1
      }
    })
  })
  
  const topWords = Object.entries(words)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word)
  
  if (topWords.length > 0) {
    insights.push({
      type: 'themes',
      title: 'Common Themes',
      description: `Your most frequent topics include: ${topWords.join(', ')}.`,
      recommendation: 'These recurring themes might be areas of focus in your life worth exploring deeper.'
    })
  }
  
  // Time of day patterns
  const hourCounts: Record<number, number> = {}
  entries.forEach(entry => {
    const hour = new Date(entry.createdAt).getHours()
    hourCounts[hour] = (hourCounts[hour] || 0) + 1
  })
  
  const peakHour = Object.entries(hourCounts)
    .sort((a, b) => b[1] - a[1])[0]
  
  if (peakHour) {
    const hour = parseInt(peakHour[0])
    const timeOfDay = hour < 6 ? 'early morning' : hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : hour < 21 ? 'evening' : 'night'
    
    insights.push({
      type: 'time_pattern',
      title: 'Peak Writing Time',
      description: `You tend to write most during the ${timeOfDay} (around ${hour}:00).`,
      recommendation: `Consider protecting this ${timeOfDay} time for reflection since it seems to be when you're most inclined to journal.`
    })
  }
  
  return insights
}

export async function GET(req: NextRequest) {
  try {
    const user = await getUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Fetch recent journal entries
    const entries = await prisma.journalEntry.findMany({
      where: { 
        userId: user.sub,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    // Analyze patterns
    const insights = analyzePatterns(entries)
    
    // Get goals progress
    const goals = await prisma.goal.findMany({
      where: { userId: user.sub }
    })
    
    const goalCompletion = goals.length > 0 
      ? (goals.filter(g => g.isCompleted).length / goals.length) * 100
      : 0
    
    insights.push({
      type: 'goals',
      title: 'Goal Achievement',
      description: `You've completed ${goalCompletion.toFixed(0)}% of your goals.`,
      recommendation: goalCompletion < 50 
        ? 'Consider breaking down larger goals into smaller, more achievable milestones.'
        : 'Excellent progress on your goals! Keep maintaining this momentum.'
    })
    
    return NextResponse.json({
      insights,
      summary: {
        totalEntries: entries.length,
        timeSpan: '30 days',
        averageLength: entries.reduce((sum, e) => sum + e.body.length, 0) / (entries.length || 1)
      }
    })
    
  } catch (error) {
    console.error('Insights error:', error)
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    )
  }
}