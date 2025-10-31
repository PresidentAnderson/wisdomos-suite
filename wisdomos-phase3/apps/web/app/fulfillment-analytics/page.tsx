'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar,
  TrendingUp,
  TrendingDown,
  Users,
  ChevronLeft,
  ChevronRight,
  Clock,
  Activity,
  Target,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  BookOpen
} from 'lucide-react'
import Link from 'next/link'
import PhoenixButton from '@/components/ui/PhoenixButton'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  AreaChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts'

// Year of snapshots (2025)
const snapshots = {
  January: [
    {
      name: "Work & Purpose",
      phoenixName: "Sacred Fire",
      level: "High",
      color: "#FFD700",
      progress: 90,
      relationships: [
        { name: "Djamel", size: 60, status: "green", role: "Mentor" },
        { name: "Michael", size: 40, status: "yellow", role: "Colleague" },
        { name: "Zied", size: 30, status: "green", role: "Partner" },
      ],
    },
    {
      name: "Health & Recovery",
      phoenixName: "Inner Flame",
      level: "Moderate",
      color: "#E63946",
      progress: 65,
      relationships: [
        { name: "Pharmacist", size: 40, status: "green", role: "Healthcare" },
        { name: "Therapist", size: 30, status: "yellow", role: "Support" },
        { name: "Djamel", size: 50, status: "red", role: "Accountability" },
      ],
    },
    {
      name: "Finance",
      phoenixName: "Golden Wings",
      level: "Low",
      color: "#FF914D",
      progress: 45,
      relationships: [
        { name: "Accountant", size: 35, status: "yellow", role: "Advisor" },
      ],
    },
    {
      name: "Intimacy & Love",
      phoenixName: "Heart's Ember",
      level: "Moderate",
      color: "#F72585",
      progress: 70,
      relationships: [
        { name: "Partner", size: 55, status: "green", role: "Love" },
        { name: "Family", size: 45, status: "yellow", role: "Support" },
      ],
    },
  ],
  February: [
    {
      name: "Work & Purpose",
      phoenixName: "Sacred Fire",
      level: "High",
      color: "#FFD700",
      progress: 88,
      relationships: [
        { name: "Djamel", size: 60, status: "green", role: "Mentor" },
        { name: "Michael", size: 40, status: "green", role: "Colleague" },
        { name: "Zied", size: 30, status: "yellow", role: "Partner" },
      ],
    },
    {
      name: "Health & Recovery",
      phoenixName: "Inner Flame",
      level: "Moderate",
      color: "#E63946",
      progress: 70,
      relationships: [
        { name: "Pharmacist", size: 40, status: "green", role: "Healthcare" },
        { name: "Therapist", size: 30, status: "green", role: "Support" },
        { name: "Djamel", size: 50, status: "yellow", role: "Accountability" },
      ],
    },
    {
      name: "Finance",
      phoenixName: "Golden Wings",
      level: "Moderate",
      color: "#FF914D",
      progress: 52,
      relationships: [
        { name: "Accountant", size: 35, status: "green", role: "Advisor" },
        { name: "Bank Advisor", size: 25, status: "green", role: "Banking" },
      ],
    },
    {
      name: "Intimacy & Love",
      phoenixName: "Heart's Ember",
      level: "High",
      color: "#F72585",
      progress: 75,
      relationships: [
        { name: "Partner", size: 60, status: "green", role: "Love" },
        { name: "Family", size: 45, status: "green", role: "Support" },
      ],
    },
  ],
  March: [
    {
      name: "Work & Purpose",
      phoenixName: "Sacred Fire",
      level: "High",
      color: "#FFD700",
      progress: 85,
      relationships: [
        { name: "Djamel", size: 60, status: "green", role: "Mentor" },
        { name: "Michael", size: 40, status: "yellow", role: "Colleague" },
        { name: "Zied", size: 30, status: "yellow", role: "Partner" },
      ],
    },
    {
      name: "Health & Recovery",
      phoenixName: "Inner Flame",
      level: "Moderate",
      color: "#E63946",
      progress: 68,
      relationships: [
        { name: "Pharmacist", size: 40, status: "yellow", role: "Healthcare" },
        { name: "Therapist", size: 30, status: "green", role: "Support" },
        { name: "Djamel", size: 50, status: "yellow", role: "Accountability" },
      ],
    },
    {
      name: "Finance",
      phoenixName: "Golden Wings",
      level: "Moderate",
      color: "#FF914D",
      progress: 58,
      relationships: [
        { name: "Accountant", size: 35, status: "green", role: "Advisor" },
        { name: "Bank Advisor", size: 25, status: "yellow", role: "Banking" },
      ],
    },
    {
      name: "Intimacy & Love",
      phoenixName: "Heart's Ember",
      level: "Moderate",
      color: "#F72585",
      progress: 72,
      relationships: [
        { name: "Partner", size: 55, status: "yellow", role: "Love" },
        { name: "Family", size: 45, status: "green", role: "Support" },
      ],
    },
  ],
  April: [
    {
      name: "Work & Purpose",
      phoenixName: "Sacred Fire",
      level: "High",
      color: "#FFD700",
      progress: 82,
      relationships: [
        { name: "Djamel", size: 60, status: "green", role: "Mentor" },
        { name: "Michael", size: 40, status: "yellow", role: "Colleague" },
        { name: "Zied", size: 30, status: "red", role: "Partner" },
      ],
    },
    {
      name: "Health & Recovery",
      phoenixName: "Inner Flame",
      level: "Low",
      color: "#E63946",
      progress: 60,
      relationships: [
        { name: "Pharmacist", size: 40, status: "red", role: "Healthcare" },
        { name: "Therapist", size: 30, status: "yellow", role: "Support" },
        { name: "Djamel", size: 50, status: "yellow", role: "Accountability" },
      ],
    },
    {
      name: "Finance",
      phoenixName: "Golden Wings",
      level: "Moderate",
      color: "#FF914D",
      progress: 55,
      relationships: [
        { name: "Accountant", size: 35, status: "yellow", role: "Advisor" },
        { name: "Bank Advisor", size: 25, status: "green", role: "Banking" },
      ],
    },
    {
      name: "Intimacy & Love",
      phoenixName: "Heart's Ember",
      level: "Moderate",
      color: "#F72585",
      progress: 68,
      relationships: [
        { name: "Partner", size: 55, status: "yellow", role: "Love" },
        { name: "Family", size: 45, status: "yellow", role: "Support" },
      ],
    },
  ],
  May: [
    {
      name: "Work & Purpose",
      phoenixName: "Sacred Fire",
      level: "High",
      color: "#FFD700",
      progress: 87,
      relationships: [
        { name: "Djamel", size: 65, status: "green", role: "Mentor" },
        { name: "Michael", size: 45, status: "green", role: "Colleague" },
        { name: "Zied", size: 35, status: "green", role: "Partner" },
      ],
    },
    {
      name: "Health & Recovery",
      phoenixName: "Inner Flame",
      level: "Moderate",
      color: "#E63946",
      progress: 72,
      relationships: [
        { name: "Pharmacist", size: 40, status: "green", role: "Healthcare" },
        { name: "Therapist", size: 30, status: "yellow", role: "Support" },
        { name: "Djamel", size: 50, status: "green", role: "Accountability" },
      ],
    },
    {
      name: "Finance",
      phoenixName: "Golden Wings",
      level: "Moderate",
      color: "#FF914D",
      progress: 62,
      relationships: [
        { name: "Accountant", size: 40, status: "green", role: "Advisor" },
        { name: "Bank Advisor", size: 30, status: "green", role: "Banking" },
      ],
    },
    {
      name: "Intimacy & Love",
      phoenixName: "Heart's Ember",
      level: "High",
      color: "#F72585",
      progress: 78,
      relationships: [
        { name: "Partner", size: 60, status: "green", role: "Love" },
        { name: "Family", size: 50, status: "green", role: "Support" },
      ],
    },
  ],
  June: [
    {
      name: "Work & Purpose",
      phoenixName: "Sacred Fire",
      level: "High",
      color: "#FFD700",
      progress: 89,
      relationships: [
        { name: "Djamel", size: 65, status: "green", role: "Mentor" },
        { name: "Michael", size: 45, status: "green", role: "Colleague" },
        { name: "Zied", size: 35, status: "green", role: "Partner" },
      ],
    },
    {
      name: "Health & Recovery",
      phoenixName: "Inner Flame",
      level: "High",
      color: "#E63946",
      progress: 75,
      relationships: [
        { name: "Pharmacist", size: 40, status: "green", role: "Healthcare" },
        { name: "Therapist", size: 30, status: "green", role: "Support" },
        { name: "Djamel", size: 50, status: "green", role: "Accountability" },
      ],
    },
    {
      name: "Finance",
      phoenixName: "Golden Wings",
      level: "High",
      color: "#FF914D",
      progress: 70,
      relationships: [
        { name: "Accountant", size: 40, status: "green", role: "Advisor" },
        { name: "Bank Advisor", size: 30, status: "green", role: "Banking" },
      ],
    },
    {
      name: "Intimacy & Love",
      phoenixName: "Heart's Ember",
      level: "High",
      color: "#F72585",
      progress: 82,
      relationships: [
        { name: "Partner", size: 65, status: "green", role: "Love" },
        { name: "Family", size: 50, status: "green", role: "Support" },
      ],
    },
  ],
}

// Generate remaining months with progressive improvement
const remainingMonths = ['July', 'August', 'September', 'October', 'November', 'December']
remainingMonths.forEach((month, index) => {
  snapshots[month as keyof typeof snapshots] = snapshots.June.map(area => ({
    ...area,
    progress: Math.min(100, area.progress + Math.floor(Math.random() * 3) + index),
    relationships: area.relationships.map(rel => ({
      ...rel,
      size: Math.min(70, rel.size + index),
      status: index > 2 ? 'green' as const : rel.status
    }))
  }))
})

// Boundary notes from audit log
const boundaryNotes: Record<string, string> = {
  January: "Time & Energy: overbooking → reblocked & journaling",
  February: "Intimacy & Love: overextension → clarified expectations",
  March: "Finance: delayed invoices → weekly money date",
  April: "Health: fatigue ignored → physio + meal scheduling",
  May: "Friendship: one-sided venting → assert balance",
  June: "Creativity: only on demand → sacred studio time",
  July: "Work: saying yes to everything → clear project priorities",
  August: "Health: skipping meds → alarm reminders set",
  September: "Finance: overspending → budget review weekly",
  October: "Intimacy: avoiding conflict → scheduled check-ins",
  November: "Work: weekend emails → boundaries communicated",
  December: "All areas: year-end reflection → 2026 planning",
}

export default function FulfillmentAnalyticsPage() {
  const months = Object.keys(snapshots) as (keyof typeof snapshots)[]
  const [selectedMonth, setSelectedMonth] = useState<keyof typeof snapshots>('January')
  const [selectedArea, setSelectedArea] = useState<string>('Work & Purpose')
  const [maWindow, setMaWindow] = useState<3 | 6 | 12>(3)

  const currentMonthIndex = months.indexOf(selectedMonth)
  const currentSnapshot = snapshots[selectedMonth]

  const statusColors: Record<string, string> = {
    green: 'bg-green-400 border-green-500',
    yellow: 'bg-yellow-400 border-yellow-500',
    red: 'bg-red-400 border-red-500',
  }

  const levelColors: Record<string, string> = {
    High: 'bg-green-100 text-black border-green-300',
    Moderate: 'bg-yellow-100 text-black border-yellow-300',
    Low: 'bg-red-100 text-black border-red-300',
  }

  // Build trend data with moving average
  const buildTrend = (areaName: string) => {
    const series = months.map((m) => {
      const area = snapshots[m].find((a) => a.name === areaName)
      return { 
        month: m.slice(0, 3), 
        progress: area ? area.progress : 0,
        relationships: area ? area.relationships.length : 0
      }
    })
    
    // Calculate moving average
    const withMA = series.map((d, idx) => {
      const start = Math.max(0, idx - (maWindow - 1))
      const slice = series.slice(start, idx + 1)
      const avg = slice.reduce((acc, s) => acc + s.progress, 0) / slice.length
      return { ...d, [`ma${maWindow}`]: Math.round(avg) }
    })
    
    return withMA
  }

  // Build relationship health data
  const buildRelationshipHealth = () => {
    const relationshipMap = new Map<string, number[]>()
    
    months.forEach(month => {
      snapshots[month].forEach(area => {
        area.relationships.forEach(rel => {
          if (!relationshipMap.has(rel.name)) {
            relationshipMap.set(rel.name, [])
          }
          const scores = relationshipMap.get(rel.name)!
          scores.push(rel.status === 'green' ? 100 : rel.status === 'yellow' ? 50 : 0)
        })
      })
    })
    
    return Array.from(relationshipMap.entries()).map(([name, scores]) => ({
      name,
      avgHealth: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    }))
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) return null
    
    const progressPoint = payload.find((p: any) => p.dataKey === 'progress')
    const maPoint = payload.find((p: any) => p.dataKey === `ma${maWindow}`)
    const fullMonth = months.find(m => m.slice(0, 3) === label)
    const note = fullMonth ? boundaryNotes[fullMonth] : ''
    
    return (
      <div className="rounded-md border bg-white p-3 shadow-lg text-xs">
        <div className="font-semibold text-black">{fullMonth || label} 2025</div>
        <div className="text-black">Progress: {progressPoint?.value ?? 0}%</div>
        <div className="text-black">{maWindow}-mo MA: {maPoint?.value ?? 0}%</div>
        {note && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <div className="flex items-start gap-1">
              <BookOpen className="w-3 h-3 text-black mt-0.5" />
              <span className="text-black">{note}</span>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Radar chart data for current month
  const radarData = currentSnapshot.map(area => ({
    area: area.name.split(' ')[0],
    value: area.progress,
    fullMark: 100
  }))

  // Overall stats
  const overallProgress = Math.round(
    currentSnapshot.reduce((sum, area) => sum + area.progress, 0) / currentSnapshot.length
  )
  
  const totalRelationships = currentSnapshot.reduce(
    (sum, area) => sum + area.relationships.length, 0
  )
  
  const healthyRelationships = currentSnapshot.reduce(
    (sum, area) => sum + area.relationships.filter(r => r.status === 'green').length, 0
  )

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
                Fulfillment Analytics
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-black" />
              <span className="text-sm text-black">2025 Journey Analytics</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Month Selector */}
        <div className="bg-white rounded-2xl shadow-xl p-4 mb-6 border border-phoenix-gold/20">
          <div className="flex items-center justify-between gap-4">
            <PhoenixButton
              onClick={() => {
                const newIndex = Math.max(0, currentMonthIndex - 1)
                setSelectedMonth(months[newIndex])
              }}
              variant="ghost"
              size="sm"
              disabled={currentMonthIndex === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </PhoenixButton>

            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {months.map((month) => (
                <PhoenixButton
                  key={month}
                  onClick={() => setSelectedMonth(month)}
                  variant={selectedMonth === month ? 'primary' : 'ghost'}
                  size="sm"
                  className="min-w-[60px]"
                >
                  {month.slice(0, 3)}
                </PhoenixButton>
              ))}
            </div>

            <PhoenixButton
              onClick={() => {
                const newIndex = Math.min(months.length - 1, currentMonthIndex + 1)
                setSelectedMonth(months[newIndex])
              }}
              variant="ghost"
              size="sm"
              disabled={currentMonthIndex === months.length - 1}
            >
              <ChevronRight className="w-4 h-4" />
            </PhoenixButton>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-6 border border-phoenix-gold/20"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-black">Overall Progress</span>
              {overallProgress >= 70 ? (
                <TrendingUp className="w-4 h-4 text-black" />
              ) : (
                <Activity className="w-4 h-4 text-black" />
              )}
            </div>
            <div className="text-3xl font-bold text-black">
              {overallProgress}%
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-xl p-6 border border-phoenix-gold/20"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-black">Total Connections</span>
              <Users className="w-4 h-4 text-black" />
            </div>
            <div className="text-3xl font-bold text-black">
              {totalRelationships}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl p-6 border border-phoenix-gold/20"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-black">Healthy Relations</span>
              <CheckCircle className="w-4 h-4 text-black" />
            </div>
            <div className="text-3xl font-bold text-black">
              {healthyRelationships}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-xl p-6 border border-phoenix-gold/20"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-black">Life Areas</span>
              <Target className="w-4 h-4 text-black" />
            </div>
            <div className="text-3xl font-bold text-black">
              {currentSnapshot.length}
            </div>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Life Area Cards */}
          <div className="lg:col-span-2 space-y-4">
            {currentSnapshot.map((area, index) => (
              <motion.div
                key={area.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-xl border-2 overflow-hidden cursor-pointer hover:shadow-2xl transition-shadow"
                style={{ borderColor: area.color + '40' }}
                onClick={() => setSelectedArea(area.name)}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-black">
                        {area.name}
                      </h3>
                      <p className="text-sm text-black italic">{area.phoenixName}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${levelColors[area.level]}`}>
                      {area.level}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-black">Commitment</span>
                      <span className="text-xs font-bold" style={{ color: area.color }}>
                        {area.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        className="h-2 rounded-full"
                        style={{ backgroundColor: area.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${area.progress}%` }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      />
                    </div>
                  </div>

                  {/* Relationships */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {area.relationships.map((rel, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 + idx * 0.05 }}
                        className="relative group"
                      >
                        <div
                          className={`flex items-center justify-center rounded-full text-black font-medium border-2 ${statusColors[rel.status]} hover:scale-110 transition-transform`}
                          style={{
                            width: `${rel.size}px`,
                            height: `${rel.size}px`,
                          }}
                        >
                          <span className="text-xs text-center px-1">
                            {rel.name.slice(0, 3)}
                          </span>
                        </div>
                        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black/80 text-black text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                          <div className="font-semibold">{rel.name}</div>
                          <div>{rel.role}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Trend Chart */}
                  <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart 
                        data={buildTrend(area.name)} 
                        margin={{ left: 0, right: 0, top: 5, bottom: 0 }}
                      >
                        <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                        <YAxis domain={[0, 100]} hide />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend 
                          verticalAlign="top" 
                          height={24} 
                          wrapperStyle={{ fontSize: 10 }} 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="progress" 
                          stroke={area.color} 
                          strokeWidth={2} 
                          dot={false} 
                          name="Progress" 
                        />
                        <Line 
                          type="monotone" 
                          dataKey={`ma${maWindow}`} 
                          stroke="#475569" 
                          strokeDasharray="4 2" 
                          strokeWidth={2} 
                          dot={false} 
                          name={`${maWindow}-mo MA`} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Analytics Sidebar */}
          <div className="space-y-4">
            {/* MA Window Selector */}
            <div className="bg-white rounded-2xl shadow-xl p-4 border border-phoenix-gold/20">
              <h3 className="text-sm font-semibold text-black mb-3">Moving Average</h3>
              <div className="flex gap-2">
                {([3, 6, 12] as const).map(window => (
                  <PhoenixButton
                    key={window}
                    onClick={() => setMaWindow(window)}
                    variant={maWindow === window ? 'primary' : 'ghost'}
                    size="sm"
                    className="flex-1"
                  >
                    {window}mo
                  </PhoenixButton>
                ))}
              </div>
            </div>

            {/* Radar Chart */}
            <div className="bg-white rounded-2xl shadow-xl p-4 border border-phoenix-gold/20">
              <h3 className="text-sm font-semibold text-black mb-3">
                {selectedMonth} Balance
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="area" tick={{ fontSize: 10 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar
                      name="Progress"
                      dataKey="value"
                      stroke="#FF914D"
                      fill="#FFD700"
                      fillOpacity={0.6}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Boundary Note */}
            {boundaryNotes[selectedMonth] && (
              <div className="bg-white rounded-2xl shadow-xl p-4 border border-phoenix-gold/20">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-black mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-black mb-1">
                      Boundary Reset
                    </h3>
                    <p className="text-xs text-black">
                      {boundaryNotes[selectedMonth]}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Relationship Health */}
            <div className="bg-white rounded-2xl shadow-xl p-4 border border-phoenix-gold/20">
              <h3 className="text-sm font-semibold text-black mb-3">
                Relationship Health
              </h3>
              <div className="space-y-2">
                {buildRelationshipHealth()
                  .sort((a, b) => b.avgHealth - a.avgHealth)
                  .slice(0, 5)
                  .map(rel => (
                    <div key={rel.name} className="flex items-center justify-between">
                      <span className="text-xs text-black">{rel.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              rel.avgHealth >= 70 ? 'bg-green-500' :
                              rel.avgHealth >= 40 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${rel.avgHealth}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium">
                          {rel.avgHealth}%
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/fulfillment">
            <PhoenixButton variant="secondary">
              <Users className="w-4 h-4 mr-2" />
              Interactive Map
            </PhoenixButton>
          </Link>
          <Link href="/fulfillment-timeline">
            <PhoenixButton variant="secondary">
              <Calendar className="w-4 h-4 mr-2" />
              Timeline View
            </PhoenixButton>
          </Link>
          <Link href="/community">
            <PhoenixButton variant="secondary">
              <Target className="w-4 h-4 mr-2" />
              Community List
            </PhoenixButton>
          </Link>
        </div>
      </main>
    </div>
  )
}