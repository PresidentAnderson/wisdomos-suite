'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, Mail, Smartphone, MessageSquare, Save, Check } from 'lucide-react'

interface NotificationSettings {
  email: {
    insights: boolean
    reminders: boolean
    system: boolean
    weekly: boolean
  }
  push: {
    insights: boolean
    reminders: boolean
    system: boolean
  }
  inApp: {
    insights: boolean
    reminders: boolean
    system: boolean
  }
}

export default function NotificationsPage() {
  const [settings, setSettings] = useState<NotificationSettings>({
    email: {
      insights: true,
      reminders: true,
      system: true,
      weekly: false
    },
    push: {
      insights: true,
      reminders: true,
      system: false
    },
    inApp: {
      insights: true,
      reminders: true,
      system: true
    }
  })

  const [saved, setSaved] = useState(false)

  const handleToggle = (category: keyof NotificationSettings, key: string) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: !prev[category][key as keyof typeof prev[typeof category]]
      }
    }))
    setSaved(false)
  }

  const handleSave = () => {
    // Save to backend/localStorage
    localStorage.setItem('wisdomos_notifications', JSON.stringify(settings))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Notifications
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Manage how you receive updates and alerts
        </p>
      </div>

      {/* Email Notifications */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-100 dark:border-indigo-800"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-500 rounded-lg">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Email Alerts
          </h3>
        </div>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 bg-white/50 dark:bg-slate-900/50 rounded-lg cursor-pointer hover:bg-white/80 dark:hover:bg-slate-900/80 transition-colors">
            <div>
              <div className="font-medium text-slate-900 dark:text-white">Insights & Analysis</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Receive journal insights and patterns</div>
            </div>
            <input
              type="checkbox"
              checked={settings.email.insights}
              onChange={() => handleToggle('email', 'insights')}
              className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-white/50 dark:bg-slate-900/50 rounded-lg cursor-pointer hover:bg-white/80 dark:hover:bg-slate-900/80 transition-colors">
            <div>
              <div className="font-medium text-slate-900 dark:text-white">Reminders</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Daily prompts and check-ins</div>
            </div>
            <input
              type="checkbox"
              checked={settings.email.reminders}
              onChange={() => handleToggle('email', 'reminders')}
              className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-white/50 dark:bg-slate-900/50 rounded-lg cursor-pointer hover:bg-white/80 dark:hover:bg-slate-900/80 transition-colors">
            <div>
              <div className="font-medium text-slate-900 dark:text-white">System Updates</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Important system notifications</div>
            </div>
            <input
              type="checkbox"
              checked={settings.email.system}
              onChange={() => handleToggle('email', 'system')}
              className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-white/50 dark:bg-slate-900/50 rounded-lg cursor-pointer hover:bg-white/80 dark:hover:bg-slate-900/80 transition-colors">
            <div>
              <div className="font-medium text-slate-900 dark:text-white">Weekly Summary</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Your weekly progress report</div>
            </div>
            <input
              type="checkbox"
              checked={settings.email.weekly}
              onChange={() => handleToggle('email', 'weekly')}
              className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
            />
          </label>
        </div>
      </motion.div>

      {/* Push Notifications */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-800 dark:to-purple-900/20 rounded-xl p-6 border border-purple-100 dark:border-purple-800"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-500 rounded-lg">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Push Notifications
          </h3>
        </div>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 bg-white/50 dark:bg-slate-900/50 rounded-lg cursor-pointer hover:bg-white/80 dark:hover:bg-slate-900/80 transition-colors">
            <div>
              <div className="font-medium text-slate-900 dark:text-white">Insights & Analysis</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Real-time insights</div>
            </div>
            <input
              type="checkbox"
              checked={settings.push.insights}
              onChange={() => handleToggle('push', 'insights')}
              className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-white/50 dark:bg-slate-900/50 rounded-lg cursor-pointer hover:bg-white/80 dark:hover:bg-slate-900/80 transition-colors">
            <div>
              <div className="font-medium text-slate-900 dark:text-white">Reminders</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Mobile reminders</div>
            </div>
            <input
              type="checkbox"
              checked={settings.push.reminders}
              onChange={() => handleToggle('push', 'reminders')}
              className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-white/50 dark:bg-slate-900/50 rounded-lg cursor-pointer hover:bg-white/80 dark:hover:bg-slate-900/80 transition-colors">
            <div>
              <div className="font-medium text-slate-900 dark:text-white">System Updates</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Critical updates only</div>
            </div>
            <input
              type="checkbox"
              checked={settings.push.system}
              onChange={() => handleToggle('push', 'system')}
              className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
            />
          </label>
        </div>
      </motion.div>

      {/* In-App Alerts */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-800 dark:to-green-900/20 rounded-xl p-6 border border-green-100 dark:border-green-800"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-500 rounded-lg">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            In-App Alerts
          </h3>
        </div>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 bg-white/50 dark:bg-slate-900/50 rounded-lg cursor-pointer hover:bg-white/80 dark:hover:bg-slate-900/80 transition-colors">
            <div>
              <div className="font-medium text-slate-900 dark:text-white">Insights & Analysis</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Show insights banner</div>
            </div>
            <input
              type="checkbox"
              checked={settings.inApp.insights}
              onChange={() => handleToggle('inApp', 'insights')}
              className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-white/50 dark:bg-slate-900/50 rounded-lg cursor-pointer hover:bg-white/80 dark:hover:bg-slate-900/80 transition-colors">
            <div>
              <div className="font-medium text-slate-900 dark:text-white">Reminders</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">In-app reminder popups</div>
            </div>
            <input
              type="checkbox"
              checked={settings.inApp.reminders}
              onChange={() => handleToggle('inApp', 'reminders')}
              className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-white/50 dark:bg-slate-900/50 rounded-lg cursor-pointer hover:bg-white/80 dark:hover:bg-slate-900/80 transition-colors">
            <div>
              <div className="font-medium text-slate-900 dark:text-white">System Updates</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">App update notifications</div>
            </div>
            <input
              type="checkbox"
              checked={settings.inApp.system}
              onChange={() => handleToggle('inApp', 'system')}
              className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
            />
          </label>
        </div>
      </motion.div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200"
        >
          {saved ? (
            <>
              <Check className="w-5 h-5" />
              Saved!
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Preferences
            </>
          )}
        </button>
      </div>
    </div>
  )
}
