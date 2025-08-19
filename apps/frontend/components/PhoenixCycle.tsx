'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { phoenixTheme } from '@/lib/phoenix-theme'
import { Flame, Star, Wind, Moon } from 'lucide-react'

interface PhoenixCycleProps {
  currentStage: 'ashes' | 'fire' | 'rebirth' | 'flight'
  score?: number
  interactive?: boolean
  onStageClick?: (stage: string) => void
}

export default function PhoenixCycle({ 
  currentStage, 
  score = 0,
  interactive = false,
  onStageClick 
}: PhoenixCycleProps) {
  const stages = [
    { key: 'ashes', icon: Moon, ...phoenixTheme.cycles.ashes },
    { key: 'fire', icon: Flame, ...phoenixTheme.cycles.fire },
    { key: 'rebirth', icon: Star, ...phoenixTheme.cycles.rebirth },
    { key: 'flight', icon: Wind, ...phoenixTheme.cycles.flight }
  ]

  const currentIndex = stages.findIndex(s => s.key === currentStage)

  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className="relative mb-8">
        <div className="absolute inset-0 h-1 bg-phoenix-ash/30 rounded-full" />
        <motion.div
          className="absolute h-1 rounded-full bg-phoenix-gradient"
          initial={{ width: '0%' }}
          animate={{ width: `${((currentIndex + 1) / stages.length) * 100}%` }}
          transition={{ duration: 1, ease: 'easeInOut' }}
        />
      </div>

      {/* Stages */}
      <div className="grid grid-cols-4 gap-4">
        {stages.map((stage, index) => {
          const Icon = stage.icon
          const isActive = stage.key === currentStage
          const isPast = index < currentIndex
          const isFuture = index > currentIndex

          return (
            <motion.div
              key={stage.key}
              className={`relative ${interactive ? 'cursor-pointer' : ''}`}
              onClick={() => interactive && onStageClick?.(stage.key)}
              whileHover={interactive ? { scale: 1.05 } : {}}
              whileTap={interactive ? { scale: 0.95 } : {}}
            >
              {/* Connection Line */}
              {index < stages.length - 1 && (
                <div
                  className={`absolute top-8 left-1/2 w-full h-0.5 ${
                    isPast || isActive ? 'bg-phoenix-gold/50' : 'bg-phoenix-ash/30'
                  }`}
                  style={{ transform: 'translateX(50%)' }}
                />
              )}

              {/* Stage Circle */}
              <motion.div
                className={`relative mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
                  isActive
                    ? 'bg-gradient-to-br from-phoenix-red to-phoenix-orange shadow-lg shadow-phoenix-orange/50'
                    : isPast
                    ? 'bg-gradient-to-br from-phoenix-gold/30 to-phoenix-flame/30'
                    : 'bg-phoenix-ash/20 border border-phoenix-ash/30'
                }`}
                animate={isActive ? {
                  boxShadow: [
                    '0 0 20px rgba(255, 145, 77, 0.5)',
                    '0 0 40px rgba(255, 145, 77, 0.8)',
                    '0 0 20px rgba(255, 145, 77, 0.5)'
                  ]
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Icon 
                  className={`w-6 h-6 ${
                    isActive ? 'text-white' : isPast ? 'text-phoenix-gold' : 'text-phoenix-ash'
                  }`}
                />
                
                {/* Active Indicator */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-phoenix-gold"
                    initial={{ scale: 1, opacity: 1 }}
                    animate={{ scale: 1.3, opacity: 0 }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </motion.div>

              {/* Stage Info */}
              <div className="mt-3 text-center">
                <h4 className={`text-sm font-semibold ${
                  isActive ? 'text-phoenix-gold' : isFuture ? 'text-phoenix-ash' : 'text-gray-400'
                }`}>
                  {stage.name.split(' ')[0]}
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  {stage.icon}
                </p>
              </div>

              {/* Tooltip on Hover */}
              {interactive && (
                <motion.div
                  className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-phoenix-smoke/95 backdrop-blur-lg rounded-lg p-3 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity w-48 z-10"
                  initial={{ opacity: 0, y: 10 }}
                  whileHover={{ opacity: 1, y: 0 }}
                >
                  <p className="text-xs text-gray-300">{stage.description}</p>
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Current Stage Description */}
      <motion.div
        className="mt-8 text-center"
        key={currentStage}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-lg font-semibold flame-text mb-2">
          {stages[currentIndex].name}
        </h3>
        <p className="text-sm text-gray-400 max-w-md mx-auto">
          {stages[currentIndex].description}
        </p>
        {score !== undefined && (
          <div className="mt-3">
            <span className="wisdom-badge">
              Score: {score > 0 ? '+' : ''}{score}
            </span>
          </div>
        )}
      </motion.div>
    </div>
  )
}