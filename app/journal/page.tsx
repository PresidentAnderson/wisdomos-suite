'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface JournalEntry {
  id: string
  title: string
  body: string
  type: 'journal' | 'voice' | 'reflection'
  mood?: string
  tags: string[]
  createdAt: string
  audioUrl?: string
}

export default function JournalPage() {
  const router = useRouter()
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [showNewEntry, setShowNewEntry] = useState(false)
  const [entryType, setEntryType] = useState<'text' | 'voice'>('text')
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [transcribing, setTranscribing] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [mood, setMood] = useState('')
  const [tags, setTags] = useState('')
  const [loading, setLoading] = useState(true)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  useEffect(() => {
    // Load sample entries
    setTimeout(() => {
      setEntries([
        {
          id: '1',
          title: 'Morning Reflection',
          body: 'Today I woke up feeling grateful for the opportunities ahead. The clarity I have about my goals is energizing.',
          type: 'journal',
          mood: 'grateful',
          tags: ['morning', 'gratitude', 'goals'],
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Breakthrough Moment',
          body: 'Had an amazing insight during meditation - resistance is just fear dressed up as logic. When I lean into discomfort, growth happens.',
          type: 'reflection',
          mood: 'inspired',
          tags: ['insight', 'growth', 'meditation'],
          createdAt: new Date(Date.now() - 86400000).toISOString()
        }
      ])
      setLoading(false)
    }, 500)
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        setAudioBlob(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Could not access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const transcribeAudio = async () => {
    if (!audioBlob) return

    setTranscribing(true)
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.wav')

      const token = localStorage.getItem('token')
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setBody(data.transcript)
        setAudioBlob(null)
      } else {
        alert('Failed to transcribe audio')
      }
    } catch (error) {
      console.error('Error transcribing:', error)
      alert('Error transcribing audio')
    } finally {
      setTranscribing(false)
    }
  }

  const saveEntry = () => {
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      title: title || 'Untitled Entry',
      body,
      type: entryType === 'voice' ? 'voice' : 'journal',
      mood,
      tags: tags.split(',').map(t => t.trim()).filter(t => t),
      createdAt: new Date().toISOString()
    }

    setEntries([newEntry, ...entries])
    
    // Reset form
    setTitle('')
    setBody('')
    setMood('')
    setTags('')
    setAudioBlob(null)
    setShowNewEntry(false)
    setEntryType('text')
  }

  const getMoodEmoji = (mood: string) => {
    const moods: { [key: string]: string } = {
      happy: '😊',
      grateful: '🙏',
      excited: '🎉',
      peaceful: '😌',
      inspired: '✨',
      thoughtful: '🤔',
      anxious: '😰',
      sad: '😢',
      frustrated: '😤',
      neutral: '😐'
    }
    return moods[mood] || '📝'
  }

  const getTypeIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      journal: '📝',
      voice: '🎙️',
      reflection: '💭'
    }
    return icons[type] || '📝'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-lg">Loading journal...</div>
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
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Journal</h1>
              <p className="text-gray-600">Capture your thoughts, insights, and reflections</p>
            </div>
            <button
              onClick={() => setShowNewEntry(true)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <span>✍️</span> New Entry
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-gray-800">{entries.length}</div>
            <div className="text-gray-600">Total Entries</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-purple-600">
              {entries.filter(e => e.type === 'reflection').length}
            </div>
            <div className="text-gray-600">Reflections</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-blue-600">
              {entries.filter(e => e.type === 'voice').length}
            </div>
            <div className="text-gray-600">Voice Notes</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-green-600">
              {new Set(entries.flatMap(e => e.tags)).size}
            </div>
            <div className="text-gray-600">Unique Tags</div>
          </div>
        </div>

        {/* New Entry Modal */}
        {showNewEntry && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">New Journal Entry</h2>
                <button
                  onClick={() => setShowNewEntry(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              {/* Entry Type Toggle */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setEntryType('text')}
                  className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                    entryType === 'text' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  📝 Text Entry
                </button>
                <button
                  onClick={() => setEntryType('voice')}
                  className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                    entryType === 'voice' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  🎙️ Voice Entry
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Give your entry a title..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {entryType === 'voice' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Voice Recording</label>
                    <div className="bg-gray-50 rounded-lg p-4">
                      {!isRecording && !audioBlob && (
                        <button
                          onClick={startRecording}
                          className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                        >
                          🎤 Start Recording
                        </button>
                      )}
                      
                      {isRecording && (
                        <div className="text-center">
                          <div className="text-red-500 text-xl mb-4 animate-pulse">● Recording...</div>
                          <button
                            onClick={stopRecording}
                            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
                          >
                            ⏹ Stop Recording
                          </button>
                        </div>
                      )}

                      {audioBlob && !transcribing && (
                        <div className="space-y-2">
                          <audio controls className="w-full">
                            <source src={URL.createObjectURL(audioBlob)} type="audio/wav" />
                          </audio>
                          <div className="flex gap-2">
                            <button
                              onClick={transcribeAudio}
                              className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
                            >
                              📝 Transcribe to Text
                            </button>
                            <button
                              onClick={() => setAudioBlob(null)}
                              className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700"
                            >
                              🔄 Re-record
                            </button>
                          </div>
                        </div>
                      )}

                      {transcribing && (
                        <div className="text-center py-4">
                          <div className="text-indigo-600 animate-pulse">Transcribing audio...</div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Write your thoughts..."
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mood</label>
                    <select
                      value={mood}
                      onChange={(e) => setMood(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select mood...</option>
                      <option value="happy">😊 Happy</option>
                      <option value="grateful">🙏 Grateful</option>
                      <option value="excited">🎉 Excited</option>
                      <option value="peaceful">😌 Peaceful</option>
                      <option value="inspired">✨ Inspired</option>
                      <option value="thoughtful">🤔 Thoughtful</option>
                      <option value="anxious">😰 Anxious</option>
                      <option value="sad">😢 Sad</option>
                      <option value="frustrated">😤 Frustrated</option>
                      <option value="neutral">😐 Neutral</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                    <input
                      type="text"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="growth, insight, reflection..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => setShowNewEntry(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEntry}
                  disabled={!body}
                  className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Entry
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Entries List */}
        <div className="space-y-4">
          {entries.map((entry) => (
            <div key={entry.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getTypeIcon(entry.type)}</span>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">{entry.title}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(entry.createdAt).toLocaleDateString()} at{' '}
                      {new Date(entry.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                {entry.mood && (
                  <span className="text-2xl" title={entry.mood}>
                    {getMoodEmoji(entry.mood)}
                  </span>
                )}
              </div>
              
              <p className="text-gray-700 mb-3 line-clamp-3">{entry.body}</p>
              
              {entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {entry.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {entries.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No journal entries yet</h3>
            <p className="text-gray-500 mb-4">Start capturing your thoughts and insights</p>
            <button
              onClick={() => setShowNewEntry(true)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
            >
              Create Your First Entry
            </button>
          </div>
        )}
      </div>
    </div>
  )
}