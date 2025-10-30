/**
 * LifeAreaCard Component
 *
 * Displays individual life area with score and status
 */

'use client'

import { useMemo } from 'react'
import Link from 'next/link'

interface LifeAreaCardProps {
  slug: string
  name: string
  description?: string
  score: number
  status: 'CRISIS' | 'STRUGGLING' | 'BALANCED' | 'THRIVING' | 'FLOURISHING'
  cluster?: string
}

export function LifeAreaCard({
  slug,
  name,
  description,
  score,
  status,
  cluster
}: LifeAreaCardProps) {
  const statusConfig = useMemo(() => {
    switch (status) {
      case 'CRISIS':
        return {
          color: '#DC2626',
          bgColor: '#FEE2E2',
          emoji: '🚨',
          label: 'Crisis'
        }
      case 'STRUGGLING':
        return {
          color: '#EA580C',
          bgColor: '#FFEDD5',
          emoji: '⚠️',
          label: 'Struggling'
        }
      case 'BALANCED':
        return {
          color: '#EAB308',
          bgColor: '#FEF9C3',
          emoji: '⚖️',
          label: 'Balanced'
        }
      case 'THRIVING':
        return {
          color: '#16A34A',
          bgColor: '#DCFCE7',
          emoji: '🌱',
          label: 'Thriving'
        }
      case 'FLOURISHING':
        return {
          color: '#059669',
          bgColor: '#D1FAE5',
          emoji: '✨',
          label: 'Flourishing'
        }
    }
  }, [status])

  return (
    <Link href={`/life-areas/${slug}`}>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900">{name}</h3>
            {cluster && (
              <p className="text-xs text-gray-500 mt-1">
                {cluster.replace(/_/g, ' ')}
              </p>
            )}
          </div>

          {/* Score Badge */}
          <div
            className="flex flex-col items-center justify-center w-16 h-16 rounded-full"
            style={{ backgroundColor: statusConfig.bgColor }}
          >
            <span
              className="text-xl font-bold"
              style={{ color: statusConfig.color }}
            >
              {Math.round(score)}
            </span>
            <span className="text-xs text-gray-600">/ 100</span>
          </div>
        </div>

        {/* Description */}
        {description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {description}
          </p>
        )}

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <span className="text-lg">{statusConfig.emoji}</span>
          <span
            className="text-sm font-medium"
            style={{ color: statusConfig.color }}
          >
            {statusConfig.label}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all duration-500"
            style={{
              width: `${score}%`,
              backgroundColor: statusConfig.color
            }}
          />
        </div>
      </div>
    </Link>
  )
}
