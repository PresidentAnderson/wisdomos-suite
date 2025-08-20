'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Users, MessageCircle, Heart, Share, Calendar, Plus, Search, TrendingUp, UserPlus } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { trackEvent } from '@/lib/analytics'

interface CommunityPost {
  id: string
  author: {
    name: string
    avatar: string
    role: string
  }
  content: string
  category: 'discussion' | 'question' | 'achievement' | 'resource' | 'event'
  created_at: string
  likes: number
  comments: number
  shares: number
  liked_by_user: boolean
  tags: string[]
}

interface CommunityEvent {
  id: string
  title: string
  description: string
  date: string
  time: string
  type: 'webinar' | 'workshop' | 'discussion' | 'networking'
  attendees: number
  max_attendees: number
  host: string
  registered: boolean
}

interface CommunityMember {
  id: string
  name: string
  avatar: string
  role: string
  bio: string
  contributions: number
  joined_date: string
  online: boolean
}

const MOCK_POSTS: CommunityPost[] = [
  {
    id: '1',
    author: {
      name: 'Sarah Chen',
      avatar: '/api/placeholder/40/40',
      role: 'Mindfulness Coach'
    },
    content: 'Just completed my 100-day meditation streak! The journey has been transformative. Here are my top 3 insights: 1) Consistency matters more than duration, 2) Self-compassion is key when you miss a day, 3) The benefits compound over time. What practices have been game-changers for you?',
    category: 'achievement',
    created_at: '2025-01-20T09:30:00Z',
    likes: 24,
    comments: 8,
    shares: 3,
    liked_by_user: true,
    tags: ['meditation', 'mindfulness', 'consistency']
  },
  {
    id: '2',
    author: {
      name: 'Michael Rodriguez',
      avatar: '/api/placeholder/40/40',
      role: 'Leadership Coach'
    },
    content: 'Leading with vulnerability: A discussion on how showing our authentic selves can strengthen team bonds and improve performance. I\'d love to hear your experiences with vulnerable leadership. What challenges have you faced?',
    category: 'discussion',
    created_at: '2025-01-20T14:15:00Z',
    likes: 18,
    comments: 12,
    shares: 5,
    liked_by_user: false,
    tags: ['leadership', 'vulnerability', 'authenticity']
  },
  {
    id: '3',
    author: {
      name: 'Emma Thompson',
      avatar: '/api/placeholder/40/40',
      role: 'Wellness Enthusiast'
    },
    content: 'Question for the community: How do you maintain work-life boundaries when working from home? I\'m struggling to "switch off" at the end of the day. Any practical tips would be appreciated!',
    category: 'question',
    created_at: '2025-01-19T16:45:00Z',
    likes: 15,
    comments: 23,
    shares: 2,
    liked_by_user: false,
    tags: ['work-life-balance', 'remote-work', 'boundaries']
  }
]

const MOCK_EVENTS: CommunityEvent[] = [
  {
    id: '1',
    title: 'Mindful Leadership Workshop',
    description: 'Learn practical techniques for leading with presence and emotional intelligence',
    date: '2025-01-25',
    time: '14:00',
    type: 'workshop',
    attendees: 24,
    max_attendees: 30,
    host: 'Dr. Sarah Chen',
    registered: true
  },
  {
    id: '2',
    title: 'Community Wellness Check-in',
    description: 'Monthly gathering to share progress, challenges, and support each other',
    date: '2025-01-28',
    time: '18:30',
    type: 'discussion',
    attendees: 18,
    max_attendees: 25,
    host: 'Community Team',
    registered: false
  },
  {
    id: '3',
    title: 'Stress Management Webinar',
    description: 'Evidence-based strategies for managing stress and building resilience',
    date: '2025-02-02',
    time: '12:00',
    type: 'webinar',
    attendees: 45,
    max_attendees: 100,
    host: 'Mark Johnson',
    registered: false
  }
]

const MOCK_MEMBERS: CommunityMember[] = [
  {
    id: '1',
    name: 'Dr. Sarah Chen',
    avatar: '/api/placeholder/50/50',
    role: 'Mindfulness Coach',
    bio: 'Helping individuals and teams develop mindful leadership practices',
    contributions: 156,
    joined_date: '2024-03-15',
    online: true
  },
  {
    id: '2',
    name: 'Michael Rodriguez',
    avatar: '/api/placeholder/50/50',
    role: 'Leadership Coach',
    bio: 'Passionate about authentic leadership and team development',
    contributions: 142,
    joined_date: '2024-05-20',
    online: false
  },
  {
    id: '3',
    name: 'Emma Thompson',
    avatar: '/api/placeholder/50/50',
    role: 'Wellness Enthusiast',
    bio: 'Exploring the intersection of technology and well-being',
    contributions: 89,
    joined_date: '2024-07-10',
    online: true
  }
]

const CATEGORY_COLORS = {
  discussion: 'bg-blue-100 text-blue-800',
  question: 'bg-purple-100 text-purple-800',
  achievement: 'bg-green-100 text-green-800',
  resource: 'bg-orange-100 text-orange-800',
  event: 'bg-pink-100 text-pink-800'
}

const EVENT_TYPE_COLORS = {
  webinar: 'bg-blue-100 text-blue-800',
  workshop: 'bg-green-100 text-green-800',
  discussion: 'bg-purple-100 text-purple-800',
  networking: 'bg-orange-100 text-orange-800'
}

export default function CommunityPage() {
  const { user } = useAuth()
  const [posts] = useState<CommunityPost[]>(MOCK_POSTS)
  const [events] = useState<CommunityEvent[]>(MOCK_EVENTS)
  const [members] = useState<CommunityMember[]>(MOCK_MEMBERS)
  const [selectedTab, setSelectedTab] = useState<'feed' | 'events' | 'members'>('feed')
  const [searchQuery, setSearchQuery] = useState('')

  const handleLike = (postId: string) => {
    trackEvent('community_post_liked', { 
      user_id: user?.id, 
      post_id: postId 
    })
    // In a real app, this would update the like status
    alert('Like functionality would be implemented here')
  }

  const handleComment = (postId: string) => {
    trackEvent('community_post_commented', { 
      user_id: user?.id, 
      post_id: postId 
    })
    alert('Comment functionality would be implemented here')
  }

  const handleShare = (postId: string) => {
    trackEvent('community_post_shared', { 
      user_id: user?.id, 
      post_id: postId 
    })
    alert('Share functionality would be implemented here')
  }

  const handleEventRegister = (eventId: string) => {
    trackEvent('community_event_registered', { 
      user_id: user?.id, 
      event_id: eventId 
    })
    alert('Event registration would be implemented here')
  }

  const handleCreatePost = () => {
    trackEvent('community_post_create_started', { user_id: user?.id })
    alert('Create post functionality would be implemented here')
  }

  const handleConnectMember = (memberId: string) => {
    trackEvent('community_member_connect', { 
      user_id: user?.id, 
      member_id: memberId 
    })
    alert('Member connection would be implemented here')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatEventDate = (dateString: string, timeString: string) => {
    const date = new Date(dateString + 'T' + timeString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <DashboardLayout 
      title="Community" 
      description="Connect, share, and grow together with like-minded individuals"
    >
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Members</p>
                <p className="text-2xl font-bold text-gray-900">{members.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <MessageCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Posts</p>
                <p className="text-2xl font-bold text-gray-900">{posts.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
                <p className="text-2xl font-bold text-gray-900">{events.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Online Now</p>
                <p className="text-2xl font-bold text-gray-900">
                  {members.filter(m => m.online).length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-4">
            {/* Tab Navigation */}
            <div className="flex border border-gray-200 rounded-lg">
              {[
                { key: 'feed', label: 'Community Feed' },
                { key: 'events', label: 'Events' },
                { key: 'members', label: 'Members' }
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

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search community..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {selectedTab === 'feed' && (
            <Button onClick={handleCreatePost} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Post
            </Button>
          )}
        </div>

        {/* Community Feed Tab */}
        {selectedTab === 'feed' && (
          <div className="space-y-6">
            {posts.map((post) => (
              <Card key={post.id} className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      {post.author.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900">{post.author.name}</h4>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-500">{post.author.role}</span>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-500">{formatDate(post.created_at)}</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[post.category]}`}>
                        {post.category}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 mb-3">{post.content}</p>
                    
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-6 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-2 text-sm ${
                          post.liked_by_user ? 'text-red-600' : 'text-gray-600 hover:text-red-600'
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${post.liked_by_user ? 'fill-current' : ''}`} />
                        {post.likes} likes
                      </button>
                      
                      <button
                        onClick={() => handleComment(post.id)}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600"
                      >
                        <MessageCircle className="h-4 w-4" />
                        {post.comments} comments
                      </button>
                      
                      <button
                        onClick={() => handleShare(post.id)}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-600"
                      >
                        <Share className="h-4 w-4" />
                        {post.shares} shares
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Events Tab */}
        {selectedTab === 'events' && (
          <div className="space-y-4">
            {events.map((event) => (
              <Card key={event.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${EVENT_TYPE_COLORS[event.type]}`}>
                        {event.type}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{event.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {formatEventDate(event.date, event.time)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {event.attendees}/{event.max_attendees} attendees
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          Hosted by {event.host}
                        </span>
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(event.attendees / event.max_attendees) * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="ml-6">
                    {event.registered ? (
                      <Button variant="outline" disabled>
                        Registered ✓
                      </Button>
                    ) : (
                      <Button onClick={() => handleEventRegister(event.id)}>
                        Register
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Members Tab */}
        {selectedTab === 'members' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map((member) => (
              <Card key={member.id} className="p-6 text-center">
                <div className="relative mb-4">
                  <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto flex items-center justify-center">
                    <span className="text-lg font-medium text-gray-600">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  {member.online && (
                    <div className="absolute bottom-0 right-1/2 transform translate-x-6 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-sm text-blue-600 mb-2">{member.role}</p>
                <p className="text-gray-600 text-sm mb-4">{member.bio}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">{member.contributions}</div>
                    <div className="text-xs text-gray-500">Contributions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">
                      {new Date(member.joined_date).getFullYear()}
                    </div>
                    <div className="text-xs text-gray-500">Joined</div>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full flex items-center justify-center gap-2"
                  onClick={() => handleConnectMember(member.id)}
                >
                  <UserPlus className="h-3 w-3" />
                  Connect
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}