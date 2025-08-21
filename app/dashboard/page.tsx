'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    contributions: 0,
    autobiographyYears: 0,
    boundariesHealthy: 0,
    totalEntries: 0
  })
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    fetchStats()
  }, [])

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

      // Get boundaries from localStorage
      const boundaries = localStorage.getItem('boundaries')
      if (boundaries) {
        const parsed = JSON.parse(boundaries)
        stats.boundariesHealthy = parsed.filter((b: any) => b.status === 'healthy').length
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-white">
              WisdomOS
            </Link>
            <nav className="flex items-center space-x-6">
              <Link href="/dashboard" className="text-cyan-400">Dashboard</Link>
              <Link href="/contributions" className="text-white/70 hover:text-white">Contributions</Link>
              <Link href="/autobiography" className="text-white/70 hover:text-white">Autobiography</Link>
              <Link href="/assessments" className="text-white/70 hover:text-white">Assessments</Link>
              <button
                onClick={handleLogout}
                className="text-white/70 hover:text-white"
              >
                Logout
              </button>
            </nav>
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
            Your personal growth operating system
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-lg rounded-xl p-6 border border-cyan-500/30">
            <div className="text-3xl mb-2">💪</div>
            <div className="text-3xl font-bold text-white mb-1">{stats.contributions}</div>
            <div className="text-gray-300">Contributions</div>
          </div>
          
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-lg rounded-xl p-6 border border-green-500/30">
            <div className="text-3xl mb-2">📚</div>
            <div className="text-3xl font-bold text-white mb-1">{stats.autobiographyYears}</div>
            <div className="text-gray-300">Years Documented</div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30">
            <div className="text-3xl mb-2">🛡️</div>
            <div className="text-3xl font-bold text-white mb-1">{stats.boundariesHealthy}/13</div>
            <div className="text-gray-300">Healthy Boundaries</div>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-lg rounded-xl p-6 border border-yellow-500/30">
            <div className="text-3xl mb-2">✨</div>
            <div className="text-3xl font-bold text-white mb-1">{stats.totalEntries}</div>
            <div className="text-gray-300">Total Entries</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h2 className="text-2xl font-semibold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/contributions"
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white p-4 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all text-center"
            >
              <div className="text-2xl mb-2">➕</div>
              <div>Add Contribution</div>
            </Link>
            
            <Link
              href="/autobiography"
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all text-center"
            >
              <div className="text-2xl mb-2">📝</div>
              <div>Write Autobiography</div>
            </Link>
            
            <Link
              href="/assessments"
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all text-center"
            >
              <div className="text-2xl mb-2">🎯</div>
              <div>Check Boundaries</div>
            </Link>
          </div>
        </div>

        {/* Core Philosophy */}
        <div className="mt-8 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 backdrop-blur-lg rounded-xl p-8 border border-indigo-500/30 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">You Are Already Enough</h2>
          <p className="text-xl text-gray-200">
            Your contribution exists not in what you do, but in who you are being.
          </p>
          <p className="text-lg text-gray-300 mt-4">
            Document your journey. Honor your growth. Trust your wisdom.
          </p>
        </div>
      </div>
    </div>
  )
}