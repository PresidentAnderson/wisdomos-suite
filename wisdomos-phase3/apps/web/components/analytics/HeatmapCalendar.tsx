'use client'

/**
 * Heatmap Calendar Component
 *
 * GitHub-style contribution calendar showing GFS by day
 * Color intensity represents fulfillment level
 */

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { HeatmapDay } from '@/lib/fulfillment-analytics'

interface HeatmapCalendarProps {
  data: HeatmapDay[]
  onDayClick?: (day: HeatmapDay) => void
}

// Level colors (GitHub-style)
const LEVEL_COLORS = {
  0: '#EBEDF0', // No data / very low
  1: '#FEF3C7', // 20-40
  2: '#FDE68A', // 40-60
  3: '#FCD34D', // 60-80
  4: '#F59E0B', // 80-100
}

export default function HeatmapCalendar({ data, onDayClick }: HeatmapCalendarProps) {
  // Group data by weeks
  const weeks = useMemo(() => {
    const weekMap = new Map<string, HeatmapDay[]>()

    data.forEach(day => {
      const date = new Date(day.date)
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay()) // Sunday
      const weekKey = weekStart.toISOString().split('T')[0]

      if (!weekMap.has(weekKey)) {
        weekMap.set(weekKey, [])
      }
      weekMap.get(weekKey)!.push(day)
    })

    return Array.from(weekMap.entries()).map(([weekStart, days]) => ({
      weekStart,
      days: days.sort((a, b) => a.date.localeCompare(b.date))
    }))
  }, [data])

  // Get month labels
  const monthLabels = useMemo(() => {
    const labels: Array<{ month: string; weekIndex: number }> = []
    let lastMonth = ''

    weeks.forEach((week, index) => {
      const date = new Date(week.weekStart)
      const monthName = date.toLocaleDateString('en-US', { month: 'short' })

      if (monthName !== lastMonth) {
        labels.push({ month: monthName, weekIndex: index })
        lastMonth = monthName
      }
    })

    return labels
  }, [weeks])

  return (
    <div className="space-y-2">
      {/* Month labels */}
      <div className="flex gap-[3px] pl-8 mb-1">
        {monthLabels.map((label, index) => (
          <div
            key={index}
            className="text-xs text-gray-500 font-medium"
            style={{
              marginLeft: label.weekIndex === 0 ? 0 : `${(label.weekIndex - (monthLabels[index - 1]?.weekIndex || 0)) * 13}px`
            }}
          >
            {label.month}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex gap-[3px]">
        {/* Day labels */}
        <div className="flex flex-col gap-[3px] text-xs text-gray-500 pt-1">
          <div style={{ height: '10px' }}>Sun</div>
          <div style={{ height: '10px' }}>Mon</div>
          <div style={{ height: '10px' }}>Tue</div>
          <div style={{ height: '10px' }}>Wed</div>
          <div style={{ height: '10px' }}>Thu</div>
          <div style={{ height: '10px' }}>Fri</div>
          <div style={{ height: '10px' }}>Sat</div>
        </div>

        {/* Weeks */}
        <div className="flex gap-[3px] overflow-x-auto pb-2">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-[3px]">
              {[0, 1, 2, 3, 4, 5, 6].map(dayOfWeek => {
                const day = week.days.find(d => {
                  const date = new Date(d.date)
                  return date.getDay() === dayOfWeek
                })

                return (
                  <motion.div
                    key={dayOfWeek}
                    whileHover={{ scale: 1.2 }}
                    onClick={() => day && onDayClick?.(day)}
                    className="relative group cursor-pointer"
                    style={{
                      width: '10px',
                      height: '10px',
                      backgroundColor: day ? LEVEL_COLORS[day.level] : '#EBEDF0',
                      borderRadius: '2px',
                      border: '1px solid rgba(0,0,0,0.05)'
                    }}
                  >
                    {/* Tooltip */}
                    {day && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10 pointer-events-none">
                        <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                          <div className="font-semibold">
                            {new Date(day.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                          <div className="text-phoenix-gold">
                            GFS: {day.gfs}
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 text-xs text-gray-500 mt-4">
        <span>Less</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map(level => (
            <div
              key={level}
              className="w-3 h-3 rounded-sm border border-gray-200"
              style={{ backgroundColor: LEVEL_COLORS[level as keyof typeof LEVEL_COLORS] }}
            />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  )
}
