import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await getUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const entries = await prisma.entry.findMany({
      where: { 
        userId: user.sub,
        type: 'autobiography'
      },
      orderBy: { year: 'asc' }
    })
    
    return NextResponse.json(entries)
  } catch (error) {
    console.error('Error fetching autobiography:', error)
    return NextResponse.json(
      { error: 'Failed to fetch autobiography' },
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
    
    const entry = await prisma.entry.create({
      data: {
        userId: user.sub,
        type: 'autobiography',
        year: body.year,
        title: body.title,
        body: body.body,
        earliest: body.earliest,
        insight: body.insight,
        commitment: body.commitment
      }
    })
    
    return NextResponse.json(entry)
  } catch (error) {
    console.error('Error creating autobiography entry:', error)
    return NextResponse.json(
      { error: 'Failed to create entry' },
      { status: 500 }
    )
  }
}