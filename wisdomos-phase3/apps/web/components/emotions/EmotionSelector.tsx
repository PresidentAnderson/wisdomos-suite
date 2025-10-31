'use client'

/**
 * Emotion Selector for Journal Entries
 *
 * Shows user's enabled emotions at the top of journal entry UI
 * After 1 week of use, sorts by frequency (most used first)
 * Allows quick selection of current emotions
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, TrendingUp, X } from 'lucide-react'
import Link from 'next/link'
import {
  COMPREHENSIVE_EMOTIONS,
  getEmotionById,
  type Emotion
} from '@/lib/emotion-library'
import { supabase } from '@/lib/supabase'

interface EmotionUsage {
  emotion_id: string
  count: number
  lastUsed: string
}

interface EmotionSelectorProps {
  userId: string
  selectedEmotionIds: string[]
  onSelectionChange: (emotionIds: string[]) => void
  maxSelections?: number
  showFrequency?: boolean
}

export default function EmotionSelector({
  userId,
  selectedEmotionIds,
  onSelectionChange,
  maxSelections = 5,
  showFrequency = true
}: EmotionSelectorProps) {
  const [enabledEmotions, setEnabledEmotions] = useState<Emotion[]>([])
  const [usageStats, setUsageStats] = useState<Map<string, number>>(new Map())
  const [hasWeekOfData, setHasWeekOfData] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEmotionData()
  }, [userId])

  async function loadEmotionData() {
    setLoading(true)

    try {
      // 1. Fetch user's enabled emotions
      const { data: settings } = await supabase
        .from('user_emotion_settings')
        .select('enabled_emotion_ids, created_at')
        .eq('user_id', userId)
        .single()

      const enabledIds = settings?.enabled_emotion_ids ||
        COMPREHENSIVE_EMOTIONS.filter(e => e.is_default).map(e => e.id)

      // 2. Fetch usage statistics
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const { data: usageData } = await supabase
        .from('fd_entry_emotions')
        .select('emotion_id, created_at')
        .eq('user_id', userId)
        .gte('created_at', sevenDaysAgo.toISOString())

      // Calculate usage counts
      const usageMap = new Map<string, number>()
      usageData?.forEach(entry => {
        const count = usageMap.get(entry.emotion_id) || 0
        usageMap.set(entry.emotion_id, count + 1)
      })

      setUsageStats(usageMap)

      // Check if we have at least 1 week of data
      const settingsAge = settings?.created_at
        ? (new Date().getTime() - new Date(settings.created_at).getTime()) / (1000 * 60 * 60 * 24)
        : 0
      const hasWeek = settingsAge >= 7 || (usageData && usageData.length >= 10)
      setHasWeekOfData(hasWeek)

      // 3. Build emotion list
      const emotions = enabledIds
        .map(id => getEmotionById(id))
        .filter((e): e is Emotion => e !== undefined)

      // 4. Sort by frequency if we have enough data
      if (hasWeek && usageMap.size > 0) {
        emotions.sort((a, b) => {
          const countA = usageMap.get(a.id) || 0
          const countB = usageMap.get(b.id) || 0
          if (countA !== countB) return countB - countA // Most used first
          return a.name.localeCompare(b.name) // Alphabetical as tiebreaker
        })
      } else {
        // Default sort by category and name
        emotions.sort((a, b) => {
          if (a.category !== b.category) {
            return a.category.localeCompare(b.category)
          }
          return a.name.localeCompare(b.name)
        })
      }

      setEnabledEmotions(emotions)
    } catch (err) {
      console.error('Error loading emotion data:', err)
    } finally {
      setLoading(false)
    }
  }

  function toggleEmotion(emotionId: string) {
    if (selectedEmotionIds.includes(emotionId)) {
      // Remove
      onSelectionChange(selectedEmotionIds.filter(id => id !== emotionId))
    } else {
      // Add (if under max)
      if (selectedEmotionIds.length < maxSelections) {
        onSelectionChange([...selectedEmotionIds, emotionId])
      }
    }
  }

  function getUsageCount(emotionId: string): number {
    return usageStats.get(emotionId) || 0
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-gray-200 rounded-xl"></div>
      </div>
    )
  }

  if (enabledEmotions.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
        <p className="text-gray-600 mb-3">
          No emotions configured yet
        </p>
        <Link href="/settings/emotions">
          <button className="text-phoenix-orange hover:text-phoenix-red text-sm font-medium">
            <Settings className="w-4 h-4 inline mr-1" />
            Customize Emotions
          </button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">How are you feeling?</h3>
          <p className="text-sm text-gray-500">
            Select up to {maxSelections} emotions
            {hasWeekOfData && showFrequency && (
              <span className="ml-1 text-phoenix-orange">
                (sorted by your usage)
              </span>
            )}
          </p>
        </div>
        <Link href="/settings/emotions">
          <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-phoenix-orange transition-colors">
            <Settings className="w-4 h-4" />
            Customize
          </button>
        </Link>
      </div>

      {/* Emotion Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
        {enabledEmotions.map((emotion, index) => {
          const isSelected = selectedEmotionIds.includes(emotion.id)
          const usageCount = getUsageCount(emotion.id)
          const showCount = hasWeekOfData && showFrequency && usageCount > 0

          return (
            <motion.button
              key={emotion.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.02 }}
              onClick={() => toggleEmotion(emotion.id)}
              disabled={!isSelected && selectedEmotionIds.length >= maxSelections}
              className={`relative p-3 rounded-xl border-2 transition-all ${
                isSelected
                  ? 'border-phoenix-orange bg-phoenix-gold/20 scale-105'
                  : 'border-gray-200 bg-white hover:border-phoenix-orange/50 hover:scale-105'
              } ${
                !isSelected && selectedEmotionIds.length >= maxSelections
                  ? 'opacity-50 cursor-not-allowed'
                  : 'cursor-pointer'
              }`}
              title={emotion.description}
            >
              {/* Selected Indicator */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-phoenix-orange rounded-full flex items-center justify-center shadow-lg"
                  >
                    <X className="w-3 h-3 text-white" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Usage Count Badge */}
              {showCount && (
                <div className="absolute -top-1 -left-1 px-1.5 py-0.5 bg-blue-500 text-white text-xs rounded-full font-semibold">
                  {usageCount}
                </div>
              )}

              {/* Emotion */}
              <div className="text-center">
                <div className="text-3xl mb-1">{emotion.emoji}</div>
                <div className="text-xs font-medium text-gray-900 truncate">
                  {emotion.name}
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Selected Count */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div>
          {selectedEmotionIds.length > 0 ? (
            <span>
              {selectedEmotionIds.length} of {maxSelections} selected
            </span>
          ) : (
            <span>Tap emotions to select</span>
          )}
        </div>
        {selectedEmotionIds.length > 0 && (
          <button
            onClick={() => onSelectionChange([])}
            className="text-phoenix-orange hover:text-phoenix-red font-medium"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Selected Emotions Display */}
      {selectedEmotionIds.length > 0 && (
        <div className="bg-phoenix-gold/10 border border-phoenix-gold/20 rounded-xl p-4">
          <div className="flex items-center flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-700">Feeling:</span>
            {selectedEmotionIds.map(id => {
              const emotion = getEmotionById(id)
              if (!emotion) return null
              return (
                <motion.span
                  key={id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-phoenix-orange rounded-full text-sm"
                >
                  <span>{emotion.emoji}</span>
                  <span className="font-medium">{emotion.name}</span>
                  <button
                    onClick={() => toggleEmotion(id)}
                    className="ml-1 hover:bg-gray-100 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.span>
              )
            })}
          </div>
        </div>
      )}

      {/* First Week Notice */}
      {!hasWeekOfData && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
          <TrendingUp className="w-4 h-4 inline mr-2" />
          After a week of use, emotions will be sorted by frequency to show your most-used emotions first!
        </div>
      )}
    </div>
  )
}
