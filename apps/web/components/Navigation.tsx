'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import {
  Menu,
  X,
  ChevronDown,
  PenTool,
  RefreshCw,
  Map,
  Award,
  TrendingUp,
  Brain,
  Users,
  Target,
  BookOpen,
  Settings,
  Home,
  Sparkles,
  Heart,
  Shield,
  Archive,
  Clock,
  DollarSign,
  Briefcase,
  Activity,
  Palette,
  Calendar,
  BarChart3,
  MessageCircle,
  Book,
  Grid3x3,
  Star,
  AlertTriangle,
  LogOut,
  User,
  Crown,
  Layers,
  MessageSquare
} from 'lucide-react'
import PhoenixLogo from './PhoenixLogo'

interface SubMenuItem {
  label: string
  href: string
  icon?: React.ElementType
  description?: string
}

interface MenuItem {
  label: string
  href?: string
  icon?: React.ElementType
  subItems?: SubMenuItem[]
}

const menuItems: MenuItem[] = [
  {
    label: 'Dashboard',
    href: '/',
    icon: Home
  },
  {
    label: 'Integrated Display',
    href: '/integrated',
    icon: Layers
  },
  {
    label: 'Phoenix Tools',
    icon: Sparkles,
    subItems: [
      { 
        label: 'Journal', 
        href: '/journal', 
        icon: PenTool,
        description: 'Capture thoughts and reflections'
      },
      { 
        label: 'Reset Ritual', 
        href: '/reset', 
        icon: RefreshCw,
        description: '5-step boundary reset process'
      },
      { 
        label: 'Fulfillment Display', 
        href: '/fulfillment', 
        icon: Map,
        description: 'Visualize life areas and relationships'
      },
      {
        label: 'Fulfillment Timeline',
        href: '/fulfillment-timeline',
        icon: Calendar,
        description: 'Track your journey over time'
      },
      {
        label: 'Fulfillment Analytics',
        href: '/fulfillment-analytics',
        icon: BarChart3,
        description: 'Analyze trends and patterns'
      },
      { 
        label: 'Badges', 
        href: '/badges', 
        icon: Award,
        description: 'Track achievements and progress'
      },
      {
        label: 'Community',
        href: '/community',
        icon: Users,
        description: 'Manage your connections and relationships'
      },
      {
        label: 'Difficult Conversations',
        href: '/difficult-conversations',
        icon: MessageCircle,
        description: 'Scripts for boundary-setting talks'
      },
      {
        label: 'Autobiography',
        href: '/autobiography',
        icon: Book,
        description: '120 years of life story mapping'
      },
      {
        label: 'Priority Matrix',
        href: '/priority-matrix',
        icon: Grid3x3,
        description: 'Focus on what matters most'
      },
      {
        label: 'Contribution Display',
        href: '/contribution',
        icon: Star,
        description: 'Who you are as contribution'
      },
      {
        label: 'Upset Inquiry',
        href: '/upset-inquiry',
        icon: AlertTriangle,
        description: 'Pattern recognition from upsets'
      },
      {
        label: 'Visual Tracker',
        href: '/tracker',
        icon: BarChart3,
        description: 'Color-coded monthly progress tracker'
      },
      {
        label: 'Reflective Feedback',
        href: '/reflective-feedback',
        icon: MessageSquare,
        description: 'Multi-dimensional growth tracking'
      }
    ]
  },
  {
    label: 'Life Areas',
    icon: Target,
    subItems: [
      { label: 'Work & Purpose', href: '/life-area/work', icon: Briefcase },
      { label: 'Health & Recovery', href: '/life-area/health', icon: Activity },
      { label: 'Finance', href: '/life-area/finance', icon: DollarSign },
      { label: 'Intimacy & Love', href: '/life-area/intimacy', icon: Heart },
      { label: 'Time & Energy', href: '/life-area/time', icon: Clock },
      { label: 'Spiritual', href: '/life-area/spiritual', icon: Sparkles },
      { label: 'Creativity', href: '/life-area/creativity', icon: Palette },
      { label: 'Community', href: '/life-area/friendship', icon: Users },
      { label: 'Learning', href: '/life-area/learning', icon: Brain },
      { label: 'Home', href: '/life-area/home', icon: Home },
      { label: 'Emotional', href: '/life-area/emotional', icon: Shield },
      { label: 'Legacy', href: '/life-area/legacy', icon: Archive }
    ]
  },
  {
    label: 'Insights',
    icon: TrendingUp,
    subItems: [
      { 
        label: 'Analytics', 
        href: '/insights/analytics', 
        icon: TrendingUp,
        description: 'View your progress analytics'
      },
      { 
        label: 'Patterns', 
        href: '/insights/patterns', 
        icon: Brain,
        description: 'Discover behavioral patterns'
      },
      { 
        label: 'Recommendations', 
        href: '/insights/recommendations', 
        icon: Target,
        description: 'AI-powered suggestions'
      }
    ]
  },
  {
    label: 'Resources',
    icon: BookOpen,
    subItems: [
      { 
        label: 'Getting Started', 
        href: '/resources/getting-started', 
        icon: BookOpen,
        description: 'Learn the Phoenix Method'
      },
      { 
        label: 'Best Practices', 
        href: '/resources/best-practices', 
        icon: Award,
        description: 'Tips for optimal use'
      },
      { 
        label: 'Community', 
        href: '/resources/community', 
        icon: Users,
        description: 'Connect with others'
      },
      { 
        label: 'Credits', 
        href: '/credits', 
        icon: Heart,
        description: 'Acknowledgments & contributors'
      }
    ]
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings
  }
]

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const pathname = usePathname()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { user, logout, isLoading } = useAuth()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
    setActiveDropdown(null)
  }, [pathname])

  const toggleDropdown = (label: string) => {
    setActiveDropdown(activeDropdown === label ? null : label)
  }

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:block sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-phoenix-gold/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <PhoenixLogo size="sm" animated />
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-phoenix-red to-phoenix-orange bg-clip-text text-transparent">
                  WisdomOS
                </h1>
                <p className="text-xs text-black">Rise into Fulfillment</p>
              </div>
            </Link>

            {/* Desktop Menu */}
            <div className="flex items-center gap-1" ref={dropdownRef}>
              {/* Authentication Status */}
              {!isLoading && !user && (
                <div className="flex items-center gap-2 mr-4">
                  <Link href="/auth/login">
                    <button className="px-4 py-2 text-sm font-medium text-black hover:text-black transition-colors">
                      Sign In
                    </button>
                  </Link>
                  <Link href="/auth/register">
                    <button className="px-4 py-2 text-sm font-medium bg-phoenix-orange text-black rounded-lg hover:bg-phoenix-red transition-colors">
                      Get Started
                    </button>
                  </Link>
                </div>
              )}
              
              {!isLoading && user && (
                <div className="flex items-center gap-3 mr-4">
                  {/* User Info */}
                  <div className="flex items-center gap-2 px-3 py-2 bg-phoenix-gold/10 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm font-medium text-black">{user.name}</span>
                  </div>
                  
                  {/* User Menu */}
                  <div className="relative">
                    <button
                      onClick={() => toggleDropdown('user-menu')}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-black hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span>{user.name}</span>
                      <ChevronDown className={`w-3 h-3 transition-transform ${
                        activeDropdown === 'user-menu' ? 'rotate-180' : ''
                      }`} />
                    </button>
                    
                    <AnimatePresence>
                      {activeDropdown === 'user-menu' && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-phoenix-gold/20 overflow-hidden"
                        >
                          <div className="py-2">
                            <div className="px-4 py-2 border-b border-gray-100">
                              <p className="text-sm font-medium text-black">{user.name}</p>
                              <p className="text-xs text-black">{user.email}</p>
                            </div>
                            <Link
                              href="/settings"
                              className="flex items-center gap-2 px-4 py-2 text-sm text-black hover:bg-gray-100 transition-colors"
                            >
                              <Settings className="w-4 h-4" />
                              Settings
                            </Link>
                            <button
                              onClick={logout}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-black hover:bg-red-50 transition-colors"
                            >
                              <LogOut className="w-4 h-4" />
                              Sign Out
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}
              {menuItems.map((item) => (
                <div key={item.label} className="relative">
                  {item.subItems ? (
                    <>
                      <button
                        onClick={() => toggleDropdown(item.label)}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all
                          ${activeDropdown === item.label 
                            ? 'bg-phoenix-gold/10 text-black' 
                            : 'text-black hover:bg-gray-100 hover:text-black'
                          }`}
                      >
                        {item.icon && <item.icon className="w-4 h-4" />}
                        {item.label}
                        <ChevronDown className={`w-3 h-3 transition-transform ${
                          activeDropdown === item.label ? 'rotate-180' : ''
                        }`} />
                      </button>

                      {/* Dropdown Menu */}
                      <AnimatePresence>
                        {activeDropdown === item.label && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-phoenix-gold/20 overflow-hidden"
                          >
                            <div className="py-2">
                              {item.subItems.map((subItem) => (
                                <Link
                                  key={subItem.href}
                                  href={subItem.href}
                                  className={`flex items-start gap-3 px-4 py-3 hover:bg-phoenix-gold/10 transition-colors
                                    ${isActive(subItem.href) ? 'bg-phoenix-gold/5 text-black' : 'text-black'}`}
                                >
                                  {subItem.icon && (
                                    <subItem.icon className="w-5 h-5 mt-0.5 flex-shrink-0 text-black" />
                                  )}
                                  <div className="flex-1">
                                    <div className="font-medium">{subItem.label}</div>
                                    {subItem.description && (
                                      <div className="text-xs text-black mt-0.5">
                                        {subItem.description}
                                      </div>
                                    )}
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <Link
                      href={item.href!}
                      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all
                        ${isActive(item.href!) 
                          ? 'bg-phoenix-gold/10 text-black' 
                          : 'text-black hover:bg-gray-100 hover:text-black'
                        }`}
                    >
                      {item.icon && <item.icon className="w-4 h-4" />}
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-phoenix-gold/20">
        <div className="px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <PhoenixLogo size="sm" animated />
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-phoenix-red to-phoenix-orange bg-clip-text text-transparent">
                  WisdomOS
                </h1>
              </div>
            </Link>

            {/* Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-black hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white border-t border-phoenix-gold/20 overflow-hidden"
            >
              <div className="px-4 py-4 space-y-2 max-h-[calc(100vh-4rem)] overflow-y-auto">
                {menuItems.map((item) => (
                  <div key={item.label}>
                    {item.subItems ? (
                      <>
                        <button
                          onClick={() => toggleDropdown(item.label)}
                          className={`w-full flex items-center justify-between px-4 py-3 text-left font-medium rounded-lg transition-all
                            ${activeDropdown === item.label 
                              ? 'bg-phoenix-gold/10 text-black' 
                              : 'text-black hover:bg-gray-100'
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            {item.icon && <item.icon className="w-5 h-5" />}
                            {item.label}
                          </div>
                          <ChevronDown className={`w-4 h-4 transition-transform ${
                            activeDropdown === item.label ? 'rotate-180' : ''
                          }`} />
                        </button>

                        {/* Mobile Dropdown */}
                        <AnimatePresence>
                          {activeDropdown === item.label && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="ml-4 mt-2 space-y-1 overflow-hidden"
                            >
                              {item.subItems.map((subItem) => (
                                <Link
                                  key={subItem.href}
                                  href={subItem.href}
                                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors
                                    ${isActive(subItem.href) 
                                      ? 'bg-phoenix-gold/10 text-black' 
                                      : 'text-black hover:bg-gray-100'
                                    }`}
                                >
                                  {subItem.icon && <subItem.icon className="w-4 h-4" />}
                                  <div>
                                    <div className="text-sm font-medium">{subItem.label}</div>
                                    {subItem.description && (
                                      <div className="text-xs text-black">
                                        {subItem.description}
                                      </div>
                                    )}
                                  </div>
                                </Link>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <Link
                        href={item.href!}
                        className={`flex items-center gap-3 px-4 py-3 font-medium rounded-lg transition-all
                          ${isActive(item.href!) 
                            ? 'bg-phoenix-gold/10 text-black' 
                            : 'text-black hover:bg-gray-100'
                          }`}
                      >
                        {item.icon && <item.icon className="w-5 h-5" />}
                        {item.label}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  )
}