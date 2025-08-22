import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUser } from '@/lib/auth'
import { z } from 'zod'

const UpdateSettingsSchema = z.object({
  // Feature toggles
  journalEnabled: z.boolean().optional(),
  goalsEnabled: z.boolean().optional(),
  contributionsEnabled: z.boolean().optional(),
  autobiographyEnabled: z.boolean().optional(),
  assessmentsEnabled: z.boolean().optional(),
  
  // Privacy settings
  defaultVisibility: z.string().optional(),
  allowDataExport: z.boolean().optional(),
  allowAnonymousAnalytics: z.boolean().optional(),
  
  // Display preferences
  theme: z.string().optional(),
  timezone: z.string().optional()
})

export async function GET(req: NextRequest) {
  try {
    const user = await getUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    let settings = await prisma.userSettings.findUnique({
      where: { userId: user.sub }
    })
    
    // Create default settings if they don't exist
    if (!settings) {
      settings = await prisma.userSettings.create({
        data: {
          userId: user.sub,
          journalEnabled: true,
          goalsEnabled: true,
          contributionsEnabled: true,
          autobiographyEnabled: true,
          assessmentsEnabled: true,
          defaultVisibility: 'private',
          allowDataExport: true,
          allowAnonymousAnalytics: false,
          theme: 'dark',
          timezone: 'UTC'
        }
      })
    }
    
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await req.json()
    const data = UpdateSettingsSchema.parse(body)
    
    // Remove undefined values
    const updateData = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined)
    )
    
    const settings = await prisma.userSettings.upsert({
      where: { userId: user.sub },
      update: updateData,
      create: {
        userId: user.sub,
        // Set defaults for required fields if not provided
        showJournalEntries: typeof updateData.showJournalEntries === 'boolean' ? updateData.showJournalEntries : true,
        enableGoals: typeof updateData.enableGoals === 'boolean' ? updateData.enableGoals : true,
        enableContributions: typeof updateData.enableContributions === 'boolean' ? updateData.enableContributions : true,
        enableAutobiography: typeof updateData.enableAutobiography === 'boolean' ? updateData.enableAutobiography : true,
        enableAssessments: typeof updateData.enableAssessments === 'boolean' ? updateData.enableAssessments : true,
        defaultEntryVisibility: (typeof updateData.defaultEntryVisibility === 'string' ? updateData.defaultEntryVisibility : 'private') as 'private' | 'cohort' | 'coach' | 'public' | 'anonymous',
        allowDataExport: typeof updateData.allowDataExport === 'boolean' ? updateData.allowDataExport : true,
        allowAnonymousData: typeof updateData.allowAnonymousData === 'boolean' ? updateData.allowAnonymousData : false,
        theme: typeof updateData.theme === 'string' ? updateData.theme : 'dark',
        timeZone: typeof updateData.timeZone === 'string' ? updateData.timeZone : 'UTC'
      }
    })
    
    return NextResponse.json(settings)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}