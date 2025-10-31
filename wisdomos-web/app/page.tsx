'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const quotes = [
  { text: "The only true wisdom is in knowing you know nothing.", author: "Socrates" },
  { text: "The journey of a thousand miles begins with one step.", author: "Lao Tzu" },
  { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
  { text: "The unexamined life is not worth living.", author: "Socrates" },
  { text: "Be yourself; everyone else is already taken.", author: "Oscar Wilde" }
]

export default function Home() {
  const [wisdom, setWisdom] = useState('')
  const [author, setAuthor] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]
    setWisdom(randomQuote.text)
    setAuthor(randomQuote.author)
    
    // Check if logged in
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)
  }, [])

  const handleDemoLogin = async () => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'demo@wisdomos.app', name: 'Demo User' })
      })
      const data = await response.json()
      if (data.token) {
        localStorage.setItem('token', data.token)
        setIsLoggedIn(true)
      }
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

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
          
          {/* Login Status */}
          {!isLoggedIn ? (
            <div className="space-y-4 mb-8">
              <button
                onClick={handleDemoLogin}
                className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-6 py-3 rounded-lg hover:from-cyan-600 hover:to-purple-600"
              >
                Demo Login
              </button>
              <div className="space-y-2">
                <p className="text-gray-300">
                  New to WisdomOS?{' '}
                  <Link href="/signup" className="text-cyan-400 hover:text-cyan-300">
                    Create an Account
                  </Link>
                </p>
                <p className="text-gray-300">
                  Already have an account?{' '}
                  <Link href="/login" className="text-cyan-400 hover:text-cyan-300">
                    Sign In
                  </Link>
                </p>
              </div>
            </div>
          ) : (
            <p className="text-cyan-300 mb-8">✓ Logged in as Demo User</p>
          )}
          
          {/* Daily Wisdom Quote */}
          <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-12">
            <h2 className="text-xl font-semibold mb-4 text-cyan-300">Daily Wisdom</h2>
            <blockquote className="text-lg italic mb-2">&ldquo;{wisdom}&rdquo;</blockquote>
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

            <Link href="/contributions" className="group">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <div className="text-4xl mb-4">💎</div>
                <h3 className="text-xl font-semibold mb-2">Contributions</h3>
                <p className="text-sm text-gray-300">Your unique gifts and strengths</p>
              </div>
            </Link>

            <Link href="/autobiography" className="group">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <div className="text-4xl mb-4">📖</div>
                <h3 className="text-xl font-semibold mb-2">Autobiography</h3>
                <p className="text-sm text-gray-300">Year-by-year life reflections</p>
              </div>
            </Link>

            <Link href="/fulfillment" className="group">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold mb-2">Fulfillment</h3>
                <p className="text-sm text-gray-300">Life areas and commitments</p>
              </div>
            </Link>

            <Link href="/assessments" className="group">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <div className="text-4xl mb-4">📈</div>
                <h3 className="text-xl font-semibold mb-2">Assessments</h3>
                <p className="text-sm text-gray-300">Relationship quality tracking</p>
              </div>
            </Link>

            <Link href="/interactions" className="group">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <div className="text-4xl mb-4">💬</div>
                <h3 className="text-xl font-semibold mb-2">Interactions</h3>
                <p className="text-sm text-gray-300">Communication logging</p>
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
          </div>
        </div>
      </div>
    </div>
  )
}