'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, BookOpen, Users, Book, Lock, Users2, Trophy, Cloud,
  Calendar, PenTool, TrendingUp, Target, Layout, MessageSquare,
  Award, Download, Clock, Flag, RefreshCw, FileText, Image,
  Archive, Package, UserCheck, Shield, AlertTriangle, Circle,
  MessageCircle, GraduationCap, CalendarDays, Library, Medal,
  Flame, Zap, HardDrive, Upload, Smartphone, Plus, Heart,
  User, Settings, HelpCircle, LogOut, ChevronDown, ChevronRight,
  Menu, X, Bell, Search, BarChart3, Brain, UserCircle, Crown
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import NotificationPanel from './NotificationPanel';

const iconMap: { [key: string]: any } = {
  Home, BookOpen, Users, Book, Lock, Users2, Trophy, Cloud,
  Calendar, PenTool, TrendingUp, Target, Layout, MessageSquare,
  Award, Download, Clock, Flag, RefreshCw, FileText, Image,
  Archive, Package, UserCheck, Shield, AlertTriangle, Circle,
  MessageCircle, GraduationCap, CalendarDays, Library, Medal,
  Flame, Zap, HardDrive, Upload, Smartphone, Plus, Heart,
  User, Settings, HelpCircle, LogOut, ChevronDown, ChevronRight,
  BarChart3, Brain, Bell, Search, UserCircle, Crown
};

interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  path?: string;
  subItems?: MenuItem[];
  badge?: number | string;
}

const navigationItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'Home',
    path: '/dashboard',
    subItems: [
      { id: 'overview', label: 'Overview', icon: 'BarChart3', path: '/dashboard' },
      { id: 'analytics', label: 'Analytics', icon: 'TrendingUp', path: '/analytics' },
      { id: 'insights', label: 'AI Insights', icon: 'Brain', path: '/dashboard/insights' }
    ]
  },
  {
    id: 'wisdom',
    label: 'Wisdom Tracking',
    icon: 'BookOpen',
    path: '/wisdom',
    subItems: [
      { id: 'daily', label: 'Daily Wisdom', icon: 'Calendar', path: '/wisdom/daily' },
      { id: 'journal', label: 'Journal', icon: 'PenTool', path: '/wisdom/journal' },
      { id: 'metrics', label: 'Metrics', icon: 'TrendingUp', path: '/wisdom/metrics' },
      { id: 'goals', label: 'Goals', icon: 'Target', path: '/wisdom/goals' }
    ]
  },
  {
    id: 'contributions',
    label: 'Contributions',
    icon: 'Users',
    path: '/contributions',
    subItems: [
      { id: 'display', label: 'My Display', icon: 'Layout', path: '/contributions/display' },
      { id: 'feedback', label: 'Feedback', icon: 'MessageSquare', path: '/contributions/feedback', badge: '3' },
      { id: 'recognition', label: 'Recognition', icon: 'Award', path: '/contributions/recognition' },
      { id: 'export', label: 'Export', icon: 'Download', path: '/contributions/export' }
    ]
  },
  {
    id: 'autobiography',
    label: 'Autobiography',
    icon: 'Book',
    path: '/autobiography',
    subItems: [
      { id: 'timeline', label: 'Timeline', icon: 'Clock', path: '/autobiography/timeline' },
      { id: 'milestones', label: 'Milestones', icon: 'Flag', path: '/autobiography/milestones' },
      { id: 'reframing', label: 'Reframing', icon: 'RefreshCw', path: '/autobiography/reframing' },
      { id: 'chapters', label: 'Chapters', icon: 'FileText', path: '/autobiography/chapters' },
      { id: 'media', label: 'Media Gallery', icon: 'Image', path: '/autobiography/media' }
    ]
  },
  {
    id: 'legacy',
    label: 'Legacy Vault',
    icon: 'Lock',
    path: '/legacy',
    subItems: [
      { id: 'vault', label: 'Vault Items', icon: 'Archive', path: '/legacy/vault' },
      { id: 'capsules', label: 'Time Capsules', icon: 'Package', path: '/legacy/capsules' },
      { id: 'beneficiaries', label: 'Beneficiaries', icon: 'UserCheck', path: '/legacy/beneficiaries' },
      { id: 'rules', label: 'Access Rules', icon: 'Shield', path: '/legacy/rules' },
      { id: 'emergency', label: 'Emergency Access', icon: 'AlertTriangle', path: '/legacy/emergency' }
    ]
  },
  {
    id: 'tools',
    label: 'Tools',
    icon: 'PenTool',
    path: '/tools',
    subItems: [
      { id: 'search', label: 'Search', icon: 'Search', path: '/search' },
      { id: 'export', label: 'Export Data', icon: 'Download', path: '/data/export' },
      { id: 'import', label: 'Import Data', icon: 'Upload', path: '/data/import' },
      { id: 'integrations', label: 'Integrations', icon: 'Users2', path: '/integrations' }
    ]
  },
  {
    id: 'community',
    label: 'Community',
    icon: 'Users2',
    path: '/community',
    badge: 'New',
    subItems: [
      { id: 'feed', label: 'Community Feed', icon: 'MessageCircle', path: '/community' },
      { id: 'circles', label: 'Wisdom Circles', icon: 'Circle', path: '/community/circles' },
      { id: 'discussions', label: 'Discussions', icon: 'MessageCircle', path: '/community/discussions', badge: '12' },
      { id: 'mentorship', label: 'Mentorship', icon: 'GraduationCap', path: '/community/mentorship' },
      { id: 'events', label: 'Events', icon: 'CalendarDays', path: '/community/events' },
      { id: 'resources', label: 'Resources', icon: 'Library', path: '/community/resources' }
    ]
  },
  {
    id: 'achievements',
    label: 'Achievements',
    icon: 'Trophy',
    path: '/achievements',
    subItems: [
      { id: 'badges', label: 'Badges', icon: 'Medal', path: '/achievements/badges' },
      { id: 'streaks', label: 'Streaks', icon: 'Flame', path: '/achievements/streaks' },
      { id: 'leaderboard', label: 'Leaderboard', icon: 'Trophy', path: '/achievements/leaderboard' },
      { id: 'challenges', label: 'Challenges', icon: 'Zap', path: '/achievements/challenges' }
    ]
  },
  {
    id: 'sync',
    label: 'Sync & Backup',
    icon: 'Cloud',
    path: '/sync',
    subItems: [
      { id: 'status', label: 'Sync Status', icon: 'RefreshCw', path: '/sync/status' },
      { id: 'backup', label: 'Backup', icon: 'HardDrive', path: '/sync/backup' },
      { id: 'export-data', label: 'Export Data', icon: 'Download', path: '/sync/export' },
      { id: 'import-data', label: 'Import Data', icon: 'Upload', path: '/sync/import' },
      { id: 'devices', label: 'Devices', icon: 'Smartphone', path: '/sync/devices' }
    ]
  },
  {
    id: 'admin',
    label: 'Administration',
    icon: 'Crown',
    path: '/admin',
    subItems: [
      { id: 'dashboard', label: 'Admin Dashboard', icon: 'BarChart3', path: '/admin' },
      { id: 'users', label: 'User Management', icon: 'Users', path: '/admin/users' },
      { id: 'analytics', label: 'Course Analytics', icon: 'TrendingUp', path: '/admin/analytics' },
      { id: 'settings', label: 'System Settings', icon: 'Settings', path: '/admin/settings' }
    ]
  }
];

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, userProfile, signOut, loading } = useAuth();
  const pathname = usePathname();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const toggleExpand = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const isActive = (path: string) => pathname === path;
  const isParentActive = (item: MenuItem) => {
    if (pathname === item.path) return true;
    return item.subItems?.some(sub => pathname === sub.path) || false;
  };

  const renderIcon = (iconName?: string) => {
    if (!iconName || !iconMap[iconName]) return null;
    const Icon = iconMap[iconName];
    return <Icon className="w-5 h-5" />;
  };

  const renderMenuItem = (item: MenuItem, depth = 0) => {
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const active = isActive(item.path || '');
    const parentActive = isParentActive(item);

    return (
      <div key={item.id} className={depth > 0 ? 'ml-4' : ''}>
        <div
          className={`
            flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer
            transition-all duration-200 group
            ${active || parentActive
              ? 'bg-purple-100 dark:bg-purple-900 text-black dark:text-black'
              : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-black dark:text-black'
            }
          `}
          onClick={() => {
            if (hasSubItems) {
              toggleExpand(item.id);
            } else if (item.path) {
              setIsMobileMenuOpen(false);
            }
          }}
        >
          <Link
            href={item.path || '#'}
            className="flex items-center space-x-3 flex-1"
            onClick={(e) => {
              if (hasSubItems) {
                e.preventDefault();
              }
            }}
          >
            {renderIcon(item.icon)}
            <span className="font-medium">{item.label}</span>
            {item.badge && (
              <span className="px-2 py-0.5 text-xs bg-purple-600 text-black rounded-full">
                {item.badge}
              </span>
            )}
          </Link>
          {hasSubItems && (
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          )}
        </div>

        <AnimatePresence>
          {hasSubItems && isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-1 space-y-1">
                {item.subItems.map((subItem) => renderMenuItem(subItem, depth + 1))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:block fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-8">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-black" />
            </div>
            <span className="text-xl font-bold text-black dark:text-black">WisdomOS</span>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-black" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-black dark:text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-6">
            <h3 className="text-xs uppercase text-black dark:text-black font-semibold mb-3">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button className="p-2 bg-purple-100 dark:bg-purple-900 text-black dark:text-black rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors">
                <Plus className="w-4 h-4 mx-auto" />
              </button>
              <button className="p-2 bg-gray-100 dark:bg-gray-800 text-black dark:text-black rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <Heart className="w-4 h-4 mx-auto" />
              </button>
              <button className="p-2 bg-gray-100 dark:bg-gray-800 text-black dark:text-black rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <Flag className="w-4 h-4 mx-auto" />
              </button>
              <button className="p-2 bg-gray-100 dark:bg-gray-800 text-black dark:text-black rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <Lock className="w-4 h-4 mx-auto" />
              </button>
            </div>
          </div>

          {/* Main Navigation */}
          <div className="space-y-1">
            <h3 className="text-xs uppercase text-black dark:text-black font-semibold mb-3">
              Main Menu
            </h3>
            {navigationItems.map((item) => renderMenuItem(item))}
          </div>

          {/* User Menu */}
          {user && (
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
              {/* User Profile Section */}
              <div className="px-4 py-3 mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <UserCircle className="w-5 h-5 text-black" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-black dark:text-black truncate">
                      {user.user_metadata?.full_name || user.email}
                    </p>
                    <p className="text-xs text-black dark:text-black truncate">
                      Level {userProfile?.wisdom_level || 1} • {userProfile?.contribution_points || 0} pts
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <Link href="/profile" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-black dark:text-black">
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                </Link>
                <Link href="/settings" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-black dark:text-black">
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </Link>
                <Link href="/help" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-black dark:text-black">
                  <HelpCircle className="w-5 h-5" />
                  <span>Help</span>
                </Link>
                <button 
                  onClick={handleSignOut}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-black dark:text-black w-full text-left"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}

          {/* Auth buttons for non-authenticated users */}
          {!user && !loading && (
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
              <div className="space-y-2 px-4">
                <Link 
                  href="/auth/login"
                  className="w-full bg-purple-600 text-black py-2 px-4 rounded-lg hover:bg-purple-700 transition text-center block"
                >
                  Sign In
                </Link>
                <Link 
                  href="/auth/signup"
                  className="w-full border border-purple-600 text-black dark:text-black py-2 px-4 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition text-center block"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        {/* Mobile Header */}
        <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-50">
          <div className="flex items-center justify-between h-full px-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-black" />
              </div>
              <span className="text-lg font-bold">WisdomOS</span>
            </div>
            <NotificationPanel />
          </div>
        </header>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-16 left-0 bottom-0 w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-y-auto z-40"
            >
              <div className="p-4">
                {/* Mobile Search */}
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-black" />
                    <input
                      type="text"
                      placeholder="Search..."
                      className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg"
                    />
                  </div>
                </div>

                {/* Mobile Navigation Items */}
                <div className="space-y-1">
                  {navigationItems.map((item) => renderMenuItem(item))}
                </div>

                {/* Mobile User Menu */}
                {user && (
                  <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
                    {/* Mobile User Profile Section */}
                    <div className="px-4 py-3 mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <UserCircle className="w-5 h-5 text-black" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-black dark:text-black truncate">
                            {user.user_metadata?.full_name || user.email}
                          </p>
                          <p className="text-xs text-black dark:text-black truncate">
                            Level {userProfile?.wisdom_level || 1} • {userProfile?.contribution_points || 0} pts
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Link href="/profile" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                        <User className="w-5 h-5" />
                        <span>Profile</span>
                      </Link>
                      <Link href="/settings" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                        <Settings className="w-5 h-5" />
                        <span>Settings</span>
                      </Link>
                      <Link href="/help" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                        <HelpCircle className="w-5 h-5" />
                        <span>Help</span>
                      </Link>
                      <button 
                        onClick={handleSignOut}
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 w-full text-left"
                      >
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Mobile Auth buttons for non-authenticated users */}
                {!user && !loading && (
                  <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
                    <div className="space-y-2 px-4">
                      <Link 
                        href="/auth/login"
                        className="w-full bg-purple-600 text-black py-2 px-4 rounded-lg hover:bg-purple-700 transition text-center block"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Sign In
                      </Link>
                      <Link 
                        href="/auth/signup"
                        className="w-full border border-purple-600 text-black dark:text-black py-2 px-4 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition text-center block"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Sign Up
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </div>
    </>
  );
}