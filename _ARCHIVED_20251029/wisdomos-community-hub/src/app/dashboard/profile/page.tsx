'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { User, Edit, Save, Camera, MapPin, Globe, Calendar, Award, TrendingUp, Heart } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { trackEvent } from '@/lib/analytics'

interface ProfileData {
  full_name: string
  username: string
  email: string
  bio: string
  location: string
  website: string
  avatar_url: string | null
  joined_date: string
  timezone: string
  privacy_settings: {
    profile_visibility: 'public' | 'private' | 'members_only'
    show_activity: boolean
    show_achievements: boolean
    allow_messages: boolean
  }
}

interface ProfileStats {
  courses_completed: number
  achievements_earned: number
  community_contributions: number
  streak_days: number
  total_learning_hours: number
  certificates_earned: number
}

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'achievements' | 'settings'>('overview')
  
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: profile?.full_name || '',
    username: profile?.username || '',
    email: profile?.email || '',
    bio: profile?.bio || '',
    location: profile?.location || '',
    website: profile?.website || '',
    avatar_url: profile?.avatar_url || null,
    joined_date: profile?.created_at || '',
    timezone: 'America/New_York',
    privacy_settings: {
      profile_visibility: 'public',
      show_activity: true,
      show_achievements: true,
      allow_messages: true
    }
  })

  const [stats] = useState<ProfileStats>({
    courses_completed: 5,
    achievements_earned: 12,
    community_contributions: 34,
    streak_days: 28,
    total_learning_hours: 156,
    certificates_earned: 3
  })

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      trackEvent('profile_updated', { user_id: user?.id })
      
      // In a real app, this would call the API to update the profile
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      await refreshProfile()
      setIsEditing(false)
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Profile update error:', error)
      alert('Failed to update profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    // Reset form data to original values
    setProfileData({
      full_name: profile?.full_name || '',
      username: profile?.username || '',
      email: profile?.email || '',
      bio: profile?.bio || '',
      location: profile?.location || '',
      website: profile?.website || '',
      avatar_url: profile?.avatar_url || null,
      joined_date: profile?.created_at || '',
      timezone: 'America/New_York',
      privacy_settings: {
        profile_visibility: 'public',
        show_activity: true,
        show_achievements: true,
        allow_messages: true
      }
    })
    setIsEditing(false)
  }

  const handleAvatarUpload = () => {
    trackEvent('avatar_upload_clicked', { user_id: user?.id })
    alert('Avatar upload functionality would be implemented here')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <DashboardLayout 
      title="My Profile" 
      description="Manage your personal information and preferences"
    >
      <div className="space-y-6">
        {/* Profile Header */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative">
              {profileData.avatar_url ? (
                <img
                  src={profileData.avatar_url}
                  alt={profileData.full_name}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                  {getInitials(profileData.full_name || 'U')}
                </div>
              )}
              <button
                onClick={handleAvatarUpload}
                className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50"
              >
                <Camera className="h-4 w-4 text-gray-600" />
              </button>
            </div>
            
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {profileData.full_name || 'Your Name'}
                  </h2>
                  <p className="text-gray-600">@{profileData.username || 'username'}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {formatDate(profileData.joined_date)}</span>
                    </div>
                    {profileData.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{profileData.location}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={handleCancelEdit}
                        disabled={isSaving}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="flex items-center gap-2"
                      >
                        {isSaving ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>
              
              {profileData.bio && (
                <p className="text-gray-700 mt-3">{profileData.bio}</p>
              )}
              
              {profileData.website && (
                <div className="flex items-center gap-1 mt-2">
                  <Globe className="h-4 w-4 text-gray-500" />
                  <a 
                    href={profileData.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    {profileData.website}
                  </a>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.courses_completed}</div>
            <div className="text-xs text-gray-600">Courses</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.achievements_earned}</div>
            <div className="text-xs text-gray-600">Achievements</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.community_contributions}</div>
            <div className="text-xs text-gray-600">Contributions</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.streak_days}</div>
            <div className="text-xs text-gray-600">Day Streak</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-pink-600">{stats.total_learning_hours}</div>
            <div className="text-xs text-gray-600">Hours</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.certificates_earned}</div>
            <div className="text-xs text-gray-600">Certificates</div>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'activity', label: 'Activity' },
              { key: 'achievements', label: 'Achievements' },
              { key: 'settings', label: 'Settings' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.full_name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.full_name || 'Not set'}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.username}
                      onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">@{profileData.username || 'Not set'}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <p className="text-gray-900">{profileData.email}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  {isEditing ? (
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Tell us about yourself..."
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.bio || 'No bio added yet'}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.location}
                      onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="City, Country"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.location || 'Not set'}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={profileData.website}
                      onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://..."
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.website || 'Not set'}</p>
                  )}
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <span className="text-gray-700">Learning Streak</span>
                  </div>
                  <span className="font-semibold text-gray-900">{stats.streak_days} days</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-600" />
                    <span className="text-gray-700">Achievements</span>
                  </div>
                  <span className="font-semibold text-gray-900">{stats.achievements_earned}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-pink-600" />
                    <span className="text-gray-700">Community Impact</span>
                  </div>
                  <span className="font-semibold text-gray-900">{stats.community_contributions}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700">Profile Views</span>
                  </div>
                  <span className="font-semibold text-gray-900">234</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'settings' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Visibility
                </label>
                <select
                  value={profileData.privacy_settings.profile_visibility}
                  onChange={(e) => setProfileData(prev => ({
                    ...prev,
                    privacy_settings: {
                      ...prev.privacy_settings,
                      profile_visibility: e.target.value as any
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="public">Public - Anyone can see your profile</option>
                  <option value="members_only">Members Only - Only community members can see</option>
                  <option value="private">Private - Only you can see your profile</option>
                </select>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Show Activity</label>
                    <p className="text-xs text-gray-500">Display your learning activity and progress</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={profileData.privacy_settings.show_activity}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      privacy_settings: {
                        ...prev.privacy_settings,
                        show_activity: e.target.checked
                      }
                    }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Show Achievements</label>
                    <p className="text-xs text-gray-500">Display your earned badges and certificates</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={profileData.privacy_settings.show_achievements}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      privacy_settings: {
                        ...prev.privacy_settings,
                        show_achievements: e.target.checked
                      }
                    }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Allow Messages</label>
                    <p className="text-xs text-gray-500">Let other members send you direct messages</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={profileData.privacy_settings.allow_messages}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      privacy_settings: {
                        ...prev.privacy_settings,
                        allow_messages: e.target.checked
                      }
                    }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </Card>
        )}

        {(activeTab === 'activity' || activeTab === 'achievements') && (
          <Card className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              {activeTab === 'activity' ? (
                <TrendingUp className="h-12 w-12 mx-auto" />
              ) : (
                <Award className="h-12 w-12 mx-auto" />
              )}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {activeTab === 'activity' ? 'Activity History' : 'Achievements Gallery'}
            </h3>
            <p className="text-gray-600">
              {activeTab === 'activity' 
                ? 'Your learning activity and progress timeline will be displayed here.'
                : 'Your earned badges, certificates, and achievements will be showcased here.'}
            </p>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}