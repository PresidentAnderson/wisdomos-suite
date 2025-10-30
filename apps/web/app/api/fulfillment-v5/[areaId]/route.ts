import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { areaId: string } }
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
