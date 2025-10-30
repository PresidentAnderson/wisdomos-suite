'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  MessageCircle, 
  Heart,
  TrendingUp,
  Star,
  AlertCircle,
  Plus,
  Edit2,
  Save,
  X,
  ChevronLeft,
  Download,
  Upload,
  Trash2
} from 'lucide-react';
import Link from 'next/link';
import PhoenixButton from '@/components/ui/PhoenixButton';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  notes?: string;
  tags: string[];
  createdAt: string;
  lastContact?: string;
}

interface ContactLink {
  id: string;
  contactId: string;
  lifeAreaId: number;
  roleLabel?: string;
  frequency?: string;
  weight?: number;
  outcomes?: string;
}

interface RelationshipAssessment {
  trustScore?: number;
  communication?: number;
  reliability?: number;
  alignment?: number;
  overall?: number;
  notes?: string;
  assessedOn: string;
}

interface ContactHealth {
  contact: Contact;
  lifeAreas: Array<{
    lifeAreaId: number;
    roleLabel?: string;
    frequency?: string;
    weight?: number;
    latestAssessment?: RelationshipAssessment;
    interactionCount: number;
    lastInteraction?: string;
  }>;
  overallHealth: number;
}

const LIFE_AREAS = [
  { id: 1, name: 'Work & Purpose', color: 'bg-blue-500' },
  { id: 2, name: 'Health', color: 'bg-green-500' },
  { id: 3, name: 'Finance', color: 'bg-yellow-500' },
  { id: 4, name: 'Intimacy & Love', color: 'bg-pink-500' },
  { id: 5, name: 'Time & Energy', color: 'bg-purple-500' },
  { id: 6, name: 'Spiritual Alignment', color: 'bg-indigo-500' },
  { id: 7, name: 'Creativity', color: 'bg-orange-500' },
  { id: 8, name: 'Friendship', color: 'bg-cyan-500' },
  { id: 9, name: 'Learning & Growth', color: 'bg-teal-500' },
  { id: 10, name: 'Home & Environment', color: 'bg-amber-500' },
  { id: 11, name: 'Sexuality', color: 'bg-red-500' },
  { id: 12, name: 'Emotional Regulation', color: 'bg-emerald-500' },
  { id: 13, name: 'Legacy & Archives', color: 'bg-slate-500' },
];

export default function ContactsManager() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newContact, setNewContact] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
    tags: [] as string[],
  });

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = () => {
    const stored = localStorage.getItem('wisdomos_contacts') || '[]';
    const loadedContacts = JSON.parse(stored);
    setContacts(loadedContacts);
  };

  const saveContacts = (newContacts: Contact[]) => {
    setContacts(newContacts);
    localStorage.setItem('wisdomos_contacts', JSON.stringify(newContacts));
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContact.name || !newContact.email) return;

    const contact: Contact = {
      id: Date.now().toString(),
      name: newContact.name,
      email: newContact.email,
      phone: newContact.phone || undefined,
      notes: newContact.notes || undefined,
      tags: newContact.tags,
      createdAt: new Date().toISOString(),
      lastContact: new Date().toISOString()
    };

    saveContacts([...contacts, contact]);
    setNewContact({ name: '', email: '', phone: '', notes: '', tags: [] });
    setIsAddingContact(false);
  };

  const handleEditContact = (contact: Contact) => {
    setNewContact({
      name: contact.name,
      email: contact.email,
      phone: contact.phone || '',
      notes: contact.notes || '',
      tags: contact.tags
    });
    setSelectedContact(contact);
    setIsEditing(true);
  };

  const handleUpdateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContact || !newContact.name || !newContact.email) return;

    const updatedContact: Contact = {
      ...selectedContact,
      name: newContact.name,
      email: newContact.email,
      phone: newContact.phone || undefined,
      notes: newContact.notes || undefined,
      tags: newContact.tags
    };

    saveContacts(contacts.map(c => c.id === selectedContact.id ? updatedContact : c));
    setNewContact({ name: '', email: '', phone: '', notes: '', tags: [] });
    setSelectedContact(null);
    setIsEditing(false);
  };

  const handleDeleteContact = (contact: Contact) => {
    if (confirm(`Delete ${contact.name}?`)) {
      saveContacts(contacts.filter(c => c.id !== contact.id));
      if (selectedContact?.id === contact.id) {
        setSelectedContact(null);
      }
    }
  };

  const handleCsvImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const csv = event.target?.result as string;
      const lines = csv.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const nameIndex = headers.findIndex(h => h.includes('name'));
      const emailIndex = headers.findIndex(h => h.includes('email'));
      const phoneIndex = headers.findIndex(h => h.includes('phone'));
      const notesIndex = headers.findIndex(h => h.includes('note'));

      const newContacts: Contact[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        if (values.length >= 2 && values[nameIndex] && values[emailIndex]) {
          newContacts.push({
            id: Date.now().toString() + i,
            name: values[nameIndex],
            email: values[emailIndex],
            phone: phoneIndex >= 0 ? values[phoneIndex] : undefined,
            notes: notesIndex >= 0 ? values[notesIndex] : undefined,
            tags: [],
            createdAt: new Date().toISOString(),
            lastContact: new Date().toISOString()
          });
        }
      }

      if (newContacts.length > 0) {
        saveContacts([...contacts, ...newContacts]);
        setCsvFile(null);
        alert(`Imported ${newContacts.length} contacts successfully!`);
      }
    };
    reader.readAsText(csvFile);
  };

  const exportContacts = () => {
    const csvContent = [
      'Name,Email,Phone,Notes,Created At',
      ...contacts.map(contact => 
        `"${contact.name}","${contact.email}","${contact.phone || ''}","${contact.notes || ''}","${contact.createdAt}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wisdomos-contacts.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                Contact Management
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-black" />
              <span className="text-sm text-black">{contacts.length} contacts</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Action Bar */}
        <div className="mb-8 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4">
            <PhoenixButton
              onClick={() => setIsAddingContact(true)}
              variant="primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Contact
            </PhoenixButton>
            <PhoenixButton
              onClick={exportContacts}
              variant="secondary"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </PhoenixButton>
            <Link href="/settings">
              <PhoenixButton variant="ghost">
                Settings
              </PhoenixButton>
            </Link>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-phoenix-orange focus:border-transparent"
            />
          </div>
        </div>

        {/* CSV Import Section */}
        <div className="mb-8 p-6 bg-white rounded-2xl shadow-xl border border-phoenix-gold/20">
          <h3 className="text-lg font-semibold text-black mb-4">Bulk Import</h3>
          <p className="text-sm text-gray-600 mb-4">
            Upload a CSV file with columns: Name, Email, Phone, Notes. First row should contain headers.
          </p>
          <form onSubmit={handleCsvImport} className="flex gap-4 items-end">
            <div className="flex-1">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black"
              />
            </div>
            <PhoenixButton type="submit" disabled={!csvFile}>
              <Upload className="w-4 h-4 mr-2" />
              Import
            </PhoenixButton>
          </form>
        </div>

        {/* Contacts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContacts.map((contact) => (
            <motion.div
              key={contact.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-xl p-6 border border-phoenix-gold/20 hover:shadow-2xl transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-phoenix-orange to-phoenix-red rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-black">{contact.name}</h3>
                    <p className="text-sm text-gray-600">{contact.email}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEditContact(contact)}
                    className="p-2 text-gray-500 hover:text-black rounded-lg hover:bg-gray-100"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteContact(contact)}
                    className="p-2 text-gray-500 hover:text-red-600 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {contact.phone && (
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{contact.phone}</span>
                </div>
              )}

              {contact.notes && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 italic">{contact.notes}</p>
                </div>
              )}

              {contact.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {contact.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-phoenix-gold/20 text-black text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <button className="flex-1 py-2 px-3 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email
                </button>
                {contact.phone && (
                  <button className="flex-1 py-2 px-3 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Call
                  </button>
                )}
              </div>

              <div className="mt-3 text-xs text-gray-500">
                Added: {new Date(contact.createdAt).toLocaleDateString()}
              </div>
            </motion.div>
          ))}
        </div>

        {filteredContacts.length === 0 && (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts found</h3>
            <p className="text-gray-500 mb-4">Get started by adding your first contact</p>
            <PhoenixButton onClick={() => setIsAddingContact(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Contact
            </PhoenixButton>
          </div>
        )}
      </main>

      {/* Add/Edit Contact Modal */}
      <AnimatePresence>
        {(isAddingContact || isEditing) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md mx-4"
            >
              <h3 className="text-xl font-semibold mb-4 text-black">
                {isEditing ? 'Edit Contact' : 'Add New Contact'}
              </h3>
              
              <form onSubmit={isEditing ? handleUpdateContact : handleAddContact} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={newContact.name}
                    onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:ring-2 focus:ring-phoenix-orange focus:border-transparent"
                    placeholder="Full name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:ring-2 focus:ring-phoenix-orange focus:border-transparent"
                    placeholder="email@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:ring-2 focus:ring-phoenix-orange focus:border-transparent"
                    placeholder="(555) 123-4567"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Notes
                  </label>
                  <textarea
                    value={newContact.notes}
                    onChange={(e) => setNewContact({...newContact, notes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:ring-2 focus:ring-phoenix-orange focus:border-transparent"
                    placeholder="Additional notes..."
                    rows={3}
                  />
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingContact(false);
                      setIsEditing(false);
                      setSelectedContact(null);
                      setNewContact({ name: '', email: '', phone: '', notes: '', tags: [] });
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-black rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-phoenix-orange text-black rounded-lg hover:bg-phoenix-red transition-colors"
                  >
                    <Save className="w-4 h-4 inline mr-1" />
                    {isEditing ? 'Update' : 'Add'} Contact
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}