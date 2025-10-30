export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Helper types for database operations
export type Tables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Update']

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          avatar: string | null
          organization_id: string
          role: 'owner' | 'admin' | 'member' | 'viewer'
          preferences: Json
          created_at: string
          updated_at: string
          last_login_at: string | null
        }
        Insert: {
          id?: string
          email: string
          name: string
          avatar?: string | null
          organization_id: string
          role?: 'owner' | 'admin' | 'member' | 'viewer'
          preferences?: Json
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          name?: string
          avatar?: string | null
          organization_id?: string
          role?: 'owner' | 'admin' | 'member' | 'viewer'
          preferences?: Json
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          }
        ]
      }
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          owner_id: string
          plan: 'free' | 'premium' | 'enterprise'
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          owner_id: string
          plan?: 'free' | 'premium' | 'enterprise'
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          owner_id?: string
          plan?: 'free' | 'premium' | 'enterprise'
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organizations_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      contacts: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          name: string
          email: string | null
          phone: string | null
          avatar: string | null
          categories: string[]
          role: string | null
          relationship_status: 'green' | 'yellow' | 'red'
          notes: string | null
          metadata: Json
          created_at: string
          updated_at: string
          last_contact_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          name: string
          email?: string | null
          phone?: string | null
          avatar?: string | null
          categories?: string[]
          role?: string | null
          relationship_status?: 'green' | 'yellow' | 'red'
          notes?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
          last_contact_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          name?: string
          email?: string | null
          phone?: string | null
          avatar?: string | null
          categories?: string[]
          role?: string | null
          relationship_status?: 'green' | 'yellow' | 'red'
          notes?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
          last_contact_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      life_areas: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          name: string
          phoenix_name: string
          color: string
          position: Json
          size: number
          fulfillment_score: number
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          name: string
          phoenix_name: string
          color: string
          position: Json
          size?: number
          fulfillment_score?: number
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          name?: string
          phoenix_name?: string
          color?: string
          position?: Json
          size?: number
          fulfillment_score?: number
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "life_areas_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "life_areas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      contact_life_area_links: {
        Row: {
          id: string
          contact_id: string
          life_area_id: string
          influence_score: number
          relationship_type: string | null
          frequency: number
          position: Json
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          contact_id: string
          life_area_id: string
          influence_score?: number
          relationship_type?: string | null
          frequency?: number
          position?: Json
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          contact_id?: string
          life_area_id?: string
          influence_score?: number
          relationship_type?: string | null
          frequency?: number
          position?: Json
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_life_area_links_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_life_area_links_life_area_id_fkey"
            columns: ["life_area_id"]
            isOneToOne: false
            referencedRelation: "life_areas"
            referencedColumns: ["id"]
          }
        ]
      }
      journal_entries: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          title: string
          content: string
          mood: string | null
          tags: string[]
          is_private: boolean
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          title: string
          content: string
          mood?: string | null
          tags?: string[]
          is_private?: boolean
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          title?: string
          content?: string
          mood?: string | null
          tags?: string[]
          is_private?: boolean
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      upset_inquiries: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          title: string
          upset_description: string
          trigger_event: string | null
          body_sensations: string | null
          emotions_felt: string | null
          stories_told: string | null
          actions_taken: string | null
          insights_gained: string | null
          resolution_status: 'pending' | 'in_progress' | 'resolved'
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          title: string
          upset_description: string
          trigger_event?: string | null
          body_sensations?: string | null
          emotions_felt?: string | null
          stories_told?: string | null
          actions_taken?: string | null
          insights_gained?: string | null
          resolution_status?: 'pending' | 'in_progress' | 'resolved'
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          title?: string
          upset_description?: string
          trigger_event?: string | null
          body_sensations?: string | null
          emotions_felt?: string | null
          stories_told?: string | null
          actions_taken?: string | null
          insights_gained?: string | null
          resolution_status?: 'pending' | 'in_progress' | 'resolved'
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "upset_inquiries_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "upset_inquiries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      priority_items: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          title: string
          description: string | null
          importance: number
          urgency: number
          quadrant: 1 | 2 | 3 | 4
          status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          due_date: string | null
          completed_at: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          title: string
          description?: string | null
          importance: number
          urgency: number
          quadrant: 1 | 2 | 3 | 4
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          due_date?: string | null
          completed_at?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          title?: string
          description?: string | null
          importance?: number
          urgency?: number
          quadrant?: 1 | 2 | 3 | 4
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
          due_date?: string | null
          completed_at?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "priority_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "priority_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      contributions: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          title: string
          description: string
          category: string
          impact_level: number
          beneficiaries: string[]
          status: 'planned' | 'active' | 'completed' | 'paused'
          start_date: string | null
          end_date: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          title: string
          description: string
          category: string
          impact_level?: number
          beneficiaries?: string[]
          status?: 'planned' | 'active' | 'completed' | 'paused'
          start_date?: string | null
          end_date?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          title?: string
          description?: string
          category?: string
          impact_level?: number
          beneficiaries?: string[]
          status?: 'planned' | 'active' | 'completed' | 'paused'
          start_date?: string | null
          end_date?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contributions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contributions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      autobiography_events: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          title: string
          description: string
          event_date: string
          event_type: string
          life_stage: string
          emotional_impact: number
          lessons_learned: string | null
          people_involved: string[]
          location: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          title: string
          description: string
          event_date: string
          event_type: string
          life_stage: string
          emotional_impact?: number
          lessons_learned?: string | null
          people_involved?: string[]
          location?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          title?: string
          description?: string
          event_date?: string
          event_type?: string
          life_stage?: string
          emotional_impact?: number
          lessons_learned?: string | null
          people_involved?: string[]
          location?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "autobiography_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "autobiography_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      analytics_data: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          data_type: string
          data_value: Json
          timestamp: string
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          data_type: string
          data_value: Json
          timestamp?: string
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          data_type?: string
          data_value?: Json
          timestamp?: string
          metadata?: Json
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "analytics_data_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_data_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Application-specific types derived from database
export type User = Tables<'users'>
export type Organization = Tables<'organizations'>
export type Contact = Tables<'contacts'>
export type LifeArea = Tables<'life_areas'>
export type ContactLifeAreaLink = Tables<'contact_life_area_links'>
export type JournalEntry = Tables<'journal_entries'>
export type UpsetInquiry = Tables<'upset_inquiries'>
export type PriorityItem = Tables<'priority_items'>
export type Contribution = Tables<'contributions'>
export type AutobiographyEvent = Tables<'autobiography_events'>
export type AnalyticsData = Tables<'analytics_data'>

// Helper types for inserts and updates
export type UserInsert = TablesInsert<'users'>
export type UserUpdate = TablesUpdate<'users'>
export type ContactInsert = TablesInsert<'contacts'>
export type ContactUpdate = TablesUpdate<'contacts'>
export type LifeAreaInsert = TablesInsert<'life_areas'>
export type LifeAreaUpdate = TablesUpdate<'life_areas'>

// Contact with linked life areas (for unified contact system)
export type ContactWithLifeAreas = Contact & {
  life_area_links: (ContactLifeAreaLink & {
    life_area: LifeArea
  })[]
}

// Life area with linked contacts
export type LifeAreaWithContacts = LifeArea & {
  contact_links: (ContactLifeAreaLink & {
    contact: Contact
  })[]
}