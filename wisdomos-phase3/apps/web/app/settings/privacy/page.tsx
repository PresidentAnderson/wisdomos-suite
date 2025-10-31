'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, Download, Shield, FileText, Database, Clock, CheckCircle, AlertCircle } from 'lucide-react'

type ExportFormat = 'json' | 'csv' | 'pdf'

interface ExportStatus {
  inProgress: boolean
  format?: ExportFormat
  progress?: number
}

export default function PrivacyPage() {
  const [exportStatus, setExportStatus] = useState<ExportStatus>({ inProgress: false })
  const [showExportModal, setShowExportModal] = useState(false)
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('json')
  const [retentionPeriod, setRetentionPeriod] = useState('365')

  const handleExportData = (format: ExportFormat) => {
    setExportStatus({ inProgress: true, format, progress: 0 })
    setShowExportModal(false)

    // Simulate export progress
    const interval = setInterval(() => {
      setExportStatus(prev => {
        const newProgress = (prev.progress || 0) + 10
        if (newProgress >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            setExportStatus({ inProgress: false })
            // Trigger actual download here
            alert(`Your data has been exported as ${format.toUpperCase()}!`)
          }, 500)
          return { inProgress: true, format, progress: 100 }
        }
        return { inProgress: true, format, progress: newProgress }
      })
    }, 300)
  }

  const exportOptions = [
    {
      format: 'json' as ExportFormat,
      name: 'JSON',
      description: 'Complete data with full structure',
      icon: FileText,
      size: '~2-5 MB'
    },
    {
      format: 'csv' as ExportFormat,
      name: 'CSV',
      description: 'Spreadsheet-friendly format',
      icon: Database,
      size: '~1-3 MB'
    },
    {
      format: 'pdf' as ExportFormat,
      name: 'PDF',
      description: 'Human-readable report',
      icon: FileText,
      size: '~5-10 MB'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Privacy & Data
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Control your data and understand how we protect your privacy
        </p>
      </div>

      {/* Data Export Section */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-100 dark:border-indigo-800"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-500 rounded-lg">
            <Download className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Data Export
          </h3>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Download a copy of your data at any time. Includes journal entries, fulfillment tracking, AI conversations, and account settings.
          </p>

          {exportStatus.inProgress && (
            <div className="p-4 bg-white/50 dark:bg-slate-900/50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="animate-spin">
                  <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-slate-900 dark:text-white">
                    Exporting your data as {exportStatus.format?.toUpperCase()}...
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {exportStatus.progress}% complete
                  </div>
                </div>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${exportStatus.progress}%` }}
                />
              </div>
            </div>
          )}

          <button
            onClick={() => setShowExportModal(true)}
            disabled={exportStatus.inProgress}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Download My Data
          </button>

          <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-slate-700 dark:text-slate-300">
                <strong>Note:</strong> Data exports may take a few minutes to prepare depending on the size of your account.
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Data Retention */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-800 dark:to-purple-900/20 rounded-xl p-6 border border-purple-100 dark:border-purple-800"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-500 rounded-lg">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Data Retention Policy
          </h3>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Control how long we keep your data after account deletion or inactivity.
          </p>

          <div className="p-4 bg-white/50 dark:bg-slate-900/50 rounded-lg space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <div className="font-medium text-slate-900 dark:text-white">Active Account Data</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Retained indefinitely while your account is active
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <div className="font-medium text-slate-900 dark:text-white">Deleted Account Data</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Permanently deleted within 30 days of account deletion
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <div className="font-medium text-slate-900 dark:text-white">Inactive Accounts</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Data retained for {retentionPeriod} days after last activity
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Inactivity Retention Period
            </label>
            <select
              value={retentionPeriod}
              onChange={(e) => setRetentionPeriod(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
            >
              <option value="90">90 days (3 months)</option>
              <option value="180">180 days (6 months)</option>
              <option value="365">365 days (1 year)</option>
              <option value="730">730 days (2 years)</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Compliance & Transparency */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-800 dark:to-green-900/20 rounded-xl p-6 border border-green-100 dark:border-green-800"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-500 rounded-lg">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Compliance & Transparency
          </h3>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            WisdomOS is committed to protecting your privacy and complying with global data protection regulations.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/50 dark:bg-slate-900/50 rounded-lg border border-green-200 dark:border-green-800/50">
              <div className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                GDPR Compliant
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                European data protection standards
              </p>
            </div>

            <div className="p-4 bg-white/50 dark:bg-slate-900/50 rounded-lg border border-green-200 dark:border-green-800/50">
              <div className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                CCPA Compliant
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                California privacy rights protected
              </p>
            </div>
          </div>

          <div className="p-4 bg-white/50 dark:bg-slate-900/50 rounded-lg space-y-3">
            <h4 className="font-medium text-slate-900 dark:text-white">Your Rights</h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                Right to access your personal data
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                Right to correct inaccurate data
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                Right to delete your data
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                Right to data portability
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                Right to withdraw consent
              </li>
            </ul>
          </div>

          <div className="flex gap-3">
            <a
              href="/privacy-policy"
              className="flex-1 px-4 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-600 text-center"
            >
              Privacy Policy
            </a>
            <a
              href="/data-processing"
              className="flex-1 px-4 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-600 text-center"
            >
              Data Processing
            </a>
          </div>
        </div>
      </motion.div>

      {/* Export Format Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-lg w-full shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Download className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Choose Export Format
              </h3>
            </div>

            <div className="space-y-3 mb-6">
              {exportOptions.map((option) => {
                const Icon = option.icon
                return (
                  <button
                    key={option.format}
                    onClick={() => setSelectedFormat(option.format)}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      selectedFormat === option.format
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`w-6 h-6 mt-1 ${
                        selectedFormat === option.format
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-slate-400'
                      }`} />
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {option.name}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {option.description}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                          Estimated size: {option.size}
                        </div>
                      </div>
                      {selectedFormat === option.format && (
                        <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowExportModal(false)}
                className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleExportData(selectedFormat)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Export Data
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
