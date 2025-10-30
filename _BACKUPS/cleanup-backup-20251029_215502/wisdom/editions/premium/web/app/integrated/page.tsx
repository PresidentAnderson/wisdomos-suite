'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Layers, ArrowRight, Sparkles, Clock, Target, BarChart3, Menu, X } from 'lucide-react'
import ContributionDisplay from '@/components/integrated/ContributionDisplay'
import AutobiographyTimeline from '@/components/integrated/AutobiographyTimeline'
import FulfillmentDisplay from '@/components/integrated/FulfillmentDisplay'
import AssessmentTool from '@/components/integrated/AssessmentTool'
import ToxicityChart from '@/components/integrated/ToxicityChart'
import { IntegratedDisplay } from '@/types/integrated-display'

export default function IntegratedDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeView, setActiveView] = useState<'all' | 'contribution' | 'autobiography' | 'fulfillment' | 'assessment'>('all')
  const [data, setData] = useState<IntegratedDisplay | null>(null)

  // Initialize with demo data
  useEffect(() => {
    // In production, this would fetch from API
    const demoData: IntegratedDisplay = {
      contribution: {
        userId: 'demo',
        identityStatement: "I am a natural catalyst for transformation and growth",
        coreStrengths: [],
        naturalContributions: [],
        acknowledgments: [],
        lastUpdated: new Date()
      },
      autobiography: {
        userId: 'demo',
        birthYear: 1990,
        currentAge: 35,
        entries: [],
        futureProjections: [],
        patterns: []
      },
      fulfillment: {
        userId: 'demo',
        overallStatus: 'balanced',
        lifeAreas: [],
        relationships: [],
        monthlyAudits: []
      },
      assessment: {
        userId: 'demo',
        assessments: [],
        summaries: [],
        insights: [],
        lastAssessment: new Date()
      },
      connections: [
        {
          fromComponent: 'contribution',
          toComponent: 'autobiography',
          dataType: 'identity',
          description: 'Your natural contributions shape your life story'
        },
        {
          fromComponent: 'autobiography',
          toComponent: 'fulfillment',
          dataType: 'patterns',
          description: 'Past patterns inform current commitments'
        },
        {
          fromComponent: 'fulfillment',
          toComponent: 'assessment',
          dataType: 'relationships',
          description: 'Commitments define relationship quality'
        },
        {
          fromComponent: 'assessment',
          toComponent: 'fulfillment',
          dataType: 'scores',
          description: 'Assessment scores update fulfillment status'
        }
      ]
    }
    setData(demoData)
  }, [])

  const handleDataUpdate = (component: keyof IntegratedDisplay, newData: any) => {
    if (data) {
      setData({
        ...data,
        [component]: newData
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-phoenix-smoke via-white to-phoenix-gold/5">
      {/* Header */}
      <header className="bg-white border-b border-phoenix-gold/20 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-phoenix-gold to-phoenix-orange rounded-lg">
                  <Layers className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-phoenix-red to-phoenix-orange bg-clip-text text-transparent">
                    WisdomOS Integrated Display
                  </h1>
                  <p className="text-sm text-black">Your Complete Life Operating System</p>
                </div>
              </div>
            </div>
            
            {/* View Selector */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveView('all')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeView === 'all' 
                    ? 'bg-phoenix-gold text-black' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                All Views
              </button>
              <button
                onClick={() => setActiveView('contribution')}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  activeView === 'contribution' 
                    ? 'bg-phoenix-gold text-black' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <Sparkles className="w-5 h-5" />
              </button>
              <button
                onClick={() => setActiveView('autobiography')}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  activeView === 'autobiography' 
                    ? 'bg-phoenix-gold text-black' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <Clock className="w-5 h-5" />
              </button>
              <button
                onClick={() => setActiveView('fulfillment')}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  activeView === 'fulfillment' 
                    ? 'bg-phoenix-gold text-black' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <Target className="w-5 h-5" />
              </button>
              <button
                onClick={() => setActiveView('assessment')}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  activeView === 'assessment' 
                    ? 'bg-phoenix-gold text-black' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Left Sidebar - Contribution Display (Identity Anchor) */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              className="w-96 bg-white border-r border-phoenix-gold/20 h-[calc(100vh-73px)] overflow-y-auto sticky top-[73px]"
            >
              <div className="p-6">
                <ContributionDisplay
                  data={data?.contribution}
                  onUpdate={(newData) => handleDataUpdate('contribution', newData)}
                />
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="flex-1 p-6">
          {activeView === 'all' ? (
            // All Views Layout
            <div className="space-y-6">
              {/* Center - Fulfillment Display */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <FulfillmentDisplay
                  data={data?.fulfillment}
                  onUpdate={(newData) => handleDataUpdate('fulfillment', newData)}
                />
              </motion.div>

              {/* Bottom Grid - Timeline and Assessment */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <AutobiographyTimeline
                    data={data?.autobiography}
                    onUpdate={(newData) => handleDataUpdate('autobiography', newData)}
                  />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <AssessmentTool
                    data={data?.assessment}
                    relationships={data?.fulfillment?.relationships}
                    onUpdate={(newData) => handleDataUpdate('assessment', newData)}
                  />
                </motion.div>
              </div>

              {/* Toxicity Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <ToxicityChart />
              </motion.div>

              {/* Data Flow Connections */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl p-6 border border-phoenix-gold/20"
              >
                <h3 className="text-lg font-semibold text-black mb-4">
                  🔄 Information Flow
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {data?.connections.map((connection, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium capitalize">
                          {connection.fromComponent}
                        </span>
                        <ArrowRight className="w-4 h-4 text-black" />
                        <span className="text-sm font-medium capitalize">
                          {connection.toComponent}
                        </span>
                      </div>
                      <p className="text-xs text-black">{connection.description}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          ) : (
            // Single View Mode
            <motion.div
              key={activeView}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              {activeView === 'contribution' && (
                <ContributionDisplay
                  data={data?.contribution}
                  onUpdate={(newData) => handleDataUpdate('contribution', newData)}
                />
              )}
              {activeView === 'autobiography' && (
                <AutobiographyTimeline
                  data={data?.autobiography}
                  onUpdate={(newData) => handleDataUpdate('autobiography', newData)}
                />
              )}
              {activeView === 'fulfillment' && (
                <FulfillmentDisplay
                  data={data?.fulfillment}
                  onUpdate={(newData) => handleDataUpdate('fulfillment', newData)}
                />
              )}
              {activeView === 'assessment' && (
                <AssessmentTool
                  data={data?.assessment}
                  relationships={data?.fulfillment?.relationships}
                  onUpdate={(newData) => handleDataUpdate('assessment', newData)}
                />
              )}
            </motion.div>
          )}
        </main>
      </div>

      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-phoenix-red to-phoenix-orange rounded-full shadow-lg flex items-center justify-center text-black z-50"
        onClick={() => {
          // Open quick entry modal
        }}
      >
        <Plus className="w-6 h-6" />
      </motion.button>
    </div>
  )
}

// Add missing Plus import
import { Plus } from 'lucide-react'