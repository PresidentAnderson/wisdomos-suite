'use client'

/**
 * Custom Weights Editor
 *
 * Allows users to customize the importance (weight) of each life area
 * for personalized Global Fulfillment Score calculation.
 */

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Save,
  RotateCcw,
  Info,
  TrendingUp,
  Sparkles
} from 'lucide-react'
import PhoenixButton from '@/components/ui/PhoenixButton'
import { supabase } from '@/lib/supabase'

interface Area {
  id: string
  code: string
  name: string
  emoji: string
  weight_default: number
}

interface AreaWeight {
  area_id: string
  weight: number
}

interface CustomWeightsEditorProps {
  userId: string
  tenantId?: string
  onSave?: (weights: AreaWeight[]) => void
}

export default function CustomWeightsEditor({
  userId,
  tenantId = 'default-tenant',
  onSave
}: CustomWeightsEditorProps) {
  const [areas, setAreas] = useState<Area[]>([])
  const [weights, setWeights] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewGFS, setPreviewGFS] = useState<number | null>(null)

  useEffect(() => {
    fetchAreasAndWeights()
  }, [userId])

  useEffect(() => {
    calculatePreviewGFS()
  }, [weights])

  async function fetchAreasAndWeights() {
    setLoading(true)
    setError(null)

    try {
      // Fetch all active areas
      const { data: areasData, error: areasError } = await supabase
        .from('fd_areas')
        .select('*')
        .eq('is_active', true)
        .order('code')

      if (areasError) throw areasError
      setAreas(areasData || [])

      // Fetch custom weights for user
      const { data: customWeights, error: weightsError } = await supabase
        .from('fd_user_weights')
        .select('*')
        .eq('user_id', userId)
        .eq('tenant_id', tenantId)

      if (weightsError && weightsError.code !== 'PGRST116') {
        console.warn('No custom weights found, using defaults')
      }

      // Build weights map
      const weightsMap: Record<string, number> = {}
      areasData?.forEach(area => {
        const customWeight = customWeights?.find(w => w.area_id === area.id)
        weightsMap[area.id] = customWeight?.weight || area.weight_default
      })

      setWeights(weightsMap)
    } catch (err: any) {
      setError(err.message || 'Failed to load weights')
    } finally {
      setLoading(false)
    }
  }

  async function calculatePreviewGFS() {
    // Fetch recent scores
    const { data: scores } = await supabase
      .from('fd_score_raw')
      .select('area_id, score')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100)

    if (!scores || scores.length === 0) {
      setPreviewGFS(null)
      return
    }

    // Group by area and calculate average
    const areaScores = new Map<string, number[]>()
    scores.forEach(s => {
      const existing = areaScores.get(s.area_id) || []
      areaScores.set(s.area_id, [...existing, s.score])
    })

    const avgScores = new Map<string, number>()
    areaScores.forEach((scores, areaId) => {
      const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length
      avgScores.set(areaId, avg)
    })

    // Calculate GFS with custom weights
    let totalWeight = 0
    let weightedSum = 0

    avgScores.forEach((score, areaId) => {
      const weight = weights[areaId] || 1.0
      totalWeight += weight
      weightedSum += score * weight
    })

    const gfs = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 20) : 0
    setPreviewGFS(gfs)
  }

  async function handleSave() {
    setSaving(true)
    setError(null)

    try {
      // Delete existing custom weights
      await supabase
        .from('fd_user_weights')
        .delete()
        .eq('user_id', userId)
        .eq('tenant_id', tenantId)

      // Insert new custom weights (only non-default)
      const customWeights = areas
        .filter(area => weights[area.id] !== area.weight_default)
        .map(area => ({
          user_id: userId,
          tenant_id: tenantId,
          area_id: area.id,
          weight: weights[area.id]
        }))

      if (customWeights.length > 0) {
        const { error: insertError } = await supabase
          .from('fd_user_weights')
          .insert(customWeights)

        if (insertError) throw insertError
      }

      // Callback
      if (onSave) {
        const weightData = areas.map(area => ({
          area_id: area.id,
          weight: weights[area.id]
        }))
        onSave(weightData)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save weights')
    } finally {
      setSaving(false)
    }
  }

  function handleReset() {
    const defaultWeights: Record<string, number> = {}
    areas.forEach(area => {
      defaultWeights[area.id] = area.weight_default
    })
    setWeights(defaultWeights)
  }

  function updateWeight(areaId: string, weight: number) {
    setWeights(prev => ({ ...prev, [areaId]: weight }))
  }

  function getTotalWeight(): number {
    return Object.values(weights).reduce((sum, w) => sum + w, 0)
  }

  function getWeightPercentage(weight: number): number {
    const total = getTotalWeight()
    return total > 0 ? (weight / total) * 100 : 0
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
            <Sparkles className="w-12 h-12 text-phoenix-orange" />
          </motion.div>
          <p className="text-gray-600">Loading weights...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-phoenix-red via-phoenix-orange to-phoenix-gold rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Customize Area Weights</h2>
          <TrendingUp className="w-8 h-8 opacity-75" />
        </div>
        <p className="text-sm opacity-90">
          Adjust the importance of each life area to personalize your Global Fulfillment Score calculation
        </p>
        {previewGFS !== null && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="text-sm opacity-90">Preview GFS with these weights:</div>
            <div className="text-4xl font-bold">{previewGFS}/100</div>
          </div>
        )}
      </div>

      {/* Info Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">How Weights Work</p>
            <p>
              Higher weights make an area more influential on your overall score.
              For example, if "Work" has weight 2.0 and "Music" has weight 0.5,
              Work will have 4× the impact on your GFS.
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Weights Editor */}
      <div className="space-y-3">
        {areas.map((area, index) => (
          <motion.div
            key={area.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
            className="bg-white rounded-xl border border-gray-200 p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{area.emoji}</span>
                <div>
                  <h3 className="font-semibold text-gray-900">{area.name}</h3>
                  <p className="text-xs text-gray-500">
                    {getWeightPercentage(weights[area.id] || 1).toFixed(0)}% of total
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {(weights[area.id] || 1).toFixed(1)}
                </div>
                {weights[area.id] !== area.weight_default && (
                  <span className="text-xs text-phoenix-orange">Custom</span>
                )}
              </div>
            </div>

            {/* Slider */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 w-8">0</span>
              <input
                type="range"
                min="0"
                max="3"
                step="0.1"
                value={weights[area.id] || 1}
                onChange={(e) => updateWeight(area.id, parseFloat(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm text-gray-500 w-8">3.0</span>
            </div>

            {/* Presets */}
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-gray-500">Presets:</span>
              <button
                onClick={() => updateWeight(area.id, 0.5)}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                Low (0.5)
              </button>
              <button
                onClick={() => updateWeight(area.id, 1.0)}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                Normal (1.0)
              </button>
              <button
                onClick={() => updateWeight(area.id, 1.5)}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                High (1.5)
              </button>
              <button
                onClick={() => updateWeight(area.id, 2.0)}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                Critical (2.0)
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Actions */}
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
              <Save className="w-4 h-4 mr-2" />
              Save Custom Weights
            </>
          )}
        </PhoenixButton>
        <PhoenixButton
          onClick={handleReset}
          variant="secondary"
          className="flex-1"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset to Defaults
        </PhoenixButton>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-xl p-4 text-center">
        <p className="text-sm text-gray-600">
          Total Weight: <span className="font-semibold">{getTotalWeight().toFixed(1)}</span>
          {' • '}
          {areas.filter(a => weights[a.id] !== a.weight_default).length} custom weights
        </p>
      </div>
    </div>
  )
}
