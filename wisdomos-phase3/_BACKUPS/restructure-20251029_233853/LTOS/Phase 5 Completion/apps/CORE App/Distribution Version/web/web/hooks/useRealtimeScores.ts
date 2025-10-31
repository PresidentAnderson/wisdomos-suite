/**
 * Real-time Score Subscriptions Hook for Fulfillment Display v5
 *
 * Subscribes to real-time changes on fd_score_raw table via Supabase
 * - Filters by current user ID
 * - Updates dashboard when scores change
 * - Handles connection/disconnection gracefully
 * - Cleans up subscriptions on unmount
 */

import { useEffect, useRef, useCallback, useState } from 'react'
import { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { FDScoreRaw } from '@/types/fulfillment-display'

export interface ScoreUpdatePayload {
  area_id: string
  area_name?: string
  score: number
  old_score?: number
  source: string
  timestamp: string
}

export interface UseRealtimeScoresOptions {
  userId: string | null
  period: string
  enabled?: boolean
  onScoreUpdate?: (payload: ScoreUpdatePayload) => void
  onError?: (error: Error) => void
  onConnectionChange?: (connected: boolean) => void
}

export interface UseRealtimeScoresReturn {
  isConnected: boolean
  error: Error | null
  lastUpdate: ScoreUpdatePayload | null
  reconnect: () => void
}

/**
 * Hook to subscribe to real-time score updates from Supabase
 *
 * @example
 * ```tsx
 * const { isConnected, lastUpdate, error } = useRealtimeScores({
 *   userId: user.id,
 *   period: '2025-10',
 *   onScoreUpdate: (payload) => {
 *     console.log('Score updated:', payload)
 *     refetchDashboard()
 *   }
 * })
 * ```
 */
export function useRealtimeScores({
  userId,
  period,
  enabled = true,
  onScoreUpdate,
  onError,
  onConnectionChange,
}: UseRealtimeScoresOptions): UseRealtimeScoresReturn {
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [lastUpdate, setLastUpdate] = useState<ScoreUpdatePayload | null>(null)

  const channelRef = useRef<RealtimeChannel | null>(null)
  const cleanupRef = useRef<(() => void) | null>(null)

  // Cache for area names to avoid repeated lookups
  const areaCache = useRef<Map<string, string>>(new Map())

  /**
   * Fetch area name by ID (with caching)
   */
  const getAreaName = useCallback(async (areaId: string): Promise<string> => {
    if (areaCache.current.has(areaId)) {
      return areaCache.current.get(areaId)!
    }

    try {
      const { data, error } = await supabase
        .from('fd_areas')
        .select('name')
        .eq('id', areaId)
        .single()

      if (error || !data) {
        console.warn(`Failed to fetch area name for ${areaId}:`, error)
        return 'Unknown Area'
      }

      areaCache.current.set(areaId, data.name)
      return data.name
    } catch (err) {
      console.error('Error fetching area name:', err)
      return 'Unknown Area'
    }
  }, [])

  /**
   * Connect to real-time channel
   */
  const connect = useCallback(() => {
    // Don't connect if disabled or no user
    if (!enabled || !userId) {
      return
    }

    // Clean up existing connection
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }

    try {
      // Create unique channel name for this user and period
      const channelName = `fd_scores:${userId}:${period}`

      // Subscribe to changes on fd_score_raw table
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to INSERT, UPDATE, DELETE
            schema: 'public',
            table: 'fd_score_raw',
            filter: `user_id=eq.${userId}`,
          },
          async (payload) => {
            console.log('Real-time score update received:', payload)

            try {
              // Handle different event types
              if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                const newRecord = payload.new as FDScoreRaw
                const oldRecord = payload.old as FDScoreRaw | undefined

                // Only process if it's for the current period
                if (newRecord.period !== period) {
                  return
                }

                // Fetch area name
                const areaName = await getAreaName(newRecord.area_id)

                const updatePayload: ScoreUpdatePayload = {
                  area_id: newRecord.area_id,
                  area_name: areaName,
                  score: newRecord.score,
                  old_score: oldRecord?.score,
                  source: newRecord.source,
                  timestamp: newRecord.updated_at || newRecord.created_at,
                }

                setLastUpdate(updatePayload)
                onScoreUpdate?.(updatePayload)
              } else if (payload.eventType === 'DELETE') {
                const deletedRecord = payload.old as FDScoreRaw

                // Only process if it's for the current period
                if (deletedRecord.period !== period) {
                  return
                }

                const areaName = await getAreaName(deletedRecord.area_id)

                const updatePayload: ScoreUpdatePayload = {
                  area_id: deletedRecord.area_id,
                  area_name: areaName,
                  score: 0,
                  old_score: deletedRecord.score,
                  source: 'deleted',
                  timestamp: new Date().toISOString(),
                }

                setLastUpdate(updatePayload)
                onScoreUpdate?.(updatePayload)
              }
            } catch (err) {
              const error = err && typeof err === 'object' && 'message' in err ? (err as Error) : new Error('Unknown error processing update')
              console.error('Error processing real-time update:', error)
              setError(error)
              onError?.(error)
            }
          }
        )
        .subscribe((status) => {
          console.log('Subscription status:', status)

          if (status === 'SUBSCRIBED') {
            setIsConnected(true)
            setError(null)
            onConnectionChange?.(true)
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            setIsConnected(false)
            const error = new Error(`Connection ${status.toLowerCase()}`)
            setError(error)
            onConnectionChange?.(false)
            onError?.(error)
          } else if (status === 'CLOSED') {
            setIsConnected(false)
            onConnectionChange?.(false)
          }
        })

      channelRef.current = channel

      // Setup cleanup function
      cleanupRef.current = () => {
        if (channelRef.current) {
          supabase.removeChannel(channelRef.current)
          channelRef.current = null
        }
        setIsConnected(false)
      }
    } catch (err) {
      const error = err && typeof err === 'object' && 'message' in err ? (err as Error) : new Error('Failed to connect to real-time channel')
      console.error('Error setting up real-time subscription:', error)
      setError(error)
      onError?.(error)
    }
  }, [userId, period, enabled, onScoreUpdate, onError, onConnectionChange, getAreaName])

  /**
   * Reconnect to the channel
   */
  const reconnect = useCallback(() => {
    console.log('Manually reconnecting to real-time channel...')
    connect()
  }, [connect])

  /**
   * Setup subscription on mount or when dependencies change
   */
  useEffect(() => {
    connect()

    // Cleanup on unmount or dependency change
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current()
      }
    }
  }, [connect])

  /**
   * Handle auth state changes
   */
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event)

      if (event === 'SIGNED_IN' && session) {
        // Reconnect when user signs in
        reconnect()
      } else if (event === 'SIGNED_OUT') {
        // Disconnect when user signs out
        if (cleanupRef.current) {
          cleanupRef.current()
        }
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [reconnect])

  return {
    isConnected,
    error,
    lastUpdate,
    reconnect,
  }
}
