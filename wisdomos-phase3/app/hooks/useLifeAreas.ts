/**
 * useLifeAreas Hook
 *
 * Fetches and manages life areas data
 */

'use client'

import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'

interface LifeArea {
  id: string
  slug: string
  name: string
  description: string
  cluster: string
  sortOrder: number
  currentScore: number
  status: 'CRISIS' | 'STRUGGLING' | 'BALANCED' | 'THRIVING' | 'FLOURISHING'
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export function useLifeAreas(cluster?: string) {
  const { token, isAuthenticated } = useAuth()
  const [lifeAreas, setLifeAreas] = useState<LifeArea[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLifeAreas = async () => {
    if (!isAuthenticated || !token) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const url = cluster
        ? `/api/life-areas?cluster=${cluster}`
        : '/api/life-areas'

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch life areas')
      }

      const result = await response.json()
      setLifeAreas(result.lifeAreas)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      console.error('Life areas fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLifeAreas()
  }, [isAuthenticated, token, cluster])

  return {
    lifeAreas,
    loading,
    error,
    refresh: fetchLifeAreas
  }
}
