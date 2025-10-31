import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { subDays, format, startOfMonth, endOfMonth } from 'date-fns'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    // Get auth token
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { sub: string }
    const userId = decoded.sub

    // Get time range
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')
    const startDate = subDays(new Date(), days)

    // Fetch journal statistics
    const journalEntries = await prisma.journalEntry.findMany({
      where: {
        userId,
        createdAt: { gte: startDate }
      },
      select: {
        body: true,
        mood: true,
        createdAt: true
      }
    })

    const allJournalEntries = await prisma.journalEntry.findMany({
      where: { userId },
      select: { createdAt: true }
    })

    const last7DaysEntries = journalEntries.filter(e => 
      e.createdAt >= subDays(new Date(), 7)
    )

    const last30DaysEntries = journalEntries.filter(e => 
      e.createdAt >= subDays(new Date(), 30)
    )

    // Calculate mood distribution
    const moodCounts: Record<string, number> = {}
    journalEntries.forEach(entry => {
      if (entry.mood) {
        moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1
      }
    })

    const moodDistribution = Object.entries(moodCounts).map(([mood, count]) => ({
      mood,
      count
    }))

    // Calculate entries by day
    const entriesByDay: Record<string, number> = {}
    for (let i = 0; i < days; i++) {
      const date = format(subDays(new Date(), i), 'MMM dd')
      entriesByDay[date] = 0
    }

    journalEntries.forEach(entry => {
      const date = format(entry.createdAt, 'MMM dd')
      if (entriesByDay.hasOwnProperty(date)) {
        entriesByDay[date]++
      }
    })

    const entriesByDayArray = Object.entries(entriesByDay)
      .map(([date, count]) => ({ date, count }))
      .reverse()

    // Fetch goal statistics
    const goals = await prisma.goal.findMany({
      where: { userId },
      select: {
        isCompleted: true,
        isSprint: true,
        createdAt: true,
        updatedAt: true
      }
    })

    const completedGoals = goals.filter(g => g.isCompleted)
    const sprintGoals = goals.filter(g => g.isSprint)
    const completionRate = goals.length > 0 
      ? (completedGoals.length / goals.length) * 100 
      : 0

    // Goals by month
    const goalsByMonth: Record<string, { created: number; completed: number }> = {}
    for (let i = 0; i < 6; i++) {
      const monthStart = startOfMonth(subDays(new Date(), i * 30))
      const monthName = format(monthStart, 'MMM')
      goalsByMonth[monthName] = { created: 0, completed: 0 }
    }

    goals.forEach(goal => {
      const monthName = format(goal.createdAt, 'MMM')
      if (goalsByMonth[monthName]) {
        goalsByMonth[monthName].created++
        if (goal.isCompleted) {
          goalsByMonth[monthName].completed++
        }
      }
    })

    const goalsByMonthArray = Object.entries(goalsByMonth)
      .map(([month, data]) => ({ month, ...data }))
      .reverse()

    // Fetch habit statistics
    const habits = await prisma.habit.findMany({
      where: { userId },
      select: {
        name: true,
        currentStreak: true,
        completedDates: true,
        isActive: true
      }
    })

    const activeHabits = habits.filter(h => h.isActive)
    const totalCompletions = habits.reduce((sum, h) => sum + h.completedDates.length, 0)
    const avgStreak = habits.length > 0
      ? habits.reduce((sum, h) => sum + h.currentStreak, 0) / habits.length
      : 0

    const topHabits = habits
      .sort((a, b) => b.currentStreak - a.currentStreak)
      .slice(0, 5)
      .map(h => ({
        name: h.name,
        streak: h.currentStreak,
        completions: h.completedDates.length
      }))

    // Habit completions by day
    const completionsByDay: Record<string, number> = {}
    for (let i = 0; i < days; i++) {
      const date = format(subDays(new Date(), i), 'MMM dd')
      completionsByDay[date] = 0
    }

    habits.forEach(habit => {
      habit.completedDates.forEach(dateStr => {
        const date = format(new Date(dateStr), 'MMM dd')
        if (completionsByDay.hasOwnProperty(date)) {
          completionsByDay[date]++
        }
      })
    })

    const completionsByDayArray = Object.entries(completionsByDay)
      .map(([date, count]) => ({ date, count }))
      .reverse()

    // Fetch contribution statistics
    const contributions = await prisma.contribution.findMany({
      where: { userId },
      select: { type: true }
    })

    const contributionByType: Record<string, number> = {}
    contributions.forEach(c => {
      contributionByType[c.type] = (contributionByType[c.type] || 0) + 1
    })

    const contributionByTypeArray = Object.entries(contributionByType)
      .map(([type, count]) => ({ type, count }))

    // Fetch contact statistics
    const contacts = await prisma.contact.findMany({
      where: { userId },
      select: {
        email: true,
        phoneE164: true
      }
    })

    const interactions = await prisma.interaction.findMany({
      where: {
        userId,
        occurredAt: { gte: subDays(new Date(), 30) }
      },
      select: { id: true }
    })

    // Compile all analytics data
    const analyticsData = {
      journalStats: {
        totalEntries: allJournalEntries.length,
        last7Days: last7DaysEntries.length,
        last30Days: last30DaysEntries.length,
        avgLength: journalEntries.length > 0 
          ? journalEntries.reduce((sum, e) => sum + e.body.length, 0) / journalEntries.length
          : 0,
        moodDistribution,
        entriesByDay: entriesByDayArray
      },
      goalStats: {
        total: goals.length,
        completed: completedGoals.length,
        inProgress: goals.length - completedGoals.length,
        sprint: sprintGoals.length,
        completionRate,
        goalsByMonth: goalsByMonthArray
      },
      habitStats: {
        active: activeHabits.length,
        totalCompletions,
        avgStreak,
        topHabits,
        completionsByDay: completionsByDayArray
      },
      contributionStats: {
        total: contributions.length,
        byType: contributionByTypeArray
      },
      contactStats: {
        total: contacts.length,
        withEmail: contacts.filter(c => c.email).length,
        withPhone: contacts.filter(c => c.phoneE164).length,
        recentInteractions: interactions.length
      }
    }

    return NextResponse.json(analyticsData)
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}