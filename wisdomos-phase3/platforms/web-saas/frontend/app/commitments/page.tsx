'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Target, ChevronLeft, TrendingUp, Award, Calendar, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import PhoenixButton from '@/components/ui/PhoenixButton'
import { CommitmentDisplay } from '@/components/commitments/CommitmentDisplay'
import { LifeAreasProvider } from '@/contexts/LifeAreasContext'

export default function CommitmentsPage() {
  return (
    <LifeAreasProvider>
      <div className="min-h-screen bg-gradient-to-br from-phoenix-gold/10 via-white to-phoenix-smoke">
        {/* Header */}
        <header className="border-b border-phoenix-gold/20 bg-white/80 backdrop-blur-lg sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <Link href="/">
                  <PhoenixButton variant="ghost" size="sm">
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back to Dashboard
                  </PhoenixButton>
                </Link>
                <div className="flex items-center gap-2">
                  <Target className="w-6 h-6 text-phoenix-gold" />
                  <h1 className="text-xl font-semibold text-black">Commitments</h1>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/fulfillment">
                  <PhoenixButton variant="ghost" size="sm">
                    View Life Areas
                  </PhoenixButton>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Page Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Commitments</h2>
              <p className="text-gray-600">
                Make promises to yourself and track your progress across all life areas.
                Each commitment is a step toward your Phoenix transformation.
              </p>
            </div>

            {/* Quick Tips */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Target className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Set Clear Goals</p>
                    <p className="text-xs text-gray-500">Define specific, measurable outcomes</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Set Deadlines</p>
                    <p className="text-xs text-gray-500">Create urgency with target dates</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Track Progress</p>
                    <p className="text-xs text-gray-500">Update milestones regularly</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Award className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Celebrate Wins</p>
                    <p className="text-xs text-gray-500">Acknowledge your achievements</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Commitment Display Component */}
            <CommitmentDisplay />

            {/* Phoenix Wisdom */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-12 p-6 bg-gradient-to-r from-phoenix-gold/10 to-phoenix-smoke/10 rounded-xl border border-phoenix-gold/20"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-phoenix-gold/20 rounded-lg">
                  <Target className="w-6 h-6 text-phoenix-gold" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Phoenix Wisdom</h3>
                  <p className="text-gray-600 italic">
                    "The Phoenix does not rise by chance, but by commitment. Each promise you make to yourself 
                    is a feather in your wings of transformation. Start small, stay consistent, and watch as 
                    your commitments become the fuel for your rebirth."
                  </p>
                  <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                    <span>💡 Tip: Break large commitments into smaller milestones</span>
                    <span>🔥 Remember: Progress over perfection</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </LifeAreasProvider>
  )
}