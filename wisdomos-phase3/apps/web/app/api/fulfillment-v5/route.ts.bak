import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    // TODO: Get userId and tenantId from auth
    const userId = 'demo-user-001' // Placeholder
    const tenantId = 'demo-tenant-001' // Placeholder

    const lifeAreas = await prisma.lifeArea.findMany({
      where: { userId, tenantId },
      include: {
        subdomains: {
          include: {
            dimensions: {
              orderBy: { name: 'asc' }
            }
          },
          orderBy: { sortOrder: 'asc' }
        }
      },
      orderBy: { sortOrder: 'asc' }
    })

    return NextResponse.json({ lifeAreas })
  } catch (error) {
    console.error('Error fetching v5 data:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}
