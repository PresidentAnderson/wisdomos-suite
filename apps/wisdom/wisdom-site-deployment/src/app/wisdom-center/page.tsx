'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function WisdomCenter() {
  const [contributions, setContributions] = useState([]);
  const [autobiographyEntries, setAutobiographyEntries] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [fulfillmentStatuses, setFulfillmentStatuses] = useState({});
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const LIFE_AREAS = [
    { key: 'work_purpose', label: 'Work & Purpose', icon: '💼' },
    { key: 'health', label: 'Health', icon: '❤️' },
    { key: 'finance', label: 'Finance', icon: '💰' },
    { key: 'intimacy_love', label: 'Intimacy & Love', icon: '💕' },
    { key: 'time_energy', label: 'Time & Energy', icon: '⏰' },
    { key: 'spiritual_alignment', label: 'Spiritual', icon: '✨' },
    { key: 'creativity_expression', label: 'Creativity', icon: '🎨' },
    { key: 'friendship_community', label: 'Community', icon: '👥' },
    { key: 'learning_growth', label: 'Learning', icon: '📚' },
    { key: 'home_environment', label: 'Home', icon: '🏡' },
    { key: 'sexuality', label: 'Sexuality', icon: '🔥' },
    { key: 'emotional_regulation', label: 'Emotional', icon: '🧘' },
    { key: 'legacy_archives', label: 'Legacy', icon: '📜' }
  ];

  useEffect(() => {
    // Load all data from localStorage
    setContributions(JSON.parse(localStorage.getItem('contributions') || '[]'));
    setAutobiographyEntries(JSON.parse(localStorage.getItem('autobiographyEntries') || '[]'));
    setRelationships(JSON.parse(localStorage.getItem('relationships') || '[]'));
    setFulfillmentStatuses(JSON.parse(localStorage.getItem('fulfillmentStatuses') || '{}'));
  }, []);

  const calculateAverageScore = (scores) => {
    const values = Object.values(scores);
    return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'thriving': return 'bg-green-500';
      case 'attention': return 'bg-yellow-500';
      case 'collapse': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const yearEntries = autobiographyEntries.filter(e => e.year === selectedYear);
  const yearRange = Array.from({ length: 11 }, (_, i) => selectedYear - 5 + i);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-white">
              WisdomOS Center
            </Link>
            <nav className="flex space-x-4 text-sm">
              <Link href="/dashboard/fulfillment" className="text-white/70 hover:text-white">Fulfillment</Link>
              <Link href="/contribution" className="text-white/70 hover:text-white">Contribution</Link>
              <Link href="/autobiography" className="text-white/70 hover:text-white">Autobiography</Link>
              <Link href="/assessment" className="text-white/70 hover:text-white">Assessment</Link>
              <Link href="/wisdom-center" className="text-cyan-400">Integrated View</Link>
            </nav>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-64px)]">
        {/* Left Sidebar - Contribution Display */}
        <div className="w-80 bg-black/20 backdrop-blur-lg border-r border-white/10 p-4 overflow-y-auto">
          <h3 className="text-lg font-semibold text-white mb-4">Your Contribution</h3>
          <div className="text-sm text-cyan-300 mb-4">You are already enough</div>
          
          <div className="space-y-3">
            {contributions.slice(0, 5).map((contrib, i) => (
              <div key={i} className="bg-white/10 rounded-lg p-3">
                <div className="text-white text-sm mb-1">{contrib.content}</div>
                {contrib.source && (
                  <div className="text-gray-400 text-xs">— {contrib.source}</div>
                )}
              </div>
            ))}
          </div>
          
          <Link href="/contribution">
            <button className="w-full mt-4 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 py-2 rounded-lg transition-colors text-sm">
              View All Contributions →
            </button>
          </Link>
        </div>

        {/* Center - Fulfillment Display */}
        <div className="flex-1 p-6 overflow-y-auto">
          <h2 className="text-2xl font-bold text-white mb-6">Fulfillment Display</h2>
          
          {/* Life Areas Grid */}
          <div className="grid grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
            {LIFE_AREAS.map(area => {
              const status = fulfillmentStatuses[area.key] || 'thriving';
              const areaRelationships = relationships.filter(r => 
                r.lifeArea?.toLowerCase().includes(area.label.toLowerCase())
              );
              
              return (
                <div
                  key={area.key}
                  className="bg-white/5 backdrop-blur-lg rounded-lg p-3 border border-white/10 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl">{area.icon}</span>
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`} />
                  </div>
                  <div className="text-white text-sm font-medium mb-1">{area.label}</div>
                  <div className="text-gray-400 text-xs">
                    {areaRelationships.length} relationships
                  </div>
                </div>
              );
            })}
          </div>

          {/* Relationship Map */}
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-3">Active Relationships</h3>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
              {relationships.slice(0, 6).map(rel => {
                const score = calculateAverageScore(rel.scores || { trust: 3, reliability: 3, openness: 3, growth: 3, reciprocity: 3 });
                return (
                  <div key={rel.id} className="bg-white/5 rounded-lg p-2">
                    <div className="flex items-center justify-between">
                      <span className="text-white text-sm">{rel.name}</span>
                      <span className={`text-sm font-bold ${
                        score >= 4.5 ? 'text-green-400' :
                        score >= 3.5 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {score}
                      </span>
                    </div>
                    <div className="text-gray-500 text-xs">{rel.lifeArea}</div>
                  </div>
                );
              })}
            </div>
            <Link href="/assessment">
              <button className="w-full mt-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 py-2 rounded-lg transition-colors text-sm">
                Manage Relationships →
              </button>
            </Link>
          </div>
        </div>

        {/* Right Sidebar - Assessment Scores */}
        <div className="w-80 bg-black/20 backdrop-blur-lg border-l border-white/10 p-4 overflow-y-auto">
          <h3 className="text-lg font-semibold text-white mb-4">Assessment Overview</h3>
          
          {/* Relationship Health */}
          <div className="mb-6">
            <div className="text-sm text-gray-400 mb-2">Relationship Health</div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-300 text-sm">Thriving</span>
                <span className="text-green-400 font-bold">
                  {relationships.filter(r => calculateAverageScore(r.scores || {}) >= 4.5).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300 text-sm">Healthy</span>
                <span className="text-yellow-400 font-bold">
                  {relationships.filter(r => {
                    const score = calculateAverageScore(r.scores || {});
                    return score >= 3.5 && score < 4.5;
                  }).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300 text-sm">Needs Attention</span>
                <span className="text-red-400 font-bold">
                  {relationships.filter(r => calculateAverageScore(r.scores || {}) < 3.5).length}
                </span>
              </div>
            </div>
          </div>

          {/* Top Relationships */}
          <div className="mb-6">
            <div className="text-sm text-gray-400 mb-2">Top Relationships</div>
            <div className="space-y-2">
              {relationships
                .sort((a, b) => calculateAverageScore(b.scores || {}) - calculateAverageScore(a.scores || {}))
                .slice(0, 3)
                .map(rel => (
                  <div key={rel.id} className="bg-white/5 rounded-lg p-2">
                    <div className="text-white text-sm">{rel.name}</div>
                    <div className="text-gray-400 text-xs">{rel.commitment}</div>
                  </div>
                ))}
            </div>
          </div>

          <Link href="/dashboard/fulfillment">
            <button className="w-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 hover:from-cyan-500/30 hover:to-purple-500/30 text-white py-2 rounded-lg transition-colors text-sm">
              Full Dashboard →
            </button>
          </Link>
        </div>
      </div>

      {/* Bottom Timeline - Autobiography */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/30 backdrop-blur-lg border-t border-white/10 p-4">
        <div className="container mx-auto">
          <div className="flex items-center space-x-4">
            <h3 className="text-white font-semibold">Timeline</h3>
            <div className="flex-1 flex items-center space-x-2 overflow-x-auto">
              {yearRange.map(year => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`px-3 py-1 rounded-lg text-sm whitespace-nowrap transition-all ${
                    year === selectedYear
                      ? 'bg-cyan-500 text-white'
                      : year === new Date().getFullYear()
                      ? 'bg-purple-500/30 text-purple-300'
                      : 'bg-white/10 text-gray-400 hover:bg-white/20'
                  }`}
                >
                  {year}
                  {yearEntries.length > 0 && year === selectedYear && (
                    <span className="ml-1 text-xs">({yearEntries.length})</span>
                  )}
                </button>
              ))}
            </div>
            <Link href={`/autobiography/${selectedYear}`}>
              <button className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 px-4 py-1 rounded-lg text-sm">
                View {selectedYear} →
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}