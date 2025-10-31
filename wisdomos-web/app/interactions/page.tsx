'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Interaction {
  id: string
  contactName: string
  channel: string
  direction: string
  subject?: string
  bodyText?: string
  occurredAt: string
  sentiment?: string
}

export default function InteractionsPage() {
  const router = useRouter()
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    // Simulate loading interactions
    setTimeout(() => {
      setInteractions([
        {
          id: '1',
          contactName: 'Djamel Partner',
          channel: 'meeting',
          direction: 'internal',
          subject: 'Weekly check-in',
          bodyText: 'Discussed upcoming goals and personal growth areas',
          occurredAt: new Date().toISOString(),
          sentiment: 'positive'
        },
        {
          id: '2',
          contactName: 'Sarah Therapist',
          channel: 'call',
          direction: 'outbound',
          subject: 'Therapy session',
          bodyText: 'Worked through recent challenges and breakthroughs',
          occurredAt: new Date(Date.now() - 86400000).toISOString(),
          sentiment: 'positive'
        }
      ])
      setLoading(false)
    }, 500)
  }, [])

  const getChannelIcon = (channel: string) => {
    const icons: { [key: string]: string } = {
      call: '📞',
      sms: '💬',
      email: '📧',
      meeting: '👥',
      note: '📝',
      whatsapp: '💚',
      telegram: '✈️',
      signal: '🔒',
      messenger: '💙',
      other: '📋'
    }
    return icons[channel] || '📋'
  }

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'very_positive':
        return 'text-green-600 bg-green-50'
      case 'positive':
        return 'text-green-500 bg-green-50'
      case 'neutral':
        return 'text-gray-500 bg-gray-50'
      case 'negative':
        return 'text-orange-500 bg-orange-50'
      case 'very_negative':
        return 'text-red-500 bg-red-50'
      default:
        return 'text-gray-400 bg-gray-50'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-lg">Loading interactions...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="mb-4 text-indigo-600 hover:text-indigo-800 flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Interactions</h1>
              <p className="text-gray-600">Track all your communications and touchpoints</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <span>➕</span> Log Interaction
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-gray-800">{interactions.length}</div>
            <div className="text-gray-600">Total Interactions</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-green-600">
              {interactions.filter(i => i.sentiment === 'positive').length}
            </div>
            <div className="text-gray-600">Positive</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-blue-600">
              {interactions.filter(i => i.channel === 'meeting').length}
            </div>
            <div className="text-gray-600">Meetings</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-purple-600">
              {new Set(interactions.map(i => i.contactName)).size}
            </div>
            <div className="text-gray-600">Contacts</div>
          </div>
        </div>

        {/* Interactions List */}
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Recent Interactions</h2>
          </div>
          <div className="divide-y">
            {interactions.map((interaction) => (
              <div key={interaction.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{getChannelIcon(interaction.channel)}</span>
                      <div>
                        <h3 className="font-semibold text-gray-800">{interaction.contactName}</h3>
                        <p className="text-sm text-gray-500">
                          {new Date(interaction.occurredAt).toLocaleDateString()} • {interaction.direction}
                        </p>
                      </div>
                    </div>
                    {interaction.subject && (
                      <div className="font-medium text-gray-700 mb-1">{interaction.subject}</div>
                    )}
                    {interaction.bodyText && (
                      <p className="text-gray-600">{interaction.bodyText}</p>
                    )}
                  </div>
                  {interaction.sentiment && (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSentimentColor(interaction.sentiment)}`}>
                      {interaction.sentiment.replace('_', ' ')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add Interaction Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Log New Interaction</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                  <input
                    type="text"
                    placeholder="Contact name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Channel</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="call">📞 Call</option>
                    <option value="sms">💬 SMS</option>
                    <option value="email">📧 Email</option>
                    <option value="meeting">👥 Meeting</option>
                    <option value="note">📝 Note</option>
                    <option value="whatsapp">💚 WhatsApp</option>
                    <option value="other">📋 Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    placeholder="What was discussed?"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    rows={4}
                    placeholder="Details about the interaction..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sentiment</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">Select sentiment</option>
                    <option value="very_positive">Very Positive</option>
                    <option value="positive">Positive</option>
                    <option value="neutral">Neutral</option>
                    <option value="negative">Negative</option>
                    <option value="very_negative">Very Negative</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Save interaction
                    setShowAddModal(false)
                  }}
                  className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700"
                >
                  Save Interaction
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}