/**
 * Custom React hooks for Fulfillment Display v5 data fetching
 *
 * Provides reusable data fetching logic with loading states,
 * error handling, and automatic refetching.
 */

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

// Types
export interface Area {
  id: string
  code: string
  name: string
  emoji: string
  color: string
  weight_default: number
  is_active: boolean
  description: string | null
}

export interface AreaScore {
  area: Area
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

export interface Dimension {
  id: string
  area_id: string
  code: string
  name: string
  description: string | null
  weight_default: number
  is_active: boolean
}

/**
 * Hook to fetch complete dashboard data
 * @param userId - User ID to fetch data for (defaults to demo user)
 * @param period - Period to fetch scores for (YYYY-MM format)
 */
export function useFulfillmentDashboard(
  userId: string = 'demo-user-id',
  period?: string
) {
  const [data, setData] = useState<DashboardData>({
    gfs: 0,
    areas: [],
    loading: true,
    error: null,
  })

  const currentPeriod = period || (() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })()

  const fetchData = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }))

      // Fetch all active areas
      const { data: areas, error: areasError } = await supabase
        .from('fd_area')
        .select('*')
        .eq('is_active', true)
        .order('code')

      if (areasError) throw areasError
      if (!areas || areas.length === 0) {
        throw new Error('No areas found. Please run seed data migration.')
      }

      // Fetch scores for current period
      const { data: scores, error: scoresError } = await supabase
        .from('fd_score_raw')
        .select('area_id, score, created_at')
        .eq('user_id', userId)
        .eq('period', currentPeriod)

      if (scoresError) console.warn('No scores yet:', scoresError)

      // Build area scores
      const areaScores: AreaScore[] = areas.map(area => {
        const areaScore = scores?.find(s => s.area_id === area.id)
        const mockScore = areaScore?.score || (2 + Math.random() * 3)

        return {
          area,
          score: mockScore,
          confidence: areaScore ? 0.8 : 0.3,
          trend_30d: Math.random() > 0.5 ? (Math.random() * 0.5) : -(Math.random() * 0.5),
          data_points: areaScore ? 1 : 0,
        }
      })

      // Calculate GFS
      const totalWeight = areaScores.reduce((sum, as) => sum + as.area.weight_default, 0)
      const weightedScore = areaScores.reduce(
        (sum, as) => sum + (as.score * as.area.weight_default),
        0
      )
      const gfs = Math.round((weightedScore / totalWeight) * 20)

      setData({
        gfs,
        areas: areaScores,
        loading: false,
        error: null,
      })
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error)
      setData(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to load dashboard data',
      }))
    }
  }, [userId, currentPeriod])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { ...data, refetch: fetchData }
}

/**
 * Hook to fetch data for a specific area
 * @param areaId - Area ID to fetch
 * @param userId - User ID
 */
export function useAreaDetail(
  areaId: string,
  userId: string = 'demo-user-id'
) {
  const [data, setData] = useState({
    area: null as Area | null,
    currentScore: 0,
    trend30d: null as number | null,
    confidence: 0,
    dimensions: [] as Dimension[],
    scoreHistory: [] as any[],
    loading: true,
    error: null as string | null,
  })

  const currentPeriod = (() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })()

  const fetchData = useCallback(async () => {
    if (!areaId) return

    try {
      setData(prev => ({ ...prev, loading: true, error: null }))

      // Fetch area info
      const { data: area, error: areaError } = await supabase
        .from('fd_area')
        .select('*')
        .eq('id', areaId)
        .single()

      if (areaError) throw areaError

      // Fetch dimensions
      const { data: dimensions, error: dimsError } = await supabase
        .from('fd_dimension')
        .select('*')
        .eq('area_id', areaId)
        .eq('is_active', true)
        .order('code')

      if (dimsError) console.warn('No dimensions:', dimsError)

      // Fetch current score
      const { data: scoreData, error: scoreError } = await supabase
        .from('fd_score_raw')
        .select('score, created_at, source')
        .eq('area_id', areaId)
        .eq('user_id', userId)
        .eq('period', currentPeriod)
        .order('created_at', { ascending: false })
        .limit(1)

      if (scoreError) console.warn('No scores:', scoreError)

      const currentScore = scoreData?.[0]?.score || (2 + Math.random() * 3)

      // Fetch score history (last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data: history, error: historyError } = await supabase
        .from('fd_score_raw')
        .select('score, created_at, source')
        .eq('area_id', areaId)
        .eq('user_id', userId)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true })

      if (historyError) console.warn('No history:', historyError)

      const scoreHistory = (history || []).map(h => ({
        date: h.created_at,
        score: h.score,
        source: h.source || 'manual'
      }))

      // Calculate trend
      let trend30d = null
      if (scoreHistory.length >= 2) {
        const oldestScore = scoreHistory[0].score
        trend30d = currentScore - oldestScore
      }

      setData({
        area,
        currentScore,
        trend30d,
        confidence: scoreData?.[0] ? 0.8 : 0.3,
        dimensions: dimensions || [],
        scoreHistory,
        loading: false,
        error: null,
      })
    } catch (error: any) {
      console.error('Error fetching area detail:', error)
      setData(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to load area details',
      }))
    }
  }, [areaId, userId, currentPeriod])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { ...data, refetch: fetchData }
}

/**
 * Hook to submit a score for an area
 * @param areaId - Area to score
 * @param userId - User ID
 */
export function useSubmitScore(areaId: string, userId: string = 'demo-user-id') {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentPeriod = (() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })()

  const submitScore = async (score: number, metadata?: Record<string, any>) => {
    setSubmitting(true)
    setError(null)

    try {
      const { error: insertError } = await supabase
        .from('fd_score_raw')
        .insert({
          user_id: userId,
          tenant_id: 'default-tenant',
          area_id: areaId,
          period: currentPeriod,
          score,
          confidence: 1.0,
          source: 'manual',
          metadata: { manually_entered: true, ...metadata }
        })

      if (insertError) throw insertError

      setSubmitting(false)
      return { success: true }
    } catch (err: any) {
      console.error('Error submitting score:', err)
      setError(err.message || 'Failed to save score')
      setSubmitting(false)
      return { success: false, error: err.message }
    }
  }

  return { submitScore, submitting, error }
}

/**
 * Hook to fetch all dimensions for an area
 * @param areaId - Area ID
 */
export function useDimensions(areaId: string) {
  const [dimensions, setDimensions] = useState<Dimension[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDimensions() {
      if (!areaId) return

      try {
        setLoading(true)
        setError(null)

        const { data, error: fetchError } = await supabase
          .from('fd_dimension')
          .select('*')
          .eq('area_id', areaId)
          .eq('is_active', true)
          .order('code')

        if (fetchError) throw fetchError

        setDimensions(data || [])
        setLoading(false)
      } catch (err: any) {
        console.error('Error fetching dimensions:', err)
        setError(err.message || 'Failed to load dimensions')
        setLoading(false)
      }
    }

    fetchDimensions()
  }, [areaId])

  return { dimensions, loading, error }
}
