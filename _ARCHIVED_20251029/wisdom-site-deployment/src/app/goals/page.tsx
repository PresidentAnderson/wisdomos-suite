'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Goals() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('all');
  const [goals, setGoals] = useState([]);
  const [habits, setHabits] = useState([]);

  useEffect(() => {
    // Load goals from localStorage
    const loadedGoals = JSON.parse(localStorage.getItem('goals') || '[]');
    const loadedHabits = JSON.parse(localStorage.getItem('habits') || '[]');
    
    // If no goals, use sample data
    if (loadedGoals.length === 0) {
      const sampleGoals = [
    {
      id: 1,
      title: 'Daily Meditation Practice',
      category: 'mindfulness',
      progress: 85,
      target: '30 days',
      current: '26 days',
      deadline: '2024-08-31',
      status: 'on-track',
      icon: '🧘'
    },
    {
      id: 2,
      title: 'Read 12 Books This Year',
      category: 'learning',
      progress: 67,
      target: '12 books',
      current: '8 books',
      deadline: '2024-12-31',
      status: 'on-track',
      icon: '📚'
    },
    {
      id: 3,
      title: 'Journal Every Day',
      category: 'reflection',
      progress: 92,
      target: '365 entries',
      current: '233 entries',
      deadline: '2024-12-31',
      status: 'ahead',
      icon: '📝'
    },
    {
      id: 4,
      title: 'Learn Philosophy Basics',
      category: 'learning',
      progress: 45,
      target: '10 courses',
      current: '4.5 courses',
      deadline: '2024-10-01',
      status: 'behind',
      icon: '🎓'
    }
  ];
      localStorage.setItem('goals', JSON.stringify(sampleGoals));
      setGoals(sampleGoals);
    } else {
      setGoals(loadedGoals);
    }
    
    // If no habits, use sample data
    if (loadedHabits.length === 0) {
      const sampleHabits = [
    { name: 'Morning Meditation', streak: 14, time: '6:00 AM', completed: true },
    { name: 'Gratitude Journal', streak: 21, time: '9:00 PM', completed: true },
    { name: 'Read for 30 mins', streak: 7, time: '8:00 PM', completed: false },
    { name: 'Nature Walk', streak: 3, time: '5:00 PM', completed: false }
  ];
      localStorage.setItem('habits', JSON.stringify(sampleHabits));
      setHabits(sampleHabits);
    } else {
      setHabits(loadedHabits);
    }
  }, []);

  const categories = [
    { id: 'all', name: 'All Goals', color: 'gray' },
    { id: 'mindfulness', name: 'Mindfulness', color: 'purple' },
    { id: 'learning', name: 'Learning', color: 'blue' },
    { id: 'reflection', name: 'Reflection', color: 'green' },
    { id: 'health', name: 'Health', color: 'red' }
  ];

  const filteredGoals = activeCategory === 'all' 
    ? goals 
    : goals.filter(goal => goal.category === activeCategory);

  const toggleHabit = (index) => {
    const updatedHabits = [...habits];
    updatedHabits[index].completed = !updatedHabits[index].completed;
    if (updatedHabits[index].completed) {
      updatedHabits[index].streak += 1;
    }
    setHabits(updatedHabits);
    localStorage.setItem('habits', JSON.stringify(updatedHabits));
  };

  const updateGoalProgress = (goalId) => {
    const updatedGoals = goals.map(goal => {
      if (goal.id === goalId) {
        const newProgress = Math.min(goal.progress + 10, 100);
        return {
          ...goal,
          progress: newProgress,
          status: newProgress >= 100 ? 'completed' : newProgress >= 80 ? 'ahead' : 'on-track'
        };
      }
      return goal;
    });
    setGoals(updatedGoals);
    localStorage.setItem('goals', JSON.stringify(updatedGoals));
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
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Goals & Habits</h1>
            <p className="text-gray-400">Track your progress towards wisdom and growth</p>
          </div>
          <Link href="/goals/new">
            <button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all">
              + New Goal
            </button>
          </Link>
        </div>

        {/* Daily Habits Tracker */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Today\'s Habits</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {habits.map((habit, index) => (
              <div key={index} className={`bg-white/5 rounded-lg p-4 border ${habit.completed ? 'border-green-500/50' : 'border-white/10'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{habit.name}</span>
                  <input 
                    type="checkbox" 
                    checked={habit.completed}
                    onChange={() => toggleHabit(index)}
                    className="w-5 h-5 rounded border-gray-600 text-green-500 focus:ring-green-500 focus:ring-offset-0 bg-gray-700 cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">{habit.time}</span>
                  <span className="text-yellow-400">🔥 {habit.streak} days</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex space-x-4 mb-6">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeCategory === category.id
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                  : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Goals Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredGoals.map(goal => (
            <div key={goal.id} className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{goal.icon}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{goal.title}</h3>
                    <p className="text-gray-400 text-sm">Due: {new Date(goal.deadline).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  goal.status === 'ahead' ? 'bg-green-500/20 text-green-400' :
                  goal.status === 'on-track' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {goal.status === 'ahead' ? 'Ahead' : goal.status === 'on-track' ? 'On Track' : 'Behind'}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">{goal.current}</span>
                  <span className="text-gray-400">{goal.target}</span>
                </div>
                <div className="bg-gray-800 rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
                <div className="text-center mt-2">
                  <span className="text-2xl font-bold text-white">{goal.progress}%</span>
                  <span className="text-gray-400 text-sm ml-2">Complete</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button 
                  onClick={() => updateGoalProgress(goal.id)}
                  className="flex-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 py-2 rounded-lg transition-colors"
                >
                  Update Progress
                </button>
                <Link href={`/goals/${goal.id}`}>
                  <button className="flex-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 py-2 rounded-lg transition-colors">
                    View Details
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Achievements Section */}
        <div className="mt-8 bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-4">Recent Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-4xl mb-2">🏆</div>
              <p className="text-white font-medium">Goal Crusher</p>
              <p className="text-gray-400 text-sm">10 goals completed</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">🔥</div>
              <p className="text-white font-medium">30 Day Streak</p>
              <p className="text-gray-400 text-sm">Meditation master</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">📚</div>
              <p className="text-white font-medium">Bookworm</p>
              <p className="text-gray-400 text-sm">50 books read</p>
            </div>
            <div className="text-center opacity-50">
              <div className="text-4xl mb-2">🎯</div>
              <p className="text-white font-medium">Locked</p>
              <p className="text-gray-400 text-sm">Complete 5 more goals</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}