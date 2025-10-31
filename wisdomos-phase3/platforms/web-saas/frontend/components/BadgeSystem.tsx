'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { phoenixTheme } from '@/lib/phoenix-theme'
import { Award, Lock, Star, Zap } from 'lucide-react'

interface Badge {
  id: string
  name: string
  description: string
  icon: string
  color: string
  unlocked: boolean
  progress: number
  maxProgress: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

const mockBadges: Badge[] = [
  {
    id: 'ashes-master',
    ...phoenixTheme.badges.ashesMaster,
    unlocked: true,
    progress: 30,
    maxProgress: 30,
    rarity: 'common'
  },
  {
    id: 'flame-walker',
    ...phoenixTheme.badges.flameWalker,
    unlocked: true,
    progress: 10,
    maxProgress: 10,
    rarity: 'rare'
  },
  {
    id: 'rising-star',
    ...phoenixTheme.badges.risingStar,
    unlocked: false,
    progress: 3,
    maxProgress: 5,
    rarity: 'epic'
  },
  {
    id: 'full-flight',
    ...phoenixTheme.badges.fullFlight,
    unlocked: false,
    progress: 12,
    maxProgress: 30,
    rarity: 'legendary'
  },
  {
    id: 'boundary-guardian',
    ...phoenixTheme.badges.boundaryGuardian,
    unlocked: true,
    progress: 20,
    maxProgress: 20,
    rarity: 'rare'
  },
  {
    id: 'transformation-catalyst',
    ...phoenixTheme.badges.transformationCatalyst,
    unlocked: false,
    progress: 2,
    maxProgress: 5,
    rarity: 'epic'
  }
]

export default function BadgeSystem() {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null)

  const rarityColors = {
    common: 'from-gray-600 to-gray-500',
    rare: 'from-blue-600 to-blue-500',
    epic: 'from-purple-600 to-purple-500',
    legendary: 'from-phoenix-gold to-phoenix-orange'
  }

  const rarityGlow = {
    common: 'shadow-gray-500/30',
    rare: 'shadow-blue-500/30',
    epic: 'shadow-purple-500/30',
    legendary: 'shadow-phoenix-gold/50'
  }

  return (
    <div className="w-full">
      {/* Badge Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {mockBadges.map((badge, index) => (
          <motion.div
            key={badge.id}
            className="relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <motion.button
              className={`w-full glass-card p-6 relative overflow-hidden transition-all ${
                badge.unlocked 
                  ? 'border-2 border-transparent hover:border-phoenix-gold/30' 
                  : 'opacity-60 border-2 border-phoenix-ash/30'
              }`}
              onClick={() => setSelectedBadge(badge)}
              whileHover={badge.unlocked ? { scale: 1.05 } : {}}
              whileTap={badge.unlocked ? { scale: 0.95 } : {}}
            >
              {/* Rarity Background Gradient */}
              {badge.unlocked && (
                <div className={`absolute inset-0 bg-gradient-to-br ${rarityColors[badge.rarity]} opacity-10`} />
              )}

              {/* Badge Icon */}
              <div className="relative z-10">
                <motion.div
                  className={`text-5xl mx-auto mb-3 ${
                    badge.unlocked ? '' : 'filter grayscale'
                  }`}
                  animate={badge.unlocked ? {
                    rotate: [0, -10, 10, -10, 0],
                  } : {}}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 5
                  }}
                >
                  {badge.icon}
                </motion.div>

                {/* Lock Overlay for Locked Badges */}
                {!badge.unlocked && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Lock className="w-6 h-6 text-black" />
                  </div>
                )}

                {/* Badge Name */}
                <h4 className={`text-sm font-semibold mb-2 ${
                  badge.unlocked ? 'text-black' : 'text-black'
                }`}>
                  {badge.name}
                </h4>

                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-phoenix-ash/30 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${
                      badge.unlocked 
                        ? `${rarityColors[badge.rarity]}` 
                        : 'from-gray-600 to-gray-500'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${(badge.progress / badge.maxProgress) * 100}%` }}
                    transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                  />
                </div>

                {/* Progress Text */}
                <p className="text-xs text-black mt-1">
                  {badge.progress}/{badge.maxProgress}
                </p>

                {/* Rarity Indicator */}
                <div className="absolute top-2 right-2">
                  {badge.rarity === 'legendary' && (
                    <Star className="w-4 h-4 text-black" />
                  )}
                  {badge.rarity === 'epic' && (
                    <Zap className="w-4 h-4 text-black" />
                  )}
                </div>
              </div>

              {/* Shine Effect for Unlocked Badges */}
              {badge.unlocked && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  initial={{ x: '-100%' }}
                  animate={{ x: '200%' }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 5,
                    ease: 'linear'
                  }}
                />
              )}
            </motion.button>

            {/* New Badge Indicator */}
            {badge.unlocked && badge.id === 'boundary-guardian' && (
              <motion.div
                className="absolute -top-2 -right-2 bg-phoenix-orange text-black text-xs px-2 py-1 rounded-full font-semibold"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', bounce: 0.5 }}
              >
                NEW!
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Badge Detail Modal */}
      <AnimatePresence>
        {selectedBadge && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedBadge(null)}
          >
            <motion.div
              className={`glass-card p-8 max-w-md w-full relative ${
                selectedBadge.unlocked 
                  ? `shadow-2xl ${rarityGlow[selectedBadge.rarity]}`
                  : ''
              }`}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                className="absolute top-4 right-4 text-black hover:text-black"
                onClick={() => setSelectedBadge(null)}
              >
                ✕
              </button>

              {/* Badge Icon Large */}
              <div className="text-center mb-6">
                <motion.div
                  className={`text-8xl mx-auto mb-4 ${
                    selectedBadge.unlocked ? '' : 'filter grayscale opacity-50'
                  }`}
                  animate={selectedBadge.unlocked ? {
                    rotate: [0, -5, 5, -5, 0],
                    scale: [1, 1.1, 1],
                  } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {selectedBadge.icon}
                </motion.div>
                
                <h3 className={`text-2xl font-bold mb-2 ${
                  selectedBadge.unlocked ? 'flame-text' : 'text-black'
                }`}>
                  {selectedBadge.name}
                </h3>
                
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                  selectedBadge.unlocked 
                    ? `bg-gradient-to-r ${rarityColors[selectedBadge.rarity]} text-black`
                    : 'bg-phoenix-ash/30 text-black'
                }`}>
                  <Award className="w-4 h-4" />
                  {selectedBadge.rarity.charAt(0).toUpperCase() + selectedBadge.rarity.slice(1)}
                </div>
              </div>

              {/* Description */}
              <p className="text-black text-center mb-6">
                {selectedBadge.description}
              </p>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-black">Progress</span>
                  <span className={selectedBadge.unlocked ? 'text-black' : 'text-black'}>
                    {selectedBadge.progress}/{selectedBadge.maxProgress}
                  </span>
                </div>
                <div className="w-full h-3 bg-phoenix-ash/30 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${
                      selectedBadge.unlocked 
                        ? `${rarityColors[selectedBadge.rarity]}` 
                        : 'from-gray-600 to-gray-500'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${(selectedBadge.progress / selectedBadge.maxProgress) * 100}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>

              {/* Status Message */}
              <div className="mt-6 text-center">
                {selectedBadge.unlocked ? (
                  <p className="text-black font-semibold">
                    ✨ Achievement Unlocked!
                  </p>
                ) : (
                  <p className="text-black">
                    {selectedBadge.maxProgress - selectedBadge.progress} more to unlock
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}