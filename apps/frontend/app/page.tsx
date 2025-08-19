'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PhoenixLogo from '@/components/PhoenixLogo'
import LifeAreaCard from '@/components/LifeAreaCard'
import PhoenixButton from '@/components/ui/PhoenixButton'
import { lifeAreas } from '@/lib/phoenix-theme'
import { Plus, RefreshCw, Map, TrendingUp, Award, Menu, X } from 'lucide-react'

// Mock data for demonstration
const mockDashboardData = lifeAreas.map(area => ({
  ...area,
  status: ['green', 'yellow', 'red'][Math.floor(Math.random() * 3)] as 'green' | 'yellow' | 'red',
  score: Math.floor(Math.random() * 5) - 2,
  upsets: Math.floor(Math.random() * 3),
  brokenCommitments: Math.floor(Math.random() * 2),
  recentEvents: [
    { title: 'Morning meditation completed', type: 'WIN', date: '2025-01-19' },
    { title: 'Boundary reset with client', type: 'BOUNDARY_RESET', date: '2025-01-18' }
  ]
}))

export default function Dashboard() {
  const [selectedArea, setSelectedArea] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [todaysPulse, setTodaysPulse] = useState<'great' | 'okay' | 'challenging'>('okay')

  const pulseEmojis = {
    great: '😊',
    okay: '😐',
    challenging: '😔'
  }

  // Calculate overall phoenix stage
  const totalScore = mockDashboardData.reduce((acc, area) => acc + area.score, 0)
  const phoenixStage = totalScore <= -10 ? 'ashes' : totalScore <= 0 ? 'fire' : totalScore <= 10 ? 'rebirth' : 'flight'
  
  const stageMessages = {
    ashes: "You're gathering strength in the ashes. This is where transformation begins.",
    fire: "You're in the fire of transformation. Trust the process.",
    rebirth: "You're emerging renewed. Your phoenix is rising!",
    flight: "You're soaring! Your transformation is taking flight!"
  }

  return (
    <div className="min-h-screen bg-phoenix-smoke">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-phoenix-smoke/80 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <PhoenixLogo size="sm" animated />
              <div>
                <h1 className="text-2xl font-bold flame-text">WisdomOS</h1>
                <p className="text-xs text-phoenix-gold/60">Rise into Fulfillment</p>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-4">
              <PhoenixButton variant="ghost" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Journal
              </PhoenixButton>
              <PhoenixButton variant="ghost" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset Ritual
              </PhoenixButton>
              <PhoenixButton variant="ghost" size="sm">
                <Map className="w-4 h-4 mr-2" />
                Fulfillment Display
              </PhoenixButton>
              <PhoenixButton variant="primary" size="sm">
                <Award className="w-4 h-4 mr-2" />
                Badges
              </PhoenixButton>
            </nav>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden text-phoenix-gold"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed inset-x-0 top-20 z-40 bg-phoenix-smoke/95 backdrop-blur-lg border-b border-white/10"
          >
            <nav className="container mx-auto px-4 py-4 space-y-2">
              <PhoenixButton variant="ghost" size="sm" className="w-full justify-start">
                <Plus className="w-4 h-4 mr-2" />
                Journal Entry
              </PhoenixButton>
              <PhoenixButton variant="ghost" size="sm" className="w-full justify-start">
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset Ritual
              </PhoenixButton>
              <PhoenixButton variant="ghost" size="sm" className="w-full justify-start">
                <Map className="w-4 h-4 mr-2" />
                Fulfillment Display
              </PhoenixButton>
              <PhoenixButton variant="primary" size="sm" className="w-full justify-start">
                <Award className="w-4 h-4 mr-2" />
                View Badges
              </PhoenixButton>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="container mx-auto px-4 py-8">
        {/* Today's Pulse Section */}
        <motion.section
          className="glass-card p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-xl font-semibold mb-4 text-phoenix-gold">Today's Pulse</h2>
          <div className="flex items-center gap-6">
            <p className="text-gray-300">How are you feeling today?</p>
            <div className="flex gap-4">
              {Object.entries(pulseEmojis).map(([mood, emoji]) => (
                <button
                  key={mood}
                  onClick={() => setTodaysPulse(mood as any)}
                  className={`text-3xl p-2 rounded-lg transition-all ${
                    todaysPulse === mood 
                      ? 'bg-phoenix-orange/20 ring-2 ring-phoenix-orange' 
                      : 'hover:bg-white/5'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Phoenix Stage Indicator */}
        <motion.section
          className="glass-card p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-phoenix-gold">Your Phoenix Cycle</h2>
            <span className="wisdom-badge">
              <TrendingUp className="w-4 h-4" />
              {phoenixStage.charAt(0).toUpperCase() + phoenixStage.slice(1)}
            </span>
          </div>
          <div className="space-y-3">
            <div className="cycle-indicator h-3">
              <div 
                className="cycle-progress h-full"
                style={{ width: `${((totalScore + 20) / 40) * 100}%` }}
              />
            </div>
            <p className="text-sm text-gray-300 italic">{stageMessages[phoenixStage]}</p>
          </div>
        </motion.section>

        {/* Life Areas Dashboard Grid */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-phoenix-gold">Life Areas</h2>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>🟢 Thriving</span>
              <span>🟡 Attention</span>
              <span>🔴 Breakdown</span>
            </div>
          </div>
          
          <div className="dashboard-grid">
            {mockDashboardData.map((area, index) => (
              <motion.div
                key={area.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <LifeAreaCard
                  id={area.id}
                  name={area.name}
                  phoenixName={area.phoenix}
                  status={area.status}
                  score={area.score}
                  upsets={area.upsets}
                  brokenCommitments={area.brokenCommitments}
                  recentEvents={area.recentEvents}
                  onClick={() => setSelectedArea(area.id)}
                />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <motion.section
          className="fixed bottom-6 right-6 flex flex-col gap-3"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <PhoenixButton variant="primary" size="lg" className="shadow-2xl">
            <Plus className="w-5 h-5 mr-2" />
            Quick Journal
          </PhoenixButton>
        </motion.section>
      </main>

      {/* Floating Embers Effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-phoenix-orange rounded-full"
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: window.innerHeight + 100,
              opacity: 0 
            }}
            animate={{
              y: -100,
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              delay: Math.random() * 10,
              ease: "linear"
            }}
            style={{
              left: `${Math.random() * 100}%`,
              filter: 'blur(1px)'
            }}
          />
        ))}
      </div>
    </div>
  )
}