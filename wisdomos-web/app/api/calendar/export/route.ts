import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'

function createICS(events: any[]) {
  const icsEvents = events.map(event => {
    const start = new Date(event.date || event.dueDate || event.createdAt)
    const end = new Date(start.getTime() + 60 * 60 * 1000) // 1 hour duration
    
    return `BEGIN:VEVENT
UID:${event.id}@wisdomos.app
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(start)}
DTEND:${formatDate(end)}
SUMMARY:${event.title || event.name}
DESCRIPTION:${(event.description || event.body || '').replace(/\n/g, '\\n')}
CATEGORIES:${event.type || 'WisdomOS'}
STATUS:CONFIRMED
END:VEVENT`
  }).join('\n')
  
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//WisdomOS//Personal Growth Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
${icsEvents}
END:VCALENDAR`
}

function formatDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

export async function GET(req: NextRequest) {
  try {
    const user = await getUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || 'all'
    
    const events: any[] = []
    
    // Fetch goals with due dates
    if (type === 'all' || type === 'goals') {
      const goals = await prisma.goal.findMany({
        where: {
          userId: user.sub,
          dueDate: { not: null },
          isCompleted: false
        }
      })
      
      events.push(...goals.map(goal => ({
        id: `goal-${goal.id}`,
        type: 'goal',
        title: `🎯 Goal: ${goal.title}`,
        description: goal.description,
        date: goal.dueDate,
        dueDate: goal.dueDate
      })))
    }
    
    // Fetch habits (create recurring events)
    if (type === 'all' || type === 'habits') {
      const habits = await prisma.habit.findMany({
        where: {
          userId: user.sub,
          isActive: true
        }
      })
      
      // Create daily reminders for active habits
      const today = new Date()
      habits.forEach(habit => {
        for (let i = 0; i < 30; i++) { // Next 30 days
          const date = new Date(today)
          date.setDate(today.getDate() + i)
          date.setHours(9, 0, 0, 0) // 9 AM reminder
          
          events.push({
            id: `habit-${habit.id}-${i}`,
            type: 'habit',
            title: `${habit.icon} ${habit.name}`,
            description: habit.description || `Complete your ${habit.frequency} habit`,
            date: date.toISOString()
          })
        }
      })
    }
    
    // Fetch recent journal entries as past events
    if (type === 'all' || type === 'journal') {
      const entries = await prisma.journalEntry.findMany({
        where: { userId: user.sub },
        take: 50,
        orderBy: { createdAt: 'desc' }
      })
      
      events.push(...entries.map(entry => ({
        id: `journal-${entry.id}`,
        type: 'journal',
        title: `📝 ${entry.title || 'Journal Entry'}`,
        body: entry.body.substring(0, 200),
        date: entry.createdAt
      })))
    }
    
    // Generate ICS file
    const icsContent = createICS(events)
    
    return new NextResponse(icsContent, {
      headers: {
        'Content-Type': 'text/calendar',
        'Content-Disposition': `attachment; filename="wisdomos-calendar.ics"`
      }
    })
    
  } catch (error) {
    console.error('Calendar export error:', error)
    return NextResponse.json(
      { error: 'Failed to export calendar' },
      { status: 500 }
    )
  }
}