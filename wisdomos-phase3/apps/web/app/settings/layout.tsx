'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Bell,
  User,
  UserCircle,
  Shield,
  Lock,
  Plug,
  Accessibility,
  MessageSquare,
  FileText,
  Settings,
  ChevronRight
} from 'lucide-react'

interface SettingsSection {
  id: string
  name: string
  icon: any
  href: string
  description: string
}

const settingsSections: SettingsSection[] = [
  {
    id: 'notifications',
    name: 'Notifications',
    icon: Bell,
    href: '/settings/notifications',
    description: 'Manage alerts and preferences'
  },
  {
    id: 'account',
    name: 'Account',
    icon: User,
    href: '/settings/account',
    description: 'Account type and permissions'
  },
  {
    id: 'profile',
    name: 'Profile',
    icon: UserCircle,
    href: '/settings/profile',
    description: 'Personal information and theme'
  },
  {
    id: 'security',
    name: 'Security',
    icon: Shield,
    href: '/settings/security',
    description: '2FA and session management'
  },
  {
    id: 'privacy',
    name: 'Privacy & Data',
    icon: Lock,
    href: '/settings/privacy',
    description: 'Data export and retention'
  },
  {
    id: 'integrations',
    name: 'Integrations',
    icon: Plug,
    href: '/settings/integrations',
    description: 'Connected apps and services'
  },
  {
    id: 'accessibility',
    name: 'Accessibility',
    icon: Accessibility,
    href: '/settings/accessibility',
    description: 'Display and navigation options'
  },
  {
    id: 'feedback',
    name: 'Feedback & Support',
    icon: MessageSquare,
    href: '/settings/feedback',
    description: 'Help and suggestions'
  },
  {
    id: 'legal',
    name: 'Legal Notices',
    icon: FileText,
    href: '/settings/legal',
    description: 'Terms and privacy policy'
  }
]

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-4"
          >
            ← Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
              <Settings className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Settings
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Manage your WisdomOS preferences
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Navigation */}
          <motion.aside
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="w-80 flex-shrink-0"
          >
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-4">
              <nav className="space-y-1">
                {settingsSections.map((section) => {
                  const Icon = section.icon
                  const isActive = pathname === section.href || pathname.startsWith(section.href + '/')

                  return (
                    <Link
                      key={section.id}
                      href={section.href}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                        ${isActive
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }
                      `}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                      <div className="flex-1">
                        <div className="font-medium">{section.name}</div>
                        <div className={`text-xs ${isActive ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-500'}`}>
                          {section.description}
                        </div>
                      </div>
                      {isActive && <ChevronRight className="w-4 h-4" />}
                    </Link>
                  )
                })}
              </nav>

              {/* Footer Info */}
              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Version</span>
                    <span className="font-mono">2.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Updated</span>
                    <span>Oct 2025</span>
                  </div>
                  <Link
                    href="/changelog"
                    className="text-indigo-600 dark:text-indigo-400 hover:underline block mt-2"
                  >
                    View Changelog →
                  </Link>
                </div>
              </div>
            </div>
          </motion.aside>

          {/* Main Content Area */}
          <motion.main
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex-1"
          >
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-8">
              {children}
            </div>
          </motion.main>
        </div>
      </div>
    </div>
  )
}
