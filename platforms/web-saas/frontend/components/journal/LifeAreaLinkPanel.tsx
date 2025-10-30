'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Sparkles, 
  Link2, 
  CheckCircle, 
  Circle,
  TrendingUp,
  AlertCircle
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface LifeArea {
  id: string
  name: string
  phoenixName?: string
  icon?: string
  color?: string
  status?: 'thriving' | 'attention' | 'collapsed'
  recentMood?: string
  boundaryHealth?: 'healthy' | 'attention' | 'critical'
}

interface LifeAreaLinkPanelProps {
  lifeAreas: LifeArea[]
  selectedAreas: string[]
  suggestedAreas: string[]
  onToggle: (areaId: string) => void
  showHealth?: boolean
}

export function LifeAreaLinkPanel({
  lifeAreas,
  selectedAreas,
  suggestedAreas,
  onToggle,
  showHealth = true
}: LifeAreaLinkPanelProps) {
  
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'thriving': return 'text-green-600 bg-green-50 border-green-200'
      case 'attention': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'collapsed': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getBoundaryHealthIcon = (health?: string) => {
    switch (health) {
      case 'healthy': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'attention': return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case 'critical': return <AlertCircle className="w-4 h-4 text-red-500" />
      default: return null
    }
  }

  const sortedAreas = [...lifeAreas].sort((a, b) => {
    // Suggested areas first
    const aSuggested = suggestedAreas.includes(a.id)
    const bSuggested = suggestedAreas.includes(b.id)
    if (aSuggested && !bSuggested) return -1
    if (!aSuggested && bSuggested) return 1
    
    // Then selected areas
    const aSelected = selectedAreas.includes(a.id)
    const bSelected = selectedAreas.includes(b.id)
    if (aSelected && !bSelected) return -1
    if (!aSelected && bSelected) return 1
    
    // Then by name
    return a.name.localeCompare(b.name)
  })

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link2 className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            Link to Life Areas
          </span>
        </div>
        {suggestedAreas.length > 0 && (
          <div className="flex items-center gap-1">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span className="text-xs text-gray-500">
              {suggestedAreas.length} suggested
            </span>
          </div>
        )}
      </div>

      {/* Life Areas Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto p-2 bg-gray-50 rounded-lg">
        {sortedAreas.map((area) => {
          const isSelected = selectedAreas.includes(area.id)
          const isSuggested = suggestedAreas.includes(area.id)
          
          return (
            <motion.button
              key={area.id}
              onClick={() => onToggle(area.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative p-3 rounded-lg border-2 text-left transition-all ${
                isSelected
                  ? 'border-phoenix-orange bg-phoenix-orange/10'
                  : isSuggested
                  ? 'border-yellow-400 bg-yellow-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {/* Selection Indicator */}
              <div className="absolute top-2 right-2">
                {isSelected ? (
                  <CheckCircle className="w-5 h-5 text-phoenix-orange" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-300" />
                )}
              </div>

              {/* Suggestion Badge */}
              {isSuggested && !isSelected && (
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-700">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Suggested
                  </Badge>
                </div>
              )}

              {/* Content */}
              <div className="flex items-start gap-3 pr-8">
                {/* Icon */}
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                  style={{ 
                    backgroundColor: area.color ? `${area.color}20` : '#FFD70020',
                    color: area.color || '#FFD700'
                  }}
                >
                  {area.icon || '🔥'}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {area.name}
                  </p>
                  {area.phoenixName && (
                    <p className="text-xs text-gray-500 italic truncate">
                      {area.phoenixName}
                    </p>
                  )}
                  
                  {/* Health Indicators */}
                  {showHealth && (
                    <div className="flex items-center gap-3 mt-1">
                      {area.status && (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          getStatusColor(area.status)
                        }`}>
                          {area.status}
                        </span>
                      )}
                      
                      {area.boundaryHealth && (
                        <div className="flex items-center gap-1">
                          {getBoundaryHealthIcon(area.boundaryHealth)}
                          <span className="text-xs text-gray-500">
                            Boundaries
                          </span>
                        </div>
                      )}
                      
                      {area.recentMood && (
                        <span className="text-lg" title="Recent mood">
                          {area.recentMood}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Selected Count */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">
          {selectedAreas.length} area{selectedAreas.length !== 1 ? 's' : ''} selected
        </span>
        {selectedAreas.length > 0 && (
          <button
            onClick={() => selectedAreas.forEach(id => onToggle(id))}
            className="text-gray-500 hover:text-gray-700"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Info Box */}
      {suggestedAreas.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <div className="flex items-start gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-gray-900">Smart Suggestions</p>
              <p className="text-gray-600 text-xs mt-1">
                Based on your content, mood, and tags, we've highlighted relevant life areas. 
                You can add or remove any areas.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}