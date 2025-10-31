import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'
import { z } from 'zod'

const CreateHabitSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly']),
  targetCount: z.number().default(1),
  icon: z.string().default('🎯'),
  color: z.string().default('blue')
})

export async function GET(req: NextRequest) {
  try {
    const user = await getUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const habits = await prisma.habit.findMany({
      where: { userId: user.sub },
      orderBy: { createdAt: 'desc' }
    })
    
    // Calculate streaks
    const habitsWithStreaks = habits.map(habit => {
      const completions = habit.completedDates || []
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      let currentStreak = 0
      let checkDate = new Date(today)
      
      // Calculate current streak
      while (true) {
        const dateStr = checkDate.toISOString().split('T')[0]
        if (completions.includes(dateStr)) {
          currentStreak++
          checkDate.setDate(checkDate.getDate() - 1)
        } else if (currentStreak === 0 && checkDate.getTime() === today.getTime()) {
          // Today not completed yet, check yesterday
          checkDate.setDate(checkDate.getDate() - 1)
          continue
        } else {
          break
        }
      }
      
      return {
        ...habit,
        currentStreak,
        bestStreak: habit.bestStreak || 0
      }
    })
    
    return NextResponse.json(habitsWithStreaks)
  } catch (error) {
    console.error('Error fetching habits:', error)
    return NextResponse.json(
      { error: 'Failed to fetch habits' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await req.json()
    const data = CreateHabitSchema.parse(body)
    
    const habit = await prisma.habit.create({
      data: {
        ...data,
        userId: user.sub,
        completedDates: [],
        bestStreak: 0
      }
    })
    
    return NextResponse.json(habit, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }
    console.error('Error creating habit:', error)
    return NextResponse.json(
      { error: 'Failed to create habit' },
      { status: 500 }
    )
  }
}