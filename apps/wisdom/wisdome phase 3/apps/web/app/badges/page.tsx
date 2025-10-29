'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Award, Star, Crown, Flame, ChevronLeft, Lock } from 'lucide-react'
import Link from 'next/link'
import PhoenixButton from '@/components/ui/PhoenixButton'

interface Badge {
  id: string
  type: string
  name: string
  description: string
  icon: string
  color: string
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'
  progress: number
  maxProgress: number
  unlocked: boolean
  unlockedAt?: Date
  requirement: string
}

const badges: Badge[] = [
  {
    id: '1',
    type: 'ASHES_MASTER',
    name: 'From the Ashes',
    description: 'Rising from the depths of challenge',
    icon: '🌑',
    color: '#6B7280',
    rarity: 'COMMON',
    progress: 7,
    maxProgress: 10,
    unlocked: false,
    requirement: '10 journal entries in Ashes cycle',
  },
  {
    id: '2',
    type: 'FLAME_WALKER',
    name: 'Flame Walker',
    description: 'Walking through fire with courage',
    icon: '🔥',
    color: '#E63946',
    rarity: 'RARE',
    progress: 3,
    maxProgress: 5,
    unlocked: false,
    requirement: '5 boundary resets completed',
  },
  {
    id: '3',
    type: 'RISING_STAR',
    name: 'Rising Star',
    description: 'Emerging into your power',
    icon: '✨',
    color: '#FF914D',
    rarity: 'EPIC',
    progress: 15,
    maxProgress: 25,
    unlocked: false,
    requirement: '25 total life area improvements',
  },
  {
    id: '4',
    type: 'FULL_FLIGHT',
    name: 'Full Flight',
    description: 'Soaring at your highest potential',
    icon: '🦅',
    color: '#FFD700',
    rarity: 'LEGENDARY',
    progress: 2,
    maxProgress: 10,
    unlocked: false,
    requirement: '10 consecutive weeks of positive momentum',
  },
  {
    id: '5',
    type: 'BOUNDARY_GUARDIAN',
    name: 'Boundary Guardian',
    description: 'Master of personal boundaries',
    icon: '🛡️',
    color: '#8B5CF6',
    rarity: 'RARE',
    progress: 8,
    maxProgress: 12,
    unlocked: false,
    requirement: '12 monthly boundary audits',
  },
  {
    id: '6',
    type: 'PHOENIX_BORN',
    name: 'Phoenix Born',
    description: 'Truly embodying the Phoenix spirit',
    icon: '🔥',
    color: '#E63946',
    rarity: 'LEGENDARY',
    progress: 500,
    maxProgress: 1000,
    unlocked: false,
    requirement: '1000 wisdom score',
  },
  {
    id: '7',
    type: 'FIRST_ENTRY',
    name: 'First Words',
    description: 'Your journey begins with a single entry',
    icon: '📝',
    color: '#10B981',
    rarity: 'COMMON',
    progress: 1,
    maxProgress: 1,
    unlocked: true,
    unlockedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    requirement: 'Complete your first journal entry',
  },
  {
    id: '8',
    type: 'WEEKLY_WARRIOR',
    name: 'Weekly Warrior',
    description: 'Consistency is your superpower',
    icon: '⚔️',
    color: '#F59E0B',
    rarity: 'RARE',
    progress: 3,
    maxProgress: 7,
    unlocked: false,
    requirement: '7 days of consecutive journaling',
  },
]

const rarityColors = {
  COMMON: 'from-gray-400 to-gray-600',
  RARE: 'from-blue-400 to-blue-600',
  EPIC: 'from-purple-400 to-purple-600',
  LEGENDARY: 'from-yellow-400 to-yellow-600',
}

const rarityIcons = {
  COMMON: Star,
  RARE: Award,
  EPIC: Crown,
  LEGENDARY: Flame,
}

export default function BadgesPage() {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all')
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null)

  const filteredBadges = badges.filter(badge => {
    if (filter === 'unlocked') return badge.unlocked
    if (filter === 'locked') return !badge.unlocked
    return true
  })

  const unlockedCount = badges.filter(badge => badge.unlocked).length
  const totalCount = badges.length

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
                Phoenix Badges
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-black" />
              <span className="text-sm text-black">
                {unlockedCount}/{totalCount} unlocked
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-phoenix-gold/20"
          >
            <div className="text-3xl font-bold text-black mb-2">
              {unlockedCount}
            </div>
            <div className="text-sm text-black">Badges Earned</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-phoenix-gold/20"
          >
            <div className="text-3xl font-bold text-black mb-2">
              {Math.round((unlockedCount / totalCount) * 100)}%
            </div>
            <div className="text-sm text-black">Completion</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-phoenix-gold/20"
          >
            <div className="text-3xl font-bold text-black mb-2">
              {badges.filter(b => b.rarity === 'LEGENDARY' && b.unlocked).length}
            </div>
            <div className="text-sm text-black">Legendary</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-phoenix-gold/20"
          >
            <div className="text-3xl font-bold text-black mb-2">
              {badges.reduce((sum, badge) => sum + badge.progress, 0)}
            </div>
            <div className="text-sm text-black">Total Progress</div>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <PhoenixButton
            onClick={() => setFilter('all')}
            variant={filter === 'all' ? 'primary' : 'ghost'}
            size="sm"
          >
            All ({totalCount})
          </PhoenixButton>
          <PhoenixButton
            onClick={() => setFilter('unlocked')}
            variant={filter === 'unlocked' ? 'primary' : 'ghost'}
            size="sm"
          >
            Unlocked ({unlockedCount})
          </PhoenixButton>
          <PhoenixButton
            onClick={() => setFilter('locked')}
            variant={filter === 'locked' ? 'primary' : 'ghost'}
            size="sm"
          >
            Locked ({totalCount - unlockedCount})
          </PhoenixButton>
        </div>

        {/* Badge Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBadges.map((badge, index) => {
            const RarityIcon = rarityIcons[badge.rarity]
            const progressPercentage = (badge.progress / badge.maxProgress) * 100

            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="group cursor-pointer"
                onClick={() => setSelectedBadge(badge)}
              >
                <div className={`bg-white rounded-2xl shadow-lg border-2 transition-all hover:shadow-xl hover:scale-105 overflow-hidden ${
                  badge.unlocked 
                    ? 'border-phoenix-gold/50 hover:border-phoenix-gold' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  {/* Badge Header */}
                  <div className={`p-4 bg-gradient-to-r ${rarityColors[badge.rarity]} text-black relative`}>
                    <div className="flex items-center justify-between mb-2">
                      <RarityIcon className="w-5 h-5" />
                      <span className="text-xs font-medium uppercase tracking-wider">
                        {badge.rarity}
                      </span>
                    </div>
                    
                    {/* Badge Icon */}
                    <div className={`text-4xl mb-2 ${badge.unlocked ? '' : 'opacity-50'}`}>
                      {badge.unlocked ? badge.icon : '🔒'}
                    </div>
                    
                    {/* Unlock Status */}
                    {!badge.unlocked && (
                      <div className="absolute top-2 right-2">
                        <Lock className="w-4 h-4 opacity-70" />
                      </div>
                    )}
                  </div>

                  {/* Badge Content */}
                  <div className="p-4">
                    <h3 className={`font-bold mb-2 ${badge.unlocked ? 'text-black' : 'text-black'}`}>
                      {badge.name}
                    </h3>
                    <p className="text-sm text-black mb-3">
                      {badge.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-black mb-1">
                        <span>Progress</span>
                        <span>{badge.progress}/{badge.maxProgress}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                          className={`h-2 rounded-full bg-gradient-to-r ${rarityColors[badge.rarity]}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPercentage}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                        />
                      </div>
                    </div>

                    {/* Requirement */}
                    <p className="text-xs text-black font-medium">
                      {badge.requirement}
                    </p>

                    {/* Unlock Date */}
                    {badge.unlocked && badge.unlockedAt && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-black font-medium">
                          Unlocked {badge.unlockedAt.toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Empty State */}
        {filteredBadges.length === 0 && (
          <div className="text-center py-12">
            <Award className="w-16 h-16 text-black mx-auto mb-4" />
            <p className="text-black">No badges found for this filter</p>
          </div>
        )}
      </main>

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-md w-full overflow-hidden"
          >
            {/* Modal Header */}
            <div className={`p-6 bg-gradient-to-r ${rarityColors[selectedBadge.rarity]} text-black text-center`}>
              <div className="text-6xl mb-4">
                {selectedBadge.unlocked ? selectedBadge.icon : '🔒'}
              </div>
              <h2 className="text-2xl font-bold mb-2">{selectedBadge.name}</h2>
              <p className="opacity-90">{selectedBadge.description}</p>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="mb-4">
                <div className="flex justify-between text-sm text-black mb-2">
                  <span>Progress</span>
                  <span>{selectedBadge.progress}/{selectedBadge.maxProgress}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full bg-gradient-to-r ${rarityColors[selectedBadge.rarity]}`}
                    style={{ width: `${(selectedBadge.progress / selectedBadge.maxProgress) * 100}%` }}
                  />
                </div>
              </div>

              <div className="mb-4">
                <h3 className="font-semibold text-black mb-2">Requirement</h3>
                <p className="text-black">{selectedBadge.requirement}</p>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-black mb-2">Rarity</h3>
                <span className={`inline-block px-3 py-1 rounded-full text-black text-sm bg-gradient-to-r ${rarityColors[selectedBadge.rarity]}`}>
                  {selectedBadge.rarity}
                </span>
              </div>

              {selectedBadge.unlocked && selectedBadge.unlockedAt && (
                <div className="mb-6">
                  <h3 className="font-semibold text-black mb-2">Unlocked</h3>
                  <p className="text-black">
                    {selectedBadge.unlockedAt.toLocaleDateString()} at {selectedBadge.unlockedAt.toLocaleTimeString()}
                  </p>
                </div>
              )}

              <PhoenixButton
                onClick={() => setSelectedBadge(null)}
                className="w-full"
              >
                Close
              </PhoenixButton>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}