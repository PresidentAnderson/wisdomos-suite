'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewGoal() {
  const router = useRouter();
  const [goal, setGoal] = useState({
    title: '',
    category: 'mindfulness',
    description: '',
    target: '',
    targetValue: 30,
    targetUnit: 'days',
    deadline: '',
    priority: 'medium',
    milestones: []
  });

  const categories = [
    { value: 'mindfulness', label: 'Mindfulness', icon: '🧘' },
    { value: 'learning', label: 'Learning', icon: '📚' },
    { value: 'health', label: 'Health', icon: '💪' },
    { value: 'reflection', label: 'Reflection', icon: '📝' },
    { value: 'creativity', label: 'Creativity', icon: '🎨' },
    { value: 'relationships', label: 'Relationships', icon: '❤️' },
    { value: 'career', label: 'Career', icon: '💼' },
    { value: 'finance', label: 'Finance', icon: '💰' }
  ];

  const units = ['days', 'weeks', 'months', 'times', 'hours', 'books', 'pages', 'sessions', 'items'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get existing goals from localStorage
    const existingGoals = JSON.parse(localStorage.getItem('goals') || '[]');
    
    // Create new goal
    const newGoal = {
      id: Date.now(),
      ...goal,
      target: `${goal.targetValue} ${goal.targetUnit}`,
      progress: 0,
      current: `0 ${goal.targetUnit}`,
      status: 'on-track',
      createdAt: new Date().toISOString(),
      icon: categories.find(c => c.value === goal.category)?.icon || '🎯'
    };
    
    // Save to localStorage
    localStorage.setItem('goals', JSON.stringify([newGoal, ...existingGoals]));
    
    // Also save to habits if it's a daily goal
    if (goal.targetUnit === 'days' && goal.category === 'mindfulness') {
      const habits = JSON.parse(localStorage.getItem('habits') || '[]');
      const newHabit = {
        id: Date.now(),
        name: goal.title,
        streak: 0,
        time: 'Daily',
        completed: false,
        goalId: newGoal.id
      };
      localStorage.setItem('habits', JSON.stringify([...habits, newHabit]));
    }
    
    // Redirect to goals page
    router.push('/goals');
  };

  const addMilestone = () => {
    const milestone = prompt('Enter milestone description:');
    if (milestone) {
      setGoal(prev => ({
        ...prev,
        milestones: [...prev.milestones, { text: milestone, completed: false }]
      }));
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
              <Link href="/journal" className="text-white/70 hover:text-white">Journal</Link>
              <Link href="/goals" className="text-cyan-400">Goals</Link>
              <Link href="/library" className="text-white/70 hover:text-white">Library</Link>
            </nav>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/goals" className="text-cyan-400 hover:text-cyan-300 mb-4 inline-block">
            ← Back to Goals
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">Set New Goal</h1>
          <p className="text-gray-400">Define your path to wisdom and growth</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10">
              {/* Title */}
              <div className="mb-6">
                <label className="block text-white mb-2 font-semibold">Goal Title</label>
                <input
                  type="text"
                  value={goal.title}
                  onChange={(e) => setGoal(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
                  placeholder="What do you want to achieve?"
                  required
                />
              </div>

              {/* Category */}
              <div className="mb-6">
                <label className="block text-white mb-2 font-semibold">Category</label>
                <div className="grid grid-cols-4 gap-3">
                  {categories.map(cat => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setGoal(prev => ({ ...prev, category: cat.value }))}
                      className={`p-3 rounded-lg border transition-all ${
                        goal.category === cat.value
                          ? 'bg-cyan-500/30 border-cyan-400 text-white'
                          : 'bg-white/5 border-white/20 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <div className="text-2xl mb-1">{cat.icon}</div>
                      <div className="text-xs">{cat.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="block text-white mb-2 font-semibold">Description</label>
                <textarea
                  value={goal.description}
                  onChange={(e) => setGoal(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 min-h-[100px]"
                  placeholder="Why is this goal important to you?"
                />
              </div>

              {/* Target */}
              <div className="mb-6">
                <label className="block text-white mb-2 font-semibold">Target</label>
                <div className="flex space-x-3">
                  <input
                    type="number"
                    value={goal.targetValue}
                    onChange={(e) => setGoal(prev => ({ ...prev, targetValue: parseInt(e.target.value) }))}
                    className="w-32 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
                    min="1"
                    required
                  />
                  <select
                    value={goal.targetUnit}
                    onChange={(e) => setGoal(prev => ({ ...prev, targetUnit: e.target.value }))}
                    className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-400"
                  >
                    {units.map(unit => (
                      <option key={unit} value={unit} className="bg-slate-900">{unit}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Deadline */}
              <div className="mb-6">
                <label className="block text-white mb-2 font-semibold">Deadline</label>
                <input
                  type="date"
                  value={goal.deadline}
                  onChange={(e) => setGoal(prev => ({ ...prev, deadline: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              {/* Priority */}
              <div className="mb-6">
                <label className="block text-white mb-2 font-semibold">Priority</label>
                <div className="flex space-x-3">
                  {['low', 'medium', 'high'].map(priority => (
                    <button
                      key={priority}
                      type="button"
                      onClick={() => setGoal(prev => ({ ...prev, priority }))}
                      className={`flex-1 py-2 rounded-lg border capitalize transition-all ${
                        goal.priority === priority
                          ? priority === 'high' ? 'bg-red-500/30 border-red-400 text-red-300' :
                            priority === 'medium' ? 'bg-yellow-500/30 border-yellow-400 text-yellow-300' :
                            'bg-green-500/30 border-green-400 text-green-300'
                          : 'bg-white/5 border-white/20 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      {priority}
                    </button>
                  ))}
                </div>
              </div>

              {/* Milestones */}
              <div className="mb-6">
                <label className="block text-white mb-2 font-semibold">Milestones</label>
                {goal.milestones.length > 0 && (
                  <div className="mb-3 space-y-2">
                    {goal.milestones.map((milestone, index) => (
                      <div key={index} className="flex items-center space-x-2 text-gray-300">
                        <span className="text-cyan-400">•</span>
                        <span>{milestone.text}</span>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  onClick={addMilestone}
                  className="text-cyan-400 hover:text-cyan-300 text-sm"
                >
                  + Add Milestone
                </button>
              </div>

              {/* Actions */}
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-3 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all"
                >
                  Create Goal
                </button>
                <Link href="/goals">
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
            {/* Goal Templates */}
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Popular Goals</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setGoal(prev => ({ ...prev, title: 'Daily Meditation Practice', category: 'mindfulness', targetValue: 30, targetUnit: 'days' }))}
                  className="w-full text-left text-gray-300 hover:text-cyan-400 text-sm p-2 rounded hover:bg-white/5 transition-all"
                >
                  🧘 Daily Meditation (30 days)
                </button>
                <button
                  onClick={() => setGoal(prev => ({ ...prev, title: 'Read 12 Books This Year', category: 'learning', targetValue: 12, targetUnit: 'books' }))}
                  className="w-full text-left text-gray-300 hover:text-cyan-400 text-sm p-2 rounded hover:bg-white/5 transition-all"
                >
                  📚 Read 12 Books
                </button>
                <button
                  onClick={() => setGoal(prev => ({ ...prev, title: 'Exercise 3 Times Weekly', category: 'health', targetValue: 12, targetUnit: 'weeks' }))}
                  className="w-full text-left text-gray-300 hover:text-cyan-400 text-sm p-2 rounded hover:bg-white/5 transition-all"
                >
                  💪 Exercise Regularly
                </button>
                <button
                  onClick={() => setGoal(prev => ({ ...prev, title: 'Journal Every Day', category: 'reflection', targetValue: 30, targetUnit: 'days' }))}
                  className="w-full text-left text-gray-300 hover:text-cyan-400 text-sm p-2 rounded hover:bg-white/5 transition-all"
                >
                  📝 Daily Journaling
                </button>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Goal Setting Tips</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>• Make goals specific and measurable</li>
                <li>• Set realistic deadlines</li>
                <li>• Break big goals into milestones</li>
                <li>• Track progress regularly</li>
                <li>• Celebrate small wins</li>
                <li>• Be flexible and adjust as needed</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}