'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Settings, 
  User, 
  Download, 
  Upload, 
  Save, 
  ChevronLeft,
  Contact2,
  FileText,
  Eye,
  EyeOff,
  Bell,
  Palette,
  Shield,
  Database,
  Trash2,
  RefreshCw,
  Plug
} from 'lucide-react'
import Link from 'next/link'
import PhoenixButton from '@/components/ui/PhoenixButton'
import { HubSpotIntegration } from '@/components/hubspot/HubSpotIntegration'

interface UserSettings {
  name: string
  email: string
  theme: 'light' | 'dark' | 'auto'
  notifications: {
    journal: boolean
    fulfillment: boolean
    contributions: boolean
  }
  privacy: {
    shareFulfillment: boolean
    shareContributions: boolean
    shareJournal: boolean
  }
}

interface Contact {
  id: string
  name: string
  email: string
  phone?: string
  createdAt: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>({
    name: '',
    email: '',
    theme: 'light',
    notifications: {
      journal: true,
      fulfillment: true,
      contributions: true
    },
    privacy: {
      shareFulfillment: false,
      shareContributions: false,
      shareJournal: false
    }
  })

  const [contacts, setContacts] = useState<Contact[]>([])
  const [activeTab, setActiveTab] = useState('profile')
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [newContact, setNewContact] = useState({ name: '', email: '', phone: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Load settings and contacts from localStorage
  useEffect(() => {
    const storedSettings = localStorage.getItem('wisdomos_settings')
    const storedContacts = localStorage.getItem('wisdomos_contacts')
    
    if (storedSettings) {
      setSettings(JSON.parse(storedSettings))
    } else {
      // Set default user info if available from auth context
      setSettings(prev => ({
        ...prev,
        name: 'WisdomOS User',
        email: 'user@wisdomos.com'
      }))
    }

    if (storedContacts) {
      setContacts(JSON.parse(storedContacts))
    }
  }, [])

  const saveSettings = () => {
    localStorage.setItem('wisdomos_settings', JSON.stringify(settings))
    alert('Settings saved successfully!')
  }

  const saveContacts = (newContacts: Contact[]) => {
    setContacts(newContacts)
    localStorage.setItem('wisdomos_contacts', JSON.stringify(newContacts))
  }

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newContact.name || !newContact.email) return

    const contact: Contact = {
      id: Date.now().toString(),
      name: newContact.name,
      email: newContact.email,
      phone: newContact.phone || undefined,
      createdAt: new Date().toISOString()
    }

    saveContacts([...contacts, contact])
    setNewContact({ name: '', email: '', phone: '' })
    alert('Contact added successfully!')
  }

  const handleCsvImport = (e: React.FormEvent) => {
    e.preventDefault()
    if (!csvFile) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const csv = event.target?.result as string
      const lines = csv.split('\n')
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
      
      const nameIndex = headers.findIndex(h => h.includes('name'))
      const emailIndex = headers.findIndex(h => h.includes('email'))
      const phoneIndex = headers.findIndex(h => h.includes('phone'))

      const newContacts: Contact[] = []
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim())
        if (values.length >= 2 && values[nameIndex] && values[emailIndex]) {
          newContacts.push({
            id: Date.now().toString() + i,
            name: values[nameIndex],
            email: values[emailIndex],
            phone: phoneIndex >= 0 ? values[phoneIndex] : undefined,
            createdAt: new Date().toISOString()
          })
        }
      }

      if (newContacts.length > 0) {
        saveContacts([...contacts, ...newContacts])
        setCsvFile(null)
        alert(`Imported ${newContacts.length} contacts successfully!`)
      }
    }
    reader.readAsText(csvFile)
  }

  const exportContacts = () => {
    const csvContent = [
      'Name,Email,Phone,Created At',
      ...contacts.map(contact => 
        `"${contact.name}","${contact.email}","${contact.phone || ''}","${contact.createdAt}"`
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'wisdomos-contacts.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const exportAllData = () => {
    const allData = {
      settings,
      contacts,
      journal: JSON.parse(localStorage.getItem('wisdomos_journal') || '[]'),
      fulfillment: JSON.parse(localStorage.getItem('wisdomos_connections') || '[]'),
      contributions: JSON.parse(localStorage.getItem('wisdomos_contributions') || '[]'),
      exportedAt: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'wisdomos-data-export.json'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      localStorage.removeItem('wisdomos_settings')
      localStorage.removeItem('wisdomos_contacts')
      localStorage.removeItem('wisdomos_journal')
      localStorage.removeItem('wisdomos_connections')
      localStorage.removeItem('wisdomos_contributions')
      localStorage.removeItem('wisdomos_contribution_statement')
      
      setContacts([])
      setSettings({
        name: 'WisdomOS User',
        email: 'user@wisdomos.com',
        theme: 'light',
        notifications: {
          journal: true,
          fulfillment: true,
          contributions: true
        },
        privacy: {
          shareFulfillment: false,
          shareContributions: false,
          shareJournal: false
        }
      })
      
      alert('All data cleared successfully!')
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'contacts', label: 'Contacts', icon: Contact2 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'data', label: 'Data Export', icon: Database },
    { id: 'integrations', label: 'Integrations', icon: Plug },
    { id: 'legal', label: 'Legal Notices', icon: FileText }
  ]

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
                  Back to Dashboard
                </PhoenixButton>
              </Link>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-phoenix-red to-phoenix-orange bg-clip-text text-transparent">
                Settings
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-black" />
              <span className="text-sm text-black">Manage Your WisdomOS</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-phoenix-gold/20">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                        activeTab === tab.id
                          ? 'bg-phoenix-gold/10 text-black border border-phoenix-gold/20'
                          : 'text-black hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {tab.label}
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-xl p-8 border border-phoenix-gold/20"
            >
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-2xl font-semibold text-black mb-6">Profile Settings</h2>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-black mb-2">
                          Name
                        </label>
                        <input
                          type="text"
                          value={settings.name}
                          onChange={(e) => setSettings({...settings, name: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-phoenix-orange focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={settings.email}
                          onChange={(e) => setSettings({...settings, email: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-phoenix-orange focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Theme
                      </label>
                      <select
                        value={settings.theme}
                        onChange={(e) => setSettings({...settings, theme: e.target.value as 'light' | 'dark' | 'auto'})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-phoenix-orange focus:border-transparent"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="auto">Auto</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-black mb-2">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-phoenix-orange focus:border-transparent"
                            placeholder="Leave blank to keep current"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black mb-2">
                          Confirm Password
                        </label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-phoenix-orange focus:border-transparent"
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>

                    <PhoenixButton onClick={saveSettings} className="w-full md:w-auto">
                      <Save className="w-4 h-4 mr-2" />
                      Save Profile
                    </PhoenixButton>
                  </div>
                </div>
              )}

              {activeTab === 'contacts' && (
                <div>
                  <h2 className="text-2xl font-semibold text-black mb-6">Contact Management</h2>
                  
                  {/* Quick Actions */}
                  <div className="flex flex-wrap gap-4 mb-8">
                    <Link href="/contacts">
                      <PhoenixButton variant="secondary">
                        <Contact2 className="w-4 h-4 mr-2" />
                        View All Contacts
                      </PhoenixButton>
                    </Link>
                    <PhoenixButton onClick={exportContacts} variant="secondary">
                      <Download className="w-4 h-4 mr-2" />
                      Export CSV
                    </PhoenixButton>
                  </div>

                  {/* Add Individual Contact */}
                  <div className="mb-8 p-6 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-black mb-4">Add New Contact</h3>
                    <form onSubmit={handleAddContact} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input
                        type="text"
                        placeholder="Name"
                        value={newContact.name}
                        onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-black"
                        required
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        value={newContact.email}
                        onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-black"
                        required
                      />
                      <input
                        type="tel"
                        placeholder="Phone (optional)"
                        value={newContact.phone}
                        onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-black"
                      />
                      <PhoenixButton type="submit" className="md:col-span-3">
                        Add Contact
                      </PhoenixButton>
                    </form>
                  </div>

                  {/* CSV Import */}
                  <div className="mb-8 p-6 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-black mb-4">Bulk Import (CSV)</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Upload a CSV file with columns: Name, Email, Phone. First row should contain headers.
                    </p>
                    <form onSubmit={handleCsvImport} className="space-y-4">
                      <input
                        type="file"
                        accept=".csv"
                        onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black"
                      />
                      <PhoenixButton type="submit" disabled={!csvFile}>
                        <Upload className="w-4 h-4 mr-2" />
                        Import Contacts
                      </PhoenixButton>
                    </form>
                  </div>

                  {/* Current Contacts Summary */}
                  <div className="p-6 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-black mb-4">Current Contacts</h3>
                    <p className="text-black">Total: {contacts.length} contacts</p>
                    {contacts.length > 0 && (
                      <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                        {contacts.slice(0, 10).map((contact) => (
                          <div key={contact.id} className="flex justify-between items-center p-2 bg-white rounded">
                            <div>
                              <span className="font-medium">{contact.name}</span>
                              <span className="text-gray-500 ml-2">{contact.email}</span>
                            </div>
                            <button
                              onClick={() => {
                                if (confirm('Delete this contact?')) {
                                  saveContacts(contacts.filter(c => c.id !== contact.id))
                                }
                              }}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        {contacts.length > 10 && (
                          <p className="text-gray-500 text-center">... and {contacts.length - 10} more</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-2xl font-semibold text-black mb-6">Notification Preferences</h2>
                  <div className="space-y-6">
                    {Object.entries(settings.notifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-black capitalize">{key} Reminders</h3>
                          <p className="text-sm text-gray-600">
                            Get notifications about {key} activities
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => setSettings({
                              ...settings,
                              notifications: {
                                ...settings.notifications,
                                [key]: e.target.checked
                              }
                            })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-phoenix-orange/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-phoenix-orange"></div>
                        </label>
                      </div>
                    ))}
                    <PhoenixButton onClick={saveSettings}>
                      <Save className="w-4 h-4 mr-2" />
                      Save Preferences
                    </PhoenixButton>
                  </div>
                </div>
              )}

              {activeTab === 'privacy' && (
                <div>
                  <h2 className="text-2xl font-semibold text-black mb-6">Privacy Settings</h2>
                  <div className="space-y-6">
                    {Object.entries(settings.privacy).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-black capitalize">
                            Share {key.replace('share', '').replace(/([A-Z])/g, ' $1').trim()}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Allow sharing of your {key.replace('share', '').toLowerCase()} data
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => setSettings({
                              ...settings,
                              privacy: {
                                ...settings.privacy,
                                [key]: e.target.checked
                              }
                            })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-phoenix-orange/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-phoenix-orange"></div>
                        </label>
                      </div>
                    ))}
                    <PhoenixButton onClick={saveSettings}>
                      <Save className="w-4 h-4 mr-2" />
                      Save Privacy Settings
                    </PhoenixButton>
                  </div>
                </div>
              )}

              {activeTab === 'data' && (
                <div>
                  <h2 className="text-2xl font-semibold text-black mb-6">Data Management</h2>
                  <div className="space-y-6">
                    {/* Export Data */}
                    <div className="p-6 bg-green-50 rounded-lg">
                      <h3 className="text-lg font-semibold text-black mb-4">Export Your Data</h3>
                      <p className="text-gray-600 mb-4">
                        Download all your WisdomOS data including journal entries, contacts, fulfillment data, and contributions.
                      </p>
                      <PhoenixButton onClick={exportAllData} variant="secondary">
                        <Download className="w-4 h-4 mr-2" />
                        Export All Data (JSON)
                      </PhoenixButton>
                    </div>

                    {/* Data Statistics */}
                    <div className="p-6 bg-blue-50 rounded-lg">
                      <h3 className="text-lg font-semibold text-black mb-4">Data Overview</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-black">{contacts.length}</p>
                          <p className="text-sm text-gray-600">Contacts</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-black">
                            {JSON.parse(localStorage.getItem('wisdomos_journal') || '[]').length}
                          </p>
                          <p className="text-sm text-gray-600">Journal Entries</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-black">
                            {JSON.parse(localStorage.getItem('wisdomos_connections') || '[]').length}
                          </p>
                          <p className="text-sm text-gray-600">Fulfillment Connections</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-black">
                            {JSON.parse(localStorage.getItem('wisdomos_contributions') || '[]').length}
                          </p>
                          <p className="text-sm text-gray-600">Contributions</p>
                        </div>
                      </div>
                    </div>

                    {/* Clear Data */}
                    <div className="p-6 bg-red-50 rounded-lg">
                      <h3 className="text-lg font-semibold text-black mb-4">Clear All Data</h3>
                      <p className="text-gray-600 mb-4">
                        This will permanently delete all your WisdomOS data. This action cannot be undone.
                      </p>
                      <PhoenixButton onClick={clearAllData} className="bg-red-600 hover:bg-red-700">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear All Data
                      </PhoenixButton>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'integrations' && (
                <div>
                  <h2 className="text-2xl font-semibold text-black mb-6">External Integrations</h2>
                  <HubSpotIntegration />
                </div>
              )}

              {activeTab === 'legal' && (
                <div>
                  <h2 className="text-2xl font-semibold text-black mb-6">Legal Notices</h2>
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="font-semibold text-black mb-3">Independence Statement</h3>
                      <p className="text-gray-700 mb-2">
                        This is an independent project.
                      </p>
                      <p className="text-gray-600 text-sm">
                        WisdomOS has no connection to Landmark Worldwide LLC or its programs. 
                        All trademarks belong to their respective owners.
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="font-semibold text-black mb-3">Copyright</h3>
                      <p className="text-gray-600">
                        © 2025 President Anderson. All rights reserved.
                      </p>
                    </div>

                    <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
                      <h3 className="font-semibold text-black mb-3">Medical Disclaimer</h3>
                      <p className="text-amber-800 text-sm">
                        This application is for personal development purposes only. 
                        It is not a substitute for professional medical, psychological, or therapeutic advice.
                      </p>
                    </div>

                    <Link href="/settings/legal">
                      <PhoenixButton variant="secondary" className="w-full">
                        View Full Legal Information
                      </PhoenixButton>
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}