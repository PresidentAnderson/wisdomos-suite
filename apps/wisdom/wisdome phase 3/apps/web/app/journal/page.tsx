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
                <BookOpen className="w-6 h-6 text-phoenix-gold" />
                <h1 className="text-xl font-semibold text-black">Journal</h1>
              </div>
            </div>
            <PhoenixButton onClick={handleNewEntry}>
              <Plus className="w-4 h-4 mr-1" />
              New Entry
            </PhoenixButton>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Entries</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <BookOpen className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">This Week</p>
                  <p className="text-2xl font-bold">{stats.thisWeek}</p>
                </div>
                <Calendar className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">This Month</p>
                  <p className="text-2xl font-bold">{stats.thisMonth}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">With Rituals</p>
                  <p className="text-2xl font-bold">{stats.withRitual}</p>
                </div>
                <Heart className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {/* Search */}
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search entries..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-phoenix-orange focus:border-transparent"
                  />
                </div>
              </div>

              {/* Type Filter */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-phoenix-orange focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="journal">Journal</option>
                <option value="voice">Voice</option>
                <option value="reflection">Reflection</option>
              </select>

              {/* Mood Filter */}
              <select
                value={selectedMood}
                onChange={(e) => setSelectedMood(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-phoenix-orange focus:border-transparent"
              >
                <option value="">All Moods</option>
                {Object.entries(MOOD_EMOJIS).map(([key, emoji]) => (
                  <option key={key} value={key}>
                    {emoji} {key}
                  </option>
                ))}
              </select>

              {/* Life Area Filter */}
              <select
                value={selectedLifeArea}
                onChange={(e) => setSelectedLifeArea(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-phoenix-orange focus:border-transparent"
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
              <div className="flex items-center gap-2 mt-4">
                <span className="text-sm text-gray-500">Active filters:</span>
                {searchQuery && (
                  <Badge variant="secondary">
                    Search: {searchQuery}
                    <button
                      onClick={() => setSearchQuery('')}
                      className="ml-1 text-xs hover:text-red-500"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {selectedMood && (
                  <Badge variant="secondary">
                    {MOOD_EMOJIS[selectedMood as keyof typeof MOOD_EMOJIS]} {selectedMood}
                    <button
                      onClick={() => setSelectedMood('')}
                      className="ml-1 text-xs hover:text-red-500"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {selectedLifeArea && (
                  <Badge variant="secondary">
                    {lifeAreas.find(a => a.id === selectedLifeArea)?.name}
                    <button
                      onClick={() => setSelectedLifeArea('')}
                      className="ml-1 text-xs hover:text-red-500"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {selectedType !== 'all' && (
                  <Badge variant="secondary">
                    Type: {selectedType}
                    <button
                      onClick={() => setSelectedType('all')}
                      className="ml-1 text-xs hover:text-red-500"
                    >
                      ×
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Entries List */}
        <div className="space-y-4">
          {filteredEntries.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  {entries.length === 0 
                    ? 'No journal entries yet. Start writing!' 
                    : 'No entries match your filters.'}
                </p>
                <PhoenixButton
                  onClick={handleNewEntry}
                  className="mt-4"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Create Your First Entry
                </PhoenixButton>
              </CardContent>
            </Card>
          ) : (
            filteredEntries.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.01 }}
              >
                <Card 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleEditEntry(entry)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {entry.title}
                          </h3>
                          {entry.mood && (
                            <span className="text-2xl" title={entry.mood}>
                              {MOOD_EMOJIS[entry.mood as keyof typeof MOOD_EMOJIS]}
                            </span>
                          )}
                          {entry.resetRitualApplied && (
                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                              <Heart className="w-3 h-3 mr-1" />
                              Ritual Applied
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
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
                      <Badge variant="outline">
                        {entry.type}
                      </Badge>
                    </div>

                    <p className="text-gray-700 mb-4 line-clamp-3">
                      {entry.body}
                    </p>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Tags */}
                      {entry.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          #{tag}
                        </Badge>
                      ))}
                      
                      {/* Life Areas */}
                      {entry.linkedLifeAreas?.map((areaId) => {
                        const area = lifeAreas.find(a => a.id === areaId)
                        return area ? (
                          <Badge key={areaId} variant="outline">
                            {area.icon} {area.name}
                          </Badge>
                        ) : null
                      })}
                      
                      {/* People */}
                      {entry.linkedPeople?.map((person) => (
                        <Badge key={person} variant="outline">
                          @{person}
                        </Badge>
                      ))}
                      
                      {/* Autobiography Year */}
                      {entry.autobiographyYear && (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700">
                          📅 {entry.autobiographyYear}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>

        {/* Mood Distribution */}
        {Object.keys(stats.moodCounts).length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Mood Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {Object.entries(stats.moodCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([mood, count]) => (
                    <div
                      key={mood}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg"
                    >
                      <span className="text-2xl">
                        {MOOD_EMOJIS[mood as keyof typeof MOOD_EMOJIS]}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{mood}</p>
                        <p className="text-xs text-gray-500">{count} entries</p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
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