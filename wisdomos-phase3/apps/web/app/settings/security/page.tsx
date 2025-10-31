'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Smartphone, Clock, LogOut, QrCode, Key, Check, X, Monitor, MapPin } from 'lucide-react'

interface Device {
  id: string
  name: string
  location: string
  lastActive: string
  current: boolean
}

export default function SecurityPage() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [show2FAModal, setShow2FAModal] = useState(false)
  const [sessionTimeout, setSessionTimeout] = useState('30')
  const [backupCodes, setBackupCodes] = useState<string[]>([])

  const devices: Device[] = [
    {
      id: '1',
      name: 'MacBook Pro',
      location: 'San Francisco, CA',
      lastActive: 'Active now',
      current: true
    },
    {
      id: '2',
      name: 'iPhone 14',
      location: 'San Francisco, CA',
      lastActive: '2 hours ago',
      current: false
    },
    {
      id: '3',
      name: 'iPad Air',
      location: 'Oakland, CA',
      lastActive: '1 day ago',
      current: false
    }
  ]

  const handleEnable2FA = () => {
    // Generate backup codes
    const codes = Array.from({ length: 8 }, () =>
      Math.random().toString(36).substring(2, 10).toUpperCase()
    )
    setBackupCodes(codes)
    setShow2FAModal(true)
  }

  const confirmEnable2FA = () => {
    setTwoFactorEnabled(true)
    setShow2FAModal(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Security
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Protect your account with advanced security features
        </p>
      </div>

      {/* Security Overview */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="grid grid-cols-3 gap-4"
      >
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
          <Shield className="w-8 h-8 text-green-600 dark:text-green-400 mb-2" />
          <div className="text-2xl font-bold text-slate-900 dark:text-white">Strong</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Security Level</div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <Monitor className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-2" />
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{devices.length}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Active Devices</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
          <Clock className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-2" />
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{sessionTimeout}m</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Session Timeout</div>
        </div>
      </motion.div>

      {/* Two-Factor Authentication */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-indigo-900/20 rounded-xl p-6 border border-indigo-100 dark:border-indigo-800"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500 rounded-lg">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Two-Factor Authentication
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Add an extra layer of security
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {twoFactorEnabled && (
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium flex items-center gap-1">
                <Check className="w-4 h-4" />
                Enabled
              </span>
            )}
            <button
              onClick={() => twoFactorEnabled ? setTwoFactorEnabled(false) : handleEnable2FA()}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                twoFactorEnabled
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {twoFactorEnabled ? 'Disable' : 'Enable'} 2FA
            </button>
          </div>
        </div>

        {twoFactorEnabled && (
          <div className="mt-4 p-4 bg-white/50 dark:bg-slate-900/50 rounded-lg">
            <div className="flex items-start gap-3">
              <Key className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-slate-900 dark:text-white mb-1">Backup Codes</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                  Keep these codes safe. Use them if you lose access to your authenticator app.
                </p>
                <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                  View Backup Codes →
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Account Activity Log */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-700 dark:bg-slate-600 rounded-lg">
              <Monitor className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Active Sessions
            </h3>
          </div>
          <button className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Sign Out All Devices
          </button>
        </div>

        <div className="space-y-3">
          {devices.map((device) => (
            <div
              key={device.id}
              className="p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Monitor className="w-5 h-5 text-slate-400 mt-1" />
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                      {device.name}
                      {device.current && (
                        <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {device.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {device.lastActive}
                      </span>
                    </div>
                  </div>
                </div>
                {!device.current && (
                  <button className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors">
                    Sign Out
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Session Timeout */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-slate-800 dark:to-orange-900/20 rounded-xl p-6 border border-orange-100 dark:border-orange-800"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-500 rounded-lg">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Session Timeout
          </h3>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Automatically sign out after a period of inactivity
          </p>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Timeout Duration (minutes)
            </label>
            <select
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 text-slate-900 dark:text-white"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="120">2 hours</option>
              <option value="never">Never</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* 2FA Setup Modal */}
      {show2FAModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-lg w-full shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                <QrCode className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Enable Two-Factor Authentication
              </h3>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center">
                    <QrCode className="w-32 h-32 text-slate-300" />
                  </div>
                </div>
                <p className="text-sm text-center text-slate-600 dark:text-slate-400">
                  Scan this QR code with your authenticator app
                </p>
              </div>

              <div>
                <h4 className="font-medium text-slate-900 dark:text-white mb-2">Backup Codes</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  Save these codes in a safe place. Each code can only be used once.
                </p>
                <div className="grid grid-cols-2 gap-2 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg font-mono text-sm">
                  {backupCodes.map((code, i) => (
                    <div key={i} className="text-slate-700 dark:text-slate-300">
                      {code}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShow2FAModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmEnable2FA}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Enable 2FA
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
