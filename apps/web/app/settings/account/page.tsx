'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Crown, Shield, AlertTriangle, Trash2, XCircle } from 'lucide-react'

export default function AccountPage() {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showDeactivateModal, setShowDeactivateModal] = useState(false)
  const [confirmText, setConfirmText] = useState('')

  const accountType = 'Premium' // This would come from your auth context

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Account
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Manage your account type and permissions
        </p>
      </div>

      {/* Account Type */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-800 dark:to-amber-900/20 rounded-xl p-6 border border-amber-100 dark:border-amber-800"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Account Type
            </h3>
          </div>
          <span className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-full text-sm font-medium">
            {accountType}
          </span>
        </div>

        <div className="space-y-3">
          <div className="p-4 bg-white/50 dark:bg-slate-900/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-slate-900 dark:text-white">Full Access</span>
              <Shield className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              You have access to all premium features including AI coaching, unlimited journal entries, and advanced analytics.
            </p>
          </div>

          <div className="p-4 bg-white/50 dark:bg-slate-900/50 rounded-lg">
            <h4 className="font-medium text-slate-900 dark:text-white mb-2">Permissions</h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                Unlimited journal entries
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                AI-powered insights and coaching
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                Advanced analytics and reporting
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                Data export (JSON, CSV, PDF)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                Priority support
              </li>
            </ul>
          </div>

          <button className="w-full px-4 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-600">
            Manage Subscription
          </button>
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-slate-800 dark:to-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-500 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Danger Zone
          </h3>
        </div>

        <div className="space-y-3">
          {/* Deactivate Account */}
          <div className="p-4 bg-white/50 dark:bg-slate-900/50 rounded-lg border border-red-200 dark:border-red-800/50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-slate-900 dark:text-white mb-1">
                  Deactivate Account
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Temporarily disable your account. You can reactivate anytime by signing in again.
                </p>
              </div>
              <button
                onClick={() => setShowDeactivateModal(true)}
                className="ml-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <XCircle className="w-4 h-4" />
                Deactivate
              </button>
            </div>
          </div>

          {/* Delete Account */}
          <div className="p-4 bg-white/50 dark:bg-slate-900/50 rounded-lg border border-red-300 dark:border-red-700/50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-red-600 dark:text-red-400 mb-1">
                  Delete Account
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
              </div>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="ml-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Delete Account
              </h3>
            </div>

            <p className="text-slate-600 dark:text-slate-400 mb-4">
              This will permanently delete your account and all associated data including:
            </p>

            <ul className="space-y-2 mb-6 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                All journal entries and reflections
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                Fulfillment tracking and goals
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                AI coaching conversations
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                Account settings and preferences
              </li>
            </ul>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Type "DELETE" to confirm:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500"
                placeholder="DELETE"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setConfirmText('')
                }}
                className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={confirmText !== 'DELETE'}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Delete Account
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Deactivate Confirmation Modal */}
      {showDeactivateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                <XCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Deactivate Account
              </h3>
            </div>

            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Your account will be temporarily disabled. You can reactivate it anytime by signing in again. Your data will be preserved.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeactivateModal(false)}
                className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Deactivate
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
