/**
 * Fulfillment Display Types
 *
 * Type definitions for the fulfillment display system
 */

import { Database } from '@/lib/supabase/database.types'

// Re-export Database type
export type { Database }

// Fulfillment Display specific types
export type FDScoreRaw = Database['public']['Tables']['fd_score_raw']['Row']
export type FDArea = Database['public']['Tables']['fd_areas']['Row']
export type FDUserSettings = Database['public']['Tables']['fd_user_settings']['Row']

// Additional fulfillment display interfaces
export interface AreaScore {
  area: FDArea
  score: number
  confidence: number
  trend_30d: number | null
  data_points: number
}

export interface DashboardData {
  gfs: number
  areas: AreaScore[]
  loading: boolean
  error: string | null
}
