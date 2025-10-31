'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Contact {
  id: string
  firstName: string
  lastName: string
  email?: string
  phoneE164?: string
  notes?: string
  tags: string[]
  lifeAreaLinks?: { lifeArea: { name: string } }[]
  lastInteraction?: string
}

export default function ContactsPage() {
  const router = useRouter()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [showAddContact, setShowAddContact] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  
  // Form fields
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [tags, setTags] = useState('')

  useEffect(() => {
    fetchContacts()
  }, [searchTerm, selectedTag]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchContacts = async () => {
    try {
      const token = localStorage.getItem('token')
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (selectedTag) params.append('tag', selectedTag)
      
      const response = await fetch(`/api/contacts?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setContacts(data)
      }
    } catch (error) {
      console.error('Error fetching contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveContact = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email: email || undefined,
          phoneE164: phone || undefined,
          notes: notes || undefined,
          tags: tags.split(',').map(t => t.trim()).filter(t => t)
        })
      })
      
      if (response.ok) {
        const newContact = await response.json()
        setContacts([...contacts, newContact])
        
        // Reset form
        setFirstName('')
        setLastName('')
        setEmail('')
        setPhone('')
        setNotes('')
        setTags('')
        setShowAddContact(false)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to add contact')
      }
    } catch (error) {
      console.error('Error adding contact:', error)
      alert('Failed to add contact')
    }
  }

  const getAllTags = () => {
    const allTags = new Set<string>()
    contacts.forEach(contact => {
      contact.tags?.forEach(tag => allTags.add(tag))
    })
    return Array.from(allTags).sort()
  }

  const getInitials = (contact: Contact) => {
    return `${contact.firstName[0]}${contact.lastName[0]}`.toUpperCase()
  }

  const getContactColor = (contact: Contact) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-orange-500',
      'bg-red-500'
    ]
    const index = (contact.firstName.charCodeAt(0) + contact.lastName.charCodeAt(0)) % colors.length
    return colors[index]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-lg">Loading contacts...</div>
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
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Contacts</h1>
              <p className="text-gray-600">Manage your network and relationships</p>
            </div>
            <button
              onClick={() => setShowAddContact(true)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <span>➕</span> Add Contact
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="min-w-[150px]">
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Tags</option>
                {getAllTags().map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-gray-800">{contacts.length}</div>
            <div className="text-gray-600">Total Contacts</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-blue-600">
              {contacts.filter(c => c.email).length}
            </div>
            <div className="text-gray-600">With Email</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-green-600">
              {contacts.filter(c => c.phoneE164).length}
            </div>
            <div className="text-gray-600">With Phone</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-purple-600">
              {getAllTags().length}
            </div>
            <div className="text-gray-600">Unique Tags</div>
          </div>
        </div>

        {/* Contacts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => setSelectedContact(contact)}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full ${getContactColor(contact)} flex items-center justify-center text-white font-bold`}>
                  {getInitials(contact)}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {contact.firstName} {contact.lastName}
                  </h3>
                  {contact.email && (
                    <p className="text-sm text-gray-600 mb-1">📧 {contact.email}</p>
                  )}
                  {contact.phoneE164 && (
                    <p className="text-sm text-gray-600 mb-1">📱 {contact.phoneE164}</p>
                  )}
                  {contact.notes && (
                    <p className="text-sm text-gray-500 italic mb-2 line-clamp-2">{contact.notes}</p>
                  )}
                  {contact.tags && contact.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {contact.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {contacts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No contacts yet</h3>
            <p className="text-gray-500 mb-4">Start building your network</p>
            <button
              onClick={() => setShowAddContact(true)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
            >
              Add Your First Contact
            </button>
          </div>
        )}

        {/* Add Contact Modal */}
        {showAddContact && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Add New Contact</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1234567890"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="friend, colleague, family..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => setShowAddContact(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={saveContact}
                  disabled={!firstName || !lastName}
                  className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Contact
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Contact Details Modal */}
        {selectedContact && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-full ${getContactColor(selectedContact)} flex items-center justify-center text-white font-bold text-xl`}>
                    {getInitials(selectedContact)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {selectedContact.firstName} {selectedContact.lastName}
                    </h2>
                    {selectedContact.tags && selectedContact.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedContact.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedContact(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                {selectedContact.email && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">📧</span>
                    <a href={`mailto:${selectedContact.email}`} className="text-blue-600 hover:underline">
                      {selectedContact.email}
                    </a>
                  </div>
                )}
                
                {selectedContact.phoneE164 && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">📱</span>
                    <a href={`tel:${selectedContact.phoneE164}`} className="text-blue-600 hover:underline">
                      {selectedContact.phoneE164}
                    </a>
                  </div>
                )}

                {selectedContact.notes && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-700 mb-2">Notes</h3>
                    <p className="text-gray-600">{selectedContact.notes}</p>
                  </div>
                )}

                <div className="flex gap-2 mt-6">
                  <button
                    onClick={() => router.push(`/interactions?contact=${selectedContact.id}`)}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                  >
                    View Interactions
                  </button>
                  <button
                    onClick={() => setSelectedContact(null)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}