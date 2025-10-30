'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Palette, Lock, Save, Check, Sun, Moon, Monitor } from 'lucide-react'

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: 'WisdomOS User',
    email: 'user@wisdomos.com',
    theme: 'auto' as 'light' | 'dark' | 'auto'
  })

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  })

  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    localStorage.setItem('wisdomos_profile', JSON.stringify(profile))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handlePasswordChange = () => {
    if (passwords.new === passwords.confirm && passwords.new.length >= 8) {
      // API call to change password
      alert('Password changed successfully!')
      setPasswords({ current: '', new: '', confirm: '' })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Profile
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Manage your personal information and preferences
        </p>
      </div>

      {/* Personal Information */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-blue-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-500 rounded-lg">
            <User className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Personal Information
          </h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                placeholder="your@email.com"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Theme Preferences */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-800 dark:to-purple-900/20 rounded-xl p-6 border border-purple-100 dark:border-purple-800"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-500 rounded-lg">
            <Palette className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Theme Preferences
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setProfile({ ...profile, theme: 'light' })}
            className={`p-4 rounded-xl border-2 transition-all ${
              profile.theme === 'light'
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
            }`}
          >
            <Sun className={`w-6 h-6 mx-auto mb-2 ${
              profile.theme === 'light' ? 'text-purple-500' : 'text-slate-400'
            }`} />
            <div className="text-sm font-medium text-slate-900 dark:text-white">Light</div>
          </button>

          <button
            onClick={() => setProfile({ ...profile, theme: 'dark' })}
            className={`p-4 rounded-xl border-2 transition-all ${
              profile.theme === 'dark'
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
            }`}
          >
            <Moon className={`w-6 h-6 mx-auto mb-2 ${
              profile.theme === 'dark' ? 'text-purple-500' : 'text-slate-400'
            }`} />
            <div className="text-sm font-medium text-slate-900 dark:text-white">Dark</div>
          </button>

          <button
            onClick={() => setProfile({ ...profile, theme: 'auto' })}
            className={`p-4 rounded-xl border-2 transition-all ${
              profile.theme === 'auto'
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
            }`}
          >
            <Monitor className={`w-6 h-6 mx-auto mb-2 ${
              profile.theme === 'auto' ? 'text-purple-500' : 'text-slate-400'
            }`} />
            <div className="text-sm font-medium text-slate-900 dark:text-white">Auto</div>
          </button>
        </div>
      </motion.div>

      {/* Password Management */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-800 dark:to-green-900/20 rounded-xl p-6 border border-green-100 dark:border-green-800"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-500 rounded-lg">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Change Password
          </h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Current Password
            </label>
            <input
              type="password"
              value={passwords.current}
              onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 text-slate-900 dark:text-white"
              placeholder="Enter current password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              New Password
            </label>
            <input
              type="password"
              value={passwords.new}
              onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 text-slate-900 dark:text-white"
              placeholder="Enter new password"
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Must be at least 8 characters long
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwords.confirm}
              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 text-slate-900 dark:text-white"
              placeholder="Confirm new password"
            />
          </div>

          <button
            onClick={handlePasswordChange}
            disabled={!passwords.current || !passwords.new || passwords.new !== passwords.confirm || passwords.new.length < 8}
            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Update Password
          </button>
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
              Save Profile
            </>
          )}
        </button>
      </div>
    </div>
  )
}
