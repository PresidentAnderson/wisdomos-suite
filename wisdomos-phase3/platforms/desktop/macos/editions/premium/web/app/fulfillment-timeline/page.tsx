'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar,
  TrendingUp,
  TrendingDown,
  Users,
  ChevronLeft,
  ChevronRight,
  Clock,
  Activity,
  Target
} from 'lucide-react'
import Link from 'next/link'
import PhoenixButton from '@/components/ui/PhoenixButton'

// Monthly snapshot data structure
const snapshots: Record<string, any[]> = {
  January: [
    {
      name: "Work & Purpose",
      phoenixName: "Sacred Fire",
      level: "High",
      color: "#FFD700",
      progress: 90,
      relationships: [
        { name: "Djamel", size: 60, status: "green", role: "Mentor" },
        { name: "Michael", size: 40, status: "yellow", role: "Colleague" },
        { name: "Zied", size: 30, status: "green", role: "Partner" },
      ],
    },
    {
      name: "Health & Recovery",
      phoenixName: "Inner Flame",
      level: "Moderate",
      color: "#E63946",
      progress: 65,
      relationships: [
        { name: "Pharmacist", size: 40, status: "green", role: "Healthcare" },
        { name: "Therapist", size: 30, status: "yellow", role: "Support" },
        { name: "Djamel", size: 50, status: "red", role: "Accountability" },
      ],
    },
    {
      name: "Finance",
      phoenixName: "Golden Wings",
      level: "Low",
      color: "#FF914D",
      progress: 45,
      relationships: [
        { name: "Accountant", size: 35, status: "yellow", role: "Advisor" },
      ],
    },
  ],
  February: [
    {
      name: "Work & Purpose",
      phoenixName: "Sacred Fire",
      level: "High",
      color: "#FFD700",
      progress: 88,
      relationships: [
        { name: "Djamel", size: 60, status: "green", role: "Mentor" },
        { name: "Michael", size: 40, status: "green", role: "Colleague" },
        { name: "Zied", size: 30, status: "yellow", role: "Partner" },
      ],
    },
    {
      name: "Health & Recovery",
      phoenixName: "Inner Flame",
      level: "Moderate",
      color: "#E63946",
      progress: 70,
      relationships: [
        { name: "Pharmacist", size: 40, status: "green", role: "Healthcare" },
        { name: "Therapist", size: 30, status: "green", role: "Support" },
        { name: "Djamel", size: 50, status: "yellow", role: "Accountability" },
      ],
    },
    {
      name: "Finance",
      phoenixName: "Golden Wings",
      level: "Moderate",
      color: "#FF914D",
      progress: 52,
      relationships: [
        { name: "Accountant", size: 35, status: "green", role: "Advisor" },
        { name: "Bank Advisor", size: 25, status: "green", role: "Banking" },
      ],
    },
  ],
  March: [
    {
      name: "Work & Purpose",
      phoenixName: "Sacred Fire",
      level: "High",
      color: "#FFD700",
      progress: 85,
      relationships: [
        { name: "Djamel", size: 60, status: "green", role: "Mentor" },
        { name: "Michael", size: 40, status: "yellow", role: "Colleague" },
        { name: "Zied", size: 30, status: "yellow", role: "Partner" },
      ],
    },
    {
      name: "Health & Recovery",
      phoenixName: "Inner Flame",
      level: "Moderate",
      color: "#E63946",
      progress: 68,
      relationships: [
        { name: "Pharmacist", size: 40, status: "yellow", role: "Healthcare" },
        { name: "Therapist", size: 30, status: "green", role: "Support" },
        { name: "Djamel", size: 50, status: "yellow", role: "Accountability" },
      ],
    },
    {
      name: "Finance",
      phoenixName: "Golden Wings",
      level: "Moderate",
      color: "#FF914D",
      progress: 55,
      relationships: [
        { name: "Accountant", size: 35, status: "green", role: "Advisor" },
        { name: "Bank Advisor", size: 25, status: "yellow", role: "Banking" },
      ],
    },
  ],
  April: [
    {
      name: "Work & Purpose",
      phoenixName: "Sacred Fire",
      level: "High",
      color: "#FFD700",
      progress: 82,
      relationships: [
        { name: "Djamel", size: 60, status: "green", role: "Mentor" },
        { name: "Michael", size: 40, status: "yellow", role: "Colleague" },
        { name: "Zied", size: 30, status: "red", role: "Partner" },
      ],
    },
    {
      name: "Health & Recovery",
      phoenixName: "Inner Flame",
      level: "Moderate",
      color: "#E63946",
      progress: 60,
      relationships: [
        { name: "Pharmacist", size: 40, status: "red", role: "Healthcare" },
        { name: "Therapist", size: 30, status: "yellow", role: "Support" },
        { name: "Djamel", size: 50, status: "yellow", role: "Accountability" },
      ],
    },
    {
      name: "Finance",
      phoenixName: "Golden Wings",
      level: "Moderate",
      color: "#FF914D",
      progress: 58,
      relationships: [
        { name: "Accountant", size: 35, status: "yellow", role: "Advisor" },
        { name: "Bank Advisor", size: 25, status: "green", role: "Banking" },
      ],
    },
  ],
  May: [
    {
      name: "Work & Purpose",
      phoenixName: "Sacred Fire",
      level: "High",
      color: "#FFD700",
      progress: 87,
      relationships: [
        { name: "Djamel", size: 65, status: "green", role: "Mentor" },
        { name: "Michael", size: 45, status: "green", role: "Colleague" },
        { name: "Zied", size: 35, status: "green", role: "Partner" },
        { name: "Sarah", size: 30, status: "green", role: "New Team" },
      ],
    },
    {
      name: "Health & Recovery",
      phoenixName: "Inner Flame",
      level: "High",
      color: "#E63946",
      progress: 72,
      relationships: [
        { name: "Pharmacist", size: 40, status: "green", role: "Healthcare" },
        { name: "Therapist", size: 30, status: "yellow", role: "Support" },
        { name: "Djamel", size: 50, status: "green", role: "Accountability" },
      ],
    },
    {
      name: "Finance",
      phoenixName: "Golden Wings",
      level: "High",
      color: "#FF914D",
      progress: 65,
      relationships: [
        { name: "Accountant", size: 40, status: "green", role: "Advisor" },
        { name: "Bank Advisor", size: 30, status: "green", role: "Banking" },
        { name: "Investor", size: 35, status: "green", role: "Investment" },
      ],
    },
  ],
  June: [
    {
      name: "Work & Purpose",
      phoenixName: "Sacred Fire",
      level: "High",
      color: "#FFD700",
      progress: 89,
      relationships: [
        { name: "Djamel", size: 65, status: "green", role: "Mentor" },
        { name: "Michael", size: 45, status: "green", role: "Colleague" },
        { name: "Zied", size: 35, status: "green", role: "Partner" },
        { name: "Sarah", size: 35, status: "green", role: "New Team" },
      ],
    },
    {
      name: "Health & Recovery",
      phoenixName: "Inner Flame",
      level: "High",
      color: "#E63946",
      progress: 75,
      relationships: [
        { name: "Pharmacist", size: 40, status: "green", role: "Healthcare" },
        { name: "Therapist", size: 30, status: "green", role: "Support" },
        { name: "Djamel", size: 50, status: "green", role: "Accountability" },
      ],
    },
    {
      name: "Finance",
      phoenixName: "Golden Wings",
      level: "High",
      color: "#FF914D",
      progress: 70,
      relationships: [
        { name: "Accountant", size: 40, status: "green", role: "Advisor" },
        { name: "Bank Advisor", size: 30, status: "green", role: "Banking" },
        { name: "Investor", size: 40, status: "green", role: "Investment" },
      ],
    },
  ],
}

// Add remaining months with similar structure
const remainingMonths = ['July', 'August', 'September', 'October', 'November', 'December']
remainingMonths.forEach((month, index) => {
  snapshots[month] = snapshots.June.map(area => ({
    ...area,
    progress: Math.min(100, area.progress + index * 2),
    relationships: area.relationships.map((rel: any) => ({
      ...rel,
      size: Math.min(70, rel.size + index),
      status: index > 3 ? 'green' : rel.status
    }))
  }))
})

export default function FulfillmentTimelinePage() {
  const [selectedMonth, setSelectedMonth] = useState('January')
  const months = Object.keys(snapshots)
  const currentMonthIndex = months.indexOf(selectedMonth)

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' 
      ? Math.max(0, currentMonthIndex - 1)
      : Math.min(months.length - 1, currentMonthIndex + 1)
    setSelectedMonth(months[newIndex])
  }

  const statusColors = {
    green: 'bg-green-400 border-green-500',
    yellow: 'bg-yellow-400 border-yellow-500',
    red: 'bg-red-400 border-red-500',
  }

  const levelColors: Record<string, string> = {
    High: 'bg-green-100 text-black border-green-300',
    Moderate: 'bg-yellow-100 text-black border-yellow-300',
    Low: 'bg-red-100 text-black border-red-300',
  }

  // Calculate overall progress
  const currentSnapshot = snapshots[selectedMonth]
  const overallProgress = Math.round(
    currentSnapshot.reduce((sum, area) => sum + area.progress, 0) / currentSnapshot.length
  )

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
                Fulfillment Timeline
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-black" />
              <span className="text-sm text-black">2024 Journey</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Month Navigation */}
        <div className="bg-white rounded-2xl shadow-xl p-4 mb-6 border border-phoenix-gold/20">
          <div className="flex items-center justify-between">
            <PhoenixButton
              onClick={() => navigateMonth('prev')}
              variant="ghost"
              size="sm"
              disabled={currentMonthIndex === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </PhoenixButton>

            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {months.map((month) => (
                <PhoenixButton
                  key={month}
                  onClick={() => setSelectedMonth(month)}
                  variant={selectedMonth === month ? 'primary' : 'ghost'}
                  size="sm"
                  className="min-w-[80px]"
                >
                  {month.slice(0, 3)}
                </PhoenixButton>
              ))}
            </div>

            <PhoenixButton
              onClick={() => navigateMonth('next')}
              variant="ghost"
              size="sm"
              disabled={currentMonthIndex === months.length - 1}
            >
              <ChevronRight className="w-4 h-4" />
            </PhoenixButton>
          </div>
        </div>

        {/* Overall Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-phoenix-gold/20"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-black">
              {selectedMonth} Overview
            </h2>
            <div className="flex items-center gap-2">
              {overallProgress >= 70 ? (
                <TrendingUp className="w-5 h-5 text-black" />
              ) : overallProgress >= 50 ? (
                <Activity className="w-5 h-5 text-black" />
              ) : (
                <TrendingDown className="w-5 h-5 text-black" />
              )}
              <span className="text-2xl font-bold text-black">
                {overallProgress}%
              </span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <motion.div
              className="h-3 rounded-full bg-gradient-to-r from-phoenix-red to-phoenix-orange"
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-sm text-black mt-2">
            Overall Life Fulfillment Score
          </p>
        </motion.div>

        {/* Life Areas Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedMonth}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {currentSnapshot.map((area, index) => (
              <motion.div
                key={area.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-xl border-2 overflow-hidden"
                style={{ borderColor: area.color + '40' }}
              >
                {/* Area Header */}
                <div className="p-4 border-b" style={{ backgroundColor: area.color + '10' }}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-black">
                      {area.name}
                    </h3>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${levelColors[area.level]}`}>
                      {area.level}
                    </span>
                  </div>
                  <p className="text-sm text-black italic">{area.phoenixName}</p>
                </div>

                {/* Progress Bar */}
                <div className="px-4 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-black">Commitment</span>
                    <span className="text-sm font-bold" style={{ color: area.color }}>
                      {area.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <motion.div
                      className="h-2 rounded-full"
                      style={{ backgroundColor: area.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${area.progress}%` }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    />
                  </div>
                </div>

                {/* Relationships */}
                <div className="px-4 pb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4 text-black" />
                    <span className="text-sm font-medium text-black">
                      Connections ({area.relationships.length})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {area.relationships.map((rel, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 + idx * 0.05 }}
                        className="relative group"
                      >
                        <div
                          className={`flex items-center justify-center rounded-full text-black font-medium border-2 ${statusColors[rel.status]} hover:scale-110 transition-transform cursor-pointer`}
                          style={{
                            width: `${rel.size}px`,
                            height: `${rel.size}px`,
                          }}
                        >
                          <span className="text-xs text-center px-1">
                            {rel.name.slice(0, 3)}
                          </span>
                        </div>
                        {/* Tooltip */}
                        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black/80 text-black text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                          <div className="font-semibold">{rel.name}</div>
                          <div>{rel.role}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Links */}
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/fulfillment">
            <PhoenixButton variant="secondary">
              <Users className="w-4 h-4 mr-2" />
              Interactive Map
            </PhoenixButton>
          </Link>
          <Link href="/community">
            <PhoenixButton variant="secondary">
              <Target className="w-4 h-4 mr-2" />
              Community List
            </PhoenixButton>
          </Link>
        </div>
      </main>
    </div>
  )
}