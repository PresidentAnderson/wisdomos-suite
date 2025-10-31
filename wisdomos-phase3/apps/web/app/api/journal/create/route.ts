import { NextRequest, NextResponse } from 'next/server'
import { getTenantPrismaClient } from '@/lib/tenant/prisma-tenant-client'
import { verifyToken } from '@/lib/auth'

/**
 * POST /api/journal/create
 *
 * Creates a new journal entry with:
 * - Content and metadata
 * - Linked life areas with score updates
 * - Autobiography chapter linking (optional)
 * - AI-powered upset detection and reframing
 * - Global Fulfillment Score calculation
 */
export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json()
    const {
      content,
      title,
      lifeAreaIds, // Array of life area IDs
      tags = [],
      mood,
      autobiographyYear, // Optional: link to specific year
      type = 'journal' // journal | voice | reflection
    } = body

    // Validation
    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    if (!lifeAreaIds || lifeAreaIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one life area must be selected' },
        { status: 400 }
      )
    }

    const prisma = getTenantPrismaClient()

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { lifeAreas: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Verify all life areas exist and belong to user
    const lifeAreas = await prisma.lifeArea.findMany({
      where: {
        id: { in: lifeAreaIds },
        userId,
        tenantId
      }
    })

    if (lifeAreas.length !== lifeAreaIds.length) {
      return NextResponse.json(
        { error: 'One or more life areas not found or not accessible' },
        { status: 400 }
      )
    }

    // AI-powered upset detection
    const upsetDetected = detectUpset(content)

    // AI reframing (if upset detected)
    let aiReframe: string | null = null
    if (upsetDetected && process.env.OPENAI_API_KEY) {
      try {
        aiReframe = await generateAIReframe(content)
      } catch (error) {
        console.error('AI reframe failed:', error)
        // Continue without reframe
      }
    }

    // Create journal entry
    const journal = await prisma.journal.create({
      data: {
        tenantId,
        userId,
        lifeAreaId: lifeAreaIds[0], // Primary life area
        content,
        upsetDetected,
        aiReframe,
        tags: Array.isArray(tags) ? tags : [],
        createdAt: new Date()
      },
      include: {
        lifeArea: true
      }
    })

    // Calculate area score updates
    const updatedAreas: Array<{ id: string; code: string; name: string; score: number; previousScore: number }> = []

    for (const area of lifeAreas) {
      // Calculate new score based on:
      // 1. Recent journal entries (consistency)
      // 2. Upset detection (negative impact if upset)
      // 3. Length and depth of reflection (quality)

      const recentEntries = await prisma.journal.count({
        where: {
          userId,
          lifeAreaId: area.id,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      })

      const previousScore = area.score
      let newScore = previousScore

      // Consistency bonus (more entries = higher score)
      const consistencyBonus = Math.min(recentEntries * 2, 20) // Max +20 points

      // Quality bonus based on content length
      const qualityBonus = Math.min(content.length / 100, 15) // Max +15 points

      // Upset penalty
      const upsetPenalty = upsetDetected ? -10 : 0

      // Calculate new score (0-100 scale)
      newScore = Math.max(0, Math.min(100, newScore + consistencyBonus + qualityBonus + upsetPenalty))

      // Update life area score
      await prisma.lifeArea.update({
        where: { id: area.id },
        data: { score: Math.round(newScore) }
      })

      updatedAreas.push({
        id: area.id,
        code: area.name.toLowerCase().replace(/\s+/g, '_'),
        name: area.name,
        score: newScore / 20, // Convert to 0-5 scale
        previousScore: previousScore / 20
      })
    }

    // Calculate Global Fulfillment Score (GFS)
    const allAreas = await prisma.lifeArea.findMany({
      where: { userId, tenantId }
    })

    const totalScore = allAreas.reduce((sum, area) => sum + area.score, 0)
    const gfs = allAreas.length > 0 ? totalScore / allAreas.length : 0

    // Autobiography chapter linking (optional)
    let linkedChapter: any = null
    if (autobiographyYear) {
      // In a full implementation, you'd query an autobiography_chapters table
      // For now, we'll create a mock response
      linkedChapter = {
        id: `chapter_${autobiographyYear}`,
        title: `Chapter ${autobiographyYear}`,
        era_start: autobiographyYear.toString(),
        era_end: (autobiographyYear + 1).toString()
      }
    }

    // Return response
    return NextResponse.json({
      entry_id: journal.id,
      title: title || `Journal Entry - ${new Date().toLocaleDateString()}`,
      content: journal.content,
      upsetDetected: journal.upsetDetected,
      aiReframe: journal.aiReframe,
      linked_chapter: linkedChapter,
      updated_areas: updatedAreas,
      gfs: Math.round(gfs * 100) / 100, // Round to 2 decimal places
      createdAt: journal.createdAt,
      message: 'Journal entry created successfully'
    }, { status: 201 })

  } catch (error: any) {
    console.error('Journal create error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create journal entry' },
      { status: 500 }
    )
  }
}

/**
 * Detect upset patterns in journal content
 * Uses keyword matching and sentiment analysis
 */
function detectUpset(content: string): boolean {
  const upsetKeywords = [
    'angry', 'frustrated', 'upset', 'annoyed', 'irritated',
    'disappointed', 'hurt', 'sad', 'worried', 'anxious',
    'stressed', 'overwhelmed', 'afraid', 'scared', 'hate',
    'terrible', 'awful', 'horrible', 'worst', 'failed'
  ]

  const lowerContent = content.toLowerCase()

  // Check for upset keywords
  const hasUpsetKeywords = upsetKeywords.some(keyword =>
    lowerContent.includes(keyword)
  )

  // Check for negative patterns
  const negativePatterns = [
    /why (can't|don't|won't) (i|we)/gi,
    /i (can't|don't|won't) (believe|understand|accept)/gi,
    /this is (so|too|very) (hard|difficult|frustrating)/gi,
    /i (hate|dislike|regret)/gi
  ]

  const hasNegativePatterns = negativePatterns.some(pattern =>
    pattern.test(content)
  )

  return hasUpsetKeywords || hasNegativePatterns
}

/**
 * Generate AI-powered reframe using OpenAI
 */
async function generateAIReframe(content: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured')
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a compassionate life coach specializing in cognitive reframing.
Your role is to help people transform upset and negative emotions into constructive perspectives.
Use the Phoenix transformation framework: from Ashes (upset) → Fire (breakthrough) → Rebirth (growth).
Be empathetic, validating, and solution-focused. Keep responses under 150 words.`
        },
        {
          role: 'user',
          content: `Help me reframe this journal entry:\n\n${content}`
        }
      ],
      temperature: 0.7,
      max_tokens: 200
    })
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}
