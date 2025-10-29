'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Shield, AlertTriangle, CheckCircle, Clock, TrendingUp, Users, Activity, Zap } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { trackEvent } from '@/lib/analytics'

interface BoundaryCheck {
  id: string
  category: 'personal' | 'professional' | 'digital' | 'emotional' | 'physical'
  title: string
  description: string
  status: 'healthy' | 'warning' | 'critical' | 'unknown'
  last_checked: string
  score: number
  recommendations: string[]
  trend: 'improving' | 'stable' | 'declining'
}

interface BoundaryMetric {
  id: string
  name: string
  value: number
  unit: string
  target: number
  status: 'good' | 'warning' | 'critical'
  description: string
}

const MOCK_BOUNDARY_CHECKS: BoundaryCheck[] = [
  {
    id: '1',
    category: 'digital',
    title: 'Screen Time Management',
    description: 'Monitor and manage daily screen time across devices',
    status: 'warning',
    last_checked: '2025-01-20T15:30:00Z',
    score: 65,
    recommendations: [
      'Set specific times for device usage',
      'Use blue light filters after 8 PM',
      'Take breaks every 30 minutes'
    ],
    trend: 'declining'
  },
  {
    id: '2',
    category: 'professional',
    title: 'Work-Life Balance',
    description: 'Maintain healthy boundaries between work and personal time',
    status: 'healthy',
    last_checked: '2025-01-20T14:15:00Z',
    score: 85,
    recommendations: [
      'Continue current practices',
      'Consider setting earlier end time on Fridays'
    ],
    trend: 'stable'
  },
  {
    id: '3',
    category: 'emotional',
    title: 'Stress Response Patterns',
    description: 'Monitor emotional responses to various stressors',
    status: 'warning',
    last_checked: '2025-01-20T12:00:00Z',
    score: 70,
    recommendations: [
      'Practice deep breathing exercises',
      'Implement regular meditation sessions',
      'Identify and address stress triggers'
    ],
    trend: 'improving'
  },
  {
    id: '4',
    category: 'physical',
    title: 'Energy and Rest Cycles',
    description: 'Track sleep patterns and energy levels throughout the day',
    status: 'healthy',
    last_checked: '2025-01-20T08:00:00Z',
    score: 90,
    recommendations: [
      'Maintain current sleep schedule',
      'Continue morning exercise routine'
    ],
    trend: 'stable'
  },
  {
    id: '5',
    category: 'personal',
    title: 'Personal Space and Solitude',
    description: 'Ensure adequate time for personal reflection and solitude',
    status: 'critical',
    last_checked: '2025-01-19T20:30:00Z',
    score: 45,
    recommendations: [
      'Schedule daily solitude time',
      'Create a dedicated personal space',
      'Communicate boundaries to others'
    ],
    trend: 'declining'
  }
]

const MOCK_METRICS: BoundaryMetric[] = [
  {
    id: '1',
    name: 'Daily Screen Time',
    value: 8.5,
    unit: 'hours',
    target: 6,
    status: 'warning',
    description: 'Total screen time across all devices'
  },
  {
    id: '2',
    name: 'Work Hours/Week',
    value: 42,
    unit: 'hours',
    target: 40,
    status: 'good',
    description: 'Total productive work hours per week'
  },
  {
    id: '3',
    name: 'Sleep Quality',
    value: 85,
    unit: '%',
    target: 80,
    status: 'good',
    description: 'Sleep quality based on duration and patterns'
  },
  {
    id: '4',
    name: 'Social Interactions',
    value: 12,
    unit: 'per week',
    target: 15,
    status: 'warning',
    description: 'Meaningful social interactions per week'
  }
]

const CATEGORY_COLORS = {
  personal: 'bg-purple-100 text-purple-800',
  professional: 'bg-blue-100 text-blue-800',
  digital: 'bg-indigo-100 text-indigo-800',
  emotional: 'bg-pink-100 text-pink-800',
  physical: 'bg-green-100 text-green-800'
}

const STATUS_COLORS = {
  healthy: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  critical: 'bg-red-100 text-red-800',
  unknown: 'bg-gray-100 text-gray-800'
}

const STATUS_ICONS = {
  healthy: CheckCircle,
  warning: AlertTriangle,
  critical: AlertTriangle,
  unknown: Clock
}

export default function BoundaryAuditPage() {
  const { user } = useAuth()
  const [boundaryChecks] = useState<BoundaryCheck[]>(MOCK_BOUNDARY_CHECKS)
  const [metrics] = useState<BoundaryMetric[]>(MOCK_METRICS)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const handleRunAudit = () => {
    trackEvent('boundary_audit_started', { user_id: user?.id })
    // In a real app, this would trigger a comprehensive boundary audit
    alert('Comprehensive boundary audit started. This may take a few minutes...')
  }

  const handleViewRecommendations = (checkId: string) => {
    trackEvent('boundary_recommendations_viewed', { 
      user_id: user?.id, 
      check_id: checkId 
    })
  }

  const filteredChecks = selectedCategory === 'all' 
    ? boundaryChecks 
    : boundaryChecks.filter(check => check.category === selectedCategory)

  const overallScore = Math.round(
    boundaryChecks.reduce((acc, check) => acc + check.score, 0) / boundaryChecks.length
  )

  const criticalIssues = boundaryChecks.filter(check => check.status === 'critical').length
  const warnings = boundaryChecks.filter(check => check.status === 'warning').length

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <DashboardLayout 
      title="Boundary Audit" 
      description="Monitor and maintain healthy boundaries across all areas of your life"
    >
      <div className="space-y-6">
        {/* Overview Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overall Score</p>
                <p className="text-2xl font-bold text-gray-900">{overallScore}/100</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Critical Issues</p>
                <p className="text-2xl font-bold text-gray-900">{criticalIssues}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Warnings</p>
                <p className="text-2xl font-bold text-gray-900">{warnings}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Improving</p>
                <p className="text-2xl font-bold text-gray-900">
                  {boundaryChecks.filter(check => check.trend === 'improving').length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Boundary Health Status</h3>
              <p className="text-gray-600">
                {criticalIssues > 0 
                  ? `You have ${criticalIssues} critical boundary issue${criticalIssues > 1 ? 's' : ''} that need immediate attention.`
                  : warnings > 0 
                  ? `You have ${warnings} boundary area${warnings > 1 ? 's' : ''} that could use improvement.`
                  : 'Your boundaries are in great shape! Keep up the good work.'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleRunAudit} className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Run Full Audit
              </Button>
            </div>
          </div>
        </Card>

        {/* Key Metrics */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric) => (
              <Card key={metric.id} className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900">{metric.name}</h4>
                  <div className={`w-3 h-3 rounded-full ${
                    metric.status === 'good' ? 'bg-green-500' :
                    metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {metric.value} <span className="text-sm font-normal text-gray-500">{metric.unit}</span>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  Target: {metric.target} {metric.unit}
                </div>
                <p className="text-xs text-gray-500">{metric.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {['all', 'personal', 'professional', 'digital', 'emotional', 'physical'].map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                  selectedCategory === category
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {category === 'all' ? 'All Categories' : category}
              </button>
            ))}
          </nav>
        </div>

        {/* Boundary Checks */}
        <div className="space-y-4">
          {filteredChecks.map((check) => {
            const StatusIcon = STATUS_ICONS[check.status]
            
            return (
              <Card key={check.id} className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${
                    check.status === 'healthy' ? 'bg-green-100' :
                    check.status === 'warning' ? 'bg-yellow-100' :
                    check.status === 'critical' ? 'bg-red-100' : 'bg-gray-100'
                  }`}>
                    <StatusIcon className={`h-6 w-6 ${
                      check.status === 'healthy' ? 'text-green-600' :
                      check.status === 'warning' ? 'text-yellow-600' :
                      check.status === 'critical' ? 'text-red-600' : 'text-gray-600'
                    }`} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-1">
                          {check.title}
                        </h4>
                        <p className="text-gray-600 text-sm">
                          {check.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[check.category]}`}>
                          {check.category}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[check.status]}`}>
                          {check.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Score</div>
                        <div className="flex items-center gap-2">
                          <div className="text-lg font-bold text-gray-900">{check.score}/100</div>
                          <div className={`text-sm ${
                            check.trend === 'improving' ? 'text-green-600' :
                            check.trend === 'declining' ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {check.trend === 'improving' ? '↗️' : 
                             check.trend === 'declining' ? '↘️' : '→'}
                            {check.trend}
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Last Checked</div>
                        <div className="text-sm text-gray-900">{formatDate(check.last_checked)}</div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Trend</div>
                        <div className={`text-sm font-medium ${
                          check.trend === 'improving' ? 'text-green-600' :
                          check.trend === 'declining' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {check.trend === 'improving' ? 'Improving' :
                           check.trend === 'declining' ? 'Declining' : 'Stable'}
                        </div>
                      </div>
                    </div>
                    
                    {check.recommendations.length > 0 && (
                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-gray-900 mb-2">Recommendations</h5>
                        <ul className="space-y-1">
                          {check.recommendations.map((recommendation, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                              <span className="text-blue-500 mt-1">•</span>
                              {recommendation}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewRecommendations(check.id)}
                      >
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        Update Check
                      </Button>
                      {check.status !== 'healthy' && (
                        <Button size="sm" className="flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          Take Action
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {filteredChecks.length === 0 && (
          <Card className="p-8 text-center">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No boundary checks found</h3>
            <p className="text-gray-600 mb-4">
              {selectedCategory === 'all' 
                ? 'Start monitoring your boundaries by running your first audit.'
                : `No ${selectedCategory} boundary checks available. Try a different category.`}
            </p>
            {selectedCategory === 'all' && (
              <Button onClick={handleRunAudit}>Run Your First Audit</Button>
            )}
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}