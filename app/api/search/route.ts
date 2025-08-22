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
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '20')
    
    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] })
    }
    
    const searchQuery = {
      contains: query,
      mode: 'insensitive' as const
    }
    
    // Search across multiple models
    const [
      journalEntries,
      contacts,
      goals,
      contributions,
      autobiographyEntries
    ] = await Promise.all([
      // Search journal entries
      prisma.journalEntry.findMany({
        where: {
          userId: user.sub,
          OR: [
            { title: searchQuery },
            { body: searchQuery },
            { tags: { has: query } }
          ]
        },
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      
      // Search contacts
      prisma.contact.findMany({
        where: {
          userId: user.sub,
          OR: [
            { firstName: searchQuery },
            { lastName: searchQuery },
            { email: searchQuery },
            { notes: searchQuery },
            { tags: { has: query } }
          ]
        },
        take: limit,
        orderBy: { updatedAt: 'desc' }
      }),
      
      // Search goals
      prisma.goal.findMany({
        where: {
          userId: user.sub,
          OR: [
            { title: searchQuery },
            { description: searchQuery },
            { tags: { has: query } }
          ]
        },
        take: limit,
        orderBy: { updatedAt: 'desc' }
      }),
      
      // Search contributions
      prisma.contribution.findMany({
        where: {
          userId: user.sub,
          OR: [
            { title: searchQuery },
            { content: searchQuery },
            { tags: { has: query } }
          ]
        },
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      
      // Search autobiography
      prisma.autobiographyEntry.findMany({
        where: {
          userId: user.sub,
          OR: [
            { title: searchQuery },
            { narrative: searchQuery },
            { insight: searchQuery },
            { tags: { has: query } }
          ]
        },
        take: limit,
        orderBy: { year: 'desc' }
      })
    ])
    
    // Format results with type indicators
    const results = [
      ...journalEntries.map(item => ({
        type: 'journal',
        id: item.id,
        title: item.title || 'Journal Entry',
        description: item.body.substring(0, 100) + '...',
        date: item.createdAt,
        url: '/journal'
      })),
      ...contacts.map(item => ({
        type: 'contact',
        id: item.id,
        title: `${item.firstName} ${item.lastName}`,
        description: item.email || item.phoneE164 || 'Contact',
        date: item.createdAt,
        url: '/contacts'
      })),
      ...goals.map(item => ({
        type: 'goal',
        id: item.id,
        title: item.title,
        description: item.description?.substring(0, 100) || 'Goal',
        date: item.createdAt,
        url: '/goals',
        completed: item.isCompleted
      })),
      ...contributions.map(item => ({
        type: 'contribution',
        id: item.id,
        title: item.title,
        description: item.content?.substring(0, 100) || 'Contribution',
        date: item.createdAt,
        url: '/contributions'
      })),
      ...autobiographyEntries.map(item => ({
        type: 'autobiography',
        id: item.id,
        title: item.title || `Year ${item.year}`,
        description: item.narrative?.substring(0, 100) || 'Autobiography entry',
        date: item.createdAt,
        url: '/autobiography',
        year: item.year
      }))
    ]
    
    // Sort by date (most recent first)
    results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    return NextResponse.json({
      query,
      count: results.length,
      results: results.slice(0, limit)
    })
    
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}