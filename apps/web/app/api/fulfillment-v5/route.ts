import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user and tenant
    const authResult = await getUserFromRequest(request)

    if ('error' in authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user } = authResult
    const userId = user.id
    const tenantId = user.tenantId

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
