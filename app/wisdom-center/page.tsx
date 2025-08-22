'use client'

import { useRouter } from 'next/navigation'

export default function WisdomCenterPage() {
  const router = useRouter()

  const wisdomAreas = [
    { 
      title: 'Goals & Intentions',
      icon: '🎯',
      description: 'Set and track meaningful goals with purpose',
      link: '/goals',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      title: 'Life Fulfillment',
      icon: '🌟',
      description: 'Balance all areas of your life',
      link: '/fulfillment',
      color: 'from-green-500 to-teal-600'
    },
    {
      title: 'Contributions',
      icon: '💎',
      description: 'Document your unique gifts and strengths',
      link: '/contributions',
      color: 'from-purple-500 to-pink-600'
    },
    {
      title: 'Autobiography',
      icon: '📖',
      description: 'Write your life story year by year',
      link: '/autobiography',
      color: 'from-orange-500 to-red-600'
    },
    {
      title: 'Relationships',
      icon: '🤝',
      description: 'Assess and nurture your connections',
      link: '/assessments',
      color: 'from-pink-500 to-rose-600'
    },
    {
      title: 'Interactions',
      icon: '💬',
      description: 'Track meaningful conversations',
      link: '/interactions',
      color: 'from-cyan-500 to-blue-600'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center text-white mb-12">
          <button
            onClick={() => router.push('/')}
            className="mb-6 text-cyan-400 hover:text-cyan-300 flex items-center gap-2 mx-auto"
          >
            ← Back to Home
          </button>
          <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-pink-400">
            Wisdom Center
          </h1>
          <p className="text-xl text-gray-200">Your hub for personal growth and self-discovery</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-cyan-400">12</div>
            <div className="text-sm text-gray-300">Life Areas</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-green-400">8</div>
            <div className="text-sm text-gray-300">Active Goals</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-yellow-400">24</div>
            <div className="text-sm text-gray-300">Insights</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-purple-400">95%</div>
            <div className="text-sm text-gray-300">Growth Score</div>
          </div>
        </div>

        {/* Wisdom Areas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {wisdomAreas.map((area) => (
            <button
              key={area.title}
              onClick={() => router.push(area.link)}
              className="group relative overflow-hidden rounded-2xl transition-all duration-300 transform hover:scale-105"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${area.color} opacity-90`}></div>
              <div className="relative bg-black/20 backdrop-blur-sm p-8 text-white">
                <div className="text-5xl mb-4">{area.icon}</div>
                <h3 className="text-2xl font-bold mb-2">{area.title}</h3>
                <p className="text-gray-200">{area.description}</p>
                <div className="mt-4 text-cyan-300 group-hover:text-cyan-200">
                  Enter →
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Daily Wisdom */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4 text-cyan-300">Daily Wisdom</h2>
          <blockquote className="text-lg italic mb-4">
            &ldquo;The unexamined life is not worth living.&rdquo;
          </blockquote>
          <p className="text-gray-300">— Socrates</p>
        </div>

        {/* Quick Actions */}
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-full hover:from-cyan-600 hover:to-blue-600 transition-all"
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => router.push('/settings')}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            ⚙️ Settings
          </button>
          <button
            onClick={() => alert('Journal feature coming soon!')}
            className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-6 py-3 rounded-full hover:from-green-600 hover:to-teal-600 transition-all"
          >
            ✍️ Quick Journal
          </button>
        </div>
      </div>
    </div>
  )
}