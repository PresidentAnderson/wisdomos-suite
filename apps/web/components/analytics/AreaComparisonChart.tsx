'use client'

/**
 * Area Comparison Chart Component
 *
 * Bar chart comparing current scores vs last month vs last year
 * Uses Recharts library with Phoenix-themed styling
 */

import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell
} from 'recharts'
import type { AnalyticsAreaScore } from '@/lib/fulfillment-analytics'

interface AreaComparisonChartProps {
  areaScores: AnalyticsAreaScore[]
  height?: number
  comparisonType?: 'mom' | 'yoy' | 'both'
}

export default function AreaComparisonChart({
  areaScores,
  height = 400,
  comparisonType = 'mom'
}: AreaComparisonChartProps) {
  // Prepare data for chart
  const chartData = areaScores.map(as => ({
    name: `${as.area.emoji} ${as.area.code}`,
    fullName: as.area.name,
    current: parseFloat(as.currentScore.toFixed(2)),
    lastMonth: as.lastMonthScore ? parseFloat(as.lastMonthScore.toFixed(2)) : null,
    lastYear: as.lastYearScore ? parseFloat(as.lastYearScore.toFixed(2)) : null,
    trend: as.trend
  }))

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white border border-phoenix-gold/20 rounded-lg shadow-xl p-3">
          <p className="text-sm font-semibold text-gray-900 mb-2">
            {data.fullName}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-3 mb-1">
              <span className="text-xs text-gray-600" style={{ color: entry.color }}>
                {entry.name}:
              </span>
              <span className="text-sm font-bold" style={{ color: entry.color }}>
                {entry.value?.toFixed(2) || 'N/A'}
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis
          dataKey="name"
          stroke="#6B7280"
          style={{ fontSize: '11px' }}
          tick={{ fill: '#6B7280' }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis
          domain={[0, 5]}
          stroke="#6B7280"
          style={{ fontSize: '12px' }}
          tick={{ fill: '#6B7280' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
        />

        {/* Current score */}
        <Bar
          dataKey="current"
          name="Current"
          fill="#F59E0B"
          radius={[8, 8, 0, 0]}
        />

        {/* Last month comparison */}
        {(comparisonType === 'mom' || comparisonType === 'both') && (
          <Bar
            dataKey="lastMonth"
            name="Last Month"
            fill="#EF4444"
            radius={[8, 8, 0, 0]}
          />
        )}

        {/* Last year comparison */}
        {(comparisonType === 'yoy' || comparisonType === 'both') && (
          <Bar
            dataKey="lastYear"
            name="Last Year"
            fill="#8B5CF6"
            radius={[8, 8, 0, 0]}
          />
        )}
      </BarChart>
    </ResponsiveContainer>
  )
}
