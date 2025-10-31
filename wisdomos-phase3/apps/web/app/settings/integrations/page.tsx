'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Plug, Check, X, ExternalLink, Calendar, MessageSquare, Mail, FileText, Zap, Cloud, Database } from 'lucide-react'

interface Integration {
  id: string
  name: string
  description: string
  icon: any
  connected: boolean
  category: 'productivity' | 'communication' | 'storage'
  permissions?: string[]
  lastSync?: string
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'notion',
      name: 'Notion',
      description: 'Sync journal entries and insights to your Notion workspace',
      icon: FileText,
      connected: true,
      category: 'productivity',
      permissions: ['Read workspace', 'Create pages', 'Update pages'],
      lastSync: '2 hours ago'
    },
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      description: 'Add fulfillment goals and reminders to your calendar',
      icon: Calendar,
      connected: true,
      category: 'productivity',
      permissions: ['Read calendar events', 'Create events', 'Send notifications'],
      lastSync: '5 minutes ago'
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Receive daily insights and reminders in your Slack workspace',
      icon: MessageSquare,
      connected: false,
      category: 'communication',
      permissions: ['Send messages', 'Read channels']
    },
    {
      id: 'gmail',
      name: 'Gmail',
      description: 'Get weekly summaries and important notifications via email',
      icon: Mail,
      connected: true,
      category: 'communication',
      permissions: ['Send emails'],
      lastSync: '1 day ago'
    },
    {
      id: 'zapier',
      name: 'Zapier',
      description: 'Connect WisdomOS with 5,000+ apps and automate workflows',
      icon: Zap,
      connected: false,
      category: 'productivity',
      permissions: ['Access data', 'Trigger actions']
    },
    {
      id: 'google-drive',
      name: 'Google Drive',
      description: 'Backup your journal entries and export files to Drive',
      icon: Cloud,
      connected: false,
      category: 'storage',
      permissions: ['Create files', 'Read files', 'Update files']
    },
    {
      id: 'airtable',
      name: 'Airtable',
      description: 'Export fulfillment data and tracking to Airtable bases',
      icon: Database,
      connected: false,
      category: 'productivity',
      permissions: ['Read bases', 'Create records', 'Update records']
    }
  ])

  const [showConnectModal, setShowConnectModal] = useState(false)
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)

  const handleConnect = (integrationId: string) => {
    const integration = integrations.find(i => i.id === integrationId)
    if (integration) {
      setSelectedIntegration(integration)
      setShowConnectModal(true)
    }
  }

  const confirmConnect = () => {
    if (selectedIntegration) {
      setIntegrations(prev =>
        prev.map(i =>
          i.id === selectedIntegration.id
            ? { ...i, connected: true, lastSync: 'Just now' }
            : i
        )
      )
      setShowConnectModal(false)
      setSelectedIntegration(null)
    }
  }

  const handleDisconnect = (integrationId: string) => {
    setIntegrations(prev =>
      prev.map(i =>
        i.id === integrationId
          ? { ...i, connected: false, lastSync: undefined }
          : i
      )
    )
  }

  const connectedCount = integrations.filter(i => i.connected).length
  const categories = {
    productivity: integrations.filter(i => i.category === 'productivity'),
    communication: integrations.filter(i => i.category === 'communication'),
    storage: integrations.filter(i => i.category === 'storage')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Integrations
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Connect WisdomOS with your favorite apps and services
        </p>
      </div>

      {/* Integration Stats */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="grid grid-cols-3 gap-4"
      >
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
          <Plug className="w-8 h-8 text-green-600 dark:text-green-400 mb-2" />
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{connectedCount}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Connected Apps</div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <Zap className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-2" />
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{integrations.length}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Available</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
          <Check className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-2" />
          <div className="text-2xl font-bold text-slate-900 dark:text-white">Active</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">All Syncing</div>
        </div>
      </motion.div>

      {/* Productivity Apps */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-indigo-900/20 rounded-xl p-6 border border-indigo-100 dark:border-indigo-800"
      >
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Productivity Apps
        </h3>

        <div className="space-y-3">
          {categories.productivity.map((integration) => {
            const Icon = integration.icon
            return (
              <div
                key={integration.id}
                className="p-4 bg-white/50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${
                      integration.connected
                        ? 'bg-green-100 dark:bg-green-900/30'
                        : 'bg-slate-100 dark:bg-slate-800'
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        integration.connected
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-slate-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                        {integration.name}
                        {integration.connected && (
                          <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Connected
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {integration.description}
                      </div>
                      {integration.connected && integration.lastSync && (
                        <div className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                          Last synced {integration.lastSync}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    {integration.connected ? (
                      <>
                        <button className="px-3 py-1 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" />
                          Configure
                        </button>
                        <button
                          onClick={() => handleDisconnect(integration.id)}
                          className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        >
                          Disconnect
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleConnect(integration.id)}
                        className="px-4 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                      >
                        Connect
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Communication Apps */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-800 dark:to-blue-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800"
      >
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Communication Apps
        </h3>

        <div className="space-y-3">
          {categories.communication.map((integration) => {
            const Icon = integration.icon
            return (
              <div
                key={integration.id}
                className="p-4 bg-white/50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${
                      integration.connected
                        ? 'bg-green-100 dark:bg-green-900/30'
                        : 'bg-slate-100 dark:bg-slate-800'
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        integration.connected
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-slate-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                        {integration.name}
                        {integration.connected && (
                          <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Connected
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {integration.description}
                      </div>
                      {integration.connected && integration.lastSync && (
                        <div className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                          Last synced {integration.lastSync}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    {integration.connected ? (
                      <>
                        <button className="px-3 py-1 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" />
                          Configure
                        </button>
                        <button
                          onClick={() => handleDisconnect(integration.id)}
                          className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        >
                          Disconnect
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleConnect(integration.id)}
                        className="px-4 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        Connect
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Storage Apps */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-slate-800 dark:to-orange-900/20 rounded-xl p-6 border border-orange-100 dark:border-orange-800"
      >
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Cloud className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          Storage & Backup
        </h3>

        <div className="space-y-3">
          {categories.storage.map((integration) => {
            const Icon = integration.icon
            return (
              <div
                key={integration.id}
                className="p-4 bg-white/50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${
                      integration.connected
                        ? 'bg-green-100 dark:bg-green-900/30'
                        : 'bg-slate-100 dark:bg-slate-800'
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        integration.connected
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-slate-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                        {integration.name}
                        {integration.connected && (
                          <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Connected
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {integration.description}
                      </div>
                      {integration.connected && integration.lastSync && (
                        <div className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                          Last synced {integration.lastSync}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    {integration.connected ? (
                      <>
                        <button className="px-3 py-1 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" />
                          Configure
                        </button>
                        <button
                          onClick={() => handleDisconnect(integration.id)}
                          className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        >
                          Disconnect
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleConnect(integration.id)}
                        className="px-4 py-1 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
                      >
                        Connect
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Connect Integration Modal */}
      {showConnectModal && selectedIntegration && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                {React.createElement(selectedIntegration.icon, {
                  className: "w-6 h-6 text-indigo-600 dark:text-indigo-400"
                })}
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Connect {selectedIntegration.name}
              </h3>
            </div>

            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {selectedIntegration.description}
            </p>

            {selectedIntegration.permissions && selectedIntegration.permissions.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium text-slate-900 dark:text-white mb-2">
                  This integration will be able to:
                </h4>
                <ul className="space-y-2">
                  {selectedIntegration.permissions.map((permission, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Check className="w-4 h-4 text-green-500" />
                      {permission}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConnectModal(false)
                  setSelectedIntegration(null)
                }}
                className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmConnect}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Connect
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
