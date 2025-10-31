'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ChevronLeft, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  PenTool, 
  RefreshCw, 
  Users, 
  Target, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Plus
} from 'lucide-react'
import Link from 'next/link'
import PhoenixButton from '@/components/ui/PhoenixButton'
import { lifeAreas } from '@/lib/phoenix-theme'

// Helper function to generate mock data for a life area
const generateMockData = (lifeAreaId: string) => {
  const lifeArea = lifeAreas.find(area => area.id === lifeAreaId)
  if (!lifeArea) {
    // Default data for unknown areas
    return {
      id: lifeAreaId,
      name: 'Unknown Area',
      phoenixName: 'Unknown Phoenix',
      color: '#FFD700',
      status: 'yellow' as const,
      score: 0,
      momentum: 0,
      drift: 0,
      description: 'This life area needs configuration',
      stats: { totalJournals: 0, totalResets: 0, totalRelationships: 0, avgWeeklyActivity: 0, lastActivity: new Date() },
      recentEvents: [],
      relationships: [],
      weeklyData: [],
      insights: []
    }
  }

  // Generate realistic mock data based on life area
  return {
    id: lifeArea.id,
    name: lifeArea.name,
    phoenixName: lifeArea.phoenix,
    color: lifeArea.id === 'work' ? '#FFD700' : lifeArea.id === 'health' ? '#E63946' : '#FF914D',
    status: (lifeArea.id === 'work' ? 'red' : lifeArea.id === 'health' ? 'green' : 'yellow') as 'green' | 'yellow' | 'red',
    score: lifeArea.id === 'work' ? 2 : lifeArea.id === 'health' ? 1 : 0,
    momentum: Math.random() * 0.6 - 0.3,
    drift: Math.random() * 0.4 - 0.2,
    description: `Your ${lifeArea.name.toLowerCase()} - ${lifeArea.phoenix}`,
  
    stats: {
      totalJournals: Math.floor(Math.random() * 50) + 10,
      totalResets: Math.floor(Math.random() * 15) + 3,
      totalRelationships: Math.floor(Math.random() * 5) + 1,
      avgWeeklyActivity: Math.floor(Math.random() * 20) + 5,
      lastActivity: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000),
    },

    recentEvents: [
      {
        id: '1',
        type: lifeArea.id === 'work' ? 'UPSET' as const : 'WIN' as const,
        title: lifeArea.id === 'work' ? 'Difficult client meeting' : `${lifeArea.name} progress`,
        description: lifeArea.id === 'work' ? 'Client pushed back on deliverables timeline' : `Made meaningful progress in ${lifeArea.name.toLowerCase()}`,
        impact: lifeArea.id === 'work' ? -1 : 1,
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        id: '2',
        type: 'BOUNDARY_RESET' as const,
        title: `${lifeArea.name} boundary reset`,
        description: `Established clearer boundaries in ${lifeArea.name.toLowerCase()}`,
        impact: 2,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    ],

    relationships: [
      { id: '1', name: `${lifeArea.name} Contact 1`, frequency: Math.floor(Math.random() * 5) + 3, urgency: 'medium' as const, lastContact: Math.floor(Math.random() * 10) + 1 },
      { id: '2', name: `${lifeArea.name} Contact 2`, frequency: Math.floor(Math.random() * 5) + 5, urgency: 'low' as const, lastContact: Math.floor(Math.random() * 5) + 1 },
    ],

    weeklyData: [
      { day: 'Mon', score: Math.floor(Math.random() * 5) - 2, journals: Math.floor(Math.random() * 3) + 1, events: Math.floor(Math.random() * 3) + 1 },
      { day: 'Tue', score: Math.floor(Math.random() * 5) - 2, journals: Math.floor(Math.random() * 3) + 1, events: Math.floor(Math.random() * 3) + 1 },
      { day: 'Wed', score: Math.floor(Math.random() * 5) - 2, journals: Math.floor(Math.random() * 3) + 1, events: Math.floor(Math.random() * 3) + 1 },
      { day: 'Thu', score: Math.floor(Math.random() * 5) - 2, journals: Math.floor(Math.random() * 3) + 1, events: Math.floor(Math.random() * 3) + 1 },
      { day: 'Fri', score: Math.floor(Math.random() * 5) - 2, journals: Math.floor(Math.random() * 3) + 1, events: Math.floor(Math.random() * 3) + 1 },
      { day: 'Sat', score: Math.floor(Math.random() * 5) - 2, journals: Math.floor(Math.random() * 3), events: Math.floor(Math.random() * 3) + 1 },
      { day: 'Sun', score: Math.floor(Math.random() * 5) - 2, journals: Math.floor(Math.random() * 3) + 1, events: Math.floor(Math.random() * 3) + 1 },
    ],

    insights: [
      {
        type: 'concern',
        title: `${lifeArea.name} Attention Needed`,
        description: `Consider focusing more energy on ${lifeArea.name.toLowerCase()} this week.`,
        urgency: 'medium' as const,
      },
      {
        type: 'opportunity',
        title: `${lifeArea.name} Growth Potential`,
        description: `Great opportunity to expand in ${lifeArea.name.toLowerCase()}.`,
        urgency: 'low' as const,
      },
    ],
  }
}

const eventIcons = {
  WIN: CheckCircle,
  UPSET: AlertTriangle,
  BOUNDARY_RESET: RefreshCw,
  COMMITMENT_KEPT: Target,
  COMMITMENT_BROKEN: XCircle,
  INSIGHT: TrendingUp,
}

const eventColors = {
  WIN: 'text-black bg-green-50',
  UPSET: 'text-black bg-red-50',
  BOUNDARY_RESET: 'text-black bg-orange-50',
  COMMITMENT_KEPT: 'text-black bg-blue-50',
  COMMITMENT_BROKEN: 'text-black bg-red-50',
  INSIGHT: 'text-black bg-purple-50',
}

const urgencyColors = {
  low: 'text-black bg-green-100',
  medium: 'text-black bg-yellow-100',
  high: 'text-black bg-red-100',
}

export default function LifeAreaDetailPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'journal' | 'relationships' | 'insights'>('overview')
  const lifeArea = generateMockData(params.id)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'green': return 'text-black bg-green-50'
      case 'yellow': return 'text-black bg-yellow-50'
      case 'red': return 'text-black bg-red-50'
      default: return 'text-black bg-gray-50'
    }
  }

  const getScoreIcon = (score: number) => {
    if (score > 0) return <TrendingUp className="w-4 h-4 text-black" />
    if (score < 0) return <TrendingDown className="w-4 h-4 text-black" />
    return <BarChart3 className="w-4 h-4 text-black" />
  }

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
                  Dashboard
                </PhoenixButton>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-black">
                  {lifeArea.name}
                </h1>
                <p className="text-sm text-black">
                  {lifeArea.phoenixName}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(lifeArea.status)}`}>
                {lifeArea.status.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Life Area Overview Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-phoenix-gold/20"
          style={{ borderLeftColor: lifeArea.color, borderLeftWidth: '4px' }}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Score */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                {getScoreIcon(lifeArea.score)}
                <span className="text-2xl font-bold ml-2">
                  {lifeArea.score > 0 ? '+' : ''}{lifeArea.score}
                </span>
              </div>
              <p className="text-sm text-black">Current Score</p>
            </div>

            {/* Momentum */}
            <div className="text-center">
              <div className="text-2xl font-bold text-black mb-2">
                {(lifeArea.momentum * 100).toFixed(0)}%
              </div>
              <p className="text-sm text-black">Momentum</p>
            </div>

            {/* Activity */}
            <div className="text-center">
              <div className="text-2xl font-bold text-black mb-2">
                {lifeArea.stats.totalJournals}
              </div>
              <p className="text-sm text-black">Journal Entries</p>
            </div>

            {/* Last Activity */}
            <div className="text-center">
              <div className="text-2xl font-bold text-black mb-2">
                {Math.floor((Date.now() - lifeArea.stats.lastActivity.getTime()) / (1000 * 60 * 60 * 24))}d
              </div>
              <p className="text-sm text-black">Days Since Activity</p>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <Link href={`/journal?area=${lifeArea.id}`}>
            <PhoenixButton variant="primary" className="w-full">
              <PenTool className="w-4 h-4 mr-2" />
              Journal Entry
            </PhoenixButton>
          </Link>
          
          <Link href={`/reset?area=${lifeArea.id}`}>
            <PhoenixButton variant="secondary" className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset Ritual
            </PhoenixButton>
          </Link>
          
          <Link href={`/fulfillment?focus=${lifeArea.id}`}>
            <PhoenixButton variant="ghost" className="w-full">
              <Users className="w-4 h-4 mr-2" />
              Relationships
            </PhoenixButton>
          </Link>
          
          <PhoenixButton variant="ghost" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </PhoenixButton>
        </motion.div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'journal', label: 'Journal History', icon: PenTool },
              { id: 'relationships', label: 'Relationships', icon: Users },
              { id: 'insights', label: 'Insights', icon: TrendingUp },
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-phoenix-orange text-black'
                      : 'border-transparent text-black hover:text-black hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {/* Weekly Trend Chart */}
                <div className="bg-white rounded-2xl shadow-xl p-6 border border-phoenix-gold/20">
                  <h3 className="text-lg font-semibold mb-4">Weekly Trend</h3>
                  <div className="flex items-end justify-between h-32 gap-2">
                    {lifeArea.weeklyData.map((day) => (
                      <div key={day.day} className="flex flex-col items-center flex-1">
                        <div
                          className="w-full bg-phoenix-orange rounded-t transition-all hover:bg-phoenix-red"
                          style={{
                            height: `${Math.max(10, ((day.score + 3) / 6) * 100)}%`,
                          }}
                        />
                        <span className="text-xs text-black mt-2">{day.day}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Events */}
                <div className="bg-white rounded-2xl shadow-xl p-6 border border-phoenix-gold/20">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Recent Events</h3>
                    <span className="text-sm text-black">Last 7 days</span>
                  </div>
                  <div className="space-y-4">
                    {lifeArea.recentEvents.map((event) => {
                      const Icon = eventIcons[event.type]
                      return (
                        <div key={event.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className={`p-2 rounded-full ${eventColors[event.type]}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{event.title}</h4>
                            <p className="text-sm text-black">{event.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="w-3 h-3 text-black" />
                              <span className="text-xs text-black">
                                {event.date.toLocaleDateString()}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded ${
                                event.impact > 0 ? 'bg-green-100 text-black' : 
                                event.impact < 0 ? 'bg-red-100 text-black' : 
                                'bg-gray-100 text-black'
                              }`}>
                                Impact: {event.impact > 0 ? '+' : ''}{event.impact}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'journal' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-2xl shadow-xl p-6 border border-phoenix-gold/20">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Recent Journal Entries</h3>
                    <Link href={`/journal?area=${lifeArea.id}`}>
                      <PhoenixButton variant="ghost" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        New Entry
                      </PhoenixButton>
                    </Link>
                  </div>
                  <div className="space-y-4">
                    {/* Mock journal entries */}
                    {[
                      {
                        id: '1',
                        title: 'Morning reflection on client boundaries',
                        excerpt: 'Had a difficult conversation with a demanding client today. Realized I need to be clearer about my availability and scope of work...',
                        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                        mood: 'challenging',
                        tags: ['boundaries', 'clients', 'growth']
                      },
                      {
                        id: '2',
                        title: 'Career vision clarity session',
                        excerpt: 'Spent time visualizing where I want to be in 3 years. Feeling more aligned with my purpose and excited about upcoming projects...',
                        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                        mood: 'great',
                        tags: ['vision', 'purpose', 'future']
                      },
                      {
                        id: '3',
                        title: 'Productivity system review',
                        excerpt: 'Analyzing what worked and what didn\'t this week. Need to adjust my time blocking approach and be more realistic about task estimates...',
                        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                        mood: 'okay',
                        tags: ['productivity', 'systems', 'time-management']
                      }
                    ].map((entry) => (
                      <div key={entry.id} className="p-4 border border-gray-200 rounded-lg hover:border-phoenix-orange/50 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-black">{entry.title}</h4>
                          <div className="flex items-center gap-2">
                            <span className={`text-lg ${
                              entry.mood === 'great' ? '😊' : 
                              entry.mood === 'okay' ? '😐' : '😔'
                            }`}>
                              {entry.mood === 'great' ? '😊' : 
                               entry.mood === 'okay' ? '😐' : '😔'}
                            </span>
                            <span className="text-xs text-black">
                              {entry.date.toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-black mb-3 line-clamp-2">{entry.excerpt}</p>
                        <div className="flex flex-wrap gap-1">
                          {entry.tags.map((tag) => (
                            <span key={tag} className="text-xs px-2 py-1 bg-phoenix-gold/10 text-black rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'relationships' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-2xl shadow-xl p-6 border border-phoenix-gold/20">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Relationship Details</h3>
                    <Link href={`/fulfillment?focus=${lifeArea.id}`}>
                      <PhoenixButton variant="ghost" size="sm">
                        <Users className="w-4 h-4 mr-2" />
                        Manage All
                      </PhoenixButton>
                    </Link>
                  </div>
                  <div className="space-y-6">
                    {lifeArea.relationships.map((rel) => (
                      <div key={rel.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-black">{rel.name}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${urgencyColors[rel.urgency]}`}>
                            {rel.urgency.toUpperCase()}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-black">Contact Frequency:</span>
                            <div className="font-medium">{rel.frequency}/10</div>
                          </div>
                          <div>
                            <span className="text-black">Last Contact:</span>
                            <div className="font-medium">{rel.lastContact} days ago</div>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="flex gap-2">
                            <PhoenixButton variant="ghost" size="sm">
                              <Calendar className="w-3 h-3 mr-1" />
                              Schedule
                            </PhoenixButton>
                            <PhoenixButton variant="ghost" size="sm">
                              Contact Now
                            </PhoenixButton>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'insights' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-2xl shadow-xl p-6 border border-phoenix-gold/20">
                  <h3 className="text-lg font-semibold mb-4">AI Insights</h3>
                  <div className="space-y-4">
                    {lifeArea.insights.map((insight, index) => (
                      <div key={index} className="p-4 border-l-4 border-phoenix-orange bg-phoenix-gold/5 rounded-r-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{insight.title}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${urgencyColors[insight.urgency]}`}>
                            {insight.urgency.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-black">{insight.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Relationships */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-phoenix-gold/20">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-black" />
                Key Relationships
              </h3>
              <div className="space-y-3">
                {lifeArea.relationships.map((rel) => (
                  <div key={rel.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{rel.name}</p>
                      <p className="text-xs text-black">
                        Last contact: {rel.lastContact} days ago
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${urgencyColors[rel.urgency]}`}>
                      {rel.urgency}
                    </span>
                  </div>
                ))}
              </div>
              <Link href={`/fulfillment?focus=${lifeArea.id}`}>
                <PhoenixButton variant="ghost" size="sm" className="w-full mt-4">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Relationships
                </PhoenixButton>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-phoenix-gold/20">
              <h3 className="text-lg font-semibold mb-4">Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-black">Total Resets</span>
                  <span className="font-medium">{lifeArea.stats.totalResets}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-black">Weekly Activity</span>
                  <span className="font-medium">{lifeArea.stats.avgWeeklyActivity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-black">Relationships</span>
                  <span className="font-medium">{lifeArea.stats.totalRelationships}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-black">Drift Level</span>
                  <span className={`font-medium ${
                    lifeArea.drift > 0 ? 'text-black' : 
                    lifeArea.drift < -0.1 ? 'text-black' : 
                    'text-black'
                  }`}>
                    {(lifeArea.drift * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}