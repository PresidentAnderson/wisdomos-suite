'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const LIFE_AREAS = [
  { key: 'work_purpose', label: 'Work & Purpose', icon: '💼', color: 'blue' },
  { key: 'health', label: 'Health', icon: '❤️', color: 'red' },
  { key: 'finance', label: 'Finance', icon: '💰', color: 'green' },
  { key: 'intimacy_love', label: 'Intimacy & Love', icon: '💕', color: 'pink' },
  { key: 'time_energy', label: 'Time & Energy', icon: '⏰', color: 'yellow' },
  { key: 'spiritual_alignment', label: 'Spiritual Alignment', icon: '✨', color: 'purple' },
  { key: 'creativity_expression', label: 'Creativity & Expression', icon: '🎨', color: 'indigo' },
  { key: 'friendship_community', label: 'Friendship & Community', icon: '👥', color: 'cyan' },
  { key: 'learning_growth', label: 'Learning & Growth', icon: '📚', color: 'orange' },
  { key: 'home_environment', label: 'Home & Environment', icon: '🏡', color: 'emerald' },
  { key: 'sexuality', label: 'Sexuality', icon: '🔥', color: 'rose' },
  { key: 'emotional_regulation', label: 'Emotional Regulation', icon: '🧘', color: 'teal' },
  { key: 'legacy_archives', label: 'Legacy & Archives', icon: '📜', color: 'amber' }
];

type Status = 'thriving' | 'attention' | 'collapse';
type Trend = 'up' | 'steady' | 'down';

export default function FulfillmentDashboard() {
  const [areaStatuses, setAreaStatuses] = useState<Record<string, Status>>({});
  const [areaTrends, setAreaTrends] = useState<Record<string, Trend>>({});
  const [todaysCenter, setTodaysCenter] = useState('');
  const [boundaryLogs, setBoundaryLogs] = useState([]);
  const [showResetRitual, setShowResetRitual] = useState(false);
  const [currentRitualStep, setCurrentRitualStep] = useState(0);

  useEffect(() => {
    // Load data from localStorage
    const savedStatuses = JSON.parse(localStorage.getItem('fulfillmentStatuses') || '{}');
    const savedTrends = JSON.parse(localStorage.getItem('fulfillmentTrends') || '{}');
    const savedLogs = JSON.parse(localStorage.getItem('boundaryLogs') || '[]');
    
    // Initialize with default values if empty
    if (Object.keys(savedStatuses).length === 0) {
      const defaultStatuses = {};
      LIFE_AREAS.forEach(area => {
        defaultStatuses[area.key] = 'thriving';
      });
      setAreaStatuses(defaultStatuses);
    } else {
      setAreaStatuses(savedStatuses);
    }
    
    if (Object.keys(savedTrends).length === 0) {
      const defaultTrends = {};
      LIFE_AREAS.forEach(area => {
        defaultTrends[area.key] = 'steady';
      });
      setAreaTrends(defaultTrends);
    } else {
      setAreaTrends(savedTrends);
    }
    
    setBoundaryLogs(savedLogs);
    
    // Calculate today\'s center
    const needsAttention = LIFE_AREAS.find(area => 
      savedStatuses[area.key] === 'collapse' || savedStatuses[area.key] === 'attention'
    );
    setTodaysCenter(needsAttention?.key || 'spiritual_alignment');
  }, []);

  const updateAreaStatus = (areaKey: string, status: Status) => {
    const newStatuses = { ...areaStatuses, [areaKey]: status };
    setAreaStatuses(newStatuses);
    localStorage.setItem('fulfillmentStatuses', JSON.stringify(newStatuses));
  };

  const updateAreaTrend = (areaKey: string, trend: Trend) => {
    const newTrends = { ...areaTrends, [areaKey]: trend };
    setAreaTrends(newTrends);
    localStorage.setItem('fulfillmentTrends', JSON.stringify(newTrends));
  };

  const addBoundaryLog = () => {
    const area = prompt('Which life area needs attention?');
    const drift = prompt('What drift have you observed?');
    const action = prompt('What action will you take?');
    
    if (area && drift && action) {
      const newLog = {
        id: Date.now(),
        date: new Date().toISOString(),
        area,
        drift,
        action
      };
      const newLogs = [newLog, ...boundaryLogs];
      setBoundaryLogs(newLogs);
      localStorage.setItem('boundaryLogs', JSON.stringify(newLogs));
    }
  };

  const resetRitualSteps = [
    { title: 'Pause + Pattern Interrupt', description: 'Take 3 deep breaths. Stand up. Shake your body.' },
    { title: 'Scan for Violation', description: 'Where did the boundary collapse? What pattern emerged?' },
    { title: 'Acknowledge & Forgive', description: 'Honor the intelligence of your response. Release judgment.' },
    { title: 'Recommit', description: 'State your boundary clearly. What will you honor now?' },
    { title: 'Recalibrate', description: 'Adjust your environment. Set new structures for support.' }
  ];

  const getStatusColor = (status: Status) => {
    switch (status) {
      case 'thriving': return 'bg-green-500';
      case 'attention': return 'bg-yellow-500';
      case 'collapse': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTrendIcon = (trend: Trend) => {
    switch (trend) {
      case 'up': return '↑';
      case 'steady': return '→';
      case 'down': return '↓';
      default: return '→';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-white">
              WisdomOS Command Center
            </Link>
            <nav className="flex space-x-6">
              <Link href="/dashboard" className="text-white/70 hover:text-white">Simple</Link>
              <Link href="/dashboard/fulfillment" className="text-cyan-400">Fulfillment</Link>
              <Link href="/autobiography" className="text-white/70 hover:text-white">Autobiography</Link>
              <Link href="/journal" className="text-white/70 hover:text-white">Journal</Link>
            </nav>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Today\'s Center */}
        <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 backdrop-blur-lg rounded-xl p-6 border border-cyan-500/30 mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Today\'s Center</h2>
          <div className="flex items-center space-x-4">
            <div className="text-4xl">
              {LIFE_AREAS.find(a => a.key === todaysCenter)?.icon}
            </div>
            <div>
              <div className="text-xl text-white font-semibold">
                {LIFE_AREAS.find(a => a.key === todaysCenter)?.label}
              </div>
              <div className="text-gray-300">Needs your presence and attention today</div>
            </div>
          </div>
        </div>

        {/* Life Areas Grid - Fulfillment Display */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">13 Life Areas - Fulfillment Display</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {LIFE_AREAS.map(area => {
              const status = areaStatuses[area.key] || 'thriving';
              const trend = areaTrends[area.key] || 'steady';
              
              return (
                <div
                  key={area.key}
                  className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                  onClick={() => setTodaysCenter(area.key)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{area.icon}</span>
                    <span className="text-2xl text-white">{getTrendIcon(trend)}</span>
                  </div>
                  <div className="text-white font-medium mb-2">{area.label}</div>
                  
                  {/* Status Dots */}
                  <div className="flex space-x-1 mb-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateAreaStatus(area.key, 'thriving');
                      }}
                      className={`w-6 h-6 rounded-full ${status === 'thriving' ? 'bg-green-500' : 'bg-green-500/20'}`}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateAreaStatus(area.key, 'attention');
                      }}
                      className={`w-6 h-6 rounded-full ${status === 'attention' ? 'bg-yellow-500' : 'bg-yellow-500/20'}`}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateAreaStatus(area.key, 'collapse');
                      }}
                      className={`w-6 h-6 rounded-full ${status === 'collapse' ? 'bg-red-500' : 'bg-red-500/20'}`}
                    />
                  </div>
                  
                  {/* Trend Buttons */}
                  <div className="flex space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateAreaTrend(area.key, 'up');
                      }}
                      className={`text-xs px-2 py-1 rounded ${trend === 'up' ? 'bg-cyan-500/30 text-cyan-300' : 'bg-white/5 text-gray-400'}`}
                    >
                      ↑
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateAreaTrend(area.key, 'steady');
                      }}
                      className={`text-xs px-2 py-1 rounded ${trend === 'steady' ? 'bg-cyan-500/30 text-cyan-300' : 'bg-white/5 text-gray-400'}`}
                    >
                      →
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateAreaTrend(area.key, 'down');
                      }}
                      className={`text-xs px-2 py-1 rounded ${trend === 'down' ? 'bg-cyan-500/30 text-cyan-300' : 'bg-white/5 text-gray-400'}`}
                    >
                      ↓
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Boundary Audit Log */}
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Boundary Audit Log</h3>
              <button
                onClick={addBoundaryLog}
                className="px-4 py-2 bg-cyan-500/20 text-cyan-300 rounded-lg hover:bg-cyan-500/30"
              >
                + Add Log
              </button>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {boundaryLogs.length === 0 ? (
                <p className="text-gray-400 text-center py-4">No boundary logs yet</p>
              ) : (
                boundaryLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="bg-white/5 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-cyan-400 font-medium">{log.area}</span>
                      <span className="text-gray-500 text-xs">
                        {new Date(log.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-300 mb-1">Drift: {log.drift}</div>
                    <div className="text-sm text-green-400">Action: {log.action}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Commitments & Tolerances */}
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4">Commitments & Tolerances</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-green-400 font-medium mb-2">✅ What\'s Acceptable</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Proactive recovery</li>
                  <li>• Clear deliverables</li>
                  <li>• Structured creativity</li>
                  <li>• Intentional rest</li>
                  <li>• Aligned partnerships</li>
                </ul>
              </div>
              <div>
                <h4 className="text-red-400 font-medium mb-2">❌ No Longer Tolerated</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Chronic interruptions</li>
                  <li>• Chaos as creativity</li>
                  <li>• Unclear expectations</li>
                  <li>• Energy vampires</li>
                  <li>• Postponed self-care</li>
                </ul>
              </div>
            </div>
            <button className="w-full mt-4 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 py-2 rounded-lg transition-colors">
              Recommit to Boundaries
            </button>
          </div>
        </div>

        {/* Boundary Reset Ritual */}
        <div className="mt-8">
          <button
            onClick={() => setShowResetRitual(!showResetRitual)}
            className="w-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30 hover:from-purple-500/30 hover:to-pink-500/30 transition-all"
          >
            <h3 className="text-xl font-semibold text-white mb-2">🔄 Boundary Reset Ritual</h3>
            <p className="text-gray-300">One-click access to your 5-step reset sequence</p>
          </button>
          
          {showResetRitual && (
            <div className="mt-4 bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <div className="space-y-4">
                {resetRitualSteps.map((step, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border transition-all cursor-pointer ${
                      currentRitualStep === index
                        ? 'bg-cyan-500/20 border-cyan-400'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                    onClick={() => setCurrentRitualStep(index)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        currentRitualStep > index ? 'bg-green-500' : 
                        currentRitualStep === index ? 'bg-cyan-500' : 'bg-gray-600'
                      }`}>
                        {currentRitualStep > index ? '✓' : index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium">{step.title}</div>
                        <div className="text-gray-400 text-sm">{step.description}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex space-x-4">
                <button
                  onClick={() => setCurrentRitualStep(Math.max(0, currentRitualStep - 1))}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg"
                  disabled={currentRitualStep === 0}
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentRitualStep(Math.min(4, currentRitualStep + 1))}
                  className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white py-2 rounded-lg"
                  disabled={currentRitualStep === 4}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}