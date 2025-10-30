'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Journal() {
  const router = useRouter();
  const [journalEntries, setJournalEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Load entries from localStorage
    const loadedEntries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
    
    // If no entries, use sample data
    if (loadedEntries.length === 0) {
      const sampleEntries = [
        {
          id: 1,
          date: '2024-08-21',
          title: 'Finding Balance in Chaos',
          content: 'Today I realized that true wisdom comes not from avoiding challenges, but from learning to maintain inner peace amidst them...',
          mood: 'reflective',
          tags: ['mindfulness', 'growth', 'balance'],
          wisdomPoints: 15
        },
        {
          id: 2,
          date: '2024-08-20',
          title: 'The Power of Small Steps',
          content: 'Every journey begins with a single step. Today I took mine by starting my morning meditation practice...',
          mood: 'motivated',
          tags: ['meditation', 'habits', 'progress'],
          wisdomPoints: 12
        },
        {
          id: 3,
          date: '2024-08-19',
          title: 'Lessons from Nature',
          content: 'Watching the trees sway in the wind today reminded me of the importance of flexibility and resilience...',
          mood: 'peaceful',
          tags: ['nature', 'resilience', 'observation'],
          wisdomPoints: 18
        }
      ];
      localStorage.setItem('journalEntries', JSON.stringify(sampleEntries));
      setJournalEntries(sampleEntries);
    } else {
      setJournalEntries(loadedEntries);
    }
  }, []);

  const moods = ['Happy', 'Peaceful', 'Reflective', 'Motivated', 'Grateful', 'Challenged'];

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
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Wisdom Journal</h1>
            <p className="text-gray-400">Document your journey of self-discovery</p>
          </div>
          <Link href="/journal/new">
            <button className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-cyan-600 hover:to-purple-600 transition-all">
              + New Entry
            </button>
          </Link>
        </div>

        {/* Search and Filter */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Search entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
            />
            <select className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-400">
              <option value="">All Moods</option>
              {moods.map(mood => (
                <option key={mood} value={mood}>{mood}</option>
              ))}
            </select>
            <select className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-400">
              <option value="">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>

        {/* Journal Entries Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Entries List */}
          <div className="lg:col-span-2 space-y-4">
            {journalEntries.map(entry => (
              <Link 
                key={entry.id}
                href={`/journal/${entry.id}`}
                className="block bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:bg-white/10 cursor-pointer transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-1">{entry.title}</h3>
                    <p className="text-gray-400 text-sm">{new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-yellow-400">⭐</span>
                    <span className="text-white font-semibold">{entry.wisdomPoints}</span>
                  </div>
                </div>
                
                <p className="text-gray-300 mb-4 line-clamp-2">{entry.content}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {entry.tags.map(tag => (
                      <span key={tag} className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded-md text-xs">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <span className="bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full text-sm capitalize">
                    {entry.mood}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Writing Prompts */}
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Today\'s Prompts</h3>
              <ul className="space-y-3">
                <li className="text-gray-300 hover:text-cyan-400 cursor-pointer">
                  • What lesson did today teach you?
                </li>
                <li className="text-gray-300 hover:text-cyan-400 cursor-pointer">
                  • Describe a moment of gratitude
                </li>
                <li className="text-gray-300 hover:text-cyan-400 cursor-pointer">
                  • What challenged you today?
                </li>
                <li className="text-gray-300 hover:text-cyan-400 cursor-pointer">
                  • How did you grow today?
                </li>
              </ul>
            </div>

            {/* Stats */}
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Journal Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Entries</span>
                  <span className="text-white font-semibold">47</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">This Month</span>
                  <span className="text-white font-semibold">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Wisdom Points</span>
                  <span className="text-yellow-400 font-semibold">523</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Current Streak</span>
                  <span className="text-green-400 font-semibold">7 days</span>
                </div>
              </div>
            </div>

            {/* Mood Tracker */}
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Mood Trends</h3>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <div className="text-2xl mb-1">😊</div>
                  <div className="text-xs text-gray-400">Happy</div>
                  <div className="text-sm text-white font-semibold">32%</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">🧘</div>
                  <div className="text-xs text-gray-400">Peaceful</div>
                  <div className="text-sm text-white font-semibold">28%</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">💪</div>
                  <div className="text-xs text-gray-400">Motivated</div>
                  <div className="text-sm text-white font-semibold">40%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}