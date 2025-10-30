import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { areaId: string } }
) {
  try {
    const userId = 'demo-user-001' // Placeholder
    const tenantId = 'demo-tenant-001' // Placeholder

    const lifeArea = await prisma.lifeArea.findFirst({
      where: {
        id: params.areaId,
        userId,
        tenantId
      },
      include: {
        subdomains: {
          include: {
            dimensions: {
              orderBy: { name: 'asc' }
            }
          },
          orderBy: { sortOrder: 'asc' }
        }
      }
    })

    if (!lifeArea) {
      return NextResponse.json({ error: 'Life area not found' }, { status: 404 })
    }

    return NextResponse.json({ lifeArea })
  } catch (error) {
    console.error('Error fetching life area:', error)
    return NextResponse.json({ error: 'Failed to fetch life area' }, { status: 500 })
  }
}
