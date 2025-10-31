'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Library() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const wisdomContent = [
    {
      id: 1,
      type: 'quote',
      title: 'On Knowledge and Wisdom',
      author: 'Socrates',
      content: 'The only true wisdom is in knowing you know nothing.',
      category: 'philosophy',
      likes: 245,
      saved: true
    },
    {
      id: 2,
      type: 'article',
      title: 'The Art of Living Mindfully',
      author: 'Thich Nhat Hanh',
      content: 'Mindfulness is the energy that helps us recognize the conditions of happiness that are already present in our lives.',
      category: 'mindfulness',
      likes: 189,
      saved: false,
      readTime: '5 min'
    },
    {
      id: 3,
      type: 'video',
      title: 'The Power of Now',
      author: 'Eckhart Tolle',
      content: 'Realize deeply that the present moment is all you ever have. Make the Now the primary focus of your life.',
      category: 'spirituality',
      likes: 342,
      saved: true,
      duration: '12:34'
    },
    {
      id: 4,
      type: 'book',
      title: 'Meditations',
      author: 'Marcus Aurelius',
      content: 'You have power over your mind - not outside events. Realize this, and you will find strength.',
      category: 'stoicism',
      likes: 567,
      saved: true,
      pages: 254
    },
    {
      id: 5,
      type: 'quote',
      title: 'On Change',
      author: 'Heraclitus',
      content: 'No man ever steps in the same river twice, for it is not the same river and he is not the same man.',
      category: 'philosophy',
      likes: 128,
      saved: false
    },
    {
      id: 6,
      type: 'article',
      title: 'The Beginner\'s Mind',
      author: 'Shunryu Suzuki',
      content: 'In the beginner\'s mind there are many possibilities, in the expert\'s mind there are few.',
      category: 'zen',
      likes: 203,
      saved: false,
      readTime: '8 min'
    }
  ];

  const categories = [
    { id: 'all', name: 'All', icon: '📖' },
    { id: 'philosophy', name: 'Philosophy', icon: '🏛️' },
    { id: 'mindfulness', name: 'Mindfulness', icon: '🧘' },
    { id: 'stoicism', name: 'Stoicism', icon: '⚔️' },
    { id: 'spirituality', name: 'Spirituality', icon: '✨' },
    { id: 'zen', name: 'Zen', icon: '☯️' }
  ];

  const contentTypes = [
    { id: 'quote', name: 'Quotes', icon: '💬' },
    { id: 'article', name: 'Articles', icon: '📄' },
    { id: 'video', name: 'Videos', icon: '🎥' },
    { id: 'book', name: 'Books', icon: '📚' }
  ];

  const filteredContent = wisdomContent.filter(item => {
    const matchesFilter = activeFilter === 'all' || item.category === activeFilter;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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
              <Link href="/goals" className="text-white/70 hover:text-white">Goals</Link>
              <Link href="/library" className="text-cyan-400">Library</Link>
            </nav>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Wisdom Library</h1>
          <p className="text-gray-400">Explore timeless wisdom from great minds throughout history</p>
        </div>

        {/* Search Bar */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10 mb-8">
          <div className="flex items-center space-x-4">
            <span className="text-2xl">🔍</span>
            <input
              type="text"
              placeholder="Search for wisdom, authors, or topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Categories */}
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setActiveFilter(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                      activeFilter === category.id
                        ? 'bg-cyan-500/20 text-cyan-400'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Content Types */}
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Content Types</h3>
              <div className="space-y-2">
                {contentTypes.map(type => (
                  <div key={type.id} className="flex items-center space-x-2 text-gray-400">
                    <span>{type.icon}</span>
                    <span>{type.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reading List */}
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Your Reading List</h3>
              <div className="space-y-2 text-sm">
                <div className="text-gray-400">📚 Meditations - Marcus Aurelius</div>
                <div className="text-gray-400">🎥 The Power of Now - E. Tolle</div>
                <div className="text-gray-400">💬 Socrates Collection</div>
              </div>
              <button className="w-full mt-4 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 py-2 rounded-lg transition-colors">
                View All Saved
              </button>
            </div>
          </div>

          {/* Content Grid */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredContent.map(item => (
              <div key={item.id} className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">
                      {item.type === 'quote' ? '💬' : 
                       item.type === 'article' ? '📄' :
                       item.type === 'video' ? '🎥' : '📚'}
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                      <p className="text-gray-400 text-sm">{item.author}</p>
                    </div>
                  </div>
                  <button className={`text-2xl ${item.saved ? 'text-yellow-400' : 'text-gray-600'}`}>
                    {item.saved ? '⭐' : '☆'}
                  </button>
                </div>

                <p className="text-gray-300 mb-4 line-clamp-3">{item.content}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded-md text-xs">
                      {item.category}
                    </span>
                    {item.readTime && (
                      <span className="text-gray-400 text-sm">📖 {item.readTime}</span>
                    )}
                    {item.duration && (
                      <span className="text-gray-400 text-sm">⏱️ {item.duration}</span>
                    )}
                    {item.pages && (
                      <span className="text-gray-400 text-sm">📄 {item.pages} pages</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="text-gray-400 hover:text-red-400">❤️</button>
                    <span className="text-gray-400 text-sm">{item.likes}</span>
                  </div>
                </div>

                <div className="mt-4 flex space-x-2">
                  <button className="flex-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 py-2 rounded-lg transition-colors text-sm">
                    {item.type === 'video' ? 'Watch' : 'Read More'}
                  </button>
                  <button className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors">
                    📤
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Collection */}
        <div className="mt-12 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-xl p-8 border border-purple-500/30">
          <h2 className="text-2xl font-bold text-white mb-4">Featured Collection: Ancient Wisdom</h2>
          <p className="text-gray-300 mb-6">Explore the timeless teachings of ancient philosophers and spiritual masters.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2">Stoic Philosophy</h4>
              <p className="text-gray-400 text-sm">Marcus Aurelius, Seneca, Epictetus</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2">Eastern Wisdom</h4>
              <p className="text-gray-400 text-sm">Lao Tzu, Buddha, Confucius</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2">Greek Philosophy</h4>
              <p className="text-gray-400 text-sm">Socrates, Plato, Aristotle</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}