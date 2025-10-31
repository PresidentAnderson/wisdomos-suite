'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  WifiOff, 
  RefreshCw, 
  BookOpen, 
  Shield, 
  Target, 
  Heart,
  Home,
  Search,
  BarChart3,
  Clock
} from 'lucide-react';
import Link from 'next/link';

export default function OfflinePage() {
  const [retrying, setRetrying] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  useEffect(() => {
    // Get last sync time from localStorage
    const storedTime = localStorage.getItem('lastSyncTime');
    if (storedTime) {
      setLastSyncTime(new Date(storedTime));
    }
  }, []);

  const handleRetry = async () => {
    setRetrying(true);
    
    // Check if we're back online
    if (navigator.onLine) {
      window.location.reload();
    } else {
      // Still offline, show message
      setTimeout(() => {
        setRetrying(false);
        alert('Still no internet connection. Please check your network settings.');
      }, 2000);
    }
  };

  const offlineFeatures = [
    {
      title: 'Dashboard',
      description: 'View your cached wisdom stats and recent entries',
      icon: Home,
      path: '/dashboard',
      available: true
    },
    {
      title: 'Boundary Audit',
      description: 'Create new boundary audits (will sync when online)',
      icon: Shield,
      path: '/tools/boundary-audit',
      available: true
    },
    {
      title: 'Search',
      description: 'Search through your cached entries and content',
      icon: Search,
      path: '/search',
      available: true
    },
    {
      title: 'Analytics',
      description: 'Limited to cached data only',
      icon: BarChart3,
      path: '/analytics',
      available: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full"
      >
        {/* Main Offline Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <WifiOff className="w-12 h-12 text-black" />
          </motion.div>

          <h1 className="text-3xl font-bold text-black dark:text-black mb-4">
            You're Offline
          </h1>
          
          <p className="text-black dark:text-black text-lg mb-6">
            No internet connection detected. But don't worry – you can still access your wisdom content and create new entries.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-black rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${retrying ? 'animate-spin' : ''}`} />
              {retrying ? 'Checking...' : 'Try Again'}
            </button>
            
            <Link
              href="/dashboard"
              className="flex items-center justify-center gap-2 px-6 py-3 border border-purple-600 text-black dark:text-black rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
            >
              <Home className="w-5 h-5" />
              Go to Dashboard
            </Link>
          </div>

          {lastSyncTime && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <div className="flex items-center justify-center gap-2 text-black dark:text-black">
                <Clock className="w-4 h-4" />
                <span className="text-sm">
                  Last synced: {lastSyncTime.toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Available Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {offlineFeatures.map((feature, index) => {
            const Icon = feature.icon;
            
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                {feature.available ? (
                  <Link
                    href={feature.path}
                    className="block p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-purple-300 dark:hover:border-purple-600 transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-900/40 transition-colors">
                        <Icon className="w-6 h-6 text-black" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-black dark:text-black mb-1">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-black dark:text-black">
                          {feature.description}
                        </p>
                        <div className="mt-2">
                          <span className="inline-flex items-center text-xs text-black dark:text-black bg-green-100 dark:bg-green-900/20 px-2 py-1 rounded">
                            Available Offline
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 opacity-60">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <Icon className="w-6 h-6 text-black" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-black dark:text-black mb-1">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-black dark:text-black">
                          {feature.description}
                        </p>
                        <div className="mt-2">
                          <span className="inline-flex items-center text-xs text-black dark:text-black bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                            Requires Internet
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Offline Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <h2 className="text-lg font-semibold text-black dark:text-black mb-4">
            What you can do offline:
          </h2>
          
          <ul className="space-y-3 text-sm text-black dark:text-black">
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <div>
                <strong>Create entries:</strong> New boundary audits, upset documentation, and other entries will be saved locally and synced when you're back online.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <div>
                <strong>View cached data:</strong> Access your previously loaded dashboard, analytics, and entries.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <div>
                <strong>Search content:</strong> Find information in your locally cached wisdom entries.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <div>
                <strong>Track progress:</strong> View your offline-available statistics and milestones.
              </div>
            </li>
          </ul>
        </motion.div>

        {/* Sync Status */}
        <div className="mt-6 text-center">
          <p className="text-sm text-black dark:text-black">
            Your data will automatically sync when you reconnect to the internet.
          </p>
        </div>
      </motion.div>
    </div>
  );
}