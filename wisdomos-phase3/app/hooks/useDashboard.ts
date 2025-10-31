/**
 * useDashboard Hook
 *
 * Fetches and manages dashboard data
 */

'use client'

import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'

interface DashboardData {
  overallScore: number
  distribution: {
    flourishing: number
    thriving: number
    balanced: number
    struggling: number
    crisis: number
  }
  topAreas: Array<{
    slug: string
    name: string
    score: number
    status: string
  }>
  needsAttention: Array<{
    slug: string
    name: string
    score: number
    status: string
  }>
  recentActivity: Array<{
    id: string
    type: string
    title: string
    lifeArea: { slug: string; name: string }
    occurredAt: string
    createdAt: string
  }>
  activeCommitments: number
  upcomingReviews: Array<{
    id: string
    statement: string
    lifeArea: { slug: string; name: string }
    createdAt: string
    daysSinceReview: number
  }>
}

export function useDashboard() {
  const { token, isAuthenticated } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboard = async () => {
    if (!isAuthenticated || !token) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      console.error('Dashboard fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [isAuthenticated, token])

  return {
    data,
    loading,
    error,
    refresh: fetchDashboard
  }
}
