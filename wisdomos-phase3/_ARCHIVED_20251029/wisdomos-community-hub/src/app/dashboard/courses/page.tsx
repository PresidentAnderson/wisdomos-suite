'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { BookOpen, Play, CheckCircle, Clock, Star, Users, Calendar, Award } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { trackEvent } from '@/lib/analytics'

interface Course {
  id: string
  title: string
  description: string
  instructor: string
  category: 'leadership' | 'wellness' | 'productivity' | 'communication' | 'personal_growth'
  level: 'beginner' | 'intermediate' | 'advanced'
  duration: string
  lessons: number
  enrolled: boolean
  progress: number
  rating: number
  reviews: number
  thumbnail: string
  price: number
  featured: boolean
  completion_certificate: boolean
}

interface Enrollment {
  course_id: string
  progress: number
  last_accessed: string
  completed_lessons: string[]
  certificate_earned: boolean
}

const MOCK_COURSES: Course[] = [
  {
    id: '1',
    title: 'Mindful Leadership in the Digital Age',
    description: 'Learn to lead with presence, empathy, and clarity in our fast-paced digital world. Develop emotional intelligence and mindful decision-making skills.',
    instructor: 'Dr. Sarah Chen',
    category: 'leadership',
    level: 'intermediate',
    duration: '6 weeks',
    lessons: 24,
    enrolled: true,
    progress: 65,
    rating: 4.8,
    reviews: 156,
    thumbnail: '/api/placeholder/300/200',
    price: 0,
    featured: true,
    completion_certificate: true
  },
  {
    id: '2',
    title: 'Stress Management & Resilience Building',
    description: 'Develop practical strategies to manage stress, build resilience, and maintain well-being in challenging times.',
    instructor: 'Mark Johnson',
    category: 'wellness',
    level: 'beginner',
    duration: '4 weeks',
    lessons: 16,
    enrolled: false,
    progress: 0,
    rating: 4.6,
    reviews: 203,
    thumbnail: '/api/placeholder/300/200',
    price: 49,
    featured: false,
    completion_certificate: true
  },
  {
    id: '3',
    title: 'Productivity Mastery: Time & Energy Management',
    description: 'Master your time and energy to achieve more while maintaining balance and avoiding burnout.',
    instructor: 'Lisa Rodriguez',
    category: 'productivity',
    level: 'intermediate',
    duration: '5 weeks',
    lessons: 20,
    enrolled: true,
    progress: 30,
    rating: 4.7,
    reviews: 189,
    thumbnail: '/api/placeholder/300/200',
    price: 0,
    featured: false,
    completion_certificate: true
  },
  {
    id: '4',
    title: 'Effective Communication & Active Listening',
    description: 'Enhance your communication skills through active listening, empathy, and clear expression.',
    instructor: 'David Park',
    category: 'communication',
    level: 'beginner',
    duration: '3 weeks',
    lessons: 12,
    enrolled: false,
    progress: 0,
    rating: 4.5,
    reviews: 142,
    thumbnail: '/api/placeholder/300/200',
    price: 29,
    featured: false,
    completion_certificate: false
  },
  {
    id: '5',
    title: 'Personal Growth Through Self-Reflection',
    description: 'Develop self-awareness and personal growth through structured reflection practices and mindfulness.',
    instructor: 'Emma Thompson',
    category: 'personal_growth',
    level: 'beginner',
    duration: '8 weeks',
    lessons: 32,
    enrolled: true,
    progress: 90,
    rating: 4.9,
    reviews: 267,
    thumbnail: '/api/placeholder/300/200',
    price: 0,
    featured: true,
    completion_certificate: true
  }
]

const MOCK_ENROLLMENTS: Enrollment[] = [
  {
    course_id: '1',
    progress: 65,
    last_accessed: '2025-01-20T14:30:00Z',
    completed_lessons: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'],
    certificate_earned: false
  },
  {
    course_id: '3',
    progress: 30,
    last_accessed: '2025-01-19T16:15:00Z',
    completed_lessons: ['1', '2', '3', '4', '5', '6'],
    certificate_earned: false
  },
  {
    course_id: '5',
    progress: 90,
    last_accessed: '2025-01-20T10:45:00Z',
    completed_lessons: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29'],
    certificate_earned: false
  }
]

const CATEGORY_COLORS = {
  leadership: 'bg-blue-100 text-blue-800',
  wellness: 'bg-green-100 text-green-800',
  productivity: 'bg-purple-100 text-purple-800',
  communication: 'bg-orange-100 text-orange-800',
  personal_growth: 'bg-pink-100 text-pink-800'
}

const LEVEL_COLORS = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800'
}

export default function CoursesPage() {
  const { user } = useAuth()
  const [courses] = useState<Course[]>(MOCK_COURSES)
  const [enrollments] = useState<Enrollment[]>(MOCK_ENROLLMENTS)
  const [selectedTab, setSelectedTab] = useState<'all' | 'enrolled' | 'completed'>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const handleEnroll = (courseId: string) => {
    trackEvent('course_enrollment_started', { 
      user_id: user?.id, 
      course_id: courseId 
    })
    alert('Enrollment process would be implemented here')
  }

  const handleContinue = (courseId: string) => {
    trackEvent('course_continued', { 
      user_id: user?.id, 
      course_id: courseId 
    })
    alert('Continue course functionality would be implemented here')
  }

  const handleViewCertificate = (courseId: string) => {
    trackEvent('certificate_viewed', { 
      user_id: user?.id, 
      course_id: courseId 
    })
    alert('Certificate viewing would be implemented here')
  }

  const getEnrollmentData = (courseId: string) => {
    return enrollments.find(e => e.course_id === courseId)
  }

  const filteredCourses = courses.filter(course => {
    const enrollment = getEnrollmentData(course.id)
    
    const matchesTab = selectedTab === 'all' || 
                      (selectedTab === 'enrolled' && course.enrolled) ||
                      (selectedTab === 'completed' && enrollment && enrollment.progress === 100)
    
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory
    
    return matchesTab && matchesCategory
  })

  const enrolledCount = courses.filter(c => c.enrolled).length
  const completedCount = enrollments.filter(e => e.progress === 100).length
  const avgProgress = enrollments.length > 0 
    ? Math.round(enrollments.reduce((acc, e) => acc + e.progress, 0) / enrollments.length)
    : 0

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <DashboardLayout 
      title="Courses" 
      description="Expand your knowledge and skills with our curated learning programs"
    >
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Enrolled</p>
                <p className="text-2xl font-bold text-gray-900">{enrolledCount}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Progress</p>
                <p className="text-2xl font-bold text-gray-900">{avgProgress}%</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Award className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Certificates</p>
                <p className="text-2xl font-bold text-gray-900">
                  {enrollments.filter(e => e.certificate_earned).length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-4">
            {/* Tab Navigation */}
            <div className="flex border border-gray-200 rounded-lg">
              {[
                { key: 'all', label: 'All Courses' },
                { key: 'enrolled', label: 'My Courses' },
                { key: 'completed', label: 'Completed' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedTab(tab.key as any)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg ${
                    selectedTab === tab.key
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="leadership">Leadership</option>
              <option value="wellness">Wellness</option>
              <option value="productivity">Productivity</option>
              <option value="communication">Communication</option>
              <option value="personal_growth">Personal Growth</option>
            </select>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="space-y-4">
          {filteredCourses.length === 0 ? (
            <Card className="p-8 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
              <p className="text-gray-600 mb-4">
                {selectedTab === 'enrolled' 
                  ? 'You haven\'t enrolled in any courses yet. Browse our catalog to get started!'
                  : selectedTab === 'completed'
                  ? 'You haven\'t completed any courses yet. Keep learning!'
                  : 'Try adjusting your filters to see more courses.'}
              </p>
              {selectedTab !== 'all' && (
                <Button onClick={() => setSelectedTab('all')}>Browse All Courses</Button>
              )}
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => {
                const enrollment = getEnrollmentData(course.id)
                
                return (
                  <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    {course.featured && (
                      <div className="bg-yellow-100 px-4 py-2 text-center">
                        <span className="text-yellow-800 text-sm font-medium">✨ Featured Course</span>
                      </div>
                    )}
                    
                    <div className="h-48 bg-gray-200 flex items-center justify-center">
                      <BookOpen className="h-16 w-16 text-gray-400" />
                    </div>
                    
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                          {course.title}
                        </h3>
                        {course.enrolled && (
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 ml-2" />
                        )}
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                        {course.description}
                      </p>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[course.category]}`}>
                          {course.category.replace('_', ' ')}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${LEVEL_COLORS[course.level]}`}>
                          {course.level}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{course.duration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Play className="h-4 w-4" />
                          <span>{course.lessons} lessons</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span>{course.rating} ({course.reviews})</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{course.instructor}</span>
                        </div>
                      </div>
                      
                      {enrollment && (
                        <div className="mb-4">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Progress</span>
                            <span>{enrollment.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${enrollment.progress}%` }}
                            />
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Last accessed {formatDate(enrollment.last_accessed)}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-bold text-gray-900">
                          {course.price === 0 ? 'Free' : `$${course.price}`}
                        </div>
                        
                        <div className="flex gap-2">
                          {course.enrolled ? (
                            <>
                              {enrollment && enrollment.progress === 100 ? (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleViewCertificate(course.id)}
                                  className="flex items-center gap-1"
                                >
                                  <Award className="h-3 w-3" />
                                  Certificate
                                </Button>
                              ) : (
                                <Button 
                                  size="sm"
                                  onClick={() => handleContinue(course.id)}
                                  className="flex items-center gap-1"
                                >
                                  <Play className="h-3 w-3" />
                                  Continue
                                </Button>
                              )}
                            </>
                          ) : (
                            <Button 
                              size="sm"
                              onClick={() => handleEnroll(course.id)}
                            >
                              Enroll
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {course.completion_certificate && (
                        <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                          <Award className="h-3 w-3" />
                          Certificate available upon completion
                        </div>
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}