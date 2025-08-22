import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'
import { z } from 'zod'

const CreateContactSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional(),
  phoneE164: z.string().optional(),
  hubspotId: z.string().optional(),
  salesforceId: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional().default([])
})

export async function GET(req: NextRequest) {
  try {
    const user = await getUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')
    const tag = searchParams.get('tag')
    
    const where: any = { userId: user.sub }
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (tag) {
      where.tags = { has: tag }
    }
    
    const contacts = await prisma.contact.findMany({
      where,
      include: {
        lifeAreaLinks: {
          include: {
            lifeArea: true
          }
        },
        interactions: {
          take: 1,
          orderBy: { occurredAt: 'desc' }
        }
      },
      orderBy: [
        { lastName: 'asc' },
        { firstName: 'asc' }
      ]
    })
    
    return NextResponse.json(contacts)
  } catch (error) {
    console.error('Error fetching contacts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
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
    const data = CreateContactSchema.parse(body)
    
    // Check if email already exists for this user
    if (data.email) {
      const existing = await prisma.contact.findFirst({
        where: {
          userId: user.sub,
          email: data.email
        }
      })
      
      if (existing) {
        return NextResponse.json(
          { error: 'Contact with this email already exists' },
          { status: 400 }
        )
      }
    }
    
    const contact = await prisma.contact.create({
      data: {
        ...data,
        userId: user.sub
      }
    })
    
    return NextResponse.json(contact, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }
    console.error('Error creating contact:', error)
    return NextResponse.json(
      { error: 'Failed to create contact' },
      { status: 500 }
    )
  }
}