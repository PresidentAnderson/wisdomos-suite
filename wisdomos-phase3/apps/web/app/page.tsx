'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import PhoenixLogo from '@/components/PhoenixLogo'
import LifeAreaCard from '@/components/LifeAreaCard'
import PhoenixButton from '@/components/ui/PhoenixButton'
import { lifeAreas } from '@/lib/phoenix-theme'
import { Plus, RefreshCw, Map, TrendingUp, Award, Menu, X, Target } from 'lucide-react'

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
  const [showMoodHistory, setShowMoodHistory] = useState(false)

  const pulseEmojis = {
    great: '😊',
    okay: '😐',
    challenging: '😔'
  }

  // Mock 7-day mood history
  const moodHistory = [
    { day: 'Mon', mood: 'great', date: '2025-10-23' },
    { day: 'Tue', mood: 'okay', date: '2025-10-24' },
    { day: 'Wed', mood: 'great', date: '2025-10-25' },
    { day: 'Thu', mood: 'challenging', date: '2025-10-26' },
    { day: 'Fri', mood: 'okay', date: '2025-10-27' },
    { day: 'Sat', mood: 'great', date: '2025-10-28' },
    { day: 'Today', mood: todaysPulse, date: '2025-10-29' }
  ]

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'great': return 'bg-green-500'
      case 'okay': return 'bg-yellow-500'
      case 'challenging': return 'bg-red-500'
      default: return 'bg-gray-300'
    }
  }

  const getMoodHeight = (mood: string) => {
    switch (mood) {
      case 'great': return 'h-16'
      case 'okay': return 'h-10'
      case 'challenging': return 'h-6'
      default: return 'h-8'
    }
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <PhoenixLogo size="sm" animated />
              <div>
                <h1 className="text-2xl font-bold flame-text">WisdomOS</h1>
                <p className="text-xs text-black">Rise into Fulfillment</p>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-4">
              <Link href="/journal">
                <PhoenixButton variant="ghost" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Journal
                </PhoenixButton>
              </Link>
              <Link href="/commitments">
                <PhoenixButton variant="ghost" size="sm">
                  <Target className="w-4 h-4 mr-2" />
                  Commitments
                </PhoenixButton>
              </Link>
              <Link href="/reset">
                <PhoenixButton variant="ghost" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset Ritual
                </PhoenixButton>
              </Link>
              <Link href="/fulfillment">
                <PhoenixButton variant="ghost" size="sm">
                  <Map className="w-4 h-4 mr-2" />
                  Fulfillment Display
                </PhoenixButton>
              </Link>
              <Link href="/badges">
                <PhoenixButton variant="primary" size="sm">
                  <Award className="w-4 h-4 mr-2" />
                  Badges
                </PhoenixButton>
              </Link>
            </nav>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden text-black"
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
            className="md:hidden fixed inset-x-0 top-20 z-40 bg-white/95 backdrop-blur-lg border-b border-white/10"
          >
            <nav className="container mx-auto px-4 py-4 space-y-2">
              <Link href="/journal" onClick={() => setMobileMenuOpen(false)}>
                <PhoenixButton variant="ghost" size="sm" className="w-full justify-start">
                  <Plus className="w-4 h-4 mr-2" />
                  Journal Entry
                </PhoenixButton>
              </Link>
              <Link href="/commitments" onClick={() => setMobileMenuOpen(false)}>
                <PhoenixButton variant="ghost" size="sm" className="w-full justify-start">
                  <Target className="w-4 h-4 mr-2" />
                  Commitments
                </PhoenixButton>
              </Link>
              <Link href="/reset" onClick={() => setMobileMenuOpen(false)}>
                <PhoenixButton variant="ghost" size="sm" className="w-full justify-start">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset Ritual
                </PhoenixButton>
              </Link>
              <Link href="/fulfillment" onClick={() => setMobileMenuOpen(false)}>
                <PhoenixButton variant="ghost" size="sm" className="w-full justify-start">
                  <Map className="w-4 h-4 mr-2" />
                  Fulfillment Display
                </PhoenixButton>
              </Link>
              <Link href="/badges" onClick={() => setMobileMenuOpen(false)}>
                <PhoenixButton variant="primary" size="sm" className="w-full justify-start">
                  <Award className="w-4 h-4 mr-2" />
                  View Badges
                </PhoenixButton>
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="container mx-auto px-4 py-8">
        {/* Section Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Daily Alignment</h1>
          <p className="text-sm text-gray-600">Reflect on how you feel and where you are in your Phoenix journey.</p>
        </div>

        {/* Side-by-Side Layout: Today's Pulse + Phoenix Cycle */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Today's Pulse Card */}
          <motion.section
            className="glass-card p-6 flex flex-col justify-between"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-black">Today's Pulse</h2>
                <button
                  onClick={() => setShowMoodHistory(!showMoodHistory)}
                  className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-600 transition-colors"
                >
                  {showMoodHistory ? 'Hide' : 'Show'} History
                </button>
              </div>

              <p className="text-sm text-gray-600 mb-4">How are you feeling today?</p>

              <div className="flex gap-3 mb-4">
                {Object.entries(pulseEmojis).map(([mood, emoji]) => (
                  <button
                    key={mood}
                    onClick={() => setTodaysPulse(mood as any)}
                    className={`text-4xl p-3 rounded-xl transition-all transform ${
                      todaysPulse === mood
                        ? 'bg-amber-50 ring-2 ring-phoenix-orange scale-105'
                        : 'bg-gray-50 hover:bg-amber-50 hover:scale-105'
                    }`}
                    title={mood}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* 7-Day Mood History */}
              <AnimatePresence>
                {showMoodHistory && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-gray-200 pt-4 mt-2">
                      <p className="text-xs text-gray-500 mb-3">Last 7 Days</p>
                      <div className="flex items-end gap-2 h-20">
                        {moodHistory.map((entry, index) => (
                          <div key={index} className="flex-1 flex flex-col items-center gap-1">
                            <motion.div
                              initial={{ scaleY: 0 }}
                              animate={{ scaleY: 1 }}
                              transition={{ delay: index * 0.05 }}
                              className={`w-full rounded-t-md ${getMoodColor(entry.mood)} ${getMoodHeight(entry.mood)} origin-bottom`}
                              title={`${entry.day}: ${entry.mood}`}
                            />
                            <span className="text-xs text-gray-500">{entry.day}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-center gap-4 mt-3 text-xs">
                        <span className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded bg-green-500" />
                          Great
                        </span>
                        <span className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded bg-yellow-500" />
                          Okay
                        </span>
                        <span className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded bg-red-500" />
                          Tough
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.section>

          {/* Phoenix Cycle Card */}
          <motion.section
            className="glass-card p-6 flex flex-col justify-between"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-black">Your Phoenix Cycle</h2>
                <span className="wisdom-badge">
                  <TrendingUp className="w-4 h-4" />
                  {phoenixStage.charAt(0).toUpperCase() + phoenixStage.slice(1)}
                </span>
              </div>

              {/* Progress Percentage */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">Progress</span>
                <span className="text-sm font-semibold text-gray-900">
                  {Math.round(((totalScore + 20) / 40) * 100)}%
                </span>
              </div>

              <div className="space-y-3">
                {/* Enhanced Progress Bar with Markers */}
                <div className="relative">
                  <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${((totalScore + 20) / 40) * 100}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full"
                    />
                  </div>
                  {/* Stage Markers */}
                  <div className="absolute -top-1 left-0 w-full flex justify-between px-1">
                    {['Ashes', 'Fire', 'Rebirth', 'Flight'].map((stage, i) => (
                      <div
                        key={stage}
                        className={`w-1 h-4 rounded-full transition-colors ${
                          ((totalScore + 20) / 40) * 100 >= i * 25
                            ? 'bg-orange-500'
                            : 'bg-gray-300'
                        }`}
                        title={stage}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-sm text-gray-700 italic">{stageMessages[phoenixStage]}</p>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {mockDashboardData.filter(a => a.status === 'green').length}
                    </p>
                    <p className="text-xs text-gray-500">Thriving</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">
                      {mockDashboardData.filter(a => a.status === 'red').length}
                    </p>
                    <p className="text-xs text-gray-500">Needs Focus</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-end">
              <Link href="/reset" className="flex-1 sm:flex-none">
                <button className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors">
                  Start Rebirth
                </button>
              </Link>
              <Link href="/fulfillment" className="flex-1 sm:flex-none">
                <button className="w-full px-4 py-2 border-2 border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:border-gray-300 hover:bg-gray-50 transition-colors">
                  View Details
                </button>
              </Link>
            </div>
          </motion.section>
        </div>

        {/* Life Areas Dashboard Grid */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-black">Life Areas</h2>
            <div className="flex items-center gap-2 text-sm text-black">
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
                <Link href={`/life-area/${area.id}`}>
                  <LifeAreaCard
                    id={area.id}
                    name={area.name}
                    phoenixName={area.phoenix}
                    status={area.status}
                    score={area.score}
                    upsets={area.upsets}
                    brokenCommitments={area.brokenCommitments}
                    recentEvents={area.recentEvents}
                  />
                </Link>
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
          <Link href="/journal">
            <PhoenixButton variant="primary" size="lg" className="shadow-2xl">
              <Plus className="w-5 h-5 mr-2" />
              Quick Journal
            </PhoenixButton>
          </Link>
        </motion.section>
      </main>

      {/* Floating Embers Effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-phoenix-orange rounded-full"
            initial={{ 
              x: Math.random() * 1920,
              y: 1180,
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