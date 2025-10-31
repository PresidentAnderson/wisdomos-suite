'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  Shield, 
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Activity,
  TrendingDown,
  TrendingUp
} from 'lucide-react';

interface ToxicityArea {
  name: string;
  healthy: string[];
  toxic: string[];
  currentLevel: number; // 0-10 scale (0 = healthy, 10 = toxic)
  trend: 'improving' | 'declining' | 'stable';
}

const LIFE_AREAS: ToxicityArea[] = [
  {
    name: 'Work & Purpose',
    healthy: ['Clear deliverables', 'Integrity', 'Respectful urgency'],
    toxic: ['Emotional labor for unreliable people', 'Chaos disguised as creativity'],
    currentLevel: 3,
    trend: 'improving'
  },
  {
    name: 'Health',
    healthy: ['Mutual accountability', 'Proactive recovery'],
    toxic: ['Ignoring body signals', 'Treating self as last priority'],
    currentLevel: 2,
    trend: 'stable'
  },
  {
    name: 'Finance',
    healthy: ['Transparent records', 'Aligned earnings'],
    toxic: ['Disorganized accounts', 'Passive leaks', 'Overdraft cycles'],
    currentLevel: 4,
    trend: 'declining'
  },
  {
    name: 'Intimacy & Love',
    healthy: ['Presence', 'Honesty', 'Freedom to express'],
    toxic: ['Guilt manipulation', 'Passive-aggression', 'Limbo'],
    currentLevel: 1,
    trend: 'improving'
  },
  {
    name: 'Time & Energy',
    healthy: ['Protected focus blocks', 'Renewal time'],
    toxic: ['Double-booking', 'Chronic interruption'],
    currentLevel: 5,
    trend: 'declining'
  },
  {
    name: 'Spiritual Alignment',
    healthy: ['Sacred silence', 'Inner guidance', 'Creative solitude'],
    toxic: ['Forcing clarity', 'Dismissing intuition'],
    currentLevel: 2,
    trend: 'stable'
  },
  {
    name: 'Creativity',
    healthy: ['Expression without productivity pressure'],
    toxic: ['Creation only on demand', 'Loss of joy'],
    currentLevel: 3,
    trend: 'improving'
  },
  {
    name: 'Friendship',
    healthy: ['Non-transactional love', 'Balance'],
    toxic: ['One-sided venting', 'Role-based exploitation'],
    currentLevel: 2,
    trend: 'stable'
  },
  {
    name: 'Learning & Growth',
    healthy: ['Staying teachable', 'Curious'],
    toxic: ['Rigidity', 'Already knowing', 'Shutting down inquiry'],
    currentLevel: 1,
    trend: 'improving'
  },
  {
    name: 'Home & Environment',
    healthy: ['Organized', 'Inspiring space'],
    toxic: ['Chaos', 'Neglect', 'Energy-draining mess'],
    currentLevel: 3,
    trend: 'stable'
  },
  {
    name: 'Sexuality',
    healthy: ['Honoring erotic self without shame'],
    toxic: ['Shame', 'Avoidance', 'Manipulation of desire'],
    currentLevel: 2,
    trend: 'improving'
  },
  {
    name: 'Emotional Regulation',
    healthy: ['Validation', 'Reparenting', 'Clarity'],
    toxic: ['Collapse', 'Self-abandonment', 'Silencing feelings'],
    currentLevel: 4,
    trend: 'declining'
  },
  {
    name: 'Legacy & Archives',
    healthy: ['Organized systems', 'Documented teachings'],
    toxic: ['Secrecy', 'Avoidance', 'Accidental erasure'],
    currentLevel: 2,
    trend: 'stable'
  }
];

export default function ToxicityChart() {
  const [selectedArea, setSelectedArea] = useState<ToxicityArea | null>(null);
  const [viewMode, setViewMode] = useState<'radar' | 'list' | 'heatmap'>('radar');
  const [expandedAreas, setExpandedAreas] = useState<Set<string>>(new Set());
  const [boundaryResetActive, setBoundaryResetActive] = useState(false);

  // Calculate center point for radar chart
  const centerX = 250;
  const centerY = 250;
  const maxRadius = 200;
  
  // Calculate points for radar chart
  const calculateRadarPoints = () => {
    const angleStep = (2 * Math.PI) / LIFE_AREAS.length;
    
    return LIFE_AREAS.map((area, index) => {
      const angle = index * angleStep - Math.PI / 2; // Start from top
      const radius = (area.currentLevel / 10) * maxRadius;
      
      return {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        labelX: centerX + (maxRadius + 30) * Math.cos(angle),
        labelY: centerY + (maxRadius + 30) * Math.sin(angle),
        area
      };
    });
  };

  const radarPoints = calculateRadarPoints();
  const polygonPoints = radarPoints.map(p => `${p.x},${p.y}`).join(' ');

  const toggleExpanded = (areaName: string) => {
    const newExpanded = new Set(expandedAreas);
    if (newExpanded.has(areaName)) {
      newExpanded.delete(areaName);
    } else {
      newExpanded.add(areaName);
    }
    setExpandedAreas(newExpanded);
  };

  const handleBoundaryReset = () => {
    setBoundaryResetActive(true);
    
    // Simulate boundary reset process
    setTimeout(() => {
      // Reset toxicity levels
      LIFE_AREAS.forEach(area => {
        area.currentLevel = Math.max(0, area.currentLevel - 2);
      });
      setBoundaryResetActive(false);
      alert('Boundaries reset successfully! Toxicity levels reduced.');
    }, 2000);
  };

  const getToxicityColor = (level: number) => {
    if (level <= 3) return 'text-black';
    if (level <= 6) return 'text-black';
    return 'text-black';
  };

  const getToxicityBgColor = (level: number) => {
    if (level <= 3) return 'bg-green-50 border-green-200';
    if (level <= 6) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-phoenix-gold/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-black" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-black">Toxicity Chart</h2>
            <p className="text-sm text-black">Monitor and manage toxic patterns across life areas</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex gap-1 bg-gray-100 rounded p-1">
            <button
              onClick={() => setViewMode('radar')}
              className={`px-3 py-1 rounded text-sm ${viewMode === 'radar' ? 'bg-white shadow' : ''}`}
            >
              Radar
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded text-sm ${viewMode === 'list' ? 'bg-white shadow' : ''}`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('heatmap')}
              className={`px-3 py-1 rounded text-sm ${viewMode === 'heatmap' ? 'bg-white shadow' : ''}`}
            >
              Heatmap
            </button>
          </div>
          
          {/* Boundary Reset Button */}
          <motion.button
            onClick={handleBoundaryReset}
            disabled={boundaryResetActive}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
              px-4 py-2 rounded-lg flex items-center gap-2 transition-all
              ${boundaryResetActive 
                ? 'bg-gray-300 text-black cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-500 to-purple-500 text-black hover:shadow-lg'
              }
            `}
          >
            <RefreshCw className={`w-4 h-4 ${boundaryResetActive ? 'animate-spin' : ''}`} />
            {boundaryResetActive ? 'Resetting...' : 'Boundary Reset'}
          </motion.button>
        </div>
      </div>

      {/* Commitments & Tolerances */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-sm mb-3">Commitments & Tolerances</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-black mb-2 flex items-center gap-1">
              <Shield className="w-4 h-4" />
              What's Acceptable
            </h4>
            <ul className="text-sm space-y-1">
              <li>• Proactive recovery</li>
              <li>• Clear deliverables</li>
              <li>• Structured creativity</li>
              <li>• Intentional rest</li>
              <li>• Aligned partnerships</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-black mb-2 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              No Longer Tolerated
            </h4>
            <ul className="text-sm space-y-1">
              <li>• Chronic interruptions</li>
              <li>• Chaos as creativity</li>
              <li>• Unclear expectations</li>
              <li>• Energy vampires</li>
              <li>• Postponed self-care</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {viewMode === 'radar' && (
        <div className="flex gap-6">
          {/* Radar Chart */}
          <div className="flex-1">
            <svg width="500" height="500" viewBox="0 0 500 500">
              {/* Grid circles */}
              {[0.2, 0.4, 0.6, 0.8, 1].map((scale) => (
                <circle
                  key={scale}
                  cx={centerX}
                  cy={centerY}
                  r={maxRadius * scale}
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
              ))}
              
              {/* Axis lines */}
              {radarPoints.map((point, index) => (
                <line
                  key={index}
                  x1={centerX}
                  y1={centerY}
                  x2={point.labelX}
                  y2={point.labelY}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
              ))}
              
              {/* Danger zones */}
              <circle
                cx={centerX}
                cy={centerY}
                r={maxRadius * 0.3}
                fill="rgba(34, 197, 94, 0.1)"
              />
              <circle
                cx={centerX}
                cy={centerY}
                r={maxRadius * 0.6}
                fill="rgba(251, 191, 36, 0.1)"
              />
              <circle
                cx={centerX}
                cy={centerY}
                r={maxRadius}
                fill="rgba(239, 68, 68, 0.1)"
              />
              
              {/* Data polygon */}
              <motion.polygon
                points={polygonPoints}
                fill="rgba(239, 68, 68, 0.3)"
                stroke="rgba(239, 68, 68, 0.8)"
                strokeWidth="2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
              />
              
              {/* Data points */}
              {radarPoints.map((point, index) => (
                <motion.circle
                  key={index}
                  cx={point.x}
                  cy={point.y}
                  r="6"
                  fill="#ef4444"
                  stroke="white"
                  strokeWidth="2"
                  whileHover={{ scale: 1.5 }}
                  onClick={() => setSelectedArea(point.area)}
                  style={{ cursor: 'pointer' }}
                />
              ))}
              
              {/* Labels */}
              {radarPoints.map((point, index) => (
                <text
                  key={index}
                  x={point.labelX}
                  y={point.labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xs fill-gray-700 font-medium"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedArea(point.area)}
                >
                  {point.area.name.split(' ')[0]}
                </text>
              ))}
            </svg>
          </div>
          
          {/* Selected Area Details */}
          {selectedArea && (
            <div className="w-80 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-3">{selectedArea.name}</h3>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-black">Toxicity Level</span>
                  <span className={`font-bold ${getToxicityColor(selectedArea.currentLevel)}`}>
                    {selectedArea.currentLevel}/10
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      selectedArea.currentLevel <= 3 ? 'bg-green-500' :
                      selectedArea.currentLevel <= 6 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${selectedArea.currentLevel * 10}%` }}
                  />
                </div>
              </div>
              
              <div className="mb-3">
                <h4 className="text-sm font-medium text-black mb-1">Healthy Patterns</h4>
                <ul className="text-xs space-y-1">
                  {selectedArea.healthy.map((item, i) => (
                    <li key={i}>✓ {item}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-black mb-1">Toxic Patterns</h4>
                <ul className="text-xs space-y-1">
                  {selectedArea.toxic.map((item, i) => (
                    <li key={i}>✗ {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {viewMode === 'list' && (
        <div className="space-y-2">
          {LIFE_AREAS.map((area) => (
            <div
              key={area.name}
              className={`p-4 rounded-lg border ${getToxicityBgColor(area.currentLevel)}`}
            >
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleExpanded(area.name)}
              >
                <div className="flex items-center gap-3">
                  <div className={`text-2xl font-bold ${getToxicityColor(area.currentLevel)}`}>
                    {area.currentLevel}
                  </div>
                  <div>
                    <h3 className="font-semibold">{area.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-black">
                      {area.trend === 'improving' && (
                        <>
                          <TrendingUp className="w-4 h-4 text-black" />
                          <span>Improving</span>
                        </>
                      )}
                      {area.trend === 'declining' && (
                        <>
                          <TrendingDown className="w-4 h-4 text-black" />
                          <span>Declining</span>
                        </>
                      )}
                      {area.trend === 'stable' && (
                        <>
                          <Activity className="w-4 h-4 text-black" />
                          <span>Stable</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                {expandedAreas.has(area.name) ? <ChevronUp /> : <ChevronDown />}
              </div>
              
              {expandedAreas.has(area.name) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="mt-4 pt-4 border-t"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-black mb-2">Healthy</h4>
                      <ul className="text-sm space-y-1">
                        {area.healthy.map((item, i) => (
                          <li key={i}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-black mb-2">Toxic</h4>
                      <ul className="text-sm space-y-1">
                        {area.toxic.map((item, i) => (
                          <li key={i}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          ))}
        </div>
      )}

      {viewMode === 'heatmap' && (
        <div className="grid grid-cols-4 gap-2">
          {LIFE_AREAS.map((area) => (
            <motion.div
              key={area.name}
              whileHover={{ scale: 1.05 }}
              className={`
                p-4 rounded-lg text-center cursor-pointer
                ${area.currentLevel <= 3 ? 'bg-green-100 hover:bg-green-200' :
                  area.currentLevel <= 6 ? 'bg-yellow-100 hover:bg-yellow-200' :
                  'bg-red-100 hover:bg-red-200'}
              `}
              onClick={() => setSelectedArea(area)}
            >
              <div className={`text-2xl font-bold mb-1 ${getToxicityColor(area.currentLevel)}`}>
                {area.currentLevel}
              </div>
              <div className="text-xs font-medium">{area.name}</div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}