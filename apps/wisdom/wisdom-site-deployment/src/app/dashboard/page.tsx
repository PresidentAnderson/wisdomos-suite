'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const weeklyData = [
    { day: 'Mon', wisdom: 65, meditation: 30, reading: 45 },
    { day: 'Tue', wisdom: 78, meditation: 45, reading: 60 },
    { day: 'Wed', wisdom: 82, meditation: 40, reading: 55 },
    { day: 'Thu', wisdom: 73, meditation: 35, reading: 50 },
    { day: 'Fri', wisdom: 89, meditation: 50, reading: 70 },
    { day: 'Sat', wisdom: 95, meditation: 60, reading: 80 },
    { day: 'Sun', wisdom: 88, meditation: 55, reading: 65 }
  ];

  const recentActivities = [
    { type: 'journal', title: 'Morning Reflection', time: '2 hours ago', icon: '📝' },
    { type: 'meditation', title: 'Mindfulness Session', time: '5 hours ago', icon: '🧘' },
    { type: 'goal', title: 'Completed Daily Reading', time: '1 day ago', icon: '✅' },
    { type: 'insight', title: 'New Insight Logged', time: '2 days ago', icon: '💡' }
  ];

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
              <Link href="/dashboard" className="text-cyan-400">Dashboard</Link>
              <Link href="/journal" className="text-white/70 hover:text-white">Journal</Link>
              <Link href="/goals" className="text-white/70 hover:text-white">Goals</Link>
              <Link href="/library" className="text-white/70 hover:text-white">Library</Link>
            </nav>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Welcome back!</h1>
              <p className="text-gray-400">Track your wisdom journey and personal growth</p>
            </div>
            <Link href="/dashboard/fulfillment">
              <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all">
                View Fulfillment Display →
              </button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-cyan-500/20 to-cyan-600/20 backdrop-blur-lg rounded-xl p-6 border border-cyan-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-cyan-400">Wisdom Score</span>
              <span className="text-2xl">🏆</span>
            </div>
            <div className="text-3xl font-bold text-white">847</div>
            <div className="text-sm text-green-400">+12% this week</div>
          </div>

          <div className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-purple-400">Streak</span>
              <span className="text-2xl">🔥</span>
            </div>
            <div className="text-3xl font-bold text-white">14 days</div>
            <div className="text-sm text-gray-400">Keep it up!</div>
          </div>

          <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 backdrop-blur-lg rounded-xl p-6 border border-green-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-400">Goals Progress</span>
              <span className="text-2xl">🎯</span>
            </div>
            <div className="text-3xl font-bold text-white">73%</div>
            <div className="text-sm text-gray-400">8 of 11 completed</div>
          </div>

          <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 backdrop-blur-lg rounded-xl p-6 border border-yellow-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-yellow-400">Insights</span>
              <span className="text-2xl">💡</span>
            </div>
            <div className="text-3xl font-bold text-white">156</div>
            <div className="text-sm text-gray-400">23 this month</div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart Section */}
          <div className="lg:col-span-2 bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Weekly Progress</h2>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-2 rounded-lg text-sm ${activeTab === 'overview' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:text-white'}`}
                >
                  Overview
                </button>
                <button 
                  onClick={() => setActiveTab('details')}
                  className={`px-4 py-2 rounded-lg text-sm ${activeTab === 'details' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:text-white'}`}
                >
                  Details
                </button>
              </div>
            </div>

            {/* Simple Chart Visualization */}
            <div className="space-y-4">
              {weeklyData.map((day, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <span className="text-gray-400 w-12">{day.day}</span>
                  <div className="flex-1 flex space-x-2">
                    <div className="flex-1 bg-gray-800 rounded-full h-8 relative overflow-hidden">
                      <div 
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${day.wisdom}%` }}
                      >
                        <span className="text-xs text-white font-semibold">{day.wisdom}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                <span className="text-sm text-gray-400">Wisdom Points</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-400">Meditation</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-400">Reading</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="text-2xl">{activity.icon}</div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{activity.title}</p>
                    <p className="text-gray-400 text-sm">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/journal">
              <button className="w-full mt-6 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 py-2 rounded-lg transition-colors">
                View All Activity
              </button>
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link href="/journal/new" className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📝</span>
              <span className="text-white">New Journal Entry</span>
            </div>
          </Link>
          <Link href="/meditation/start" className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🧘</span>
              <span className="text-white">Start Meditation</span>
            </div>
          </Link>
          <Link href="/goals/new" className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🎯</span>
              <span className="text-white">Set New Goal</span>
            </div>
          </Link>
          <Link href="/library/explore" className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📚</span>
              <span className="text-white">Explore Wisdom</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}