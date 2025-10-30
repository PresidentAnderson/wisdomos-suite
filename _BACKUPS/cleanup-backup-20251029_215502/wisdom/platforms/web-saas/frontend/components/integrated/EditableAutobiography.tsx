'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Edit3, Save, X, History, Download, Plus, Tag, Users, 
  Calendar, AlertCircle, CheckCircle, RefreshCw, Search,
  ChevronDown, ChevronUp, GitBranch, FileText
} from 'lucide-react'
import { AutobiographyEntry, EntryRevision } from '@/types/autobiography-editable'
import { apiClient } from '@/lib/api-client/client'

interface EditableAutobiographyProps {
  userId?: string
  onConnect?: (lifeAreaIds: string[]) => void // Connect to Fulfillment Display
}

export default function EditableAutobiography({ userId = 'demo-user-id', onConnect }: EditableAutobiographyProps) {
  const [entries, setEntries] = useState<AutobiographyEntry[]>([])
  const [selectedEntry, setSelectedEntry] = useState<AutobiographyEntry | null>(null)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Partial<AutobiographyEntry>>({})
  const [showRevisions, setShowRevisions] = useState(false)
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'timeline' | 'narrative' | 'patterns'>('narrative')
  const autoSaveTimer = useRef<NodeJS.Timeout>()

  // Load entries on mount
  useEffect(() => {
    loadEntries()
  }, [userId])

  const loadEntries = async () => {
    try {
      const response = await apiClient.http.get(`/api/autobiography/user/${userId}`)
      setEntries(response.data || [])
    } catch (error) {
      console.error('Failed to load entries:', error)
    }
  }

  // Auto-save functionality
  useEffect(() => {
    if (editingField && selectedEntry) {
      clearTimeout(autoSaveTimer.current)
      autoSaveTimer.current = setTimeout(() => {
        autoSave()
      }, 2000) // Auto-save after 2 seconds of inactivity
    }
    return () => clearTimeout(autoSaveTimer.current)
  }, [editValues])

  const autoSave = async () => {
    if (!selectedEntry) return
    
    setAutoSaveStatus('saving')
    try {
      await apiClient.http.put(`/api/autobiography/${selectedEntry.id}/autosave`, editValues)
      setAutoSaveStatus('saved')
      setTimeout(() => setAutoSaveStatus('idle'), 2000)
    } catch (error) {
      setAutoSaveStatus('error')
      console.error('Auto-save failed:', error)
    }
  }

  const startEditing = (field: string, value: any) => {
    setEditingField(field)
    setEditValues({ [field]: value })
  }

  const saveField = async () => {
    if (!selectedEntry || !editingField) return
    
    try {
      const response = await apiClient.http.put(`/api/autobiography/${selectedEntry.id}`, {
        ...editValues,
        changeNote: `Updated ${editingField}`
      })
      
      // Update local state
      const updatedEntry = response.data
      setEntries(entries.map(e => e.id === updatedEntry.id ? updatedEntry : e))
      setSelectedEntry(updatedEntry)
      setEditingField(null)
      setEditValues({})
      
      // If life areas changed, notify parent
      if (editingField === 'lifeAreas' && onConnect) {
        onConnect(updatedEntry.lifeAreas)
      }
    } catch (error) {
      console.error('Failed to save:', error)
    }
  }

  const cancelEditing = () => {
    setEditingField(null)
    setEditValues({})
  }

  const createNewEntry = async (year: number) => {
    try {
      const response = await apiClient.http.post('/api/autobiography', {
        userId,
        year,
        title: `Year ${year}`,
        narrative: '',
        meaning: '',
        insight: '',
        commitment: '',
        completionStatus: 'draft'
      })
      
      const newEntry = response.data
      setEntries([...entries, newEntry].sort((a, b) => a.year - b.year))
      setSelectedEntry(newEntry)
    } catch (error) {
      console.error('Failed to create entry:', error)
    }
  }

  const exportToMarkdown = async () => {
    try {
      const response = await apiClient.http.get(`/api/autobiography/user/${userId}/export/markdown`)
      const { content, filename } = response.data
      
      // Create download link
      const blob = new Blob([content], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const EditableField = ({ 
    label, 
    field, 
    value, 
    multiline = false,
    type = 'text'
  }: {
    label: string
    field: string
    value: any
    multiline?: boolean
    type?: 'text' | 'array' | 'tags'
  }) => {
    const isEditing = editingField === field

    if (isEditing) {
      return (
        <div className="mb-4">
          <label className="block text-sm font-medium text-black mb-1">{label}</label>
          <div className="flex gap-2">
            {multiline ? (
              <textarea
                value={editValues[field] || value || ''}
                onChange={(e) => setEditValues({ ...editValues, [field]: e.target.value })}
                className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-phoenix-orange"
                rows={4}
                autoFocus
              />
            ) : type === 'tags' ? (
              <input
                value={Array.isArray(editValues[field]) ? editValues[field].join(', ') : value?.join(', ') || ''}
                onChange={(e) => setEditValues({ 
                  ...editValues, 
                  [field]: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                })}
                className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-phoenix-orange"
                placeholder="Enter tags separated by commas"
                autoFocus
              />
            ) : (
              <input
                value={editValues[field] || value || ''}
                onChange={(e) => setEditValues({ ...editValues, [field]: e.target.value })}
                className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-phoenix-orange"
                autoFocus
              />
            )}
            <button
              onClick={saveField}
              className="p-2 bg-green-500 text-black rounded hover:bg-green-600"
            >
              <Save className="w-4 h-4" />
            </button>
            <button
              onClick={cancelEditing}
              className="p-2 bg-gray-500 text-black rounded hover:bg-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="mb-4 group">
        <label className="block text-sm font-medium text-black mb-1">{label}</label>
        <div 
          onClick={() => startEditing(field, value)}
          className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors flex items-start justify-between"
        >
          <div className="flex-1">
            {type === 'tags' && Array.isArray(value) ? (
              <div className="flex flex-wrap gap-1">
                {value.length > 0 ? value.map((tag, i) => (
                  <span key={i} className="text-xs bg-phoenix-gold/20 px-2 py-1 rounded">
                    #{tag}
                  </span>
                )) : <span className="text-black italic">Click to add tags</span>}
              </div>
            ) : (
              <p className={`${!value ? 'text-black italic' : 'text-black'} whitespace-pre-wrap`}>
                {value || `Click to add ${label.toLowerCase()}`}
              </p>
            )}
          </div>
          <Edit3 className="w-4 h-4 text-black opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-phoenix-gold/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg">
            <FileText className="w-6 h-6 text-black" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-black">Editable Autobiography</h2>
            <p className="text-sm text-black">Click any field to edit inline</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Auto-save indicator */}
          <div className="flex items-center gap-2">
            {autoSaveStatus === 'saving' && (
              <div className="flex items-center gap-1 text-black">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="text-xs">Saving...</span>
              </div>
            )}
            {autoSaveStatus === 'saved' && (
              <div className="flex items-center gap-1 text-black">
                <CheckCircle className="w-4 h-4" />
                <span className="text-xs">Saved</span>
              </div>
            )}
            {autoSaveStatus === 'error' && (
              <div className="flex items-center gap-1 text-black">
                <AlertCircle className="w-4 h-4" />
                <span className="text-xs">Error</span>
              </div>
            )}
          </div>
          
          {/* Export button */}
          <button
            onClick={exportToMarkdown}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            title="Export to Markdown"
          >
            <Download className="w-5 h-5" />
          </button>
          
          {/* View mode toggle */}
          <div className="flex gap-1 bg-gray-100 rounded p-1">
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-2 py-1 rounded text-sm ${viewMode === 'timeline' ? 'bg-white shadow' : ''}`}
            >
              Timeline
            </button>
            <button
              onClick={() => setViewMode('narrative')}
              className={`px-2 py-1 rounded text-sm ${viewMode === 'narrative' ? 'bg-white shadow' : ''}`}
            >
              Narrative
            </button>
            <button
              onClick={() => setViewMode('patterns')}
              className={`px-2 py-1 rounded text-sm ${viewMode === 'patterns' ? 'bg-white shadow' : ''}`}
            >
              Patterns
            </button>
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-black" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search entries..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-phoenix-orange"
          />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Year selector sidebar */}
        <div className="col-span-3">
          <div className="sticky top-0 max-h-[600px] overflow-y-auto">
            <h3 className="font-semibold text-sm text-black mb-2">Years</h3>
            <div className="space-y-1">
              {/* Add new year button */}
              <button
                onClick={() => {
                  const year = prompt('Enter year:')
                  if (year) createNewEntry(parseInt(year))
                }}
                className="w-full p-2 text-left hover:bg-gray-100 rounded flex items-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Year
              </button>
              
              {/* Year list */}
              {entries.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => setSelectedEntry(entry)}
                  className={`
                    w-full p-2 text-left rounded flex items-center justify-between text-sm relative
                    ${selectedEntry?.id === entry.id ? 'bg-phoenix-gold/20 text-black font-medium' : 'hover:bg-gray-100'}
                  `}
                >
                  {/* Green growth indicator dot */}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-green-500 rounded-r" />
                  
                  <span className="ml-2">{entry.year}</span>
                  <div className="flex items-center gap-1">
                    {/* Growth indicator */}
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Growth recorded" />
                    {entry.completionStatus === 'complete' && <CheckCircle className="w-3 h-3 text-black" />}
                    {entry.completionStatus === 'partial' && <AlertCircle className="w-3 h-3 text-black" />}
                    {entry.isReframed && <RefreshCw className="w-3 h-3 text-black" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="col-span-9">
          {selectedEntry ? (
            <div>
              {/* Entry header */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-2xl font-bold text-black">
                    Year {selectedEntry.year}
                  </h3>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedEntry.completionStatus}
                      onChange={async (e) => {
                        const value = e.target.value
                        await apiClient.http.put(`/api/autobiography/${selectedEntry.id}`, {
                          completionStatus: value
                        })
                        loadEntries()
                      }}
                      className="text-sm border rounded px-2 py-1"
                    >
                      <option value="draft">Draft</option>
                      <option value="partial">Partial</option>
                      <option value="complete">Complete</option>
                      <option value="reviewed">Reviewed</option>
                    </select>
                    
                    <button
                      onClick={() => setShowRevisions(!showRevisions)}
                      className="p-2 hover:bg-gray-100 rounded transition-colors"
                      title="Revision History"
                    >
                      <History className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                {/* Version info */}
                <div className="flex items-center gap-4 text-xs text-black">
                  <span>Version {selectedEntry.version}</span>
                  <span>Updated {new Date(selectedEntry.updatedAt).toLocaleDateString()}</span>
                  {selectedEntry.revisions && selectedEntry.revisions.length > 0 && (
                    <span>{selectedEntry.revisions.length} revisions</span>
                  )}
                </div>
              </div>

              {/* Editable fields */}
              <EditableField
                label="Title"
                field="title"
                value={selectedEntry.title}
              />

              <EditableField
                label="Narrative"
                field="narrative"
                value={selectedEntry.narrative}
                multiline
              />

              {/* Earliest Similar Occurrence */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-black mb-1">
                  Earliest Similar Occurrence
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <EditableField
                    label="Year"
                    field="earliestSimilarOccurrence.year"
                    value={selectedEntry.earliestSimilarOccurrence?.year}
                  />
                  <EditableField
                    label="Description"
                    field="earliestSimilarOccurrence.description"
                    value={selectedEntry.earliestSimilarOccurrence?.description}
                  />
                </div>
              </div>

              <EditableField
                label="Meaning"
                field="meaning"
                value={selectedEntry.meaning}
                multiline
              />

              <EditableField
                label="Insight"
                field="insight"
                value={selectedEntry.insight}
                multiline
              />

              <EditableField
                label="Commitment"
                field="commitment"
                value={selectedEntry.commitment}
              />

              <EditableField
                label="Life Areas"
                field="lifeAreas"
                value={selectedEntry.lifeAreas}
                type="tags"
              />

              <EditableField
                label="Tags"
                field="tags"
                value={selectedEntry.tags}
                type="tags"
              />

              {/* Reframed narrative */}
              {selectedEntry.isReframed && (
                <EditableField
                  label="Reframed Narrative"
                  field="reframedNarrative"
                  value={selectedEntry.reframedNarrative}
                  multiline
                />
              )}

              {/* Revision history */}
              <AnimatePresence>
                {showRevisions && selectedEntry.revisions && selectedEntry.revisions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 p-4 bg-gray-50 rounded-lg"
                  >
                    <h4 className="font-semibold text-sm mb-3">Revision History</h4>
                    <div className="space-y-2">
                      {selectedEntry.revisions.map((revision: any) => (
                        <div key={revision.id} className="flex items-center justify-between p-2 bg-white rounded">
                          <div>
                            <p className="text-sm">Version {revision.version}</p>
                            <p className="text-xs text-black">
                              {revision.changedFields.join(', ')} • {new Date(revision.editedAt).toLocaleString()}
                            </p>
                            {revision.changeNote && (
                              <p className="text-xs text-black italic">{revision.changeNote}</p>
                            )}
                          </div>
                          <button
                            onClick={async () => {
                              if (confirm('Restore this version?')) {
                                await apiClient.http.post(
                                  `/api/autobiography/${selectedEntry.id}/revisions/${revision.id}/restore`
                                )
                                loadEntries()
                              }
                            }}
                            className="text-xs text-black hover:text-black"
                          >
                            Restore
                          </button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-12 text-black">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-black" />
              <p>Select a year to view or edit</p>
              <p className="text-sm mt-2">Click "Add Year" to create a new entry</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}