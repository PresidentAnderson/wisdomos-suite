'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface UserSettings {
  id: string
  userId: string
  // Feature toggles
  showJournalEntries: boolean
  enableGoals: boolean
  enableContributions: boolean
  enableAutobiography: boolean
  enableAssessments: boolean
  // Privacy settings
  defaultEntryVisibility: 'private' | 'cohort' | 'coach' | 'public' | 'anonymous'
  allowDataExport: boolean
  allowAnonymousData: boolean
  // Display preferences
  theme: string
  timeZone: string
  createdAt: string
  updatedAt: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    fetchSettings()
  }, [])

  const checkAuth = () => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/')
    }
  }

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = async (updates: Partial<UserSettings>) => {
    if (!settings) return

    setSaving(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      })
      
      if (response.ok) {
        const updatedSettings = await response.json()
        setSettings(updatedSettings)
      }
    } catch (error) {
      console.error('Error updating settings:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = (field: keyof UserSettings, value: boolean) => {
    if (settings) {
      const newSettings = { ...settings, [field]: value }
      setSettings(newSettings)
      updateSettings({ [field]: value })
    }
  }

  const handleSelect = (field: keyof UserSettings, value: string) => {
    if (settings) {
      const newSettings = { ...settings, [field]: value }
      setSettings(newSettings)
      updateSettings({ [field]: value })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading settings...</div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Error loading settings</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-white">
              WisdomOS
            </Link>
            <nav className="flex items-center space-x-6">
              <Link href="/dashboard" className="text-white/70 hover:text-white">Dashboard</Link>
              <Link href="/goals" className="text-white/70 hover:text-white">Goals</Link>
              <Link href="/contributions" className="text-white/70 hover:text-white">Contributions</Link>
              <Link href="/autobiography" className="text-white/70 hover:text-white">Autobiography</Link>
              <Link href="/assessments" className="text-white/70 hover:text-white">Assessments</Link>
              <Link href="/settings" className="text-cyan-400">Settings</Link>
            </nav>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
            <p className="text-gray-300">Customize your WisdomOS experience</p>
          </div>

          {/* Feature Toggles */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-6">
            <h2 className="text-2xl font-semibold text-white mb-6">Feature Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">Goals Management</h3>
                  <p className="text-gray-400 text-sm">Track and manage your personal goals</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enableGoals}
                    onChange={(e) => handleToggle('enableGoals', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">Contributions</h3>
                  <p className="text-gray-400 text-sm">Record strengths, acknowledgments, and insights</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enableContributions}
                    onChange={(e) => handleToggle('enableContributions', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">Autobiography</h3>
                  <p className="text-gray-400 text-sm">Document your life story and key moments</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enableAutobiography}
                    onChange={(e) => handleToggle('enableAutobiography', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">Relationship Assessments</h3>
                  <p className="text-gray-400 text-sm">Evaluate and track relationship health</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enableAssessments}
                    onChange={(e) => handleToggle('enableAssessments', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">Journal Entries</h3>
                  <p className="text-gray-400 text-sm">Show/hide journal entries in navigation and dashboard</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.showJournalEntries}
                    onChange={(e) => handleToggle('showJournalEntries', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-6">
            <h2 className="text-2xl font-semibold text-white mb-6">Privacy & Security</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-white font-medium mb-2">Default Entry Visibility</label>
                <select
                  value={settings.defaultEntryVisibility}
                  onChange={(e) => handleSelect('defaultEntryVisibility', e.target.value)}
                  className="w-full p-3 bg-black/30 border border-white/20 rounded-lg text-white"
                >
                  <option value="private">Private (Only you)</option>
                  <option value="cohort">Cohort (Your learning group)</option>
                  <option value="coach">Coach (Your mentor/coach)</option>
                  <option value="public">Public (Everyone)</option>
                  <option value="anonymous">Anonymous (Public but unnamed)</option>
                </select>
                <p className="text-gray-400 text-sm mt-1">
                  Default visibility for new entries and posts
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">Allow Data Export</h3>
                  <p className="text-gray-400 text-sm">Enable downloading your data in standard formats</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.allowDataExport}
                    onChange={(e) => handleToggle('allowDataExport', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">Anonymous Analytics</h3>
                  <p className="text-gray-400 text-sm">Help improve the platform with anonymous usage data</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.allowAnonymousData}
                    onChange={(e) => handleToggle('allowAnonymousData', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Display Preferences */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-6">
            <h2 className="text-2xl font-semibold text-white mb-6">Display Preferences</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-white font-medium mb-2">Theme</label>
                <select
                  value={settings.theme}
                  onChange={(e) => handleSelect('theme', e.target.value)}
                  className="w-full p-3 bg-black/30 border border-white/20 rounded-lg text-white"
                >
                  <option value="dark">Dark (Current)</option>
                  <option value="light">Light</option>
                  <option value="auto">Auto (System preference)</option>
                </select>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Time Zone</label>
                <select
                  value={settings.timeZone}
                  onChange={(e) => handleSelect('timeZone', e.target.value)}
                  className="w-full p-3 bg-black/30 border border-white/20 rounded-lg text-white"
                >
                  <option value="UTC">UTC (Coordinated Universal Time)</option>
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="Europe/London">London (GMT)</option>
                  <option value="Europe/Paris">Central European Time</option>
                  <option value="Asia/Tokyo">Japan Standard Time</option>
                  <option value="Asia/Shanghai">China Standard Time</option>
                  <option value="Australia/Sydney">Australian Eastern Time</option>
                </select>
              </div>
            </div>
          </div>

          {/* Save Status */}
          {saving && (
            <div className="text-center py-4">
              <div className="text-cyan-400">Saving changes...</div>
            </div>
          )}

          {/* Account Actions */}
          <div className="bg-red-500/10 backdrop-blur-lg rounded-xl p-6 border border-red-500/30">
            <h2 className="text-2xl font-semibold text-red-400 mb-4">Danger Zone</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">Export All Data</h3>
                  <p className="text-gray-400 text-sm">Download a complete backup of your WisdomOS data</p>
                </div>
                <button 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => alert('Data export functionality coming soon!')}
                >
                  Export Data
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-red-400 font-medium">Delete Account</h3>
                  <p className="text-gray-400 text-sm">Permanently delete your account and all associated data</p>
                </div>
                <button 
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  onClick={() => alert('Account deletion functionality coming soon!')}
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}