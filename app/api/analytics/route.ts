import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await getUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { searchParams } = new URL(req.url)
    const range = searchParams.get('range') || 'month'
    
    // Calculate date range
    const now = new Date()
    let startDate = new Date()
    
    switch (range) {
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      case 'all':
        startDate = new Date(0)
        break
    }
    
    // Fetch all data
    const [
      journalEntries,
      goals,
      contacts,
      contributions,
      autobiography
    ] = await Promise.all([
      prisma.journalEntry.findMany({
        where: { 
          userId: user.sub,
          createdAt: { gte: startDate }
        }
      }),
      prisma.goal.findMany({
        where: { userId: user.sub }
      }),
      prisma.contact.findMany({
        where: { userId: user.sub }
      }),
      prisma.contribution.findMany({
        where: { 
          userId: user.sub,
          createdAt: { gte: startDate }
        }
      }),
      prisma.autobiographyEntry.findMany({
        where: { userId: user.sub }
      })
    ])
    
    // Calculate journal stats
    const journalStats = {
      total: journalEntries.length,
      thisWeek: journalEntries.filter(e => 
        e.createdAt >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      ).length,
      thisMonth: journalEntries.filter(e => 
        e.createdAt >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      ).length,
      byMood: Object.entries(
        journalEntries.reduce((acc: any, entry) => {
          if (entry.mood) {
            acc[entry.mood] = (acc[entry.mood] || 0) + 1
          }
          return acc
        }, {})
      ).map(([mood, count]) => ({ mood, count: count as number })),
      byType: Object.entries(
        journalEntries.reduce((acc: any, entry) => {
          acc[entry.type] = (acc[entry.type] || 0) + 1
          return acc
        }, {})
      ).map(([type, count]) => ({ type, count: count as number }))
    }
    
    // Calculate goal stats
    const goalStats = {
      total: goals.length,
      completed: goals.filter(g => g.isCompleted).length,
      sprint: goals.filter(g => g.isSprint && !g.isCompleted).length,
      completionRate: goals.length > 0 
        ? Math.round((goals.filter(g => g.isCompleted).length / goals.length) * 100 * 10) / 10
        : 0
    }
    
    // Calculate contact stats
    const contactStats = {
      total: contacts.length,
      withEmail: contacts.filter(c => c.email).length,
      withPhone: contacts.filter(c => c.phoneE164).length,
      recentlyAdded: contacts.filter(c => 
        c.createdAt >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      ).length
    }
    
    // Calculate activity stats
    const allEntries = [
      ...journalEntries.map(e => e.createdAt),
      ...contributions.map(c => c.createdAt),
      ...goals.map(g => g.createdAt)
    ].sort((a, b) => b.getTime() - a.getTime())
    
    // Calculate streak
    let streakDays = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(today.getDate() - i)
      
      const hasActivity = allEntries.some(date => {
        const entryDate = new Date(date)
        entryDate.setHours(0, 0, 0, 0)
        return entryDate.getTime() === checkDate.getTime()
      })
      
      if (hasActivity) {
        streakDays++
      } else if (i > 0) {
        break
      }
    }
    
    // Calculate most active day
    const dayActivity = allEntries.reduce((acc: any, date) => {
      const day = new Date(date).toLocaleDateString('en-US', { weekday: 'long' })
      acc[day] = (acc[day] || 0) + 1
      return acc
    }, {})
    
    const mostActiveDay = Object.entries(dayActivity).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || 'N/A'
    
    const activityStats = {
      streakDays,
      totalDays: new Set(allEntries.map(d => d.toISOString().split('T')[0])).size,
      mostActiveDay,
      lastActive: allEntries[0] ? new Date(allEntries[0]).toLocaleDateString() : 'Never'
    }
    
    return NextResponse.json({
      journalStats,
      goalStats,
      contactStats,
      activityStats
    })
    
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}