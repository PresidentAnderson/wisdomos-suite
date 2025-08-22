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
    const format = searchParams.get('format') || 'json'
    const type = searchParams.get('type') || 'all'
    
    // Fetch user data based on type
    /* eslint-disable @typescript-eslint/no-explicit-any */
    interface ExportData {
      journalEntries?: any[]
      contacts?: any[]
      goals?: any[]
      contributions?: any[]
      autobiography?: any[]
    }
    /* eslint-enable @typescript-eslint/no-explicit-any */
    const data: ExportData = {}
    
    if (type === 'all' || type === 'journal') {
      data.journalEntries = await prisma.journalEntry.findMany({
        where: { userId: user.sub },
        orderBy: { createdAt: 'desc' }
      })
    }
    
    if (type === 'all' || type === 'contacts') {
      data.contacts = await prisma.contact.findMany({
        where: { userId: user.sub },
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }]
      })
    }
    
    if (type === 'all' || type === 'goals') {
      data.goals = await prisma.goal.findMany({
        where: { userId: user.sub },
        orderBy: { createdAt: 'desc' }
      })
    }
    
    if (type === 'all' || type === 'contributions') {
      data.contributions = await prisma.contribution.findMany({
        where: { userId: user.sub },
        orderBy: { createdAt: 'desc' }
      })
    }
    
    if (type === 'all' || type === 'autobiography') {
      data.autobiography = await prisma.autobiographyEntry.findMany({
        where: { userId: user.sub },
        orderBy: { year: 'asc' }
      })
    }
    
    // Format response based on format parameter
    if (format === 'csv') {
      // Convert to CSV format
      let csv = ''
      
      // Export each data type as CSV
      if (data.journalEntries) {
        csv += 'Journal Entries\n'
        csv += 'Date,Title,Type,Mood,Body,Tags\n'
        data.journalEntries.forEach((entry: { createdAt: Date; title?: string; type: string; mood?: string; body: string; tags: string[] }) => {
          csv += `"${entry.createdAt}","${entry.title || ''}","${entry.type}","${entry.mood || ''}","${entry.body.replace(/"/g, '""')}","${entry.tags.join(', ')}"\n`
        })
        csv += '\n'
      }
      
      if (data.contacts) {
        csv += 'Contacts\n'
        csv += 'First Name,Last Name,Email,Phone,Notes,Tags\n'
        data.contacts.forEach((contact: { firstName: string; lastName: string; email?: string; phoneE164?: string; notes?: string; tags: string[] }) => {
          csv += `"${contact.firstName}","${contact.lastName}","${contact.email || ''}","${contact.phoneE164 || ''}","${(contact.notes || '').replace(/"/g, '""')}","${contact.tags.join(', ')}"\n`
        })
        csv += '\n'
      }
      
      if (data.goals) {
        csv += 'Goals\n'
        csv += 'Title,Description,Sprint,Completed,Due Date,Tags\n'
        data.goals.forEach((goal: { title: string; description?: string; isSprint: boolean; isCompleted: boolean; dueDate?: Date; tags: string[] }) => {
          csv += `"${goal.title}","${(goal.description || '').replace(/"/g, '""')}","${goal.isSprint}","${goal.isCompleted}","${goal.dueDate || ''}","${goal.tags.join(', ')}"\n`
        })
        csv += '\n'
      }
      
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="wisdomos-export-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    }
    
    // Default to JSON
    return NextResponse.json(data, {
      headers: {
        'Content-Disposition': `attachment; filename="wisdomos-export-${new Date().toISOString().split('T')[0]}.json"`
      }
    })
    
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    )
  }
}