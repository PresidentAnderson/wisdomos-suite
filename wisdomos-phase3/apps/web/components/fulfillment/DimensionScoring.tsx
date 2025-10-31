'use client'

/**
 * Dimension-Level Scoring Component
 *
 * Allows users to score individual dimensions within a life area
 * for more granular tracking and insights.
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronDown, ChevronUp, Sparkles } from 'lucide-react'
import PhoenixButton from '@/components/ui/PhoenixButton'

interface Dimension {
  id: string
  code: string
  name: string
  description: string | null
  weight_default: number
  is_active: boolean
}

interface DimensionScore {
  dimension_id: string
  score: number
  confidence: number
}

interface DimensionScoringProps {
  areaId: string
  areaName: string
  dimensions: Dimension[]
  existingScores?: DimensionScore[]
  onSave: (scores: DimensionScore[]) => Promise<void>
  onCancel: () => void
}

export default function DimensionScoring({
  areaId,
  areaName,
  dimensions,
  existingScores = [],
  onSave,
  onCancel
}: DimensionScoringProps) {
  const [scores, setScores] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {}
    existingScores.forEach(es => {
      initial[es.dimension_id] = es.score
    })
    // Default to 3.0 for unscored dimensions
    dimensions.forEach(dim => {
      if (!(dim.id in initial)) {
        initial[dim.id] = 3.0
      }
    })
    return initial
  })

  const [expandedDimensions, setExpandedDimensions] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)

  const toggleExpanded = (dimensionId: string) => {
    const newExpanded = new Set(expandedDimensions)
    if (newExpanded.has(dimensionId)) {
      newExpanded.delete(dimensionId)
    } else {
      newExpanded.add(dimensionId)
    }
    setExpandedDimensions(newExpanded)
  }

  const updateScore = (dimensionId: string, score: number) => {
    setScores(prev => ({ ...prev, [dimensionId]: score }))
  }

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'from-green-400 to-emerald-500'
    if (score >= 2.5) return 'from-yellow-400 to-orange-500'
    return 'from-red-400 to-rose-500'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 4.5) return 'Excellent'
    if (score >= 3.5) return 'Healthy'
    if (score >= 2.0) return 'Friction'
    return 'Critical'
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const dimensionScores: DimensionScore[] = Object.entries(scores).map(([dimId, score]) => ({
        dimension_id: dimId,
        score,
        confidence: 1.0 // Manual entry has high confidence
      }))
      await onSave(dimensionScores)
    } finally {
      setSaving(false)
    }
  }

  const calculateAreaScore = () => {
    const totalWeight = dimensions.reduce((sum, dim) => sum + dim.weight_default, 0)
    const weightedScore = dimensions.reduce((sum, dim) => {
      return sum + (scores[dim.id] || 0) * dim.weight_default
    }, 0)
    return totalWeight > 0 ? weightedScore / totalWeight : 0
  }

  const areaScore = calculateAreaScore()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Score Dimensions for {areaName}
        </h2>
        <p className="text-gray-600">
          Rate each dimension individually for more accurate tracking
        </p>
      </div>

      {/* Calculated Area Score Preview */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-br ${getScoreColor(areaScore)} rounded-2xl p-6 text-white`}
      >
        <div className="text-center">
          <div className="text-sm opacity-90 mb-1">Calculated Area Score</div>
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-5xl font-bold">{areaScore.toFixed(1)}</span>
            <span className="text-2xl opacity-75">/5.0</span>
          </div>
          <div className="text-sm opacity-90 mt-1">{getScoreLabel(areaScore)}</div>
          <div className="text-xs opacity-75 mt-2">
            Based on {dimensions.length} dimensions
          </div>
        </div>
      </motion.div>

      {/* Dimensions List */}
      <div className="space-y-3">
        {dimensions.map((dimension, index) => (
          <motion.div
            key={dimension.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden"
          >
            {/* Dimension Header */}
            <button
              onClick={() => toggleExpanded(dimension.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1 text-left">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{dimension.name}</h3>
                    <p className="text-sm text-gray-500">{dimension.code}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right mr-2">
                      <div className="text-2xl font-bold text-gray-900">
                        {scores[dimension.id]?.toFixed(1) || '3.0'}
                      </div>
                      <div className="text-xs text-gray-500">Weight: {dimension.weight_default}</div>
                    </div>
                    <div className={`w-16 h-2 bg-gradient-to-r ${getScoreColor(scores[dimension.id] || 3)} rounded-full`} />
                  </div>
                </div>
              </div>
              <div className="ml-4">
                {expandedDimensions.has(dimension.id) ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </button>

            {/* Dimension Scoring (Expanded) */}
            <AnimatePresence>
              {expandedDimensions.has(dimension.id) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-gray-200"
                >
                  <div className="p-4 bg-gray-50">
                    {dimension.description && (
                      <p className="text-sm text-gray-600 mb-4">{dimension.description}</p>
                    )}

                    {/* Score Slider */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rate this dimension (0-5)
                      </label>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min="0"
                          max="5"
                          step="0.1"
                          value={scores[dimension.id] || 3}
                          onChange={(e) => updateScore(dimension.id, parseFloat(e.target.value))}
                          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="text-3xl font-bold text-gray-900 w-16 text-center">
                          {scores[dimension.id]?.toFixed(1) || '3.0'}
                        </div>
                      </div>
                    </div>

                    {/* Score Labels */}
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>0: Critical</span>
                      <span>2.5: Friction</span>
                      <span>3.5: Healthy</span>
                      <span>5: Excellent</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Quick Expand All */}
      <div className="text-center">
        <button
          onClick={() => {
            if (expandedDimensions.size === dimensions.length) {
              setExpandedDimensions(new Set())
            } else {
              setExpandedDimensions(new Set(dimensions.map(d => d.id)))
            }
          }}
          className="text-sm text-phoenix-orange hover:text-phoenix-red transition-colors"
        >
          {expandedDimensions.size === dimensions.length ? 'Collapse All' : 'Expand All'}
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
        <PhoenixButton
          onClick={handleSave}
          disabled={saving}
          className="flex-1"
        >
          {saving ? (
            <>
              <Sparkles className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="w-4 h-4 mr-2" />
              Save All Dimensions
            </>
          )}
        </PhoenixButton>
        <PhoenixButton
          onClick={onCancel}
          variant="secondary"
          disabled={saving}
          className="flex-1"
        >
          Cancel
        </PhoenixButton>
      </div>

      {/* Info */}
      <div className="text-center text-sm text-gray-500">
        <p>Your area score will be calculated as a weighted average of all dimensions</p>
      </div>
    </div>
  )
}
