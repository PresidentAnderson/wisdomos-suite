'use client'

/**
 * Emotion Customization Panel
 *
 * Allows users to:
 * - Enable/disable emotions they relate to
 * - See recently felt emotions (last 30 days)
 * - Browse all 60+ emotions by category
 * - Configure which emotions appear in journal entry UI
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart,
  Eye,
  EyeOff,
  Search,
  Filter,
  TrendingUp,
  Calendar,
  Save,
  RotateCcw,
  Sparkles
} from 'lucide-react'
import PhoenixButton from '@/components/ui/PhoenixButton'
import {
  COMPREHENSIVE_EMOTIONS,
  EMOTION_CATEGORIES,
  type Emotion,
  type EmotionCategory,
  getEmotionsByCategory,
  getDefaultEmotions
} from '@/lib/emotion-library'
import { supabase } from '@/lib/supabase'

interface EmotionUsageStats {
  emotion_id: string
  count: number
  last_used: string
}

interface EmotionCustomizationPanelProps {
  userId: string
  onSave?: (enabledEmotionIds: string[]) => void
}

export default function EmotionCustomizationPanel({
  userId,
  onSave
}: EmotionCustomizationPanelProps) {
  const [enabledEmotions, setEnabledEmotions] = useState<Set<string>>(new Set())
  const [recentlyFelt, setRecentlyFelt] = useState<EmotionUsageStats[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<EmotionCategory | 'all' | 'recent'>('all')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadUserEmotionSettings()
    loadRecentEmotions()
  }, [userId])

  async function loadUserEmotionSettings() {
    setLoading(true)

    try {
      // Fetch user's enabled emotions
      const { data, error } = await supabase
        .from('user_emotion_settings')
        .select('enabled_emotion_ids')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading settings:', error)
      }

      if (data?.enabled_emotion_ids) {
        setEnabledEmotions(new Set(data.enabled_emotion_ids))
      } else {
        // Default to default emotions
        const defaults = getDefaultEmotions().map(e => e.id)
        setEnabledEmotions(new Set(defaults))
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  async function loadRecentEmotions() {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    try {
      // Fetch emotion usage from journal entries
      const { data, error } = await supabase
        .from('fd_entry_emotions')
        .select('emotion_id, created_at')
        .eq('user_id', userId)
        .gte('created_at', thirtyDaysAgo.toISOString())

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading recent emotions:', error)
        return
      }

      if (!data) return

      // Count usage per emotion
      const usageMap = new Map<string, { count: number; lastUsed: string }>()

      data.forEach(entry => {
        const existing = usageMap.get(entry.emotion_id) || { count: 0, lastUsed: entry.created_at }
        usageMap.set(entry.emotion_id, {
          count: existing.count + 1,
          lastUsed: entry.created_at > existing.lastUsed ? entry.created_at : existing.lastUsed
        })
      })

      // Convert to array and sort by count
      const stats: EmotionUsageStats[] = Array.from(usageMap.entries()).map(([id, data]) => ({
        emotion_id: id,
        count: data.count,
        last_used: data.lastUsed
      })).sort((a, b) => b.count - a.count)

      setRecentlyFelt(stats)
    } catch (err) {
      console.error('Error loading recent emotions:', err)
    }
  }

  async function handleSave() {
    setSaving(true)

    try {
      const enabledArray = Array.from(enabledEmotions)

      // Upsert user settings
      const { error } = await supabase
        .from('user_emotion_settings')
        .upsert({
          user_id: userId,
          enabled_emotion_ids: enabledArray,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      onSave?.(enabledArray)
    } catch (err: any) {
      console.error('Error saving:', err)
      alert('Failed to save emotion settings')
    } finally {
      setSaving(false)
    }
  }

  function toggleEmotion(emotionId: string) {
    const newSet = new Set(enabledEmotions)
    if (newSet.has(emotionId)) {
      newSet.delete(emotionId)
    } else {
      newSet.add(emotionId)
    }
    setEnabledEmotions(newSet)
  }

  function enableCategory(category: EmotionCategory) {
    const categoryEmotions = getEmotionsByCategory(category)
    const newSet = new Set(enabledEmotions)
    categoryEmotions.forEach(e => newSet.add(e.id))
    setEnabledEmotions(newSet)
  }

  function disableCategory(category: EmotionCategory) {
    const categoryEmotions = getEmotionsByCategory(category)
    const newSet = new Set(enabledEmotions)
    categoryEmotions.forEach(e => newSet.delete(e.id))
    setEnabledEmotions(newSet)
  }

  function resetToDefaults() {
    const defaults = getDefaultEmotions().map(e => e.id)
    setEnabledEmotions(new Set(defaults))
  }

  function getFilteredEmotions(): Emotion[] {
    let emotions = COMPREHENSIVE_EMOTIONS

    // Filter by category
    if (selectedCategory !== 'all' && selectedCategory !== 'recent') {
      emotions = getEmotionsByCategory(selectedCategory)
    } else if (selectedCategory === 'recent') {
      const recentIds = new Set(recentlyFelt.map(r => r.emotion_id))
      emotions = emotions.filter(e => recentIds.has(e.id))
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      emotions = emotions.filter(e =>
        e.name.toLowerCase().includes(query) ||
        e.description.toLowerCase().includes(query)
      )
    }

    return emotions
  }

  function getUsageCount(emotionId: string): number {
    return recentlyFelt.find(r => r.emotion_id === emotionId)?.count || 0
  }

  const filteredEmotions = getFilteredEmotions()

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 mx-auto mb-4"
          >
            <Heart className="w-12 h-12 text-phoenix-orange" />
          </motion.div>
          <p className="text-gray-600">Loading emotions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-phoenix-red via-phoenix-orange to-phoenix-gold rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Customize Your Emotions</h2>
          <Heart className="w-8 h-8 opacity-75" />
        </div>
        <p className="text-sm opacity-90 mb-4">
          Select which emotions you relate to. These will appear in your journal entry UI,
          sorted by frequency after a week of use.
        </p>
        <div className="flex items-center gap-4 text-sm">
          <div>
            <span className="font-semibold">{enabledEmotions.size}</span> enabled
          </div>
          <div>
            <span className="font-semibold">{recentlyFelt.length}</span> felt recently
          </div>
          <div>
            <span className="font-semibold">{COMPREHENSIVE_EMOTIONS.length}</span> total
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search emotions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-phoenix-orange focus:border-transparent"
          />
        </div>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-phoenix-orange focus:border-transparent"
        >
          <option value="all">All Categories</option>
          <option value="recent">Recently Felt (30 days)</option>
          {Object.entries(EMOTION_CATEGORIES).map(([key, cat]) => (
            <option key={key} value={key}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Recently Felt Section */}
      {selectedCategory === 'recent' && recentlyFelt.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Your Recent Emotions (Last 30 Days)</h3>
          </div>
          <p className="text-sm text-blue-700 mb-4">
            These emotions appeared in your journal entries. The most frequently felt are shown first.
          </p>
        </div>
      )}

      {/* Emotions Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {filteredEmotions.map((emotion, index) => {
          const isEnabled = enabledEmotions.has(emotion.id)
          const usageCount = getUsageCount(emotion.id)
          const wasRecentlyFelt = usageCount > 0

          return (
            <motion.button
              key={emotion.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.02 }}
              onClick={() => toggleEmotion(emotion.id)}
              className={`relative p-4 rounded-xl border-2 transition-all ${
                isEnabled
                  ? 'border-phoenix-orange bg-phoenix-gold/10'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {/* Enabled Indicator */}
              {isEnabled && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-phoenix-orange rounded-full flex items-center justify-center">
                  <Eye className="w-3 h-3 text-white" />
                </div>
              )}

              {/* Usage Badge */}
              {wasRecentlyFelt && (
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                  {usageCount}×
                </div>
              )}

              {/* Emotion Display */}
              <div className="text-center">
                <div className="text-4xl mb-2">{emotion.emoji}</div>
                <div className="text-sm font-semibold text-gray-900">{emotion.name}</div>
                <div className="text-xs text-gray-500 mt-1">{emotion.category}</div>
              </div>

              {/* Intensity Indicator */}
              <div className="mt-2 flex justify-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full ${
                      i < emotion.intensity ? 'bg-phoenix-orange' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </motion.button>
          )
        })}
      </div>

      {filteredEmotions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No emotions found matching your filters</p>
        </div>
      )}

      {/* Category Quick Actions */}
      {selectedCategory !== 'all' && selectedCategory !== 'recent' && (
        <div className="flex items-center justify-center gap-3">
          <PhoenixButton
            size="sm"
            variant="secondary"
            onClick={() => enableCategory(selectedCategory as EmotionCategory)}
          >
            Enable All {EMOTION_CATEGORIES[selectedCategory as EmotionCategory].name}
          </PhoenixButton>
          <PhoenixButton
            size="sm"
            variant="secondary"
            onClick={() => disableCategory(selectedCategory as EmotionCategory)}
          >
            Disable All
          </PhoenixButton>
        </div>
      )}

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
              Save Emotion Preferences
            </>
          )}
        </PhoenixButton>
        <PhoenixButton
          onClick={resetToDefaults}
          variant="secondary"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset to Defaults
        </PhoenixButton>
      </div>

      {/* Info */}
      <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
        <p className="font-medium mb-2">How This Works:</p>
        <ul className="space-y-1 list-disc list-inside">
          <li>Enabled emotions appear in your journal entry UI</li>
          <li>After a week of use, they'll be sorted by frequency (most used first)</li>
          <li>You can always come back to adjust your selection</li>
          <li>Blue badges show how many times you've used each emotion in the last 30 days</li>
        </ul>
      </div>
    </div>
  )
}
