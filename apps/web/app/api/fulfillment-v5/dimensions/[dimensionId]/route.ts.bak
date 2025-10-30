import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: Request,
  { params }: { params: { dimensionId: string } }
) {
  try {
    const userId = 'demo-user-001' // Placeholder
    const tenantId = 'demo-tenant-001' // Placeholder

    const body = await request.json()
    const { metric, notes } = body

    // Validate metric
    if (metric !== null && (metric < 1 || metric > 5)) {
      return NextResponse.json({ error: 'Metric must be between 1 and 5' }, { status: 400 })
    }

    const dimension = await prisma.dimension.update({
      where: {
        id: params.dimensionId,
        userId, // Ensure user owns this
        tenantId
      },
      data: {
        metric,
        notes,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ dimension })
  } catch (error) {
    console.error('Error updating dimension:', error)
    return NextResponse.json({ error: 'Failed to update dimension' }, { status: 500 })
  }
}
