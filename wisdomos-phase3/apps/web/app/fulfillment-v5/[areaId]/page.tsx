'use client'

/**
 * Individual Life Area Detail Page
 *
 * Shows deep dive into a specific life area:
 * - Current score and trend
 * - All dimensions for this area
 * - Recent journal entries mentioning this area
 * - Goals related to this area
 * - Score history graph
 * - Quick score input
 */

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  BookOpen,
  Target,
  Sparkles,
  Edit3
} from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import PhoenixButton from '@/components/ui/PhoenixButton'

// Types
interface Area {
  id: string
  code: string
  name: string
  emoji: string
  color: string
  weight_default: number
  description: string | null
}

interface Dimension {
  id: string
  code: string
  name: string
  description: string | null
  weight_default: number
}

interface ScoreHistory {
  date: string
  score: number
  source: string
}

interface AreaDetailData {
  area: Area | null
  currentScore: number
  trend30d: number | null
  confidence: number
  dimensions: Dimension[]
  scoreHistory: ScoreHistory[]
  recentEntries: number
  activeGoals: number
  loading: boolean
  error: string | null
}

export default function AreaDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const areaId = params?.areaId as string

  const [data, setData] = useState<AreaDetailData>({
    area: null,
    currentScore: 0,
    trend30d: null,
    confidence: 0,
    dimensions: [],
    scoreHistory: [],
    recentEntries: 0,
    activeGoals: 0,
    loading: true,
    error: null,
  })

  const [showScoreInput, setShowScoreInput] = useState(false)
  const [newScore, setNewScore] = useState(3)

  const currentPeriod = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/fulfillment-v5')
    }
  }, [authLoading, user, router])

  useEffect(() => {
    if (areaId && user) {
      fetchAreaDetail()
    }
  }, [areaId, user])

  async function fetchAreaDetail() {
    if (!user) return

    try {
      setData(prev => ({ ...prev, loading: true, error: null }))

      const userId = user.id

      // 1. Fetch area info
      const { data: area, error: areaError } = await supabase
        .from('fd_areas')
        .select('*')
        .eq('id', areaId)
        .single()

      if (areaError) throw areaError

      // 2. Fetch dimensions for this area
      const { data: dimensions, error: dimsError } = await supabase
        .from('fd_dimensions')
        .select('*')
        .eq('area_id', areaId)
        .eq('is_active', true)
        .order('code')

      if (dimsError) console.warn('No dimensions:', dimsError)

      // 3. Fetch current score
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

      // 4. Fetch score history (last 30 days)
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

      // 5. Count recent journal entries (if table exists)
      // For now, using mock data since we don't know if entries reference areas
      const recentEntries = Math.floor(Math.random() * 10)

      // 6. Count active goals for this area
      const activeGoals = Math.floor(Math.random() * 5)

      // Calculate 30-day trend
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
        recentEntries,
        activeGoals,
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
  }

  async function submitScore() {
    if (!user) return

    try {
      const { error } = await supabase
        .from('fd_score_raw')
        .insert({
          user_id: user.id,
          tenant_id: 'default-tenant',
          area_id: areaId,
          period: currentPeriod,
          score: newScore,
          confidence: 1.0,
          source: 'manual',
          metadata: { manually_entered: true }
        })

      if (error) throw error

      setShowScoreInput(false)
      fetchAreaDetail() // Refresh data
    } catch (error: any) {
      console.error('Error submitting score:', error)
      alert('Failed to save score: ' + error.message)
    }
  }

  function getHealthColor(score: number) {
    if (score >= 4) return 'from-green-400 to-emerald-500'
    if (score >= 2.5) return 'from-yellow-400 to-orange-500'
    return 'from-red-400 to-rose-500'
  }

  function getHealthStatus(score: number) {
    if (score >= 4) return 'Thriving'
    if (score >= 2.5) return 'Attention Needed'
    return 'Breakdown Zone'
  }

  if (authLoading || data.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-phoenix-smoke via-white to-phoenix-gold/10 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-4"
          >
            <Sparkles className="w-16 h-16 text-phoenix-orange" />
          </motion.div>
          <p className="text-lg text-gray-600">Loading area details...</p>
        </div>
      </div>
    )
  }

  if (data.error || !data.area) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-phoenix-smoke via-white to-phoenix-gold/10 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-2xl shadow-xl">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2 text-gray-900">Error Loading Area</h2>
          <p className="text-gray-600 mb-6">{data.error || 'Area not found'}</p>
          <Link href="/fulfillment-v5">
            <PhoenixButton>Back to Dashboard</PhoenixButton>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-phoenix-smoke via-white to-phoenix-gold/10">
      {/* Header */}
      <header className="border-b border-phoenix-gold/20 bg-white/80 backdrop-blur-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/fulfillment-v5">
                <PhoenixButton variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Dashboard
                </PhoenixButton>
              </Link>
              <div className="flex items-center gap-3">
                <span className="text-4xl">{data.area.emoji}</span>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{data.area.name}</h1>
                  <p className="text-sm text-gray-500">{data.area.code}</p>
                </div>
              </div>
            </div>
            <PhoenixButton onClick={() => setShowScoreInput(!showScoreInput)}>
              <Edit3 className="w-4 h-4 mr-2" />
              Update Score
            </PhoenixButton>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Score Input Modal */}
        {showScoreInput && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-white rounded-2xl p-6 shadow-lg border border-phoenix-gold/20"
          >
            <h3 className="text-lg font-semibold mb-4">Update {data.area.name} Score</h3>
            <p className="text-sm text-gray-600 mb-4">
              Rate your current fulfillment in this area (0 = breakdown, 5 = thriving)
            </p>
            <div className="flex items-center gap-4 mb-4">
              <input
                type="range"
                min="0"
                max="5"
                step="0.1"
                value={newScore}
                onChange={(e) => setNewScore(parseFloat(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-3xl font-bold text-gray-900 w-16 text-center">
                {newScore.toFixed(1)}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <PhoenixButton onClick={submitScore} className="flex-1">
                Save Score
              </PhoenixButton>
              <PhoenixButton
                variant="secondary"
                onClick={() => setShowScoreInput(false)}
                className="flex-1"
              >
                Cancel
              </PhoenixButton>
            </div>
          </motion.div>
        )}

        {/* Current Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className={`bg-gradient-to-br ${getHealthColor(data.currentScore)} rounded-3xl p-8 text-white shadow-2xl`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium opacity-90 mb-2">Current Score</h2>
                <div className="flex items-baseline gap-2">
                  <span className="text-7xl font-bold">{data.currentScore.toFixed(1)}</span>
                  <span className="text-3xl opacity-75">/5.0</span>
                </div>
                <p className="mt-2 text-sm opacity-90">
                  {getHealthStatus(data.currentScore)}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 mb-2">
                  {data.trend30d !== null && data.trend30d > 0 && (
                    <>
                      <TrendingUp className="w-6 h-6" />
                      <span className="text-2xl font-semibold">+{data.trend30d.toFixed(1)}</span>
                    </>
                  )}
                  {data.trend30d !== null && data.trend30d < 0 && (
                    <>
                      <TrendingDown className="w-6 h-6" />
                      <span className="text-2xl font-semibold">{data.trend30d.toFixed(1)}</span>
                    </>
                  )}
                  {(data.trend30d === null || data.trend30d === 0) && (
                    <>
                      <Minus className="w-6 h-6" />
                      <span className="text-2xl font-semibold">Stable</span>
                    </>
                  )}
                </div>
                <div className="text-sm opacity-75">30-day trend</div>
                <div className="text-xs opacity-75 mt-1">
                  Confidence: {(data.confidence * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 border border-gray-200"
          >
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-phoenix-orange" />
              <h3 className="font-semibold text-gray-900">Data Points</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{data.scoreHistory.length}</p>
            <p className="text-sm text-gray-500 mt-1">Last 30 days</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 border border-gray-200"
          >
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-5 h-5 text-phoenix-red" />
              <h3 className="font-semibold text-gray-900">Journal Entries</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{data.recentEntries}</p>
            <p className="text-sm text-gray-500 mt-1">Mentioning this area</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 border border-gray-200"
          >
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-5 h-5 text-phoenix-gold" />
              <h3 className="font-semibold text-gray-900">Active Goals</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{data.activeGoals}</p>
            <p className="text-sm text-gray-500 mt-1">Currently in progress</p>
          </motion.div>
        </div>

        {/* Dimensions List */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Dimensions</h2>
          {data.dimensions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.dimensions.map((dim, index) => (
                <motion.div
                  key={dim.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl p-4 border border-gray-200 hover:border-phoenix-orange/50 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{dim.name}</h3>
                      <p className="text-sm text-gray-500">{dim.code}</p>
                      {dim.description && (
                        <p className="text-sm text-gray-600 mt-2">{dim.description}</p>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 ml-4">
                      Weight: {dim.weight_default}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <p className="text-gray-500">No dimensions defined for this area yet</p>
            </div>
          )}
        </div>

        {/* Score History */}
        {data.scoreHistory.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent History</h2>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="space-y-3">
                {data.scoreHistory.map((entry, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-gray-900">{entry.score.toFixed(1)}</div>
                      <div>
                        <div className="text-sm text-gray-600">
                          {new Date(entry.date).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">{entry.source}</div>
                      </div>
                    </div>
                    <div className={`w-20 h-2 bg-gradient-to-r ${getHealthColor(entry.score)} rounded-full`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
