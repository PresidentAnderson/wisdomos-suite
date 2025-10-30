'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Relationship {
  id: number;
  name: string;
  lifeArea: string;
  commitment: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  lastContact: string;
  scores: {
    trust: number;
    reliability: number;
    openness: number;
    growth: number;
    reciprocity: number;
  };
  outcomes: string[];
  notes: string;
}

const LIFE_AREAS = [
  'Work & Purpose',
  'Health',
  'Finance',
  'Intimacy & Love',
  'Time & Energy',
  'Spiritual Alignment',
  'Creativity & Expression',
  'Friendship & Community',
  'Learning & Growth',
  'Home & Environment',
  'Sexuality',
  'Emotional Regulation',
  'Legacy & Archives'
];

export default function AssessmentTool() {
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [selectedRelationship, setSelectedRelationship] = useState<Relationship | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [filterArea, setFilterArea] = useState('all');
  const [newRelationship, setNewRelationship] = useState({
    name: '',
    lifeArea: LIFE_AREAS[0],
    commitment: '',
    frequency: 'weekly',
    outcomes: ''
  });

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('relationships') || '[]');
    if (saved.length === 0) {
      // Sample data
      const samples: Relationship[] = [
        {
          id: 1,
          name: 'Sarah (Mentor)',
          lifeArea: 'Learning & Growth',
          commitment: 'Monthly wisdom sessions',
          frequency: 'monthly',
          lastContact: '2024-08-10',
          scores: { trust: 5, reliability: 5, openness: 4, growth: 5, reciprocity: 4 },
          outcomes: ['Career guidance', 'Personal insights', 'Network expansion'],
          notes: 'Deep conversations about life direction'
        },
        {
          id: 2,
          name: 'Team at Work',
          lifeArea: 'Work & Purpose',
          commitment: 'Collaborative projects',
          frequency: 'daily',
          lastContact: '2024-08-21',
          scores: { trust: 4, reliability: 4, openness: 3, growth: 4, reciprocity: 4 },
          outcomes: ['Project completion', 'Skill development', 'Recognition'],
          notes: 'Strong professional alignment'
        }
      ];
      setRelationships(samples);
      localStorage.setItem('relationships', JSON.stringify(samples));
    } else {
      setRelationships(saved);
    }
  }, []);

  const calculateAverageScore = (scores: Relationship['scores']) => {
    const values = Object.values(scores);
    return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
  };

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return 'text-green-400';
    if (score >= 3.5) return 'text-yellow-400';
    return 'text-red-400';
  };

  const addRelationship = () => {
    const relationship: Relationship = {
      id: Date.now(),
      name: newRelationship.name,
      lifeArea: newRelationship.lifeArea,
      commitment: newRelationship.commitment,
      frequency: newRelationship.frequency as Relationship['frequency'],
      lastContact: new Date().toISOString().split('T')[0],
      scores: { trust: 3, reliability: 3, openness: 3, growth: 3, reciprocity: 3 },
      outcomes: newRelationship.outcomes.split(',').map(o => o.trim()).filter(Boolean),
      notes: ''
    };
    
    const updated = [...relationships, relationship];
    setRelationships(updated);
    localStorage.setItem('relationships', JSON.stringify(updated));
    
    setNewRelationship({
      name: '',
      lifeArea: LIFE_AREAS[0],
      commitment: '',
      frequency: 'weekly',
      outcomes: ''
    });
    setIsAdding(false);
  };

  const updateScore = (relId: number, scoreType: keyof Relationship['scores'], value: number) => {
    const updated = relationships.map(rel => {
      if (rel.id === relId) {
        return {
          ...rel,
          scores: { ...rel.scores, [scoreType]: value }
        };
      }
      return rel;
    });
    setRelationships(updated);
    localStorage.setItem('relationships', JSON.stringify(updated));
    
    if (selectedRelationship?.id === relId) {
      const updatedRel = updated.find(r => r.id === relId);
      if (updatedRel) setSelectedRelationship(updatedRel);
    }
  };

  const deleteRelationship = (id: number) => {
    const updated = relationships.filter(r => r.id !== id);
    setRelationships(updated);
    localStorage.setItem('relationships', JSON.stringify(updated));
    if (selectedRelationship?.id === id) setSelectedRelationship(null);
  };

  const filteredRelationships = filterArea === 'all'
    ? relationships
    : relationships.filter(r => r.lifeArea === filterArea);

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
              <Link href="/contribution" className="text-white/70 hover:text-white">Contribution</Link>
              <Link href="/autobiography" className="text-white/70 hover:text-white">Autobiography</Link>
              <Link href="/assessment" className="text-cyan-400">Assessment</Link>
            </nav>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Relationship Assessment Tool</h1>
          <p className="text-gray-300 text-lg">
            Measure the health and fulfillment potential of your relationships
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Relationships List */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">Relationships</h3>
                <button
                  onClick={() => setIsAdding(true)}
                  className="px-4 py-2 bg-cyan-500/20 text-cyan-300 rounded-lg hover:bg-cyan-500/30"
                >
                  + Add
                </button>
              </div>

              {/* Filter */}
              <select
                value={filterArea}
                onChange={(e) => setFilterArea(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white mb-4"
              >
                <option value="all">All Life Areas</option>
                {LIFE_AREAS.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>

              {/* List */}
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredRelationships.map(rel => {
                  const avgScore = calculateAverageScore(rel.scores);
                  return (
                    <button
                      key={rel.id}
                      onClick={() => setSelectedRelationship(rel)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        selectedRelationship?.id === rel.id
                          ? 'bg-cyan-500/20 border border-cyan-400'
                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white font-medium">{rel.name}</div>
                          <div className="text-gray-400 text-xs">{rel.lifeArea}</div>
                        </div>
                        <div className={`text-2xl font-bold ${getScoreColor(parseFloat(avgScore))}`}>
                          {avgScore}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Detail View */}
          <div className="lg:col-span-2">
            {selectedRelationship ? (
              <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedRelationship.name}</h2>
                    <p className="text-gray-400">{selectedRelationship.lifeArea}</p>
                  </div>
                  <button
                    onClick={() => deleteRelationship(selectedRelationship.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>
                </div>

                {/* Commitment & Frequency */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="text-cyan-400 text-sm mb-1">Commitment</div>
                    <div className="text-white">{selectedRelationship.commitment}</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="text-purple-400 text-sm mb-1">Contact Frequency</div>
                    <div className="text-white capitalize">{selectedRelationship.frequency}</div>
                  </div>
                </div>

                {/* Scores */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Quality Scores</h3>
                  <div className="space-y-3">
                    {Object.entries(selectedRelationship.scores).map(([key, value]) => (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-gray-300 capitalize">{key}</span>
                          <span className={`font-bold ${getScoreColor(value)}`}>{value}/5</span>
                        </div>
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map(score => (
                            <button
                              key={score}
                              onClick={() => updateScore(selectedRelationship.id, key as keyof Relationship['scores'], score)}
                              className={`flex-1 h-2 rounded-full transition-all ${
                                score <= value ? 'bg-cyan-500' : 'bg-white/20'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Outcomes */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Expected Outcomes</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedRelationship.outcomes.map((outcome, i) => (
                      <span key={i} className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm">
                        {outcome}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Overall Assessment */}
                <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-lg p-4">
                  <div className="text-white font-medium mb-2">Overall Assessment</div>
                  <div className="flex items-center space-x-4">
                    <div className={`text-3xl font-bold ${getScoreColor(parseFloat(calculateAverageScore(selectedRelationship.scores)))}`}>
                      {calculateAverageScore(selectedRelationship.scores)}
                    </div>
                    <div className="text-gray-300">
                      {parseFloat(calculateAverageScore(selectedRelationship.scores)) >= 4.5 && 'Thriving relationship'}
                      {parseFloat(calculateAverageScore(selectedRelationship.scores)) >= 3.5 && parseFloat(calculateAverageScore(selectedRelationship.scores)) < 4.5 && 'Healthy with growth potential'}
                      {parseFloat(calculateAverageScore(selectedRelationship.scores)) < 3.5 && 'Needs attention and care'}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/5 backdrop-blur-lg rounded-xl p-12 border border-white/10 text-center">
                <p className="text-gray-400">Select a relationship to view and assess</p>
              </div>
            )}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
            <div className="text-3xl font-bold text-white">{relationships.length}</div>
            <div className="text-gray-400">Total Relationships</div>
          </div>
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
            <div className="text-3xl font-bold text-green-400">
              {relationships.filter(r => parseFloat(calculateAverageScore(r.scores)) >= 4.5).length}
            </div>
            <div className="text-gray-400">Thriving</div>
          </div>
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
            <div className="text-3xl font-bold text-yellow-400">
              {relationships.filter(r => {
                const score = parseFloat(calculateAverageScore(r.scores));
                return score >= 3.5 && score < 4.5;
              }).length}
            </div>
            <div className="text-gray-400">Healthy</div>
          </div>
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
            <div className="text-3xl font-bold text-red-400">
              {relationships.filter(r => parseFloat(calculateAverageScore(r.scores)) < 3.5).length}
            </div>
            <div className="text-gray-400">Needs Attention</div>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 rounded-xl p-6 max-w-md w-full border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4">Add Relationship</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white mb-2">Name</label>
                <input
                  type="text"
                  value={newRelationship.name}
                  onChange={(e) => setNewRelationship({ ...newRelationship, name: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                  placeholder="Person or group name"
                />
              </div>

              <div>
                <label className="block text-white mb-2">Life Area</label>
                <select
                  value={newRelationship.lifeArea}
                  onChange={(e) => setNewRelationship({ ...newRelationship, lifeArea: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                >
                  {LIFE_AREAS.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white mb-2">Commitment</label>
                <input
                  type="text"
                  value={newRelationship.commitment}
                  onChange={(e) => setNewRelationship({ ...newRelationship, commitment: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                  placeholder="What's your commitment here?"
                />
              </div>

              <div>
                <label className="block text-white mb-2">Contact Frequency</label>
                <select
                  value={newRelationship.frequency}
                  onChange={(e) => setNewRelationship({ ...newRelationship, frequency: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                </select>
              </div>

              <div>
                <label className="block text-white mb-2">Expected Outcomes (comma separated)</label>
                <input
                  type="text"
                  value={newRelationship.outcomes}
                  onChange={(e) => setNewRelationship({ ...newRelationship, outcomes: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                  placeholder="Support, growth, collaboration..."
                />
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={addRelationship}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 text-white py-2 rounded-lg"
                >
                  Add
                </button>
                <button
                  onClick={() => setIsAdding(false)}
                  className="flex-1 bg-white/10 text-white py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}