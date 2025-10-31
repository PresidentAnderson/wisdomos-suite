'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Book, FileText, Video, Download, Search, Filter,
  ChevronRight, Clock, User, Tag, Star, BookOpen,
  Code, Zap, Shield, Users, Cloud, Smartphone,
  Globe, Database, Lock, Settings, HelpCircle,
  PlayCircle, FileCode, Terminal, GitBranch
} from 'lucide-react';

interface DocCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  count: number;
  featured?: boolean;
}

interface DocItem {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'guide' | 'tutorial' | 'api' | 'video' | 'reference';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  readTime: string;
  author: string;
  lastUpdated: string;
  tags: string[];
  views: number;
  rating: number;
  url?: string;
}

export default function DocumentationCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);

  const categories: DocCategory[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      description: 'Quick start guides and basic concepts',
      icon: <Zap className="w-6 h-6" />,
      color: 'bg-green-500',
      count: 12,
      featured: true
    },
    {
      id: 'user-guides',
      title: 'User Guides',
      description: 'Comprehensive guides for all features',
      icon: <Book className="w-6 h-6" />,
      color: 'bg-blue-500',
      count: 45
    },
    {
      id: 'api-reference',
      title: 'API Reference',
      description: 'Complete API documentation',
      icon: <Code className="w-6 h-6" />,
      color: 'bg-purple-500',
      count: 68
    },
    {
      id: 'video-tutorials',
      title: 'Video Tutorials',
      description: 'Step-by-step video guides',
      icon: <PlayCircle className="w-6 h-6" />,
      color: 'bg-red-500',
      count: 23
    },
    {
      id: 'mobile-apps',
      title: 'Mobile Apps',
      description: 'iOS and Android documentation',
      icon: <Smartphone className="w-6 h-6" />,
      color: 'bg-orange-500',
      count: 18
    },
    {
      id: 'integrations',
      title: 'Integrations',
      description: 'Third-party integrations and webhooks',
      icon: <GitBranch className="w-6 h-6" />,
      color: 'bg-teal-500',
      count: 15
    },
    {
      id: 'security',
      title: 'Security',
      description: 'Security best practices and guidelines',
      icon: <Shield className="w-6 h-6" />,
      color: 'bg-indigo-500',
      count: 8
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      description: 'Common issues and solutions',
      icon: <HelpCircle className="w-6 h-6" />,
      color: 'bg-yellow-500',
      count: 34
    }
  ];

  const featuredDocs: DocItem[] = [
    {
      id: '1',
      title: 'WisdomOS Quick Start Guide',
      description: 'Get up and running with WisdomOS in 5 minutes',
      category: 'getting-started',
      type: 'guide',
      difficulty: 'beginner',
      readTime: '5 min',
      author: 'WisdomOS Team',
      lastUpdated: '2 days ago',
      tags: ['quickstart', 'basics', 'setup'],
      views: 15234,
      rating: 4.8
    },
    {
      id: '2',
      title: 'Understanding Contribution Display',
      description: 'Learn how to create and manage your contribution display',
      category: 'user-guides',
      type: 'tutorial',
      difficulty: 'intermediate',
      readTime: '10 min',
      author: 'Sarah Chen',
      lastUpdated: '1 week ago',
      tags: ['contributions', 'display', 'canvas'],
      views: 8432,
      rating: 4.6
    },
    {
      id: '3',
      title: 'Sync API Documentation',
      description: 'Complete reference for the cross-platform sync API',
      category: 'api-reference',
      type: 'api',
      difficulty: 'advanced',
      readTime: '20 min',
      author: 'Tech Team',
      lastUpdated: '3 days ago',
      tags: ['api', 'sync', 'websocket'],
      views: 5123,
      rating: 4.9
    },
    {
      id: '4',
      title: 'Setting Up Your Legacy Vault',
      description: 'Video tutorial on creating and securing your legacy vault',
      category: 'video-tutorials',
      type: 'video',
      difficulty: 'beginner',
      readTime: '15 min',
      author: 'Michael Ross',
      lastUpdated: '5 days ago',
      tags: ['legacy', 'vault', 'security'],
      views: 12456,
      rating: 4.7
    }
  ];

  const allDocs: DocItem[] = [
    ...featuredDocs,
    {
      id: '5',
      title: 'Mobile App Installation Guide',
      description: 'Step-by-step guide for iOS and Android app installation',
      category: 'mobile-apps',
      type: 'guide',
      difficulty: 'beginner',
      readTime: '3 min',
      author: 'Mobile Team',
      lastUpdated: '1 day ago',
      tags: ['mobile', 'ios', 'android', 'installation'],
      views: 6789,
      rating: 4.5
    },
    {
      id: '6',
      title: 'Authentication & Authorization',
      description: 'Implementing secure authentication in your integrations',
      category: 'security',
      type: 'reference',
      difficulty: 'advanced',
      readTime: '15 min',
      author: 'Security Team',
      lastUpdated: '4 days ago',
      tags: ['auth', 'jwt', 'oauth', 'security'],
      views: 3456,
      rating: 4.8
    },
    {
      id: '7',
      title: 'Autobiography Timeline Tutorial',
      description: 'Creating and managing your life timeline',
      category: 'user-guides',
      type: 'tutorial',
      difficulty: 'intermediate',
      readTime: '12 min',
      author: 'Content Team',
      lastUpdated: '1 week ago',
      tags: ['autobiography', 'timeline', 'milestones'],
      views: 9876,
      rating: 4.6
    },
    {
      id: '8',
      title: 'Troubleshooting Sync Issues',
      description: 'Common sync problems and their solutions',
      category: 'troubleshooting',
      type: 'guide',
      difficulty: 'intermediate',
      readTime: '8 min',
      author: 'Support Team',
      lastUpdated: '2 days ago',
      tags: ['sync', 'troubleshooting', 'errors'],
      views: 4321,
      rating: 4.4
    }
  ];

  const filteredDocs = allDocs.filter(doc => {
    const matchesSearch = !searchQuery || 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = !selectedCategory || doc.category === selectedCategory;
    const matchesDifficulty = !selectedDifficulty || doc.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-black bg-green-100';
      case 'intermediate': return 'text-black bg-yellow-100';
      case 'advanced': return 'text-black bg-red-100';
      default: return 'text-black bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'guide': return <Book className="w-4 h-4" />;
      case 'tutorial': return <FileText className="w-4 h-4" />;
      case 'api': return <Code className="w-4 h-4" />;
      case 'video': return <PlayCircle className="w-4 h-4" />;
      case 'reference': return <FileCode className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-black">
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl font-bold mb-4">Documentation Center</h1>
            <p className="text-xl text-black mb-8">
              Everything you need to master WisdomOS
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black" />
                <input
                  type="text"
                  placeholder="Search documentation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl text-black placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/30"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-black dark:text-black text-sm">Total Docs</p>
                <p className="text-2xl font-bold text-black dark:text-black">238</p>
              </div>
              <FileText className="w-8 h-8 text-black" />
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-black dark:text-black text-sm">Video Tutorials</p>
                <p className="text-2xl font-bold text-black dark:text-black">23</p>
              </div>
              <Video className="w-8 h-8 text-black" />
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-black dark:text-black text-sm">API Endpoints</p>
                <p className="text-2xl font-bold text-black dark:text-black">68</p>
              </div>
              <Code className="w-8 h-8 text-black" />
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-black dark:text-black text-sm">Avg Rating</p>
                <p className="text-2xl font-bold text-black dark:text-black">4.7</p>
              </div>
              <Star className="w-8 h-8 text-black" />
            </div>
          </motion.div>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-black dark:text-black mb-4">
            Browse by Category
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((category, index) => (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedCategory(
                  selectedCategory === category.id ? null : category.id
                )}
                className={`
                  relative p-4 rounded-xl text-left transition-all
                  ${selectedCategory === category.id
                    ? 'bg-purple-100 dark:bg-purple-900 ring-2 ring-purple-500'
                    : 'bg-white dark:bg-gray-800 hover:shadow-lg'
                  }
                `}
              >
                {category.featured && (
                  <span className="absolute top-2 right-2 px-2 py-1 bg-yellow-100 text-black text-xs rounded-full">
                    Featured
                  </span>
                )}
                <div className={`${category.color} w-12 h-12 rounded-lg flex items-center justify-center text-black mb-3`}>
                  {category.icon}
                </div>
                <h3 className="font-semibold text-black dark:text-black mb-1">
                  {category.title}
                </h3>
                <p className="text-sm text-black dark:text-black mb-2">
                  {category.description}
                </p>
                <p className="text-xs text-black">
                  {category.count} articles
                </p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedDifficulty(null)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              !selectedDifficulty
                ? 'bg-purple-600 text-black'
                : 'bg-white dark:bg-gray-800 text-black dark:text-black hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            All Levels
          </button>
          {['beginner', 'intermediate', 'advanced'].map(level => (
            <button
              key={level}
              onClick={() => setSelectedDifficulty(level)}
              className={`px-4 py-2 rounded-lg transition-colors capitalize ${
                selectedDifficulty === level
                  ? 'bg-purple-600 text-black'
                  : 'bg-white dark:bg-gray-800 text-black dark:text-black hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {level}
            </button>
          ))}
        </div>

        {/* Documentation List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredDocs.map((doc, index) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-xl transition-all p-6 cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getTypeIcon(doc.type)}
                    <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(doc.difficulty)}`}>
                      {doc.difficulty}
                    </span>
                    <span className="text-xs text-black dark:text-black">
                      {doc.readTime} read
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-black dark:text-black mb-2 group-hover:text-black dark:group-hover:text-black transition-colors">
                    {doc.title}
                  </h3>
                  <p className="text-black dark:text-black mb-3">
                    {doc.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {doc.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-black dark:text-black text-xs rounded-md"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-black group-hover:text-black dark:group-hover:text-black transition-colors" />
              </div>
              
              <div className="flex items-center justify-between text-sm text-black dark:text-black">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {doc.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {doc.lastUpdated}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-black" />
                    {doc.rating}
                  </span>
                  <span className="text-black">
                    {doc.views.toLocaleString()} views
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Help Section */}
        <div className="mt-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-black">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Need More Help?</h2>
            <p className="text-black mb-6">
              Can't find what you're looking for? Our support team is here to help you 24/7
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors">
                Contact Support
              </button>
              <button className="px-6 py-3 bg-purple-700 text-black rounded-lg font-medium hover:bg-purple-800 transition-colors">
                Join Community
              </button>
              <button className="px-6 py-3 bg-purple-700 text-black rounded-lg font-medium hover:bg-purple-800 transition-colors">
                Watch Video Tour
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}