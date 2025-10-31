/**
 * EventForm Component
 *
 * Multi-step reflective form for adding life events
 */

'use client'

import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

interface EventFormProps {
  lifeAreaId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

type EventType = 'BREAKTHROUGH' | 'PROGRESS' | 'SETBACK' | 'UPSET' | 'MILESTONE' | 'PATTERN' | 'LEARNING'
type EventCategory = 'PERSONAL' | 'RELATIONAL' | 'PROFESSIONAL' | 'HEALTH' | 'SPIRITUAL' | 'FINANCIAL' | 'CREATIVE' | 'OTHER'
type EventTone = 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'TRANSFORMATIONAL' | 'COMPLEX'

export function EventForm({ lifeAreaId, onSuccess, onCancel }: EventFormProps) {
  const { token } = useAuth()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    lifeAreaId: lifeAreaId || '',
    type: '' as EventType,
    category: '' as EventCategory,
    tone: '' as EventTone,
    title: '',
    description: '',
    narrative: '',
    occurredAt: new Date().toISOString().slice(0, 16),
    emotionalCharge: 0,
    tags: [] as string[]
  })

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          occurredAt: new Date(formData.occurredAt).toISOString()
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create event')
      }

      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const eventTypes: { value: EventType; label: string; emoji: string }[] = [
    { value: 'BREAKTHROUGH', label: 'Breakthrough', emoji: '💡' },
    { value: 'PROGRESS', label: 'Progress', emoji: '📈' },
    { value: 'SETBACK', label: 'Setback', emoji: '📉' },
    { value: 'UPSET', label: 'Upset', emoji: '😔' },
    { value: 'MILESTONE', label: 'Milestone', emoji: '🎯' },
    { value: 'PATTERN', label: 'Pattern', emoji: '🔄' },
    { value: 'LEARNING', label: 'Learning', emoji: '📚' }
  ]

  const categories: { value: EventCategory; label: string }[] = [
    { value: 'PERSONAL', label: 'Personal' },
    { value: 'RELATIONAL', label: 'Relational' },
    { value: 'PROFESSIONAL', label: 'Professional' },
    { value: 'HEALTH', label: 'Health' },
    { value: 'SPIRITUAL', label: 'Spiritual' },
    { value: 'FINANCIAL', label: 'Financial' },
    { value: 'CREATIVE', label: 'Creative' },
    { value: 'OTHER', label: 'Other' }
  ]

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full">
      {/* Progress Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`w-1/4 h-2 rounded-full mx-1 ${
                s <= step ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <p className="text-sm text-gray-600 text-center">
          Step {step} of 4
        </p>
      </div>

      {/* Step 1: What happened? */}
      {step === 1 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">What happened?</h2>
          <p className="text-gray-600 mb-6">
            Choose the type of event that best describes what occurred.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {eventTypes.map((type) => (
              <button
                key={type.value}
                onClick={() =>
                  setFormData({ ...formData, type: type.value })
                }
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.type === type.value
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="text-3xl mb-2">{type.emoji}</div>
                <div className="font-medium">{type.label}</div>
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Brief title for this event"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}

      {/* Step 2: How did it feel? */}
      {step === 2 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">How did it feel?</h2>
          <p className="text-gray-600 mb-6">
            Reflect on the emotional impact of this event.
          </p>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Emotional Charge (-5 to +5)
            </label>
            <input
              type="range"
              min="-5"
              max="5"
              value={formData.emotionalCharge}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  emotionalCharge: Number(e.target.value)
                })
              }
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>Very Negative</span>
              <span className="font-bold text-lg">
                {formData.emotionalCharge}
              </span>
              <span>Very Positive</span>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  category: e.target.value as EventCategory
                })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a category...</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              When did this happen?
            </label>
            <input
              type="datetime-local"
              value={formData.occurredAt}
              onChange={(e) =>
                setFormData({ ...formData, occurredAt: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* Step 3: Tell the story */}
      {step === 3 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Tell the story</h2>
          <p className="text-gray-600 mb-6">
            What happened? How did you respond? What did you learn?
          </p>

          <textarea
            placeholder="Describe what happened in detail..."
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
          />

          <textarea
            placeholder="What insights or reflections do you have? (optional)"
            value={formData.narrative}
            onChange={(e) =>
              setFormData({ ...formData, narrative: e.target.value })
            }
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}

      {/* Step 4: Review */}
      {step === 4 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Review & Submit</h2>
          <p className="text-gray-600 mb-6">
            Review your event before submitting.
          </p>

          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div>
              <span className="text-sm text-gray-600">Type:</span>
              <p className="font-medium">{formData.type}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Title:</span>
              <p className="font-medium">{formData.title}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Emotional Charge:</span>
              <p className="font-medium">{formData.emotionalCharge}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Description:</span>
              <p className="text-sm">{formData.description}</p>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <button
          onClick={() => (step > 1 ? setStep(step - 1) : onCancel?.())}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          disabled={loading}
        >
          {step === 1 ? 'Cancel' : 'Back'}
        </button>

        <button
          onClick={() => (step < 4 ? setStep(step + 1) : handleSubmit())}
          disabled={
            loading ||
            (step === 1 && (!formData.type || !formData.title)) ||
            (step === 2 && !formData.category) ||
            (step === 3 && !formData.description)
          }
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : step === 4 ? 'Submit' : 'Next'}
        </button>
      </div>
    </div>
  )
}
