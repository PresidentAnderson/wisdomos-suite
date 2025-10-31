'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function JournalEntry({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [entry, setEntry] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedEntry, setEditedEntry] = useState(null);

  const moods = {
    happy: { emoji: '😊', label: 'Happy' },
    peaceful: { emoji: '😌', label: 'Peaceful' },
    reflective: { emoji: '🤔', label: 'Reflective' },
    motivated: { emoji: '💪', label: 'Motivated' },
    grateful: { emoji: '🙏', label: 'Grateful' },
    challenged: { emoji: '😤', label: 'Challenged' },
    inspired: { emoji: '✨', label: 'Inspired' },
    curious: { emoji: '🧐', label: 'Curious' }
  };

  useEffect(() => {
    // Load entries from localStorage
    const entries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
    const foundEntry = entries.find(e => e.id.toString() === params.id);
    
    if (foundEntry) {
      setEntry(foundEntry);
      setEditedEntry(foundEntry);
    } else {
      // Entry not found, redirect to journal
      router.push('/journal');
    }
  }, [params.id, router]);

  const handleSave = () => {
    const entries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
    const updatedEntries = entries.map(e => 
      e.id.toString() === params.id ? editedEntry : e
    );
    localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
    setEntry(editedEntry);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this entry?')) {
      const entries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
      const filteredEntries = entries.filter(e => e.id.toString() !== params.id);
      localStorage.setItem('journalEntries', JSON.stringify(filteredEntries));
      router.push('/journal');
    }
  };

  if (!entry) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const currentMood = moods[entry.mood] || moods.reflective;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-white">
              WisdomOS
            </Link>
            <nav className="flex space-x-6">
              <Link href="/dashboard" className="text-white/70 hover:text-white">Dashboard</Link>
              <Link href="/journal" className="text-cyan-400">Journal</Link>
              <Link href="/goals" className="text-white/70 hover:text-white">Goals</Link>
              <Link href="/library" className="text-white/70 hover:text-white">Library</Link>
            </nav>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Back Link */}
        <Link href="/journal" className="text-cyan-400 hover:text-cyan-300 mb-6 inline-block">
          ← Back to Journal
        </Link>

        {/* Entry Content */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10">
          {isEditing ? (
            // Edit Mode
            <div>
              <input
                type="text"
                value={editedEntry.title}
                onChange={(e) => setEditedEntry({ ...editedEntry, title: e.target.value })}
                className="text-3xl font-bold text-white mb-4 w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-400"
              />
              
              <textarea
                value={editedEntry.content}
                onChange={(e) => setEditedEntry({ ...editedEntry, content: e.target.value })}
                className="w-full text-gray-300 leading-relaxed bg-white/10 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-400 min-h-[400px] mb-6"
              />
              
              <div className="flex space-x-4">
                <button
                  onClick={handleSave}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setEditedEntry(entry);
                    setIsEditing(false);
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            // View Mode
            <div>
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{entry.title}</h1>
                  <div className="flex items-center space-x-4 text-gray-400">
                    <span>{new Date(entry.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                    <span>•</span>
                    <span className="flex items-center space-x-1">
                      <span className="text-xl">{currentMood.emoji}</span>
                      <span className="capitalize">{currentMood.label}</span>
                    </span>
                    <span>•</span>
                    <span className="text-yellow-400">⭐ {entry.wisdomPoints} points</span>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 px-4 py-2 rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Tags */}
              {entry.tags && entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {entry.tags.map((tag, index) => (
                    <span key={index} className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Content */}
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap text-lg">
                  {entry.content}
                </p>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex space-x-4">
                    <button className="text-gray-400 hover:text-white transition-colors">
                      Share
                    </button>
                    <button className="text-gray-400 hover:text-white transition-colors">
                      Export
                    </button>
                  </div>
                  <div className="text-gray-400 text-sm">
                    Entry #{entry.id}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Related Insights */}
        <div className="mt-8 bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-4">Reflection Questions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-gray-300">
              • What patterns do you notice in this entry?
            </div>
            <div className="text-gray-300">
              • How does this relate to your goals?
            </div>
            <div className="text-gray-300">
              • What would you do differently?
            </div>
            <div className="text-gray-300">
              • What wisdom can you extract from this?
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}