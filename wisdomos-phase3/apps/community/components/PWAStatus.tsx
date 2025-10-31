'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  Wifi, 
  WifiOff, 
  Smartphone, 
  RefreshCw, 
  X,
  CheckCircle,
  AlertCircle,
  Share2,
  Bell
} from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import { useNotifications } from '@/contexts/NotificationContext';

export default function PWAStatus() {
  const { 
    isInstallable, 
    isInstalled, 
    isOnline, 
    isStandalone,
    updateAvailable,
    installing,
    installApp,
    updateApp,
    shareContent,
    requestNotificationPermission,
    addToHomeScreen
  } = usePWA();
  
  const { addNotification } = useNotifications();
  
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Show install prompt after a delay if app is installable
  useEffect(() => {
    if (isInstallable && !isInstalled && !dismissed) {
      const timer = setTimeout(() => {
        setShowInstallPrompt(true);
      }, 10000); // Show after 10 seconds

      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled, dismissed]);

  // Show update prompt when available
  useEffect(() => {
    if (updateAvailable) {
      setShowUpdatePrompt(true);
    }
  }, [updateAvailable]);

  // Notify about offline status
  useEffect(() => {
    if (!isOnline) {
      addNotification({
        type: 'system',
        title: 'You\'re Offline',
        message: 'Some features may be limited. You can still access cached content.',
        icon: 'alert',
        priority: 'medium',
        autoHide: false
      });
    }
  }, [isOnline, addNotification]);

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      setShowInstallPrompt(false);
      addNotification({
        type: 'achievement',
        title: 'App Installed!',
        message: 'WisdomOS has been added to your home screen.',
        icon: 'check',
        priority: 'high'
      });
    }
  };

  const handleUpdate = async () => {
    await updateApp();
    setShowUpdatePrompt(false);
  };

  const handleShare = async () => {
    const shared = await shareContent({
      title: 'WisdomOS - My Wisdom Journey',
      text: 'Check out my progress on WisdomOS - a platform for personal growth and wisdom tracking.',
      url: window.location.href
    });

    if (shared) {
      addNotification({
        type: 'system',
        title: 'Shared Successfully',
        message: 'Your wisdom journey has been shared.',
        icon: 'check',
        priority: 'medium'
      });
    }
  };

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      addNotification({
        type: 'system',
        title: 'Notifications Enabled',
        message: 'You\'ll now receive reminders and achievements.',
        icon: 'check',
        priority: 'medium'
      });
    }
  };

  return (
    <>
      {/* Online/Offline Status */}
      <div className="fixed top-4 left-4 z-50">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`
            flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium
            ${isOnline 
              ? 'bg-green-100 dark:bg-green-900/20 text-black dark:text-black' 
              : 'bg-red-100 dark:bg-red-900/20 text-black dark:text-black'
            }
          `}
        >
          {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
          {isOnline ? 'Online' : 'Offline'}
        </motion.div>
      </div>

      {/* PWA Controls (only show if not standalone) */}
      {!isStandalone && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="flex flex-col gap-2">
            {/* Share Button */}
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleShare}
              className="p-3 bg-purple-600 text-black rounded-full shadow-lg hover:bg-purple-700 transition-colors"
              title="Share your progress"
            >
              <Share2 className="w-5 h-5" />
            </motion.button>

            {/* Install Button */}
            {isInstallable && (
              <motion.button
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={handleInstall}
                disabled={installing}
                className="p-3 bg-blue-600 text-black rounded-full shadow-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                title="Install app"
              >
                {installing ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Download className="w-5 h-5" />
                )}
              </motion.button>
            )}
          </div>
        </div>
      )}

      {/* Install Prompt */}
      <AnimatePresence>
        {showInstallPrompt && !dismissed && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <Smartphone className="w-5 h-5 text-black" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-black dark:text-black mb-1">
                    Install WisdomOS
                  </h3>
                  <p className="text-sm text-black dark:text-black mb-3">
                    Add WisdomOS to your home screen for quick access and offline features.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleInstall}
                      disabled={installing}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-black rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors text-sm"
                    >
                      {installing ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      Install
                    </button>
                    <button
                      onClick={() => {
                        setShowInstallPrompt(false);
                        setDismissed(true);
                      }}
                      className="px-4 py-2 text-black dark:text-black hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm"
                    >
                      Not now
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setShowInstallPrompt(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  <X className="w-4 h-4 text-black" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Update Prompt */}
      <AnimatePresence>
        {showUpdatePrompt && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4"
          >
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <RefreshCw className="w-5 h-5 text-black mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-black dark:text-black">
                    Update Available
                  </h3>
                  <p className="text-sm text-black dark:text-black mt-1">
                    A new version of WisdomOS is ready to install.
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={handleUpdate}
                      className="px-3 py-1.5 bg-blue-600 text-black rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Update Now
                    </button>
                    <button
                      onClick={() => setShowUpdatePrompt(false)}
                      className="px-3 py-1.5 text-black hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors text-sm"
                    >
                      Later
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setShowUpdatePrompt(false)}
                  className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded transition-colors"
                >
                  <X className="w-4 h-4 text-black" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification Permission Prompt (if PWA and not granted) */}
      {isStandalone && Notification.permission === 'default' && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-40">
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 text-black mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-black dark:text-black">
                  Enable Notifications
                </h3>
                <p className="text-sm text-black dark:text-black mt-1">
                  Get reminders for your wisdom practice and achievement notifications.
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={handleEnableNotifications}
                    className="px-3 py-1.5 bg-orange-600 text-black rounded-lg hover:bg-orange-700 transition-colors text-sm"
                  >
                    Enable
                  </button>
                  <button className="px-3 py-1.5 text-black hover:bg-orange-100 dark:hover:bg-orange-900/40 rounded-lg transition-colors text-sm">
                    Not now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}