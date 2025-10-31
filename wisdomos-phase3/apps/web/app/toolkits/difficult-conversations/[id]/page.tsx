'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ChevronLeft,
  CheckCircle2,
  Circle,
  Lightbulb,
  Clock,
  TrendingUp,
  Download,
  Share2,
  BookmarkPlus,
  Play
} from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import PhoenixButton from '@/components/ui/PhoenixButton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface DifficultConversationToolkit {
  id: string
  area: string
  category: string
  title: string
  description: string
  color: string
  icon: string
  phoenixPhase: string
  difficulty: string
  estimatedTime: string
  steps?: string[]
  tips?: string[]
}

export default function ToolkitDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [toolkit, setToolkit] = useState<DifficultConversationToolkit | null>(null)
  const [loading, setLoading] = useState(true)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [showNotes, setShowNotes] = useState(false)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    fetchToolkit()
  }, [params.id])

  async function fetchToolkit() {
    try {
      const response = await fetch('/api/toolkits/difficult-conversations')
      const data = await response.json()
      const found = data.find((t: DifficultConversationToolkit) => t.id === params.id)

      if (found) {
        setToolkit(found)
        // Load saved progress from localStorage
        const saved = localStorage.getItem(`toolkit_progress_${params.id}`)
        if (saved) {
          const progress = JSON.parse(saved)
          setCompletedSteps(new Set(progress.completedSteps || []))
          setNotes(progress.notes || '')
        }
      }
    } catch (error) {
      console.error('Failed to fetch toolkit:', error)
    } finally {
      setLoading(false)
    }
  }

  function toggleStep(index: number) {
    const newCompleted = new Set(completedSteps)
    if (newCompleted.has(index)) {
      newCompleted.delete(index)
    } else {
      newCompleted.add(index)
    }
    setCompletedSteps(newCompleted)

    // Save progress
    localStorage.setItem(`toolkit_progress_${params.id}`, JSON.stringify({
      completedSteps: Array.from(newCompleted),
      notes
    }))
  }

  function saveNotes() {
    localStorage.setItem(`toolkit_progress_${params.id}`, JSON.stringify({
      completedSteps: Array.from(completedSteps),
      notes
    }))
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

  if (!toolkit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-phoenix-smoke via-white to-phoenix-gold/10 flex items-center justify-center">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500 mb-4">Toolkit not found</p>
            <Link href="/toolkits/difficult-conversations">
              <PhoenixButton>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to Toolkits
              </PhoenixButton>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const progress = toolkit.steps ? (completedSteps.size / toolkit.steps.length) * 100 : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-phoenix-smoke via-white to-phoenix-gold/10">
      {/* Header */}
      <header className="border-b border-phoenix-gold/20 bg-white/80 backdrop-blur-lg sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/toolkits/difficult-conversations">
              <PhoenixButton variant="ghost" size="sm">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to Toolkits
              </PhoenixButton>
            </Link>
            <div className="flex items-center gap-2">
              <PhoenixButton variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-1" />
                Share
              </PhoenixButton>
              <PhoenixButton variant="outline" size="sm">
                <BookmarkPlus className="w-4 h-4 mr-1" />
                Save
              </PhoenixButton>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toolkit Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className={`bg-${toolkit.color}-50 border-${toolkit.color}-200`}>
            <CardContent className="p-8">
              <div className="flex items-start gap-6">
                <div className="text-6xl">{toolkit.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{toolkit.area}</Badge>
                    <Badge className={getDifficultyColor(toolkit.difficulty)}>
                      {toolkit.difficulty}
                    </Badge>
                    <Badge className={getPhaseColor(toolkit.phoenixPhase)}>
                      Phoenix: {toolkit.phoenixPhase}
                    </Badge>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-3">
                    {toolkit.title}
                  </h1>
                  <p className="text-gray-700 text-lg mb-4">
                    {toolkit.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {toolkit.estimatedTime}
                    </div>
                    {toolkit.steps && (
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        {toolkit.steps.length} steps
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Progress Bar */}
        {toolkit.steps && toolkit.steps.length > 0 && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Progress: {completedSteps.size} of {toolkit.steps.length} completed
                </span>
                <span className="text-sm font-semibold text-phoenix-orange">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                  className="bg-gradient-to-r from-phoenix-orange to-phoenix-gold h-3 rounded-full"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Steps */}
        {toolkit.steps && toolkit.steps.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="w-5 h-5 text-phoenix-orange" />
                Conversation Steps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {toolkit.steps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      completedSteps.has(index)
                        ? 'bg-green-50 border-green-300'
                        : 'bg-white border-gray-200 hover:border-phoenix-gold'
                    }`}
                    onClick={() => toggleStep(index)}
                  >
                    <div className="flex-shrink-0 mt-1">
                      {completedSteps.has(index) ? (
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-gray-500">
                          Step {index + 1}
                        </span>
                      </div>
                      <p className={`${completedSteps.has(index) ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {step}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        {toolkit.tips && toolkit.tips.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                Helpful Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {toolkit.tips.map((tip, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg"
                  >
                    <span className="text-yellow-500 font-bold">💡</span>
                    <p className="text-gray-700 text-sm">{tip}</p>
                  </motion.li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Your Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={saveNotes}
              placeholder="Take notes about your conversation plan, key points to remember, or reflections after the conversation..."
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-phoenix-orange focus:border-transparent text-gray-900"
            />
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Notes are saved automatically to your browser
              </p>
              <PhoenixButton size="sm" onClick={saveNotes}>
                Save Notes
              </PhoenixButton>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
