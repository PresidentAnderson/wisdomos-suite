'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
// Animations temporarily disabled
import {
  Home,
  FileText,
  BarChart3,
  Bell,
  Settings,
  Users,
  BookOpen,
  Menu,
  X,
  User,
  TrendingUp,
  ClipboardCheck,
  Heart
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useAppStore } from '@/store/app'
import { cn } from '@/lib/utils'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<any>
  iconSolid: React.ComponentType<any>
  badge?: number
  adminOnly?: boolean
}

const navItems: NavItem[] = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: Home, 
    iconSolid: Home 
  },
  { 
    name: 'Documents', 
    href: '/dashboard/documents', 
    icon: FileText, 
    iconSolid: FileText 
  },
  { 
    name: 'Upset Documentation', 
    href: '/dashboard/upset-documentation', 
    icon: ClipboardCheck, 
    iconSolid: ClipboardCheck 
  },
  { 
    name: 'Boundary Audit', 
    href: '/dashboard/boundary-audit', 
    icon: TrendingUp, 
    iconSolid: TrendingUp 
  },
  { 
    name: 'Fulfillment Display', 
    href: '/dashboard/fulfillment-display', 
    icon: Heart, 
    iconSolid: Heart 
  },
  { 
    name: 'Courses', 
    href: '/dashboard/courses', 
    icon: BookOpen, 
    iconSolid: BookOpen 
  },
  { 
    name: 'Analytics', 
    href: '/dashboard/analytics', 
    icon: BarChart3, 
    iconSolid: BarChart3 
  },
  { 
    name: 'Community', 
    href: '/dashboard/community', 
    icon: Users, 
    iconSolid: Users 
  },
  { 
    name: 'Notifications', 
    href: '/dashboard/notifications', 
    icon: Bell, 
    iconSolid: Bell,
    badge: 0 // Will be updated from store
  },
  { 
    name: 'Profile', 
    href: '/dashboard/profile', 
    icon: User, 
    iconSolid: User 
  },
  { 
    name: 'Settings', 
    href: '/dashboard/settings', 
    icon: Settings, 
    iconSolid: Settings 
  },
  { 
    name: 'Admin', 
    href: '/dashboard/admin', 
    icon: Settings, 
    iconSolid: Settings,
    adminOnly: true
  }
]

export function Sidebar() {
  const pathname = usePathname()
  const { profile } = useAuth()
  const { sidebarOpen, setSidebarOpen, unreadCount } = useAppStore()

  // Update notifications badge
  const updatedNavItems = navItems.map(item => 
    item.name === 'Notifications' 
      ? { ...item, badge: unreadCount }
      : item
  ).filter(item => !item.adminOnly || profile?.is_admin)

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center px-4 border-b border-gray-200">
        <Link href="/dashboard" className="flex items-center">
          <div
            whileHover={{ scale: 1.05 }}
            className="text-xl font-bold text-blue-600"
          >
            WisdomOS
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {updatedNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = isActive ? item.iconSolid : item.icon

          return (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  'group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-100 text-blue-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon
                  className={cn(
                    'mr-3 h-5 w-5 flex-shrink-0',
                    isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                  )}
                />
                {item.name}
                {item.badge && item.badge > 0 && (
                  <span className="ml-auto inline-flex items-center justify-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* User Profile */}
      <div className="flex-shrink-0 border-t border-gray-200 p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {profile?.avatar_url ? (
              <img
                className="h-8 w-8 rounded-full"
                src={profile.avatar_url}
                alt={profile.full_name || 'User'}
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                {profile?.full_name ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
              </div>
            )}
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {profile?.full_name || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {profile?.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile sidebar */}
      <div className="lg:hidden">
        <div>
          {sidebarOpen && (
            <>
              <div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75"
                onClick={() => setSidebarOpen(false)}
              />
              <div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl"
              >
                <div className="absolute top-0 right-0 -mr-12 pt-2">
                  <button
                    type="button"
                    className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <X className="h-6 w-6 text-white" />
                  </button>
                </div>
                <SidebarContent />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:hidden">
        <button
          type="button"
          className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="text-sm font-semibold leading-6 text-gray-900">
          WisdomOS Community Hub
        </div>
      </div>
    </>
  )
}