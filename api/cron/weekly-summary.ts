/**
 * Cron Job: Weekly Summary
 *
 * This endpoint is called by a cron service to generate weekly summaries
 * for all tenants.
 *
 * Schedule: Sunday at 00:00 UTC
 * Cron expression: 0 0 * * 0
 */

import { NextApiRequest, NextApiResponse } from 'next'
import { weeklyPatternSummary } from '@/lib/patterns/jobs'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Verify request is from authorized cron service
  const authHeader = req.headers.authorization
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('[Cron] Weekly summary started')

    await weeklyPatternSummary()

    res.status(200).json({
      success: true,
      message: 'Weekly summary completed',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('[Cron] Weekly summary failed:', error)

    res.status(500).json({
      success: false,
      error: 'Weekly summary failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
