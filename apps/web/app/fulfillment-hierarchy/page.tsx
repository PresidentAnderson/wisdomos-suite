'use client'

/**
 * Hierarchical Fulfillment Display Page
 *
 * Displays life areas in a hierarchical tree structure with:
 * - Life Areas → Subdomains → Projects → Dimensions/Repos
 * - GitHub integration for AXAI Innovations
 * - Five-dimension framework tables
 * - Acceptable/Non-tolerated boundaries
 */

import React from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, LayoutGrid, List } from 'lucide-react'
import Link from 'next/link'
import HierarchicalFulfillmentDisplay from '@/components/fulfillment/HierarchicalFulfillmentDisplay'

export default function FulfillmentHierarchyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="border-b border-amber-200/50 dark:border-amber-800/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Back navigation */}
            <div className="flex items-center gap-4">
              <Link href="/fulfillment-v5">
                <button className="flex items-center gap-2 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                  <span className="font-medium">Back to Dashboard</span>
                </button>
              </Link>
              <div className="h-6 w-px bg-slate-300 dark:bg-slate-600"></div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg">
                  <List className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                    Hierarchical View
                  </h1>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Structured life areas with five dimensions
                  </p>
                </div>
              </div>
            </div>

            {/* Right side - View toggle */}
            <div className="flex items-center gap-2">
              <Link href="/fulfillment-hierarchy">
                <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-medium shadow-lg">
                  <List className="w-4 h-4" />
                  <span>Hierarchy</span>
                </button>
              </Link>
              <Link href="/fulfillment-v5">
                <button className="flex items-center gap-2 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-medium transition-colors">
                  <LayoutGrid className="w-4 h-4" />
                  <span>Dashboard</span>
                </button>
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
          <HierarchicalFulfillmentDisplay />
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-slate-600 dark:text-slate-400">
            <p>Hierarchical view provides a structured breakdown of your life areas</p>
            <p className="mt-1">Five-dimension framework helps measure holistic progress</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
