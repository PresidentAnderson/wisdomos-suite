export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      agent_logs: {
        Row: {
          agent: string
          context: Json | null
          created_at: string | null
          id: string
          level: string
          message: string
        }
        Insert: {
          agent: string
          context?: Json | null
          created_at?: string | null
          id?: string
          level: string
          message: string
        }
        Update: {
          agent?: string
          context?: Json | null
          created_at?: string | null
          id?: string
          level?: string
          message?: string
        }
        Relationships: []
      }
      autobiography_entries: {
        Row: {
          commitment: string | null
          created_at: string | null
          earliest: string | null
          id: string
          insight: string | null
          life_areas: number[] | null
          narrative: string | null
          tags: string[] | null
          title: string | null
          updated_at: string | null
          user_id: string | null
          year: number
        }
        Insert: {
          commitment?: string | null
          created_at?: string | null
          earliest?: string | null
          id?: string
          insight?: string | null
          life_areas?: number[] | null
          narrative?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
          year: number
        }
        Update: {
          commitment?: string | null
          created_at?: string | null
          earliest?: string | null
          id?: string
          insight?: string | null
          life_areas?: number[] | null
          narrative?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "autobiography_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_conversations: {
        Row: {
          created_at: string | null
          id: string
          name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      chat_participants: {
        Row: {
          conversation_id: string
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          created_at: string | null
          email: string | null
          first_name: string
          hubspot_id: string | null
          id: string
          last_name: string
          notes: string | null
          phone_e164: string | null
          salesforce_id: string | null
          tags: string[] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          first_name: string
          hubspot_id?: string | null
          id?: string
          last_name: string
          notes?: string | null
          phone_e164?: string | null
          salesforce_id?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          first_name?: string
          hubspot_id?: string | null
          id?: string
          last_name?: string
          notes?: string | null
          phone_e164?: string | null
          salesforce_id?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      contributions: {
        Row: {
          color: string | null
          content: string | null
          created_at: string | null
          id: string
          source: string | null
          tags: string[] | null
          title: string
          type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          color?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          source?: string | null
          tags?: string[] | null
          title: string
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          color?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          source?: string | null
          tags?: string[] | null
          title?: string
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contributions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      fd_actions: {
        Row: {
          area_id: string | null
          commitment_id: string | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          area_id?: string | null
          commitment_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          area_id?: string | null
          commitment_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fd_actions_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "fd_areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fd_actions_commitment_id_fkey"
            columns: ["commitment_id"]
            isOneToOne: false
            referencedRelation: "fd_commitments"
            referencedColumns: ["id"]
          },
        ]
      }
      fd_area_templates: {
        Row: {
          code: string
          created_at: string | null
          default_weight: number | null
          description_en: string | null
          description_fr: string | null
          icon: string | null
          id: string
          name_en: string
          name_fr: string | null
          sort_order: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          default_weight?: number | null
          description_en?: string | null
          description_fr?: string | null
          icon?: string | null
          id?: string
          name_en: string
          name_fr?: string | null
          sort_order?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          default_weight?: number | null
          description_en?: string | null
          description_fr?: string | null
          icon?: string | null
          id?: string
          name_en?: string
          name_fr?: string | null
          sort_order?: number | null
        }
        Relationships: []
      }
      fd_areas: {
        Row: {
          active: boolean | null
          code: string
          commitment_id: string | null
          created_at: string | null
          description: string | null
          id: string
          is_commitment_spawned: boolean | null
          name: string
          sort_order: number | null
          updated_at: string | null
          user_id: string
          weight: number | null
        }
        Insert: {
          active?: boolean | null
          code: string
          commitment_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_commitment_spawned?: boolean | null
          name: string
          sort_order?: number | null
          updated_at?: string | null
          user_id: string
          weight?: number | null
        }
        Update: {
          active?: boolean | null
          code?: string
          commitment_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_commitment_spawned?: boolean | null
          name?: string
          sort_order?: number | null
          updated_at?: string | null
          user_id?: string
          weight?: number | null
        }
        Relationships: []
      }
      fd_autobiography_chapters: {
        Row: {
          area_id: string | null
          coherence_score: number | null
          created_at: string | null
          era_id: string | null
          id: string
          summary: string | null
          theme_tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          area_id?: string | null
          coherence_score?: number | null
          created_at?: string | null
          era_id?: string | null
          id?: string
          summary?: string | null
          theme_tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          area_id?: string | null
          coherence_score?: number | null
          created_at?: string | null
          era_id?: string | null
          id?: string
          summary?: string | null
          theme_tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fd_autobiography_chapters_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "fd_areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fd_autobiography_chapters_era_id_fkey"
            columns: ["era_id"]
            isOneToOne: false
            referencedRelation: "fd_eras"
            referencedColumns: ["id"]
          },
        ]
      }
      fd_autobiography_links: {
        Row: {
          chapter_id: string
          created_at: string | null
          entry_id: string
          id: string
          relevance_score: number | null
        }
        Insert: {
          chapter_id: string
          created_at?: string | null
          entry_id: string
          id?: string
          relevance_score?: number | null
        }
        Update: {
          chapter_id?: string
          created_at?: string | null
          entry_id?: string
          id?: string
          relevance_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fd_autobiography_links_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "fd_autobiography_chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fd_autobiography_links_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "fd_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      fd_commitments: {
        Row: {
          area_id: string | null
          confidence: number
          created_at: string | null
          entry_id: string | null
          id: string
          spawned_area_id: string | null
          statement: string
          status: string | null
          target_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          area_id?: string | null
          confidence: number
          created_at?: string | null
          entry_id?: string | null
          id?: string
          spawned_area_id?: string | null
          statement: string
          status?: string | null
          target_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          area_id?: string | null
          confidence?: number
          created_at?: string | null
          entry_id?: string | null
          id?: string
          spawned_area_id?: string | null
          statement?: string
          status?: string | null
          target_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fd_commitments_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "fd_areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fd_commitments_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "fd_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fd_commitments_spawned_area_id_fkey"
            columns: ["spawned_area_id"]
            isOneToOne: false
            referencedRelation: "fd_areas"
            referencedColumns: ["id"]
          },
        ]
      }
      fd_dimension_templates: {
        Row: {
          code: string
          created_at: string | null
          default_weight: number | null
          description_en: string | null
          description_fr: string | null
          id: string
          name_en: string
          name_fr: string | null
          sort_order: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          default_weight?: number | null
          description_en?: string | null
          description_fr?: string | null
          id?: string
          name_en: string
          name_fr?: string | null
          sort_order?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          default_weight?: number | null
          description_en?: string | null
          description_fr?: string | null
          id?: string
          name_en?: string
          name_fr?: string | null
          sort_order?: number | null
        }
        Relationships: []
      }
      fd_dimensions: {
        Row: {
          active: boolean | null
          area_id: string
          code: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          sort_order: number | null
          updated_at: string | null
          weight: number | null
        }
        Insert: {
          active?: boolean | null
          area_id: string
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          sort_order?: number | null
          updated_at?: string | null
          weight?: number | null
        }
        Update: {
          active?: boolean | null
          area_id?: string
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          sort_order?: number | null
          updated_at?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fd_dimensions_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "fd_areas"
            referencedColumns: ["id"]
          },
        ]
      }
      fd_entries: {
        Row: {
          content: string
          content_encrypted: string | null
          created_at: string | null
          edit_locked_at: string | null
          edit_reason: string | null
          entry_date: string
          entry_timestamp: string
          id: string
          sentiment_score: number | null
          source: string | null
          tags: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          content_encrypted?: string | null
          created_at?: string | null
          edit_locked_at?: string | null
          edit_reason?: string | null
          entry_date: string
          entry_timestamp?: string
          id?: string
          sentiment_score?: number | null
          source?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          content_encrypted?: string | null
          created_at?: string | null
          edit_locked_at?: string | null
          edit_reason?: string | null
          entry_date?: string
          entry_timestamp?: string
          id?: string
          sentiment_score?: number | null
          source?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      fd_entry_links: {
        Row: {
          area_id: string | null
          confidence: number | null
          created_at: string | null
          dimension_id: string | null
          entry_id: string
          id: string
          signal_value: number | null
          weight: number | null
        }
        Insert: {
          area_id?: string | null
          confidence?: number | null
          created_at?: string | null
          dimension_id?: string | null
          entry_id: string
          id?: string
          signal_value?: number | null
          weight?: number | null
        }
        Update: {
          area_id?: string | null
          confidence?: number | null
          created_at?: string | null
          dimension_id?: string | null
          entry_id?: string
          id?: string
          signal_value?: number | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fd_entry_links_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "fd_areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fd_entry_links_dimension_id_fkey"
            columns: ["dimension_id"]
            isOneToOne: false
            referencedRelation: "fd_dimensions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fd_entry_links_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "fd_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      fd_eras: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          end_year: number
          id: string
          name: string
          sort_order: number | null
          start_year: number
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          end_year: number
          id?: string
          name: string
          sort_order?: number | null
          start_year: number
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          end_year?: number
          id?: string
          name?: string
          sort_order?: number | null
          start_year?: number
        }
        Relationships: []
      }
      fd_finance_transactions: {
        Row: {
          amount: number
          area_id: string | null
          category: string | null
          created_at: string | null
          currency: string | null
          description: string
          id: string
          metadata: Json | null
          source: string | null
          transaction_date: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          area_id?: string | null
          category?: string | null
          created_at?: string | null
          currency?: string | null
          description: string
          id?: string
          metadata?: Json | null
          source?: string | null
          transaction_date: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          area_id?: string | null
          category?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string
          id?: string
          metadata?: Json | null
          source?: string | null
          transaction_date?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fd_finance_transactions_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "fd_areas"
            referencedColumns: ["id"]
          },
        ]
      }
      fd_integrity_logs: {
        Row: {
          action_id: string | null
          commitment_id: string | null
          created_at: string | null
          description: string
          id: string
          issue_type: string
          resolution_note: string | null
          resolved_at: string | null
          severity: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          action_id?: string | null
          commitment_id?: string | null
          created_at?: string | null
          description: string
          id?: string
          issue_type: string
          resolution_note?: string | null
          resolved_at?: string | null
          severity?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          action_id?: string | null
          commitment_id?: string | null
          created_at?: string | null
          description?: string
          id?: string
          issue_type?: string
          resolution_note?: string | null
          resolved_at?: string | null
          severity?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fd_integrity_logs_action_id_fkey"
            columns: ["action_id"]
            isOneToOne: false
            referencedRelation: "fd_actions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fd_integrity_logs_commitment_id_fkey"
            columns: ["commitment_id"]
            isOneToOne: false
            referencedRelation: "fd_commitments"
            referencedColumns: ["id"]
          },
        ]
      }
      fd_law_cases: {
        Row: {
          case_number: string
          case_title: string
          court: string | null
          created_at: string | null
          filed_date: string | null
          id: string
          metadata: Json | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          case_number: string
          case_title: string
          court?: string | null
          created_at?: string | null
          filed_date?: string | null
          id?: string
          metadata?: Json | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          case_number?: string
          case_title?: string
          court?: string | null
          created_at?: string | null
          filed_date?: string | null
          id?: string
          metadata?: Json | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      fd_law_filings: {
        Row: {
          case_id: string
          created_at: string | null
          deadline_date: string | null
          description: string | null
          document_url: string | null
          filing_date: string
          filing_type: string
          id: string
          status: string | null
        }
        Insert: {
          case_id: string
          created_at?: string | null
          deadline_date?: string | null
          description?: string | null
          document_url?: string | null
          filing_date: string
          filing_type: string
          id?: string
          status?: string | null
        }
        Update: {
          case_id?: string
          created_at?: string | null
          deadline_date?: string | null
          description?: string | null
          document_url?: string | null
          filing_date?: string
          filing_type?: string
          id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fd_law_filings_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "fd_law_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      fd_plan_tasks: {
        Row: {
          created_at: string | null
          definition_of_done: Json
          dependencies: Json | null
          estimate_hours: number | null
          id: string
          inputs: Json | null
          outputs: Json | null
          owner: string
          plan_id: string
          status: string | null
          task_id: string
          tests: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          definition_of_done?: Json
          dependencies?: Json | null
          estimate_hours?: number | null
          id?: string
          inputs?: Json | null
          outputs?: Json | null
          owner: string
          plan_id: string
          status?: string | null
          task_id: string
          tests?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          definition_of_done?: Json
          dependencies?: Json | null
          estimate_hours?: number | null
          id?: string
          inputs?: Json | null
          outputs?: Json | null
          owner?: string
          plan_id?: string
          status?: string | null
          task_id?: string
          tests?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fd_plan_tasks_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "fd_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      fd_plans: {
        Row: {
          constraints: Json | null
          created_at: string | null
          created_by: string
          id: string
          objective: string
          plan_id: string
          state: Json | null
          updated_at: string | null
        }
        Insert: {
          constraints?: Json | null
          created_at?: string | null
          created_by: string
          id?: string
          objective: string
          plan_id: string
          state?: Json | null
          updated_at?: string | null
        }
        Update: {
          constraints?: Json | null
          created_at?: string | null
          created_by?: string
          id?: string
          objective?: string
          plan_id?: string
          state?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      fd_score_raw: {
        Row: {
          area_id: string | null
          confidence: number | null
          created_at: string | null
          dimension_id: string | null
          id: string
          metadata: Json | null
          score_date: string
          score_value: number
          source: string | null
          user_id: string
        }
        Insert: {
          area_id?: string | null
          confidence?: number | null
          created_at?: string | null
          dimension_id?: string | null
          id?: string
          metadata?: Json | null
          score_date: string
          score_value: number
          source?: string | null
          user_id: string
        }
        Update: {
          area_id?: string | null
          confidence?: number | null
          created_at?: string | null
          dimension_id?: string | null
          id?: string
          metadata?: Json | null
          score_date?: string
          score_value?: number
          source?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fd_score_raw_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "fd_areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fd_score_raw_dimension_id_fkey"
            columns: ["dimension_id"]
            isOneToOne: false
            referencedRelation: "fd_dimensions"
            referencedColumns: ["id"]
          },
        ]
      }
      fd_score_rollups: {
        Row: {
          area_id: string | null
          confidence: number | null
          created_at: string | null
          dimension_id: string | null
          id: string
          observations_count: number | null
          period_end: string
          period_start: string
          period_type: string
          score_avg: number | null
          score_trend: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          area_id?: string | null
          confidence?: number | null
          created_at?: string | null
          dimension_id?: string | null
          id?: string
          observations_count?: number | null
          period_end: string
          period_start: string
          period_type: string
          score_avg?: number | null
          score_trend?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          area_id?: string | null
          confidence?: number | null
          created_at?: string | null
          dimension_id?: string | null
          id?: string
          observations_count?: number | null
          period_end?: string
          period_start?: string
          period_type?: string
          score_avg?: number | null
          score_trend?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fd_score_rollups_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "fd_areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fd_score_rollups_dimension_id_fkey"
            columns: ["dimension_id"]
            isOneToOne: false
            referencedRelation: "fd_dimensions"
            referencedColumns: ["id"]
          },
        ]
      }
      fd_system_metadata: {
        Row: {
          description: string | null
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      fulfillment_areas: {
        Row: {
          attention: number | null
          created_at: string | null
          id: string
          life_area_id: number | null
          notes: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          attention?: number | null
          created_at?: string | null
          id?: string
          life_area_id?: number | null
          notes?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          attention?: number | null
          created_at?: string | null
          id?: string
          life_area_id?: number | null
          notes?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fulfillment_areas_life_area_id_fkey"
            columns: ["life_area_id"]
            isOneToOne: false
            referencedRelation: "life_areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fulfillment_areas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          importance: string | null
          is_completed: boolean | null
          is_sprint: boolean | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          importance?: string | null
          is_completed?: boolean | null
          is_sprint?: boolean | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          importance?: string | null
          is_completed?: boolean | null
          is_sprint?: boolean | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entries: {
        Row: {
          audio_url: string | null
          body: string
          created_at: string | null
          id: string
          mood: string | null
          tags: string[] | null
          title: string | null
          type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          audio_url?: string | null
          body: string
          created_at?: string | null
          id?: string
          mood?: string | null
          tags?: string[] | null
          title?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          audio_url?: string | null
          body?: string
          created_at?: string | null
          id?: string
          mood?: string | null
          tags?: string[] | null
          title?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      life_areas: {
        Row: {
          description: string | null
          icon: string | null
          id: number
          name: string
        }
        Insert: {
          description?: string | null
          icon?: string | null
          id: number
          name: string
        }
        Update: {
          description?: string | null
          icon?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      queue_events: {
        Row: {
          created_at: string | null
          id: string
          payload: Json
          processed_by: string[] | null
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          payload?: Json
          processed_by?: string[] | null
          type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          payload?: Json
          processed_by?: string[] | null
          type?: string
        }
        Relationships: []
      }
      queue_jobs: {
        Row: {
          agent: string
          attempts: number | null
          created_at: string | null
          dependencies: Json | null
          deps_met: boolean | null
          id: string
          intent: string
          last_error: string | null
          payload: Json
          run_at: string
          status: string
          updated_at: string | null
        }
        Insert: {
          agent: string
          attempts?: number | null
          created_at?: string | null
          dependencies?: Json | null
          deps_met?: boolean | null
          id?: string
          intent: string
          last_error?: string | null
          payload?: Json
          run_at?: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          agent?: string
          attempts?: number | null
          created_at?: string | null
          dependencies?: Json | null
          deps_met?: boolean | null
          id?: string
          intent?: string
          last_error?: string | null
          payload?: Json
          run_at?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          allow_anonymous_analytics: boolean | null
          allow_data_export: boolean | null
          assessments_enabled: boolean | null
          autobiography_enabled: boolean | null
          contributions_enabled: boolean | null
          created_at: string | null
          default_visibility: string | null
          goals_enabled: boolean | null
          id: string
          journal_enabled: boolean | null
          theme: string | null
          timezone: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          allow_anonymous_analytics?: boolean | null
          allow_data_export?: boolean | null
          assessments_enabled?: boolean | null
          autobiography_enabled?: boolean | null
          contributions_enabled?: boolean | null
          created_at?: string | null
          default_visibility?: string | null
          goals_enabled?: boolean | null
          id?: string
          journal_enabled?: boolean | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          allow_anonymous_analytics?: boolean | null
          allow_data_export?: boolean | null
          assessments_enabled?: boolean | null
          autobiography_enabled?: boolean | null
          contributions_enabled?: boolean | null
          created_at?: string | null
          default_visibility?: string | null
          goals_enabled?: boolean | null
          id?: string
          journal_enabled?: boolean | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          email_verified: string | null
          id: string
          name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          email_verified?: string | null
          id?: string
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          email_verified?: string | null
          id?: string
          name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      app_uid: { Args: never; Returns: string }
      fn_commitment_spawn: {
        Args: { p_commitment_id: string }
        Returns: string
      }
      fn_deps_met: { Args: { job_id: string }; Returns: boolean }
      fn_fd_rollup_month: {
        Args: { p_month: string; p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Relationships: []
      }
      buckets_analytics: {
        Row: {
          created_at: string
          format: string
          id: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          format?: string
          id: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          format?: string
          id?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          level: number | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          user_metadata: Json | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          level?: number | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          level?: number | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      prefixes: {
        Row: {
          bucket_id: string
          created_at: string | null
          level: number
          name: string
          updated_at: string | null
        }
        Insert: {
          bucket_id: string
          created_at?: string | null
          level?: number
          name: string
          updated_at?: string | null
        }
        Update: {
          bucket_id?: string
          created_at?: string | null
          level?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prefixes_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          owner_id: string | null
          upload_signature: string
          user_metadata: Json | null
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          owner_id?: string | null
          upload_signature: string
          user_metadata?: Json | null
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          owner_id?: string | null
          upload_signature?: string
          user_metadata?: Json | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_prefixes: {
        Args: { _bucket_id: string; _name: string }
        Returns: undefined
      }
      can_insert_object: {
        Args: { bucketid: string; metadata: Json; name: string; owner: string }
        Returns: undefined
      }
      delete_leaf_prefixes: {
        Args: { bucket_ids: string[]; names: string[] }
        Returns: undefined
      }
      delete_prefix: {
        Args: { _bucket_id: string; _name: string }
        Returns: boolean
      }
      extension: { Args: { name: string }; Returns: string }
      filename: { Args: { name: string }; Returns: string }
      foldername: { Args: { name: string }; Returns: string[] }
      get_level: { Args: { name: string }; Returns: number }
      get_prefix: { Args: { name: string }; Returns: string }
      get_prefixes: { Args: { name: string }; Returns: string[] }
      get_size_by_bucket: {
        Args: never
        Returns: {
          bucket_id: string
          size: number
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
          prefix_param: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_token?: string
          prefix_param: string
          start_after?: string
        }
        Returns: {
          id: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      lock_top_prefixes: {
        Args: { bucket_ids: string[]; names: string[] }
        Returns: undefined
      }
      operation: { Args: never; Returns: string }
      search: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_legacy_v1: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_v1_optimised: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_v2: {
        Args: {
          bucket_name: string
          levels?: number
          limits?: number
          prefix: string
          sort_column?: string
          sort_column_after?: string
          sort_order?: string
          start_after?: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
    }
    Enums: {
      buckettype: "STANDARD" | "ANALYTICS"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
  storage: {
    Enums: {
      buckettype: ["STANDARD", "ANALYTICS"],
    },
  },
} as const
A new version of Supabase CLI is available: v2.54.11 (currently installed v2.53.6)
We recommend updating regularly for new features and bug fixes: https://supabase.com/docs/guides/cli/getting-started#updating-the-supabase-cli
