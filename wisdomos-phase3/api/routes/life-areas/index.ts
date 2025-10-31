/**
 * Life Areas API
 *
 * CRUD operations for life areas
 */

import { NextApiResponse } from 'next'
import { authMiddleware, AuthenticatedRequest } from '@/api/middleware/auth'

async function lifeAreasHandler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  const { prisma } = req

  switch (req.method) {
    case 'GET':
      return await getLifeAreas(req, res)
    case 'PATCH':
      return await updateLifeArea(req, res)
    default:
      return res.status(405).json({ error: 'Method not allowed' })
  }
}

async function getLifeAreas(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  try {
    const { prisma } = req
    const { cluster } = req.query

    const where = cluster
      ? { isActive: true, cluster: cluster as string }
      : { isActive: true }

    const lifeAreas = await prisma.lifeArea.findMany({
      where,
      orderBy: { sortOrder: 'asc' }
    })

    res.status(200).json({
      success: true,
      lifeAreas: lifeAreas.map(area => ({
        id: area.id,
        slug: area.slug,
        name: area.name,
        description: area.description,
        cluster: area.cluster,
        sortOrder: area.sortOrder,
        currentScore: area.currentScore,
        status: area.status,
        isActive: area.isActive,
        createdAt: area.createdAt,
        updatedAt: area.updatedAt
      }))
    })
  } catch (error) {
    console.error('[Life Areas] Get error:', error)
    res.status(500).json({ error: 'Failed to fetch life areas' })
  }
}

async function updateLifeArea(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  try {
    const { prisma } = req
    const { id, currentScore, isActive } = req.body

    if (!id) {
      return res.status(400).json({ error: 'Life area ID required' })
    }

    const data: any = {}
    if (currentScore !== undefined) {
      data.currentScore = currentScore
      // Update status based on score
      if (currentScore < 20) data.status = 'CRISIS'
      else if (currentScore < 40) data.status = 'STRUGGLING'
      else if (currentScore < 70) data.status = 'BALANCED'
      else if (currentScore < 90) data.status = 'THRIVING'
      else data.status = 'FLOURISHING'
    }
    if (isActive !== undefined) data.isActive = isActive

    const updatedArea = await prisma.lifeArea.update({
      where: { id },
      data
    })

    res.status(200).json({
      success: true,
      lifeArea: updatedArea
    })
  } catch (error) {
    console.error('[Life Areas] Update error:', error)
    res.status(500).json({ error: 'Failed to update life area' })
  }
}

export default authMiddleware(lifeAreasHandler)
