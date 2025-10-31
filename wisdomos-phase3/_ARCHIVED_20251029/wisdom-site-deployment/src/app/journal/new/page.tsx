'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewJournalEntry() {
  const router = useRouter();
  const [entry, setEntry] = useState({
    title: '',
    content: '',
    mood: '',
    tags: '',
    wisdomPoints: 10
  });

  const moods = [
    { value: 'happy', emoji: '😊', label: 'Happy' },
    { value: 'peaceful', emoji: '😌', label: 'Peaceful' },
    { value: 'reflective', emoji: '🤔', label: 'Reflective' },
    { value: 'motivated', emoji: '💪', label: 'Motivated' },
    { value: 'grateful', emoji: '🙏', label: 'Grateful' },
    { value: 'challenged', emoji: '😤', label: 'Challenged' },
    { value: 'inspired', emoji: '✨', label: 'Inspired' },
    { value: 'curious', emoji: '🧐', label: 'Curious' }
  ];

  const prompts = [
    "What wisdom did you gain today?",
    "Describe a moment that made you think differently",
    "What challenge taught you something valuable?",
    "How did you grow as a person today?",
    "What are you grateful for right now?",
    "What pattern have you noticed in your life recently?",
    "What would you tell your younger self?",
    "What small victory did you achieve today?"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get existing entries from localStorage
    const existingEntries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
    
    // Create new entry
    const newEntry = {
      id: Date.now(),
      ...entry,
      date: new Date().toISOString(),
      tags: entry.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    };
    
    // Save to localStorage
    localStorage.setItem('journalEntries', JSON.stringify([newEntry, ...existingEntries]));
    
    // Redirect to journal page
    router.push('/journal');
  };

  const usePrompt = (prompt: string) => {
    setEntry(prev => ({
      ...prev,
      content: prev.content ? `${prev.content}\n\n${prompt}\n` : `${prompt}\n`
    }));
  };

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
        {/* Header */}
        <div className="mb-8">
          <Link href="/journal" className="text-cyan-400 hover:text-cyan-300 mb-4 inline-block">
            ← Back to Journal
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">New Journal Entry</h1>
          <p className="text-gray-400">Capture your thoughts and wisdom</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10">
              {/* Title */}
              <div className="mb-6">
                <label className="block text-white mb-2 font-semibold">Title</label>
                <input
                  type="text"
                  value={entry.title}
                  onChange={(e) => setEntry(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
                  placeholder="Give your entry a meaningful title..."
                  required
                />
              </div>

              {/* Mood Selector */}
              <div className="mb-6">
                <label className="block text-white mb-2 font-semibold">How are you feeling?</label>
                <div className="grid grid-cols-4 gap-3">
                  {moods.map(mood => (
                    <button
                      key={mood.value}
                      type="button"
                      onClick={() => setEntry(prev => ({ ...prev, mood: mood.value }))}
                      className={`p-3 rounded-lg border transition-all ${
                        entry.mood === mood.value
                          ? 'bg-cyan-500/30 border-cyan-400 text-white'
                          : 'bg-white/5 border-white/20 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <div className="text-2xl mb-1">{mood.emoji}</div>
                      <div className="text-xs">{mood.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="mb-6">
                <label className="block text-white mb-2 font-semibold">Your Entry</label>
                <textarea
                  value={entry.content}
                  onChange={(e) => setEntry(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 min-h-[300px]"
                  placeholder="Write your thoughts, insights, and reflections..."
                  required
                />
              </div>

              {/* Tags */}
              <div className="mb-6">
                <label className="block text-white mb-2 font-semibold">Tags</label>
                <input
                  type="text"
                  value={entry.tags}
                  onChange={(e) => setEntry(prev => ({ ...prev, tags: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
                  placeholder="mindfulness, growth, gratitude (comma separated)"
                />
              </div>

              {/* Wisdom Points */}
              <div className="mb-6">
                <label className="block text-white mb-2 font-semibold">
                  Wisdom Points: {entry.wisdomPoints}
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={entry.wisdomPoints}
                  onChange={(e) => setEntry(prev => ({ ...prev, wisdomPoints: parseInt(e.target.value) }))}
                  className="w-full"
                />
                <div className="flex justify-between text-gray-400 text-sm mt-1">
                  <span>Low Impact</span>
                  <span>High Impact</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold py-3 rounded-lg hover:from-cyan-600 hover:to-purple-600 transition-all"
                >
                  Save Entry
                </button>
                <Link href="/journal">
                  <button
                    type="button"
                    className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all"
                  >
                    Cancel
                  </button>
                </Link>
              </div>
            </form>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Writing Prompts */}
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Writing Prompts</h3>
              <div className="space-y-2">
                {prompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => usePrompt(prompt)}
                    className="w-full text-left text-gray-300 hover:text-cyan-400 text-sm p-2 rounded hover:bg-white/5 transition-all"
                  >
                    • {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Journaling Tips</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>• Be honest with yourself</li>
                <li>• Focus on feelings, not just events</li>
                <li>• Look for patterns and insights</li>
                <li>• Celebrate small victories</li>
                <li>• Practice gratitude daily</li>
                <li>• Write without judgment</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}