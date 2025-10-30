'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Contribution {
  id: number;
  type: 'strength' | 'acknowledgment' | 'natural' | 'quote';
  content: string;
  source?: string;
  date?: string;
  tags?: string[];
  color?: string;
}

export default function ContributionDisplay() {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newContribution, setNewContribution] = useState({
    type: 'strength',
    content: '',
    source: '',
    tags: ''
  });

  const colors = [
    'bg-gradient-to-br from-cyan-400 to-blue-500',
    'bg-gradient-to-br from-purple-400 to-pink-500',
    'bg-gradient-to-br from-green-400 to-emerald-500',
    'bg-gradient-to-br from-yellow-400 to-orange-500',
    'bg-gradient-to-br from-rose-400 to-red-500',
    'bg-gradient-to-br from-indigo-400 to-purple-500'
  ];

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('contributions') || '[]');
    if (saved.length === 0) {
      // Default contributions
      const defaults: Contribution[] = [
        {
          id: 1,
          type: 'strength',
          content: 'Deep listener who creates space for others to discover themselves',
          source: 'Team feedback',
          tags: ['listening', 'empathy'],
          color: colors[0]
        },
        {
          id: 2,
          type: 'acknowledgment',
          content: 'You have a gift for seeing patterns others miss',
          source: 'Mentor',
          date: '2024-08-15',
          tags: ['vision', 'insight'],
          color: colors[1]
        },
        {
          id: 3,
          type: 'natural',
          content: 'Bringing order to chaos without forcing structure',
          tags: ['organization', 'flow'],
          color: colors[2]
        },
        {
          id: 4,
          type: 'quote',
          content: 'Your presence alone shifts the energy in the room',
          source: 'Workshop participant',
          tags: ['presence', 'energy'],
          color: colors[3]
        }
      ];
      setContributions(defaults);
      localStorage.setItem('contributions', JSON.stringify(defaults));
    } else {
      setContributions(saved);
    }
  }, []);

  const addContribution = () => {
    const contribution: Contribution = {
      id: Date.now(),
      type: newContribution.type as Contribution['type'],
      content: newContribution.content,
      source: newContribution.source,
      date: new Date().toISOString(),
      tags: newContribution.tags.split(',').map(t => t.trim()).filter(Boolean),
      color: colors[Math.floor(Math.random() * colors.length)]
    };
    
    const updated = [...contributions, contribution];
    setContributions(updated);
    localStorage.setItem('contributions', JSON.stringify(updated));
    
    setNewContribution({ type: 'strength', content: '', source: '', tags: '' });
    setIsAdding(false);
  };

  const deleteContribution = (id: number) => {
    const updated = contributions.filter(c => c.id !== id);
    setContributions(updated);
    localStorage.setItem('contributions', JSON.stringify(updated));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'strength': return '💪';
      case 'acknowledgment': return '🙏';
      case 'natural': return '✨';
      case 'quote': return '💬';
      default: return '⭐';
    }
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
              <Link href="/contribution" className="text-cyan-400">Contribution</Link>
              <Link href="/autobiography" className="text-white/70 hover:text-white">Autobiography</Link>
              <Link href="/assessment" className="text-white/70 hover:text-white">Assessment</Link>
            </nav>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Your Contribution Display</h1>
          <p className="text-gray-300 text-lg">
            You are a natural contribution. These are the gifts you bring simply by being yourself.
          </p>
        </div>

        {/* Core Message */}
        <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 backdrop-blur-lg rounded-xl p-8 border border-cyan-500/30 mb-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">You Are Already Enough</h2>
          <p className="text-xl text-gray-200">
            Your contribution exists not in what you do, but in who you are being.
          </p>
        </div>

        {/* Contribution Board */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold text-white">Your Natural Contributions</h3>
            <button
              onClick={() => setIsAdding(true)}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:from-cyan-600 hover:to-purple-600"
            >
              + Add Contribution
            </button>
          </div>

          {/* Masonry Grid */}
          <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
            {contributions.map((contribution) => (
              <div
                key={contribution.id}
                className={`break-inside-avoid ${contribution.color || 'bg-gradient-to-br from-purple-400 to-pink-500'} rounded-xl p-6 text-white shadow-lg hover:scale-105 transition-transform cursor-pointer relative group`}
              >
                <button
                  onClick={() => deleteContribution(contribution.id)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/70"
                >
                  ×
                </button>
                
                <div className="text-3xl mb-3">{getTypeIcon(contribution.type)}</div>
                <div className="font-medium text-lg mb-2">{contribution.content}</div>
                
                {contribution.source && (
                  <div className="text-sm opacity-90 mt-3">— {contribution.source}</div>
                )}
                
                {contribution.tags && contribution.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {contribution.tags.map((tag, i) => (
                      <span key={i} className="bg-white/20 px-2 py-1 rounded-md text-xs">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Add Form */}
        {isAdding && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 rounded-xl p-6 max-w-md w-full border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4">Add Contribution</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-white mb-2">Type</label>
                  <select
                    value={newContribution.type}
                    onChange={(e) => setNewContribution({ ...newContribution, type: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                  >
                    <option value="strength">Strength</option>
                    <option value="acknowledgment">Acknowledgment</option>
                    <option value="natural">Natural Gift</option>
                    <option value="quote">Quote About You</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white mb-2">Content</label>
                  <textarea
                    value={newContribution.content}
                    onChange={(e) => setNewContribution({ ...newContribution, content: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 h-24"
                    placeholder="What contribution do you want to capture?"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Source (optional)</label>
                  <input
                    type="text"
                    value={newContribution.source}
                    onChange={(e) => setNewContribution({ ...newContribution, source: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400"
                    placeholder="Who said this? When?"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={newContribution.tags}
                    onChange={(e) => setNewContribution({ ...newContribution, tags: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400"
                    placeholder="leadership, empathy, creativity..."
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={addContribution}
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 text-white py-2 rounded-lg hover:from-cyan-600 hover:to-purple-600"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setIsAdding(false)}
                    className="flex-1 bg-white/10 text-white py-2 rounded-lg hover:bg-white/20"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Categories Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
            <div className="text-2xl mb-2">💪</div>
            <div className="text-white font-medium">Core Strengths</div>
            <div className="text-gray-400 text-sm">
              {contributions.filter(c => c.type === 'strength').length} identified
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
            <div className="text-2xl mb-2">🙏</div>
            <div className="text-white font-medium">Acknowledgments</div>
            <div className="text-gray-400 text-sm">
              {contributions.filter(c => c.type === 'acknowledgment').length} received
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
            <div className="text-2xl mb-2">✨</div>
            <div className="text-white font-medium">Natural Gifts</div>
            <div className="text-gray-400 text-sm">
              {contributions.filter(c => c.type === 'natural').length} recognized
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
            <div className="text-2xl mb-2">💬</div>
            <div className="text-white font-medium">Quotes</div>
            <div className="text-gray-400 text-sm">
              {contributions.filter(c => c.type === 'quote').length} captured
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}