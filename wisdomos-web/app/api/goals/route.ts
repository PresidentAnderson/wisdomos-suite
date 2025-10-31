import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'
import { z } from 'zod'

const CreateGoalSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  importance: z.string().optional(),
  isSprint: z.boolean().optional().default(false),
  isCompleted: z.boolean().optional().default(false),
  dueDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  tags: z.array(z.string()).optional().default([])
})

export async function GET(req: NextRequest) {
  try {
    const user = await getUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const sprintOnly = searchParams.get('sprint') === 'true'
    const completed = searchParams.get('completed')
    
    const where: { userId: string; isSprint?: boolean; isCompleted?: boolean } = { userId: user.sub }
    
    if (sprintOnly) {
      where.isSprint = true
    }
    
    if (completed === 'true') {
      where.isCompleted = true
    } else if (completed === 'false') {
      where.isCompleted = false
    }
    
    const goals = await prisma.goal.findMany({
      where,
      orderBy: [
        { isCompleted: 'asc' },
        { isSprint: 'desc' },
        { createdAt: 'desc' }
      ]
    })
    
    return NextResponse.json(goals)
  } catch (error) {
    console.error('Error fetching goals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch goals' },
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
    const data = CreateGoalSchema.parse(body)
    
    const goal = await prisma.goal.create({
      data: { 
        ...data,
        userId: user.sub 
      }
    })
    
    return NextResponse.json(goal, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }
    console.error('Error creating goal:', error)
    return NextResponse.json(
      { error: 'Failed to create goal' },
      { status: 500 }
    )
  }
}