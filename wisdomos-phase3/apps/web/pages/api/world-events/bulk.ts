/**
 * API Endpoint: Bulk Generate World Events for Multiple Years
 *
 * POST /api/world-events/bulk
 *
 * Generates world events for a range of years in parallel.
 * Only available when BULK_GENERATION feature flag is enabled.
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'
import { FEATURE_FLAGS } from '@/config/features'

interface WorldEvent {
  date: string
  title: string
  description: string
  category: 'political' | 'cultural' | 'technological' | 'natural' | 'social' | 'economic'
  significance: 'global' | 'regional' | 'local'
  region?: string
  tags: string[]
}

interface BulkGenerationRequest {
  startYear: number
  endYear: number
  region?: string
}

interface BulkGenerationResponse {
  years: {
    [year: number]: WorldEvent[]
  }
  totalEvents: number
  generatedAt: string
  timeElapsed: number
}

interface ErrorResponse {
  error: string
  message: string
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BulkGenerationResponse | ErrorResponse>
) {
  // Check if bulk generation is enabled
  if (!FEATURE_FLAGS.BULK_GENERATION) {
    return res.status(403).json({
      error: 'Feature Disabled',
      message: 'Bulk generation feature is not enabled',
    })
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method Not Allowed',
      message: 'Only POST requests are supported',
    })
  }

  // Check if OpenAI API key is configured
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({
      error: 'Configuration Error',
      message: 'OpenAI API key is not configured',
    })
  }

  const startTime = Date.now()

  try {
    const { startYear, endYear, region } = req.body as BulkGenerationRequest

    // Validate input
    if (!startYear || !endYear) {
      return res.status(400).json({
        error: 'Invalid Input',
        message: 'startYear and endYear are required',
      })
    }

    const currentYear = new Date().getFullYear()
    if (startYear < 1900 || endYear > currentYear || startYear > endYear) {
      return res.status(400).json({
        error: 'Invalid Year Range',
        message: `Years must be between 1900 and ${currentYear}, and startYear must be <= endYear`,
      })
    }

    // Limit to 10 years per request to avoid timeout
    if (endYear - startYear > 10) {
      return res.status(400).json({
        error: 'Range Too Large',
        message: 'Maximum 10 years per bulk request',
      })
    }

    // Generate events for all years in parallel
    const yearPromises: Promise<{ year: number; events: WorldEvent[] }>[] = []

    for (let year = startYear; year <= endYear; year++) {
      yearPromises.push(
        generateWorldEventsForYear(year, region).then((events) => ({
          year,
          events,
        }))
      )
    }

    // Wait for all generations to complete
    const results = await Promise.all(yearPromises)

    // Build response object
    const years: { [year: number]: WorldEvent[] } = {}
    let totalEvents = 0

    results.forEach(({ year, events }) => {
      years[year] = events
      totalEvents += events.length
    })

    const timeElapsed = Date.now() - startTime

    return res.status(200).json({
      years,
      totalEvents,
      generatedAt: new Date().toISOString(),
      timeElapsed,
    })
  } catch (error: any) {
    console.error('Error in bulk generation:', error)
    return res.status(500).json({
      error: 'Bulk Generation Failed',
      message: error.message || 'Failed to generate events in bulk',
    })
  }
}

/**
 * Generate world events for a specific year using OpenAI GPT-4
 */
async function generateWorldEventsForYear(year: number, region?: string): Promise<WorldEvent[]> {
  const prompt = buildPrompt(year, region)

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are a historian specializing in world events. Generate accurate, significant historical events in JSON format.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 2000,
    response_format: { type: 'json_object' },
  })

  const responseText = completion.choices[0]?.message?.content
  if (!responseText) {
    throw new Error(`No response from OpenAI for year ${year}`)
  }

  const parsed = JSON.parse(responseText)
  return parsed.events || []
}

/**
 * Build the prompt for OpenAI based on year and optional region
 */
function buildPrompt(year: number, region?: string): string {
  let prompt = `Generate 10-15 significant world events that occurred in ${year}.`

  if (region && FEATURE_FLAGS.REGIONAL_RELEVANCE) {
    prompt += ` Focus particularly on events relevant to ${region}, but also include major global events.`
  }

  prompt += `

For each event, provide:
- date: ISO date string (YYYY-MM-DD)
- title: Brief title (max 100 characters)
- description: 2-3 sentence description
- category: one of [political, cultural, technological, natural, social, economic]
- significance: one of [global, regional, local]
- region: geographic region (e.g., "North America", "Europe", "Asia")
- tags: array of 2-4 relevant tags

Return as JSON with structure:
{
  "events": [
    {
      "date": "YYYY-MM-DD",
      "title": "Event Title",
      "description": "Event description",
      "category": "political",
      "significance": "global",
      "region": "Region Name",
      "tags": ["tag1", "tag2"]
    }
  ]
}

Focus on events that would be meaningful for someone writing their autobiography - events that shaped culture, politics, technology, or society.`

  return prompt
}
