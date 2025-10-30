'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [wisdom, setWisdom] = useState('');
  const [author, setAuthor] = useState('');

  const quotes = [
    { text: "The only true wisdom is in knowing you know nothing.", author: "Socrates" },
    { text: "The journey of a thousand miles begins with one step.", author: "Lao Tzu" },
    { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
    { text: "The unexamined life is not worth living.", author: "Socrates" },
    { text: "Be yourself; everyone else is already taken.", author: "Oscar Wilde" }
  ];

  useEffect(() => {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setWisdom(randomQuote.text);
    setAuthor(randomQuote.author);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center text-white mb-16">
          <h1 className="text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-pink-400">
            WisdomOS
          </h1>
          <p className="text-2xl mb-8 text-gray-200">
            Your Personal Growth & Wisdom Tracking System
          </p>
          
          {/* Daily Wisdom Quote */}
          <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-12">
            <h2 className="text-xl font-semibold mb-4 text-cyan-300">Daily Wisdom</h2>
            <blockquote className="text-lg italic mb-2">"{wisdom}"</blockquote>
            <p className="text-sm text-gray-300">— {author}</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <div className="text-3xl font-bold text-cyan-400">0</div>
              <div className="text-sm text-gray-300">Wisdom Points</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <div className="text-3xl font-bold text-green-400">0</div>
              <div className="text-sm text-gray-300">Days Active</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <div className="text-3xl font-bold text-yellow-400">0</div>
              <div className="text-sm text-gray-300">Insights Logged</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <div className="text-3xl font-bold text-purple-400">0</div>
              <div className="text-sm text-gray-300">Goals Achieved</div>
            </div>
          </div>

          {/* Main Navigation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Link href="/dashboard" className="group">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-xl font-semibold mb-2">Dashboard</h3>
                <p className="text-sm text-gray-300">Track your wisdom journey and progress</p>
              </div>
            </Link>

            <Link href="/journal" className="group">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-xl font-semibold mb-2">Wisdom Journal</h3>
                <p className="text-sm text-gray-300">Document your insights and learnings</p>
              </div>
            </Link>

            <Link href="/goals" className="group">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold mb-2">Goals & Habits</h3>
                <p className="text-sm text-gray-300">Set and track personal growth goals</p>
              </div>
            </Link>

            <Link href="/library" className="group">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <div className="text-4xl mb-4">📚</div>
                <h3 className="text-xl font-semibold mb-2">Wisdom Library</h3>
                <p className="text-sm text-gray-300">Curated wisdom from great minds</p>
              </div>
            </Link>

            <Link href="/meditation" className="group">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <div className="text-4xl mb-4">🧘</div>
                <h3 className="text-xl font-semibold mb-2">Meditation</h3>
                <p className="text-sm text-gray-300">Guided sessions for inner wisdom</p>
              </div>
            </Link>

            <Link href="/community" className="group">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <div className="text-4xl mb-4">👥</div>
                <h3 className="text-xl font-semibold mb-2">Community</h3>
                <p className="text-sm text-gray-300">Connect with fellow wisdom seekers</p>
              </div>
            </Link>

            <Link href="/autobiography" className="group">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <div className="text-4xl mb-4">📖</div>
                <h3 className="text-xl font-semibold mb-2">Autobiography</h3>
                <p className="text-sm text-gray-300">Year-by-year life reflections</p>
              </div>
            </Link>
          </div>

          {/* CTA Section */}
          <div className="mt-16 space-y-4">
            <Link href="/wisdom-center">
              <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 px-8 rounded-full text-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-2xl w-full max-w-md">
                🧭 Enter Wisdom Center
              </button>
            </Link>
            <div className="text-center">
              <Link href="/dashboard/fulfillment">
                <button className="text-cyan-400 hover:text-cyan-300 underline">
                  or view Fulfillment Display →
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}