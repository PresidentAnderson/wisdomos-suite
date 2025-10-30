'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Heart, Trophy, Target, TrendingUp, Calendar, Users, Star, Award } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { trackEvent } from '@/lib/analytics'

interface Achievement {
  id: string
  title: string
  description: string
  category: 'personal' | 'professional' | 'community' | 'wellness'
  completed_at: string
  image_url?: string
  celebration_count: number
  impact_score: number
}

interface Goal {
  id: string
  title: string
  description: string
  category: 'personal' | 'professional' | 'community' | 'wellness'
  target_date: string
  progress: number
  status: 'active' | 'completed' | 'paused'
  milestones: Array<{
    id: string
    title: string
    completed: boolean
    completed_at?: string
  }>
}

const MOCK_ACHIEVEMENTS: Achievement[] = [
  {
    id: '1',
    title: 'First Community Contribution',
    description: 'Made your first meaningful contribution to the WisdomOS community',
    category: 'community',
    completed_at: '2025-01-20T09:30:00Z',
    celebration_count: 12,
    impact_score: 85
  },
  {
    id: '2',
    title: 'Mindfulness Milestone',
    description: 'Completed 30 days of consistent mindfulness practice',
    category: 'wellness',
    completed_at: '2025-01-18T14:15:00Z',
    celebration_count: 8,
    impact_score: 92
  },
  {
    id: '3',
    title: 'Knowledge Seeker',
    description: 'Completed 5 learning modules with excellence',
    category: 'personal',
    completed_at: '2025-01-15T11:45:00Z',
    celebration_count: 15,
    impact_score: 78
  }
]

const MOCK_GOALS: Goal[] = [
  {
    id: '1',
    title: 'Complete Leadership Development Track',
    description: 'Finish all modules in the leadership development program',
    category: 'professional',
    target_date: '2025-03-15T00:00:00Z',
    progress: 65,
    status: 'active',
    milestones: [
      { id: '1', title: 'Foundation Module', completed: true, completed_at: '2025-01-10T00:00:00Z' },
      { id: '2', title: 'Communication Skills', completed: true, completed_at: '2025-01-18T00:00:00Z' },
      { id: '3', title: 'Team Management', completed: false },
      { id: '4', title: 'Strategic Thinking', completed: false }
    ]
  },
  {
    id: '2',
    title: 'Wellness Journey',
    description: 'Maintain consistent wellness practices for 90 days',
    category: 'wellness',
    target_date: '2025-04-20T00:00:00Z',
    progress: 40,
    status: 'active',
    milestones: [
      { id: '1', title: 'Week 1-2: Foundation', completed: true, completed_at: '2025-01-05T00:00:00Z' },
      { id: '2', title: 'Week 3-4: Consistency', completed: true, completed_at: '2025-01-15T00:00:00Z' },
      { id: '3', title: 'Week 5-8: Integration', completed: false },
      { id: '4', title: 'Week 9-12: Mastery', completed: false }
    ]
  }
]

const CATEGORY_COLORS = {
  personal: 'bg-purple-100 text-purple-800',
  professional: 'bg-blue-100 text-blue-800',
  community: 'bg-green-100 text-green-800',
  wellness: 'bg-pink-100 text-pink-800'
}

const CATEGORY_ICONS = {
  personal: Star,
  professional: Trophy,
  community: Users,
  wellness: Heart
}

export default function FulfillmentDisplayPage() {
  const { user } = useAuth()
  const [achievements] = useState<Achievement[]>(MOCK_ACHIEVEMENTS)
  const [goals] = useState<Goal[]>(MOCK_GOALS)
  const [selectedTab, setSelectedTab] = useState<'achievements' | 'goals'>('achievements')

  const handleCelebrate = (achievementId: string) => {
    trackEvent('achievement_celebrated', { 
      user_id: user?.id, 
      achievement_id: achievementId 
    })
    // In a real app, this would update the celebration count
    alert('Celebration added! 🎉')
  }

  const handleShareAchievement = (achievementId: string) => {
    trackEvent('achievement_shared', { 
      user_id: user?.id, 
      achievement_id: achievementId 
    })
    // In a real app, this would open sharing options
    alert('Share functionality would be implemented here')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getDaysUntilTarget = (targetDate: string) => {
    const days = Math.ceil((new Date(targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return days
  }

  return (
    <DashboardLayout 
      title="Fulfillment Display" 
      description="Celebrate your achievements and track your personal growth journey"
    >
      <div className="space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Trophy className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Achievements</p>
                <p className="text-2xl font-bold text-gray-900">{achievements.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Goals</p>
                <p className="text-2xl font-bold text-gray-900">
                  {goals.filter(g => g.status === 'active').length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(goals.reduce((acc, goal) => acc + goal.progress, 0) / goals.length)}%
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-pink-100 rounded-lg">
                <Heart className="h-6 w-6 text-pink-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Impact</p>
                <p className="text-2xl font-bold text-gray-900">
                  {achievements.reduce((acc, achievement) => acc + achievement.impact_score, 0)}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setSelectedTab('achievements')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'achievements'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Achievements
            </button>
            <button
              onClick={() => setSelectedTab('goals')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'goals'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Goals & Progress
            </button>
          </nav>
        </div>

        {/* Achievements Tab */}
        {selectedTab === 'achievements' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Your Achievements</h3>
              <Button variant="outline" className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                View All Badges
              </Button>
            </div>

            {achievements.length === 0 ? (
              <Card className="p-8 text-center">
                <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No achievements yet</h3>
                <p className="text-gray-600 mb-4">
                  Start your journey and unlock your first achievement!
                </p>
                <Button>Explore Activities</Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {achievements.map((achievement) => {
                  const CategoryIcon = CATEGORY_ICONS[achievement.category]
                  
                  return (
                    <Card key={achievement.id} className="p-6 hover:shadow-lg transition-shadow">
                      <div className="text-center">
                        <div className="p-3 bg-yellow-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                          <CategoryIcon className="h-8 w-8 text-yellow-600" />
                        </div>
                        
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                          {achievement.title}
                        </h4>
                        
                        <p className="text-gray-600 text-sm mb-4">
                          {achievement.description}
                        </p>
                        
                        <div className="flex justify-center mb-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[achievement.category]}`}>
                            {achievement.category}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-500 mb-4">
                          Achieved on {formatDate(achievement.completed_at)}
                        </div>
                        
                        <div className="flex justify-center gap-2 mb-4">
                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-900">{achievement.celebration_count}</div>
                            <div className="text-xs text-gray-500">Celebrations</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-900">{achievement.impact_score}</div>
                            <div className="text-xs text-gray-500">Impact Score</div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleCelebrate(achievement.id)}
                          >
                            🎉 Celebrate
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleShareAchievement(achievement.id)}
                          >
                            Share
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Goals Tab */}
        {selectedTab === 'goals' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Your Goals</h3>
              <Button className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Set New Goal
              </Button>
            </div>

            {goals.length === 0 ? (
              <Card className="p-8 text-center">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No goals set</h3>
                <p className="text-gray-600 mb-4">
                  Set your first goal and start your growth journey!
                </p>
                <Button>Create First Goal</Button>
              </Card>
            ) : (
              <div className="space-y-6">
                {goals.map((goal) => {
                  const CategoryIcon = CATEGORY_ICONS[goal.category]
                  const daysLeft = getDaysUntilTarget(goal.target_date)
                  
                  return (
                    <Card key={goal.id} className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <CategoryIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900">
                                {goal.title}
                              </h4>
                              <p className="text-gray-600 text-sm">
                                {goal.description}
                              </p>
                            </div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[goal.category]}`}>
                              {goal.category}
                            </span>
                          </div>
                          
                          <div className="mb-4">
                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                              <span>Progress</span>
                              <span>{goal.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${goal.progress}%` }}
                              />
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <h5 className="text-sm font-medium text-gray-900 mb-2">Milestones</h5>
                            <div className="space-y-2">
                              {goal.milestones.map((milestone) => (
                                <div key={milestone.id} className="flex items-center gap-2">
                                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                    milestone.completed 
                                      ? 'bg-green-500 border-green-500' 
                                      : 'border-gray-300'
                                  }`}>
                                    {milestone.completed && (
                                      <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 8 8">
                                        <path d="M6.564.75l-3.59 3.612-1.538-1.55L0 4.26l2.974 2.99L8 2.193z"/>
                                      </svg>
                                    )}
                                  </div>
                                  <span className={`text-sm ${
                                    milestone.completed ? 'text-gray-900 line-through' : 'text-gray-600'
                                  }`}>
                                    {milestone.title}
                                  </span>
                                  {milestone.completed && milestone.completed_at && (
                                    <span className="text-xs text-gray-500">
                                      ({formatDate(milestone.completed_at)})
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Target: {formatDate(goal.target_date)}
                            </div>
                            <div className={`font-medium ${
                              daysLeft < 0 ? 'text-red-600' : 
                              daysLeft < 7 ? 'text-yellow-600' : 'text-gray-600'
                            }`}>
                              {daysLeft < 0 
                                ? `${Math.abs(daysLeft)} days overdue` 
                                : `${daysLeft} days left`}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}