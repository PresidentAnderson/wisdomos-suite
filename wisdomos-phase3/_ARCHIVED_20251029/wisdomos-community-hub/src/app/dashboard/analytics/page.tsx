'use client'

import { useEffect, useState } from 'react'
// Animations disabled
import {
  BarChart3,
  FileText,
  User,
  Clock,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download
} from 'lucide-react'

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Track your progress and insights</p>
        </div>

        {/* Analytics Coming Soon */}
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          <BarChart3 className="h-16 w-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Analytics Dashboard</h2>
          <p className="text-gray-600 mb-6">
            Comprehensive analytics and insights coming soon. We're building advanced 
            charts and visualizations to help track your progress.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg">
              <FileText className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="font-semibold text-gray-900">Document Analytics</p>
                <p className="text-sm text-gray-600">Track document creation</p>
              </div>
            </div>
            <div className="flex items-center justify-center p-4 bg-green-50 rounded-lg">
              <User className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="font-semibold text-gray-900">User Engagement</p>
                <p className="text-sm text-gray-600">Monitor user activity</p>
              </div>
            </div>
            <div className="flex items-center justify-center p-4 bg-purple-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-purple-500 mr-3" />
              <div>
                <p className="font-semibold text-gray-900">Growth Metrics</p>
                <p className="text-sm text-gray-600">Track growth trends</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}