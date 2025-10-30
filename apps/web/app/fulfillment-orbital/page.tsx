'use client'

/**
 * Orbital Fulfillment Display Page
 *
 * Interactive physics-based visualization of life areas with:
 * - Gravity orbital motion
 * - Draggable life area orbs
 * - Collision detection and magnetic grouping
 * - Connection visualization
 * - AI reflections
 */

import React from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, LayoutGrid, List, Orbit } from 'lucide-react'
import Link from 'next/link'
import OrbitalFulfillmentDisplay from '@/components/fulfillment/OrbitalFulfillmentDisplay'

export default function FulfillmentOrbitalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Back navigation */}
            <div className="flex items-center gap-4">
              <Link href="/fulfillment-v5">
                <button className="flex items-center gap-2 px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                  <span className="font-medium">Back to Dashboard</span>
                </button>
              </Link>
              <div className="h-6 w-px bg-white/20"></div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                  <Orbit className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Orbital View</h1>
                  <p className="text-xs text-white/60">Interactive physics visualization</p>
                </div>
              </div>
            </div>

            {/* Right side - View toggle */}
            <div className="flex items-center gap-2">
              <Link href="/fulfillment-v5">
                <button className="flex items-center gap-2 px-4 py-2 text-white/80 hover:bg-white/10 rounded-xl font-medium transition-colors">
                  <LayoutGrid className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </button>
              </Link>
              <Link href="/fulfillment-hierarchy">
                <button className="flex items-center gap-2 px-4 py-2 text-white/80 hover:bg-white/10 rounded-xl font-medium transition-colors">
                  <List className="w-4 h-4" />
                  <span className="hidden sm:inline">Hierarchy</span>
                </button>
              </Link>
              <Link href="/fulfillment-orbital">
                <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-medium shadow-lg">
                  <Orbit className="w-4 h-4" />
                  <span className="hidden sm:inline">Orbital</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <OrbitalFulfillmentDisplay />
        </motion.div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
        >
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Orbit className="w-5 h-5 text-purple-400" />
            About Orbital View
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-white/80">
            <div>
              <h3 className="font-semibold text-white mb-2">🌌 Gravity Physics</h3>
              <p className="text-sm">
                Life areas orbit naturally around your center. The orbital motion represents the
                dynamic balance of your life's dimensions.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">🎯 Interactive Control</h3>
              <p className="text-sm">
                Drag orbs to reposition, adjust orbit speed and radius, pause motion to examine
                details, or reset to restore balance.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">🔗 Connection Lines</h3>
              <p className="text-sm">
                Pulsing connections show relationships and support networks. Stronger connections
                glow brighter, indicating energy flow.
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-slate-900/50 backdrop-blur-xl mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-white/60">
            <p>Orbital view uses physics simulation to visualize life balance</p>
            <p className="mt-1">Drag, click, and explore your fulfillment cosmos</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
