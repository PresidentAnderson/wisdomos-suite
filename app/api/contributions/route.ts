import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'
import { z } from 'zod'

const CreateContributionSchema = z.object({
  type: z.enum(['strength', 'acknowledgment', 'natural', 'quote']),
  title: z.string().min(1),
  content: z.string().optional(),
  source: z.string().optional(),
  tags: z.array(z.string()).optional(),
  color: z.string().optional()
})

export async function GET(req: NextRequest) {
  try {
    const user = await getUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const contributions = await prisma.contribution.findMany({
      where: { userId: user.sub },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(contributions)
  } catch (error) {
    console.error('Error fetching contributions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contributions' },
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
    const data = CreateContributionSchema.parse(body)
    
    const contribution = await prisma.contribution.create({
      data: { 
        ...data, 
        tags: data.tags ? JSON.stringify(data.tags) : '[]',
        userId: user.sub 
      }
    })
    
    return NextResponse.json(contribution, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }
    console.error('Error creating contribution:', error)
    return NextResponse.json(
      { error: 'Failed to create contribution' },
      { status: 500 }
    )
  }
}