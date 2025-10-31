'use client'

/**
 * Fulfillment Analytics Dashboard
 *
 * Comprehensive analytics showing:
 * - Overview cards (current GFS, MoM change, YoY change)
 * - Trend graph (GFS over last 12 months)
 * - Top movers (areas with biggest changes)
 * - Area comparison (current vs last month vs last year)
 * - Heatmap calendar (daily GFS values)
 * - AI-generated insights
 */

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  Calendar,
  Sparkles,
  BarChart3,
  Activity,
  Award,
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { fetchAnalytics, type AnalyticsData } from '@/lib/fulfillment-analytics'
import PhoenixButton from '@/components/ui/PhoenixButton'

// Chart components
import GFSTrendChart from '@/components/analytics/GFSTrendChart'
import AreaComparisonChart from '@/components/analytics/AreaComparisonChart'
import AreaRadarChart from '@/components/analytics/AreaRadarChart'
import HeatmapCalendar from '@/components/analytics/HeatmapCalendar'

export default function FulfillmentAnalyticsPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()

  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeView, setActiveView] = useState<'overview' | 'trends' | 'heatmap'>('overview')

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/fulfillment-v5/analytics')
    }
  }, [authLoading, user, router])

  // Fetch analytics data
  useEffect(() => {
    if (user) {
      loadAnalytics()
    }
  }, [user])

  async function loadAnalytics() {
    if (!user) return

    try {
      setLoading(true)
      setError(null)
      const analyticsData = await fetchAnalytics(user.id)
      setData(analyticsData)
    } catch (err: any) {
      console.error('Error loading analytics:', err)
      setError(err.message || 'Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-phoenix-smoke via-white to-phoenix-gold/10 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-4"
          >
            <BarChart3 className="w-16 h-16 text-phoenix-orange" />
          </motion.div>
          <p className="text-lg text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-phoenix-smoke via-white to-phoenix-gold/10 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-2xl shadow-xl">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-gray-900">Error Loading Analytics</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <PhoenixButton onClick={loadAnalytics}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </PhoenixButton>
        </div>
      </div>
    )
  }

  if (!data) return null

  const { summary, areaScores, trendData, heatmapData } = data

  return (
    <div className="min-h-screen bg-gradient-to-br from-phoenix-smoke via-white to-phoenix-gold/10">
      {/* Header */}
      <header className="border-b border-phoenix-gold/20 bg-white/80 backdrop-blur-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/fulfillment-v5">
                <PhoenixButton variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to Dashboard
                </PhoenixButton>
              </Link>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-phoenix-red to-phoenix-orange bg-clip-text text-transparent">
                Fulfillment Analytics
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <PhoenixButton size="sm" variant="secondary" onClick={loadAnalytics}>
                <RefreshCw className="w-4 h-4 mr-1" />
                Refresh
              </PhoenixButton>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Current GFS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-phoenix-gold/20"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-phoenix-orange/10 rounded-lg">
                <Activity className="w-5 h-5 text-phoenix-orange" />
              </div>
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Current GFS
              </h3>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold text-gray-900">{summary.currentGFS}</span>
              <span className="text-2xl text-gray-500">/100</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {summary.currentGFS >= 80 && 'Exceptional fulfillment'}
              {summary.currentGFS >= 60 && summary.currentGFS < 80 && 'Strong overall'}
              {summary.currentGFS >= 40 && summary.currentGFS < 60 && 'Solid foundation'}
              {summary.currentGFS < 40 && 'Building momentum'}
            </p>
          </motion.div>

          {/* Month-over-Month Change */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-phoenix-gold/20"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Month-over-Month
              </h3>
            </div>
            {summary.momGFSChange !== null ? (
              <>
                <div className="flex items-baseline gap-2">
                  <span className={`text-5xl font-bold ${
                    summary.momGFSChange >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {summary.momGFSChange >= 0 ? '+' : ''}{summary.momGFSChange.toFixed(1)}
                  </span>
                  <span className="text-2xl text-gray-500">points</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {summary.momGFSPercentage !== null && (
                    <span className={summary.momGFSPercentage >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {summary.momGFSPercentage >= 0 ? '+' : ''}{summary.momGFSPercentage.toFixed(1)}%
                    </span>
                  )}
                  {' '}since last month
                </p>
              </>
            ) : (
              <div className="text-gray-400 text-sm">
                No data for last month
              </div>
            )}
          </motion.div>

          {/* Year-over-Year Change */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-phoenix-gold/20"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Year-over-Year
              </h3>
            </div>
            {summary.yoyGFSChange !== null ? (
              <>
                <div className="flex items-baseline gap-2">
                  <span className={`text-5xl font-bold ${
                    summary.yoyGFSChange >= 0 ? 'text-purple-600' : 'text-red-600'
                  }`}>
                    {summary.yoyGFSChange >= 0 ? '+' : ''}{summary.yoyGFSChange.toFixed(1)}
                  </span>
                  <span className="text-2xl text-gray-500">points</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {summary.yoyGFSPercentage !== null && (
                    <span className={summary.yoyGFSPercentage >= 0 ? 'text-purple-600' : 'text-red-600'}>
                      {summary.yoyGFSPercentage >= 0 ? '+' : ''}{summary.yoyGFSPercentage.toFixed(1)}%
                    </span>
                  )}
                  {' '}since last year
                </p>
              </>
            ) : (
              <div className="text-gray-400 text-sm">
                No data for last year
              </div>
            )}
          </motion.div>
        </div>

        {/* AI Insights */}
        {summary.insights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-phoenix-orange/10 via-phoenix-gold/10 to-phoenix-red/10 rounded-2xl p-6 mb-8 border border-phoenix-gold/30"
          >
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-phoenix-orange" />
              <h2 className="text-xl font-bold text-gray-900">AI-Generated Insights</h2>
            </div>
            <div className="space-y-3">
              {summary.insights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-start gap-3 bg-white/50 rounded-lg p-3"
                >
                  <div className="w-6 h-6 bg-phoenix-orange rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-gray-700 leading-relaxed">{insight}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* View Selector */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setActiveView('overview')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeView === 'overview'
                ? 'bg-phoenix-orange text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveView('trends')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeView === 'trends'
                ? 'bg-phoenix-orange text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Trends
          </button>
          <button
            onClick={() => setActiveView('heatmap')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeView === 'heatmap'
                ? 'bg-phoenix-orange text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Heatmap
          </button>
        </div>

        {/* Overview View */}
        {activeView === 'overview' && (
          <div className="space-y-8">
            {/* Top Movers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Improving */}
              {summary.topImproving.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-green-200"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                    <h2 className="text-xl font-bold text-gray-900">Top Improving Areas</h2>
                  </div>
                  <div className="space-y-3">
                    {summary.topImproving.map((area, index) => (
                      <div key={area.area.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{area.area.emoji}</span>
                          <div>
                            <p className="font-semibold text-gray-900">{area.area.name}</p>
                            <p className="text-sm text-gray-600">{area.currentScore.toFixed(2)}/5.0</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">
                            +{area.momChange?.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {area.momPercentage !== null && `+${area.momPercentage.toFixed(1)}%`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Top Declining */}
              {summary.topDeclining.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-red-200"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingDown className="w-6 h-6 text-red-600" />
                    <h2 className="text-xl font-bold text-gray-900">Areas Needing Attention</h2>
                  </div>
                  <div className="space-y-3">
                    {summary.topDeclining.map((area, index) => (
                      <div key={area.area.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{area.area.emoji}</span>
                          <div>
                            <p className="font-semibold text-gray-900">{area.area.name}</p>
                            <p className="text-sm text-gray-600">{area.currentScore.toFixed(2)}/5.0</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-red-600">
                            {area.momChange?.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {area.momPercentage !== null && `${area.momPercentage.toFixed(1)}%`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Area Radar Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-phoenix-gold/20"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">Current Area Distribution</h2>
              <AreaRadarChart areaScores={areaScores} height={500} showComparison={true} />
            </motion.div>

            {/* Area Comparison Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-phoenix-gold/20"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">Area Comparison</h2>
              <p className="text-sm text-gray-600 mb-4">
                Current month vs last month comparison across all life areas
              </p>
              <AreaComparisonChart areaScores={areaScores} height={500} comparisonType="mom" />
            </motion.div>
          </div>
        )}

        {/* Trends View */}
        {activeView === 'trends' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-phoenix-gold/20"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">GFS Trend - Last 12 Months</h2>
            <p className="text-sm text-gray-600 mb-4">
              Track your Global Fulfillment Score over time to identify patterns and progress
            </p>
            <GFSTrendChart data={trendData} height={400} showArea={true} />
          </motion.div>
        )}

        {/* Heatmap View */}
        {activeView === 'heatmap' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-phoenix-gold/20"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Fulfillment Heatmap</h2>
            <p className="text-sm text-gray-600 mb-4">
              GitHub-style contribution calendar showing your fulfillment journey (monthly approximation)
            </p>
            <HeatmapCalendar
              data={heatmapData}
              onDayClick={(day) => console.log('Clicked day:', day)}
            />
          </motion.div>
        )}
      </main>
    </div>
  )
}
