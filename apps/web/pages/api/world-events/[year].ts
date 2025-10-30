/**
 * API Endpoint: Fetch World Events for a Specific Year
 *
 * GET /api/world-events/[year]
 *
 * Uses OpenAI GPT-4 to generate historically accurate world events
 * for a given year to provide context for autobiography entries.
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

interface WorldEventsResponse {
  year: number
  events: WorldEvent[]
  generatedAt: string
  source: 'ai' | 'cache'
}

interface ErrorResponse {
  error: string
  message: string
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Simple in-memory cache (in production, use Redis or database)
const eventCache = new Map<number, WorldEvent[]>()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<WorldEventsResponse | ErrorResponse>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method Not Allowed',
      message: 'Only GET requests are supported',
    })
  }

  // Extract year from URL
  const { year } = req.query
  const yearNum = parseInt(year as string, 10)

  // Validate year
  if (isNaN(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear()) {
    return res.status(400).json({
      error: 'Invalid Year',
      message: 'Year must be between 1900 and current year',
    })
  }

  // Check if OpenAI API key is configured
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({
      error: 'Configuration Error',
      message: 'OpenAI API key is not configured',
    })
  }

  try {
    // Check cache first
    if (eventCache.has(yearNum)) {
      return res.status(200).json({
        year: yearNum,
        events: eventCache.get(yearNum)!,
        generatedAt: new Date().toISOString(),
        source: 'cache',
      })
    }

    // Get optional region filter if regional relevance is enabled
    const region = FEATURE_FLAGS.REGIONAL_RELEVANCE ? req.query.region as string : undefined

    // Generate world events using OpenAI
    const events = await generateWorldEvents(yearNum, region)

    // Cache the results
    eventCache.set(yearNum, events)

    // Return response
    return res.status(200).json({
      year: yearNum,
      events,
      generatedAt: new Date().toISOString(),
      source: 'ai',
    })
  } catch (error: any) {
    console.error('Error generating world events:', error)
    return res.status(500).json({
      error: 'Generation Failed',
      message: error.message || 'Failed to generate world events',
    })
  }
}

/**
 * Generate world events for a specific year using OpenAI GPT-4
 */
async function generateWorldEvents(year: number, region?: string): Promise<WorldEvent[]> {
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
    throw new Error('No response from OpenAI')
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
