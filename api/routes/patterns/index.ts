/**
 * Pattern Recognition API
 *
 * Endpoints for triggering pattern detection and viewing insights
 */

import { NextApiResponse } from 'next'
import { authMiddleware, AuthenticatedRequest } from '@/api/middleware/auth'
import { detectPatterns, saveInsights } from '@/lib/patterns/recognizer'
import { runPatternDetectionForTenant } from '@/lib/patterns/jobs'

async function patternsHandler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case 'GET':
      return await getInsights(req, res)
    case 'POST':
      return await triggerPatternDetection(req, res)
    default:
      return res.status(405).json({ error: 'Method not allowed' })
  }
}

/**
 * GET /api/patterns
 * Fetch insights for current tenant
 */
async function getInsights(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  try {
    const { prisma } = req
    const { limit = 20, offset = 0, status = 'ACTIVE', type } = req.query

    const where: any = {}
    if (status) where.status = status
    if (type) where.type = type

    const insights = await prisma.insight.findMany({
      where,
      take: Number(limit),
      skip: Number(offset),
      orderBy: [
        { confidence: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    const total = await prisma.insight.count({ where })

    res.status(200).json({
      success: true,
      insights,
      pagination: {
        total,
        limit: Number(limit),
        offset: Number(offset),
        hasMore: total > Number(offset) + Number(limit)
      }
    })
  } catch (error) {
    console.error('[Patterns] Get error:', error)
    res.status(500).json({ error: 'Failed to fetch insights' })
  }
}

/**
 * POST /api/patterns
 * Manually trigger pattern detection for current tenant
 */
async function triggerPatternDetection(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  try {
    const { user, prisma } = req
    const { windowDays = 90 } = req.body

    console.log(`[Patterns] Manual trigger for tenant ${user.tenantSchema}`)

    // Detect patterns
    const result = await detectPatterns(prisma, Number(windowDays))

    // Save insights
    if (result.insights.length > 0) {
      await saveInsights(prisma, result.insights)
    }

    res.status(200).json({
      success: true,
      patternsDetected: result.totalPatternsDetected,
      insightsCreated: result.insights.length,
      analysisWindow: result.analysisWindow,
      insights: result.insights
    })
  } catch (error) {
    console.error('[Patterns] Trigger error:', error)
    res.status(500).json({ error: 'Failed to run pattern detection' })
  }
}

export default authMiddleware(patternsHandler)
