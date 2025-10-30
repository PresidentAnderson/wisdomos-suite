'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, X, Edit2, Save, Download, Camera, Users, 
  Circle, Target, TrendingUp, Calendar, RotateCcw,
  PenTool, Layers, BarChart3, Heart, Home, Briefcase,
  DollarSign, Stethoscope, BookOpen, Palette, Gamepad2,
  TreePine, Users2, Sparkles, User, Settings
} from 'lucide-react';

interface Person {
  id: string;
  name: string;
  relationship: string;
  frequency: number; // 1-10 scale
  description?: string;
}

interface LifeArea {
  id: string;
  name: string;
  icon: string;
  color: string;
  people: Person[];
  commitment: number; // 1-10 scale
  satisfaction: number; // 1-10 scale
  notes: string;
  lastUpdated: Date;
}

interface Snapshot {
  id: string;
  date: Date;
  lifeAreas: LifeArea[];
  monthlyReflection: string;
  keyInsights: string[];
}

const DEFAULT_LIFE_AREAS: Omit<LifeArea, 'people' | 'lastUpdated'>[] = [
  { id: 'health', name: 'Health', icon: 'Stethoscope', color: '#10B981', commitment: 5, satisfaction: 5, notes: '' },
  { id: 'finance', name: 'Finance', icon: 'DollarSign', color: '#F59E0B', commitment: 5, satisfaction: 5, notes: '' },
  { id: 'intimacy', name: 'Intimacy', icon: 'Heart', color: '#EC4899', commitment: 5, satisfaction: 5, notes: '' },
  { id: 'partnership', name: 'Partnership', icon: 'Users', color: '#8B5CF6', commitment: 5, satisfaction: 5, notes: '' },
  { id: 'family', name: 'Family', icon: 'Home', color: '#06B6D4', commitment: 5, satisfaction: 5, notes: '' },
  { id: 'friends', name: 'Friends', icon: 'Users2', color: '#84CC16', commitment: 5, satisfaction: 5, notes: '' },
  { id: 'career', name: 'Career', icon: 'Briefcase', color: '#3B82F6', commitment: 5, satisfaction: 5, notes: '' },
  { id: 'creativity', name: 'Creativity', icon: 'Palette', color: '#F97316', commitment: 5, satisfaction: 5, notes: '' },
  { id: 'recreation', name: 'Recreation', icon: 'Gamepad2', color: '#EF4444', commitment: 5, satisfaction: 5, notes: '' },
  { id: 'environment', name: 'Environment', icon: 'TreePine', color: '#22C55E', commitment: 5, satisfaction: 5, notes: '' },
  { id: 'community', name: 'Community', icon: 'Users2', color: '#A855F7', commitment: 5, satisfaction: 5, notes: '' },
  { id: 'spirituality', name: 'Spirituality', icon: 'Sparkles', color: '#6366F1', commitment: 5, satisfaction: 5, notes: '' },
  { id: 'personal-growth', name: 'Personal Growth', icon: 'TrendingUp', color: '#14B8A6', commitment: 5, satisfaction: 5, notes: '' }
];

const iconMap: { [key: string]: any } = {
  Stethoscope, DollarSign, Heart, Users, Home, Users2, Briefcase,
  Palette, Gamepad2, TreePine, Sparkles, TrendingUp, User
};

export default function FulfillmentDisplayTemplate() {
  const [lifeAreas, setLifeAreas] = useState<LifeArea[]>(
    DEFAULT_LIFE_AREAS.map(area => ({
      ...area,
      people: [],
      lastUpdated: new Date()
    }))
  );
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [activeArea, setActiveArea] = useState<string | null>(null);
  const [view, setView] = useState<'display' | 'trends' | 'snapshot'>('display');
  const [showAddPerson, setShowAddPerson] = useState(false);
  const [newPerson, setNewPerson] = useState({ name: '', relationship: '', frequency: 5 });
  const [editingArea, setEditingArea] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const getIcon = (iconName: string) => {
    const Icon = iconMap[iconName] || User;
    return <Icon className="w-5 h-5" />;
  };

  const calculateAreaScore = (area: LifeArea) => {
    const avgFrequency = area.people.length > 0 
      ? area.people.reduce((sum, p) => sum + p.frequency, 0) / area.people.length 
      : 0;
    return Math.round((area.commitment + area.satisfaction + avgFrequency) / 3 * 10) / 10;
  };

  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-black bg-green-100';
    if (score >= 4) return 'text-black bg-yellow-100';
    return 'text-black bg-red-100';
  };

  const addPerson = (areaId: string) => {
    if (!newPerson.name.trim()) return;
    
    const person: Person = {
      id: `person-${Date.now()}`,
      name: newPerson.name,
      relationship: newPerson.relationship,
      frequency: newPerson.frequency,
    };

    setLifeAreas(prev => prev.map(area => 
      area.id === areaId 
        ? { ...area, people: [...area.people, person], lastUpdated: new Date() }
        : area
    ));

    setNewPerson({ name: '', relationship: '', frequency: 5 });
    setShowAddPerson(false);
  };

  const removePerson = (areaId: string, personId: string) => {
    setLifeAreas(prev => prev.map(area => 
      area.id === areaId 
        ? { 
            ...area, 
            people: area.people.filter(p => p.id !== personId),
            lastUpdated: new Date()
          }
        : area
    ));
  };

  const updateArea = (areaId: string, updates: Partial<LifeArea>) => {
    setLifeAreas(prev => prev.map(area => 
      area.id === areaId 
        ? { ...area, ...updates, lastUpdated: new Date() }
        : area
    ));
  };

  const takeSnapshot = () => {
    const snapshot: Snapshot = {
      id: `snapshot-${Date.now()}`,
      date: new Date(),
      lifeAreas: JSON.parse(JSON.stringify(lifeAreas)),
      monthlyReflection: '',
      keyInsights: []
    };
    setSnapshots(prev => [snapshot, ...prev]);
    setView('snapshot');
  };

  const exportData = () => {
    const data = {
      lifeAreas,
      snapshots,
      exportDate: new Date().toISOString(),
      totalPeople: lifeAreas.reduce((sum, area) => sum + area.people.length, 0),
      averageScore: lifeAreas.reduce((sum, area) => sum + calculateAreaScore(area), 0) / lifeAreas.length
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fulfillment-display-${Date.now()}.json`;
    a.click();
  };

  const renderCircularDisplay = () => {
    const radius = 200;
    const centerX = 300;
    const centerY = 300;

    return (
      <div className="relative w-[600px] h-[600px] mx-auto bg-gray-50 dark:bg-gray-900 rounded-full border-2 border-gray-200 dark:border-gray-700">
        {/* Center point */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-black" />
        </div>

        {/* Life areas as circles */}
        {lifeAreas.map((area, index) => {
          const angle = (index * 2 * Math.PI) / lifeAreas.length;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          const score = calculateAreaScore(area);
          const size = Math.max(40, Math.min(100, score * 10 + 40));

          return (
            <motion.div
              key={area.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer ${
                activeArea === area.id ? 'z-20' : 'z-10'
              }`}
              style={{
                left: x,
                top: y,
                width: size,
                height: size
              }}
              onClick={() => setActiveArea(activeArea === area.id ? null : area.id)}
            >
              <div 
                className={`w-full h-full rounded-full flex flex-col items-center justify-center text-black font-medium shadow-lg hover:shadow-xl transition-all ${
                  activeArea === area.id ? 'ring-4 ring-white scale-110' : ''
                }`}
                style={{ backgroundColor: area.color }}
              >
                {getIcon(area.icon)}
                <span className="text-xs text-center mt-1 px-1">
                  {area.name}
                </span>
                <span className="text-xs font-bold">
                  {score}
                </span>
              </div>

              {/* People connections */}
              {area.people.map((person, personIndex) => {
                const personAngle = angle + (personIndex - area.people.length/2) * 0.3;
                const personRadius = 60;
                const personX = Math.cos(personAngle) * personRadius;
                const personY = Math.sin(personAngle) * personRadius;

                return (
                  <div
                    key={person.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center text-xs font-bold border-2"
                    style={{
                      left: personX,
                      top: personY,
                      borderColor: area.color,
                      opacity: person.frequency / 10
                    }}
                    title={`${person.name} - ${person.relationship}`}
                  >
                    {person.name.charAt(0)}
                  </div>
                );
              })}
            </motion.div>
          );
        })}
      </div>
    );
  };

  const renderAreaDetails = (area: LifeArea) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center text-black"
            style={{ backgroundColor: area.color }}
          >
            {getIcon(area.icon)}
          </div>
          <div>
            <h3 className="font-bold text-lg text-black dark:text-black">{area.name}</h3>
            <p className="text-sm text-black dark:text-black">
              Score: <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(calculateAreaScore(area))}`}>
                {calculateAreaScore(area)}
              </span>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setEditingArea(area.id)}
            className="p-2 text-black hover:text-black hover:bg-purple-100 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveArea(null)}
            className="p-2 text-black hover:text-black hover:bg-red-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sliders */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-black dark:text-black mb-2">
            Commitment Level: {area.commitment}/10
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={area.commitment}
            onChange={(e) => updateArea(area.id, { commitment: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-black dark:text-black mb-2">
            Satisfaction Level: {area.satisfaction}/10
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={area.satisfaction}
            onChange={(e) => updateArea(area.id, { satisfaction: parseInt(e.target.value) })}
            className="w-full"
          />
        </div>
      </div>

      {/* People */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-black dark:text-black">People ({area.people.length})</h4>
          <button
            onClick={() => setShowAddPerson(true)}
            className="px-3 py-1 bg-purple-600 text-black rounded-lg text-sm hover:bg-purple-700 transition-colors flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            Add Person
          </button>
        </div>

        <div className="space-y-2">
          {area.people.map(person => (
            <div key={person.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-black dark:text-black">{person.name}</p>
                <p className="text-sm text-black dark:text-black">{person.relationship}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-black dark:text-black">
                  Frequency: {person.frequency}/10
                </span>
                <button
                  onClick={() => removePerson(area.id, person.id)}
                  className="p-1 text-black hover:bg-red-100 rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-black dark:text-black mb-2">
          Notes & Reflections
        </label>
        <textarea
          value={area.notes}
          onChange={(e) => updateArea(area.id, { notes: e.target.value })}
          className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-black"
          rows={3}
          placeholder="Reflect on this life area..."
        />
      </div>
    </motion.div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black dark:text-black mb-2">
          Fulfillment Display
        </h1>
        <p className="text-black dark:text-black">
          Map your life areas, relationships, and track your fulfillment over time
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-8">
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {['display', 'trends', 'snapshot'].map(v => (
            <button
              key={v}
              onClick={() => setView(v as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
                view === v
                  ? 'bg-purple-600 text-black'
                  : 'text-black dark:text-black hover:text-black dark:hover:text-black'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
        
        <button
          onClick={takeSnapshot}
          className="px-4 py-2 bg-blue-600 text-black rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Camera className="w-4 h-4" />
          Take Snapshot
        </button>
        
        <button
          onClick={exportData}
          className="px-4 py-2 bg-green-600 text-black rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export Data
        </button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Display Area */}
        <div className="xl:col-span-2">
          {view === 'display' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-black dark:text-black mb-6">
                Relationship Circles
              </h2>
              {renderCircularDisplay()}
              <div className="mt-6 text-center text-sm text-black dark:text-black">
                Click on a life area to view details and add people
              </div>
            </div>
          )}

          {view === 'trends' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-black dark:text-black mb-6">
                3-Month Moving Average
              </h2>
              <div className="space-y-4">
                {lifeAreas.map(area => (
                  <div key={area.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: area.color }}
                        />
                        <span className="font-medium text-black dark:text-black">{area.name}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${getScoreColor(calculateAreaScore(area))}`}>
                        {calculateAreaScore(area)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ 
                          backgroundColor: area.color,
                          width: `${calculateAreaScore(area) * 10}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {view === 'snapshot' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-black dark:text-black mb-6">
                Monthly Snapshots
              </h2>
              <div className="space-y-4">
                {snapshots.map(snapshot => (
                  <div key={snapshot.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-black dark:text-black">
                        {snapshot.date.toLocaleDateString()}
                      </h3>
                      <span className="text-sm text-black dark:text-black">
                        {snapshot.lifeAreas.length} areas tracked
                      </span>
                    </div>
                    <div className="grid grid-cols-6 gap-2">
                      {snapshot.lifeAreas.map(area => (
                        <div
                          key={area.id}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-black text-xs"
                          style={{ backgroundColor: area.color }}
                          title={`${area.name}: ${calculateAreaScore(area)}`}
                        >
                          {calculateAreaScore(area).toFixed(1)}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Active Area Details */}
          {activeArea && (
            <div>
              {renderAreaDetails(lifeAreas.find(a => a.id === activeArea)!)}
            </div>
          )}

          {/* Summary Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="font-bold text-black dark:text-black mb-4">Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-black dark:text-black">Life Areas</span>
                <span className="font-medium text-black dark:text-black">{lifeAreas.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black dark:text-black">Total People</span>
                <span className="font-medium text-black dark:text-black">
                  {lifeAreas.reduce((sum, area) => sum + area.people.length, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-black dark:text-black">Average Score</span>
                <span className="font-medium text-black dark:text-black">
                  {(lifeAreas.reduce((sum, area) => sum + calculateAreaScore(area), 0) / lifeAreas.length).toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-black dark:text-black">Snapshots</span>
                <span className="font-medium text-black dark:text-black">{snapshots.length}</span>
              </div>
            </div>
          </div>

          {/* Usage Tips */}
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6">
            <h3 className="font-bold text-black dark:text-black mb-3">
              Usage Tips
            </h3>
            <div className="space-y-2 text-sm text-black dark:text-black">
              <p>• Click areas to add people and adjust commitment/satisfaction</p>
              <p>• Take monthly snapshots to track progress</p>
              <p>• Use frequency ratings to visualize relationship strength</p>
              <p>• Export data to share with course leaders</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Person Modal */}
      <AnimatePresence>
        {showAddPerson && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowAddPerson(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-black dark:text-black mb-4">
                Add Person
              </h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Name"
                  value={newPerson.name}
                  onChange={(e) => setNewPerson({...newPerson, name: e.target.value})}
                  className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-black"
                />
                <input
                  type="text"
                  placeholder="Relationship (e.g., Friend, Colleague, Family)"
                  value={newPerson.relationship}
                  onChange={(e) => setNewPerson({...newPerson, relationship: e.target.value})}
                  className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-black"
                />
                <div>
                  <label className="block text-sm font-medium text-black dark:text-black mb-2">
                    Frequency: {newPerson.frequency}/10
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={newPerson.frequency}
                    onChange={(e) => setNewPerson({...newPerson, frequency: parseInt(e.target.value)})}
                    className="w-full"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddPerson(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 text-black dark:text-black rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => activeArea && addPerson(activeArea)}
                  className="flex-1 px-4 py-2 bg-purple-600 text-black rounded-lg hover:bg-purple-700"
                >
                  Add Person
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}