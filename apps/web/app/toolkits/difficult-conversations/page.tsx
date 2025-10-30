'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare,
  Filter,
  Clock,
  TrendingUp,
  ChevronLeft,
  Search,
  Sparkles,
  Target,
  Flame
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PhoenixButton from '@/components/ui/PhoenixButton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface DifficultConversationToolkit {
  id: string
  area: string
  category: 'work' | 'relationships' | 'finance' | 'family' | 'personal' | 'spiritual' | 'legacy'
  title: string
  description: string
  color: string
  icon: string
  phoenixPhase: 'ashes' | 'fire' | 'rebirth' | 'flight'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: string
  steps?: string[]
  tips?: string[]
}

const CATEGORIES = [
  { id: 'all', label: 'All Conversations', icon: '💬', color: 'gray' },
  { id: 'work', label: 'Work & Career', icon: '💼', color: 'blue' },
  { id: 'relationships', label: 'Relationships', icon: '❤️', color: 'rose' },
  { id: 'finance', label: 'Finance', icon: '💰', color: 'yellow' },
  { id: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦', color: 'violet' },
  { id: 'personal', label: 'Personal Growth', icon: '🌱', color: 'green' },
  { id: 'spiritual', label: 'Spiritual', icon: '🕊️', color: 'emerald' },
  { id: 'legacy', label: 'Legacy', icon: '🌟', color: 'slate' }
]

const PHOENIX_PHASES = [
  { id: 'all', label: 'All Phases', color: 'gray' },
  { id: 'ashes', label: 'Ashes (Reflection)', color: 'gray' },
  { id: 'fire', label: 'Fire (Breakthrough)', color: 'orange' },
  { id: 'rebirth', label: 'Rebirth (Growth)', color: 'purple' },
  { id: 'flight', label: 'Flight (Mastery)', color: 'blue' }
]

const DIFFICULTY_LEVELS = [
  { id: 'all', label: 'All Levels' },
  { id: 'beginner', label: 'Beginner', color: 'green' },
  { id: 'intermediate', label: 'Intermediate', color: 'yellow' },
  { id: 'advanced', label: 'Advanced', color: 'red' }
]

export default function DifficultConversationsPage() {
  const router = useRouter()
  const [toolkits, setToolkits] = useState<DifficultConversationToolkit[]>([])
  const [filteredToolkits, setFilteredToolkits] = useState<DifficultConversationToolkit[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedPhase, setSelectedPhase] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')

  useEffect(() => {
    fetchToolkits()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [toolkits, searchQuery, selectedCategory, selectedPhase, selectedDifficulty])

  async function fetchToolkits() {
    try {
      const response = await fetch('/api/toolkits/difficult-conversations')
      const data = await response.json()
      setToolkits(data)
    } catch (error) {
      console.error('Failed to fetch toolkits:', error)
    } finally {
      setLoading(false)
    }
  }

  function applyFilters() {
    let filtered = [...toolkits]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.area.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory)
    }

    // Phoenix phase filter
    if (selectedPhase !== 'all') {
      filtered = filtered.filter(t => t.phoenixPhase === selectedPhase)
    }

    // Difficulty filter
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(t => t.difficulty === selectedDifficulty)
    }

    setFilteredToolkits(filtered)
  }

  function getDifficultyColor(difficulty: string) {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700'
      case 'intermediate': return 'bg-yellow-100 text-yellow-700'
      case 'advanced': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  function getPhaseColor(phase: string) {
    switch (phase) {
      case 'ashes': return 'bg-gray-100 text-gray-700'
      case 'fire': return 'bg-orange-100 text-orange-700'
      case 'rebirth': return 'bg-purple-100 text-purple-700'
      case 'flight': return 'bg-blue-100 text-blue-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-phoenix-smoke via-white to-phoenix-gold/10 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-phoenix-orange border-t-transparent rounded-full"
        />
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
              <Link href="/">
                <PhoenixButton variant="ghost" size="sm">
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </PhoenixButton>
              </Link>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-phoenix-gold" />
                <h1 className="text-xl font-semibold text-black">
                  Difficult Conversations Toolkit
                </h1>
              </div>
            </div>
            <Badge variant="outline" className="bg-phoenix-gold/10">
              <Flame className="w-3 h-3 mr-1" />
              {filteredToolkits.length} Tools
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Intro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-phoenix-orange/10 to-phoenix-gold/10 border-phoenix-gold/30">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-phoenix-orange/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-phoenix-orange" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-black mb-2">
                    Navigate Challenging Conversations with Confidence
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Choose a toolkit that matches your current challenge. Each toolkit provides structured guidance,
                    conversation steps, and proven strategies to help you communicate effectively and preserve relationships
                    while honoring your boundaries.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter Toolkits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search conversations..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-phoenix-orange focus:border-transparent"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Life Area
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedCategory === category.id
                          ? 'bg-phoenix-orange text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span className="mr-1">{category.icon}</span>
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Phoenix Phase Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phoenix Phase
                </label>
                <div className="flex flex-wrap gap-2">
                  {PHOENIX_PHASES.map((phase) => (
                    <button
                      key={phase.id}
                      onClick={() => setSelectedPhase(phase.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedPhase === phase.id
                          ? 'bg-phoenix-orange text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {phase.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level
                </label>
                <div className="flex flex-wrap gap-2">
                  {DIFFICULTY_LEVELS.map((level) => (
                    <button
                      key={level.id}
                      onClick={() => setSelectedDifficulty(level.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedDifficulty === level.id
                          ? 'bg-phoenix-orange text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Toolkits Grid */}
        <AnimatePresence mode="popLayout">
          {filteredToolkits.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card>
                <CardContent className="py-12 text-center">
                  <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    No toolkits match your filters. Try adjusting your search.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredToolkits.map((toolkit, index) => (
                <motion.div
                  key={toolkit.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  className="cursor-pointer"
                  onClick={() => router.push(`/toolkits/difficult-conversations/${toolkit.id}`)}
                >
                  <Card className={`h-full bg-${toolkit.color}-50 border-${toolkit.color}-200 hover:shadow-xl transition-all`}>
                    <CardHeader>
                      <div className="flex items-start justify-between mb-3">
                        <div className="text-4xl">{toolkit.icon}</div>
                        <div className="flex flex-col gap-1">
                          <Badge className={getDifficultyColor(toolkit.difficulty)}>
                            {toolkit.difficulty}
                          </Badge>
                          <Badge className={getPhaseColor(toolkit.phoenixPhase)}>
                            {toolkit.phoenixPhase}
                          </Badge>
                        </div>
                      </div>
                      <CardTitle className="text-lg">{toolkit.area}</CardTitle>
                      <h3 className="text-xl font-bold text-gray-900 mt-2">
                        {toolkit.title}
                      </h3>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700 mb-4">
                        {toolkit.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {toolkit.estimatedTime}
                        </div>
                        {toolkit.steps && (
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {toolkit.steps.length} steps
                          </div>
                        )}
                      </div>
                      <PhoenixButton
                        className="w-full mt-4"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/toolkits/difficult-conversations/${toolkit.id}`)
                        }}
                      >
                        Open Template →
                      </PhoenixButton>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
