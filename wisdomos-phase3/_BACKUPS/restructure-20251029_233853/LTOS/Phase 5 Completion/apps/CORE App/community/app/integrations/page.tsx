'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Link2, 
  Plus, 
  Settings, 
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  ExternalLink,
  RefreshCw,
  Filter,
  Search,
  Calendar,
  Activity,
  Heart,
  Target,
  Smartphone,
  Globe,
  Database,
  Bell,
  BarChart3
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';

interface Integration {
  id: string;
  name: string;
  type: string;
  description: string;
  icon: string;
  capabilities: string[];
  status: 'not_connected' | 'connecting' | 'connected' | 'error';
  authUrl?: string;
  webhookSupported: boolean;
}

interface UserIntegration {
  id: string;
  integration_id: string;
  status: string;
  last_sync_at: string;
  sync_count: number;
  settings: any;
  created_at: string;
}

const integrationCategories = [
  { id: 'all', label: 'All Integrations', icon: Globe },
  { id: 'fitness_tracker', label: 'Fitness & Health', icon: Activity },
  { id: 'meditation_app', label: 'Meditation', icon: Heart },
  { id: 'calendar', label: 'Calendar & Time', icon: Calendar },
  { id: 'habit_tracker', label: 'Habits & Goals', icon: Target },
  { id: 'note_taking', label: 'Notes & Docs', icon: Database },
  { id: 'webhook', label: 'Custom', icon: Zap }
];

export default function IntegrationsPage() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [userIntegrations, setUserIntegrations] = useState<UserIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showConnectedOnly, setShowConnectedOnly] = useState(false);

  useEffect(() => {
    if (user) {
      loadIntegrations();
    }
  }, [user]);

  const loadIntegrations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/integrations?userId=${user?.id}`);
      const data = await response.json();

      if (response.ok) {
        setIntegrations(data.integrations);
        setUserIntegrations(data.userIntegrations);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error loading integrations:', error);
      addNotification({
        type: 'system',
        title: 'Loading Failed',
        message: 'Failed to load integrations. Please try again.',
        icon: 'alert',
        priority: 'high'
      });
    } finally {
      setLoading(false);
    }
  };

  const connectIntegration = async (integrationId: string, webhookUrl?: string) => {
    try {
      setConnecting(integrationId);

      const response = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          integrationId,
          webhookUrl
        })
      });

      const data = await response.json();

      if (response.ok) {
        if (data.authUrl) {
          // Redirect to OAuth flow
          window.location.href = data.authUrl;
        } else {
          // Integration connected immediately
          addNotification({
            type: 'achievement',
            title: 'Integration Connected',
            message: data.message,
            icon: 'check',
            priority: 'high'
          });
          await loadIntegrations();
        }
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      addNotification({
        type: 'system',
        title: 'Connection Failed',
        message: error instanceof Error ? error.message : 'Failed to connect integration',
        icon: 'alert',
        priority: 'high'
      });
    } finally {
      setConnecting(null);
    }
  };

  const disconnectIntegration = async (integrationId: string) => {
    if (!confirm('Are you sure you want to disconnect this integration? This will stop data syncing.')) {
      return;
    }

    try {
      const response = await fetch(`/api/integrations?userId=${user?.id}&integrationId=${integrationId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        addNotification({
          type: 'system',
          title: 'Integration Disconnected',
          message: data.message,
          icon: 'check',
          priority: 'medium'
        });
        await loadIntegrations();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      addNotification({
        type: 'system',
        title: 'Disconnection Failed',
        message: error instanceof Error ? error.message : 'Failed to disconnect integration',
        icon: 'alert',
        priority: 'high'
      });
    }
  };

  const syncIntegration = async (integrationId: string) => {
    try {
      const response = await fetch('/api/integrations/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          integrationId,
          syncType: 'manual'
        })
      });

      const data = await response.json();

      if (response.ok) {
        addNotification({
          type: 'system',
          title: 'Sync Complete',
          message: `Imported ${data.result.imported} records`,
          icon: 'check',
          priority: 'medium'
        });
        await loadIntegrations();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      addNotification({
        type: 'system',
        title: 'Sync Failed',
        message: error instanceof Error ? error.message : 'Failed to sync data',
        icon: 'alert',
        priority: 'high'
      });
    }
  };

  // Filter integrations based on search and category
  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || integration.type === selectedCategory;
    const matchesConnectionFilter = !showConnectedOnly || integration.status === 'connected';
    
    return matchesSearch && matchesCategory && matchesConnectionFilter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-5 h-5 text-black" />;
      case 'connecting': return <Clock className="w-5 h-5 text-black" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-black" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800';
      case 'connecting': return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800';
      case 'error': return 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800';
      default: return 'border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700';
    }
  };

  const connectedCount = integrations.filter(i => i.status === 'connected').length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black dark:text-black">Loading integrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black dark:text-black mb-2">
            Integrations
          </h1>
          <p className="text-black dark:text-black">
            Connect external tools to enhance your wisdom journey
          </p>
          <div className="mt-4 flex items-center gap-4 text-sm text-black dark:text-black">
            <div className="flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              <span>{connectedCount} connected</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>{integrations.length} available</span>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-black" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search integrations..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-black dark:text-black"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2 overflow-x-auto">
              {integrationCategories.map(category => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors
                      ${selectedCategory === category.id
                        ? 'bg-purple-100 dark:bg-purple-900/20 text-black dark:text-black'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{category.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Connected Only Toggle */}
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showConnectedOnly}
                onChange={(e) => setShowConnectedOnly(e.target.checked)}
                className="rounded border-gray-300 text-black focus:ring-purple-500"
              />
              <span className="text-sm text-black dark:text-black">
                Connected only
              </span>
            </label>
          </div>
        </div>

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredIntegrations.map((integration) => {
              const isConnected = integration.status === 'connected';
              const isConnecting = connecting === integration.id;
              const userIntegration = userIntegrations.find(ui => ui.integration_id === integration.id);

              return (
                <motion.div
                  key={integration.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className={`
                    rounded-xl p-6 border transition-all hover:shadow-md
                    ${getStatusColor(integration.status)}
                  `}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                        <img 
                          src={integration.icon} 
                          alt={integration.name}
                          className="w-8 h-8 rounded"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>`;
                          }}
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-black dark:text-black">
                          {integration.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusIcon(integration.status)}
                          <span className="text-sm text-black dark:text-black capitalize">
                            {integration.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {integration.webhookSupported && (
                      <div className="p-1 bg-purple-100 dark:bg-purple-900/20 rounded">
                        <Bell className="w-3 h-3 text-black" />
                      </div>
                    )}
                  </div>

                  <p className="text-black dark:text-black text-sm mb-4">
                    {integration.description}
                  </p>

                  {/* Capabilities */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {integration.capabilities.slice(0, 3).map((capability) => (
                      <span 
                        key={capability}
                        className="text-xs bg-gray-100 dark:bg-gray-700 text-black dark:text-black px-2 py-1 rounded"
                      >
                        {capability.replace('_', ' ')}
                      </span>
                    ))}
                    {integration.capabilities.length > 3 && (
                      <span className="text-xs text-black dark:text-black">
                        +{integration.capabilities.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Last Sync Info */}
                  {isConnected && userIntegration && (
                    <div className="text-xs text-black dark:text-black mb-4">
                      <div>Last sync: {new Date(userIntegration.last_sync_at).toLocaleDateString()}</div>
                      <div>Synced {userIntegration.sync_count} times</div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {!isConnected ? (
                      <button
                        onClick={() => connectIntegration(integration.id)}
                        disabled={isConnecting}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-black rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                      >
                        {isConnecting ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                        {isConnecting ? 'Connecting...' : 'Connect'}
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => syncIntegration(integration.id)}
                          className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          title="Sync now"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                          className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          title="Settings"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => disconnectIntegration(integration.id)}
                          className="flex items-center justify-center gap-2 px-3 py-2 border border-red-300 dark:border-red-600 text-black rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Disconnect"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {filteredIntegrations.length === 0 && (
          <div className="text-center py-12">
            <Link2 className="w-16 h-16 text-black dark:text-black mx-auto mb-4" />
            <h3 className="text-lg font-medium text-black dark:text-black mb-2">
              No integrations found
            </h3>
            <p className="text-black dark:text-black mb-4">
              Try adjusting your search or filter criteria
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setShowConnectedOnly(false);
              }}
              className="text-black dark:text-black hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Integration Benefits */}
        <div className="mt-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg p-8 text-black">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold mb-4">Why Connect External Tools?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Automatic Sync</h3>
                  <p className="text-black text-sm">
                    Your data flows seamlessly between apps, reducing manual entry and keeping everything up to date.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Better Insights</h3>
                  <p className="text-black text-sm">
                    Combine data from multiple sources for deeper insights into your personal growth patterns.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Real-time Updates</h3>
                  <p className="text-black text-sm">
                    Get instant notifications and updates as your connected tools track your progress.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Unified Goals</h3>
                  <p className="text-black text-sm">
                    Track all aspects of your wellness journey in one place, from meditation to exercise to productivity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}