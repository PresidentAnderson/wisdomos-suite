'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Activity,
  Calendar,
  Target,
  Award,
  Clock,
  ChevronLeft
} from 'lucide-react'
import Link from 'next/link'
import PhoenixButton from '@/components/ui/PhoenixButton'

// Mock analytics data
const mockAnalytics = {
  overallScore: 72,
  scoreChange: 8,
  totalJournals: 147,
  totalResets: 23,
  activeDays: 45,
  currentStreak: 7,
  topLifeAreas: [
    { name: 'Health & Recovery', score: 85, trend: 'up' },
    { name: 'Learning & Growth', score: 78, trend: 'up' },
    { name: 'Creativity', score: 75, trend: 'stable' }
  ],
  strugglingAreas: [
    { name: 'Work & Purpose', score: 45, trend: 'down' },
    { name: 'Finance', score: 52, trend: 'down' }
  ],
  weeklyActivity: [
    { day: 'Mon', journals: 3, resets: 1, score: 70 },
    { day: 'Tue', journals: 2, resets: 0, score: 68 },
    { day: 'Wed', journals: 4, resets: 1, score: 72 },
    { day: 'Thu', journals: 2, resets: 2, score: 75 },
    { day: 'Fri', journals: 3, resets: 0, score: 73 },
    { day: 'Sat', journals: 1, resets: 1, score: 71 },
    { day: 'Sun', journals: 2, resets: 0, score: 72 }
  ],
  monthlyProgress: [
    { month: 'Jan', score: 65 },
    { month: 'Feb', score: 68 },
    { month: 'Mar', score: 72 }
  ]
}

export default function AnalyticsPage() {
  const [timeFrame, setTimeFrame] = useState<'week' | 'month' | 'year'>('week')

  return (
    <div className="min-h-screen bg-gradient-to-br from-phoenix-smoke via-white to-phoenix-gold/10">
      {/* Header */}
      <header className="border-b border-phoenix-gold/20 bg-white/80 backdrop-blur-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/">
                <PhoenixButton variant="ghost" size="sm">
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </PhoenixButton>
              </Link>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-phoenix-red to-phoenix-orange bg-clip-text text-transparent">
                Analytics Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-black" />
              <span className="text-sm text-black">Real-time insights</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Time Frame Selector */}
        <div className="flex gap-2 mb-6">
          {(['week', 'month', 'year'] as const).map((frame) => (
            <PhoenixButton
              key={frame}
              onClick={() => setTimeFrame(frame)}
              variant={timeFrame === frame ? 'primary' : 'ghost'}
              size="sm"
            >
              {frame.charAt(0).toUpperCase() + frame.slice(1)}
            </PhoenixButton>
          ))}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-6 border border-phoenix-gold/20"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-black">Overall Score</span>
              <TrendingUp className="w-4 h-4 text-black" />
            </div>
            <div className="text-3xl font-bold text-black">
              {mockAnalytics.overallScore}%
            </div>
            <div className="text-xs text-black mt-1">
              +{mockAnalytics.scoreChange}% this {timeFrame}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-xl p-6 border border-phoenix-gold/20"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-black">Total Journals</span>
              <BarChart3 className="w-4 h-4 text-black" />
            </div>
            <div className="text-3xl font-bold text-black">
              {mockAnalytics.totalJournals}
            </div>
            <div className="text-xs text-black mt-1">
              Lifetime entries
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl p-6 border border-phoenix-gold/20"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-black">Active Days</span>
              <Calendar className="w-4 h-4 text-black" />
            </div>
            <div className="text-3xl font-bold text-black">
              {mockAnalytics.activeDays}
            </div>
            <div className="text-xs text-black mt-1">
              This {timeFrame}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-xl p-6 border border-phoenix-gold/20"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-black">Current Streak</span>
              <Award className="w-4 h-4 text-black" />
            </div>
            <div className="text-3xl font-bold text-black">
              {mockAnalytics.currentStreak}
            </div>
            <div className="text-xs text-black mt-1">
              Days in a row
            </div>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Weekly Activity Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-xl p-6 border border-phoenix-gold/20"
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-black" />
              Weekly Activity
            </h3>
            <div className="space-y-4">
              {mockAnalytics.weeklyActivity.map((day) => (
                <div key={day.day} className="flex items-center gap-4">
                  <span className="text-sm font-medium text-black w-12">
                    {day.day}
                  </span>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-phoenix-orange to-phoenix-gold transition-all"
                        style={{ width: `${day.score}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-black w-12">
                      {day.score}
                    </span>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <span className="text-black">
                      {day.journals} 📝
                    </span>
                    <span className="text-black">
                      {day.resets} 🔄
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Life Areas Performance */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-xl p-6 border border-phoenix-gold/20"
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-black" />
              Life Areas Performance
            </h3>
            
            <div className="mb-6">
              <h4 className="text-sm font-medium text-black mb-3">Top Performing</h4>
              <div className="space-y-3">
                {mockAnalytics.topLifeAreas.map((area) => (
                  <div key={area.name} className="flex items-center justify-between">
                    <span className="text-sm text-black">{area.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-black">
                        {area.score}%
                      </span>
                      {area.trend === 'up' && (
                        <TrendingUp className="w-3 h-3 text-black" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-black mb-3">Needs Attention</h4>
              <div className="space-y-3">
                {mockAnalytics.strugglingAreas.map((area) => (
                  <div key={area.name} className="flex items-center justify-between">
                    <span className="text-sm text-black">{area.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-black">
                        {area.score}%
                      </span>
                      {area.trend === 'down' && (
                        <TrendingDown className="w-3 h-3 text-black" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Monthly Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-6 border border-phoenix-gold/20"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-black" />
            Monthly Progress
          </h3>
          <div className="flex items-end justify-between h-48 gap-4">
            {mockAnalytics.monthlyProgress.map((month, index) => (
              <motion.div
                key={month.month}
                initial={{ height: 0 }}
                animate={{ height: `${month.score}%` }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="flex-1 flex flex-col items-center"
              >
                <div className="w-full bg-gradient-to-t from-phoenix-orange to-phoenix-gold rounded-t-lg mb-2" />
                <span className="text-sm font-medium text-black">
                  {month.month}
                </span>
                <span className="text-xs text-black">
                  {month.score}%
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  )
}