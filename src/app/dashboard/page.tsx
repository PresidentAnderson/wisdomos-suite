'use client'

import { useEffect, useState } from 'react'
// Animations disabled
import { 
  FileText, 
  BarChart3, 
  Users,
  Clock,
  TrendingUp,
  Heart,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import { useAppStore } from '@/store/app'
import { localDB } from '@/lib/auth-local'
import { formatRelativeTime } from '@/lib/utils'
import { trackEvent } from '@/lib/analytics'

interface DashboardStats {
  totalDocuments: number
  totalActivities: number
  totalSessionsCompleted: number
  lastActiveDate: string
  upsetDocuments: number
  boundaryAudits: number
  fulfillmentDisplays: number
  weeklyGrowth: number
}

interface RecentActivity {
  id: string
  type: string
  title: string
  description: string
  created_at: string
}

export default function DashboardPage() {
  const { user, profile } = useAuth()
  const { activities, documents } = useAppStore()
  const [stats, setStats] = useState<DashboardStats>({
    totalDocuments: 0,
    totalActivities: 0,
    totalSessionsCompleted: 0,
    lastActiveDate: new Date().toISOString(),
    upsetDocuments: 0,
    boundaryAudits: 0,
    fulfillmentDisplays: 0,
    weeklyGrowth: 0
  })
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadDashboardData()
      trackEvent('dashboard_viewed', { user_id: user.id })
    }
  }, [user])

  const loadDashboardData = async () => {
    if (!user) return

    try {
      setIsLoading(true)

      // Load user documents (using mock data for now)
      const { data: userDocuments, error: docsError } = await localDB.documents
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (docsError) {
        console.error('Error loading documents:', docsError)
      }

      // Load user activities (using mock data for now)
      const { data: userActivities, error: activitiesError } = await localDB.activities
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (activitiesError) {
        console.error('Error loading activities:', activitiesError)
      }

      // Calculate stats
      const documents = userDocuments || []
      const activities = userActivities || []

      const upsetDocs = documents.filter(d => d.type === 'upset_documentation').length
      const boundaryAudits = documents.filter(d => d.type === 'boundary_audit').length
      const fulfillmentDisplays = documents.filter(d => d.type === 'fulfillment_display').length

      // Calculate weekly growth (mock calculation for now)
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      const recentDocs = documents.filter(d => new Date(d.created_at) > oneWeekAgo)
      const previousWeekDocs = documents.filter(d => {
        const docDate = new Date(d.created_at)
        const twoWeeksAgo = new Date()
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
        return docDate <= oneWeekAgo && docDate > twoWeeksAgo
      })
      
      const weeklyGrowth = previousWeekDocs.length > 0 
        ? ((recentDocs.length - previousWeekDocs.length) / previousWeekDocs.length) * 100
        : recentDocs.length > 0 ? 100 : 0

      setStats({
        totalDocuments: documents.length,
        totalActivities: activities.length,
        totalSessionsCompleted: profile?.stats?.sessions_completed || 0,
        lastActiveDate: profile?.stats?.last_active || new Date().toISOString(),
        upsetDocuments: upsetDocs,
        boundaryAudits: boundaryAudits,
        fulfillmentDisplays: fulfillmentDisplays,
        weeklyGrowth: Math.round(weeklyGrowth)
      })

      setRecentActivities(activities.slice(0, 5))

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Documents',
      value: stats.totalDocuments,
      description: 'Documents created',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Upset Documentation',
      value: stats.upsetDocuments,
      description: 'Emotional processes documented',
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Boundary Audits',
      value: stats.boundaryAudits,
      description: 'Boundary assessments completed',
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Fulfillment Displays',
      value: stats.fulfillmentDisplays,
      description: 'Fulfillment experiences captured',
      icon: Heart,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Sessions Completed',
      value: stats.totalSessionsCompleted,
      description: 'Learning sessions finished',
      icon: CheckCircle,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      title: 'Weekly Growth',
      value: `${stats.weeklyGrowth > 0 ? '+' : ''}${stats.weeklyGrowth}%`,
      description: 'Document creation growth',
      icon: TrendingUp,
      color: stats.weeklyGrowth >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: stats.weeklyGrowth >= 0 ? 'bg-green-50' : 'bg-red-50'
    }
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'document_created':
        return FileText
      case 'document_updated':
        return FileText
      case 'tool_used':
        return BarChart3
      case 'profile_updated':
        return Users
      default:
        return Clock
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'document_created':
        return 'text-green-600 bg-green-50'
      case 'document_updated':
        return 'text-blue-600 bg-blue-50'
      case 'tool_used':
        return 'text-purple-600 bg-purple-50'
      case 'profile_updated':
        return 'text-orange-600 bg-orange-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout title="Dashboard" description="Welcome back! Here's your progress overview.">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="h-96 bg-gray-200 rounded-lg"></div>
            <div className="h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title={`Welcome back, ${profile?.full_name?.split(' ')[0] || 'there'}!`}
      description="Here's your progress overview and recent activity."
    >
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {statCards.map((stat, index) => (
            <div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card variant="elevated" className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-md ${stat.bgColor}`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                      <p className="text-sm font-medium text-gray-500">
                        {stat.title}
                      </p>
                      <p className="text-xs text-gray-400">
                        {stat.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Recent Activity and Quick Actions */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Activity */}
          <div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-gray-500" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Your latest actions and progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentActivities.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivities.map((activity) => {
                      const Icon = getActivityIcon(activity.type)
                      const colorClass = getActivityColor(activity.type)
                      
                      return (
                        <div key={activity.id} className="flex items-start space-x-3">
                          <div className={`p-2 rounded-full ${colorClass}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {activity.title}
                            </p>
                            {activity.description && (
                              <p className="text-xs text-gray-500">
                                {activity.description}
                              </p>
                            )}
                            <p className="text-xs text-gray-400">
                              {formatRelativeTime(activity.created_at)}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Clock className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-sm text-gray-500 mb-2">No recent activity</p>
                    <p className="text-xs text-gray-400">
                      Start creating documents or using tools to see activity here
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Start your wisdom journey with these tools
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button 
                    className="w-full justify-start"
                    variant="outline"
                    leftIcon={<AlertTriangle className="h-4 w-4" />}
                    onClick={() => window.location.href = '/dashboard/upset-documentation'}
                  >
                    Document an Upset
                  </Button>
                  <Button 
                    className="w-full justify-start"
                    variant="outline"
                    leftIcon={<BarChart3 className="h-4 w-4" />}
                    onClick={() => window.location.href = '/dashboard/boundary-audit'}
                  >
                    Perform Boundary Audit
                  </Button>
                  <Button 
                    className="w-full justify-start"
                    variant="outline"
                    leftIcon={<Heart className="h-4 w-4" />}
                    onClick={() => window.location.href = '/dashboard/fulfillment-display'}
                  >
                    Create Fulfillment Display
                  </Button>
                  <Button 
                    className="w-full justify-start"
                    variant="outline"
                    leftIcon={<FileText className="h-4 w-4" />}
                    onClick={() => window.location.href = '/dashboard/documents'}
                  >
                    View All Documents
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Last Active Info */}
        <div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <p className="text-sm text-gray-500">
            Last active: {formatRelativeTime(stats.lastActiveDate)}
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}