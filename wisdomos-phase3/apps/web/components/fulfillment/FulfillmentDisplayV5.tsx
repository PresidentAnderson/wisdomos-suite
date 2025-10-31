'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronRight, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'
import { LifeArea, Subdomain, Dimension } from '@/types/fulfillment-v5'
import DimensionTable from './DimensionTable'
import PhoenixButton from '@/components/ui/PhoenixButton'

interface FulfillmentDisplayV5Props {
  lifeAreas: LifeArea[]
  onUpdate?: (areaId: string, subdomainId: string, dimensionName: string, metric: number) => void
}

export default function FulfillmentDisplayV5({ lifeAreas, onUpdate }: FulfillmentDisplayV5Props) {
  const [expandedAreas, setExpandedAreas] = useState<Set<string>>(new Set())
  const [expandedSubdomains, setExpandedSubdomains] = useState<Set<string>>(new Set())

  const toggleArea = (areaId: string) => {
    setExpandedAreas(prev => {
      const next = new Set(prev)
      if (next.has(areaId)) {
        next.delete(areaId)
      } else {
        next.add(areaId)
      }
      return next
    })
  }

  const toggleSubdomain = (subdomainId: string) => {
    setExpandedSubdomains(prev => {
      const next = new Set(prev)
      if (next.has(subdomainId)) {
        next.delete(subdomainId)
      } else {
        next.add(subdomainId)
      }
      return next
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Thriving':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'Needs Attention':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'Breakdown/Reset Needed':
        return <TrendingUp className="w-5 h-5 text-red-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Thriving':
        return 'bg-green-50 border-green-200'
      case 'Needs Attention':
        return 'bg-yellow-50 border-yellow-200'
      case 'Breakdown/Reset Needed':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-phoenix-red to-phoenix-orange text-white p-6 rounded-xl">
        <h1 className="text-3xl font-bold mb-2">Fulfillment Display v5</h1>
        <p className="text-white/90">
          Three-tier architecture: Life Areas → Subdomains → Five Dimensions
        </p>
      </div>

      {/* Life Areas */}
      <div className="space-y-3">
        {lifeAreas.map((area) => {
          const isExpanded = expandedAreas.has(area.id)

          return (
            <motion.div
              key={area.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`border-2 rounded-xl overflow-hidden ${getStatusColor(area.status)}`}
            >
              {/* Life Area Header */}
              <div
                onClick={() => toggleArea(area.id)}
                className="p-4 cursor-pointer hover:bg-white/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Expand/Collapse Icon */}
                    <motion.div
                      animate={{ rotate: isExpanded ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-6 h-6 text-gray-600" />
                      ) : (
                        <ChevronRight className="w-6 h-6 text-gray-600" />
                      )}
                    </motion.div>

                    {/* Icon & Name */}
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{area.icon}</span>
                      <div>
                        <h2 className="text-xl font-bold text-black">{area.name}</h2>
                        <p className="text-sm text-gray-600">{area.phoenixName}</p>
                      </div>
                    </div>
                  </div>

                  {/* Status & Metrics */}
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-black">{area.score}</div>
                      <div className="text-xs text-gray-500">Score</div>
                    </div>

                    <div className="text-right">
                      <div className="text-xl font-semibold text-black">{area.commitments}</div>
                      <div className="text-xs text-gray-500">Commitments</div>
                    </div>

                    <div className="flex items-center gap-2">
                      {getStatusIcon(area.status)}
                      <span className="text-sm font-medium text-gray-700">{area.status}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Content - Subdomains */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t-2 border-gray-200"
                  >
                    <div className="p-6 bg-white/70 space-y-4">
                      {/* Subdomains */}
                      {area.subdomains.map((subdomain) => {
                        const isSubdomainExpanded = expandedSubdomains.has(subdomain.id)

                        return (
                          <div
                            key={subdomain.id}
                            className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white"
                          >
                            {/* Subdomain Header */}
                            <div
                              onClick={() => toggleSubdomain(subdomain.id)}
                              className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <motion.div
                                    animate={{ rotate: isSubdomainExpanded ? 90 : 0 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    {isSubdomainExpanded ? (
                                      <ChevronDown className="w-5 h-5 text-gray-500" />
                                    ) : (
                                      <ChevronRight className="w-5 h-5 text-gray-500" />
                                    )}
                                  </motion.div>

                                  <div>
                                    <h3 className="text-lg font-semibold text-black">
                                      {subdomain.name}
                                    </h3>
                                    {subdomain.description && (
                                      <p className="text-sm text-gray-600">{subdomain.description}</p>
                                    )}
                                  </div>
                                </div>

                                <div className="text-sm text-gray-500">
                                  {subdomain.dimensions.length} dimensions
                                </div>
                              </div>
                            </div>

                            {/* Five-Dimension Matrix */}
                            <AnimatePresence>
                              {isSubdomainExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.3 }}
                                >
                                  <DimensionTable
                                    dimensions={subdomain.dimensions}
                                    onMetricUpdate={(dimensionName, metric) => {
                                      onUpdate?.(area.id, subdomain.id, dimensionName, metric)
                                    }}
                                  />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )
                      })}

                      {/* Acceptable / No Longer Tolerated Cards */}
                      <div className="grid grid-cols-2 gap-4 mt-6">
                        {/* What's Acceptable */}
                        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                          <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" />
                            What's Working
                          </h4>
                          <ul className="space-y-2">
                            {area.acceptable?.map((item, idx) => (
                              <li key={idx} className="text-sm text-green-900">
                                ✓ {item}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* No Longer Tolerated */}
                        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                          <h4 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            No Longer Tolerated
                          </h4>
                          <ul className="space-y-2">
                            {area.noLongerTolerated?.map((item, idx) => (
                              <li key={idx} className="text-sm text-red-900">
                                ✗ {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
