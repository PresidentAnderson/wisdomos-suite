'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Settings, 
  BarChart3, 
  Shield,
  AlertTriangle,
  Crown,
  UserCheck,
  UserX,
  MessageSquare,
  Eye,
  Edit,
  Trash2,
  Filter,
  Download,
  Upload,
  Clock,
  Target,
  Award,
  TrendingUp,
  Activity,
  Calendar,
  Mail,
  Bell
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisWeek: number;
  totalEntries: number;
  engagementRate: number;
  averageStreak: number;
  completionRate: number;
}

interface UserOverview {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  last_seen: string;
  wisdom_level: number;
  contribution_points: number;
  streak_count: number;
  total_entries: number;
  status: 'active' | 'inactive' | 'suspended';
  role: 'student' | 'leader' | 'admin';
}

interface CourseActivity {
  id: string;
  user_name: string;
  activity_type: string;
  content: string;
  timestamp: string;
  tool_used: string;
}

export default function AdminPanel() {
  const { user, userProfile } = useAuth();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserOverview[]>([]);
  const [recentActivity, setRecentActivity] = useState<CourseActivity[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Check if user has admin privileges
  const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'leader';

  useEffect(() => {
    if (user && isAdmin) {
      loadAdminData();
    }
  }, [user, isAdmin]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadAdminStats(),
        loadUserOverview(),
        loadRecentActivity()
      ]);
    } catch (error) {
      console.error('Error loading admin data:', error);
      addNotification({
        type: 'system',
        title: 'Error Loading Admin Data',
        message: 'There was an issue loading the admin panel data.',
        icon: 'alert',
        priority: 'high'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAdminStats = async () => {
    // Mock data - in real app, this would be from database
    setAdminStats({
      totalUsers: 127,
      activeUsers: 89,
      newUsersThisWeek: 12,
      totalEntries: 2834,
      engagementRate: 73.2,
      averageStreak: 8.4,
      completionRate: 68.9
    });
  };

  const loadUserOverview = async () => {
    // Mock data - in real app, this would be from database
    setUsers([
      {
        id: '1',
        email: 'student1@example.com',
        full_name: 'Alice Johnson',
        created_at: '2024-01-15T10:00:00Z',
        last_seen: '2024-01-19T14:30:00Z',
        wisdom_level: 3,
        contribution_points: 450,
        streak_count: 7,
        total_entries: 23,
        status: 'active',
        role: 'student'
      },
      {
        id: '2',
        email: 'student2@example.com',
        full_name: 'Bob Smith',
        created_at: '2024-01-10T09:00:00Z',
        last_seen: '2024-01-18T16:45:00Z',
        wisdom_level: 2,
        contribution_points: 320,
        streak_count: 5,
        total_entries: 18,
        status: 'active',
        role: 'student'
      },
      // Add more mock users...
    ]);
  };

  const loadRecentActivity = async () => {
    setRecentActivity([
      {
        id: '1',
        user_name: 'Alice Johnson',
        activity_type: 'Boundary Audit Created',
        content: 'Created boundary audit for work-life balance',
        timestamp: '2024-01-19T14:30:00Z',
        tool_used: 'boundary_audit'
      },
      {
        id: '2',
        user_name: 'Bob Smith',
        activity_type: 'Upset Documentation',
        content: 'Documented upset about project deadline',
        timestamp: '2024-01-19T13:15:00Z',
        tool_used: 'upset_documentation'
      }
      // Add more activities...
    ]);
  };

  const handleUserAction = async (userId: string, action: 'suspend' | 'activate' | 'promote' | 'message') => {
    try {
      // Mock implementation - in real app, this would update database
      console.log(`Performing ${action} on user ${userId}`);
      
      addNotification({
        type: 'system',
        title: 'User Action Complete',
        message: `Successfully performed ${action} action`,
        icon: 'check',
        priority: 'medium'
      });

      // Reload user data
      await loadUserOverview();
    } catch (error) {
      addNotification({
        type: 'system',
        title: 'Action Failed',
        message: 'There was an error performing the user action',
        icon: 'alert',
        priority: 'high'
      });
    }
  };

  const sendBulkMessage = async (message: string) => {
    try {
      // Mock implementation
      console.log('Sending message to users:', selectedUsers, message);
      
      addNotification({
        type: 'achievement',
        title: 'Message Sent',
        message: `Message sent to ${selectedUsers.length} users`,
        icon: 'check',
        priority: 'medium'
      });

      setSelectedUsers([]);
    } catch (error) {
      addNotification({
        type: 'system',
        title: 'Message Failed',
        message: 'There was an error sending the message',
        icon: 'alert',
        priority: 'high'
      });
    }
  };

  const exportUserData = async () => {
    try {
      const csvData = users.map(user => ({
        Email: user.email,
        Name: user.full_name,
        'Joined Date': format(new Date(user.created_at), 'yyyy-MM-dd'),
        'Wisdom Level': user.wisdom_level,
        'Contribution Points': user.contribution_points,
        'Current Streak': user.streak_count,
        'Total Entries': user.total_entries,
        Status: user.status,
        Role: user.role
      }));

      const csv = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).join(','))
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `course-participants-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      addNotification({
        type: 'system',
        title: 'Export Complete',
        message: 'User data has been exported to CSV',
        icon: 'check',
        priority: 'medium'
      });
    } catch (error) {
      addNotification({
        type: 'system',
        title: 'Export Failed',
        message: 'There was an error exporting user data',
        icon: 'alert',
        priority: 'high'
      });
    }
  };

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Shield className="w-16 h-16 text-black dark:text-black mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-black dark:text-black mb-2">
            Access Restricted
          </h1>
          <p className="text-black dark:text-black">
            You don't have permission to access the admin panel.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black dark:text-black">Loading admin panel...</p>
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
          <div className="flex items-center gap-3 mb-2">
            <Crown className="w-8 h-8 text-black" />
            <h1 className="text-4xl font-bold text-black dark:text-black">
              Course Leader Panel
            </h1>
          </div>
          <p className="text-black dark:text-black">
            Manage participants, monitor progress, and guide their wisdom journey
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'users', label: 'Participants', icon: Users },
                { id: 'activity', label: 'Activity', icon: Activity },
                { id: 'analytics', label: 'Analytics', icon: TrendingUp },
                { id: 'settings', label: 'Settings', icon: Settings }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${activeTab === tab.id
                      ? 'border-purple-500 text-black dark:text-black'
                      : 'border-transparent text-black hover:text-black dark:hover:text-black'
                    }
                  `}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-black">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-black text-sm">Total Participants</p>
                    <p className="text-3xl font-bold">{adminStats?.totalUsers}</p>
                    <p className="text-black text-xs mt-1">
                      +{adminStats?.newUsersThisWeek} this week
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-black" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-black">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-black text-sm">Active Users</p>
                    <p className="text-3xl font-bold">{adminStats?.activeUsers}</p>
                    <p className="text-black text-xs mt-1">
                      {adminStats && Math.round((adminStats.activeUsers / adminStats.totalUsers) * 100)}% of total
                    </p>
                  </div>
                  <UserCheck className="w-8 h-8 text-black" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl p-6 text-black">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-black text-sm">Avg Streak</p>
                    <p className="text-3xl font-bold">{adminStats?.averageStreak}</p>
                    <p className="text-black text-xs mt-1">days in a row</p>
                  </div>
                  <Target className="w-8 h-8 text-black" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-6 text-black">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-black text-sm">Engagement Rate</p>
                    <p className="text-3xl font-bold">{adminStats?.engagementRate}%</p>
                    <p className="text-black text-xs mt-1">weekly active</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-black" />
                </div>
              </div>
            </div>

            {/* Recent Activity Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-black dark:text-black mb-4">
                  Recent Participant Activity
                </h3>
                <div className="space-y-3">
                  {recentActivity.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                        <Activity className="w-4 h-4 text-black" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-black dark:text-black">
                          {activity.user_name}
                        </p>
                        <p className="text-xs text-black dark:text-black">
                          {activity.activity_type}
                        </p>
                        <p className="text-xs text-black dark:text-black">
                          {format(new Date(activity.timestamp), 'MMM dd, HH:mm')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-black dark:text-black mb-4">
                  Course Progress Overview
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-black dark:text-black">Tool Completion Rate</span>
                      <span className="font-medium">{adminStats?.completionRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ width: `${adminStats?.completionRate}%` }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-black dark:text-black">Engagement Rate</span>
                      <span className="font-medium">{adminStats?.engagementRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${adminStats?.engagementRate}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-2 gap-4 text-center text-sm">
                      <div>
                        <div className="font-bold text-lg text-black dark:text-black">
                          {adminStats?.totalEntries}
                        </div>
                        <div className="text-black dark:text-black">Total Entries</div>
                      </div>
                      <div>
                        <div className="font-bold text-lg text-black dark:text-black">
                          {adminStats?.averageStreak}
                        </div>
                        <div className="text-black dark:text-black">Avg Streak</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* User Management Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-black dark:text-black">
                  Participant Management ({users.length} total)
                </h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={exportUserData}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-black dark:text-black hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Export CSV
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-black rounded-lg hover:bg-purple-700 transition-colors">
                    <Mail className="w-4 h-4" />
                    Message Selected ({selectedUsers.length})
                  </button>
                </div>
              </div>

              {/* Bulk Actions */}
              {selectedUsers.length > 0 && (
                <div className="flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg mb-4">
                  <span className="text-sm text-black dark:text-black">
                    {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
                  </span>
                  <button
                    onClick={() => sendBulkMessage('Reminder: Keep up your great progress!')}
                    className="text-sm text-black dark:text-black hover:underline"
                  >
                    Send Encouragement
                  </button>
                  <button
                    onClick={() => setSelectedUsers([])}
                    className="text-sm text-black dark:text-black hover:underline"
                  >
                    Clear Selection
                  </button>
                </div>
              )}
            </div>

            {/* User List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers(users.map(u => u.id));
                            } else {
                              setSelectedUsers([]);
                            }
                          }}
                          className="rounded border-gray-300 text-black focus:ring-purple-500"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-black dark:text-black uppercase tracking-wider">
                        Participant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-black dark:text-black uppercase tracking-wider">
                        Progress
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-black dark:text-black uppercase tracking-wider">
                        Activity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-black dark:text-black uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-black dark:text-black uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedUsers(prev => [...prev, user.id]);
                              } else {
                                setSelectedUsers(prev => prev.filter(id => id !== user.id));
                              }
                            }}
                            className="rounded border-gray-300 text-black focus:ring-purple-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-black text-sm font-medium">
                              {user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <div>
                              <div className="font-medium text-black dark:text-black">
                                {user.full_name}
                              </div>
                              <div className="text-sm text-black dark:text-black">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="font-medium text-black dark:text-black">
                              Level {user.wisdom_level}
                            </div>
                            <div className="text-black dark:text-black">
                              {user.contribution_points} points
                            </div>
                            <div className="text-black dark:text-black">
                              {user.streak_count} day streak
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="font-medium text-black dark:text-black">
                              {user.total_entries} entries
                            </div>
                            <div className="text-black dark:text-black">
                              Last seen {format(new Date(user.last_seen), 'MMM dd')}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`
                            inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${user.status === 'active' 
                              ? 'bg-green-100 text-black dark:bg-green-900/20 dark:text-black' 
                              : user.status === 'inactive'
                              ? 'bg-yellow-100 text-black dark:bg-yellow-900/20 dark:text-black'
                              : 'bg-red-100 text-black dark:bg-red-900/20 dark:text-black'
                            }
                          `}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleUserAction(user.id, 'message')}
                              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                              title="Send message"
                            >
                              <Mail className="w-4 h-4 text-black" />
                            </button>
                            <button
                              onClick={() => handleUserAction(user.id, 'promote')}
                              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                              title="View details"
                            >
                              <Eye className="w-4 h-4 text-black" />
                            </button>
                            <button
                              onClick={() => handleUserAction(user.id, user.status === 'active' ? 'suspend' : 'activate')}
                              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                              title={user.status === 'active' ? 'Suspend user' : 'Activate user'}
                            >
                              {user.status === 'active' ? 
                                <UserX className="w-4 h-4 text-black" /> :
                                <UserCheck className="w-4 h-4 text-black" />
                              }
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-black dark:text-black mb-4">
              Live Activity Feed
            </h3>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                    <Activity className="w-5 h-5 text-black" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-black dark:text-black">
                        {activity.user_name}
                      </h4>
                      <span className="text-sm text-black dark:text-black">
                        {format(new Date(activity.timestamp), 'MMM dd, HH:mm')}
                      </span>
                    </div>
                    <p className="text-sm text-black dark:text-black">
                      {activity.activity_type}
                    </p>
                    <p className="text-sm text-black dark:text-black mt-1">
                      {activity.content}
                    </p>
                  </div>
                  <div className="text-xs text-black bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                    {activity.tool_used}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add other tab contents (analytics, settings) as needed */}
      </motion.div>
    </div>
  );
}