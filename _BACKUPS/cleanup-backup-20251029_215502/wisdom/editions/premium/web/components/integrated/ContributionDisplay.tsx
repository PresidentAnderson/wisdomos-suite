'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Heart, Award, Plus, Tag, Quote, X, Save, Edit2, Trash2, Activity, Briefcase, Palette, Users } from 'lucide-react'
import { useContributions } from '@/hooks/useContributions'

interface ContributionDisplayProps {
  data?: any
  onUpdate?: (data: any) => void
}

// Category configuration with enhanced categories
const categories = [
  { id: 'Being', label: 'Being', icon: Heart, color: 'bg-purple-500' },
  { id: 'Doing', label: 'Doing', icon: Briefcase, color: 'bg-blue-500' },
  { id: 'Creating', label: 'Creating', icon: Palette, color: 'bg-green-500' },
  { id: 'Transforming', label: 'Transforming', icon: Sparkles, color: 'bg-orange-500' },
  { id: 'Having', label: 'Having', icon: Award, color: 'bg-indigo-500' },
]

export default function ContributionDisplay({ data, onUpdate }: ContributionDisplayProps) {
  const { contributions, statistics, loading, createContribution, updateContribution, deleteContribution } = useContributions()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isAddingContribution, setIsAddingContribution] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    category: 'Doing' as 'Being' | 'Doing' | 'Having',
    title: '',
    description: '',
    contributions: [''],
    impact: '',
    commitment: '',
    tags: [] as string[],
    visibility: 'private' as 'private' | 'shared' | 'public'
  })

  // Calculate statistics by category
  const getCategoryStats = (categoryId: string) => {
    const categoryContributions = contributions.filter(c => c.category === categoryId)
    const uniqueAreas = new Set(categoryContributions.flatMap(c => c.tags || []))
    return {
      count: categoryContributions.length,
      areas: uniqueAreas.size
    }
  }

  // Calculate total impact
  const totalImpact = contributions.length

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await updateContribution(editingId, formData)
        setEditingId(null)
      } else {
        await createContribution(formData)
      }
      setIsAddingContribution(false)
      resetForm()
    } catch (error) {
      console.error('Error saving contribution:', error)
    }
  }

  const handleEdit = (contribution: any) => {
    setFormData({
      category: contribution.category as 'Being' | 'Doing' | 'Having',
      title: contribution.title,
      description: contribution.description || '',
      contributions: contribution.contributions || [''],
      impact: contribution.impact || '',
      commitment: contribution.commitment || '',
      tags: contribution.tags || [],
      visibility: contribution.visibility || 'private'
    })
    setEditingId(contribution.id)
    setIsAddingContribution(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this contribution?')) {
      await deleteContribution(id)
    }
  }

  const resetForm = () => {
    setFormData({
      category: 'Doing',
      title: '',
      description: '',
      contributions: [''],
      impact: '',
      commitment: '',
      tags: [],
      visibility: 'private'
    })
  }

  const addContributionBullet = () => {
    setFormData(prev => ({
      ...prev,
      contributions: [...prev.contributions, '']
    }))
  }

  const updateContributionBullet = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      contributions: prev.contributions.map((c, i) => i === index ? value : c)
    }))
  }

  const removeContributionBullet = (index: number) => {
    setFormData(prev => ({
      ...prev,
      contributions: prev.contributions.filter((_, i) => i !== index)
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-black mb-2">My Contribution Architecture</h2>
        <p className="text-black">Define and track your unique contributions to the world</p>
      </div>

      {/* Active Contributions Section - Moved to top */}
      <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-black flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Active Contributions
          </h3>
          <button
            onClick={() => setIsAddingContribution(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            <Plus className="w-4 h-4" />
            Add Contribution
          </button>
        </div>

        {contributions.length === 0 ? (
          <p className="text-black text-center py-8">
            No contributions yet. Start by adding your first contribution!
          </p>
        ) : (
          <div className="space-y-4">
            {contributions.slice(0, 5).map((contribution) => (
              <motion.div
                key={contribution.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-4 rounded-lg shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 text-xs font-semibold text-white rounded ${
                        categories.find(c => c.id === contribution.category)?.color || 'bg-gray-500'
                      }`}>
                        {contribution.category}
                      </span>
                      <h4 className="font-semibold text-black">{contribution.title}</h4>
                    </div>
                    {contribution.description && (
                      <p className="text-black text-sm mb-2">{contribution.description}</p>
                    )}
                    {contribution.impact && (
                      <p className="text-black text-sm flex items-center gap-1">
                        <span className="font-semibold">Impact:</span> {contribution.impact}
                      </p>
                    )}
                    {contribution.tags && contribution.tags.length > 0 && (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {contribution.tags.map((tag, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-100 text-black text-xs rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(contribution)}
                      className="p-2 text-gray-600 hover:text-blue-500 transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(contribution.id)}
                      className="p-2 text-gray-600 hover:text-red-500 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Category Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {categories.map((category) => {
          const stats = getCategoryStats(category.id)
          const Icon = category.icon
          
          return (
            <motion.div
              key={category.id}
              whileHover={{ scale: 1.02 }}
              className={`p-4 rounded-xl ${category.color} bg-opacity-10 border-2 border-transparent hover:border-current cursor-pointer`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-6 h-6 ${category.color.replace('bg-', 'text-')}`} />
                <span className="text-2xl font-bold text-black">{stats.count}</span>
              </div>
              <h4 className="font-semibold text-black">{category.label}</h4>
              <p className="text-sm text-black">
                {stats.areas} {stats.areas === 1 ? 'area' : 'areas'}
              </p>
            </motion.div>
          )
        })}
      </div>

      {/* Total Impact Footer */}
      <div className="mt-8 p-6 bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl text-center">
        <h3 className="text-lg font-semibold text-black mb-2">Total Impact Footprint</h3>
        <p className="text-4xl font-bold text-black">{totalImpact}</p>
        <p className="text-sm text-black mt-1">Active Contributions</p>
      </div>

      {/* Add/Edit Contribution Modal */}
      <AnimatePresence>
        {isAddingContribution && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-black">
                  {editingId ? 'Edit Contribution' : 'Add New Contribution'}
                </h3>
                <button
                  onClick={() => {
                    setIsAddingContribution(false)
                    setEditingId(null)
                    resetForm()
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Category Selection */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Category</label>
                  <div className="grid grid-cols-3 gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setFormData(prev => ({ ...prev, category: cat.id as 'Being' | 'Doing' | 'Having' }))}
                        className={`p-2 rounded-lg border-2 transition ${
                          formData.category === cat.id
                            ? `${cat.color} text-white border-transparent`
                            : 'border-gray-200 text-black hover:border-gray-300'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500"
                    placeholder="e.g., Software Design"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500"
                    rows={3}
                    placeholder="Describe your contribution..."
                  />
                </div>

                {/* Contribution Bullets */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Contribution Points</label>
                  {formData.contributions.map((bullet, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={bullet}
                        onChange={(e) => updateContributionBullet(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500"
                        placeholder="Add a contribution point..."
                      />
                      {formData.contributions.length > 1 && (
                        <button
                          onClick={() => removeContributionBullet(index)}
                          className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addContributionBullet}
                    className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                  >
                    + Add another point
                  </button>
                </div>

                {/* Impact */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Impact</label>
                  <input
                    type="text"
                    value={formData.impact}
                    onChange={(e) => setFormData(prev => ({ ...prev, impact: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500"
                    placeholder="What impact does this have?"
                  />
                </div>

                {/* Commitment */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Commitment</label>
                  <input
                    type="text"
                    value={formData.commitment}
                    onChange={(e) => setFormData(prev => ({ ...prev, commitment: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500"
                    placeholder="Your commitment to this contribution"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.tags.join(', ')}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      tags: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500"
                    placeholder="e.g., technology, innovation, community"
                  />
                </div>

                {/* Visibility */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Visibility</label>
                  <select
                    value={formData.visibility}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      visibility: e.target.value as 'private' | 'shared' | 'public'
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-500"
                  >
                    <option value="private">Private</option>
                    <option value="shared">Shared</option>
                    <option value="public">Public</option>
                  </select>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-4">
                  <button
                    onClick={() => {
                      setIsAddingContribution(false)
                      setEditingId(null)
                      resetForm()
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                  >
                    {editingId ? 'Update' : 'Save'} Contribution
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}