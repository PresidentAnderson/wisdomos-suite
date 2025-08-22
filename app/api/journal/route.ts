import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'
import { z } from 'zod'

const CreateJournalSchema = z.object({
  title: z.string().optional(),
  body: z.string().min(1),
  type: z.enum(['journal', 'voice', 'reflection']).default('journal'),
  mood: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  audioUrl: z.string().optional()
})

export async function GET(req: NextRequest) {
  try {
    const user = await getUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')
    const mood = searchParams.get('mood')
    const type = searchParams.get('type')
    
    interface WhereClause {
      userId: string
      mood?: string
      type?: string
      OR?: Array<{ [key: string]: { contains: string; mode: string } }>
    }
    
    const where: WhereClause = { userId: user.sub }
    
    if (mood) where.mood = mood
    if (type) where.type = type
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { body: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    const entries = await prisma.journalEntry.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(entries)
  } catch (error) {
    console.error('Error fetching journal entries:', error)
    return NextResponse.json(
      { error: 'Failed to fetch journal entries' },
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
    const data = CreateJournalSchema.parse(body)
    
    const entry = await prisma.journalEntry.create({
      data: {
        ...data,
        title: data.title || 'Untitled Entry',
        userId: user.sub
      }
    })
    
    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }
    console.error('Error creating journal entry:', error)
    return NextResponse.json(
      { error: 'Failed to create journal entry' },
      { status: 500 }
    )
  }
}