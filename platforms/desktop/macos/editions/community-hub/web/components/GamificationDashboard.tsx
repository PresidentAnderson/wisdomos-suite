'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Flame,
  Target,
  Award,
  TrendingUp,
  Calendar,
  Star,
  Lock,
  CheckCircle,
  RefreshCw,
  Book,
  Users,
  Heart
} from 'lucide-react';

interface Streak {
  type: string;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  category: string;
  points: number;
  earned: boolean;
  earnedAt?: Date;
  progress?: number;
  icon: any;
}

export function GamificationDashboard() {
  const [streaks, setStreaks] = useState<Streak[]>([
    {
      type: 'reset_ritual',
      currentStreak: 7,
      longestStreak: 14,
      lastActivityDate: new Date(),
    },
    {
      type: 'journaling',
      currentStreak: 3,
      longestStreak: 21,
      lastActivityDate: new Date(),
    },
    {
      type: 'contribution',
      currentStreak: 5,
      longestStreak: 5,
      lastActivityDate: new Date(),
    },
  ]);

  const [badges, setBadges] = useState<Badge[]>([
    {
      id: '1',
      name: 'First Contribution',
      description: 'Created your first Contribution Display',
      category: 'contribution',
      points: 10,
      earned: true,
      earnedAt: new Date('2024-01-15'),
      icon: Trophy,
    },
    {
      id: '2',
      name: '7-Day Streak',
      description: 'Maintained a 7-day streak',
      category: 'streak',
      points: 25,
      earned: true,
      earnedAt: new Date('2024-01-20'),
      icon: Flame,
    },
    {
      id: '3',
      name: 'Life Chronicler',
      description: 'Added 50 life events',
      category: 'autobiography',
      points: 200,
      earned: false,
      progress: 35,
      icon: Book,
    },
    {
      id: '4',
      name: 'Community Builder',
      description: 'Created your first group',
      category: 'community',
      points: 30,
      earned: false,
      progress: 0,
      icon: Users,
    },
    {
      id: '5',
      name: 'Reset Warrior',
      description: 'Completed 30 reset rituals',
      category: 'wellness',
      points: 75,
      earned: false,
      progress: 70,
      icon: RefreshCw,
    },
  ]);

  const [totalPoints, setTotalPoints] = useState(0);
  const [level, setLevel] = useState(1);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  useEffect(() => {
    const earned = badges.filter(b => b.earned).reduce((sum, b) => sum + b.points, 0);
    setTotalPoints(earned);
    setLevel(Math.floor(earned / 100) + 1);
  }, [badges]);

  const categoryColors = {
    contribution: 'bg-purple-500',
    streak: 'bg-orange-500',
    autobiography: 'bg-blue-500',
    community: 'bg-green-500',
    wellness: 'bg-pink-500',
    legacy: 'bg-indigo-500',
  };

  const getStreakColor = (current: number, longest: number) => {
    const percentage = (current / longest) * 100;
    if (percentage >= 100) return 'text-black';
    if (percentage >= 50) return 'text-black';
    return 'text-black';
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Your Progress</h1>
        <p className="text-black">Track your journey with streaks and achievements</p>
      </div>

      {/* Level & Points Overview */}
      <div className="mb-8 p-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg text-black">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm opacity-90">Current Level</div>
            <div className="text-4xl font-bold">Level {level}</div>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-90">Total Points</div>
            <div className="text-3xl font-bold">{totalPoints}</div>
          </div>
        </div>
        <div className="mt-4">
          <div className="bg-white/20 rounded-full h-4 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(totalPoints % 100)}%` }}
              className="bg-white h-full"
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
          <div className="mt-2 text-sm opacity-90">
            {100 - (totalPoints % 100)} points to Level {level + 1}
          </div>
        </div>
      </div>

      {/* Active Streaks */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Active Streaks</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {streaks.map((streak) => (
            <motion.div
              key={streak.type}
              whileHover={{ scale: 1.02 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <Flame className={getStreakColor(streak.currentStreak, streak.longestStreak)} size={32} />
                <div className="text-right">
                  <div className="text-3xl font-bold">{streak.currentStreak}</div>
                  <div className="text-xs text-black">days</div>
                </div>
              </div>
              
              <h3 className="font-semibold capitalize mb-2">
                {streak.type.replace('_', ' ')}
              </h3>
              
              <div className="flex items-center justify-between text-sm text-black">
                <span>Longest: {streak.longestStreak} days</span>
                <span>Today ✓</span>
              </div>

              <div className="mt-4 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(streak.currentStreak / streak.longestStreak) * 100}%` }}
                  className={`h-full ${
                    streak.currentStreak >= streak.longestStreak
                      ? 'bg-green-500'
                      : 'bg-blue-500'
                  }`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Badges */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Badges & Achievements</h2>
        
        {/* Badge Categories */}
        <div className="mb-6 flex flex-wrap gap-2">
          {Object.keys(categoryColors).map((category) => (
            <button
              key={category}
              className={`px-3 py-1 rounded-full text-black text-sm capitalize ${categoryColors[category as keyof typeof categoryColors]}`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Badge Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {badges.map((badge) => {
            const Icon = badge.icon;
            
            return (
              <motion.div
                key={badge.id}
                whileHover={{ scale: 1.05 }}
                onClick={() => setSelectedBadge(badge)}
                className={`relative p-4 rounded-lg cursor-pointer ${
                  badge.earned
                    ? 'bg-white dark:bg-gray-800 shadow-md'
                    : 'bg-gray-100 dark:bg-gray-900 opacity-60'
                }`}
              >
                <div className="flex flex-col items-center text-center">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${
                      badge.earned
                        ? categoryColors[badge.category as keyof typeof categoryColors]
                        : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                  >
                    {badge.earned ? (
                      <Icon className="text-black" size={32} />
                    ) : (
                      <Lock className="text-black" size={24} />
                    )}
                  </div>
                  
                  <h4 className="text-xs font-semibold line-clamp-2">{badge.name}</h4>
                  
                  {!badge.earned && badge.progress !== undefined && (
                    <div className="mt-2 w-full">
                      <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-1 overflow-hidden">
                        <div
                          className="bg-blue-500 h-full"
                          style={{ width: `${badge.progress}%` }}
                        />
                      </div>
                      <div className="text-xs text-black mt-1">{badge.progress}%</div>
                    </div>
                  )}
                  
                  {badge.earned && (
                    <CheckCircle className="absolute top-2 right-2 text-black" size={16} />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Badge Detail Modal */}
      <AnimatePresence>
        {selectedBadge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setSelectedBadge(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center text-center">
                <div
                  className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 ${
                    selectedBadge.earned
                      ? categoryColors[selectedBadge.category as keyof typeof categoryColors]
                      : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                >
                  {selectedBadge.earned ? (
                    <selectedBadge.icon className="text-black" size={48} />
                  ) : (
                    <Lock className="text-black" size={36} />
                  )}
                </div>
                
                <h2 className="text-2xl font-bold mb-2">{selectedBadge.name}</h2>
                <p className="text-black dark:text-black mb-4">
                  {selectedBadge.description}
                </p>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{selectedBadge.points}</div>
                    <div className="text-sm text-black">Points</div>
                  </div>
                  {selectedBadge.earned && (
                    <div className="text-center">
                      <div className="text-sm font-medium">Earned</div>
                      <div className="text-sm text-black">
                        {selectedBadge.earnedAt?.toLocaleDateString()}
                      </div>
                    </div>
                  )}
                </div>
                
                {!selectedBadge.earned && selectedBadge.progress !== undefined && (
                  <div className="w-full mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{selectedBadge.progress}%</span>
                    </div>
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-500 h-full"
                        style={{ width: `${selectedBadge.progress}%` }}
                      />
                    </div>
                  </div>
                )}
                
                <button
                  onClick={() => setSelectedBadge(null)}
                  className="px-4 py-2 bg-gray-200 text-black rounded-lg hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}