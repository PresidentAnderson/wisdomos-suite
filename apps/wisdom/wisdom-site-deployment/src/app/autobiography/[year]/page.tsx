'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const LIFE_AREAS = [
  { key: 'work_purpose', label: 'Work & Purpose', icon: '💼' },
  { key: 'health', label: 'Health', icon: '❤️' },
  { key: 'finance', label: 'Finance', icon: '💰' },
  { key: 'intimacy_love', label: 'Intimacy & Love', icon: '💕' },
  { key: 'time_energy', label: 'Time & Energy Management', icon: '⏰' },
  { key: 'spiritual_alignment', label: 'Spiritual Alignment', icon: '✨' },
  { key: 'creativity_expression', label: 'Creativity & Expression', icon: '🎨' },
  { key: 'friendship_community', label: 'Friendship & Community', icon: '👥' },
  { key: 'learning_growth', label: 'Learning & Growth', icon: '📚' },
  { key: 'home_environment', label: 'Home & Environment', icon: '🏡' },
  { key: 'sexuality', label: 'Sexuality', icon: '🔥' },
  { key: 'emotional_regulation', label: 'Emotional Regulation & Inner Child', icon: '🧘' },
  { key: 'legacy_archives', label: 'Legacy & Archives', icon: '📜' }
];

export default function YearPage({ params }: { params: { year: string } }) {
  const router = useRouter();
  const year = parseInt(params.year, 10);
  const [entries, setEntries] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEntry, setCurrentEntry] = useState({
    title: '',
    narrative: '',
    earliest: '',
    insight: '',
    commitment: '',
    tags: '',
    lifeAreas: []
  });

  useEffect(() => {
    // Load entries for this year from localStorage
    const allEntries = JSON.parse(localStorage.getItem('autobiographyEntries') || '[]');
    const yearEntries = allEntries.filter(e => e.year === year);
    setEntries(yearEntries);
  }, [year]);

  const toggleLifeArea = (key: string) => {
    setCurrentEntry(prev => ({
      ...prev,
      lifeAreas: prev.lifeAreas.includes(key)
        ? prev.lifeAreas.filter(x => x !== key)
        : [...prev.lifeAreas, key]
    }));
  };

  const saveEntry = () => {
    const allEntries = JSON.parse(localStorage.getItem('autobiographyEntries') || '[]');
    const newEntry = {
      id: Date.now(),
      year,
      ...currentEntry,
      tags: currentEntry.tags.split(',').map(s => s.trim()).filter(Boolean),
      createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('autobiographyEntries', JSON.stringify([...allEntries, newEntry]));
    setEntries([...entries, newEntry]);
    
    // Reset form
    setCurrentEntry({
      title: '',
      narrative: '',
      earliest: '',
      insight: '',
      commitment: '',
      tags: '',
      lifeAreas: []
    });
    setIsEditing(false);
  };

  const deleteEntry = (id: number) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      const allEntries = JSON.parse(localStorage.getItem('autobiographyEntries') || '[]');
      const filtered = allEntries.filter(e => e.id !== id);
      localStorage.setItem('autobiographyEntries', JSON.stringify(filtered));
      setEntries(entries.filter(e => e.id !== id));
    }
  };

  const currentYear = new Date().getFullYear();
  const age = year <= currentYear ? currentYear - year : null;

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
              <Link href="/journal" className="text-white/70 hover:text-white">Journal</Link>
              <Link href="/goals" className="text-white/70 hover:text-white">Goals</Link>
              <Link href="/autobiography" className="text-cyan-400">Autobiography</Link>
              <Link href="/library" className="text-white/70 hover:text-white">Library</Link>
            </nav>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/autobiography" className="text-cyan-400 hover:text-cyan-300">
            ← Back to Years
          </Link>
          <div className="flex space-x-2">
            <Link href={`/autobiography/${year - 1}`}>
              <button className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20">
                ← {year - 1}
              </button>
            </Link>
            <Link href={`/autobiography/${year + 1}`}>
              <button className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20">
                {year + 1} →
              </button>
            </Link>
          </div>
        </div>

        {/* Year Header */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            {year} — Autobiography
            {age !== null && age >= 0 && (
              <span className="text-xl text-gray-400 ml-4">Age {age}</span>
            )}
          </h1>
          <p className="text-gray-300">
            Capture the year, earliest similar occurrence, what you made it mean back then, and your new commitment.
            Tag relevant Life Areas to reflect in your Fulfillment Display.
          </p>
        </div>

        {/* Entry Form */}
        {isEditing && (
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">New Entry for {year}</h2>
            
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-white mb-2">Title</label>
                <input
                  type="text"
                  value={currentEntry.title}
                  onChange={(e) => setCurrentEntry({ ...currentEntry, title: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400"
                  placeholder="Give this entry a title..."
                />
              </div>

              {/* Year Narrative */}
              <div>
                <label className="block text-white mb-2">Year Narrative</label>
                <textarea
                  value={currentEntry.narrative}
                  onChange={(e) => setCurrentEntry({ ...currentEntry, narrative: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 h-32"
                  placeholder="What happened this year? What were the significant events, experiences, and learnings?"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Earliest Occurrence */}
                <div>
                  <label className="block text-white mb-2">Earliest Similar Occurrence</label>
                  <textarea
                    value={currentEntry.earliest}
                    onChange={(e) => setCurrentEntry({ ...currentEntry, earliest: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 h-24"
                    placeholder="When did something similar happen before? What are the facts?"
                  />
                </div>

                {/* What I Made It Mean */}
                <div>
                  <label className="block text-white mb-2">What I Made It Mean / Insight</label>
                  <textarea
                    value={currentEntry.insight}
                    onChange={(e) => setCurrentEntry({ ...currentEntry, insight: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 h-24"
                    placeholder="What meaning did I give it then? What was my intelligent response?"
                  />
                </div>
              </div>

              {/* My Commitment */}
              <div>
                <label className="block text-white mb-2">My Commitment (New Way of Being)</label>
                <textarea
                  value={currentEntry.commitment}
                  onChange={(e) => setCurrentEntry({ ...currentEntry, commitment: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 h-24"
                  placeholder="Who do I choose to be now? What is my new commitment and way of being?"
                />
              </div>

              {/* Life Areas */}
              <div>
                <label className="block text-white mb-2">Link to Life Areas (Fulfillment Display)</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {LIFE_AREAS.map(area => (
                    <button
                      key={area.key}
                      type="button"
                      onClick={() => toggleLifeArea(area.key)}
                      className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                        currentEntry.lifeAreas.includes(area.key)
                          ? 'bg-cyan-500/30 border-cyan-400 text-white'
                          : 'bg-white/5 border-white/20 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <span className="mr-1">{area.icon}</span>
                      {area.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-white mb-2">Tags (comma separated)</label>
                <input
                  type="text"
                  value={currentEntry.tags}
                  onChange={(e) => setCurrentEntry({ ...currentEntry, tags: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400"
                  placeholder="people, places, events, themes..."
                />
              </div>

              {/* Actions */}
              <div className="flex space-x-4">
                <button
                  onClick={saveEntry}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:from-cyan-600 hover:to-purple-600"
                >
                  Save Entry
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Entry Button */}
        {!isEditing && (
          <div className="mb-8">
            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:from-cyan-600 hover:to-purple-600"
            >
              + Add Entry for {year}
            </button>
          </div>
        )}

        {/* Entries List */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-white">Entries</h2>
          {entries.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10 text-center">
              <p className="text-gray-400">No entries for {year} yet.</p>
              <p className="text-gray-500 text-sm mt-2">Click "Add Entry" to create your first entry for this year.</p>
            </div>
          ) : (
            entries.map((entry) => (
              <article key={entry.id} className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">{entry.title || '(Untitled)'}</h3>
                  <button
                    onClick={() => deleteEntry(entry.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>
                </div>
                
                <div className="text-gray-300 whitespace-pre-wrap mb-4">{entry.narrative}</div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-cyan-400 font-medium mb-1">Earliest Occurrence</div>
                    <div className="text-gray-300 text-sm">{entry.earliest || '—'}</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-purple-400 font-medium mb-1">Insight Then</div>
                    <div className="text-gray-300 text-sm">{entry.insight || '—'}</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-green-400 font-medium mb-1">Commitment Now</div>
                    <div className="text-gray-300 text-sm">{entry.commitment || '—'}</div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {entry.lifeAreas?.map(areaKey => {
                    const area = LIFE_AREAS.find(a => a.key === areaKey);
                    return area ? (
                      <span key={areaKey} className="bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded-md text-xs">
                        {area.icon} {area.label}
                      </span>
                    ) : null;
                  })}
                  {entry.tags?.map((tag, i) => (
                    <span key={i} className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded-md text-xs">
                      #{tag}
                    </span>
                  ))}
                </div>
                
                <div className="text-gray-500 text-xs mt-4">
                  Created: {new Date(entry.createdAt).toLocaleDateString()}
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}