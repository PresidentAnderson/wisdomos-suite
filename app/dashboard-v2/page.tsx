'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function DashboardV2Page() {
  const [user, setUser] = useState<{ name?: string; sub?: string } | null>(null)
  const [stats, setStats] = useState({
    goals: 0,
    journal: 0,
    contacts: 0,
    contributions: 0,
    autobiographyYears: 0,
    interactions: 0,
    assessments: 0,
    lifeAreas: 12
  })
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    fetchStats()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/')
        return
      }

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        router.push('/')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/')
    }
  }

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token')
      
      // Fetch goals count
      const goalsResponse = await fetch('/api/goals', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (goalsResponse.ok) {
        const goals = await goalsResponse.json()
        stats.goals = goals.filter((g: { isCompleted: boolean }) => !g.isCompleted).length
      }

      // Fetch contributions count
      const contribResponse = await fetch('/api/contributions', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (contribResponse.ok) {
        const contribs = await contribResponse.json()
        stats.contributions = contribs.length
      }

      // Fetch autobiography entries
      const autoResponse = await fetch('/api/autobiography', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (autoResponse.ok) {
        const entries = await autoResponse.json()
        stats.autobiographyYears = entries.length
      }

      // Fetch contacts count
      const contactsResponse = await fetch('/api/contacts', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (contactsResponse.ok) {
        const contacts = await contactsResponse.json()
        stats.contacts = contacts.length
      }

      setStats({ ...stats })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/')
  }

  const features = [
    {
      title: 'Goals',
      icon: '🎯',
      description: 'Track aspirations with purpose',
      link: '/goals',
      color: 'from-blue-500 to-indigo-600',
      stat: stats.goals,
      statLabel: 'Active'
    },
    {
      title: 'Journal',
      icon: '📝',
      description: 'Capture thoughts & voice notes',
      link: '/journal',
      color: 'from-purple-500 to-pink-600',
      stat: stats.journal,
      statLabel: 'Entries'
    },
    {
      title: 'Contacts',
      icon: '👥',
      description: 'Manage your network',
      link: '/contacts',
      color: 'from-green-500 to-teal-600',
      stat: stats.contacts,
      statLabel: 'People'
    },
    {
      title: 'Life Areas',
      icon: '🌟',
      description: 'Balance all life dimensions',
      link: '/fulfillment',
      color: 'from-yellow-500 to-orange-600',
      stat: stats.lifeAreas,
      statLabel: 'Areas'
    },
    {
      title: 'Contributions',
      icon: '💎',
      description: 'Your unique gifts',
      link: '/contributions',
      color: 'from-cyan-500 to-blue-600',
      stat: stats.contributions,
      statLabel: 'Gifts'
    },
    {
      title: 'Autobiography',
      icon: '📖',
      description: 'Document your life story',
      link: '/autobiography',
      color: 'from-indigo-500 to-purple-600',
      stat: stats.autobiographyYears,
      statLabel: 'Years'
    },
    {
      title: 'Interactions',
      icon: '💬',
      description: 'Track communications',
      link: '/interactions',
      color: 'from-pink-500 to-rose-600',
      stat: stats.interactions,
      statLabel: 'Logged'
    },
    {
      title: 'Assessments',
      icon: '📊',
      description: 'Relationship health',
      link: '/assessments',
      color: 'from-teal-500 to-green-600',
      stat: stats.assessments,
      statLabel: 'Reviews'
    },
    {
      title: 'Wisdom Center',
      icon: '🧭',
      description: 'Central navigation hub',
      link: '/wisdom-center',
      color: 'from-purple-500 to-indigo-600',
      stat: null,
      statLabel: null
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-white">
              WisdomOS
            </Link>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/dashboard" className="text-cyan-400">Dashboard</Link>
              <Link href="/goals" className="text-white/70 hover:text-white">Goals</Link>
              <Link href="/journal" className="text-white/70 hover:text-white">Journal</Link>
              <Link href="/contacts" className="text-white/70 hover:text-white">Contacts</Link>
              <Link href="/fulfillment" className="text-white/70 hover:text-white">Life Areas</Link>
              <Link href="/settings" className="text-white/70 hover:text-white">Settings</Link>
              <button
                onClick={handleLogout}
                className="text-white/70 hover:text-white"
              >
                Logout
              </button>
            </nav>
            <button className="md:hidden text-white">☰</button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Welcome back, {user?.name || 'User'}
          </h1>
          <p className="text-gray-300 text-lg">
            Your personal growth operating system - now with voice journaling 🎙️
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-lg rounded-xl p-4 border border-cyan-500/30">
            <div className="text-2xl font-bold text-white">{stats.goals}</div>
            <div className="text-gray-300 text-sm">Active Goals</div>
          </div>
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-lg rounded-xl p-4 border border-green-500/30">
            <div className="text-2xl font-bold text-white">{stats.contacts}</div>
            <div className="text-gray-300 text-sm">Contacts</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-xl p-4 border border-purple-500/30">
            <div className="text-2xl font-bold text-white">{stats.contributions}</div>
            <div className="text-gray-300 text-sm">Contributions</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-lg rounded-xl p-4 border border-yellow-500/30">
            <div className="text-2xl font-bold text-white">{stats.autobiographyYears}</div>
            <div className="text-gray-300 text-sm">Years Documented</div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {features.map((feature) => (
            <Link key={feature.title} href={feature.link} className="block group">
              <div className="relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-20 group-hover:opacity-30 transition-opacity`}></div>
                <div className="relative p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">{feature.icon}</div>
                    {feature.stat !== null && (
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">{feature.stat}</div>
                        <div className="text-xs text-gray-300">{feature.statLabel}</div>
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-300 text-sm">{feature.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => router.push('/journal')}
              className="bg-gradient-to-r from-red-500 to-pink-500 text-white p-4 rounded-lg hover:from-red-600 hover:to-pink-600 transition-all text-center"
            >
              <div className="text-2xl mb-2">🎙️</div>
              <div>Voice Journal</div>
            </button>
            
            <button
              onClick={() => router.push('/goals')}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-4 rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all text-center"
            >
              <div className="text-2xl mb-2">➕</div>
              <div>New Goal</div>
            </button>
            
            <button
              onClick={() => router.push('/contacts')}
              className="bg-gradient-to-r from-green-500 to-teal-500 text-white p-4 rounded-lg hover:from-green-600 hover:to-teal-600 transition-all text-center"
            >
              <div className="text-2xl mb-2">👤</div>
              <div>Add Contact</div>
            </button>
            
            <button
              onClick={() => router.push('/fulfillment')}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-4 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all text-center"
            >
              <div className="text-2xl mb-2">📈</div>
              <div>Life Check-in</div>
            </button>
          </div>
        </div>

        {/* Daily Wisdom */}
        <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 backdrop-blur-lg rounded-xl p-8 border border-indigo-500/30 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Daily Wisdom</h2>
          <p className="text-xl text-gray-200 italic mb-4">
            &ldquo;The unexamined life is not worth living.&rdquo;
          </p>
          <p className="text-lg text-gray-300">— Socrates</p>
          <div className="mt-6">
            <Link 
              href="/journal"
              className="inline-block bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg transition-all"
            >
              📝 Reflect on Today
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}