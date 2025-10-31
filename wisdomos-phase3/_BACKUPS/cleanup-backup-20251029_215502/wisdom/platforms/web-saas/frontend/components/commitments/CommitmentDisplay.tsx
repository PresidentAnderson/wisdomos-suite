'use client'

import { useState, useEffect } from 'react'
import { CommitmentModal } from './CommitmentModal'
import { MonthlyAuditModal } from '../audit/MonthlyAuditModal'
import { useLifeAreas } from '@/contexts/LifeAreasContext'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { 
  Plus, 
  Target, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Pause, 
  Play,
  X,
  ChevronRight,
  TrendingUp,
  Award,
  Users,
  BarChart3,
  ClipboardCheck,
  History
} from 'lucide-react'

interface Commitment {
  id: string
  title: string
  description?: string
  lifeAreaId: string
  lifeAreaName?: string
  size: 'small' | 'medium' | 'large' | 'epic'
  status: 'active' | 'completed' | 'paused' | 'cancelled'
  progress: number
  startDate: string
  targetDate?: string
  completedDate?: string
  tags: string[]
  milestones: { title: string; isCompleted: boolean }[]
  effortHours?: number
  impactScore?: number
  priority?: number
}

interface LifeArea {
  id: string
  name: string
  phoenixName?: string
  icon?: string
  color?: string
  status?: 'BREAKDOWN' | 'ATTENTION' | 'THRIVING'
  score?: number
}

export function CommitmentDisplay() {
  const [commitments, setCommitments] = useState<Commitment[]>([])
  const { lifeAreas } = useLifeAreas() // Use context for life areas
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'paused'>('active')
  const [selectedLifeArea, setSelectedLifeArea] = useState<string>('')
  const [lastAuditDate, setLastAuditDate] = useState<string | null>(null)

  useEffect(() => {
    loadCommitments()
    loadLastAudit()
  }, [])

  const loadCommitments = () => {
    const stored = localStorage.getItem('wisdomos_commitments')
    if (stored) {
      setCommitments(JSON.parse(stored))
    }
  }

  const loadLastAudit = () => {
    const audits = localStorage.getItem('wisdomos_audits')
    if (audits) {
      const auditList = JSON.parse(audits)
      if (auditList.length > 0) {
        const lastAudit = auditList[auditList.length - 1]
        setLastAuditDate(lastAudit.completedAt)
      }
    }
  }

  const saveCommitments = (updatedCommitments: Commitment[]) => {
    setCommitments(updatedCommitments)
    localStorage.setItem('wisdomos_commitments', JSON.stringify(updatedCommitments))
  }

  const handleAddCommitment = (commitmentData: any) => {
    const lifeArea = lifeAreas.find(a => a.id === commitmentData.lifeAreaId)
    const newCommitment: Commitment = {
      id: `commitment-${Date.now()}`,
      title: commitmentData.title,
      description: commitmentData.description,
      lifeAreaId: commitmentData.lifeAreaId,
      lifeAreaName: lifeArea?.name,
      size: commitmentData.size,
      status: 'active',
      progress: 0,
      startDate: new Date().toISOString(),
      targetDate: commitmentData.targetDate,
      tags: commitmentData.tags,
      milestones: commitmentData.milestones.map((m: any) => ({ title: m.title, isCompleted: false })),
      priority: 3,
      impactScore: 5,
    }
    saveCommitments([...commitments, newCommitment])
  }

  const updateCommitmentStatus = (id: string, status: Commitment['status']) => {
    const updated = commitments.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status,
          completedDate: status === 'completed' ? new Date().toISOString() : c.completedDate,
        }
      }
      return c
    })
    saveCommitments(updated)
  }

  const updateCommitmentProgress = (id: string, progress: number) => {
    const updated = commitments.map(c => {
      if (c.id === id) {
        return {
          ...c,
          progress,
          status: progress === 100 ? 'completed' : c.status,
          completedDate: progress === 100 ? new Date().toISOString() : c.completedDate,
        }
      }
      return c
    })
    saveCommitments(updated)
  }

  const toggleMilestone = (commitmentId: string, milestoneIndex: number) => {
    const updated = commitments.map(c => {
      if (c.id === commitmentId) {
        const milestones = [...c.milestones]
        milestones[milestoneIndex].isCompleted = !milestones[milestoneIndex].isCompleted
        const completedCount = milestones.filter(m => m.isCompleted).length
        const progress = Math.round((completedCount / milestones.length) * 100)
        return {
          ...c,
          milestones,
          progress,
          status: progress === 100 ? 'completed' : c.status,
          completedDate: progress === 100 ? new Date().toISOString() : c.completedDate,
        }
      }
      return c
    })
    saveCommitments(updated)
  }

  const filteredCommitments = commitments.filter(c => {
    if (filter !== 'all' && c.status !== filter) return false
    if (selectedLifeArea && c.lifeAreaId !== selectedLifeArea) return false
    return true
  })

  const stats = {
    total: commitments.length,
    active: commitments.filter(c => c.status === 'active').length,
    completed: commitments.filter(c => c.status === 'completed').length,
    averageProgress: commitments.length > 0 
      ? Math.round(commitments.reduce((sum, c) => sum + c.progress, 0) / commitments.length)
      : 0,
  }

  const getSizeColor = (size: string) => {
    switch (size) {
      case 'small': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-blue-100 text-blue-800'
      case 'large': return 'bg-purple-100 text-purple-800'
      case 'epic': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="w-4 h-4" />
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'paused': return <Pause className="w-4 h-4" />
      case 'cancelled': return <X className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const handleAuditComplete = (audit: any) => {
    setLastAuditDate(audit.completedAt)
    loadLastAudit()
    // Optionally refresh other data or show a success message
  }

  const getDaysSinceLastAudit = () => {
    if (!lastAuditDate) return null
    const last = new Date(lastAuditDate)
    const now = new Date()
    const diff = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  const getAuditStatus = () => {
    const days = getDaysSinceLastAudit()
    if (days === null) return { status: 'never', color: 'gray', message: 'No audit completed yet' }
    if (days === 0) return { status: 'today', color: 'green', message: 'Audit completed today' }
    if (days <= 7) return { status: 'recent', color: 'green', message: `Audit completed ${days} days ago` }
    if (days <= 30) return { status: 'due', color: 'yellow', message: `Audit completed ${days} days ago` }
    return { status: 'overdue', color: 'red', message: `Audit overdue (${days} days ago)` }
  }

  const auditStatus = getAuditStatus()

  return (
    <div className="space-y-6">
      {/* Monthly Audit Section */}
      <Card className={`border-2 ${
        auditStatus.color === 'green' ? 'border-green-200 bg-green-50' :
        auditStatus.color === 'yellow' ? 'border-yellow-200 bg-yellow-50' :
        auditStatus.color === 'red' ? 'border-red-200 bg-red-50' :
        'border-gray-200 bg-gray-50'
      }`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${
                auditStatus.color === 'green' ? 'bg-green-100' :
                auditStatus.color === 'yellow' ? 'bg-yellow-100' :
                auditStatus.color === 'red' ? 'bg-red-100' :
                'bg-gray-100'
              }`}>
                <ClipboardCheck className={`w-8 h-8 ${
                  auditStatus.color === 'green' ? 'text-green-600' :
                  auditStatus.color === 'yellow' ? 'text-yellow-600' :
                  auditStatus.color === 'red' ? 'text-red-600' :
                  'text-gray-600'
                }`} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Monthly Life Audit</h3>
                <p className="text-sm text-gray-600">{auditStatus.message}</p>
                {lastAuditDate && (
                  <p className="text-xs text-gray-500 mt-1">
                    Last audit: {new Date(lastAuditDate).toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Show audit history (to be implemented)
                  alert('Audit history coming soon!')
                }}
              >
                <History className="w-4 h-4 mr-1" />
                History
              </Button>
              <Button
                onClick={() => setIsAuditModalOpen(true)}
                className={
                  auditStatus.color === 'red' 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : auditStatus.color === 'yellow'
                    ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                    : ''
                }
              >
                <ClipboardCheck className="w-4 h-4 mr-2" />
                Start New Monthly Audit
              </Button>
            </div>
          </div>
          
          {/* Quick Stats from Last Audit */}
          {lastAuditDate && (
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {commitments.filter(c => c.status === 'active' && c.progress >= 80).length || 0}
                </p>
                <p className="text-xs text-gray-500">High Progress</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {commitments.filter(c => c.status === 'active' && c.progress < 50).length || 0}
                </p>
                <p className="text-xs text-gray-500">Need Attention</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {commitments.filter(c => c.status === 'paused' || c.status === 'cancelled').length || 0}
                </p>
                <p className="text-xs text-gray-500">Paused/Cancelled</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Commitments</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Target className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
              <Play className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg Progress</p>
                <p className="text-2xl font-bold">{stats.averageProgress}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Add Button */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Your Commitments</CardTitle>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Commitment
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="flex gap-2">
              {(['all', 'active', 'completed', 'paused'] as const).map((f) => (
                <Button
                  key={f}
                  variant={filter === f ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(f)}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Button>
              ))}
            </div>
            <select
              value={selectedLifeArea}
              onChange={(e) => setSelectedLifeArea(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">All Life Areas</option>
              {lifeAreas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.icon} {area.name}
                </option>
              ))}
            </select>
          </div>

          {/* Commitments List */}
          <div className="space-y-4">
            {filteredCommitments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No commitments found</p>
                <p className="text-sm mt-1">Add your first commitment to get started</p>
              </div>
            ) : (
              filteredCommitments.map((commitment) => (
                <Card key={commitment.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{commitment.title}</h3>
                          <Badge className={getSizeColor(commitment.size)}>
                            {commitment.size}
                          </Badge>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            {getStatusIcon(commitment.status)}
                            <span>{commitment.status}</span>
                          </div>
                        </div>
                        {commitment.description && (
                          <p className="text-sm text-gray-600 mb-2">{commitment.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          {commitment.lifeAreaName && (
                            <span className="flex items-center gap-1">
                              {lifeAreas.find(a => a.id === commitment.lifeAreaId)?.icon}
                              {commitment.lifeAreaName}
                            </span>
                          )}
                          {commitment.targetDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(commitment.targetDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {commitment.status === 'active' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateCommitmentStatus(commitment.id, 'paused')}
                          >
                            <Pause className="w-4 h-4" />
                          </Button>
                        )}
                        {commitment.status === 'paused' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateCommitmentStatus(commitment.id, 'active')}
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                        )}
                        {commitment.status === 'active' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateCommitmentStatus(commitment.id, 'completed')}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-500">Progress</span>
                        <span className="text-sm font-medium">{commitment.progress}%</span>
                      </div>
                      <Progress value={commitment.progress} className="h-2" />
                    </div>

                    {/* Milestones */}
                    {commitment.milestones.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-700 mb-2">Milestones</p>
                        {commitment.milestones.map((milestone, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded"
                            onClick={() => toggleMilestone(commitment.id, index)}
                          >
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                              milestone.isCompleted 
                                ? 'bg-green-500 border-green-500' 
                                : 'border-gray-300'
                            }`}>
                              {milestone.isCompleted && (
                                <CheckCircle className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <span className={milestone.isCompleted ? 'line-through text-gray-400' : ''}>
                              {milestone.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Tags */}
                    {commitment.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {commitment.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Commitment Modal */}
      <CommitmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddCommitment}
        lifeAreas={lifeAreas}
      />

      {/* Monthly Audit Modal */}
      <MonthlyAuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        lifeAreas={lifeAreas}
        onComplete={handleAuditComplete}
      />
    </div>
  )
}