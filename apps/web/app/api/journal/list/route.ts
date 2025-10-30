import { NextRequest, NextResponse } from 'next/server'
import { getTenantPrismaClient } from '@/lib/tenant/prisma-tenant-client'
import { verifyToken } from '@/lib/auth'

/**
 * GET /api/journal/list
 *
 * Retrieves journal entries for the authenticated user
 * Supports filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)

    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    const { userId, tenantId } = payload

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const lifeAreaId = searchParams.get('lifeAreaId')
    const upsetOnly = searchParams.get('upsetOnly') === 'true'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const prisma = getTenantPrismaClient()

    // Build where clause
    const where: any = {
      userId,
      tenantId
    }

    if (lifeAreaId) {
      where.lifeAreaId = lifeAreaId
    }

    if (upsetOnly) {
      where.upsetDetected = true
    }

    // Get total count
    const totalCount = await prisma.journal.count({ where })

    // Get entries
    const entries = await prisma.journal.findMany({
      where,
      include: {
        lifeArea: {
          select: {
            id: true,
            name: true,
            phoenixName: true,
            status: true,
            score: true
          }
        }
      },
      orderBy: {
        [sortBy]: sortOrder
      },
      take: limit,
      skip: offset
    })

    // Format response
    const formattedEntries = entries.map(entry => ({
      id: entry.id,
      content: entry.content,
      tags: entry.tags,
      upsetDetected: entry.upsetDetected,
      aiReframe: entry.aiReframe,
      lifeArea: entry.lifeArea,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt
    }))

    return NextResponse.json({
      entries: formattedEntries,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    })

  } catch (error: any) {
    console.error('Journal list error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve journal entries' },
      { status: 500 }
    )
  }
}
