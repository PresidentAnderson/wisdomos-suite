'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight, ChevronDown, Book, Home, Settings, Users,
  Download, Upload, HelpCircle, Mail, Zap, Database,
  Layout, BarChart3, Calendar, RefreshCw, Circle,
  Edit, Bell, Palette, MessageSquare, AlertCircle,
  CheckCircle, XCircle, PenTool, MapPin, TrendingUp,
  Shield, Heart, Brain, Target, Layers, Send,
  BookOpen, FileText, Video, Code, Terminal
} from 'lucide-react';

interface MenuItem {
  id: string;
  title: string;
  icon?: React.ReactNode;
  path?: string;
  subItems?: MenuItem[];
  description?: string;
  status?: 'new' | 'updated' | 'beta';
}

const documentationMenu: MenuItem[] = [
  {
    id: 'getting-started',
    title: '1. Getting Started',
    icon: <Zap className="w-4 h-4" />,
    subItems: [
      {
        id: 'installation',
        title: '1.1 Installation & Setup',
        path: '/docs/getting-started/installation',
        icon: <Download className="w-4 h-4" />,
        description: 'Set up WisdomOS on your devices'
      },
      {
        id: 'profile',
        title: '1.2 Creating Your Profile',
        path: '/docs/getting-started/profile',
        icon: <Users className="w-4 h-4" />,
        description: 'Build your personal wisdom profile'
      },
      {
        id: 'cloud',
        title: '1.3 Connecting to WisdomOS Cloud',
        path: '/docs/getting-started/cloud',
        icon: <Upload className="w-4 h-4" />,
        description: 'Sync across iOS, Android, and SaaS platforms',
        status: 'new'
      }
    ]
  },
  {
    id: 'core-tools',
    title: '2. Core Tools',
    icon: <Layout className="w-4 h-4" />,
    subItems: [
      {
        id: 'contribution-display',
        title: '2.1 Contribution Display',
        icon: <Heart className="w-4 h-4" />,
        subItems: [
          {
            id: 'contrib-what',
            title: 'What It Is',
            path: '/docs/core-tools/contribution/what',
            description: 'Understanding your contribution patterns'
          },
          {
            id: 'contrib-create',
            title: 'How to Create Yours',
            path: '/docs/core-tools/contribution/create',
            description: 'Step-by-step creation guide'
          },
          {
            id: 'contrib-update',
            title: 'Updating & Using It',
            path: '/docs/core-tools/contribution/update',
            description: 'Keep your display current and meaningful'
          }
        ]
      },
      {
        id: 'fulfillment-display',
        title: '2.2 Fulfillment Display',
        icon: <Target className="w-4 h-4" />,
        status: 'updated',
        subItems: [
          {
            id: 'life-areas',
            title: 'Mapping Life Areas',
            path: '/docs/core-tools/fulfillment/life-areas',
            description: 'Work, Health, Finance, and more'
          },
          {
            id: 'relationships',
            title: 'Relationship Frequency & Circles',
            path: '/docs/core-tools/fulfillment/relationships',
            description: 'Visualize your connection patterns'
          },
          {
            id: 'snapshots',
            title: 'Monthly Snapshots & Trends',
            path: '/docs/core-tools/fulfillment/snapshots',
            description: 'Track changes over time'
          },
          {
            id: 'commitments',
            title: 'Using It to Shift Commitments',
            path: '/docs/core-tools/fulfillment/commitments',
            description: 'Realign your priorities'
          }
        ]
      },
      {
        id: 'autobiography',
        title: '2.3 Autobiography Journal',
        icon: <BookOpen className="w-4 h-4" />,
        subItems: [
          {
            id: 'scaffolding',
            title: 'Year-by-Year Scaffolding',
            path: '/docs/core-tools/autobiography/scaffolding',
            description: 'Structure your life story'
          },
          {
            id: 'logging',
            title: 'Logging Upsets & Breakthroughs',
            path: '/docs/core-tools/autobiography/logging',
            description: 'Capture pivotal moments'
          },
          {
            id: 'linking',
            title: 'Linking to Fulfillment Display',
            path: '/docs/core-tools/autobiography/linking',
            description: 'Connect your story to your growth'
          }
        ]
      },
      {
        id: 'boundary-audit',
        title: '2.4 Boundary Audit & Reset',
        icon: <Shield className="w-4 h-4" />,
        subItems: [
          {
            id: 'audit-log',
            title: 'Monthly Audit Log',
            path: '/docs/core-tools/boundary/audit-log',
            description: 'Track your boundaries systematically'
          },
          {
            id: 'color-tracker',
            title: 'Color-Coded Tracker',
            path: '/docs/core-tools/boundary/color-tracker',
            description: 'Red, Yellow, Green status system'
          },
          {
            id: 'reset-ritual',
            title: 'Reset Ritual Guide',
            path: '/docs/core-tools/boundary/reset-ritual',
            description: '5-step boundary restoration process'
          }
        ]
      }
    ]
  },
  {
    id: 'advanced',
    title: '3. Advanced Features',
    icon: <Brain className="w-4 h-4" />,
    subItems: [
      {
        id: 'relationship-mapping',
        title: '3.1 Relationship Mapping',
        path: '/docs/advanced/relationship-mapping',
        icon: <Circle className="w-4 h-4" />,
        description: 'Interactive relationship circles',
        status: 'beta'
      },
      {
        id: 'boundary-notes',
        title: '3.2 Boundary Notes Tooltips',
        path: '/docs/advanced/boundary-notes',
        icon: <MessageSquare className="w-4 h-4" />,
        description: 'Contextual boundary information'
      },
      {
        id: 'moving-average',
        title: '3.3 3-Month Moving Average View',
        path: '/docs/advanced/moving-average',
        icon: <TrendingUp className="w-4 h-4" />,
        description: 'See trends and patterns'
      },
      {
        id: 'send-autobiography',
        title: '3.4 "Send to Autobiography" Button',
        path: '/docs/advanced/send-autobiography',
        icon: <Send className="w-4 h-4" />,
        description: 'Quick journal entries from anywhere'
      }
    ]
  },
  {
    id: 'community',
    title: '4. Community Integration',
    icon: <Users className="w-4 h-4" />,
    subItems: [
      {
        id: 'upload-wisdom',
        title: '4.1 Uploading to Wisdom Course Community',
        path: '/docs/community/upload',
        icon: <Upload className="w-4 h-4" />,
        description: 'Share your wisdom journey'
      },
      {
        id: 'share-leaders',
        title: '4.2 Sharing with Course Leaders',
        path: '/docs/community/leaders',
        icon: <Users className="w-4 h-4" />,
        description: 'Connect with facilitators'
      },
      {
        id: 'link-events',
        title: '4.3 Linking with Events & Gatherings',
        path: '/docs/community/events',
        icon: <Calendar className="w-4 h-4" />,
        description: 'Integrate with live sessions'
      }
    ]
  },
  {
    id: 'customization',
    title: '5. Customization',
    icon: <Palette className="w-4 h-4" />,
    subItems: [
      {
        id: 'new-areas',
        title: '5.1 Adding New Life Areas',
        path: '/docs/customization/areas',
        icon: <Layers className="w-4 h-4" />,
        description: 'Personalize your tracking categories'
      },
      {
        id: 'color-settings',
        title: '5.2 Color Key & Status Settings',
        path: '/docs/customization/colors',
        icon: <Palette className="w-4 h-4" />,
        description: 'Customize visual indicators'
      },
      {
        id: 'notifications',
        title: '5.3 Notification & Reset Preferences',
        path: '/docs/customization/notifications',
        icon: <Bell className="w-4 h-4" />,
        description: 'Control alerts and reminders'
      }
    ]
  },
  {
    id: 'support',
    title: '6. Support',
    icon: <HelpCircle className="w-4 h-4" />,
    subItems: [
      {
        id: 'faqs',
        title: '6.1 FAQs',
        path: '/docs/support/faqs',
        icon: <MessageSquare className="w-4 h-4" />,
        description: 'Common questions answered'
      },
      {
        id: 'troubleshooting',
        title: '6.2 Troubleshooting',
        path: '/docs/support/troubleshooting',
        icon: <AlertCircle className="w-4 h-4" />,
        description: 'Solve common issues'
      },
      {
        id: 'contact',
        title: '6.3 Contact Course Manager',
        path: '/docs/support/contact',
        icon: <Mail className="w-4 h-4" />,
        description: 'Get personalized help'
      }
    ]
  }
];

// Quick Start Guide sections
const quickStartSteps = [
  {
    step: 1,
    title: 'Start with the Contribution Display',
    description: 'Interview people close to you (per Weekend One instructions). Upload their reflections → system generates your first visual.',
    icon: <Heart className="w-5 h-5" />
  },
  {
    step: 2,
    title: 'Build Your Fulfillment Display',
    description: 'Add Life Areas (Work, Health, Finance, etc.). Enter people tied to each area. System creates proportional relationship circles.',
    icon: <Target className="w-5 h-5" />
  },
  {
    step: 3,
    title: 'Track Progress Monthly',
    description: 'Each month, update the Boundary Audit Log (red/yellow/green). Toggle "Snapshot" mode to see shifts over time.',
    icon: <Calendar className="w-5 h-5" />
  },
  {
    step: 4,
    title: 'Handle Upsets & Drifts',
    description: 'Use the Reset Ritual when a boundary collapses (5-step guide in app). Log the event → it links into your Autobiography timeline.',
    icon: <RefreshCw className="w-5 h-5" />
  },
  {
    step: 5,
    title: 'Keep Your Autobiography Current',
    description: 'Each entry is tagged by Life Area. Toggle "Send to Autobiography" inside any note box.',
    icon: <BookOpen className="w-5 h-5" />
  },
  {
    step: 6,
    title: 'Engage With Community',
    description: 'Share selected visuals or notes at course gatherings. Course leaders may prompt reflection using your Fulfillment Display.',
    icon: <Users className="w-5 h-5" />
  }
];

export default function DocumentationSidebar() {
  const [expandedItems, setExpandedItems] = useState<string[]>(['getting-started']);
  const [showQuickStart, setShowQuickStart] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();

  const toggleExpand = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const isActive = (path?: string) => path && pathname === path;

  // Filter menu items based on search query
  const filterMenuItems = (items: MenuItem[], query: string): MenuItem[] => {
    if (!query.trim()) return items;
    
    const searchLower = query.toLowerCase();
    
    return items.reduce<MenuItem[]>((filtered, item) => {
      const titleMatch = item.title.toLowerCase().includes(searchLower);
      const descriptionMatch = item.description?.toLowerCase().includes(searchLower);
      
      // Check if any sub-items match
      const filteredSubItems = item.subItems 
        ? filterMenuItems(item.subItems, query)
        : [];
      
      // Include item if it matches or has matching sub-items
      if (titleMatch || descriptionMatch || filteredSubItems.length > 0) {
        filtered.push({
          ...item,
          subItems: filteredSubItems.length > 0 ? filteredSubItems : item.subItems
        });
      }
      
      return filtered;
    }, []);
  };

  const filteredMenu = filterMenuItems(documentationMenu, searchQuery);

  // Auto-expand items when searching
  useEffect(() => {
    if (searchQuery.trim()) {
      const expandableItems = filteredMenu
        .filter(item => item.subItems && item.subItems.length > 0)
        .map(item => item.id);
      setExpandedItems(expandableItems);
    }
  }, [searchQuery, filteredMenu]);

  const renderMenuItem = (item: MenuItem, depth = 0): JSX.Element => {
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const active = isActive(item.path);

    return (
      <div key={item.id} className={depth > 0 ? 'ml-4' : ''}>
        <div
          className={`
            flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer
            transition-all duration-200 group
            ${active
              ? 'bg-purple-100 dark:bg-purple-900 text-black dark:text-black'
              : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-black dark:text-black'
            }
            ${depth === 0 ? 'font-semibold' : 'text-sm'}
          `}
          onClick={() => {
            if (hasSubItems) {
              toggleExpand(item.id);
            }
          }}
        >
          <Link
            href={item.path || '#'}
            className="flex items-center space-x-2 flex-1"
            onClick={(e) => {
              if (hasSubItems && !item.path) {
                e.preventDefault();
              }
            }}
          >
            {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
            <span className="flex-1">{item.title}</span>
            {item.status && (
              <span className={`
                px-2 py-0.5 text-xs rounded-full ml-2
                ${item.status === 'new' ? 'bg-green-100 text-black dark:bg-green-900 dark:text-black' :
                  item.status === 'updated' ? 'bg-blue-100 text-black dark:bg-blue-900 dark:text-black' :
                  'bg-yellow-100 text-black dark:bg-yellow-900 dark:text-black'}
              `}>
                {item.status}
              </span>
            )}
          </Link>
          {hasSubItems && (
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
              className="flex-shrink-0"
            >
              <ChevronRight className="w-4 h-4" />
            </motion.div>
          )}
        </div>

        {item.description && depth > 0 && (
          <p className="text-xs text-black dark:text-black px-3 pb-1 ml-6">
            {item.description}
          </p>
        )}

        <AnimatePresence>
          {hasSubItems && isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-1 space-y-0.5">
                {item.subItems.map((subItem) => renderMenuItem(subItem, depth + 1))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="w-80 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-black dark:text-black mb-2">
            📖 Documentation
          </h2>
          <p className="text-sm text-black dark:text-black">
            Your complete guide to WisdomOS
          </p>
        </div>

        {/* Quick Start Toggle */}
        <button
          onClick={() => setShowQuickStart(!showQuickStart)}
          className="w-full mb-4 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-black rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-colors flex items-center justify-between"
        >
          <span>📘 Quick Start Guide</span>
          <motion.div
            animate={{ rotate: showQuickStart ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </button>

        {/* Quick Start Guide */}
        <AnimatePresence>
          {showQuickStart && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-6 overflow-hidden"
            >
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-black dark:text-black mb-3">
                  How to Use the App
                </h3>
                {quickStartSteps.map((step, index) => (
                  <motion.div
                    key={step.step}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex space-x-3"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-black rounded-full flex items-center justify-center text-sm font-bold">
                      {step.step}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-black dark:text-black text-sm mb-1">
                        {step.title}
                      </h4>
                      <p className="text-xs text-black dark:text-black">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search documentation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm text-black dark:text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
          <Book className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-black" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black hover:text-black"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search Results */}
        {searchQuery && (
          <div className="mb-4">
            <div className="text-xs uppercase text-black dark:text-black font-semibold mb-2">
              Search Results ({filteredMenu.length})
            </div>
            {filteredMenu.length === 0 && (
              <div className="text-sm text-black dark:text-black py-4 text-center">
                No results found for "{searchQuery}"
              </div>
            )}
          </div>
        )}

        {/* Menu Items */}
        <div className="space-y-1">
          {filteredMenu.map((item) => renderMenuItem(item))}
        </div>

        {/* Help Card */}
        <div className="mt-8 p-4 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg">
          <h3 className="font-semibold text-black dark:text-black mb-2">
            Need Help?
          </h3>
          <p className="text-sm text-black dark:text-black mb-3">
            Can't find what you're looking for?
          </p>
          <button className="w-full px-3 py-2 bg-purple-600 text-black rounded-md text-sm font-medium hover:bg-purple-700 transition-colors">
            Contact Support
          </button>
        </div>

        {/* Version Info */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
          <div className="text-xs text-black dark:text-black space-y-1">
            <p>WisdomOS v3.0.0</p>
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            <p className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-black" />
              All systems operational
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}