'use client'

/**
 * Clustered Areas Display Component
 * Displays the 30 life areas organized into 6 clusters from Fulfillment Ontology v5.4
 *
 * Clusters:
 * - Systemic / Structural (5 areas)
 * - Relational / Human (5 areas)
 * - Inner / Personal (5 areas)
 * - Creative / Expressive (5 areas)
 * - Exploratory / Expansive (5 areas)
 * - Integrative / Legacy (5 areas)
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Briefcase,
  DollarSign,
  Home,
  Scale,
  Clock,
  Heart,
  Users,
  UserPlus,
  Network,
  Building2,
  Activity,
  Brain,
  Smile,
  TrendingUp,
  Sparkles,
  Palette,
  Gamepad2,
  Eye,
  Wind,
  Plane,
  GraduationCap,
  Lightbulb,
  Trees,
  Search,
  Target,
  Shield,
  Award,
  HandHeart,
  Book,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react'

// Cluster configuration from v5.4 ontology
const CLUSTERS = [
  {
    key: 'systemic_structural',
    nameEn: 'Systemic / Structural',
    nameFr: 'Systémique / Structurel',
    color: '#3B82F6', // blue
    icon: Building2,
    description: 'The systems and structures that support your daily life'
  },
  {
    key: 'relational_human',
    nameEn: 'Relational / Human',
    nameFr: 'Relationnel / Humain',
    color: '#EC4899', // pink
    icon: Heart,
    description: 'Connections with people and communities'
  },
  {
    key: 'inner_personal',
    nameEn: 'Inner / Personal',
    nameFr: 'Intérieur / Personnel',
    color: '#8B5CF6', // purple
    icon: Brain,
    description: 'Your inner world, health, and personal development'
  },
  {
    key: 'creative_expressive',
    nameEn: 'Creative / Expressive',
    nameFr: 'Créatif / Expressif',
    color: '#F59E0B', // amber
    icon: Palette,
    description: 'Self-expression, creativity, and joy'
  },
  {
    key: 'exploratory_expansive',
    nameEn: 'Exploratory / Expansive',
    nameFr: 'Exploratoire / Expansif',
    color: '#10B981', // green
    icon: Search,
    description: 'Growth, learning, and exploration'
  },
  {
    key: 'integrative_legacy',
    nameEn: 'Integrative / Legacy',
    nameFr: 'Intégratif / Héritage',
    color: '#6366F1', // indigo
    icon: Award,
    description: 'Purpose, values, and what you leave behind'
  }
]

// Icon mapping for areas
const AREA_ICONS: Record<string, any> = {
  work: Briefcase,
  finance: DollarSign,
  living_environment: Home,
  legal_civic: Scale,
  time_energy: Clock,
  romantic_intimacy: Heart,
  family: Users,
  friendships: UserPlus,
  professional_network: Network,
  community: Building2,
  physical_health: Activity,
  mental_health: Brain,
  emotional_wellbeing: Smile,
  personal_growth: TrendingUp,
  spirituality: Sparkles,
  creative_expression: Palette,
  hobbies_play: Gamepad2,
  style_aesthetics: Eye,
  humor_levity: Smile,
  sensuality_pleasure: Wind,
  travel_adventure: Plane,
  learning_education: GraduationCap,
  innovation_experimentation: Lightbulb,
  nature_environment: Trees,
  curiosity_wonder: Search,
  purpose_mission: Target,
  values_integrity: Shield,
  legacy_impact: Award,
  contribution_service: HandHeart,
  wisdom_integration: Book
}

// Universal dimensions with icons
const DIMENSIONS = [
  { key: 'profitability', icon: '💰', nameEn: 'Profitability' },
  { key: 'alignment', icon: '🎯', nameEn: 'Alignment' },
  { key: 'stability', icon: '⚖️', nameEn: 'Stability' },
  { key: 'creativity', icon: '🎨', nameEn: 'Creativity' },
  { key: 'connection', icon: '🤝', nameEn: 'Connection' },
  { key: 'freedom', icon: '🕊️', nameEn: 'Freedom' },
  { key: 'growth', icon: '🌱', nameEn: 'Growth' },
  { key: 'service', icon: '🤲', nameEn: 'Service' },
  { key: 'integration', icon: '🧩', nameEn: 'Integration' },
  { key: 'legacy', icon: '🏛️', nameEn: 'Legacy' },
  { key: 'vitality', icon: '⚡', nameEn: 'Vitality' },
  { key: 'presence', icon: '🧘', nameEn: 'Presence' }
]

interface Area {
  key: string
  nameEn: string
  nameFr: string
  cluster: string
  primaryDimensions: string[]
  secondaryDimensions: string[]
  score?: number
  status?: 'thriving' | 'attention' | 'breakdown'
}

interface ClusteredAreasDisplayProps {
  areas?: Area[]
  onAreaClick?: (areaKey: string) => void
  showDimensions?: boolean
}

export default function ClusteredAreasDisplay({
  areas = [],
  onAreaClick,
  showDimensions = true
}: ClusteredAreasDisplayProps) {
  const [expandedClusters, setExpandedClusters] = useState<Set<string>>(new Set(['systemic_structural']))
  const [selectedArea, setSelectedArea] = useState<string | null>(null)
  const [hoveredDimension, setHoveredDimension] = useState<string | null>(null)

  const toggleCluster = (clusterKey: string) => {
    const newExpanded = new Set(expandedClusters)
    if (newExpanded.has(clusterKey)) {
      newExpanded.delete(clusterKey)
    } else {
      newExpanded.add(clusterKey)
    }
    setExpandedClusters(newExpanded)
  }

  const getAreasByCluster = (clusterKey: string) => {
    return areas.filter(area => area.cluster === clusterKey)
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'thriving':
        return 'bg-green-500 border-green-600'
      case 'attention':
        return 'bg-yellow-500 border-yellow-600'
      case 'breakdown':
        return 'bg-red-500 border-red-600'
      default:
        return 'bg-gray-300 border-gray-400'
    }
  }

  const handleAreaClick = (areaKey: string) => {
    setSelectedArea(selectedArea === areaKey ? null : areaKey)
    if (onAreaClick) {
      onAreaClick(areaKey)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-phoenix-orange to-phoenix-red text-white rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-2">Fulfillment Display v5.4</h2>
        <p className="text-white/90">30 Life Areas across 6 Clusters</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {CLUSTERS.map(cluster => {
            const areaCount = getAreasByCluster(cluster.key).length
            return (
              <div
                key={cluster.key}
                className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg text-sm"
              >
                <cluster.icon className="w-4 h-4" />
                <span>{cluster.nameEn}</span>
                <span className="bg-white/30 px-2 py-0.5 rounded-full text-xs">{areaCount}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Universal Dimensions Legend */}
      {showDimensions && (
        <div className="bg-white rounded-xl p-6 border border-phoenix-gold/20">
          <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-phoenix-orange" />
            Universal Dimensions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {DIMENSIONS.map(dim => (
              <div
                key={dim.key}
                onMouseEnter={() => setHoveredDimension(dim.key)}
                onMouseLeave={() => setHoveredDimension(null)}
                className={`
                  flex items-center gap-2 p-3 rounded-lg border-2 transition-all cursor-help
                  ${hoveredDimension === dim.key
                    ? 'bg-phoenix-gold/10 border-phoenix-gold shadow-md scale-105'
                    : 'bg-gray-50 border-gray-200 hover:border-phoenix-gold/50'
                  }
                `}
              >
                <span className="text-2xl">{dim.icon}</span>
                <span className="text-sm font-medium text-black">{dim.nameEn}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clustered Areas */}
      <div className="space-y-4">
        {CLUSTERS.map((cluster, clusterIndex) => {
          const clusterAreas = getAreasByCluster(cluster.key)
          const isExpanded = expandedClusters.has(cluster.key)
          const IconComponent = cluster.icon

          return (
            <motion.div
              key={cluster.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: clusterIndex * 0.1 }}
              className="bg-white rounded-xl border-2 overflow-hidden"
              style={{ borderColor: cluster.color }}
            >
              {/* Cluster Header */}
              <button
                onClick={() => toggleCluster(cluster.key)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                style={{
                  background: isExpanded ? cluster.color + '10' : 'white'
                }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="p-3 rounded-lg text-white"
                    style={{ backgroundColor: cluster.color }}
                  >
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-black">{cluster.nameEn}</h3>
                    <p className="text-sm text-gray-600">{cluster.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className="px-3 py-1 rounded-full text-sm font-medium text-white"
                    style={{ backgroundColor: cluster.color }}
                  >
                    {clusterAreas.length} areas
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Cluster Areas */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t-2"
                    style={{ borderColor: cluster.color + '20' }}
                  >
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {clusterAreas.map((area, areaIndex) => {
                        const AreaIcon = AREA_ICONS[area.key] || Target
                        const isSelected = selectedArea === area.key

                        return (
                          <motion.div
                            key={area.key}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: areaIndex * 0.05 }}
                            onClick={() => handleAreaClick(area.key)}
                            className={`
                              p-4 rounded-lg border-2 cursor-pointer transition-all
                              ${isSelected
                                ? 'shadow-lg scale-105'
                                : 'hover:shadow-md hover:scale-102'
                              }
                            `}
                            style={{
                              borderColor: isSelected ? cluster.color : cluster.color + '40',
                              backgroundColor: isSelected ? cluster.color + '10' : 'white'
                            }}
                          >
                            {/* Area Header */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3 flex-1">
                                <div
                                  className="p-2 rounded-lg text-white"
                                  style={{ backgroundColor: cluster.color }}
                                >
                                  <AreaIcon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-black text-sm truncate">
                                    {area.nameEn}
                                  </h4>
                                  <p className="text-xs text-gray-500 truncate">{area.nameFr}</p>
                                </div>
                              </div>

                              {/* Status Indicator */}
                              {area.status && (
                                <div
                                  className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${getStatusColor(area.status)}`}
                                  title={area.status}
                                />
                              )}
                            </div>

                            {/* Score Bar */}
                            {area.score !== undefined && (
                              <div className="mb-3">
                                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                  <span>Fulfillment</span>
                                  <span className="font-medium">{area.score}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div
                                    className="h-1.5 rounded-full transition-all"
                                    style={{
                                      width: `${area.score}%`,
                                      backgroundColor: cluster.color
                                    }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Dimensions */}
                            {showDimensions && isSelected && (
                              <div className="space-y-2 pt-3 border-t">
                                <div>
                                  <p className="text-xs font-medium text-gray-500 mb-1">Primary Dimensions</p>
                                  <div className="flex flex-wrap gap-1">
                                    {area.primaryDimensions.map(dimKey => {
                                      const dim = DIMENSIONS.find(d => d.key === dimKey)
                                      return dim ? (
                                        <span
                                          key={dimKey}
                                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                                          style={{
                                            backgroundColor: cluster.color + '20',
                                            color: cluster.color
                                          }}
                                          title={dim.nameEn}
                                        >
                                          {dim.icon}
                                        </span>
                                      ) : null
                                    })}
                                  </div>
                                </div>

                                {area.secondaryDimensions.length > 0 && (
                                  <div>
                                    <p className="text-xs font-medium text-gray-500 mb-1">Secondary Dimensions</p>
                                    <div className="flex flex-wrap gap-1">
                                      {area.secondaryDimensions.map(dimKey => {
                                        const dim = DIMENSIONS.find(d => d.key === dimKey)
                                        return dim ? (
                                          <span
                                            key={dimKey}
                                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs"
                                            title={dim.nameEn}
                                          >
                                            {dim.icon}
                                          </span>
                                        ) : null
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </motion.div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>

      {/* Summary Stats */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-black mb-4">Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-phoenix-orange">{areas.length}</div>
            <div className="text-sm text-gray-600">Total Areas</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {areas.filter(a => a.status === 'thriving').length}
            </div>
            <div className="text-sm text-gray-600">Thriving</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">
              {areas.filter(a => a.status === 'attention').length}
            </div>
            <div className="text-sm text-gray-600">Needs Attention</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">
              {areas.filter(a => a.status === 'breakdown').length}
            </div>
            <div className="text-sm text-gray-600">Breakdown</div>
          </div>
        </div>
      </div>
    </div>
  )
}
