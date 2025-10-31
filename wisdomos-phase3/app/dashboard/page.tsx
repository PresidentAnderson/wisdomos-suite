/**
 * Dashboard Page
 *
 * Main dashboard view showing fulfillment overview
 */

'use client'

import { useState } from 'react'
import { useDashboard } from '../hooks/useDashboard'
import { useLifeAreas } from '../hooks/useLifeAreas'
import { FulfillmentDisplay } from '../components/FulfillmentDisplay'
import { LifeAreaCard } from '../components/LifeAreaCard'
import { EventForm } from '../components/EventForm'

export default function DashboardPage() {
  const { data, loading, error, refresh } = useDashboard()
  const { lifeAreas } = useLifeAreas()
  const [showEventForm, setShowEventForm] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading dashboard</p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                WisdomOS Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Your personal transformation journey
              </p>
            </div>

            <button
              onClick={() => setShowEventForm(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              + Add Event
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overall Score */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-center justify-center">
            <FulfillmentDisplay
              score={data.overallScore}
              size="large"
              showLabel
            />
          </div>
        </div>

        {/* Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Life Area Distribution</h2>
          <div className="grid grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600">
                {data.distribution.flourishing}
              </div>
              <div className="text-sm text-gray-600">Flourishing</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {data.distribution.thriving}
              </div>
              <div className="text-sm text-gray-600">Thriving</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">
                {data.distribution.balanced}
              </div>
              <div className="text-sm text-gray-600">Balanced</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {data.distribution.struggling}
              </div>
              <div className="text-sm text-gray-600">Struggling</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                {data.distribution.crisis}
              </div>
              <div className="text-sm text-gray-600">Crisis</div>
            </div>
          </div>
        </div>

        {/* Top Areas & Needs Attention */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Areas */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold mb-4">Top Performing Areas</h2>
            {data.topAreas.length > 0 ? (
              <div className="space-y-3">
                {data.topAreas.map((area) => (
                  <div
                    key={area.slug}
                    className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                  >
                    <span className="font-medium">{area.name}</span>
                    <span className="text-green-600 font-bold">
                      {Math.round(area.score)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No top areas yet</p>
            )}
          </div>

          {/* Needs Attention */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold mb-4">Needs Attention</h2>
            {data.needsAttention.length > 0 ? (
              <div className="space-y-3">
                {data.needsAttention.map((area) => (
                  <div
                    key={area.slug}
                    className="flex items-center justify-between p-3 bg-orange-50 rounded-lg"
                  >
                    <span className="font-medium">{area.name}</span>
                    <span className="text-orange-600 font-bold">
                      {Math.round(area.score)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">All areas are healthy</p>
            )}
          </div>
        </div>

        {/* All Life Areas */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">All Life Areas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lifeAreas.map((area) => (
              <LifeAreaCard
                key={area.id}
                slug={area.slug}
                name={area.name}
                description={area.description}
                score={area.currentScore}
                status={area.status}
                cluster={area.cluster}
              />
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          {data.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {data.recentActivity.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{event.title}</span>
                      <span className="px-2 py-1 text-xs bg-gray-100 rounded">
                        {event.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {event.lifeArea.name}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(event.occurredAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No recent activity</p>
          )}
        </div>
      </main>

      {/* Event Form Modal */}
      {showEventForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <EventForm
            onSuccess={() => {
              setShowEventForm(false)
              refresh()
            }}
            onCancel={() => setShowEventForm(false)}
          />
        </div>
      )}
    </div>
  )
}
