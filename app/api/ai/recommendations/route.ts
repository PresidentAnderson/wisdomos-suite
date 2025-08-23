import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

interface GoalRecommendation {
  id: string
  title: string
  description: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  timeframe: string
  benefits: string[]
  relatedTo: string[]
  icon: string
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { sub: string }
    const userId = decoded.sub

    // Fetch user's existing data for context
    const [goals, journalEntries, habits, contributions] = await Promise.all([
      prisma.goal.findMany({
        where: { userId },
        select: { title: true, tags: true, isCompleted: true }
      }),
      prisma.journalEntry.findMany({
        where: { userId },
        select: { mood: true, tags: true, body: true },
        orderBy: { createdAt: 'desc' },
        take: 20
      }),
      prisma.habit.findMany({
        where: { userId },
        select: { name: true, frequency: true, currentStreak: true }
      }),
      prisma.contribution.findMany({
        where: { userId },
        select: { type: true, title: true }
      })
    ])

    // Analyze user patterns
    const analysis = analyzeUserData({
      goals,
      journalEntries,
      habits,
      contributions
    })

    // Generate personalized recommendations
    const recommendations = generateRecommendations(analysis)

    return NextResponse.json({
      recommendations,
      analysis,
      generatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Recommendations error:', error)
    return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 })
  }
}

function analyzeUserData(data: any) {
  const analysis = {
    completionRate: 0,
    dominantMoods: [] as string[],
    topTags: [] as string[],
    focusAreas: [] as string[],
    strengths: [] as string[],
    challenges: [] as string[],
    habitConsistency: 0
  }

  // Calculate goal completion rate
  const completedGoals = data.goals.filter((g: any) => g.isCompleted).length
  analysis.completionRate = data.goals.length > 0 
    ? (completedGoals / data.goals.length) * 100 
    : 0

  // Analyze moods
  const moodCounts: Record<string, number> = {}
  data.journalEntries.forEach((entry: any) => {
    if (entry.mood) {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1
    }
  })
  analysis.dominantMoods = Object.entries(moodCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([mood]) => mood)

  // Analyze tags
  const tagCounts: Record<string, number> = {}
  ;[...data.goals, ...data.journalEntries].forEach((item: any) => {
    if (item.tags) {
      item.tags.forEach((tag: string) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      })
    }
  })
  analysis.topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag]) => tag)

  // Identify focus areas based on content
  const focusKeywords = extractKeywords([
    ...data.goals.map((g: any) => g.title),
    ...data.habits.map((h: any) => h.name)
  ])
  analysis.focusAreas = focusKeywords.slice(0, 5)

  // Calculate habit consistency
  const avgStreak = data.habits.length > 0
    ? data.habits.reduce((sum: number, h: any) => sum + h.currentStreak, 0) / data.habits.length
    : 0
  analysis.habitConsistency = Math.min(100, avgStreak * 10)

  // Identify strengths based on contributions
  analysis.strengths = data.contributions
    .filter((c: any) => c.type === 'strength')
    .map((c: any) => c.title)
    .slice(0, 3)

  // Identify challenges based on low completion or negative moods
  if (analysis.completionRate < 50) {
    analysis.challenges.push('Goal completion')
  }
  if (analysis.dominantMoods.includes('anxious') || analysis.dominantMoods.includes('sad')) {
    analysis.challenges.push('Emotional balance')
  }
  if (analysis.habitConsistency < 50) {
    analysis.challenges.push('Habit consistency')
  }

  return analysis
}

function generateRecommendations(analysis: any): GoalRecommendation[] {
  const recommendations: GoalRecommendation[] = []
  
  // Base recommendation templates
  const templates = {
    wellness: [
      {
        title: 'Start a Morning Meditation Practice',
        description: 'Develop a 10-minute daily meditation routine to improve focus and reduce stress',
        category: 'wellness',
        difficulty: 'easy' as const,
        timeframe: '30 days',
        benefits: ['Reduced stress', 'Better focus', 'Improved emotional regulation'],
        icon: '🧘'
      },
      {
        title: 'Establish a Consistent Sleep Schedule',
        description: 'Go to bed and wake up at the same time every day for better energy',
        category: 'wellness',
        difficulty: 'medium' as const,
        timeframe: '21 days',
        benefits: ['More energy', 'Better mood', 'Improved productivity'],
        icon: '😴'
      }
    ],
    productivity: [
      {
        title: 'Implement Time Blocking',
        description: 'Schedule your day in blocks to maximize focus and productivity',
        category: 'productivity',
        difficulty: 'medium' as const,
        timeframe: '14 days',
        benefits: ['Better time management', 'Increased focus', 'Clear priorities'],
        icon: '⏰'
      },
      {
        title: 'Complete a Weekly Review',
        description: 'Spend 30 minutes each week reviewing progress and planning ahead',
        category: 'productivity',
        difficulty: 'easy' as const,
        timeframe: '4 weeks',
        benefits: ['Better planning', 'Track progress', 'Stay aligned with goals'],
        icon: '📊'
      }
    ],
    learning: [
      {
        title: 'Read 20 Pages Daily',
        description: 'Build a consistent reading habit to expand knowledge',
        category: 'learning',
        difficulty: 'easy' as const,
        timeframe: '30 days',
        benefits: ['Expanded knowledge', 'Better focus', 'Personal growth'],
        icon: '📚'
      },
      {
        title: 'Learn a New Skill',
        description: 'Dedicate 30 minutes daily to learning something new',
        category: 'learning',
        difficulty: 'medium' as const,
        timeframe: '60 days',
        benefits: ['Personal growth', 'New opportunities', 'Mental stimulation'],
        icon: '🎓'
      }
    ],
    relationships: [
      {
        title: 'Weekly Friend Check-ins',
        description: 'Reach out to one friend each week to maintain connections',
        category: 'relationships',
        difficulty: 'easy' as const,
        timeframe: '30 days',
        benefits: ['Stronger relationships', 'Social support', 'Increased happiness'],
        icon: '👥'
      },
      {
        title: 'Practice Active Listening',
        description: 'Focus on truly listening in conversations without interrupting',
        category: 'relationships',
        difficulty: 'medium' as const,
        timeframe: '21 days',
        benefits: ['Better communication', 'Deeper connections', 'Increased empathy'],
        icon: '👂'
      }
    ],
    fitness: [
      {
        title: 'Daily 10,000 Steps',
        description: 'Walk at least 10,000 steps every day for better health',
        category: 'fitness',
        difficulty: 'medium' as const,
        timeframe: '30 days',
        benefits: ['Better health', 'More energy', 'Weight management'],
        icon: '🚶'
      },
      {
        title: 'Strength Training 3x Week',
        description: 'Build strength with regular resistance training',
        category: 'fitness',
        difficulty: 'hard' as const,
        timeframe: '60 days',
        benefits: ['Increased strength', 'Better metabolism', 'Bone health'],
        icon: '💪'
      }
    ]
  }

  // Select recommendations based on analysis
  
  // If low completion rate, suggest easier goals
  if (analysis.completionRate < 50) {
    recommendations.push({
      ...templates.productivity[1],
      id: crypto.randomUUID(),
      relatedTo: ['Goal achievement', 'Planning']
    })
  }

  // If stress/anxiety detected, suggest wellness goals
  if (analysis.dominantMoods.includes('anxious') || analysis.dominantMoods.includes('stressed')) {
    recommendations.push({
      ...templates.wellness[0],
      id: crypto.randomUUID(),
      relatedTo: ['Stress management', 'Mental health']
    })
  }

  // If low habit consistency, suggest habit-building goals
  if (analysis.habitConsistency < 50) {
    recommendations.push({
      ...templates.wellness[1],
      id: crypto.randomUUID(),
      relatedTo: ['Habit formation', 'Consistency']
    })
  }

  // Add learning goals if user shows growth mindset
  if (analysis.topTags.includes('learning') || analysis.topTags.includes('growth')) {
    recommendations.push({
      ...templates.learning[0],
      id: crypto.randomUUID(),
      relatedTo: analysis.focusAreas
    })
  }

  // Add fitness goals if health is a focus
  if (analysis.topTags.includes('health') || analysis.topTags.includes('fitness')) {
    recommendations.push({
      ...templates.fitness[0],
      id: crypto.randomUUID(),
      relatedTo: ['Health', 'Energy']
    })
  }

  // Add relationship goals if social connection is low
  if (!analysis.topTags.includes('social') && !analysis.topTags.includes('friends')) {
    recommendations.push({
      ...templates.relationships[0],
      id: crypto.randomUUID(),
      relatedTo: ['Social connection', 'Support network']
    })
  }

  // Ensure we have at least 5 recommendations
  while (recommendations.length < 5) {
    const categories = Object.keys(templates)
    const randomCategory = categories[Math.floor(Math.random() * categories.length)]
    const categoryTemplates = templates[randomCategory as keyof typeof templates]
    const randomTemplate = categoryTemplates[Math.floor(Math.random() * categoryTemplates.length)]
    
    if (!recommendations.find(r => r.title === randomTemplate.title)) {
      recommendations.push({
        ...randomTemplate,
        id: crypto.randomUUID(),
        relatedTo: analysis.focusAreas.slice(0, 2)
      })
    }
  }

  return recommendations.slice(0, 6)
}

function extractKeywords(texts: string[]): string[] {
  const wordCounts: Record<string, number> = {}
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for'])
  
  texts.forEach(text => {
    const words = text.toLowerCase().split(/\s+/)
    words.forEach(word => {
      const cleaned = word.replace(/[^a-z]/g, '')
      if (cleaned.length > 3 && !stopWords.has(cleaned)) {
        wordCounts[cleaned] = (wordCounts[cleaned] || 0) + 1
      }
    })
  })
  
  return Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word)
}