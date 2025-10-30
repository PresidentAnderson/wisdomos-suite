'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Lightbulb,
  Target,
  TrendingUp,
  Heart,
  Brain,
  Users,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Star,
  Zap,
  Clock,
  Award,
  Flame,
} from 'lucide-react';
import Link from 'next/link';
import PhoenixButton from '@/components/ui/PhoenixButton';

interface BestPractice {
  id: string;
  category: 'journaling' | 'reflection' | 'goals' | 'habits' | 'mindset' | 'relationships';
  title: string;
  description: string;
  tips: string[];
  icon: any;
  color: string;
}

const bestPractices: BestPractice[] = [
  {
    id: 'journaling',
    category: 'journaling',
    title: 'Effective Journaling',
    description: 'Transform your thoughts into clarity and insights through intentional journaling practices.',
    icon: BookOpen,
    color: 'from-blue-500 to-indigo-500',
    tips: [
      'Write at the same time each day to build consistency',
      'Focus on emotions and sensations, not just events',
      'Ask yourself "What did I learn today?" before closing',
      'Be honest and authentic - this is your private space',
      'Review past entries monthly to track patterns and growth',
    ],
  },
  {
    id: 'reflection',
    category: 'reflection',
    title: 'Deep Self-Reflection',
    description: 'Cultivate self-awareness through regular reflection on your experiences and choices.',
    icon: Brain,
    color: 'from-purple-500 to-pink-500',
    tips: [
      'Schedule weekly 30-minute reflection sessions',
      'Use prompts: "What went well?" and "What could improve?"',
      'Connect current experiences to past patterns',
      'Identify your emotional triggers and responses',
      'Celebrate small wins and progress, not just outcomes',
    ],
  },
  {
    id: 'goals',
    category: 'goals',
    title: 'Goal Setting & Achievement',
    description: 'Set meaningful goals that align with your values and create sustainable progress.',
    icon: Target,
    color: 'from-green-500 to-emerald-500',
    tips: [
      'Break big goals into weekly and daily micro-actions',
      'Make goals SMART: Specific, Measurable, Achievable, Relevant, Time-bound',
      'Review and adjust goals quarterly as your priorities evolve',
      'Track progress visually - what gets measured gets managed',
      'Share goals with an accountability partner or community',
    ],
  },
  {
    id: 'habits',
    category: 'habits',
    title: 'Building Lasting Habits',
    description: 'Create sustainable routines that compound into transformative life changes.',
    icon: TrendingUp,
    color: 'from-orange-500 to-red-500',
    tips: [
      'Start incredibly small - 2 minutes per day is enough',
      'Stack new habits onto existing ones (habit stacking)',
      'Focus on systems over goals - identity over outcomes',
      'Track daily without judgment - consistency beats perfection',
      'Prepare your environment to make good habits easier',
    ],
  },
  {
    id: 'mindset',
    category: 'mindset',
    title: 'Growth Mindset Cultivation',
    description: 'Develop resilience and adaptability by embracing challenges as opportunities.',
    icon: Lightbulb,
    color: 'from-yellow-500 to-amber-500',
    tips: [
      'Reframe failures as data points and learning opportunities',
      'Replace "I can\'t" with "I can\'t yet" to open possibilities',
      'Celebrate effort and process, not just results',
      'Practice gratitude daily to shift focus to abundance',
      'Surround yourself with growth-minded people',
    ],
  },
  {
    id: 'relationships',
    category: 'relationships',
    title: 'Meaningful Connections',
    description: 'Nurture deep, authentic relationships that support your growth and well-being.',
    icon: Users,
    color: 'from-cyan-500 to-teal-500',
    tips: [
      'Schedule quality time with important people weekly',
      'Practice active listening without planning your response',
      'Express appreciation and gratitude explicitly',
      'Set healthy boundaries and communicate your needs',
      'Be vulnerable and share your authentic self',
    ],
  },
];

const additionalResources = [
  {
    title: 'Morning Ritual Design',
    description: 'Craft a powerful morning routine that sets the tone for your day',
    icon: Clock,
    link: '#morning-ritual',
  },
  {
    title: 'Energy Management',
    description: 'Optimize your energy levels throughout the day for peak performance',
    icon: Zap,
    link: '#energy',
  },
  {
    title: 'Milestone Celebrations',
    description: 'Recognize and celebrate your progress to maintain momentum',
    icon: Award,
    link: '#celebrations',
  },
  {
    title: 'Phoenix Rising Philosophy',
    description: 'Embrace transformation and rebirth in your personal growth journey',
    icon: Flame,
    link: '#phoenix',
  },
];

export default function BestPracticesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedPractice, setExpandedPractice] = useState<string | null>(null);

  const filteredPractices = selectedCategory
    ? bestPractices.filter((p) => p.category === selectedCategory)
    : bestPractices;

  const categories = Array.from(new Set(bestPractices.map((p) => p.category)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-phoenix-smoke via-white to-phoenix-gold/10">
      {/* Header */}
      <header className="border-b border-phoenix-gold/20 bg-white/80 backdrop-blur-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/">
                <PhoenixButton variant="ghost" size="sm">
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </PhoenixButton>
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-phoenix-red/20 to-phoenix-orange/20 border border-phoenix-gold/30">
                  <Sparkles className="w-6 h-6 text-phoenix-red" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-phoenix-red to-phoenix-orange bg-clip-text text-transparent">
                  Best Practices & Resources
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-phoenix-gold" fill="currentColor" />
              <span className="text-sm text-gray-600">Curated wisdom</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Elevate Your Personal Growth Journey
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Evidence-based practices and wisdom to help you live with intention,
            build resilience, and create lasting positive change.
          </p>
        </motion.div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          <PhoenixButton
            onClick={() => setSelectedCategory(null)}
            variant={selectedCategory === null ? 'primary' : 'ghost'}
            size="sm"
          >
            All
          </PhoenixButton>
          {categories.map((category) => (
            <PhoenixButton
              key={category}
              onClick={() => setSelectedCategory(category)}
              variant={selectedCategory === category ? 'primary' : 'ghost'}
              size="sm"
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </PhoenixButton>
          ))}
        </div>

        {/* Best Practices Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <AnimatePresence mode="popLayout">
            {filteredPractices.map((practice, index) => {
              const Icon = practice.icon;
              const isExpanded = expandedPractice === practice.id;

              return (
                <motion.div
                  key={practice.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-white rounded-2xl shadow-xl border border-phoenix-gold/20 overflow-hidden cursor-pointer transition-all hover:shadow-2xl ${
                    isExpanded ? 'md:col-span-2 lg:col-span-3' : ''
                  }`}
                  onClick={() =>
                    setExpandedPractice(isExpanded ? null : practice.id)
                  }
                >
                  {/* Card Header */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`p-3 rounded-lg bg-gradient-to-br ${practice.color} bg-opacity-20`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <ChevronRight
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          isExpanded ? 'rotate-90' : ''
                        }`}
                      />
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {practice.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {practice.description}
                    </p>

                    {/* Expanded Content */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-6 pt-6 border-t border-gray-200"
                        >
                          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-phoenix-green" />
                            Practical Tips
                          </h4>
                          <ul className="space-y-3">
                            {practice.tips.map((tip, idx) => (
                              <motion.li
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="flex items-start gap-3 text-sm text-gray-700"
                              >
                                <div
                                  className={`mt-0.5 w-2 h-2 rounded-full bg-gradient-to-br ${practice.color} flex-shrink-0`}
                                />
                                <span>{tip}</span>
                              </motion.li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Card Footer */}
                  {!isExpanded && (
                    <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                      <span className="text-xs text-gray-500">
                        Click to view {practice.tips.length} tips
                      </span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Additional Resources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-16"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Heart className="w-6 h-6 text-phoenix-red" />
            Additional Resources
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalResources.map((resource, index) => {
              const Icon = resource.icon;

              return (
                <motion.a
                  key={resource.title}
                  href={resource.link}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-white rounded-xl shadow-lg p-6 border border-phoenix-gold/20 hover:border-phoenix-gold/50 transition-all hover:shadow-xl"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-phoenix-red/10 to-phoenix-orange/10">
                      <Icon className="w-5 h-5 text-phoenix-red" />
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-phoenix-orange transition-colors" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {resource.title}
                  </h3>
                  <p className="text-sm text-gray-600">{resource.description}</p>
                </motion.a>
              );
            })}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-16 bg-gradient-to-r from-phoenix-red/10 via-phoenix-orange/10 to-phoenix-gold/10 rounded-2xl p-8 border border-phoenix-gold/30 text-center"
        >
          <Flame className="w-12 h-12 text-phoenix-red mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Ready to Rise?
          </h3>
          <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
            Start implementing these practices today and watch yourself transform.
            Every small step compounds into extraordinary growth.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/journal">
              <PhoenixButton variant="primary" size="lg">
                Start Journaling
              </PhoenixButton>
            </Link>
            <Link href="/insights/recommendations">
              <PhoenixButton variant="secondary" size="lg">
                Get AI Recommendations
              </PhoenixButton>
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
