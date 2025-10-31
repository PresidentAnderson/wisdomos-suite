'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Trophy, Target, MessageCircle, Calendar, Flame } from 'lucide-react';

export default function CommunityHub() {
  const [activeTab, setActiveTab] = useState('circles');

  const features = [
    {
      id: 'circles',
      name: 'Circles',
      icon: Users,
      description: 'Connect with like-minded individuals in wisdom circles',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'progress',
      name: 'Progress',
      icon: Trophy,
      description: 'Track your growth with streaks and achievements',
      color: 'from-blue-500 to-teal-500'
    },
    {
      id: 'events',
      name: 'Events',
      icon: Calendar,
      description: 'Join gatherings and workshops for deeper learning',
      color: 'from-green-500 to-emerald-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-800/20 to-pink-800/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-5xl font-bold text-black mb-6">
              WisdomOS Community Hub
            </h1>
            <p className="text-xl text-black mb-8 max-w-3xl mx-auto">
              Connect, share, and grow together in a community-driven platform for personal wisdom, 
              legacy building, and transformative growth.
            </p>
            <div className="flex justify-center gap-4">
              <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-black rounded-lg hover:opacity-90 transition">
                Join Community
              </button>
              <button className="px-8 py-3 border border-purple-400 text-black rounded-lg hover:bg-purple-400 hover:text-black transition">
                Learn More
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-center mb-12">
          <div className="flex bg-gray-100 rounded-xl p-2">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <button
                  key={feature.id}
                  onClick={() => setActiveTab(feature.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg transition ${
                    activeTab === feature.id
                      ? 'bg-gradient-to-r ' + feature.color + ' text-black'
                      : 'text-black hover:text-black'
                  }`}
                >
                  <Icon size={20} />
                  {feature.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Feature Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        >
          <div>
            <h2 className="text-3xl font-bold text-black mb-6">
              {features.find(f => f.id === activeTab)?.name}
            </h2>
            <p className="text-black text-lg mb-8">
              {features.find(f => f.id === activeTab)?.description}
            </p>

            {activeTab === 'circles' && (
              <div className="space-y-4">
                <div className="bg-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-black mb-2">Wisdom Circles</h4>
                  <p className="text-black">Private groups for deep discussions and mutual support</p>
                </div>
                <div className="bg-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-black mb-2">Contribution Displays</h4>
                  <p className="text-black">Share your unique gifts and get feedback from peers</p>
                </div>
                <div className="bg-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-black mb-2">Legacy Vaults</h4>
                  <p className="text-black">Preserve and share your wisdom for future generations</p>
                </div>
              </div>
            )}

            {activeTab === 'progress' && (
              <div className="space-y-4">
                <div className="bg-gray-200 rounded-lg p-4 flex items-center gap-4">
                  <Flame className="text-black" size={24} />
                  <div>
                    <h4 className="font-semibold text-black">Streak Tracking</h4>
                    <p className="text-black">Maintain daily practices and build momentum</p>
                  </div>
                </div>
                <div className="bg-gray-200 rounded-lg p-4 flex items-center gap-4">
                  <Trophy className="text-black" size={24} />
                  <div>
                    <h4 className="font-semibold text-black">Achievement Badges</h4>
                    <p className="text-black">Earn recognition for your growth milestones</p>
                  </div>
                </div>
                <div className="bg-gray-200 rounded-lg p-4 flex items-center gap-4">
                  <Target className="text-black" size={24} />
                  <div>
                    <h4 className="font-semibold text-black">Level System</h4>
                    <p className="text-black">Progress through levels as you engage with the community</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'events' && (
              <div className="space-y-4">
                <div className="bg-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-black mb-2">Gathering Mode</h4>
                  <p className="text-black">QR code-enabled local meetups and workshops</p>
                </div>
                <div className="bg-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-black mb-2">Virtual Circles</h4>
                  <p className="text-black">Online wisdom sharing sessions and discussions</p>
                </div>
                <div className="bg-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-black mb-2">Workshops</h4>
                  <p className="text-black">Skill-building sessions led by community members</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-gray-200 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-black mb-6">Community Stats</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-black mb-2">2,847</div>
                <div className="text-black">Active Members</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-black mb-2">156</div>
                <div className="text-black">Wisdom Circles</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-black mb-2">4,291</div>
                <div className="text-black">Contributions</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-black mb-2">89</div>
                <div className="text-black">Events This Month</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Phase 3 Features */}
      <div className="bg-gray-200/50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-4">Phase 3 Features</h2>
            <p className="text-black">Community-driven wisdom platform with legacy preservation</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: 'Contribution Display',
                description: 'Visual collages with peer feedback',
                icon: '🎨'
              },
              {
                title: 'Autobiography Timeline',
                description: 'Life events with reframing tools',
                icon: '📖'
              },
              {
                title: 'Legacy Vault',
                description: 'Encrypted storage with trustees',
                icon: '🔐'
              },
              {
                title: 'Gamification',
                description: 'Streaks, badges, and levels',
                icon: '🏆'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-200 rounded-lg p-6 text-center"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-black mb-2">{feature.title}</h3>
                <p className="text-black">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-black mb-4">
            Ready to Start Your Wisdom Journey?
          </h2>
          <p className="text-black text-lg mb-8">
            Join thousands of members who are transforming their personal growth into community-driven wisdom.
          </p>
          <button className="px-12 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-black text-lg rounded-xl hover:opacity-90 transition transform hover:scale-105">
            Get Started Today
          </button>
        </div>
      </div>
    </div>
  );
}