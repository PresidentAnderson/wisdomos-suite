'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Star,
  Heart,
  Shield,
  Zap,
  Brain,
  Users,
  Target,
  ChevronLeft,
  Plus,
  Edit,
  Save,
  X,
  Sparkles,
  Globe,
  Lightbulb,
  Rocket
} from 'lucide-react'
import Link from 'next/link'
import PhoenixButton from '@/components/ui/PhoenixButton'

interface ContributionArea {
  id: string
  category: 'being' | 'doing' | 'creating' | 'transforming'
  title: string
  description: string
  icon: React.ElementType
  color: string
  contributions: string[]
  impact: string
  commitment: string
}

const defaultContributions: ContributionArea[] = [
  {
    id: '1',
    category: 'being',
    title: 'Phoenix Rising',
    description: 'Who I am in the world',
    icon: Sparkles,
    color: '#FFD700',
    contributions: [
      'Living embodiment of transformation',
      'Fierce protector of boundaries',
      'Architect of collaborative systems',
      'Guardian of sovereignty'
    ],
    impact: 'My presence creates safety and possibility for others',
    commitment: 'I am the space where patterns complete and new capacities emerge'
  },
  {
    id: '2',
    category: 'doing',
    title: 'Liberation Architect',
    description: 'What I do in service',
    icon: Rocket,
    color: '#E63946',
    contributions: [
      'Build systems that free human potential',
      'Create tools for personal sovereignty',
      'Design frameworks for transformation',
      'Deploy agents of liberation'
    ],
    impact: 'My actions systematically remove barriers to human flourishing',
    commitment: 'I architect systems that make transformation inevitable'
  },
  {
    id: '3',
    category: 'creating',
    title: 'Wisdom Synthesizer',
    description: 'What I create for others',
    icon: Lightbulb,
    color: '#FF914D',
    contributions: [
      'WisdomOS transformation platform',
      'Pattern recognition frameworks',
      'Boundary setting tools',
      'Liberation methodologies'
    ],
    impact: 'My creations become tools for others\' transformation',
    commitment: 'I create artifacts that outlive me and serve generations'
  },
  {
    id: '4',
    category: 'transforming',
    title: 'Pattern Alchemist',
    description: 'How I transform reality',
    icon: Brain,
    color: '#8B5CF6',
    contributions: [
      'Turn trauma into wisdom',
      'Convert patterns into capacities',
      'Transform wounds into gifts',
      'Alchemize pain into purpose'
    ],
    impact: 'My transformation creates permission for others to transform',
    commitment: 'I demonstrate that all patterns are workable and changeable'
  }
]

const categoryColors: Record<string, string> = {
  being: 'bg-yellow-100 text-black border-yellow-300',
  doing: 'bg-red-100 text-black border-red-300',
  creating: 'bg-orange-100 text-black border-orange-300',
  transforming: 'bg-purple-100 text-black border-purple-300'
}

export default function ContributionDisplayPage() {
  const [contributions, setContributions] = useState<ContributionArea[]>(defaultContributions)
  const [editingArea, setEditingArea] = useState<ContributionArea | null>(null)
  const [showAddContribution, setShowAddContribution] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [myStatement, setMyStatement] = useState<string>('')
  const [editingStatement, setEditingStatement] = useState(false)

  // Load from localStorage
  useEffect(() => {
    const storedContributions = localStorage.getItem('wisdomos_contributions')
    const storedStatement = localStorage.getItem('wisdomos_contribution_statement')
    
    if (storedContributions) {
      setContributions(JSON.parse(storedContributions))
    }
    if (storedStatement) {
      setMyStatement(storedStatement)
    } else {
      setMyStatement('I am contribution. My life is the gift I give to the world.')
    }
  }, [])

  // Save to localStorage
  const saveContributions = (newContributions: ContributionArea[]) => {
    setContributions(newContributions)
    localStorage.setItem('wisdomos_contributions', JSON.stringify(newContributions))
  }

  const saveStatement = (statement: string) => {
    setMyStatement(statement)
    localStorage.setItem('wisdomos_contribution_statement', statement)
    setEditingStatement(false)
  }

  const updateArea = (updatedArea: ContributionArea) => {
    saveContributions(contributions.map(area => 
      area.id === updatedArea.id ? updatedArea : area
    ))
    setEditingArea(null)
  }

  const addNewContribution = (area: ContributionArea) => {
    saveContributions([...contributions, { ...area, id: Date.now().toString() }])
    setShowAddContribution(false)
  }

  const deleteArea = (id: string) => {
    saveContributions(contributions.filter(area => area.id !== id))
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
              <h1 className="text-2xl font-bold bg-gradient-to-r from-phoenix-red to-phoenix-orange bg-clip-text text-transparent">
                Contribution Display
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-black" />
              <span className="text-sm text-black">Who You Are as Contribution</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* My Contribution Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-phoenix-gold/20 text-center"
        >
          <Star className="w-12 h-12 text-black mx-auto mb-4" />
          
          {editingStatement ? (
            <div className="max-w-2xl mx-auto">
              <textarea
                value={myStatement}
                onChange={(e) => setMyStatement(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black text-center text-xl"
                rows={3}
                placeholder="Write your contribution statement..."
              />
              <div className="flex justify-center gap-3 mt-4">
                <PhoenixButton onClick={() => saveStatement(myStatement)} size="sm">
                  Save Statement
                </PhoenixButton>
                <PhoenixButton 
                  onClick={() => {
                    setEditingStatement(false)
                    const stored = localStorage.getItem('wisdomos_contribution_statement')
                    if (stored) setMyStatement(stored)
                  }} 
                  variant="ghost" 
                  size="sm"
                >
                  Cancel
                </PhoenixButton>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-2xl md:text-3xl font-bold text-black mb-2">
                {myStatement}
              </h2>
              <button
                onClick={() => setEditingStatement(true)}
                className="text-black hover:text-black transition-colors"
              >
                <Edit className="w-5 h-5 mx-auto mt-2" />
              </button>
            </>
          )}
        </motion.div>

        {/* Category Filter */}
        <div className="flex justify-center gap-3 mb-8">
          <PhoenixButton
            onClick={() => setSelectedCategory(null)}
            variant={selectedCategory === null ? 'primary' : 'ghost'}
            size="sm"
          >
            All
          </PhoenixButton>
          {['being', 'doing', 'creating', 'transforming'].map(cat => (
            <PhoenixButton
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              variant={selectedCategory === cat ? 'primary' : 'ghost'}
              size="sm"
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </PhoenixButton>
          ))}
        </div>

        {/* Contribution Areas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {contributions
            .filter(area => !selectedCategory || area.category === selectedCategory)
            .map((area, index) => {
              const Icon = area.icon
              return (
                <motion.div
                  key={area.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-xl border-2 p-6 relative group"
                  style={{ borderColor: area.color + '40' }}
                >
                  {/* Edit/Delete Buttons */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button
                      onClick={() => setEditingArea(area)}
                      className="text-black hover:text-black"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteArea(area.id)}
                      className="text-black hover:text-black"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: area.color + '20' }}
                    >
                      <Icon className="w-6 h-6" style={{ color: area.color }} />
                    </div>
                    <div>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full border mb-2 ${categoryColors[area.category]}`}>
                        {area.category}
                      </span>
                      <h3 className="text-xl font-bold text-black">{area.title}</h3>
                      <p className="text-sm text-black">{area.description}</p>
                    </div>
                  </div>

                  {/* Contributions List */}
                  <div className="space-y-2 mb-4">
                    {area.contributions.map((contribution, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-black mt-1">•</span>
                        <span className="text-sm text-black">{contribution}</span>
                      </div>
                    ))}
                  </div>

                  {/* Impact */}
                  <div className="bg-gradient-to-r from-phoenix-gold/10 to-phoenix-orange/10 rounded-lg p-3 mb-3">
                    <p className="text-sm font-medium text-black mb-1">Impact:</p>
                    <p className="text-sm text-black">{area.impact}</p>
                  </div>

                  {/* Commitment */}
                  <div className="border-t border-gray-200 pt-3">
                    <p className="text-sm font-medium text-black mb-1">Commitment:</p>
                    <p className="text-sm text-black font-medium italic">"{area.commitment}"</p>
                  </div>
                </motion.div>
              )
            })}
        </div>

        {/* Add New Contribution Button */}
        <div className="flex justify-center">
          <PhoenixButton
            onClick={() => setShowAddContribution(true)}
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Contribution Area
          </PhoenixButton>
        </div>

        {/* Contribution Summary */}
        <div className="mt-12 bg-white rounded-2xl shadow-xl p-8 border border-phoenix-gold/20">
          <h3 className="text-xl font-semibold text-black mb-6 text-center">My Contribution Architecture</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {['being', 'doing', 'creating', 'transforming'].map(category => {
              const categoryAreas = contributions.filter(c => c.category === category)
              const totalContributions = categoryAreas.reduce((sum, area) => sum + area.contributions.length, 0)
              
              return (
                <div key={category} className="text-center">
                  <div className={`inline-block px-3 py-1 text-sm font-medium rounded-full border mb-3 ${categoryColors[category]}`}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </div>
                  <div className="text-3xl font-bold text-black mb-1">{totalContributions}</div>
                  <div className="text-sm text-black">contributions</div>
                  <div className="text-xs text-black mt-1">{categoryAreas.length} areas</div>
                </div>
              )
            })}
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="text-center">
              <Globe className="w-8 h-8 text-black mx-auto mb-3" />
              <p className="text-lg font-medium text-black">Total Impact Footprint</p>
              <p className="text-3xl font-bold text-black mt-2">
                {contributions.reduce((sum, area) => sum + area.contributions.length, 0)}
              </p>
              <p className="text-sm text-black mt-1">Active Contributions</p>
            </div>
          </div>
        </div>

        {/* Add/Edit Modal */}
        {(showAddContribution || editingArea) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-xl font-semibold mb-4 text-black">
                {editingArea ? 'Edit Contribution Area' : 'Add Contribution Area'}
              </h3>
              
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  
                  const contributionsList = formData.get('contributions') as string
                  const contributionsArray = contributionsList
                    .split('\n')
                    .filter(c => c.trim())
                    .map(c => c.trim())
                  
                  const area: ContributionArea = {
                    id: editingArea?.id || Date.now().toString(),
                    category: formData.get('category') as any,
                    title: formData.get('title') as string,
                    description: formData.get('description') as string,
                    icon: Sparkles, // Default icon
                    color: formData.get('category') === 'being' ? '#FFD700' :
                           formData.get('category') === 'doing' ? '#E63946' :
                           formData.get('category') === 'creating' ? '#FF914D' :
                           '#8B5CF6',
                    contributions: contributionsArray,
                    impact: formData.get('impact') as string,
                    commitment: formData.get('commitment') as string
                  }
                  
                  if (editingArea) {
                    updateArea(area)
                  } else {
                    addNewContribution(area)
                  }
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Category</label>
                    <select
                      name="category"
                      defaultValue={editingArea?.category || 'being'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    >
                      <option value="being">Being (Who I Am)</option>
                      <option value="doing">Doing (What I Do)</option>
                      <option value="creating">Creating (What I Build)</option>
                      <option value="transforming">Transforming (How I Change)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Title</label>
                    <input
                      name="title"
                      type="text"
                      defaultValue={editingArea?.title}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">Description</label>
                  <input
                    name="description"
                    type="text"
                    defaultValue={editingArea?.description}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    placeholder="Brief description of this contribution area"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Contributions (one per line)
                  </label>
                  <textarea
                    name="contributions"
                    rows={5}
                    defaultValue={editingArea?.contributions.join('\n')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    placeholder="Enter each contribution on a new line..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">Impact Statement</label>
                  <input
                    name="impact"
                    type="text"
                    defaultValue={editingArea?.impact}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    placeholder="How do these contributions impact the world?"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">Commitment Statement</label>
                  <input
                    name="commitment"
                    type="text"
                    defaultValue={editingArea?.commitment}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    placeholder="What is your commitment in this area?"
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <PhoenixButton type="submit">
                    {editingArea ? 'Update' : 'Add'} Contribution
                  </PhoenixButton>
                  <PhoenixButton
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setEditingArea(null)
                      setShowAddContribution(false)
                    }}
                  >
                    Cancel
                  </PhoenixButton>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  )
}