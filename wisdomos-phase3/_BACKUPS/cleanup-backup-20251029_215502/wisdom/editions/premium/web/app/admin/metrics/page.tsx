'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Activity, 
  TrendingUp, 
  Users, 
  AlertCircle,
  RefreshCw,
  Database,
  Zap,
  Heart
} from 'lucide-react'
import { metrics } from '@/lib/monitoring/metrics'
import PhoenixButton from '@/components/ui/PhoenixButton'

export default function MetricsDashboard() {
  const [data, setData] = useState<any>(null)
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    const loadData = () => {
      const dashboardData = metrics.getDashboard()
      setData(dashboardData)
      setLastRefresh(new Date())
    }

    loadData()

    if (autoRefresh) {
      const interval = setInterval(loadData, 5000) // Refresh every 5 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading metrics...</p>
        </div>
      </div>
    )
  }

  const { current, trends, events } = data

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">WisdomOS Metrics Dashboard</h1>
            <p className="text-gray-500 mt-1">Real-time monitoring (Local Storage)</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              Last refresh: {lastRefresh.toLocaleTimeString()}
            </div>
            <PhoenixButton
              variant={autoRefresh ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${autoRefresh ? 'animate-spin' : ''}`} />
              {autoRefresh ? 'Auto' : 'Manual'}
            </PhoenixButton>
          </div>
        </div>
      </div>

      {/* Current Metrics */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <MetricCard
          icon={<Heart className="w-5 h-5" />}
          title="Contributions"
          value={current.contributions}
          color="blue"
          subtitle="Last hour"
        />
        <MetricCard
          icon={<Activity className="w-5 h-5" />}
          title="Journal Entries"
          value={current.journalEntries}
          color="green"
          subtitle="Last hour"
        />
        <MetricCard
          icon={<TrendingUp className="w-5 h-5" />}
          title="Avg Fulfillment"
          value={current.fulfillmentAvg.toFixed(1)}
          color="purple"
          subtitle="24 hour avg"
        />
        <MetricCard
          icon={<Database className="w-5 h-5" />}
          title="HubSpot Syncs"
          value={current.hubspotSyncs}
          color="indigo"
          subtitle="Last hour"
        />
        <MetricCard
          icon={<AlertCircle className="w-5 h-5" />}
          title="Errors"
          value={current.errors}
          color={current.errors > 0 ? 'red' : 'gray'}
          subtitle="Last hour"
        />
      </div>

      {/* Trends */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Contributions by Type */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Contributions by Type</h3>
          <div className="space-y-3">
            {Object.entries(trends.contributionsByType || {}).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="capitalize text-gray-700">{type}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-phoenix-orange h-2 rounded-full"
                      style={{ 
                        width: `${Math.min(100, (count as number) * 10)}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8 text-right">{String(count)}</span>
                </div>
              </div>
            ))}
            {Object.keys(trends.contributionsByType || {}).length === 0 && (
              <p className="text-gray-400 text-sm">No contributions yet</p>
            )}
          </div>
        </div>

        {/* Journal Entries by Mood */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Journal Entries by Mood</h3>
          <div className="space-y-3">
            {Object.entries(trends.journalsByMood || {}).map(([mood, count]) => (
              <div key={mood} className="flex items-center justify-between">
                <span className="capitalize text-gray-700">{mood}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ 
                        width: `${Math.min(100, (count as number) * 10)}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8 text-right">{String(count)}</span>
                </div>
              </div>
            ))}
            {Object.keys(trends.journalsByMood || {}).length === 0 && (
              <p className="text-gray-400 text-sm">No journal entries yet</p>
            )}
          </div>
        </div>

        {/* Fulfillment by Area */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Fulfillment by Life Area</h3>
          <div className="space-y-3">
            {Object.entries(trends.fulfillmentByArea || {}).map(([area, score]) => (
              <div key={area} className="flex items-center justify-between">
                <span className="capitalize text-gray-700">{area}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        (score as number) > 7 ? 'bg-green-500' :
                        (score as number) > 4 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ 
                        width: `${(score as number) * 10}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8 text-right">
                    {(score as number).toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
            {Object.keys(trends.fulfillmentByArea || {}).length === 0 && (
              <p className="text-gray-400 text-sm">No fulfillment scores yet</p>
            )}
          </div>
        </div>

        {/* API Latency */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">API Performance</h3>
          <div className="space-y-3">
            {Object.entries(trends.apiLatency || {}).map(([endpoint, latency]) => (
              <div key={endpoint} className="flex items-center justify-between">
                <span className="text-gray-700 text-sm font-mono">
                  {endpoint.substring(0, 30)}
                </span>
                <div className="flex items-center gap-2">
                  <Zap className={`w-4 h-4 ${
                    (latency as number) < 100 ? 'text-green-500' :
                    (latency as number) < 500 ? 'text-yellow-500' : 'text-red-500'
                  }`} />
                  <span className="text-sm font-medium">
                    {String(latency)}ms
                  </span>
                </div>
              </div>
            ))}
            {Object.keys(trends.apiLatency || {}).length === 0 && (
              <p className="text-gray-400 text-sm">No API calls tracked</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Events */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Events</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {events && events.length > 0 ? (
              events.slice(-10).reverse().map((event: any, index: number) => (
                <div 
                  key={index} 
                  className={`p-3 rounded-lg border ${
                    event.level === 'error' ? 'bg-red-50 border-red-200' :
                    event.level === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                    'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium text-sm">{event.title}</div>
                      <div className="text-xs text-gray-600 mt-1">{event.description}</div>
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm">No recent events</p>
            )}
          </div>
        </div>
      </div>

      {/* Note about Grafana */}
      <div className="max-w-7xl mx-auto mt-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-800 font-medium">
                Using Local Metrics Storage
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                Grafana connection unavailable. Metrics are being stored locally in browser storage.
                To enable Grafana, check your instance status and update environment variables.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ 
  icon, 
  title, 
  value, 
  color, 
  subtitle 
}: { 
  icon: React.ReactNode
  title: string
  value: number | string
  color: string
  subtitle: string 
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    gray: 'bg-gray-50 text-gray-600 border-gray-200',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg border p-6 ${colorClasses[color as keyof typeof colorClasses]}`}
    >
      <div className="flex items-center justify-between mb-2">
        {icon}
        <span className="text-2xl font-bold">{value}</span>
      </div>
      <h3 className="font-medium text-sm">{title}</h3>
      <p className="text-xs opacity-75 mt-1">{subtitle}</p>
    </motion.div>
  )
}