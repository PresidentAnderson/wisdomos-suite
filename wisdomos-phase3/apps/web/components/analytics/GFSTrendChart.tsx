'use client'

/**
 * GFS Trend Chart Component
 *
 * Line chart showing Global Fulfillment Score over time
 * Uses Recharts library with Phoenix-themed styling
 */

import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart
} from 'recharts'
import type { MonthlyTrendPoint } from '@/lib/fulfillment-analytics'

interface GFSTrendChartProps {
  data: MonthlyTrendPoint[]
  height?: number
  showArea?: boolean
}

export default function GFSTrendChart({
  data,
  height = 300,
  showArea = false
}: GFSTrendChartProps) {
  // Format period for display (YYYY-MM -> MMM YY)
  const formatPeriod = (period: string) => {
    const [year, month] = period.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
  }

  // Format tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white border border-phoenix-gold/20 rounded-lg shadow-xl p-3">
          <p className="text-sm font-semibold text-gray-900">
            {formatPeriod(data.period)}
          </p>
          <p className="text-lg font-bold text-phoenix-orange mt-1">
            GFS: {data.gfs}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {data.gfs >= 80 && 'Exceptional'}
            {data.gfs >= 60 && data.gfs < 80 && 'Strong'}
            {data.gfs >= 40 && data.gfs < 60 && 'Solid'}
            {data.gfs < 40 && 'Building'}
          </p>
        </div>
      )
    }
    return null
  }

  const chartData = data.map(d => ({
    ...d,
    displayPeriod: formatPeriod(d.period)
  }))

  if (showArea) {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorGFS" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="displayPeriod"
            stroke="#6B7280"
            style={{ fontSize: '12px' }}
            tick={{ fill: '#6B7280' }}
          />
          <YAxis
            domain={[0, 100]}
            stroke="#6B7280"
            style={{ fontSize: '12px' }}
            tick={{ fill: '#6B7280' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="gfs"
            stroke="#F59E0B"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorGFS)"
          />
        </AreaChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis
          dataKey="displayPeriod"
          stroke="#6B7280"
          style={{ fontSize: '12px' }}
          tick={{ fill: '#6B7280' }}
        />
        <YAxis
          domain={[0, 100]}
          stroke="#6B7280"
          style={{ fontSize: '12px' }}
          tick={{ fill: '#6B7280' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }}
          iconType="line"
        />
        <Line
          type="monotone"
          dataKey="gfs"
          name="Global Fulfillment Score"
          stroke="#F59E0B"
          strokeWidth={3}
          dot={{ fill: '#F59E0B', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
