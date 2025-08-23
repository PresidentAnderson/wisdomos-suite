import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

interface SearchResult {
  type: string
  id: string
  title: string
  description?: string
  url: string
  createdAt: Date
  relevance: number
}

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

    // Get search query
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const filter = searchParams.get('filter') || 'all'
    
    if (!query || query.length < 2) {
      return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 })
    }

    const searchQuery = query.toLowerCase()
    const results: SearchResult[] = []

    // Search Goals
    if (filter === 'all' || filter === 'goals') {
      const goals = await prisma.goal.findMany({
        where: {
          userId,
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { importance: { contains: query, mode: 'insensitive' } },
            { tags: { hasSome: [query] } }
          ]
        },
        select: {
          id: true,
          title: true,
          description: true,
          isCompleted: true,
          isSprint: true,
          createdAt: true
        }
      })

      goals.forEach(goal => {
        const titleMatch = goal.title.toLowerCase().includes(searchQuery) ? 2 : 0
        const descMatch = goal.description?.toLowerCase().includes(searchQuery) ? 1 : 0
        
        results.push({
          type: 'goal',
          id: goal.id,
          title: goal.title,
          description: goal.description || undefined,
          url: `/goals#${goal.id}`,
          createdAt: goal.createdAt,
          relevance: titleMatch + descMatch
        })
      })
    }

    // Search Journal Entries
    if (filter === 'all' || filter === 'journal') {
      const entries = await prisma.journalEntry.findMany({
        where: {
          userId,
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { body: { contains: query, mode: 'insensitive' } },
            { mood: { contains: query, mode: 'insensitive' } },
            { tags: { hasSome: [query] } }
          ]
        },
        select: {
          id: true,
          title: true,
          body: true,
          mood: true,
          type: true,
          createdAt: true
        }
      })

      entries.forEach(entry => {
        const titleMatch = entry.title?.toLowerCase().includes(searchQuery) ? 2 : 0
        const bodyMatch = entry.body.toLowerCase().includes(searchQuery) ? 1 : 0
        
        results.push({
          type: 'journal',
          id: entry.id,
          title: entry.title || `Journal Entry - ${entry.mood || 'No mood'}`,
          description: entry.body.substring(0, 150) + (entry.body.length > 150 ? '...' : ''),
          url: `/journal#${entry.id}`,
          createdAt: entry.createdAt,
          relevance: titleMatch + bodyMatch
        })
      })
    }

    // Search Habits
    if (filter === 'all' || filter === 'habits') {
      const habits = await prisma.habit.findMany({
        where: {
          userId,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } }
          ]
        },
        select: {
          id: true,
          name: true,
          description: true,
          currentStreak: true,
          isActive: true,
          createdAt: true
        }
      })

      habits.forEach(habit => {
        const nameMatch = habit.name.toLowerCase().includes(searchQuery) ? 2 : 0
        const descMatch = habit.description?.toLowerCase().includes(searchQuery) ? 1 : 0
        
        results.push({
          type: 'habit',
          id: habit.id,
          title: habit.name,
          description: `${habit.description || ''} (Streak: ${habit.currentStreak} days)`,
          url: `/habits#${habit.id}`,
          createdAt: habit.createdAt,
          relevance: nameMatch + descMatch
        })
      })
    }

    // Search Contacts
    if (filter === 'all' || filter === 'contacts') {
      const contacts = await prisma.contact.findMany({
        where: {
          userId,
          OR: [
            { firstName: { contains: query, mode: 'insensitive' } },
            { lastName: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
            { notes: { contains: query, mode: 'insensitive' } },
            { tags: { hasSome: [query] } }
          ]
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          notes: true,
          createdAt: true
        }
      })

      contacts.forEach(contact => {
        const nameMatch = `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(searchQuery) ? 2 : 0
        const emailMatch = contact.email?.toLowerCase().includes(searchQuery) ? 1 : 0
        const notesMatch = contact.notes?.toLowerCase().includes(searchQuery) ? 1 : 0
        
        results.push({
          type: 'contact',
          id: contact.id,
          title: `${contact.firstName} ${contact.lastName}`,
          description: contact.email || contact.notes?.substring(0, 100),
          url: `/contacts#${contact.id}`,
          createdAt: contact.createdAt,
          relevance: nameMatch + emailMatch + notesMatch
        })
      })
    }

    // Search Contributions
    if (filter === 'all' || filter === 'contributions') {
      const contributions = await prisma.contribution.findMany({
        where: {
          userId,
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } },
            { source: { contains: query, mode: 'insensitive' } },
            { tags: { hasSome: [query] } }
          ]
        },
        select: {
          id: true,
          title: true,
          content: true,
          type: true,
          createdAt: true
        }
      })

      contributions.forEach(contribution => {
        const titleMatch = contribution.title.toLowerCase().includes(searchQuery) ? 2 : 0
        const contentMatch = contribution.content?.toLowerCase().includes(searchQuery) ? 1 : 0
        
        results.push({
          type: 'contribution',
          id: contribution.id,
          title: contribution.title,
          description: contribution.content?.substring(0, 150),
          url: `/contributions#${contribution.id}`,
          createdAt: contribution.createdAt,
          relevance: titleMatch + contentMatch
        })
      })
    }

    // Search Autobiography Entries
    if (filter === 'all' || filter === 'autobiography') {
      const autoEntries = await prisma.autobiographyEntry.findMany({
        where: {
          userId,
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { narrative: { contains: query, mode: 'insensitive' } },
            { insight: { contains: query, mode: 'insensitive' } },
            { commitment: { contains: query, mode: 'insensitive' } },
            { tags: { hasSome: [query] } }
          ]
        },
        select: {
          id: true,
          year: true,
          title: true,
          narrative: true,
          createdAt: true
        }
      })

      autoEntries.forEach(entry => {
        const titleMatch = entry.title?.toLowerCase().includes(searchQuery) ? 2 : 0
        const narrativeMatch = entry.narrative?.toLowerCase().includes(searchQuery) ? 1 : 0
        
        results.push({
          type: 'autobiography',
          id: entry.id,
          title: entry.title || `Year ${entry.year}`,
          description: entry.narrative?.substring(0, 150),
          url: `/autobiography#year-${entry.year}`,
          createdAt: entry.createdAt,
          relevance: titleMatch + narrativeMatch
        })
      })
    }

    // Sort by relevance and then by date
    results.sort((a, b) => {
      if (b.relevance !== a.relevance) {
        return b.relevance - a.relevance
      }
      return b.createdAt.getTime() - a.createdAt.getTime()
    })

    // Return search results with metadata
    return NextResponse.json({
      query,
      filter,
      total: results.length,
      results: results.slice(0, 50) // Limit to 50 results
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}