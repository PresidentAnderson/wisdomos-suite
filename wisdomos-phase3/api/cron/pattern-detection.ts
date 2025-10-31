/**
 * Cron Job: Daily Pattern Detection
 *
 * This endpoint is called by a cron service (Vercel Cron, AWS EventBridge, etc.)
 * to run pattern detection across all tenants.
 *
 * Schedule: Daily at 2:00 AM UTC
 * Cron expression: 0 2 * * *
 */

import { NextApiRequest, NextApiResponse } from 'next'
import { dailyPatternDetection } from '@/lib/patterns/jobs'

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
    console.log('[Cron] Daily pattern detection started')

    await dailyPatternDetection()

    res.status(200).json({
      success: true,
      message: 'Daily pattern detection completed',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('[Cron] Pattern detection failed:', error)

    res.status(500).json({
      success: false,
      error: 'Pattern detection failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
