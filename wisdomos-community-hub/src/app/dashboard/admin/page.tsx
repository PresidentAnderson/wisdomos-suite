'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
// Animations temporarily disabled
import {
  Users,
  FileText,
  BarChart3,
  AlertTriangle,
  Settings,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Search
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database.types'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import { trackEvent } from '@/lib/analytics'
// Toast temporarily disabled
const toast = { error: (msg: string) => console.error(msg), success: (msg: string) => console.log(msg) }

type Tables = Database['public']['Tables']
type Profile = Tables['profiles']['Row']
type Document = Tables['documents']['Row']
type AnalyticsEvent = Tables['analytics_events']['Row']

interface AdminStats {
  totalUsers: number
  activeUsers: number
  totalDocuments: number
  publicDocuments: number
  totalActivities: number
  systemHealth: 'healthy' | 'warning' | 'critical'
}

interface UserWithStats extends Profile {
  document_count: number
  activity_count: number
  last_login: string
}

export default function AdminPage() {
  const { user, profile } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<UserWithStats[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')

  // Redirect non-admin users
  useEffect(() => {
    if (!user) return
    
    if (profile && !profile.is_admin) {
      toast.error('Access denied. Admin privileges required.')
      router.push('/dashboard')
      return
    }

    loadAdminData()
    trackEvent('admin_panel_accessed', { user_id: user.id })
  }, [user, profile, router])

  const loadAdminData = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      // Load admin stats
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (profilesError) throw profilesError

      const { data: documents, error: docsError } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

      if (docsError) throw docsError

      const { data: activities, error: activitiesError } = await supabase
        .from('activities')
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50)

      if (activitiesError) throw activitiesError

      // Calculate stats
      const now = new Date()
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      
      const activeUsers = profiles?.filter(p => 
        p.stats?.last_active && new Date(p.stats.last_active) >= thirtyDaysAgo
      ).length || 0

      const adminStats: AdminStats = {
        totalUsers: profiles?.length || 0,
        activeUsers,
        totalDocuments: documents?.length || 0,
        publicDocuments: documents?.filter(d => d.is_public).length || 0,
        totalActivities: activities?.length || 0,
        systemHealth: activeUsers > 0 ? 'healthy' : 'warning'
      }

      // Add stats to users
      const usersWithStats: UserWithStats[] = profiles?.map(profile => {
        const userDocs = documents?.filter(d => d.user_id === profile.id).length || 0
        const userActivities = activities?.filter(a => a.user_id === profile.id).length || 0
        
        return {
          ...profile,
          document_count: userDocs,
          activity_count: userActivities,
          last_login: profile.stats?.last_active || profile.created_at
        }
      }) || []

      setStats(adminStats)
      setUsers(usersWithStats)
      setDocuments(documents || [])
      setRecentActivities(activities || [])

    } catch (error) {
      console.error('Error loading admin data:', error)
      toast.error('Failed to load admin data')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !isActive })
        .eq('id', userId)

      if (error) throw error

      setUsers(users.map(u => 
        u.id === userId ? { ...u, is_active: !isActive } : u
      ))

      toast.success(`User ${!isActive ? 'activated' : 'deactivated'} successfully`)
      trackEvent('admin_user_status_changed', { 
        target_user_id: userId, 
        new_status: !isActive,
        admin_id: user?.id 
      })
    } catch (error) {
      console.error('Error updating user status:', error)
      toast.error('Failed to update user status')
    }
  }

  const makeUserAdmin = async (userId: string, isAdmin: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: !isAdmin })
        .eq('id', userId)

      if (error) throw error

      setUsers(users.map(u => 
        u.id === userId ? { ...u, is_admin: !isAdmin } : u
      ))

      toast.success(`User ${!isAdmin ? 'promoted to' : 'removed from'} admin successfully`)
      trackEvent('admin_user_role_changed', { 
        target_user_id: userId, 
        new_role: !isAdmin ? 'admin' : 'user',
        admin_id: user?.id 
      })
    } catch (error) {
      console.error('Error updating user role:', error)
      toast.error('Failed to update user role')
    }
  }

  const toggleDocumentVisibility = async (documentId: string, isPublic: boolean) => {
    try {
      const { error } = await supabase
        .from('documents')
        .update({ is_public: !isPublic })
        .eq('id', documentId)

      if (error) throw error

      setDocuments(documents.map(d => 
        d.id === documentId ? { ...d, is_public: !isPublic } : d
      ))

      toast.success(`Document ${!isPublic ? 'published' : 'made private'} successfully`)
      trackEvent('admin_document_visibility_changed', { 
        document_id: documentId, 
        new_visibility: !isPublic ? 'public' : 'private',
        admin_id: user?.id 
      })
    } catch (error) {
      console.error('Error updating document visibility:', error)
      toast.error('Failed to update document visibility')
    }
  }

  const deleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId)

      if (error) throw error

      setDocuments(documents.filter(d => d.id !== documentId))
      toast.success('Document deleted successfully')
      trackEvent('admin_document_deleted', { 
        document_id: documentId,
        admin_id: user?.id 
      })
    } catch (error) {
      console.error('Error deleting document:', error)
      toast.error('Failed to delete document')
    }
  }

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredDocuments = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.content.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!profile?.is_admin) {
    return (
      <DashboardLayout title="Access Denied">
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access the admin panel.</p>
        </div>
      </DashboardLayout>
    )
  }

  if (isLoading) {
    return (
      <DashboardLayout title="Admin Panel" description="System administration and management">
        <div className="animate-pulse space-y-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </DashboardLayout>
    )
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Active Users',
      value: stats?.activeUsers || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Total Documents',
      value: stats?.totalDocuments || 0,
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Public Documents',
      value: stats?.publicDocuments || 0,
      icon: Eye,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ]

  return (
    <DashboardLayout
      title="Admin Panel"
      description="System administration and user management"
    >
      <div className="space-y-6">
        {/* System Health */}
        <div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">System Status</h2>
              <p className="text-blue-100">All systems operational</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              stats?.systemHealth === 'healthy' 
                ? 'bg-green-100 text-green-800'
                : stats?.systemHealth === 'warning'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {stats?.systemHealth?.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, index) => (
            <div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card variant="elevated">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-md ${stat.bgColor}`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: BarChart3 },
              { id: 'users', name: 'Users', icon: Users },
              { id: 'documents', name: 'Documents', icon: FileText },
              { id: 'settings', name: 'Settings', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {selectedTab === 'overview' && (
            <div className="space-y-6">
              {/* Recent Activities */}
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle>Recent Activities</CardTitle>
                  <CardDescription>Latest user activities across the platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities.slice(0, 10).map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          {activity.profiles?.avatar_url ? (
                            <img
                              className="h-8 w-8 rounded-full"
                              src={activity.profiles.avatar_url}
                              alt={activity.profiles.full_name || 'User'}
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-700">
                                {activity.profiles?.full_name?.[0] || 'U'}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {activity.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            {activity.profiles?.full_name || 'Unknown User'}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatRelativeTime(activity.created_at)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {selectedTab === 'users' && (
            <div className="space-y-6">
              {/* Search */}
              <div className="relative">
                <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Users Table */}
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage user accounts and permissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-900">User</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Email</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Documents</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Last Login</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((user) => (
                          <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                {user.avatar_url ? (
                                  <img
                                    className="h-8 w-8 rounded-full mr-3"
                                    src={user.avatar_url}
                                    alt={user.full_name || 'User'}
                                  />
                                ) : (
                                  <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                                    <span className="text-xs font-medium text-gray-700">
                                      {user.full_name?.[0] || 'U'}
                                    </span>
                                  </div>
                                )}
                                <div>
                                  <p className="font-medium text-gray-900">{user.full_name}</p>
                                  <p className="text-gray-500">{user.username}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-gray-900">{user.email}</td>
                            <td className="py-3 px-4 text-gray-900">{user.document_count}</td>
                            <td className="py-3 px-4 text-gray-500">
                              {formatRelativeTime(user.last_login)}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-2">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  user.is_active 
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {user.is_active ? 'Active' : 'Inactive'}
                                </span>
                                {user.is_admin && (
                                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                    Admin
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => toggleUserStatus(user.id, user.is_active)}
                                >
                                  {user.is_active ? 'Deactivate' : 'Activate'}
                                </Button>
                                {user.id !== profile?.id && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => makeUserAdmin(user.id, user.is_admin)}
                                  >
                                    {user.is_admin ? 'Remove Admin' : 'Make Admin'}
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {selectedTab === 'documents' && (
            <div className="space-y-6">
              {/* Search */}
              <div className="relative">
                <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Documents Table */}
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle>Document Management</CardTitle>
                  <CardDescription>Manage user documents and content moderation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Title</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Author</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Created</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredDocuments.slice(0, 20).map((doc) => (
                          <tr key={doc.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <p className="font-medium text-gray-900 truncate" style={{ maxWidth: '200px' }}>
                                {doc.title}
                              </p>
                            </td>
                            <td className="py-3 px-4">
                              <span className="capitalize">{doc.type.replace('_', ' ')}</span>
                            </td>
                            <td className="py-3 px-4 text-gray-500">
                              {users.find(u => u.id === doc.user_id)?.full_name || 'Unknown'}
                            </td>
                            <td className="py-3 px-4 text-gray-500">
                              {formatDate(doc.created_at)}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                doc.is_public 
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {doc.is_public ? 'Public' : 'Private'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => toggleDocumentVisibility(doc.id, doc.is_public)}
                                >
                                  {doc.is_public ? 'Make Private' : 'Make Public'}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="danger"
                                  onClick={() => deleteDocument(doc.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {selectedTab === 'settings' && (
            <div className="space-y-6">
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle>System Settings</CardTitle>
                  <CardDescription>Configure system-wide settings and preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">General Settings</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Site Maintenance Mode
                          </label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="maintenance"
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="maintenance" className="text-sm text-gray-700">
                              Enable maintenance mode
                            </label>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            User Registration
                          </label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="registration"
                              defaultChecked
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="registration" className="text-sm text-gray-700">
                              Allow new user registration
                            </label>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Document Auto-moderation
                          </label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="moderation"
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="moderation" className="text-sm text-gray-700">
                              Enable automatic content moderation
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <Button>Save Settings</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}