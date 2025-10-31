/**
 * Real-time Notification Component for Fulfillment Display v5
 *
 * Phoenix-themed toast notifications for real-time score updates
 * - Shows when scores update in real-time
 * - Displays what changed (area name, new score)
 * - Auto-dismisses after 3 seconds
 * - Smooth animations with Framer Motion
 */

'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, TrendingUp, TrendingDown, Sparkles } from 'lucide-react'
import { ScoreUpdatePayload } from '@/hooks/useRealtimeScores'

export interface RealtimeNotificationProps {
  update: ScoreUpdatePayload | null
  onDismiss?: () => void
  autoHideDuration?: number // milliseconds
}

/**
 * Real-time notification toast component
 *
 * @example
 * ```tsx
 * <RealtimeNotification
 *   update={lastUpdate}
 *   onDismiss={() => setLastUpdate(null)}
 *   autoHideDuration={3000}
 * />
 * ```
 */
export function RealtimeNotification({
  update,
  onDismiss,
  autoHideDuration = 3000,
}: RealtimeNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)

  // Show notification when update arrives
  useEffect(() => {
    if (update) {
      setIsVisible(true)

      // Auto-dismiss after duration
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => {
          onDismiss?.()
        }, 300) // Wait for exit animation
      }, autoHideDuration)

      return () => clearTimeout(timer)
    } else {
      setIsVisible(false)
    }
  }, [update, autoHideDuration, onDismiss])

  if (!update) return null

  // Determine if score improved, declined, or stayed the same
  const hasOldScore = update.old_score !== undefined
  const scoreDelta = hasOldScore ? update.score - update.old_score! : 0
  const isImprovement = scoreDelta > 0
  const isDecline = scoreDelta < 0
  const isNew = !hasOldScore

  // Get icon based on change type
  const getIcon = () => {
    if (isImprovement) return <TrendingUp className="w-5 h-5" />
    if (isDecline) return <TrendingDown className="w-5 h-5" />
    return <Sparkles className="w-5 h-5" />
  }

  // Get color classes based on change type
  const getColorClasses = () => {
    if (isImprovement) {
      return {
        bg: 'from-green-500 to-emerald-600',
        icon: 'text-green-100',
        text: 'text-white',
      }
    }
    if (isDecline) {
      return {
        bg: 'from-orange-500 to-red-600',
        icon: 'text-orange-100',
        text: 'text-white',
      }
    }
    return {
      bg: 'from-phoenix-orange to-phoenix-red',
      icon: 'text-phoenix-gold',
      text: 'text-white',
    }
  }

  const colors = getColorClasses()

  // Format the message
  const getMessage = () => {
    if (isNew) {
      return `New score: ${update.score.toFixed(1)}/5.0`
    }
    if (isImprovement) {
      return `Score improved: ${update.old_score?.toFixed(1)} → ${update.score.toFixed(1)}`
    }
    if (isDecline) {
      return `Score updated: ${update.old_score?.toFixed(1)} → ${update.score.toFixed(1)}`
    }
    return `Score: ${update.score.toFixed(1)}/5.0`
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="fixed top-4 right-4 z-50 max-w-md"
        >
          <div
            className={`
              bg-gradient-to-r ${colors.bg}
              rounded-xl shadow-2xl overflow-hidden
              backdrop-blur-lg
            `}
          >
            {/* Animated background shimmer */}
            <motion.div
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              style={{ backgroundSize: '200% 100%' }}
            />

            {/* Content */}
            <div className="relative p-4 flex items-start gap-3">
              {/* Icon */}
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: isImprovement ? 360 : 0 }}
                transition={{ duration: 0.5 }}
                className={`flex-shrink-0 ${colors.icon}`}
              >
                {getIcon()}
              </motion.div>

              {/* Text content */}
              <div className="flex-1 min-w-0">
                <h4 className={`font-semibold ${colors.text} text-sm mb-1`}>
                  {update.area_name || 'Area Updated'}
                </h4>
                <p className={`${colors.text} opacity-90 text-xs`}>
                  {getMessage()}
                </p>
                {update.source && update.source !== 'manual' && (
                  <p className={`${colors.text} opacity-70 text-xs mt-1`}>
                    Source: {update.source}
                  </p>
                )}
              </div>

              {/* Close button */}
              <button
                onClick={() => {
                  setIsVisible(false)
                  setTimeout(() => onDismiss?.(), 300)
                }}
                className={`
                  flex-shrink-0 ${colors.text} opacity-70 hover:opacity-100
                  transition-opacity
                `}
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Progress bar */}
            <motion.div
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: autoHideDuration / 1000, ease: 'linear' }}
              className="h-1 bg-white/30 origin-left"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * Container component to manage multiple notifications
 */
export interface RealtimeNotificationsContainerProps {
  updates: ScoreUpdatePayload[]
  onDismiss: (index: number) => void
  autoHideDuration?: number
}

export function RealtimeNotificationsContainer({
  updates,
  onDismiss,
  autoHideDuration = 3000,
}: RealtimeNotificationsContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      <AnimatePresence>
        {updates.map((update, index) => (
          <motion.div
            key={`${update.area_id}-${update.timestamp}`}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <RealtimeNotification
              update={update}
              onDismiss={() => onDismiss(index)}
              autoHideDuration={autoHideDuration}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default RealtimeNotification
