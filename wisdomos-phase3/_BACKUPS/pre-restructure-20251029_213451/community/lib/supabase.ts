import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('Missing Supabase environment variables - using placeholder values for build')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for database schema
export interface User {
  id: string
  email: string
  username: string
  full_name: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  user_id: string
  bio?: string
  location?: string
  website?: string
  wisdom_level: number
  contribution_points: number
  streak_count: number
  badges: string[]
  role?: 'user' | 'leader' | 'admin'
  created_at: string
  updated_at: string
}

export interface WisdomCircle {
  id: string
  name: string
  description: string
  creator_id: string
  privacy_level: 'public' | 'private' | 'invite-only'
  member_count: number
  tags: string[]
  created_at: string
  updated_at: string
}

export interface CircleMembership {
  id: string
  circle_id: string
  user_id: string
  role: 'member' | 'moderator' | 'admin'
  joined_at: string
}

export interface Contribution {
  id: string
  user_id: string
  circle_id?: string
  title: string
  content: string
  media_urls: string[]
  tags: string[]
  feedback_count: number
  like_count: number
  visibility: 'public' | 'circle' | 'private'
  created_at: string
  updated_at: string
}

export interface BoundaryAudit {
  id: string
  user_id: string
  title: string
  category: 'personal' | 'professional' | 'family' | 'social'
  current_boundary: string
  desired_boundary: string
  action_steps: string[]
  priority: 'low' | 'medium' | 'high'
  status: 'draft' | 'active' | 'completed'
  created_at: string
  updated_at: string
}

export interface UpsetDocumentation {
  id: string
  user_id: string
  title: string
  trigger_event: string
  emotional_response: string
  underlying_values: string[]
  reframe_perspective: string
  action_items: string[]
  learned_wisdom: string
  status: 'processing' | 'resolved' | 'archived'
  created_at: string
  updated_at: string
}

export interface FulfillmentDisplay {
  id: string
  user_id: string
  title: string
  description: string
  fulfillment_areas: {
    category: string
    rating: number
    notes: string
  }[]
  goals: string[]
  achievements: string[]
  reflection: string
  created_at: string
  updated_at: string
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_type: string
  achievement_name: string
  description: string
  icon: string
  earned_at: string
}

export interface AutobiographyEntry {
  id: string
  user_id: string
  title: string
  date_occurred: string
  description: string
  emotional_impact: number
  life_area: string
  lessons_learned: string[]
  reframe_notes?: string
  media_urls: string[]
  is_milestone: boolean
  created_at: string
  updated_at: string
}