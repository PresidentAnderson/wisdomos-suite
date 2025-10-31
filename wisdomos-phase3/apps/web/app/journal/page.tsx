'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, 
  BookOpen, 
  Filter,
  Calendar,
  TrendingUp,
  Heart,
  Brain,
  Target,
  Search,
  ChevronLeft
} from 'lucide-react'
import Link from 'next/link'
import PhoenixButton from '@/components/ui/PhoenixButton'
import { JournalModal } from '@/components/journal/JournalModal'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { JournalEntry, MOOD_EMOJIS } from '@/types/journal'
import { useLifeAreas } from '@/contexts/LifeAreasContext'

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | undefined>()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMood, setSelectedMood] = useState('')
  const [selectedLifeArea, setSelectedLifeArea] = useState('')
  const [selectedType, setSelectedType] = useState<'all' | 'journal' | 'voice' | 'reflection'>('all')
  const { lifeAreas } = useLifeAreas()

  useEffect(() => {
    loadEntries()
  }, [])

  useEffect(() => {
    filterEntries()
  }, [entries, searchQuery, selectedMood, selectedLifeArea, selectedType])

  const loadEntries = () => {
    const stored = localStorage.getItem('wisdomos_journals')
    if (stored) {
      const journals = JSON.parse(stored)
      setEntries(journals.sort((a: JournalEntry, b: JournalEntry) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ))
    }
  }

  const filterEntries = () => {
    let filtered = [...entries]

    if (searchQuery) {
      filtered = filtered.filter(e => 
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    if (selectedMood) {
      filtered = filtered.filter(e => e.mood === selectedMood)
    }

    if (selectedLifeArea) {
      filtered = filtered.filter(e => e.linkedLifeAreas?.includes(selectedLifeArea))
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(e => e.type === selectedType)
    }

    setFilteredEntries(filtered)
  }

  const handleSaveEntry = (entry: JournalEntry) => {
    loadEntries()
  }

  const handleEditEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry)
    setIsModalOpen(true)
  }

  const handleNewEntry = () => {
    setSelectedEntry(undefined)
    setIsModalOpen(true)
  }

  const getStats = () => {
    const today = new Date()
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    return {
      total: entries.length,
      thisWeek: entries.filter(e => new Date(e.createdAt) >= thisWeek).length,
      thisMonth: entries.filter(e => new Date(e.createdAt) >= thisMonth).length,
      withRitual: entries.filter(e => e.resetRitualApplied).length,
      moodCounts: entries.reduce((acc, e) => {
        if (e.mood) {
          acc[e.mood] = (acc[e.mood] || 0) + 1
        }
        return acc
      }, {} as Record<string, number>)
    }
  }

  const stats = getStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-50 dark:from-slate-950 dark:via-amber-950/20 dark:to-orange-950/20">
      {/* Header */}
      <header className="border-b border-amber-200/50 dark:border-amber-800/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors text-sm flex items-center gap-2">
                <ChevronLeft className="w-4 h-4" />
                Back to Dashboard
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Journal</h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Capture your wisdom and growth</p>
                </div>
              </div>
            </div>
            <button
              onClick={handleNewEntry}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium"
            >
              <Plus className="w-5 h-5" />
              New Entry
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-amber-200 dark:border-amber-800 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <BookOpen className="w-10 h-10 text-amber-600 dark:text-amber-400" />
              <div className="text-right">
                <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.total}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Total Entries</div>
              </div>
            </div>
            <div className="w-full bg-amber-200 dark:bg-amber-800 rounded-full h-1.5">
              <div className="bg-gradient-to-r from-amber-500 to-orange-600 h-1.5 rounded-full" style={{width: '75%'}} />
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <Calendar className="w-10 h-10 text-green-600 dark:text-green-400" />
              <div className="text-right">
                <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.thisWeek}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">This Week</div>
              </div>
            </div>
            <div className="w-full bg-green-200 dark:bg-green-800 rounded-full h-1.5">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-1.5 rounded-full" style={{width: stats.total > 0 ? `${(stats.thisWeek / stats.total) * 100}%` : '0%'}} />
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <TrendingUp className="w-10 h-10 text-purple-600 dark:text-purple-400" />
              <div className="text-right">
                <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.thisMonth}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">This Month</div>
              </div>
            </div>
            <div className="w-full bg-purple-200 dark:bg-purple-800 rounded-full h-1.5">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 h-1.5 rounded-full" style={{width: stats.total > 0 ? `${(stats.thisMonth / stats.total) * 100}%` : '0%'}} />
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-900/20 dark:to-red-900/20 rounded-xl p-6 border border-rose-200 dark:border-rose-800 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <Heart className="w-10 h-10 text-rose-600 dark:text-rose-400" />
              <div className="text-right">
                <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.withRitual}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">With Rituals</div>
              </div>
            </div>
            <div className="w-full bg-rose-200 dark:bg-rose-800 rounded-full h-1.5">
              <div className="bg-gradient-to-r from-rose-500 to-red-600 h-1.5 rounded-full" style={{width: stats.total > 0 ? `${(stats.withRitual / stats.total) * 100}%` : '0%'}} />
            </div>
          </motion.div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-xl mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
              <Filter className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Filters & Search</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search titles, content, tags..."
                  className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                />
              </div>
            </div>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-900 dark:text-white transition-all"
            >
              <option value="all">All Types</option>
              <option value="journal">📝 Journal</option>
              <option value="voice">🎤 Voice</option>
              <option value="reflection">💭 Reflection</option>
            </select>

            {/* Mood Filter */}
            <select
              value={selectedMood}
              onChange={(e) => setSelectedMood(e.target.value)}
              className="px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-900 dark:text-white transition-all"
            >
              <option value="">All Moods</option>
              {Object.entries(MOOD_EMOJIS).map(([key, emoji]) => (
                <option key={key} value={key}>
                  {emoji} {key.charAt(0).toUpperCase() + key.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Life Area Filter - Full Width */}
          <div className="mt-4">
            <select
              value={selectedLifeArea}
              onChange={(e) => setSelectedLifeArea(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-900 dark:text-white transition-all"
            >
              <option value="">All Life Areas</option>
              {lifeAreas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.icon} {area.name}
                </option>
              ))}
            </select>
          </div>

          {/* Active Filters */}
          {(searchQuery || selectedMood || selectedLifeArea || selectedType !== 'all') && (
            <div className="flex flex-wrap items-center gap-2 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Active filters:</span>
              {searchQuery && (
                <span className="px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg text-sm font-medium flex items-center gap-2">
                  Search: {searchQuery}
                  <button
                    onClick={() => setSearchQuery('')}
                    className="hover:text-amber-900 dark:hover:text-amber-200 transition-colors"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedMood && (
                <span className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-medium flex items-center gap-2">
                  {MOOD_EMOJIS[selectedMood as keyof typeof MOOD_EMOJIS]} {selectedMood.charAt(0).toUpperCase() + selectedMood.slice(1)}
                  <button
                    onClick={() => setSelectedMood('')}
                    className="hover:text-blue-900 dark:hover:text-blue-200 transition-colors"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedLifeArea && (
                <span className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg text-sm font-medium flex items-center gap-2">
                  {lifeAreas.find(a => a.id === selectedLifeArea)?.icon} {lifeAreas.find(a => a.id === selectedLifeArea)?.name}
                  <button
                    onClick={() => setSelectedLifeArea('')}
                    className="hover:text-purple-900 dark:hover:text-purple-200 transition-colors"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedType !== 'all' && (
                <span className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium flex items-center gap-2">
                  Type: {selectedType}
                  <button
                    onClick={() => setSelectedType('all')}
                    className="hover:text-green-900 dark:hover:text-green-200 transition-colors"
                  >
                    ×
                  </button>
                </span>
              )}
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedMood('')
                  setSelectedLifeArea('')
                  setSelectedType('all')
                }}
                className="px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </motion.div>

        {/* Entries List */}
        <div className="space-y-4">
          {filteredEntries.length === 0 ? (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-12 border border-amber-200/50 dark:border-amber-800/50 shadow-xl text-center"
            >
              <div className="max-w-md mx-auto">
                <div className="inline-flex p-6 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-full mb-6">
                  <BookOpen className="w-16 h-16 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                  {entries.length === 0
                    ? 'No journal entries yet'
                    : 'No entries match your filters'}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-8">
                  {entries.length === 0
                    ? 'Your story starts here — each reflection builds your WisdomOS. Begin your transformation journey today.'
                    : 'Try adjusting your filters to see more entries, or create a new one to continue your journey.'}
                </p>
                <button
                  onClick={handleNewEntry}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-200 font-medium text-lg"
                >
                  <Plus className="w-5 h-5" />
                  {entries.length === 0 ? 'Create Your First Entry' : 'New Entry'}
                </button>
              </div>
            </motion.div>
          ) : (
            filteredEntries.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + (index * 0.05) }}
                whileHover={{ scale: 1.01, y: -2 }}
                className="cursor-pointer"
                onClick={() => handleEditEntry(entry)}
              >
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-2xl transition-all duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                          {entry.title}
                        </h3>
                        {entry.mood && (
                          <span className="text-2xl" title={entry.mood}>
                            {MOOD_EMOJIS[entry.mood as keyof typeof MOOD_EMOJIS]}
                          </span>
                        )}
                        {entry.resetRitualApplied && (
                          <span className="px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-xs font-medium flex items-center gap-1.5">
                            <Heart className="w-3.5 h-3.5" />
                            Ritual
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(entry.createdAt).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                      entry.type === 'journal' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                      entry.type === 'voice' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' :
                      'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    }`}>
                      {entry.type === 'journal' ? '📝' : entry.type === 'voice' ? '🎤' : '💭'} {entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}
                    </span>
                  </div>

                  <p className="text-slate-700 dark:text-slate-300 mb-4 line-clamp-3 leading-relaxed">
                    {entry.body}
                  </p>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Tags */}
                    {entry.tags.map((tag) => (
                      <span key={tag} className="px-2.5 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg text-xs font-medium">
                        #{tag}
                      </span>
                    ))}

                    {/* Life Areas */}
                    {entry.linkedLifeAreas?.map((areaId) => {
                      const area = lifeAreas.find(a => a.id === areaId)
                      return area ? (
                        <span key={areaId} className="px-2.5 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-lg text-xs font-medium flex items-center gap-1">
                          {area.icon} {area.name}
                        </span>
                      ) : null
                    })}

                    {/* People */}
                    {entry.linkedPeople?.map((person) => (
                      <span key={person} className="px-2.5 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg text-xs font-medium">
                        @{person}
                      </span>
                    ))}

                    {/* Autobiography Year */}
                    {entry.autobiographyYear && (
                      <span className="px-2.5 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 rounded-lg text-xs font-medium">
                        📅 {entry.autobiographyYear}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Mood Distribution */}
        {Object.keys(stats.moodCounts).length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Mood Distribution</h3>
              <span className="ml-auto text-sm text-slate-600 dark:text-slate-400">
                {Object.keys(stats.moodCounts).length} different moods tracked
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(stats.moodCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([mood, count]) => {
                  const percentage = ((count / stats.total) * 100).toFixed(1)
                  return (
                    <div
                      key={mood}
                      className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl">
                          {MOOD_EMOJIS[mood as keyof typeof MOOD_EMOJIS]}
                        </span>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white capitalize">{mood}</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">{count} entries</p>
                        </div>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-amber-500 to-orange-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 text-right">
                        {percentage}%
                      </p>
                    </div>
                  )
                })}
            </div>
          </motion.div>
        )}
      </main>

      {/* Journal Modal */}
      <JournalModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedEntry(undefined)
        }}
        entry={selectedEntry}
        lifeAreas={lifeAreas}
        onSave={handleSaveEntry}
      />
    </div>
  )
}