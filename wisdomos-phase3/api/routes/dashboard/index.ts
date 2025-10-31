/**
 * Dashboard API - Overview
 *
 * Returns comprehensive dashboard data:
 * - Overall fulfillment score
 * - Life area distribution by status
 * - Top performing areas
 * - Areas needing attention
 * - Recent activity
 * - Active commitments
 */

import { NextApiResponse } from 'next'
import { authMiddleware, AuthenticatedRequest } from '@/api/middleware/auth'

async function dashboardHandler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { prisma } = req

    // Fetch all life areas with scores
    const lifeAreas = await prisma.lifeArea.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    })

    // Calculate overall score (average of all areas)
    const overallScore = lifeAreas.reduce((sum, area) => sum + area.currentScore, 0) / lifeAreas.length

    // Calculate distribution by status
    const distribution = lifeAreas.reduce((acc, area) => {
      acc[area.status] = (acc[area.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Top performing areas (score >= 70)
    const topAreas = lifeAreas
      .filter(area => area.currentScore >= 70)
      .sort((a, b) => b.currentScore - a.currentScore)
      .slice(0, 5)
      .map(area => ({
        slug: area.slug,
        name: area.name,
        score: area.currentScore,
        status: area.status
      }))

    // Areas needing attention (score < 40)
    const needsAttention = lifeAreas
      .filter(area => area.currentScore < 40)
      .sort((a, b) => a.currentScore - b.currentScore)
      .map(area => ({
        slug: area.slug,
        name: area.name,
        score: area.currentScore,
        status: area.status
      }))

    // Recent events (last 10)
    const recentEvents = await prisma.event.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        lifeArea: {
          select: {
            slug: true,
            name: true
          }
        }
      }
    })

    // Active commitments count
    const activeCommitments = await prisma.commitment.count({
      where: { status: 'ACTIVE' }
    })

    // Upcoming reviews (commitments not reviewed in 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const upcomingReviews = await prisma.commitment.findMany({
      where: {
        status: 'ACTIVE',
        OR: [
          { reviewedAt: null },
          { reviewedAt: { lt: thirtyDaysAgo } }
        ]
      },
      take: 5,
      orderBy: { createdAt: 'asc' },
      include: {
        lifeArea: {
          select: {
            slug: true,
            name: true
          }
        }
      }
    })

    res.status(200).json({
      success: true,
      overallScore: Math.round(overallScore * 10) / 10,
      distribution: {
        flourishing: distribution['FLOURISHING'] || 0,
        thriving: distribution['THRIVING'] || 0,
        balanced: distribution['BALANCED'] || 0,
        struggling: distribution['STRUGGLING'] || 0,
        crisis: distribution['CRISIS'] || 0
      },
      topAreas,
      needsAttention,
      recentActivity: recentEvents.map(event => ({
        id: event.id,
        type: event.type,
        title: event.title,
        lifeArea: event.lifeArea,
        occurredAt: event.occurredAt,
        createdAt: event.createdAt
      })),
      activeCommitments,
      upcomingReviews: upcomingReviews.map(commitment => ({
        id: commitment.id,
        statement: commitment.statement,
        lifeArea: commitment.lifeArea,
        createdAt: commitment.createdAt,
        daysSinceReview: commitment.reviewedAt
          ? Math.floor((Date.now() - commitment.reviewedAt.getTime()) / (1000 * 60 * 60 * 24))
          : Math.floor((Date.now() - commitment.createdAt.getTime()) / (1000 * 60 * 60 * 24))
      }))
    })
  } catch (error) {
    console.error('[Dashboard] Error:', error)
    res.status(500).json({ error: 'Failed to fetch dashboard data' })
  }
}

export default authMiddleware(dashboardHandler)
