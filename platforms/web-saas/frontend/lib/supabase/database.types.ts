export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
          metadata: Json
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          metadata?: Json
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          metadata?: Json
        }
      }
      life_areas: {
        Row: {
          id: string
          user_id: string
          name: string
          phoenix_name: string | null
          description: string | null
          color: string | null
          icon: string | null
          status: string
          score: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          phoenix_name?: string | null
          description?: string | null
          color?: string | null
          icon?: string | null
          status?: string
          score?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          phoenix_name?: string | null
          description?: string | null
          color?: string | null
          icon?: string | null
          status?: string
          score?: number
          created_at?: string
          updated_at?: string
        }
      }
      journal_entries: {
        Row: {
          id: string
          user_id: string
          title: string
          body: string | null
          mood: string | null
          type: string
          tags: string[]
          linked_life_areas: string[]
          reset_ritual_applied: boolean
          created_at: string
          updated_at: string
          metadata: Json
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          body?: string | null
          mood?: string | null
          type?: string
          tags?: string[]
          linked_life_areas?: string[]
          reset_ritual_applied?: boolean
          created_at?: string
          updated_at?: string
          metadata?: Json
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          body?: string | null
          mood?: string | null
          type?: string
          tags?: string[]
          linked_life_areas?: string[]
          reset_ritual_applied?: boolean
          created_at?: string
          updated_at?: string
          metadata?: Json
        }
      }
      contributions: {
        Row: {
          id: string
          user_id: string
          external_id: string | null
          type: 'being' | 'doing' | 'having'
          title: string
          description: string | null
          entity: string | null
          entity_id: string | null
          properties: Json
          associations: Json
          status: string
          source: string | null
          created_at: string
          updated_at: string
          synced_at: string | null
          metadata: Json
        }
        Insert: {
          id?: string
          user_id: string
          external_id?: string | null
          type: 'being' | 'doing' | 'having'
          title: string
          description?: string | null
          entity?: string | null
          entity_id?: string | null
          properties?: Json
          associations?: Json
          status?: string
          source?: string | null
          created_at?: string
          updated_at?: string
          synced_at?: string | null
          metadata?: Json
        }
        Update: {
          id?: string
          user_id?: string
          external_id?: string | null
          type?: 'being' | 'doing' | 'having'
          title?: string
          description?: string | null
          entity?: string | null
          entity_id?: string | null
          properties?: Json
          associations?: Json
          status?: string
          source?: string | null
          created_at?: string
          updated_at?: string
          synced_at?: string | null
          metadata?: Json
        }
      }
      fulfillment_scores: {
        Row: {
          id: string
          user_id: string
          life_area_id: string
          score: number
          contributions: string[]
          measured_at: string
          created_at: string
          metadata: Json
        }
        Insert: {
          id?: string
          user_id: string
          life_area_id: string
          score: number
          contributions?: string[]
          measured_at?: string
          created_at?: string
          metadata?: Json
        }
        Update: {
          id?: string
          user_id?: string
          life_area_id?: string
          score?: number
          contributions?: string[]
          measured_at?: string
          created_at?: string
          metadata?: Json
        }
      }
      hubspot_sync: {
        Row: {
          id: string
          user_id: string
          entity_type: string
          entity_id: string
          last_synced_at: string | null
          sync_status: string
          error_message: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          entity_type: string
          entity_id: string
          last_synced_at?: string | null
          sync_status?: string
          error_message?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          entity_type?: string
          entity_id?: string
          last_synced_at?: string | null
          sync_status?: string
          error_message?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      commitments: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          life_area_id: string | null
          status: string
          due_date: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
          metadata: Json
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          life_area_id?: string | null
          status?: string
          due_date?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
          metadata?: Json
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          life_area_id?: string | null
          status?: string
          due_date?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
          metadata?: Json
        }
      }
      monthly_audits: {
        Row: {
          id: string
          user_id: string
          month: number
          year: number
          life_area_scores: Json
          total_score: number | null
          insights: string | null
          boundaries_set: string[]
          celebrations: string[]
          created_at: string
          metadata: Json
        }
        Insert: {
          id?: string
          user_id: string
          month: number
          year: number
          life_area_scores?: Json
          total_score?: number | null
          insights?: string | null
          boundaries_set?: string[]
          celebrations?: string[]
          created_at?: string
          metadata?: Json
        }
        Update: {
          id?: string
          user_id?: string
          month?: number
          year?: number
          life_area_scores?: Json
          total_score?: number | null
          insights?: string | null
          boundaries_set?: string[]
          celebrations?: string[]
          created_at?: string
          metadata?: Json
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      exec_sql: {
        Args: { query: string }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}