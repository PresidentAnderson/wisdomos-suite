import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { dimensionId: string } }
) {
  try {
    // Get authenticated user and tenant
    const authResult = await getUserFromRequest(request)

    if ('error' in authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user } = authResult
    const userId = user.id
    const tenantId = user.tenantId

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
