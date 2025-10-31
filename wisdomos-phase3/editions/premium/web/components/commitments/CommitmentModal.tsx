'use client'

import { useState, useEffect } from 'react'
import { X, Target, Calendar, Tag, Users, CheckCircle } from 'lucide-react'
import { Button } from '../ui/button'
import { Card } from '../ui/card'

interface LifeArea {
  id: string
  name: string
  phoenixName?: string
  icon?: string
  color?: string
  status?: 'BREAKDOWN' | 'ATTENTION' | 'THRIVING'
  score?: number
}

interface CommitmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (commitment: any) => void
  lifeAreas?: LifeArea[]
}

export function CommitmentModal({ isOpen, onClose, onSubmit, lifeAreas = [] }: CommitmentModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    lifeAreaId: '',
    size: 'medium' as 'small' | 'medium' | 'large' | 'epic',
    targetDate: '',
    tags: [] as string[],
    milestones: [] as { title: string; targetDate?: string }[],
  })

  const [tagInput, setTagInput] = useState('')
  const [milestoneInput, setMilestoneInput] = useState('')

  // Load life areas from fulfillment display
  useEffect(() => {
    loadLifeAreas()
  }, [])

  const loadLifeAreas = async () => {
    try {
      // Check localStorage for life areas from fulfillment display
      const storedLifeAreas = localStorage.getItem('wisdomos_life_areas')
      if (storedLifeAreas) {
        const areas = JSON.parse(storedLifeAreas)
        // Areas will be passed as props, but we can also check localStorage as fallback
      }

      // Also check for canonical life areas
      const canonicalAreas = [
        { id: 'work-purpose', name: 'Work & Purpose', icon: '💼', color: 'bg-blue-500' },
        { id: 'creativity-expression', name: 'Creativity & Expression', icon: '🎨', color: 'bg-purple-500' },
        { id: 'community-contribution', name: 'Community & Contribution', icon: '🤝', color: 'bg-green-500' },
        { id: 'personal-growth', name: 'Personal Growth & Wisdom', icon: '🌱', color: 'bg-indigo-500' },
        { id: 'health-wellness', name: 'Health & Wellness', icon: '❤️', color: 'bg-red-500' },
        { id: 'financial-abundance', name: 'Financial Abundance', icon: '💰', color: 'bg-yellow-500' },
        { id: 'material-comfort', name: 'Material Comfort', icon: '🏡', color: 'bg-orange-500' },
        { id: 'relationships-love', name: 'Relationships & Love', icon: '💑', color: 'bg-pink-500' },
        { id: 'adventure-experiences', name: 'Adventure & Experiences', icon: '🌍', color: 'bg-teal-500' },
      ]

      // Use canonical areas if no custom areas
      if (!lifeAreas || lifeAreas.length === 0) {
        // Will be passed from parent
      }
    } catch (error) {
      console.error('Error loading life areas:', error)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.lifeAreaId) {
      alert('Please fill in required fields')
      return
    }
    onSubmit(formData)
    resetForm()
    onClose()
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      lifeAreaId: '',
      size: 'medium',
      targetDate: '',
      tags: [],
      milestones: [],
    })
    setTagInput('')
    setMilestoneInput('')
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }))
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))
  }

  const addMilestone = () => {
    if (milestoneInput.trim()) {
      setFormData(prev => ({ 
        ...prev, 
        milestones: [...prev.milestones, { title: milestoneInput.trim() }] 
      }))
      setMilestoneInput('')
    }
  }

  const removeMilestone = (index: number) => {
    setFormData(prev => ({ 
      ...prev, 
      milestones: prev.milestones.filter((_, i) => i !== index) 
    }))
  }

  const sizeOptions = [
    { value: 'small', label: 'Small', description: 'Quick win (1-7 days)' },
    { value: 'medium', label: 'Medium', description: 'Moderate effort (1-4 weeks)' },
    { value: 'large', label: 'Large', description: 'Significant project (1-3 months)' },
    { value: 'epic', label: 'Epic', description: 'Major undertaking (3+ months)' },
  ]

  // Get default life areas if none provided
  const defaultLifeAreas: LifeArea[] = [
    { id: 'work-purpose', name: 'Work & Purpose', icon: '💼', color: 'bg-blue-500' },
    { id: 'creativity-expression', name: 'Creativity & Expression', icon: '🎨', color: 'bg-purple-500' },
    { id: 'community-contribution', name: 'Community & Contribution', icon: '🤝', color: 'bg-green-500' },
    { id: 'personal-growth', name: 'Personal Growth & Wisdom', icon: '🌱', color: 'bg-indigo-500' },
    { id: 'health-wellness', name: 'Health & Wellness', icon: '❤️', color: 'bg-red-500' },
    { id: 'financial-abundance', name: 'Financial Abundance', icon: '💰', color: 'bg-yellow-500' },
    { id: 'material-comfort', name: 'Material Comfort', icon: '🏡', color: 'bg-orange-500' },
    { id: 'relationships-love', name: 'Relationships & Love', icon: '💑', color: 'bg-pink-500' },
    { id: 'adventure-experiences', name: 'Adventure & Experiences', icon: '🌍', color: 'bg-teal-500' },
  ]

  const displayLifeAreas = lifeAreas && lifeAreas.length > 0 ? lifeAreas : defaultLifeAreas

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Add New Commitment</h2>
              <p className="text-sm text-gray-500 mt-1">Make a promise to yourself and track your progress</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Commitment title"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your commitment"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Life Area */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Life Area <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.lifeAreaId}
                onChange={(e) => setFormData(prev => ({ ...prev, lifeAreaId: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select a life area</option>
                {displayLifeAreas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.icon} {area.name} {area.phoenixName ? `(${area.phoenixName})` : ''}
                    {area.score !== undefined ? ` - ${area.score}%` : ''}
                  </option>
                ))}
              </select>
              {formData.lifeAreaId && (
                <div className="mt-2">
                  {(() => {
                    const selectedArea = displayLifeAreas.find(a => a.id === formData.lifeAreaId)
                    return selectedArea ? (
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${selectedArea.color || 'bg-gray-500'} text-white`}>
                        <span className="mr-2">{selectedArea.icon}</span>
                        {selectedArea.name}
                      </div>
                    ) : null
                  })()}
                </div>
              )}
            </div>

            {/* Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Size
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {sizeOptions.map((size) => (
                  <button
                    key={size.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, size: size.value as any }))}
                    className={`p-3 rounded-lg border-2 transition ${
                      formData.size === size.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-sm font-medium">{size.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{size.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Target Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Date
              </label>
              <input
                type="date"
                value={formData.targetDate}
                onChange={(e) => setFormData(prev => ({ ...prev, targetDate: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Add a tag"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Button type="button" onClick={addTag} variant="secondary">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700"
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Milestones */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Milestones
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={milestoneInput}
                  onChange={(e) => setMilestoneInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMilestone())}
                  placeholder="Add a milestone"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Button type="button" onClick={addMilestone} variant="secondary">
                  Add
                </Button>
              </div>
              <div className="space-y-2">
                {formData.milestones.map((milestone, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm">{milestone.title}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMilestone(index)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                Add Commitment
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
}