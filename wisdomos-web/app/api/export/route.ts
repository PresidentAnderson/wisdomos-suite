import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { Parser } from 'json2csv'
import jwt from 'jsonwebtoken'

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

    // Get export type from query params
    const { searchParams } = new URL(request.url)
    const exportType = searchParams.get('type') || 'all'
    const format = searchParams.get('format') || 'csv'

    // Fetch user data based on export type
    let data: any = {}
    
    if (exportType === 'all' || exportType === 'profile') {
      data.profile = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          email: true,
          name: true,
          emailVerified: true,
          createdAt: true
        }
      })
    }

    if (exportType === 'all' || exportType === 'goals') {
      data.goals = await prisma.goal.findMany({
        where: { userId },
        select: {
          title: true,
          description: true,
          importance: true,
          isSprint: true,
          isCompleted: true,
          dueDate: true,
          tags: true,
          createdAt: true,
          updatedAt: true
        }
      })
    }

    if (exportType === 'all' || exportType === 'journal') {
      data.journalEntries = await prisma.journalEntry.findMany({
        where: { userId },
        select: {
          title: true,
          body: true,
          type: true,
          mood: true,
          tags: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      })
    }

    if (exportType === 'all' || exportType === 'habits') {
      data.habits = await prisma.habit.findMany({
        where: { userId },
        select: {
          name: true,
          description: true,
          frequency: true,
          targetCount: true,
          currentStreak: true,
          bestStreak: true,
          completedDates: true,
          isActive: true,
          createdAt: true
        }
      })
    }

    if (exportType === 'all' || exportType === 'contacts') {
      data.contacts = await prisma.contact.findMany({
        where: { userId },
        select: {
          firstName: true,
          lastName: true,
          email: true,
          phoneE164: true,
          notes: true,
          tags: true,
          createdAt: true
        }
      })
    }

    if (exportType === 'all' || exportType === 'contributions') {
      data.contributions = await prisma.contribution.findMany({
        where: { userId },
        select: {
          type: true,
          title: true,
          content: true,
          source: true,
          tags: true,
          createdAt: true
        }
      })
    }

    if (exportType === 'all' || exportType === 'autobiography') {
      data.autobiographyEntries = await prisma.autobiographyEntry.findMany({
        where: { userId },
        select: {
          year: true,
          title: true,
          narrative: true,
          earliest: true,
          insight: true,
          commitment: true,
          tags: true,
          createdAt: true
        },
        orderBy: { year: 'asc' }
      })
    }

    // Format data based on requested format
    if (format === 'csv') {
      const csvData = formatAsCSV(data, exportType)
      return new NextResponse(csvData, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="wisdomos-export-${exportType}-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    } else if (format === 'json') {
      return NextResponse.json(data, {
        status: 200,
        headers: {
          'Content-Disposition': `attachment; filename="wisdomos-export-${exportType}-${new Date().toISOString().split('T')[0]}.json"`
        }
      })
    } else if (format === 'pdf') {
      // For PDF, we'll return structured data that the frontend can convert
      return NextResponse.json({
        data,
        exportType,
        timestamp: new Date().toISOString(),
        format: 'pdf-data'
      })
    }

    return NextResponse.json({ error: 'Invalid format' }, { status: 400 })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 })
  }
}

function formatAsCSV(data: any, exportType: string): string {
  const csvSections: string[] = []
  
  try {
    // Profile section
    if (data.profile) {
      csvSections.push('PROFILE')
      const profileParser = new Parser({
        fields: ['email', 'name', 'emailVerified', 'createdAt']
      })
      csvSections.push(profileParser.parse([data.profile]))
      csvSections.push('')
    }

    // Goals section
    if (data.goals && data.goals.length > 0) {
      csvSections.push('GOALS')
      const goalsParser = new Parser({
        fields: ['title', 'description', 'importance', 'isSprint', 'isCompleted', 'dueDate', 'tags', 'createdAt']
      })
      csvSections.push(goalsParser.parse(data.goals))
      csvSections.push('')
    }

    // Journal Entries section
    if (data.journalEntries && data.journalEntries.length > 0) {
      csvSections.push('JOURNAL ENTRIES')
      const journalParser = new Parser({
        fields: ['title', 'body', 'type', 'mood', 'tags', 'createdAt']
      })
      csvSections.push(journalParser.parse(data.journalEntries))
      csvSections.push('')
    }

    // Habits section
    if (data.habits && data.habits.length > 0) {
      csvSections.push('HABITS')
      const habitsParser = new Parser({
        fields: ['name', 'description', 'frequency', 'targetCount', 'currentStreak', 'bestStreak', 'isActive', 'createdAt']
      })
      csvSections.push(habitsParser.parse(data.habits))
      csvSections.push('')
    }

    // Contacts section
    if (data.contacts && data.contacts.length > 0) {
      csvSections.push('CONTACTS')
      const contactsParser = new Parser({
        fields: ['firstName', 'lastName', 'email', 'phoneE164', 'notes', 'tags', 'createdAt']
      })
      csvSections.push(contactsParser.parse(data.contacts))
      csvSections.push('')
    }

    // Contributions section
    if (data.contributions && data.contributions.length > 0) {
      csvSections.push('CONTRIBUTIONS')
      const contributionsParser = new Parser({
        fields: ['type', 'title', 'content', 'source', 'tags', 'createdAt']
      })
      csvSections.push(contributionsParser.parse(data.contributions))
      csvSections.push('')
    }

    // Autobiography section
    if (data.autobiographyEntries && data.autobiographyEntries.length > 0) {
      csvSections.push('AUTOBIOGRAPHY')
      const autoParser = new Parser({
        fields: ['year', 'title', 'narrative', 'earliest', 'insight', 'commitment', 'tags', 'createdAt']
      })
      csvSections.push(autoParser.parse(data.autobiographyEntries))
      csvSections.push('')
    }
  } catch (error) {
    console.error('CSV formatting error:', error)
    // Return simple CSV if json2csv fails
    return Object.entries(data).map(([key, value]) => 
      `${key.toUpperCase()}\n${JSON.stringify(value, null, 2)}`
    ).join('\n\n')
  }

  return csvSections.join('\n')
}