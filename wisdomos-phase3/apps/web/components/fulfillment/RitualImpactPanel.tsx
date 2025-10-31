'use client'

/**
 * Ritual Impact Panel
 *
 * Shows how ritual completion is affecting fulfillment scores
 * Displays completion rates, quality, and impact per area
 */

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Repeat,
  TrendingUp,
  CheckCircle2,
  Star,
  Calendar,
  BarChart3,
  Sparkles,
  RefreshCw
} from 'lucide-react'
import PhoenixButton from '@/components/ui/PhoenixButton'
import {
  calculateRitualImpact,
  saveRitualImpactsAsScores,
  type RitualScoreResult,
  type RitualImpactScore
} from '@/lib/ritual-scoring-engine'

interface RitualImpactPanelProps {
  userId: string
  tenantId?: string
  period: string // YYYY-MM
  onScoresUpdated?: () => void
}

export default function RitualImpactPanel({
  userId,
  tenantId = 'default-tenant',
  period,
  onScoresUpdated
}: RitualImpactPanelProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<RitualScoreResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    fetchRitualImpact()
  }, [userId, period])

  async function fetchRitualImpact() {
    setLoading(true)
    setError(null)

    try {
      const data = await calculateRitualImpact(userId, period, tenantId)
      setResult(data)
    } catch (err: any) {
      setError(err.message || 'Failed to calculate ritual impact')
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveScores() {
    if (!result) return

    setSaving(true)
    setSaveSuccess(false)

    try {
      const { saved, errors } = await saveRitualImpactsAsScores(userId, tenantId, result)

      if (errors.length > 0) {
        setError(`Saved ${saved} scores, but encountered errors: ${errors.join(', ')}`)
      } else {
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
        onScoresUpdated?.()
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save scores')
    } finally {
      setSaving(false)
    }
  }

  function getImpactColor(score: number): string {
    if (score >= 4) return 'from-green-400 to-emerald-500'
    if (score >= 3) return 'from-blue-400 to-indigo-500'
    if (score >= 2) return 'from-yellow-400 to-orange-500'
    return 'from-red-400 to-rose-500'
  }

  function getCompletionBadge(rate: number) {
    if (rate >= 0.9) return { label: 'Excellent', color: 'bg-green-100 text-green-700' }
    if (rate >= 0.7) return { label: 'Good', color: 'bg-blue-100 text-blue-700' }
    if (rate >= 0.5) return { label: 'Fair', color: 'bg-yellow-100 text-yellow-700' }
    return { label: 'Needs Work', color: 'bg-red-100 text-red-700' }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 mx-auto mb-4"
          >
            <Repeat className="w-12 h-12 text-phoenix-orange" />
          </motion.div>
          <p className="text-gray-600">Calculating ritual impact...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-red-200 p-6">
        <div className="flex items-start gap-3">
          <div className="text-red-500">⚠️</div>
          <div className="flex-1">
            <h3 className="font-semibold text-red-900">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
          <PhoenixButton size="sm" variant="secondary" onClick={fetchRitualImpact}>
            <RefreshCw className="w-4 h-4" />
          </PhoenixButton>
        </div>
      </div>
    )
  }

  if (!result || result.total_sessions === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <div className="text-center">
          <Repeat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">No Ritual Data</h3>
          <p className="text-gray-600 mb-4">
            Track rituals to see how they impact your fulfillment scores
          </p>
          <PhoenixButton size="sm">Log a Ritual</PhoenixButton>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="bg-gradient-to-br from-phoenix-red via-phoenix-orange to-phoenix-gold rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Ritual Impact</h2>
          <Repeat className="w-8 h-8 opacity-75" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-sm opacity-90">Overall Score</div>
            <div className="text-3xl font-bold">{result.overall_ritual_score.toFixed(1)}</div>
            <div className="text-xs opacity-75">/ 5.0</div>
          </div>
          <div>
            <div className="text-sm opacity-90">Sessions</div>
            <div className="text-3xl font-bold">{result.total_sessions}</div>
            <div className="text-xs opacity-75">this month</div>
          </div>
          <div>
            <div className="text-sm opacity-90">Rituals</div>
            <div className="text-3xl font-bold">{result.total_rituals_tracked}</div>
            <div className="text-xs opacity-75">tracked</div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {saveSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3"
        >
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <p className="text-sm text-green-800 font-medium">
            Scores updated successfully! Your fulfillment dashboard has been refreshed.
          </p>
        </motion.div>
      )}

      {/* Area Impacts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Impact by Area</h3>
          <PhoenixButton
            size="sm"
            onClick={handleSaveScores}
            disabled={saving}
          >
            {saving ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4 mr-2" />
                Update Scores
              </>
            )}
          </PhoenixButton>
        </div>

        <div className="space-y-3">
          {result.impacts.map((impact, index) => (
            <motion.div
              key={impact.area_id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl border border-gray-200 p-5"
            >
              {/* Area Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{impact.area_name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{impact.reasoning}</p>
                </div>
                <div className="ml-4 text-right">
                  <div className="text-3xl font-bold text-gray-900">
                    {impact.impact_score.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-500">impact</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(impact.impact_score / 5) * 100}%` }}
                    transition={{ duration: 1, delay: index * 0.05 }}
                    className={`h-full bg-gradient-to-r ${getImpactColor(impact.impact_score)}`}
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-3 text-center">
                <div>
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {Math.round(impact.completion_rate * 100)}%
                  </div>
                  <div className="text-xs text-gray-500">Completion</div>
                </div>

                <div>
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Star className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {impact.quality_average.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-500">Quality</div>
                </div>

                <div>
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    +{impact.consistency_bonus.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-500">Bonus</div>
                </div>

                <div>
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {impact.sessions_count}
                  </div>
                  <div className="text-xs text-gray-500">Sessions</div>
                </div>
              </div>

              {/* Completion Badge */}
              <div className="mt-3 flex items-center justify-center">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getCompletionBadge(impact.completion_rate).color}`}>
                  {getCompletionBadge(impact.completion_rate).label}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Info Footer */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <BarChart3 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">How Ritual Tracking Works</p>
            <p>
              Your ritual completion rates automatically influence fulfillment scores.
              High completion + quality + consistency = better scores!
              Click "Update Scores" to apply these impacts to your dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
