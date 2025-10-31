/**
 * FulfillmentDisplay Component
 *
 * Displays overall fulfillment score with visual representation
 */

'use client'

import { useMemo } from 'react'

interface FulfillmentDisplayProps {
  score: number
  size?: 'small' | 'medium' | 'large'
  showLabel?: boolean
}

export function FulfillmentDisplay({
  score,
  size = 'medium',
  showLabel = true
}: FulfillmentDisplayProps) {
  const status = useMemo(() => {
    if (score < 20) return { label: 'CRISIS', color: '#DC2626', emoji: '🚨' }
    if (score < 40) return { label: 'STRUGGLING', color: '#EA580C', emoji: '⚠️' }
    if (score < 70) return { label: 'BALANCED', color: '#EAB308', emoji: '⚖️' }
    if (score < 90) return { label: 'THRIVING', color: '#16A34A', emoji: '🌱' }
    return { label: 'FLOURISHING', color: '#059669', emoji: '✨' }
  }, [score])

  const sizeClasses = {
    small: 'w-16 h-16 text-xl',
    medium: 'w-32 h-32 text-4xl',
    large: 'w-48 h-48 text-6xl'
  }

  const circumference = 2 * Math.PI * 45 // radius = 45
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Circular Progress */}
      <div className={`relative ${sizeClasses[size]}`}>
        <svg
          className="transform -rotate-90"
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
        >
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={status.color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 1s ease-in-out'
            }}
          />
        </svg>

        {/* Center score */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold" style={{ color: status.color }}>
            {Math.round(score)}
          </span>
          <span className="text-xs text-gray-500">/ 100</span>
        </div>
      </div>

      {/* Label */}
      {showLabel && (
        <div className="text-center">
          <div className="flex items-center gap-2 justify-center">
            <span className="text-2xl">{status.emoji}</span>
            <span
              className="font-semibold text-lg"
              style={{ color: status.color }}
            >
              {status.label}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">Overall Fulfillment</p>
        </div>
      )}
    </div>
  )
}
