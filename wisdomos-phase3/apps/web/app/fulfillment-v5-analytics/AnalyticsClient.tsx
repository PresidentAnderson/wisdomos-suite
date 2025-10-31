'use client'

/**
 * Fulfillment Display v5 Analytics Dashboard
 *
 * Comprehensive analytics showing:
 * - Overview metrics (total areas, avg score, thriving/attention counts)
 * - Life area breakdown with scores
 * - Dimension metrics heatmap (5 dimensions across all subdomains)
 * - Trends chart (dimension averages)
 * - Top & bottom performers
 * - Export functionality (JSON/CSV)
 */

import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ChevronLeft,
  Download,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  FileJson,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts'
import type { FulfillmentDisplayData, LifeArea, Subdomain, Dimension } from '@/types/fulfillment-v5'

// Color mapping for dimensions
const DIMENSION_COLORS = {
  Being: '#8B5CF6',
  Doing: '#3B82F6',
  Having: '#10B981',
  Relating: '#F59E0B',
  Becoming: '#EF4444'
}

// Fetch fulfillment data
async function fetchFulfillmentData(): Promise<FulfillmentDisplayData> {
  const response = await fetch('/api/fulfillment-v5')
  if (!response.ok) throw new Error('Failed to fetch fulfillment data')
  return response.json()
}

export default function FulfillmentV5AnalyticsPage() {
  const [selectedMetric, setSelectedMetric] = useState<'all' | 'Being' | 'Doing' | 'Having' | 'Relating' | 'Becoming'>('all')

  // Fetch data
  const { data, isLoading, error } = useQuery({
    queryKey: ['fulfillment-v5'],
    queryFn: fetchFulfillmentData,
  })

  // Calculate analytics
  const analytics = useMemo(() => {
    if (!data?.lifeAreas) return null

    const lifeAreas = data.lifeAreas

    // Overview metrics
    const totalAreas = lifeAreas.length
    const avgScore = lifeAreas.reduce((sum, area) => sum + area.score, 0) / totalAreas
    const thrivingCount = lifeAreas.filter(area => area.status === 'Thriving').length
    const needsAttentionCount = lifeAreas.filter(area => area.status === 'Needs Attention').length

    // Collect all dimensions with context
    interface DimensionWithContext {
      lifeAreaName: string
      subdomainName: string
      dimension: Dimension
      lifeAreaColor: string
    }

    const allDimensions: DimensionWithContext[] = []
    lifeAreas.forEach(area => {
      area.subdomains.forEach(subdomain => {
        subdomain.dimensions.forEach(dimension => {
          allDimensions.push({
            lifeAreaName: area.name,
            subdomainName: subdomain.name,
            dimension,
            lifeAreaColor: area.color
          })
        })
      })
    })

    // Calculate dimension averages
    const dimensionAverages = {
      Being: 0,
      Doing: 0,
      Having: 0,
      Relating: 0,
      Becoming: 0
    }

    const dimensionCounts = {
      Being: 0,
      Doing: 0,
      Having: 0,
      Relating: 0,
      Becoming: 0
    }

    allDimensions.forEach(({ dimension }) => {
      if (dimension.metric) {
        dimensionAverages[dimension.name] += dimension.metric
        dimensionCounts[dimension.name] += 1
      }
    })

    Object.keys(dimensionAverages).forEach(key => {
      const dimKey = key as keyof typeof dimensionAverages
      if (dimensionCounts[dimKey] > 0) {
        dimensionAverages[dimKey] = dimensionAverages[dimKey] / dimensionCounts[dimKey]
      }
    })

    // Top performers (highest rated dimensions)
    const topPerformers = allDimensions
      .filter(d => d.dimension.metric !== undefined)
      .sort((a, b) => (b.dimension.metric || 0) - (a.dimension.metric || 0))
      .slice(0, 10)

    // Bottom performers (lowest rated dimensions)
    const bottomPerformers = allDimensions
      .filter(d => d.dimension.metric !== undefined)
      .sort((a, b) => (a.dimension.metric || 0) - (b.dimension.metric || 0))
      .slice(0, 10)

    // Heatmap data structure (subdomain × dimension)
    interface HeatmapRow {
      subdomain: string
      lifeArea: string
      lifeAreaColor: string
      Being?: number
      Doing?: number
      Having?: number
      Relating?: number
      Becoming?: number
    }

    const heatmapData: HeatmapRow[] = []
    lifeAreas.forEach(area => {
      area.subdomains.forEach(subdomain => {
        const row: HeatmapRow = {
          subdomain: subdomain.name,
          lifeArea: area.name,
          lifeAreaColor: area.color
        }
        subdomain.dimensions.forEach(dimension => {
          row[dimension.name] = dimension.metric
        })
        heatmapData.push(row)
      })
    })

    // Trend data (simulated time series for now)
    const trendData = [
      {
        period: 'Week 1',
        Being: dimensionAverages.Being * 0.85,
        Doing: dimensionAverages.Doing * 0.88,
        Having: dimensionAverages.Having * 0.90,
        Relating: dimensionAverages.Relating * 0.87,
        Becoming: dimensionAverages.Becoming * 0.86
      },
      {
        period: 'Week 2',
        Being: dimensionAverages.Being * 0.92,
        Doing: dimensionAverages.Doing * 0.93,
        Having: dimensionAverages.Having * 0.95,
        Relating: dimensionAverages.Relating * 0.91,
        Becoming: dimensionAverages.Becoming * 0.90
      },
      {
        period: 'Week 3',
        Being: dimensionAverages.Being * 0.97,
        Doing: dimensionAverages.Doing * 0.96,
        Having: dimensionAverages.Having * 0.98,
        Relating: dimensionAverages.Relating * 0.95,
        Becoming: dimensionAverages.Becoming * 0.94
      },
      {
        period: 'Current',
        Being: dimensionAverages.Being,
        Doing: dimensionAverages.Doing,
        Having: dimensionAverages.Having,
        Relating: dimensionAverages.Relating,
        Becoming: dimensionAverages.Becoming
      }
    ]

    return {
      totalAreas,
      avgScore,
      thrivingCount,
      needsAttentionCount,
      dimensionAverages,
      topPerformers,
      bottomPerformers,
      heatmapData,
      trendData,
      lifeAreas
    }
  }, [data])

  // Export functions
  const exportAsJSON = () => {
    if (!data) return
    const dataStr = JSON.stringify(data, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `fulfillment-v5-analytics-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const exportAsCSV = () => {
    if (!analytics) return

    const csvRows = [
      ['Life Area', 'Subdomain', 'Dimension', 'Metric', 'Focus', 'Notes'].join(',')
    ]

    analytics.lifeAreas.forEach(area => {
      area.subdomains.forEach(subdomain => {
        subdomain.dimensions.forEach(dimension => {
          csvRows.push([
            `"${area.name}"`,
            `"${subdomain.name}"`,
            dimension.name,
            dimension.metric || '',
            `"${dimension.focus}"`,
            `"${dimension.notes || ''}"`
          ].join(','))
        })
      })
    })

    const csvStr = csvRows.join('\n')
    const csvBlob = new Blob([csvStr], { type: 'text/csv' })
    const url = URL.createObjectURL(csvBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `fulfillment-v5-analytics-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  // Heatmap color helper
  const getHeatmapColor = (value?: number) => {
    if (!value) return '#F3F4F6'
    if (value >= 4.5) return '#10B981'
    if (value >= 3.5) return '#84CC16'
    if (value >= 2.5) return '#FCD34D'
    if (value >= 1.5) return '#FB923C'
    return '#EF4444'
  }

  // Loading state
  if (isLoading) {
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
  if (error || !analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-phoenix-smoke via-white to-phoenix-gold/10 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-2xl shadow-xl">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-gray-900">Error Loading Analytics</h2>
          <p className="text-gray-600 mb-6">{error?.message || 'Failed to load analytics'}</p>
          <Link href="/fulfillment-v5">
            <button className="px-6 py-2 bg-phoenix-orange text-white rounded-lg hover:bg-phoenix-red transition">
              Back to Dashboard
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-phoenix-smoke via-white to-phoenix-gold/10">
      {/* Header */}
      <header className="border-b border-phoenix-gold/20 bg-white/80 backdrop-blur-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/fulfillment-v5">
                <button className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-phoenix-orange transition">
                  <ChevronLeft className="w-4 h-4" />
                  Back to Dashboard
                </button>
              </Link>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-phoenix-red to-phoenix-orange bg-clip-text text-transparent">
                Analytics Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={exportAsJSON}
                className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition"
              >
                <FileJson className="w-4 h-4" />
                Export JSON
              </button>
              <button
                onClick={exportAsCSV}
                className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Life Areas</h3>
              <Activity className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{analytics.totalAreas}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Average Score</h3>
              <Sparkles className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{analytics.avgScore.toFixed(1)}</p>
            <p className="text-xs text-gray-500 mt-1">Out of 100</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Thriving Areas</h3>
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-green-600">{analytics.thrivingCount}</p>
            <p className="text-xs text-gray-500 mt-1">{((analytics.thrivingCount / analytics.totalAreas) * 100).toFixed(0)}% of total</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Needs Attention</h3>
              <AlertCircle className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-orange-600">{analytics.needsAttentionCount}</p>
            <p className="text-xs text-gray-500 mt-1">{((analytics.needsAttentionCount / analytics.totalAreas) * 100).toFixed(0)}% of total</p>
          </motion.div>
        </div>

        {/* Life Area Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 mb-8"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Life Area Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.lifeAreas.map((area, idx) => (
              <div
                key={area.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-phoenix-orange/50 transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{area.icon}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{area.name}</h3>
                      <p className="text-xs text-gray-500">{area.phoenixName}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    area.status === 'Thriving'
                      ? 'bg-green-100 text-green-700'
                      : area.status === 'Needs Attention'
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {area.status}
                  </span>
                </div>
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Score</span>
                    <span className="text-lg font-bold text-gray-900">{area.score}/100</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-phoenix-orange to-phoenix-red"
                      style={{ width: `${area.score}%` }}
                    />
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {area.subdomains.length} subdomains • {area.commitments} commitments
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Dimension Metrics Heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 mb-8"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Dimension Metrics Heatmap</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Subdomain</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Life Area</th>
                  <th className="text-center py-3 px-4 font-semibold text-purple-600">Being</th>
                  <th className="text-center py-3 px-4 font-semibold text-blue-600">Doing</th>
                  <th className="text-center py-3 px-4 font-semibold text-green-600">Having</th>
                  <th className="text-center py-3 px-4 font-semibold text-orange-600">Relating</th>
                  <th className="text-center py-3 px-4 font-semibold text-red-600">Becoming</th>
                </tr>
              </thead>
              <tbody>
                {analytics.heatmapData.map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{row.subdomain}</td>
                    <td className="py-3 px-4 text-gray-600 text-xs">{row.lifeArea}</td>
                    <td className="py-3 px-4 text-center">
                      <div
                        className="inline-block px-3 py-1 rounded font-semibold text-sm"
                        style={{ backgroundColor: getHeatmapColor(row.Being), color: row.Being && row.Being >= 2.5 ? '#fff' : '#000' }}
                        title={`Being: ${row.Being || 'N/A'}`}
                      >
                        {row.Being ? row.Being.toFixed(1) : '-'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div
                        className="inline-block px-3 py-1 rounded font-semibold text-sm"
                        style={{ backgroundColor: getHeatmapColor(row.Doing), color: row.Doing && row.Doing >= 2.5 ? '#fff' : '#000' }}
                        title={`Doing: ${row.Doing || 'N/A'}`}
                      >
                        {row.Doing ? row.Doing.toFixed(1) : '-'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div
                        className="inline-block px-3 py-1 rounded font-semibold text-sm"
                        style={{ backgroundColor: getHeatmapColor(row.Having), color: row.Having && row.Having >= 2.5 ? '#fff' : '#000' }}
                        title={`Having: ${row.Having || 'N/A'}`}
                      >
                        {row.Having ? row.Having.toFixed(1) : '-'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div
                        className="inline-block px-3 py-1 rounded font-semibold text-sm"
                        style={{ backgroundColor: getHeatmapColor(row.Relating), color: row.Relating && row.Relating >= 2.5 ? '#fff' : '#000' }}
                        title={`Relating: ${row.Relating || 'N/A'}`}
                      >
                        {row.Relating ? row.Relating.toFixed(1) : '-'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div
                        className="inline-block px-3 py-1 rounded font-semibold text-sm"
                        style={{ backgroundColor: getHeatmapColor(row.Becoming), color: row.Becoming && row.Becoming >= 2.5 ? '#fff' : '#000' }}
                        title={`Becoming: ${row.Becoming || 'N/A'}`}
                      >
                        {row.Becoming ? row.Becoming.toFixed(1) : '-'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center gap-4 text-xs text-gray-600">
            <span>Scale: 1-5</span>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#EF4444' }} />
              <span>1.0-1.9</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FB923C' }} />
              <span>2.0-2.9</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FCD34D' }} />
              <span>3.0-3.9</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#84CC16' }} />
              <span>4.0-4.4</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10B981' }} />
              <span>4.5-5.0</span>
            </div>
          </div>
        </motion.div>

        {/* Trends Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 mb-8"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-2">Dimension Trends</h2>
          <p className="text-sm text-gray-600 mb-6">Average dimension scores over time (simulated data)</p>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={analytics.trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="period" stroke="#6B7280" />
              <YAxis domain={[0, 5]} stroke="#6B7280" />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                labelStyle={{ fontWeight: 'bold', marginBottom: '8px' }}
              />
              <Legend />
              <Line type="monotone" dataKey="Being" stroke={DIMENSION_COLORS.Being} strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="Doing" stroke={DIMENSION_COLORS.Doing} strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="Having" stroke={DIMENSION_COLORS.Having} strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="Relating" stroke={DIMENSION_COLORS.Relating} strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="Becoming" stroke={DIMENSION_COLORS.Becoming} strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top & Bottom Performers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Performers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
          >
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-6 h-6 text-green-500" />
              <h2 className="text-xl font-bold text-gray-900">Top Performers</h2>
            </div>
            <div className="space-y-3">
              {analytics.topPerformers.map((item, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-sm">{item.dimension.name}</h3>
                      <p className="text-xs text-gray-600">{item.lifeAreaName} • {item.subdomainName}</p>
                    </div>
                    <span className="text-lg font-bold text-green-600">{item.dimension.metric?.toFixed(1)}</span>
                  </div>
                  <p className="text-xs text-gray-700">{item.dimension.focus}</p>
                  {item.dimension.notes && (
                    <p className="text-xs text-gray-500 mt-1 italic">{item.dimension.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Bottom Performers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
          >
            <div className="flex items-center gap-2 mb-6">
              <TrendingDown className="w-6 h-6 text-red-500" />
              <h2 className="text-xl font-bold text-gray-900">Needs Attention</h2>
            </div>
            <div className="space-y-3">
              {analytics.bottomPerformers.map((item, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-sm">{item.dimension.name}</h3>
                      <p className="text-xs text-gray-600">{item.lifeAreaName} • {item.subdomainName}</p>
                    </div>
                    <span className="text-lg font-bold text-red-600">{item.dimension.metric?.toFixed(1)}</span>
                  </div>
                  <p className="text-xs text-gray-700">{item.dimension.focus}</p>
                  {item.dimension.notes && (
                    <p className="text-xs text-gray-500 mt-1 italic">{item.dimension.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Dimension Averages Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 mt-8"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Average Dimension Scores</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={Object.entries(analytics.dimensionAverages).map(([name, value]) => ({ name, value }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" stroke="#6B7280" />
              <YAxis domain={[0, 5]} stroke="#6B7280" />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {Object.entries(analytics.dimensionAverages).map(([name], index) => (
                  <Cell key={`cell-${index}`} fill={DIMENSION_COLORS[name as keyof typeof DIMENSION_COLORS]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Data last synced: {data?.lastSync ? new Date(data.lastSync).toLocaleString() : 'Unknown'}</p>
          <p className="mt-1">Analytics calculated client-side from Fulfillment Display v5 data</p>
        </div>
      </main>
    </div>
  )
}
