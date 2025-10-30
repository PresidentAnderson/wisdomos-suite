'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Accessibility, Type, Eye, Zap, Keyboard, MousePointer, Volume2, Check, Save } from 'lucide-react'

interface AccessibilitySettings {
  fontSize: 'small' | 'medium' | 'large' | 'extra-large'
  highContrast: boolean
  reduceMotion: boolean
  keyboardNavigation: boolean
  screenReaderOptimized: boolean
  focusIndicators: boolean
  autoplayMedia: boolean
  textToSpeech: boolean
}

export default function AccessibilityPage() {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    fontSize: 'medium',
    highContrast: false,
    reduceMotion: false,
    keyboardNavigation: true,
    screenReaderOptimized: false,
    focusIndicators: true,
    autoplayMedia: true,
    textToSpeech: false
  })

  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    localStorage.setItem('wisdomos_accessibility', JSON.stringify(settings))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const fontSizeOptions = [
    { value: 'small' as const, label: 'Small', example: 'text-sm' },
    { value: 'medium' as const, label: 'Medium', example: 'text-base' },
    { value: 'large' as const, label: 'Large', example: 'text-lg' },
    { value: 'extra-large' as const, label: 'Extra Large', example: 'text-xl' }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Accessibility
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Customize your experience for better accessibility
        </p>
      </div>

      {/* Visual Settings */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-800 dark:to-purple-900/20 rounded-xl p-6 border border-purple-100 dark:border-purple-800"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-500 rounded-lg">
            <Eye className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Visual Settings
          </h3>
        </div>

        <div className="space-y-4">
          {/* Font Size */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Font Size
            </label>
            <div className="grid grid-cols-2 gap-3">
              {fontSizeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSettings({ ...settings, fontSize: option.value })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    settings.fontSize === option.value
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className={`font-semibold mb-1 ${
                    settings.fontSize === option.value
                      ? 'text-purple-600 dark:text-purple-400'
                      : 'text-slate-900 dark:text-white'
                  }`}>
                    {option.label}
                  </div>
                  <div className={`${option.example} text-slate-600 dark:text-slate-400`}>
                    Example text
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* High Contrast */}
          <label className="flex items-center justify-between p-4 bg-white/50 dark:bg-slate-900/50 rounded-lg cursor-pointer hover:bg-white/80 dark:hover:bg-slate-900/80 transition-colors">
            <div className="flex items-start gap-3">
              <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
              <div>
                <div className="font-medium text-slate-900 dark:text-white">High Contrast Mode</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Increase contrast for better readability
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.highContrast}
              onChange={(e) => setSettings({ ...settings, highContrast: e.target.checked })}
              className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
            />
          </label>

          {/* Reduce Motion */}
          <label className="flex items-center justify-between p-4 bg-white/50 dark:bg-slate-900/50 rounded-lg cursor-pointer hover:bg-white/80 dark:hover:bg-slate-900/80 transition-colors">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
              <div>
                <div className="font-medium text-slate-900 dark:text-white">Reduce Motion</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Minimize animations and transitions
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.reduceMotion}
              onChange={(e) => setSettings({ ...settings, reduceMotion: e.target.checked })}
              className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
            />
          </label>
        </div>
      </motion.div>

      {/* Navigation Settings */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-blue-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-500 rounded-lg">
            <Keyboard className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Navigation & Interaction
          </h3>
        </div>

        <div className="space-y-3">
          {/* Keyboard Navigation */}
          <label className="flex items-center justify-between p-4 bg-white/50 dark:bg-slate-900/50 rounded-lg cursor-pointer hover:bg-white/80 dark:hover:bg-slate-900/80 transition-colors">
            <div className="flex items-start gap-3">
              <Keyboard className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <div className="font-medium text-slate-900 dark:text-white">Enhanced Keyboard Navigation</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Navigate using Tab, Arrow keys, and shortcuts
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.keyboardNavigation}
              onChange={(e) => setSettings({ ...settings, keyboardNavigation: e.target.checked })}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
          </label>

          {/* Focus Indicators */}
          <label className="flex items-center justify-between p-4 bg-white/50 dark:bg-slate-900/50 rounded-lg cursor-pointer hover:bg-white/80 dark:hover:bg-slate-900/80 transition-colors">
            <div className="flex items-start gap-3">
              <MousePointer className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <div className="font-medium text-slate-900 dark:text-white">Enhanced Focus Indicators</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Show clear outlines around focused elements
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.focusIndicators}
              onChange={(e) => setSettings({ ...settings, focusIndicators: e.target.checked })}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
          </label>
        </div>
      </motion.div>

      {/* Screen Reader & Audio */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-800 dark:to-green-900/20 rounded-xl p-6 border border-green-100 dark:border-green-800"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-500 rounded-lg">
            <Volume2 className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Screen Reader & Audio
          </h3>
        </div>

        <div className="space-y-3">
          {/* Screen Reader Optimized */}
          <label className="flex items-center justify-between p-4 bg-white/50 dark:bg-slate-900/50 rounded-lg cursor-pointer hover:bg-white/80 dark:hover:bg-slate-900/80 transition-colors">
            <div className="flex items-start gap-3">
              <Accessibility className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div>
                <div className="font-medium text-slate-900 dark:text-white">Screen Reader Optimized</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Enhanced ARIA labels and semantic HTML
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.screenReaderOptimized}
              onChange={(e) => setSettings({ ...settings, screenReaderOptimized: e.target.checked })}
              className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
            />
          </label>

          {/* Text to Speech */}
          <label className="flex items-center justify-between p-4 bg-white/50 dark:bg-slate-900/50 rounded-lg cursor-pointer hover:bg-white/80 dark:hover:bg-slate-900/80 transition-colors">
            <div className="flex items-start gap-3">
              <Volume2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div>
                <div className="font-medium text-slate-900 dark:text-white">Text-to-Speech</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Read journal entries and insights aloud
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.textToSpeech}
              onChange={(e) => setSettings({ ...settings, textToSpeech: e.target.checked })}
              className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
            />
          </label>

          {/* Autoplay Media */}
          <label className="flex items-center justify-between p-4 bg-white/50 dark:bg-slate-900/50 rounded-lg cursor-pointer hover:bg-white/80 dark:hover:bg-slate-900/80 transition-colors">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div>
                <div className="font-medium text-slate-900 dark:text-white">Autoplay Media</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Automatically play videos and audio content
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.autoplayMedia}
              onChange={(e) => setSettings({ ...settings, autoplayMedia: e.target.checked })}
              className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
            />
          </label>
        </div>
      </motion.div>

      {/* Keyboard Shortcuts Reference */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-slate-800 dark:to-orange-900/20 rounded-xl p-6 border border-orange-100 dark:border-orange-800"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-500 rounded-lg">
            <Type className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Keyboard Shortcuts
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-white/50 dark:bg-slate-900/50 rounded-lg">
            <div className="font-mono text-sm text-slate-900 dark:text-white mb-1">
              <kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded">Ctrl</kbd> + <kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded">J</kbd>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Open Journal</div>
          </div>

          <div className="p-3 bg-white/50 dark:bg-slate-900/50 rounded-lg">
            <div className="font-mono text-sm text-slate-900 dark:text-white mb-1">
              <kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded">Ctrl</kbd> + <kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded">K</kbd>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Quick Search</div>
          </div>

          <div className="p-3 bg-white/50 dark:bg-slate-900/50 rounded-lg">
            <div className="font-mono text-sm text-slate-900 dark:text-white mb-1">
              <kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded">Ctrl</kbd> + <kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded">S</kbd>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Save Entry</div>
          </div>

          <div className="p-3 bg-white/50 dark:bg-slate-900/50 rounded-lg">
            <div className="font-mono text-sm text-slate-900 dark:text-white mb-1">
              <kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded">Esc</kbd>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Close Modal</div>
          </div>

          <div className="p-3 bg-white/50 dark:bg-slate-900/50 rounded-lg">
            <div className="font-mono text-sm text-slate-900 dark:text-white mb-1">
              <kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded">Tab</kbd>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Navigate Forward</div>
          </div>

          <div className="p-3 bg-white/50 dark:bg-slate-900/50 rounded-lg">
            <div className="font-mono text-sm text-slate-900 dark:text-white mb-1">
              <kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded">Shift</kbd> + <kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded">Tab</kbd>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Navigate Back</div>
          </div>
        </div>

        <button className="w-full mt-4 px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-600">
          View All Shortcuts
        </button>
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
