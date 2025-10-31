export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          username: string | null
          bio: string | null
          website: string | null
          location: string | null
          created_at: string
          updated_at: string
          is_admin: boolean
          is_active: boolean
          stats: {
            tools_used: number
            documents_created: number
            sessions_completed: number
            last_active: string
          }
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          username?: string | null
          bio?: string | null
          website?: string | null
          location?: string | null
          created_at?: string
          updated_at?: string
          is_admin?: boolean
          is_active?: boolean
          stats?: {
            tools_used: number
            documents_created: number
            sessions_completed: number
            last_active: string
          }
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          username?: string | null
          bio?: string | null
          website?: string | null
          location?: string | null
          created_at?: string
          updated_at?: string
          is_admin?: boolean
          is_active?: boolean
          stats?: {
            tools_used: number
            documents_created: number
            sessions_completed: number
            last_active: string
          }
        }
      }
      documents: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          type: 'upset_documentation' | 'boundary_audit' | 'fulfillment_display' | 'general'
          category: string | null
          tags: string[]
          is_public: boolean
          metadata: Record<string, unknown>
          created_at: string
          updated_at: string
          version: number
          parent_id: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          type: 'upset_documentation' | 'boundary_audit' | 'fulfillment_display' | 'general'
          category?: string | null
          tags?: string[]
          is_public?: boolean
          metadata?: Record<string, unknown>
          created_at?: string
          updated_at?: string
          version?: number
          parent_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          type?: 'upset_documentation' | 'boundary_audit' | 'fulfillment_display' | 'general'
          category?: string | null
          tags?: string[]
          is_public?: boolean
          metadata?: Record<string, unknown>
          created_at?: string
          updated_at?: string
          version?: number
          parent_id?: string | null
        }
      }
      activities: {
        Row: {
          id: string
          user_id: string
          type: 'document_created' | 'document_updated' | 'tool_used' | 'login' | 'logout' | 'profile_updated'
          title: string
          description: string | null
          metadata: Record<string, unknown>
          created_at: string
          is_public: boolean
        }
        Insert: {
          id?: string
          user_id: string
          type: 'document_created' | 'document_updated' | 'tool_used' | 'login' | 'logout' | 'profile_updated'
          title: string
          description?: string | null
          metadata?: Record<string, unknown>
          created_at?: string
          is_public?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'document_created' | 'document_updated' | 'tool_used' | 'login' | 'logout' | 'profile_updated'
          title?: string
          description?: string | null
          metadata?: Record<string, unknown>
          created_at?: string
          is_public?: boolean
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: 'info' | 'success' | 'warning' | 'error'
          is_read: boolean
          action_url: string | null
          metadata: Record<string, unknown>
          created_at: string
          expires_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type?: 'info' | 'success' | 'warning' | 'error'
          is_read?: boolean
          action_url?: string | null
          metadata?: Record<string, unknown>
          created_at?: string
          expires_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: 'info' | 'success' | 'warning' | 'error'
          is_read?: boolean
          action_url?: string | null
          metadata?: Record<string, unknown>
          created_at?: string
          expires_at?: string | null
        }
      }
      analytics_events: {
        Row: {
          id: string
          user_id: string | null
          event_name: string
          event_data: Record<string, unknown>
          page_url: string
          user_agent: string | null
          ip_address: string | null
          session_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          event_name: string
          event_data?: Record<string, unknown>
          page_url: string
          user_agent?: string | null
          ip_address?: string | null
          session_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          event_name?: string
          event_data?: Record<string, unknown>
          page_url?: string
          user_agent?: string | null
          ip_address?: string | null
          session_id?: string
          created_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          title: string
          description: string
          content: string
          author_id: string
          category: string
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          duration_minutes: number
          is_published: boolean
          tags: string[]
          metadata: Record<string, unknown>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          content: string
          author_id: string
          category: string
          difficulty?: 'beginner' | 'intermediate' | 'advanced'
          duration_minutes: number
          is_published?: boolean
          tags?: string[]
          metadata?: Record<string, unknown>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          content?: string
          author_id?: string
          category?: string
          difficulty?: 'beginner' | 'intermediate' | 'advanced'
          duration_minutes?: number
          is_published?: boolean
          tags?: string[]
          metadata?: Record<string, unknown>
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}