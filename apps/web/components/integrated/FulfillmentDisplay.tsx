'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Target, Users, Circle, Calendar, AlertCircle, TrendingUp, Activity, Check, X, Plus, Eye, EyeOff, ChevronRight, Download } from 'lucide-react'
import { FulfillmentDisplay as FulfillmentType, LifeArea, Commitment, Relationship } from '@/types/integrated-display'
import { useLifeAreas } from '@/contexts/LifeAreasContext'
import ExportDataModal from '@/components/fulfillment/ExportDataModal'
import { ExportData } from '@/lib/fulfillment-export'
import ClusteredAreasDisplay from '@/components/fulfillment/ClusteredAreasDisplay'

interface FulfillmentDisplayProps {
  data?: FulfillmentType
  onUpdate?: (data: FulfillmentType) => void
}

export default function FulfillmentDisplay({ data, onUpdate }: FulfillmentDisplayProps) {
  const { lifeAreas } = useLifeAreas()
  const [selectedArea, setSelectedArea] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'overview' | 'map' | 'list' | 'audit' | 'clusters'>('overview')
  const [showRelationships, setShowRelationships] = useState(true)
  const [showAddCommitment, setShowAddCommitment] = useState(false)
  const [showAcceptable, setShowAcceptable] = useState(true)
  const [showNoLongerTolerated, setShowNoLongerTolerated] = useState(true)
  const [showExportModal, setShowExportModal] = useState(false)
  const [newCommitment, setNewCommitment] = useState({
    title: '',
    description: '',
    areaId: '',
    size: 'medium' as 'small' | 'medium' | 'large'
  })
  const canvasRef = useRef<HTMLDivElement>(null)

  // Demo data
  const displayData: FulfillmentType = data || {
    userId: 'demo',
    overallStatus: 'balanced',
    lifeAreas: [
      {
        id: 'work',
        name: 'Work & Purpose',
        status: 'thriving',
        score: 85,
        lastAudit: new Date(),
        notes: 'Aligned with mission',
        commitments: [
          {
            id: 'c1',
            title: 'Complete major project',
            description: 'Deliver transformational work',
            areaId: 'work',
            relatedPeople: ['p1', 'p2'],
            status: 'active',
            size: 'large',
            createdAt: new Date()
          }
        ],
        relationships: []
      },
      {
        id: 'health',
        name: 'Health & Recovery',
        status: 'attention',
        score: 65,
        lastAudit: new Date(),
        notes: 'Need more consistency',
        commitments: [
          {
            id: 'c2',
            title: 'Daily movement practice',
            description: '30 minutes minimum',
            areaId: 'health',
            relatedPeople: [],
            status: 'active',
            size: 'medium',
            createdAt: new Date()
          }
        ],
        relationships: []
      },
      {
        id: 'finance',
        name: 'Finance',
        status: 'collapsed',
        score: 35,
        lastAudit: new Date(),
        notes: 'Requires immediate attention',
        commitments: [],
        relationships: []
      },
      {
        id: 'intimacy',
        name: 'Intimacy & Love',
        status: 'thriving',
        score: 90,
        lastAudit: new Date(),
        notes: 'Deep connections present',
        commitments: [],
        relationships: []
      }
    ],
    relationships: [
      {
        id: 'p1',
        personName: 'Sarah',
        type: 'partner',
        frequency: 'daily',
        lastContact: new Date(),
        quality: 5,
        commitments: ['c1'],
        outcomes: [
          {
            id: 'o1',
            description: 'Support system established',
            achieved: true,
            date: new Date(),
            relationshipId: 'p1'
          }
        ]
      },
      {
        id: 'p2',
        personName: 'Michael',
        type: 'colleague',
        frequency: 'weekly',
        lastContact: new Date(),
        quality: 4,
        commitments: ['c1'],
        outcomes: []
      },
      {
        id: 'p3',
        personName: 'Mom',
        type: 'family',
        frequency: 'monthly',
        lastContact: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        quality: 4,
        commitments: [],
        outcomes: []
      }
    ],
    monthlyAudits: [
      {
        id: 'audit1',
        month: '2025-08',
        areasReviewed: ['work', 'health'],
        boundariesSet: ['No meetings before 9am', 'Weekend tech sabbath'],
        boundariesReleased: ['24/7 availability'],
        insights: ['Energy follows attention', 'Small commitments compound'],
        completedAt: new Date()
      }
    ]
  }

  const statusColors = {
    THRIVING: { bg: 'bg-green-500', border: 'border-green-600', text: 'text-black', label: 'Thriving' },
    ATTENTION: { bg: 'bg-yellow-500', border: 'border-yellow-600', text: 'text-black', label: 'Needs Attention' },
    BREAKDOWN: { bg: 'bg-red-500', border: 'border-red-600', text: 'text-black', label: 'Breakdown/Reset Needed' },
    thriving: { bg: 'bg-green-500', border: 'border-green-600', text: 'text-black', label: 'Thriving' },
    attention: { bg: 'bg-yellow-500', border: 'border-yellow-600', text: 'text-black', label: 'Needs Attention' },
    collapsed: { bg: 'bg-red-500', border: 'border-red-600', text: 'text-black', label: 'Breakdown/Reset Needed' }
  }

  const commitmentSizes = {
    small: 100,
    medium: 150,
    large: 200
  }

  const calculatePosition = (index: number, total: number, centerX: number, centerY: number, radius: number) => {
    const angle = (2 * Math.PI * index) / total
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    }
  }

  const handleAddCommitment = () => {
    if (!newCommitment.title || !newCommitment.areaId) return

    const commitment: Commitment = {
      id: Date.now().toString(),
      title: newCommitment.title,
      description: newCommitment.description,
      areaId: newCommitment.areaId,
      relatedPeople: [],
      status: 'active',
      size: newCommitment.size,
      createdAt: new Date()
    }

    // Save to localStorage for persistence
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('wisdomos_commitments') || '[]'
      const commitments = JSON.parse(stored)
      commitments.push(commitment)
      localStorage.setItem('wisdomos_commitments', JSON.stringify(commitments))

      // Dispatch event to notify other components
      window.dispatchEvent(new Event('wisdomos:commitment-added'))
    }

    // Reset form
    setNewCommitment({
      title: '',
      description: '',
      areaId: '',
      size: 'medium'
    })
    setShowAddCommitment(false)

    alert('Commitment added successfully!')
  }

  // Prepare export data
  const prepareExportData = (): ExportData => {
    // Calculate global fulfillment score (average of all area scores)
    const globalScore = Math.round(
      lifeAreas.reduce((sum, area) => sum + (area.score || 50), 0) / lifeAreas.length
    )

    // Get all commitments from localStorage
    const allCommitments = typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('wisdomos_commitments') || '[]')
      : []

    // Map life areas to export format
    const exportAreas = lifeAreas.map(area => {
      const areaCommitments = allCommitments.filter((c: any) => c.areaId === area.id)

      return {
        id: area.id,
        name: area.name,
        phoenixName: area.phoenixName,
        status: area.status || 'ATTENTION',
        score: area.score || 50,
        icon: area.icon,
        description: area.description,
        lastAudit: new Date(),
        notes: area.description,
        commitments: areaCommitments.map((c: any) => ({
          ...c,
          createdAt: new Date(c.createdAt),
          completedAt: c.completedAt ? new Date(c.completedAt) : undefined
        })),
        dimensions: (area as any).dimensions || [],
        history: [] // Could be populated from tracking data
      }
    })

    return {
      exportDate: new Date(),
      userId: displayData.userId,
      globalFulfillmentScore: globalScore,
      lifeAreas: exportAreas,
      summary: {
        totalAreas: lifeAreas.length,
        thrivingCount: lifeAreas.filter(a => (a.status || '').toLowerCase() === 'thriving').length,
        attentionCount: lifeAreas.filter(a => (a.status || '').toLowerCase() === 'attention').length,
        collapsedCount: lifeAreas.filter(a => (a.status || '').toLowerCase() === 'collapsed' || (a.status || '').toLowerCase() === 'breakdown').length,
        totalCommitments: allCommitments.length,
        activeCommitments: allCommitments.filter((c: any) => c.status === 'active').length,
        completedCommitments: allCommitments.filter((c: any) => c.status === 'completed').length
      }
    }
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-phoenix-gold/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg">
            <Target className="w-6 h-6 text-black" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-black">Fulfillment Display</h2>
            <p className="text-sm text-black">Commitments & Relationships Map</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('clusters')}
            className={`px-3 py-1 rounded text-sm ${viewMode === 'clusters' ? 'bg-phoenix-gold text-black' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            Clusters
          </button>
          <button
            onClick={() => setViewMode('overview')}
            className={`px-3 py-1 rounded text-sm ${viewMode === 'overview' ? 'bg-phoenix-gold text-black' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 py-1 rounded text-sm ${viewMode === 'map' ? 'bg-phoenix-gold text-black' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            Map
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 rounded text-sm ${viewMode === 'list' ? 'bg-phoenix-gold text-black' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            List
          </button>
          <button
            onClick={() => setViewMode('audit')}
            className={`px-3 py-1 rounded text-sm ${viewMode === 'audit' ? 'bg-phoenix-gold text-black' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            Audit
          </button>
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-phoenix-orange to-phoenix-red text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium"
            title="Export fulfillment data"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Overall Status */}
      <div className="mb-4 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Circle className={`w-4 h-4 ${statusColors.thriving.text}`} fill="currentColor" />
              <span className="text-sm">{displayData.lifeAreas.filter(a => a.status === 'thriving').length} Thriving</span>
            </div>
            <div className="flex items-center gap-2">
              <Circle className={`w-4 h-4 ${statusColors.attention.text}`} fill="currentColor" />
              <span className="text-sm">{displayData.lifeAreas.filter(a => a.status === 'attention').length} Attention</span>
            </div>
            <div className="flex items-center gap-2">
              <Circle className={`w-4 h-4 ${statusColors.collapsed.text}`} fill="currentColor" />
              <span className="text-sm">{displayData.lifeAreas.filter(a => a.status === 'collapsed').length} Collapsed</span>
            </div>
          </div>
          <span className="text-sm font-medium capitalize">
            Status: {displayData.overallStatus}
          </span>
        </div>
      </div>

      {/* Clusters View (v5.4 Ontology) */}
      {viewMode === 'clusters' && (
        <ClusteredAreasDisplay
          areas={lifeAreas.map(area => ({
            key: area.id,
            nameEn: area.name,
            nameFr: area.phoenixName || area.name,
            cluster: (area as any).cluster || 'systemic_structural',
            primaryDimensions: (area as any).primaryDimensions || [],
            secondaryDimensions: (area as any).secondaryDimensions || [],
            score: area.score,
            status: area.status as any
          }))}
          onAreaClick={(areaKey) => setSelectedArea(areaKey)}
          showDimensions={true}
        />
      )}

      {/* Overview Table View */}
      {viewMode === 'overview' && (
        <div className="space-y-6">
          {/* Overview Table of Life Areas */}
          <div className="bg-white rounded-lg border border-phoenix-gold/20">
            <div className="px-6 py-4 border-b border-phoenix-gold/10">
              <h3 className="text-lg font-semibold text-black">Overview Table of Life Areas</h3>
              <p className="text-sm text-gray-600">Click any life area to view detailed sections</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-sm font-medium text-black">Life Area</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-black">Phoenix Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-black">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-black">Score</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-black">Commitments</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-black">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {lifeAreas.map((area, index) => {
                    const status = statusColors[area.status || 'ATTENTION']
                    const commitments = typeof window !== 'undefined' 
                      ? JSON.parse(localStorage.getItem('wisdomos_commitments') || '[]').filter((c: any) => c.areaId === area.id)
                      : []
                    return (
                      <tr 
                        key={area.id}
                        className={`border-b border-gray-100 hover:bg-phoenix-gold/5 cursor-pointer transition-colors ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                        }`}
                        onClick={() => setSelectedArea(selectedArea === area.id ? null : area.id)}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{area.icon}</span>
                            <div>
                              <div className="font-medium text-black">{area.name}</div>
                              <div className="text-xs text-gray-500">{area.description}</div>
                            </div>
                            <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${
                              selectedArea === area.id ? 'rotate-90' : ''
                            }`} />
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{area.phoenixName}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${status.bg}`} />
                            <span className="text-sm text-black">{status.label}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all ${status.bg}`}
                                style={{ width: `${area.score || 50}%` }}
                              />
                            </div>
                            <span className="text-sm text-black font-medium">{area.score || 50}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-600">{commitments.length} active</span>
                        </td>
                        <td className="px-4 py-3">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation()
                              setNewCommitment({...newCommitment, areaId: area.id})
                              setShowAddCommitment(true)
                            }}
                            className="text-sm text-phoenix-orange hover:text-phoenix-red transition-colors"
                          >
                            + Add
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detailed Life Area Section */}
          {selectedArea && (() => {
            const area = lifeAreas.find(a => a.id === selectedArea)
            const commitments = typeof window !== 'undefined'
              ? JSON.parse(localStorage.getItem('wisdomos_commitments') || '[]').filter((c: any) => c.areaId === selectedArea)
              : []
            const status = statusColors[area?.status || 'ATTENTION']
            
            return (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white rounded-lg border border-phoenix-gold/20 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{area?.icon}</span>
                    <div>
                      <h3 className="text-xl font-bold text-black">{area?.name}</h3>
                      <p className="text-sm text-gray-600">{area?.phoenixName}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedArea(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-black mb-3">Current Status</h4>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-4 h-4 rounded-full ${status.bg}`} />
                      <span className="text-black">{status.label}</span>
                      <span className="text-sm text-gray-500">({area?.score || 50}%)</span>
                    </div>
                    <p className="text-sm text-gray-600">{area?.description}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-black mb-3">Active Commitments ({commitments.length})</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {commitments.length > 0 ? commitments.map((commitment: any) => (
                        <div key={commitment.id} className="p-2 bg-gray-50 rounded text-sm">
                          <div className="font-medium text-black">{commitment.title}</div>
                          <div className="text-xs text-gray-500">{commitment.description}</div>
                        </div>
                      )) : (
                        <p className="text-sm text-gray-500 italic">No active commitments</p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })()}

          {/* What's Acceptable / No Longer Tolerated Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* What's Acceptable */}
            <div className="bg-white rounded-lg border border-green-200">
              <div className="px-6 py-4 border-b border-green-100 bg-green-50/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-black">What's Acceptable</h3>
                  </div>
                  <button
                    onClick={() => setShowAcceptable(!showAcceptable)}
                    className="p-1 hover:bg-green-100 rounded transition-colors"
                  >
                    {showAcceptable ? <EyeOff className="w-4 h-4 text-green-600" /> : <Eye className="w-4 h-4 text-green-600" />}
                  </button>
                </div>
              </div>
              {showAcceptable && (
                <div className="p-6">
                  <div className="space-y-3">
                    {[
                      'Daily morning routine with meditation',
                      'Healthy work-life boundaries',
                      'Quality time with loved ones',
                      'Regular exercise and movement',
                      'Financial planning and budgeting',
                      'Creative expression and learning'
                    ].map((item, index) => (
                      <div 
                        key={index} 
                        className={`flex items-start gap-3 p-3 rounded-lg ${
                          index % 2 === 0 ? 'bg-green-50/50' : 'bg-white'
                        }`}
                      >
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm text-black">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* No Longer Tolerated */}
            <div className="bg-white rounded-lg border border-red-200">
              <div className="px-6 py-4 border-b border-red-100 bg-red-50/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <X className="w-5 h-5 text-red-600" />
                    <h3 className="text-lg font-semibold text-black">No Longer Tolerated</h3>
                  </div>
                  <button
                    onClick={() => setShowNoLongerTolerated(!showNoLongerTolerated)}
                    className="p-1 hover:bg-red-100 rounded transition-colors"
                  >
                    {showNoLongerTolerated ? <EyeOff className="w-4 h-4 text-red-600" /> : <Eye className="w-4 h-4 text-red-600" />}
                  </button>
                </div>
              </div>
              {showNoLongerTolerated && (
                <div className="p-6">
                  <div className="space-y-3">
                    {[
                      'Saying yes when I mean no',
                      'Overcommitting and burnout patterns',
                      'Toxic relationships or environments',
                      'Procrastination on important goals',
                      'Neglecting self-care and health',
                      'Financial stress from poor planning'
                    ].map((item, index) => (
                      <div 
                        key={index} 
                        className={`flex items-start gap-3 p-3 rounded-lg ${
                          index % 2 === 0 ? 'bg-red-50/50' : 'bg-white'
                        }`}
                      >
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm text-black">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Color-Coded Visual Tracker Legend */}
          <div className="bg-white rounded-lg border border-phoenix-gold/20 p-6">
            <h3 className="text-lg font-semibold text-black mb-4">Status Legend & Accessibility Guide</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Status Colors */}
              <div>
                <h4 className="font-medium text-black mb-3">Life Area Status</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-green-500" />
                    <span className="text-sm text-black">Thriving</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-yellow-500" />
                    <span className="text-sm text-black">Needs Attention</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-red-500" />
                    <span className="text-sm text-black">Breakdown/Reset Needed</span>
                  </div>
                </div>
              </div>
              
              {/* Progress Indicators */}
              <div>
                <h4 className="font-medium text-black mb-3">Progress Indicators</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div className="h-2 bg-green-500 rounded-full" style={{width: '80%'}} />
                    </div>
                    <span className="text-sm text-black">80%+ Strong</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div className="h-2 bg-yellow-500 rounded-full" style={{width: '60%'}} />
                    </div>
                    <span className="text-sm text-black">50-80% Moderate</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div className="h-2 bg-red-500 rounded-full" style={{width: '30%'}} />
                    </div>
                    <span className="text-sm text-black">Below 50% Needs Work</span>
                  </div>
                </div>
              </div>
              
              {/* Accessibility Features */}
              <div>
                <h4 className="font-medium text-black mb-3">Accessibility</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>• High contrast colors for visibility</p>
                  <p>• Keyboard navigation support</p>
                  <p>• Screen reader compatible</p>
                  <p>• Color-blind friendly indicators</p>
                  <p>• Click areas for expanded details</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map View */}
      {viewMode === 'map' && (
        <div 
          ref={canvasRef}
          className="relative h-96 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg overflow-hidden"
        >
          {/* Life Areas as Circles */}
          {lifeAreas.map((area, index) => {
            const position = calculatePosition(
              index,
              lifeAreas.length,
              192, // center X (half of h-96)
              192, // center Y
              120  // radius
            )
            const size = 50 + ((area.score || 50) / 2) // Size based on score
            const status = statusColors[area.status || 'ATTENTION']
            
            return (
              <motion.div
                key={area.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  absolute rounded-full flex items-center justify-center cursor-pointer
                  ${status.bg} ${status.border} border-2 shadow-lg
                  hover:scale-110 transition-transform
                `}
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  left: `${position.x - size/2}px`,
                  top: `${position.y - size/2}px`
                }}
                onClick={() => setSelectedArea(area.id)}
              >
                <div className="text-center">
                  <p className="text-xs font-bold text-black">{area.name.split(' ')[0]}</p>
                  <p className="text-[10px] text-black/80">{area.score || 50}%</p>
                </div>
              </motion.div>
            )
          })}

          {/* Relationships as smaller circles */}
          {showRelationships && displayData.relationships.map((rel, index) => {
            const position = calculatePosition(
              index,
              displayData.relationships.length,
              192,
              192,
              180 // Outer radius for relationships
            )
            const qualitySize = 20 + (rel.quality * 5)
            
            return (
              <motion.div
                key={rel.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                className="absolute rounded-full bg-purple-400 border-2 border-purple-500 flex items-center justify-center cursor-pointer hover:scale-125 transition-transform"
                style={{
                  width: `${qualitySize}px`,
                  height: `${qualitySize}px`,
                  left: `${position.x - qualitySize/2}px`,
                  top: `${position.y - qualitySize/2}px`
                }}
                title={`${rel.personName} - ${rel.type}`}
              >
                <Users className="w-3 h-3 text-black" />
              </motion.div>
            )
          })}

          {/* Connection Lines */}
          <svg className="absolute inset-0 pointer-events-none">
            {displayData.relationships.map((rel) => {
              return rel.commitments.map((commitmentId) => {
                const commitment = displayData.lifeAreas
                  .flatMap(a => a.commitments)
                  .find(c => c.id === commitmentId)
                
                if (!commitment) return null
                
                const area = displayData.lifeAreas.find(a => a.id === commitment.areaId)
                if (!area) return null
                
                const areaIndex = displayData.lifeAreas.indexOf(area)
                const relIndex = displayData.relationships.indexOf(rel)
                
                const areaPos = calculatePosition(areaIndex, displayData.lifeAreas.length, 192, 192, 120)
                const relPos = calculatePosition(relIndex, displayData.relationships.length, 192, 192, 180)
                
                return (
                  <line
                    key={`${rel.id}-${commitmentId}`}
                    x1={areaPos.x}
                    y1={areaPos.y}
                    x2={relPos.x}
                    y2={relPos.y}
                    stroke="rgba(147, 51, 234, 0.3)"
                    strokeWidth="1"
                    strokeDasharray="5,5"
                  />
                )
              })
            })}
          </svg>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {lifeAreas.map((area, index) => {
            const commitments = typeof window !== 'undefined'
              ? JSON.parse(localStorage.getItem('wisdomos_commitments') || '[]').filter((c: any) => c.areaId === area.id)
              : []
            const status = statusColors[area.status || 'ATTENTION']
            
            return (
              <div 
                key={area.id} 
                className={`border rounded-lg p-4 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{area.icon}</span>
                    <div className={`w-4 h-4 rounded-full ${status.bg}`} />
                    <h3 className="font-semibold">{area.name}</h3>
                    <span className="text-sm text-black">{area.score || 50}%</span>
                  </div>
                  <button 
                    onClick={() => {
                      setNewCommitment({...newCommitment, areaId: area.id})
                      setShowAddCommitment(true)
                    }}
                    className="text-black hover:text-phoenix-orange transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Commitments */}
                {commitments.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-black mb-2">Commitments</h4>
                    <div className="space-y-2">
                      {commitments.map((commitment: any) => (
                        <div key={commitment.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div>
                            <p className="text-sm font-medium">{commitment.title}</p>
                            <p className="text-xs text-black">{commitment.description}</p>
                          </div>
                          <span className={`
                            text-xs px-2 py-1 rounded
                            ${commitment.status === 'active' ? 'bg-green-100 text-black' : ''}
                            ${commitment.status === 'completed' ? 'bg-blue-100 text-black' : ''}
                            ${commitment.status === 'pending' ? 'bg-yellow-100 text-black' : ''}
                          `}>
                            {commitment.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {area.description && (
                  <p className="text-sm text-gray-600 italic">{area.description}</p>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Audit View */}
      {viewMode === 'audit' && (
        <div className="space-y-4">
          {displayData.monthlyAudits.map((audit) => (
            <div key={audit.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">
                  {new Date(audit.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                <Calendar className="w-5 h-5 text-black" />
              </div>
              
              {/* Areas Reviewed */}
              <div className="mb-3">
                <h4 className="text-sm font-medium text-black mb-2">Areas Reviewed</h4>
                <div className="flex flex-wrap gap-2">
                  {audit.areasReviewed.map((areaId) => {
                    const area = displayData.lifeAreas.find(a => a.id === areaId)
                    return area ? (
                      <span key={areaId} className="text-xs bg-blue-100 text-black px-2 py-1 rounded">
                        {area.name}
                      </span>
                    ) : null
                  })}
                </div>
              </div>
              
              {/* Boundaries */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <h4 className="text-sm font-medium text-black mb-1">Boundaries Set</h4>
                  <div className="space-y-1">
                    {audit.boundariesSet.map((boundary, i) => (
                      <div key={i} className="flex items-start gap-1">
                        <Check className="w-3 h-3 text-black mt-0.5" />
                        <span className="text-xs">{boundary}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-black mb-1">Boundaries Released</h4>
                  <div className="space-y-1">
                    {audit.boundariesReleased.map((boundary, i) => (
                      <div key={i} className="flex items-start gap-1">
                        <X className="w-3 h-3 text-black mt-0.5" />
                        <span className="text-xs">{boundary}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Insights */}
              {audit.insights.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-black mb-1">Insights</h4>
                  <div className="space-y-1">
                    {audit.insights.map((insight, i) => (
                      <p key={i} className="text-xs text-black italic">• {insight}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          <button className="w-full py-2 bg-phoenix-gold text-black rounded-lg hover:bg-phoenix-orange transition-colors">
            Start New Monthly Audit
          </button>
        </div>
      )}

      {/* Relationship Toggle */}
      {viewMode === 'map' && (
        <div className="mt-4 flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showRelationships}
              onChange={(e) => setShowRelationships(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Show Relationships</span>
          </label>
          <button 
            onClick={() => setShowAddCommitment(true)}
            className="text-sm text-black hover:text-black bg-phoenix-gold/20 px-3 py-1 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4 inline mr-1" />
            Add New Commitment
          </button>
        </div>
      )}

      {/* Add Commitment Modal */}
      <AnimatePresence>
        {showAddCommitment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md mx-4"
            >
              <h3 className="text-xl font-semibold mb-4 text-black">Add New Commitment</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newCommitment.title}
                    onChange={(e) => setNewCommitment({...newCommitment, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:ring-2 focus:ring-phoenix-orange focus:border-transparent"
                    placeholder="Commitment title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Description
                  </label>
                  <textarea
                    value={newCommitment.description}
                    onChange={(e) => setNewCommitment({...newCommitment, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:ring-2 focus:ring-phoenix-orange focus:border-transparent"
                    placeholder="Describe your commitment"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Life Area
                  </label>
                  <select
                    value={newCommitment.areaId}
                    onChange={(e) => setNewCommitment({...newCommitment, areaId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-phoenix-orange focus:border-transparent"
                  >
                    <option value="">Select a life area</option>
                    {lifeAreas.map((area) => (
                      <option key={area.id} value={area.id}>
                        {area.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Size
                  </label>
                  <select
                    value={newCommitment.size}
                    onChange={(e) => setNewCommitment({...newCommitment, size: e.target.value as 'small' | 'medium' | 'large'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-phoenix-orange focus:border-transparent"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddCommitment(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-black rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCommitment}
                  className="flex-1 px-4 py-2 bg-phoenix-orange text-black rounded-lg hover:bg-phoenix-red transition-colors"
                >
                  Add Commitment
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Export Data Modal */}
      <ExportDataModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        exportData={prepareExportData()}
        availableAreas={lifeAreas.map(area => ({
          id: area.id,
          name: area.name,
          icon: area.icon
        }))}
      />
    </div>
  )
}