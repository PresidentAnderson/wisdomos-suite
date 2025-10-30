'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  UserPlus,
  Phone,
  Mail,
  Calendar,
  Heart,
  Clock,
  ChevronLeft,
  Search,
  Filter
} from 'lucide-react'
import Link from 'next/link'
import PhoenixButton from '@/components/ui/PhoenixButton'

interface Person {
  id: string
  name: string
  lifeArea: string
  frequency: number
  lastContact?: Date
  email?: string
  phone?: string
  notes?: string
  urgency: 'low' | 'medium' | 'high'
}

// Get connections from localStorage
const getStoredConnections = (): Person[] => {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem('wisdomos_connections')
  if (!stored) return []
  
  try {
    const connections = JSON.parse(stored)
    return connections.map((c: any) => ({
      ...c,
      lastContact: c.lastContact ? new Date(c.lastContact) : undefined
    }))
  } catch {
    return []
  }
}

// Save connections to localStorage
const saveConnections = (connections: Person[]) => {
  if (typeof window === 'undefined') return
  localStorage.setItem('wisdomos_connections', JSON.stringify(connections))
}

export default function CommunityPage() {
  const [connections, setConnections] = useState<Person[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterUrgency, setFilterUrgency] = useState<'all' | 'low' | 'medium' | 'high'>('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newPerson, setNewPerson] = useState({
    name: '',
    lifeArea: '',
    frequency: 5,
    email: '',
    phone: '',
    notes: ''
  })

  // Load connections on mount
  useEffect(() => {
    setConnections(getStoredConnections())
    
    // Listen for storage events from other tabs/pages
    const handleStorageChange = () => {
      setConnections(getStoredConnections())
    }
    
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('wisdomos:connection-added', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('wisdomos:connection-added', handleStorageChange)
    }
  }, [])

  const addPerson = () => {
    if (!newPerson.name) return

    const person: Person = {
      id: Date.now().toString(),
      name: newPerson.name,
      lifeArea: newPerson.lifeArea || 'General',
      frequency: newPerson.frequency,
      email: newPerson.email,
      phone: newPerson.phone,
      notes: newPerson.notes,
      lastContact: new Date(),
      urgency: 'low'
    }

    const updatedConnections = [...connections, person]
    setConnections(updatedConnections)
    saveConnections(updatedConnections)
    
    // Reset form
    setNewPerson({
      name: '',
      lifeArea: '',
      frequency: 5,
      email: '',
      phone: '',
      notes: ''
    })
    setShowAddForm(false)
  }

  const updateLastContact = (id: string) => {
    const updatedConnections = connections.map(person =>
      person.id === id
        ? { ...person, lastContact: new Date() }
        : person
    )
    setConnections(updatedConnections)
    saveConnections(updatedConnections)
  }

  const deletePerson = (id: string) => {
    const updatedConnections = connections.filter(person => person.id !== id)
    setConnections(updatedConnections)
    saveConnections(updatedConnections)
  }

  const getUrgencyColor = (lastContact: Date | undefined, frequency: number) => {
    if (!lastContact) return 'high'
    
    const daysSince = Math.floor((Date.now() - lastContact.getTime()) / (1000 * 60 * 60 * 24))
    const threshold = frequency <= 5 ? 7 : frequency <= 7 ? 3 : 1
    
    if (daysSince > threshold * 2) return 'high'
    if (daysSince > threshold) return 'medium'
    return 'low'
  }

  // Update urgency for all connections
  useEffect(() => {
    const updatedConnections = connections.map(person => ({
      ...person,
      urgency: getUrgencyColor(person.lastContact, person.frequency) as 'low' | 'medium' | 'high'
    }))
    
    const hasChanges = updatedConnections.some((person, index) => 
      person.urgency !== connections[index]?.urgency
    )
    
    if (hasChanges) {
      setConnections(updatedConnections)
      saveConnections(updatedConnections)
    }
  }, [connections])

  const filteredConnections = connections
    .filter(person => 
      person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.lifeArea.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(person => 
      filterUrgency === 'all' || person.urgency === filterUrgency
    )
    .sort((a, b) => {
      // Sort by urgency first
      const urgencyOrder = { high: 0, medium: 1, low: 2 }
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
    })

  const urgencyColors = {
    low: 'bg-green-100 text-black border-green-300',
    medium: 'bg-yellow-100 text-black border-yellow-300',
    high: 'bg-red-100 text-black border-red-300'
  }

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
                Community
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-black" />
              <span className="text-sm text-black">{connections.length} connections</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl shadow-xl p-4 mb-6 border border-phoenix-gold/20">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black" />
              <input
                type="text"
                placeholder="Search connections..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:ring-2 focus:ring-phoenix-orange focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <PhoenixButton
                onClick={() => setFilterUrgency('all')}
                variant={filterUrgency === 'all' ? 'primary' : 'ghost'}
                size="sm"
              >
                All
              </PhoenixButton>
              <PhoenixButton
                onClick={() => setFilterUrgency('high')}
                variant={filterUrgency === 'high' ? 'danger' : 'ghost'}
                size="sm"
              >
                Urgent
              </PhoenixButton>
              <PhoenixButton
                onClick={() => setFilterUrgency('medium')}
                variant={filterUrgency === 'medium' ? 'warning' : 'ghost'}
                size="sm"
              >
                Due Soon
              </PhoenixButton>
              <PhoenixButton
                onClick={() => setFilterUrgency('low')}
                variant={filterUrgency === 'low' ? 'success' : 'ghost'}
                size="sm"
              >
                Recent
              </PhoenixButton>
            </div>
            <PhoenixButton
              onClick={() => setShowAddForm(true)}
              variant="primary"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Person
            </PhoenixButton>
          </div>
        </div>

        {/* Connections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredConnections.map((person, index) => (
            <motion.div
              key={person.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white rounded-2xl shadow-lg border-2 p-6 ${urgencyColors[person.urgency]}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-black">{person.name}</h3>
                  <p className="text-sm text-black">{person.lifeArea}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  person.urgency === 'high' ? 'bg-red-500 text-black' :
                  person.urgency === 'medium' ? 'bg-yellow-500 text-black' :
                  'bg-green-500 text-black'
                }`}>
                  {person.urgency === 'high' ? 'Overdue' :
                   person.urgency === 'medium' ? 'Due Soon' :
                   'Recent'}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-black">
                  <Clock className="w-4 h-4" />
                  <span>Frequency: {person.frequency}/10</span>
                </div>
                {person.lastContact && (
                  <div className="flex items-center gap-2 text-sm text-black">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Last: {Math.floor((Date.now() - person.lastContact.getTime()) / (1000 * 60 * 60 * 24))} days ago
                    </span>
                  </div>
                )}
                {person.email && (
                  <div className="flex items-center gap-2 text-sm text-black">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{person.email}</span>
                  </div>
                )}
                {person.phone && (
                  <div className="flex items-center gap-2 text-sm text-black">
                    <Phone className="w-4 h-4" />
                    <span>{person.phone}</span>
                  </div>
                )}
              </div>

              {person.notes && (
                <p className="text-sm text-black mb-4 italic">
                  "{person.notes}"
                </p>
              )}

              <div className="flex gap-2">
                <PhoenixButton
                  onClick={() => updateLastContact(person.id)}
                  variant="success"
                  size="sm"
                  className="flex-1"
                >
                  <Heart className="w-4 h-4 mr-1" />
                  Contact
                </PhoenixButton>
                <PhoenixButton
                  onClick={() => deletePerson(person.id)}
                  variant="danger"
                  size="sm"
                >
                  Remove
                </PhoenixButton>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredConnections.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-black mx-auto mb-4" />
            <p className="text-black">
              {searchTerm || filterUrgency !== 'all' 
                ? 'No connections found matching your filters'
                : 'No connections yet. Add your first person!'}
            </p>
          </div>
        )}
      </main>

      {/* Add Person Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md"
          >
            <h3 className="text-xl font-semibold mb-4 text-black">Add New Person</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={newPerson.name}
                  onChange={(e) => setNewPerson({ ...newPerson, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:ring-2 focus:ring-phoenix-orange focus:border-transparent"
                  placeholder="Person's name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Life Area
                </label>
                <input
                  type="text"
                  value={newPerson.lifeArea}
                  onChange={(e) => setNewPerson({ ...newPerson, lifeArea: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:ring-2 focus:ring-phoenix-orange focus:border-transparent"
                  placeholder="e.g., Work, Family, Friends"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Contact Frequency (1-10)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={newPerson.frequency}
                  onChange={(e) => setNewPerson({ ...newPerson, frequency: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="text-sm text-black text-center">
                  {newPerson.frequency}/10
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newPerson.email}
                  onChange={(e) => setNewPerson({ ...newPerson, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:ring-2 focus:ring-phoenix-orange focus:border-transparent"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={newPerson.phone}
                  onChange={(e) => setNewPerson({ ...newPerson, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:ring-2 focus:ring-phoenix-orange focus:border-transparent"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Notes
                </label>
                <textarea
                  value={newPerson.notes}
                  onChange={(e) => setNewPerson({ ...newPerson, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:ring-2 focus:ring-phoenix-orange focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Any notes about this person..."
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <PhoenixButton
                onClick={() => setShowAddForm(false)}
                variant="ghost"
                className="flex-1"
              >
                Cancel
              </PhoenixButton>
              <PhoenixButton
                onClick={addPerson}
                variant="success"
                className="flex-1"
              >
                Add Person
              </PhoenixButton>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}