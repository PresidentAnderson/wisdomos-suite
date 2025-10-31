/**
 * Cron Job: Monthly Rollup
 *
 * This endpoint is called by a cron service to create monthly metric snapshots
 * for all tenants.
 *
 * Schedule: 1st of every month at 00:00 UTC
 * Cron expression: 0 0 1 * *
 */

import { NextApiRequest, NextApiResponse } from 'next'
import { monthlyRollup } from '@/lib/patterns/jobs'

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
    console.log('[Cron] Monthly rollup started')

    await monthlyRollup()

    res.status(200).json({
      success: true,
      message: 'Monthly rollup completed',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('[Cron] Monthly rollup failed:', error)

    res.status(500).json({
      success: false,
      error: 'Monthly rollup failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
