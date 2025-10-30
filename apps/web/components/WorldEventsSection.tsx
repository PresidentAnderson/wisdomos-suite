'use client'

/**
 * World Events Section Component
 *
 * Displays world events for a given year with toggle between manual entry and AI generation.
 * Integrates with OpenAI for AI-assisted event generation.
 * Supports feature flags for bulk generation, curation mode, and regional relevance.
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  Globe,
  Sparkles,
  Edit3,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Loader2,
  Download,
  MapPin
} from 'lucide-react'
import PhoenixButton from '@/components/ui/PhoenixButton'
import { FEATURE_FLAGS, isFeatureEnabled } from '@/config/features'

interface WorldEvent {
  date: string
  title: string
  description: string
  category: 'political' | 'cultural' | 'technological' | 'natural' | 'social' | 'economic'
  significance: 'global' | 'regional' | 'local'
  region?: string
  tags: string[]
}

interface WorldEventsSectionProps {
  year: number
  onEventsGenerated?: (events: WorldEvent[]) => void
  userRegion?: string
}

export default function WorldEventsSection({
  year,
  onEventsGenerated,
  userRegion
}: WorldEventsSectionProps) {
  const [mode, setMode] = useState<'manual' | 'ai'>('ai')
  const [events, setEvents] = useState<WorldEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedEvent, setExpandedEvent] = useState<number | null>(null)
  const [editingEvent, setEditingEvent] = useState<number | null>(null)
  const [manualEvent, setManualEvent] = useState<Partial<WorldEvent>>({
    category: 'political',
    significance: 'global',
    tags: []
  })

  // Load events on mount
  useEffect(() => {
    if (mode === 'ai' && events.length === 0) {
      fetchWorldEvents()
    }
  }, [year, mode])

  /**
   * Fetch world events from API
   */
  async function fetchWorldEvents() {
    setLoading(true)
    setError(null)

    try {
      const url = new URL(`/api/world-events/${year}`, window.location.origin)
      
      // Add region parameter if regional relevance is enabled
      if (isFeatureEnabled('REGIONAL_RELEVANCE') && userRegion) {
        url.searchParams.set('region', userRegion)
      }

      const response = await fetch(url.toString())
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch world events')
      }

      const data = await response.json()
      setEvents(data.events)
      onEventsGenerated?.(data.events)
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching world events:', err)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Add a manual event
   */
  function addManualEvent() {
    if (!manualEvent.title || !manualEvent.description || !manualEvent.date) {
      alert('Please fill in all required fields')
      return
    }

    const newEvent: WorldEvent = {
      date: manualEvent.date!,
      title: manualEvent.title!,
      description: manualEvent.description!,
      category: manualEvent.category || 'political',
      significance: manualEvent.significance || 'global',
      region: manualEvent.region,
      tags: manualEvent.tags || []
    }

    setEvents([...events, newEvent])
    setManualEvent({
      category: 'political',
      significance: 'global',
      tags: []
    })
    onEventsGenerated?.([...events, newEvent])
  }

  /**
   * Edit an existing event (curation mode)
   */
  function editEvent(index: number, updatedEvent: WorldEvent) {
    const newEvents = [...events]
    newEvents[index] = updatedEvent
    setEvents(newEvents)
    setEditingEvent(null)
    onEventsGenerated?.(newEvents)
  }

  /**
   * Delete an event
   */
  function deleteEvent(index: number) {
    const newEvents = events.filter((_, i) => i !== index)
    setEvents(newEvents)
    onEventsGenerated?.(newEvents)
  }

  /**
   * Get category color
   */
  function getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      political: 'bg-blue-100 text-blue-800 border-blue-300',
      cultural: 'bg-purple-100 text-purple-800 border-purple-300',
      technological: 'bg-green-100 text-green-800 border-green-300',
      natural: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      social: 'bg-pink-100 text-pink-800 border-pink-300',
      economic: 'bg-orange-100 text-orange-800 border-orange-300'
    }
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-300'
  }

  /**
   * Export events as JSON
   */
  function exportEvents() {
    const dataStr = JSON.stringify(events, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
    const exportFileDefaultName = `world-events-${year}.json`

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Globe className="w-6 h-6 text-phoenix-orange" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">World Events in {year}</h2>
            <p className="text-sm text-gray-600">Historical context for your autobiography</p>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setMode('ai')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              mode === 'ai'
                ? 'bg-white text-phoenix-orange shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Sparkles className="w-4 h-4 inline mr-1" />
            AI-Assisted
          </button>
          <button
            onClick={() => setMode('manual')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              mode === 'manual'
                ? 'bg-white text-phoenix-orange shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Edit3 className="w-4 h-4 inline mr-1" />
            Manual
          </button>
        </div>
      </div>

      {/* Regional Filter (if enabled) */}
      {isFeatureEnabled('REGIONAL_RELEVANCE') && userRegion && mode === 'ai' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-600" />
          <span className="text-sm text-blue-800">
            Showing events relevant to <strong>{userRegion}</strong>
          </span>
        </div>
      )}

      {/* AI Mode */}
      {mode === 'ai' && (
        <div className="space-y-4">
          {/* Generate Button */}
          {events.length === 0 && !loading && (
            <PhoenixButton onClick={fetchWorldEvents} className="w-full">
              <Sparkles className="w-4 h-4 mr-2" />
              Generate World Events with AI
            </PhoenixButton>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 text-phoenix-orange animate-spin mx-auto mb-3" />
              <p className="text-gray-600">Generating historical events...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
              <PhoenixButton
                onClick={fetchWorldEvents}
                size="sm"
                variant="secondary"
                className="mt-3"
              >
                Try Again
              </PhoenixButton>
            </div>
          )}
        </div>
      )}

      {/* Manual Mode */}
      {mode === 'manual' && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Add Event Manually</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={manualEvent.date || ''}
                onChange={(e) => setManualEvent({ ...manualEvent, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-phoenix-orange focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={manualEvent.category}
                onChange={(e) => setManualEvent({ ...manualEvent, category: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-phoenix-orange focus:border-transparent"
              >
                <option value="political">Political</option>
                <option value="cultural">Cultural</option>
                <option value="technological">Technological</option>
                <option value="natural">Natural</option>
                <option value="social">Social</option>
                <option value="economic">Economic</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={manualEvent.title || ''}
              onChange={(e) => setManualEvent({ ...manualEvent, title: e.target.value })}
              placeholder="Event title"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-phoenix-orange focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={manualEvent.description || ''}
              onChange={(e) => setManualEvent({ ...manualEvent, description: e.target.value })}
              placeholder="Event description"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-phoenix-orange focus:border-transparent"
            />
          </div>

          <PhoenixButton onClick={addManualEvent}>
            <Check className="w-4 h-4 mr-2" />
            Add Event
          </PhoenixButton>
        </div>
      )}

      {/* Events List */}
      {events.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {events.length} event{events.length !== 1 ? 's' : ''} found
            </p>
            <PhoenixButton onClick={exportEvents} size="sm" variant="secondary">
              <Download className="w-4 h-4 mr-2" />
              Export JSON
            </PhoenixButton>
          </div>

          {events.map((event, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
            >
              {/* Event Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-gray-500">
                      {new Date(event.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded border ${getCategoryColor(event.category)}`}>
                      {event.category}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{event.title}</h3>
                  <p className="text-sm text-gray-600">{event.description}</p>
                </div>

                {/* Actions */}
                {isFeatureEnabled('CURATION_MODE') && (
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => setEditingEvent(index)}
                      className="p-1 text-gray-400 hover:text-phoenix-orange transition-colors"
                      title="Edit event"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteEvent(index)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete event"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Event Tags */}
              {event.tags && event.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {event.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
