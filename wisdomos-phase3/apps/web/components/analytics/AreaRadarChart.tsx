'use client'

/**
 * Area Radar Chart Component
 *
 * Radial/spider chart showing current area distribution
 * Uses Recharts library with Phoenix-themed styling
 */

import React from 'react'
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts'
import type { AnalyticsAreaScore } from '@/lib/fulfillment-analytics'

interface AreaRadarChartProps {
  areaScores: AnalyticsAreaScore[]
  height?: number
  showComparison?: boolean
}

export default function AreaRadarChart({
  areaScores,
  height = 400,
  showComparison = false
}: AreaRadarChartProps) {
  // Prepare data for radar chart
  const chartData = areaScores.map(as => ({
    area: `${as.area.emoji} ${as.area.code}`,
    fullName: as.area.name,
    current: parseFloat(as.currentScore.toFixed(2)),
    lastMonth: as.lastMonthScore ? parseFloat(as.lastMonthScore.toFixed(2)) : null,
  }))

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white border border-phoenix-gold/20 rounded-lg shadow-xl p-3">
          <p className="text-sm font-semibold text-gray-900 mb-1">
            {data.fullName}
          </p>
          <p className="text-lg font-bold text-phoenix-orange">
            Current: {data.current.toFixed(2)}
          </p>
          {showComparison && data.lastMonth !== null && (
            <p className="text-sm text-gray-600 mt-1">
              Last Month: {data.lastMonth.toFixed(2)}
            </p>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={chartData}>
        <PolarGrid stroke="#E5E7EB" />
        <PolarAngleAxis
          dataKey="area"
          tick={{ fill: '#6B7280', fontSize: 11 }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 5]}
          tick={{ fill: '#6B7280', fontSize: 10 }}
        />
        <Tooltip content={<CustomTooltip />} />

        {/* Current scores */}
        <Radar
          name="Current Score"
          dataKey="current"
          stroke="#F59E0B"
          fill="#F59E0B"
          fillOpacity={0.6}
        />

        {/* Last month comparison */}
        {showComparison && (
          <Radar
            name="Last Month"
            dataKey="lastMonth"
            stroke="#EF4444"
            fill="#EF4444"
            fillOpacity={0.3}
          />
        )}

        <Legend
          wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
