/**
 * Events API
 *
 * CRUD operations for life events
 */

import { NextApiResponse } from 'next'
import { z } from 'zod'
import { authMiddleware, AuthenticatedRequest } from '@/api/middleware/auth'
import { calculateAreaScore } from '@/lib/scoring/calculator'

const eventSchema = z.object({
  lifeAreaId: z.string(),
  type: z.enum(['BREAKTHROUGH', 'PROGRESS', 'SETBACK', 'UPSET', 'MILESTONE', 'PATTERN', 'LEARNING']),
  category: z.enum(['PERSONAL', 'RELATIONAL', 'PROFESSIONAL', 'HEALTH', 'SPIRITUAL', 'FINANCIAL', 'CREATIVE', 'OTHER']),
  tone: z.enum(['POSITIVE', 'NEGATIVE', 'NEUTRAL', 'TRANSFORMATIONAL', 'COMPLEX']),
  title: z.string().min(1),
  description: z.string().min(1),
  narrative: z.string().optional(),
  occurredAt: z.string().datetime(),
  emotionalCharge: z.number().min(-5).max(5),
  tags: z.array(z.string()).default([])
})

async function eventsHandler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case 'GET':
      return await getEvents(req, res)
    case 'POST':
      return await createEvent(req, res)
    case 'PATCH':
      return await updateEvent(req, res)
    case 'DELETE':
      return await deleteEvent(req, res)
    default:
      return res.status(405).json({ error: 'Method not allowed' })
  }
}

async function getEvents(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  try {
    const { prisma } = req
    const { lifeAreaId, type, limit = 20, offset = 0 } = req.query

    const where: any = {}
    if (lifeAreaId) where.lifeAreaId = lifeAreaId
    if (type) where.type = type

    const events = await prisma.event.findMany({
      where,
      take: Number(limit),
      skip: Number(offset),
      orderBy: { occurredAt: 'desc' },
      include: {
        lifeArea: {
          select: {
            slug: true,
            name: true
          }
        }
      }
    })

    const total = await prisma.event.count({ where })

    res.status(200).json({
      success: true,
      events,
      pagination: {
        total,
        limit: Number(limit),
        offset: Number(offset),
        hasMore: total > Number(offset) + Number(limit)
      }
    })
  } catch (error) {
    console.error('[Events] Get error:', error)
    res.status(500).json({ error: 'Failed to fetch events' })
  }
}

async function createEvent(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  try {
    const { prisma } = req

    // Validate input
    const data = eventSchema.parse(req.body)

    // Create event
    const event = await prisma.event.create({
      data: {
        ...data,
        occurredAt: new Date(data.occurredAt)
      },
      include: {
        lifeArea: true
      }
    })

    // Recalculate life area score
    const updatedScore = await calculateAreaScore(
      data.lifeAreaId,
      prisma
    )

    // Update life area with new score
    await prisma.lifeArea.update({
      where: { id: data.lifeAreaId },
      data: {
        currentScore: updatedScore.score,
        status: updatedScore.status
      }
    })

    res.status(201).json({
      success: true,
      event,
      updatedScore: updatedScore.score
    })
  } catch (error) {
    console.error('[Events] Create error:', error)

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      })
    }

    res.status(500).json({ error: 'Failed to create event' })
  }
}

async function updateEvent(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  try {
    const { prisma } = req
    const { id, ...updates } = req.body

    if (!id) {
      return res.status(400).json({ error: 'Event ID required' })
    }

    const event = await prisma.event.update({
      where: { id },
      data: updates
    })

    res.status(200).json({
      success: true,
      event
    })
  } catch (error) {
    console.error('[Events] Update error:', error)
    res.status(500).json({ error: 'Failed to update event' })
  }
}

async function deleteEvent(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  try {
    const { prisma } = req
    const { id } = req.query

    if (!id) {
      return res.status(400).json({ error: 'Event ID required' })
    }

    await prisma.event.delete({
      where: { id: id as string }
    })

    res.status(200).json({
      success: true,
      message: 'Event deleted'
    })
  } catch (error) {
    console.error('[Events] Delete error:', error)
    res.status(500).json({ error: 'Failed to delete event' })
  }
}

export default authMiddleware(eventsHandler)
