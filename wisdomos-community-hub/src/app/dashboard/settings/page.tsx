'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Settings, Bell, Shield, Palette, Globe, Database, Download, Trash2, Eye, Lock, Smartphone } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { trackEvent } from '@/lib/analytics'

interface NotificationSettings {
  email_notifications: boolean
  push_notifications: boolean
  weekly_digest: boolean
  course_reminders: boolean
  community_updates: boolean
  achievement_alerts: boolean
  system_announcements: boolean
}

interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system'
  compact_mode: boolean
  show_animations: boolean
  font_size: 'small' | 'medium' | 'large'
  sidebar_collapsed: boolean
}

interface PrivacySettings {
  profile_visibility: 'public' | 'private' | 'members_only'
  activity_tracking: boolean
  analytics_sharing: boolean
  show_online_status: boolean
  allow_direct_messages: boolean
  show_learning_progress: boolean
}

interface DataSettings {
  export_format: 'json' | 'csv' | 'pdf'
  backup_frequency: 'daily' | 'weekly' | 'monthly' | 'never'
  auto_sync: boolean
  offline_mode: boolean
}

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const [activeSection, setActiveSection] = useState<'notifications' | 'appearance' | 'privacy' | 'data' | 'account'>('notifications')
  const [isSaving, setIsSaving] = useState(false)

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email_notifications: true,
    push_notifications: false,
    weekly_digest: true,
    course_reminders: true,
    community_updates: false,
    achievement_alerts: true,
    system_announcements: true
  })

  const [appearanceSettings, setAppearanceSettings] = useState<AppearanceSettings>({
    theme: 'light',
    compact_mode: false,
    show_animations: true,
    font_size: 'medium',
    sidebar_collapsed: false
  })

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    profile_visibility: 'public',
    activity_tracking: true,
    analytics_sharing: false,
    show_online_status: true,
    allow_direct_messages: true,
    show_learning_progress: true
  })

  const [dataSettings, setDataSettings] = useState<DataSettings>({
    export_format: 'json',
    backup_frequency: 'weekly',
    auto_sync: true,
    offline_mode: false
  })

  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      trackEvent('settings_updated', { 
        user_id: user?.id, 
        section: activeSection 
      })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Settings save error:', error)
      alert('Failed to save settings. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleExportData = () => {
    trackEvent('data_export_requested', { 
      user_id: user?.id,
      format: dataSettings.export_format
    })
    alert(`Data export in ${dataSettings.export_format.toUpperCase()} format would be implemented here`)
  }

  const handleDeleteAccount = () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.'
    )
    
    if (confirmed) {
      trackEvent('account_deletion_requested', { user_id: user?.id })
      alert('Account deletion process would be implemented here')
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const sectionConfig = [
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'appearance', label: 'Appearance', icon: Palette },
    { key: 'privacy', label: 'Privacy', icon: Shield },
    { key: 'data', label: 'Data & Storage', icon: Database },
    { key: 'account', label: 'Account', icon: Settings }
  ]

  return (
    <DashboardLayout 
      title="Settings" 
      description="Customize your WisdomOS experience and manage your preferences"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              <nav className="space-y-2">
                {sectionConfig.map((section) => {
                  const IconComponent = section.icon
                  return (
                    <button
                      key={section.key}
                      onClick={() => setActiveSection(section.key as any)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors ${
                        activeSection === section.key
                          ? 'bg-blue-100 text-blue-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <IconComponent className="h-5 w-5" />
                      {section.label}
                    </button>
                  )
                })}
              </nav>
            </Card>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            <Card className="p-6">
              {/* Notifications Settings */}
              {activeSection === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Notification Preferences</h3>
                    <p className="text-gray-600 text-sm">Choose how you want to be notified about updates and activities.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                        <p className="text-xs text-gray-500">Receive notifications via email</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.email_notifications}
                        onChange={(e) => setNotificationSettings(prev => ({
                          ...prev,
                          email_notifications: e.target.checked
                        }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Push Notifications</label>
                        <p className="text-xs text-gray-500">Receive push notifications on your devices</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.push_notifications}
                        onChange={(e) => setNotificationSettings(prev => ({
                          ...prev,
                          push_notifications: e.target.checked
                        }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Weekly Digest</label>
                        <p className="text-xs text-gray-500">Get a summary of your week's activities</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.weekly_digest}
                        onChange={(e) => setNotificationSettings(prev => ({
                          ...prev,
                          weekly_digest: e.target.checked
                        }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Course Reminders</label>
                        <p className="text-xs text-gray-500">Reminders about course deadlines and updates</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.course_reminders}
                        onChange={(e) => setNotificationSettings(prev => ({
                          ...prev,
                          course_reminders: e.target.checked
                        }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Community Updates</label>
                        <p className="text-xs text-gray-500">Notifications about community posts and discussions</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.community_updates}
                        onChange={(e) => setNotificationSettings(prev => ({
                          ...prev,
                          community_updates: e.target.checked
                        }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Achievement Alerts</label>
                        <p className="text-xs text-gray-500">Notifications when you earn new achievements</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.achievement_alerts}
                        onChange={(e) => setNotificationSettings(prev => ({
                          ...prev,
                          achievement_alerts: e.target.checked
                        }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">System Announcements</label>
                        <p className="text-xs text-gray-500">Important updates about the platform</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.system_announcements}
                        onChange={(e) => setNotificationSettings(prev => ({
                          ...prev,
                          system_announcements: e.target.checked
                        }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Appearance Settings */}
              {activeSection === 'appearance' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Appearance & Display</h3>
                    <p className="text-gray-600 text-sm">Customize how WisdomOS looks and feels.</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                      <select
                        value={appearanceSettings.theme}
                        onChange={(e) => setAppearanceSettings(prev => ({
                          ...prev,
                          theme: e.target.value as any
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="system">System</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
                      <select
                        value={appearanceSettings.font_size}
                        onChange={(e) => setAppearanceSettings(prev => ({
                          ...prev,
                          font_size: e.target.value as any
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Compact Mode</label>
                        <p className="text-xs text-gray-500">Reduce spacing for more content on screen</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={appearanceSettings.compact_mode}
                        onChange={(e) => setAppearanceSettings(prev => ({
                          ...prev,
                          compact_mode: e.target.checked
                        }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Show Animations</label>
                        <p className="text-xs text-gray-500">Enable smooth transitions and animations</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={appearanceSettings.show_animations}
                        onChange={(e) => setAppearanceSettings(prev => ({
                          ...prev,
                          show_animations: e.target.checked
                        }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Collapsed Sidebar</label>
                        <p className="text-xs text-gray-500">Start with sidebar minimized</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={appearanceSettings.sidebar_collapsed}
                        onChange={(e) => setAppearanceSettings(prev => ({
                          ...prev,
                          sidebar_collapsed: e.target.checked
                        }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy Settings */}
              {activeSection === 'privacy' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Privacy & Visibility</h3>
                    <p className="text-gray-600 text-sm">Control who can see your information and activities.</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Profile Visibility</label>
                      <select
                        value={privacySettings.profile_visibility}
                        onChange={(e) => setPrivacySettings(prev => ({
                          ...prev,
                          profile_visibility: e.target.value as any
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="public">Public - Anyone can view</option>
                        <option value="members_only">Members Only</option>
                        <option value="private">Private - Only you</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Activity Tracking</label>
                        <p className="text-xs text-gray-500">Allow tracking for personalized recommendations</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={privacySettings.activity_tracking}
                        onChange={(e) => setPrivacySettings(prev => ({
                          ...prev,
                          activity_tracking: e.target.checked
                        }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Analytics Sharing</label>
                        <p className="text-xs text-gray-500">Share anonymized data to improve the platform</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={privacySettings.analytics_sharing}
                        onChange={(e) => setPrivacySettings(prev => ({
                          ...prev,
                          analytics_sharing: e.target.checked
                        }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Show Online Status</label>
                        <p className="text-xs text-gray-500">Let others see when you're online</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={privacySettings.show_online_status}
                        onChange={(e) => setPrivacySettings(prev => ({
                          ...prev,
                          show_online_status: e.target.checked
                        }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Allow Direct Messages</label>
                        <p className="text-xs text-gray-500">Let community members send you messages</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={privacySettings.allow_direct_messages}
                        onChange={(e) => setPrivacySettings(prev => ({
                          ...prev,
                          allow_direct_messages: e.target.checked
                        }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Show Learning Progress</label>
                        <p className="text-xs text-gray-500">Display your course progress publicly</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={privacySettings.show_learning_progress}
                        onChange={(e) => setPrivacySettings(prev => ({
                          ...prev,
                          show_learning_progress: e.target.checked
                        }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Data Settings */}
              {activeSection === 'data' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Management</h3>
                    <p className="text-gray-600 text-sm">Control how your data is stored, backed up, and exported.</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
                      <select
                        value={dataSettings.export_format}
                        onChange={(e) => setDataSettings(prev => ({
                          ...prev,
                          export_format: e.target.value as any
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="json">JSON</option>
                        <option value="csv">CSV</option>
                        <option value="pdf">PDF</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
                      <select
                        value={dataSettings.backup_frequency}
                        onChange={(e) => setDataSettings(prev => ({
                          ...prev,
                          backup_frequency: e.target.value as any
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="never">Never</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Auto Sync</label>
                        <p className="text-xs text-gray-500">Automatically sync data across devices</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={dataSettings.auto_sync}
                        onChange={(e) => setDataSettings(prev => ({
                          ...prev,
                          auto_sync: e.target.checked
                        }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Offline Mode</label>
                        <p className="text-xs text-gray-500">Cache content for offline access</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={dataSettings.offline_mode}
                        onChange={(e) => setDataSettings(prev => ({
                          ...prev,
                          offline_mode: e.target.checked
                        }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <Button 
                        onClick={handleExportData}
                        variant="outline" 
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Export My Data
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Account Settings */}
              {activeSection === 'account' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Account Management</h3>
                    <p className="text-gray-600 text-sm">Manage your account settings and security options.</p>
                  </div>

                  <div className="space-y-6">
                    <Card className="p-4 bg-blue-50 border border-blue-200">
                      <div className="flex items-center gap-3">
                        <Smartphone className="h-8 w-8 text-blue-600" />
                        <div className="flex-1">
                          <h4 className="font-medium text-blue-900">Two-Factor Authentication</h4>
                          <p className="text-sm text-blue-700">Add an extra layer of security to your account</p>
                        </div>
                        <Button variant="outline" size="sm">
                          Enable 2FA
                        </Button>
                      </div>
                    </Card>

                    <Card className="p-4 bg-green-50 border border-green-200">
                      <div className="flex items-center gap-3">
                        <Lock className="h-8 w-8 text-green-600" />
                        <div className="flex-1">
                          <h4 className="font-medium text-green-900">Change Password</h4>
                          <p className="text-sm text-green-700">Update your account password</p>
                        </div>
                        <Button variant="outline" size="sm">
                          Change Password
                        </Button>
                      </div>
                    </Card>

                    <Card className="p-4 bg-gray-50 border border-gray-200">
                      <div className="flex items-center gap-3">
                        <Eye className="h-8 w-8 text-gray-600" />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">Login History</h4>
                          <p className="text-sm text-gray-700">View recent login activity and devices</p>
                        </div>
                        <Button variant="outline" size="sm">
                          View History
                        </Button>
                      </div>
                    </Card>

                    <Card className="p-4 bg-red-50 border border-red-200">
                      <div className="flex items-center gap-3">
                        <Trash2 className="h-8 w-8 text-red-600" />
                        <div className="flex-1">
                          <h4 className="font-medium text-red-900">Delete Account</h4>
                          <p className="text-sm text-red-700">Permanently delete your account and all associated data</p>
                        </div>
                        <Button 
                          onClick={handleDeleteAccount}
                          variant="outline" 
                          size="sm"
                          className="text-red-600 border-red-300 hover:bg-red-100"
                        >
                          Delete Account
                        </Button>
                      </div>
                    </Card>

                    <div className="pt-4 border-t border-gray-200">
                      <Button 
                        onClick={handleSignOut}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              {activeSection !== 'account' && (
                <div className="pt-6 border-t border-gray-200">
                  <Button 
                    onClick={handleSaveSettings}
                    disabled={isSaving}
                    className="flex items-center gap-2"
                  >
                    {isSaving ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    ) : (
                      <Settings className="h-4 w-4" />
                    )}
                    {isSaving ? 'Saving...' : 'Save Settings'}
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}