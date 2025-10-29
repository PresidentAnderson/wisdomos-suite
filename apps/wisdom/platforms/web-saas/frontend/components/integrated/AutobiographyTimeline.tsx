'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Circle, ChevronLeft, ChevronRight, Clock, Star, TrendingUp, User } from 'lucide-react'
import { AutobiographyTimeline as TimelineType, YearEntry } from '@/types/integrated-display'

interface AutobiographyTimelineProps {
  data?: TimelineType
  onUpdate?: (data: TimelineType) => void
}

export default function AutobiographyTimeline({ data, onUpdate }: AutobiographyTimelineProps) {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [viewMode, setViewMode] = useState<'timeline' | 'detail'>('timeline')
  const timelineRef = useRef<HTMLDivElement>(null)

  // Generate 125 years (birth year - 25 to birth year + 100)
  const currentYear = new Date().getFullYear()
  const birthYear = data?.birthYear || 1990
  const years = Array.from({ length: 125 }, (_, i) => birthYear - 25 + i)

  // Demo data
  const timelineData: TimelineType = data || {
    userId: 'demo',
    birthYear,
    currentAge: currentYear - birthYear,
    entries: [
      {
        year: birthYear,
        events: [
          {
            id: '1',
            title: 'Born',
            description: 'Beginning of the journey',
            date: new Date(birthYear, 0, 1),
            category: 'milestone',
            emotionalCharge: 5,
            completed: true
          }
        ],
        people: [],
        mood: 'thriving',
        commitments: [],
        insights: [],
        completionStatus: 'partial'
      },
      {
        year: currentYear,
        events: [
          {
            id: '2',
            title: 'Present Moment',
            description: 'Living in the now',
            date: new Date(),
            category: 'milestone',
            emotionalCharge: 3,
            completed: false
          }
        ],
        people: [
          {
            id: '1',
            name: 'Self',
            relationship: 'Primary',
            impact: 'transformative',
            stillPresent: true
          }
        ],
        mood: 'growing',
        commitments: ['Live authentically', 'Contribute naturally'],
        insights: ['Every moment is a choice point'],
        completionStatus: 'partial'
      }
    ],
    futureProjections: [
      {
        year: currentYear + 5,
        vision: 'Living in full alignment with purpose',
        commitments: ['Master the craft', 'Build community'],
        desiredState: 'Thriving in all life areas',
        milestones: ['Launch major project', 'Create lasting impact']
      },
      {
        year: currentYear + 10,
        vision: 'Legacy work in full flow',
        commitments: ['Mentor next generation', 'Complete major work'],
        desiredState: 'Wisdom integrated and shared',
        milestones: ['Book published', 'Community thriving']
      }
    ],
    patterns: [
      {
        id: '1',
        name: 'Cycles of Growth',
        description: 'Every 7 years brings major transformation',
        yearsPresent: [birthYear + 7, birthYear + 14, birthYear + 21, birthYear + 28],
        category: 'spiritual',
        resolved: false
      }
    ]
  }

  const getYearData = (year: number): YearEntry | undefined => {
    return timelineData.entries.find(e => e.year === year)
  }

  const getYearColor = (year: number): string => {
    const entry = getYearData(year)
    if (!entry) return 'bg-gray-200'
    
    const moodColors = {
      thriving: 'bg-green-500',
      growing: 'bg-blue-500',
      challenging: 'bg-yellow-500',
      transforming: 'bg-purple-500'
    }
    
    return moodColors[entry.mood] || 'bg-gray-300'
  }

  const getCompletionOpacity = (year: number): string => {
    const entry = getYearData(year)
    if (!entry) return 'opacity-30'
    
    const completionOpacity = {
      empty: 'opacity-30',
      partial: 'opacity-60',
      complete: 'opacity-100'
    }
    
    return completionOpacity[entry.completionStatus] || 'opacity-30'
  }

  const scrollToYear = (year: number) => {
    const element = document.getElementById(`year-${year}`)
    if (element && timelineRef.current) {
      const container = timelineRef.current
      const elementRect = element.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()
      const scrollLeft = element.offsetLeft - containerRect.width / 2 + elementRect.width / 2
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' })
    }
  }

  useEffect(() => {
    scrollToYear(selectedYear)
  }, [selectedYear])

  return (
    <div className="bg-white rounded-xl p-6 border border-phoenix-gold/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-phoenix-indigo to-phoenix-red rounded-lg">
            <Clock className="w-6 h-6 text-black" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-black">Autobiography Timeline</h2>
            <p className="text-sm text-black">125 Years of Your Story</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-3 py-1 rounded ${viewMode === 'timeline' ? 'bg-phoenix-gold text-black' : 'bg-gray-100'}`}
          >
            Timeline
          </button>
          <button
            onClick={() => setViewMode('detail')}
            className={`px-3 py-1 rounded ${viewMode === 'detail' ? 'bg-phoenix-gold text-black' : 'bg-gray-100'}`}
          >
            Detail
          </button>
        </div>
      </div>

      {/* Current Age Indicator */}
      <div className="mb-4 p-3 bg-phoenix-gold/10 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-black">
            Current Age: {timelineData.currentAge} years
          </span>
          <span className="text-sm text-black">
            Year {currentYear} | Born {birthYear}
          </span>
        </div>
      </div>

      {/* Timeline View */}
      {viewMode === 'timeline' && (
        <>
          {/* Year Navigation */}
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => setSelectedYear(Math.max(years[0], selectedYear - 10))}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <input
              type="number"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              min={years[0]}
              max={years[years.length - 1]}
              className="w-20 px-2 py-1 border rounded text-center"
            />
            <button
              onClick={() => setSelectedYear(Math.min(years[years.length - 1], selectedYear + 10))}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => setSelectedYear(currentYear)}
              className="ml-2 px-3 py-1 bg-phoenix-orange text-black rounded text-sm"
            >
              Today
            </button>
          </div>

          {/* Scrollable Timeline */}
          <div
            ref={timelineRef}
            className="overflow-x-auto pb-4 mb-4"
            style={{ scrollBehavior: 'smooth' }}
          >
            <div className="flex gap-1" style={{ width: `${years.length * 30}px` }}>
              {years.map((year) => {
                const isSelected = year === selectedYear
                const isCurrent = year === currentYear
                const isFuture = year > currentYear
                const isPast = year < birthYear
                const entry = getYearData(year)
                
                return (
                  <div
                    key={year}
                    id={`year-${year}`}
                    onClick={() => setSelectedYear(year)}
                    className={`
                      w-7 h-32 rounded cursor-pointer transition-all
                      ${isSelected ? 'ring-2 ring-phoenix-orange scale-110' : ''}
                      ${isCurrent ? 'ring-2 ring-phoenix-red' : ''}
                      ${isPast ? 'opacity-30' : ''}
                      ${isFuture ? 'border-2 border-dashed border-gray-300' : ''}
                    `}
                  >
                    <div
                      className={`
                        h-full rounded flex flex-col items-center justify-end p-1
                        ${getYearColor(year)} ${getCompletionOpacity(year)}
                      `}
                    >
                      {/* Year label every 5 years */}
                      {year % 5 === 0 && (
                        <div className="text-[8px] text-black font-bold rotate-90 origin-center">
                          {year}
                        </div>
                      )}
                      
                      {/* Special markers */}
                      {isCurrent && <Circle className="w-3 h-3 text-black mb-1" />}
                      {entry?.events.some(e => e.category === 'milestone') && (
                        <Star className="w-3 h-3 text-black mb-1" />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Color Legend */}
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded" />
              <span className="text-xs">Thriving</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded" />
              <span className="text-xs">Growing</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500 rounded" />
              <span className="text-xs">Challenging</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-purple-500 rounded" />
              <span className="text-xs">Transforming</span>
            </div>
          </div>
        </>
      )}

      {/* Selected Year Details */}
      <div className="border-t pt-4">
        <h3 className="font-semibold text-black mb-3">
          Year {selectedYear} {selectedYear === currentYear && '(Current)'}
        </h3>
        
        {(() => {
          const entry = getYearData(selectedYear)
          const futureProjection = timelineData.futureProjections.find(p => p.year === selectedYear)
          
          if (futureProjection) {
            return (
              <div className="space-y-3">
                <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                  <h4 className="font-medium text-black mb-2">Future Vision</h4>
                  <p className="text-sm text-black">{futureProjection.vision}</p>
                  <div className="mt-2">
                    <p className="text-xs font-medium text-black mb-1">Desired State:</p>
                    <p className="text-sm italic">{futureProjection.desiredState}</p>
                  </div>
                  {futureProjection.milestones.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-black mb-1">Milestones:</p>
                      <div className="flex flex-wrap gap-1">
                        {futureProjection.milestones.map((m, i) => (
                          <span key={i} className="text-xs bg-white px-2 py-1 rounded">
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          }
          
          if (entry) {
            return (
              <div className="space-y-3">
                {/* Events */}
                {entry.events.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-black mb-2">Events</h4>
                    <div className="space-y-2">
                      {entry.events.map((event) => (
                        <div key={event.id} className="p-2 bg-gray-50 rounded">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">{event.title}</span>
                            <span className="text-xs text-black">{event.category}</span>
                          </div>
                          {event.description && (
                            <p className="text-xs text-black mt-1">{event.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* People */}
                {entry.people.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-black mb-2">People</h4>
                    <div className="flex flex-wrap gap-2">
                      {entry.people.map((person) => (
                        <div key={person.id} className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded">
                          <User className="w-3 h-3 text-black" />
                          <span className="text-xs">{person.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Commitments */}
                {entry.commitments.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-black mb-2">Commitments</h4>
                    <div className="space-y-1">
                      {entry.commitments.map((commitment, i) => (
                        <div key={i} className="text-xs bg-phoenix-gold/10 px-2 py-1 rounded">
                          {commitment}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          }
          
          return (
            <div className="text-sm text-black italic">
              No entries for this year yet. Click to add memories, events, or projections.
            </div>
          )
        })()}
      </div>

      {/* Patterns Section */}
      {timelineData.patterns.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <h3 className="font-semibold text-black mb-2">Recognized Patterns</h3>
          <div className="space-y-2">
            {timelineData.patterns.map((pattern) => (
              <div key={pattern.id} className="p-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{pattern.name}</span>
                  <TrendingUp className="w-4 h-4 text-black" />
                </div>
                <p className="text-xs text-black mt-1">{pattern.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}