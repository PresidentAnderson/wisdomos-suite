'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Flame, Heart, Briefcase, Home, Brain, Users, Palette, DollarSign, Clock, Sparkles, Shield, Archive, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LifeAreaCardProps {
  id: string
  name: string
  phoenixName: string
  status: 'green' | 'yellow' | 'red'
  score: number
  upsets: number
  brokenCommitments: number
  recentEvents: Array<{
    title: string
    type: string
    date: string
  }>
  onClick?: () => void
}

const iconMap: Record<string, any> = {
  work: Briefcase,
  health: Activity,
  finance: DollarSign,
  intimacy: Heart,
  time: Clock,
  spiritual: Sparkles,
  creativity: Palette,
  friendship: Users,
  learning: Brain,
  home: Home,
  sexuality: Heart,
  emotional: Shield,
  legacy: Archive
}

export default function LifeAreaCard({
  id,
  name,
  phoenixName,
  status,
  score,
  upsets,
  brokenCommitments,
  recentEvents,
  onClick
}: LifeAreaCardProps) {
  const Icon = iconMap[id] || Flame
  
  const statusStyles = {
    green: 'life-area-green hover:border-green-400/50',
    yellow: 'life-area-yellow hover:border-yellow-400/50',
    red: 'life-area-red hover:border-red-400/50'
  }
  
  const statusColors = {
    green: 'text-black',
    yellow: 'text-black',
    red: 'text-black'
  }
  
  const statusEmojis = {
    green: '🟢',
    yellow: '🟡',
    red: '🔴'
  }

  return (
    <motion.div
      className={cn(
        'glass-card p-5 cursor-pointer transition-all duration-300 border-2',
        statusStyles[status]
      )}
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn('p-2 rounded-lg bg-white/5', statusColors[status])}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-black">{name}</h3>
            <p className="text-xs text-black italic">{phoenixName}</p>
          </div>
        </div>
        <span className="text-2xl">{statusEmojis[status]}</span>
      </div>

      {/* Phoenix Cycle Indicator */}
      <div className="cycle-indicator mb-3">
        <div 
          className="cycle-progress"
          style={{ 
            width: `${Math.max(0, Math.min(100, (score + 2) * 25))}%`,
            background: status === 'green' 
              ? 'linear-gradient(90deg, #10B981, #FFD700)'
              : status === 'yellow'
              ? 'linear-gradient(90deg, #F59E0B, #FF914D)'
              : 'linear-gradient(90deg, #EF4444, #E63946)'
          }}
        />
      </div>

      {/* Stats */}
      <div className="flex justify-between text-sm mb-3">
        <span className="text-black">Score: <span className={statusColors[status]}>{score > 0 ? '+' : ''}{score}</span></span>
        {upsets > 0 && (
          <span className="text-black/70">Upsets: {upsets}</span>
        )}
        {brokenCommitments > 0 && (
          <span className="text-black/70">Broken: {brokenCommitments}</span>
        )}
      </div>

      {/* Recent Events */}
      {recentEvents.length > 0 && (
        <div className="space-y-1 pt-3 border-t border-white/5">
          {recentEvents.slice(0, 2).map((event, i) => (
            <motion.div
              key={i}
              className="text-xs text-black flex items-center gap-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <span className="w-1 h-1 bg-phoenix-orange rounded-full" />
              <span className="truncate">{event.title}</span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Hover Effect - Phoenix Rise */}
      <motion.div
        className="absolute inset-0 pointer-events-none rounded-2xl"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-phoenix-orange/5 to-transparent rounded-2xl" />
      </motion.div>
    </motion.div>
  )
}