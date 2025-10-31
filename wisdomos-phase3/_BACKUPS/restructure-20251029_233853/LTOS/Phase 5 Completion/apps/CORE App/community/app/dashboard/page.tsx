'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Users, 
  Calendar,
  Target,
  Brain,
  Award,
  Clock,
  BarChart3,
  Plus,
  ArrowRight,
  Loader2,
  BookOpen,
  Shield,
  Heart,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { analyticsApi } from '@/lib/database';

interface DashboardStats {
  totalBoundaryAudits: number;
  totalUpsetDocs: number;
  totalFulfillmentDisplays: number;
  totalAutobiographyEntries: number;
  totalContributions: number;
  totalAchievements: number;
  recentActivity: {
    boundaryAudits: any[];
    upsetDocs: any[];
    fulfillmentDisplays: any[];
    autobiographyEntries: any[];
    contributions: any[];
  };
}

export default function DashboardPage() {
  const { user, userProfile } = useAuth();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadDashboardStats();
    }
  }, [user]);

  const loadDashboardStats = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const stats = await analyticsApi.getUserStats(user.id);
      setDashboardStats(stats);
      
      // Combine and sort recent activity
      const combined = [
        ...stats.recentActivity.boundaryAudits.map((item: any) => ({
          ...item,
          type: 'boundary-audit',
          icon: Shield,
          color: 'text-black'
        })),
        ...stats.recentActivity.upsetDocs.map((item: any) => ({
          ...item,
          type: 'upset-doc',
          icon: Heart,
          color: 'text-black'
        })),
        ...stats.recentActivity.fulfillmentDisplays.map((item: any) => ({
          ...item,
          type: 'fulfillment',
          icon: Target,
          color: 'text-black'
        })),
        ...stats.recentActivity.autobiographyEntries.map((item: any) => ({
          ...item,
          type: 'autobiography',
          icon: BookOpen,
          color: 'text-black'
        })),
        ...stats.recentActivity.contributions.map((item: any) => ({
          ...item,
          type: 'contribution',
          icon: Users,
          color: 'text-black'
        }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setRecentActivity(combined.slice(0, 8));
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-black mx-auto mb-4" />
          <p className="text-black dark:text-black">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Boundary Audits',
      value: dashboardStats?.totalBoundaryAudits || 0,
      icon: <Shield className="w-6 h-6 text-black" />,
      link: '/tools/boundary-audit'
    },
    {
      title: 'Upset Docs',
      value: dashboardStats?.totalUpsetDocs || 0,
      icon: <Heart className="w-6 h-6 text-black" />,
      link: '/tools/upset-documentation'
    },
    {
      title: 'Fulfillment Displays',
      value: dashboardStats?.totalFulfillmentDisplays || 0,
      icon: <Target className="w-6 h-6 text-black" />,
      link: '/tools/fulfillment-display'
    },
    {
      title: 'Autobiography Entries',
      value: dashboardStats?.totalAutobiographyEntries || 0,
      icon: <BookOpen className="w-6 h-6 text-black" />,
      link: '/tools/autobiography'
    },
    {
      title: 'Contributions',
      value: dashboardStats?.totalContributions || 0,
      icon: <Users className="w-6 h-6 text-black" />,
      link: '/contributions'
    },
    {
      title: 'Achievements',
      value: dashboardStats?.totalAchievements || 0,
      icon: <Award className="w-6 h-6 text-black" />,
      link: '/achievements'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black dark:text-black mb-2">
            Welcome back, {userProfile?.bio ? user?.user_metadata?.full_name : 'Wisdom Seeker'}!
          </h1>
          <p className="text-black dark:text-black">
            Here's your wisdom journey overview
          </p>
        </div>

        {/* User Profile Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-black">
            <div className="flex items-center gap-4">
              <Brain className="w-8 h-8" />
              <div>
                <p className="text-black">Wisdom Level</p>
                <p className="text-2xl font-bold">{userProfile?.wisdom_level || 1}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-6 text-black">
            <div className="flex items-center gap-4">
              <Sparkles className="w-8 h-8" />
              <div>
                <p className="text-black">Contribution Points</p>
                <p className="text-2xl font-bold">{userProfile?.contribution_points || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-xl p-6 text-black">
            <div className="flex items-center gap-4">
              <Calendar className="w-8 h-8" />
              <div>
                <p className="text-black">Current Streak</p>
                <p className="text-2xl font-bold">{userProfile?.streak_count || 0} days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link 
                href={stat.link}
                className="block bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-600 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg group-hover:bg-purple-100 dark:group-hover:bg-purple-900 transition-colors">
                      {stat.icon}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-black dark:text-black">
                        {stat.value}
                      </h3>
                      <p className="text-black dark:text-black text-sm">
                        {stat.title}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-black group-hover:text-black transition-colors" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-black dark:text-black mb-4">
                Recent Activity
              </h2>
              {recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => {
                    const Icon = activity.icon;
                    return (
                      <motion.div
                        key={`${activity.type}-${activity.id}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      >
                        <div className={`p-2 rounded-lg bg-white dark:bg-gray-600`}>
                          <Icon className={`w-4 h-4 ${activity.color}`} />
                        </div>
                        <div className="flex-1">
                          <p className="text-black dark:text-black font-medium">
                            {activity.title}
                          </p>
                          <p className="text-black dark:text-black text-sm capitalize">
                            {activity.type.replace('-', ' ')} • {new Date(activity.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-black mx-auto mb-4" />
                  <p className="text-black dark:text-black mb-4">
                    No recent activity yet. Start by creating your first entry!
                  </p>
                  <Link
                    href="/tools/boundary-audit"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-black rounded-lg hover:bg-purple-700 transition"
                  >
                    <Plus className="w-4 h-4" />
                    Create Boundary Audit
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-black dark:text-black mb-4">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <Link
                  href="/tools/boundary-audit"
                  className="flex items-center gap-3 w-full px-4 py-3 bg-purple-600 text-black rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Shield className="w-4 h-4" />
                  Create Boundary Audit
                </Link>
                <Link
                  href="/tools/upset-documentation"
                  className="flex items-center gap-3 w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-black dark:text-black rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Heart className="w-4 h-4" />
                  Document Upset
                </Link>
                <Link
                  href="/tools/fulfillment-display"
                  className="flex items-center gap-3 w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-black dark:text-black rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Target className="w-4 h-4" />
                  Create Fulfillment Display
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center gap-3 w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-black dark:text-black rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Users className="w-4 h-4" />
                  View Profile
                </Link>
              </div>
            </div>

            {/* User Achievements */}
            {userProfile?.badges && (userProfile.badges as string[]).length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mt-6">
                <h2 className="text-xl font-bold text-black dark:text-black mb-4">
                  Latest Badges
                </h2>
                <div className="flex flex-wrap gap-2">
                  {(userProfile.badges as string[]).slice(0, 4).map((badge, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-black text-xs rounded-full"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Progress Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mt-6">
              <h2 className="text-xl font-bold text-black dark:text-black mb-4">
                Your Progress
              </h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-black dark:text-black">Tools Used</span>
                    <span className="text-black dark:text-black font-medium">
                      {[
                        dashboardStats?.totalBoundaryAudits,
                        dashboardStats?.totalUpsetDocs,
                        dashboardStats?.totalFulfillmentDisplays,
                        dashboardStats?.totalAutobiographyEntries
                      ].filter(Boolean).length}/4
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ 
                        width: `${([
                          dashboardStats?.totalBoundaryAudits,
                          dashboardStats?.totalUpsetDocs,
                          dashboardStats?.totalFulfillmentDisplays,
                          dashboardStats?.totalAutobiographyEntries
                        ].filter(Boolean).length / 4) * 100}%` 
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-black dark:text-black">Total Entries</span>
                    <span className="text-black dark:text-black font-medium">
                      {(dashboardStats?.totalBoundaryAudits || 0) + 
                       (dashboardStats?.totalUpsetDocs || 0) + 
                       (dashboardStats?.totalFulfillmentDisplays || 0) + 
                       (dashboardStats?.totalAutobiographyEntries || 0)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-black dark:text-black">Profile Complete</span>
                    <span className="text-black dark:text-black font-medium">
                      {userProfile?.bio ? '100%' : '60%'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: userProfile?.bio ? '100%' : '60%' }} 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Insights Section */}
        <div className="mt-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg p-8 text-black">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">AI Insights Available</h2>
              <p className="text-black">
                Based on your recent activity, we have personalized insights and recommendations for your wisdom journey.
              </p>
            </div>
            <button className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors">
              View Insights
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}