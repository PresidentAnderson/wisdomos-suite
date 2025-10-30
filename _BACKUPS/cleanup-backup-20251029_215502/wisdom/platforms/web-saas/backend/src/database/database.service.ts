import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface Journal {
  id: string;
  userId: string;
  lifeAreaId?: string;
  content: string;
  tags: string[];
  upsetDetected: boolean;
  aiReframe?: string;
  createdAt: Date;
  updatedAt: Date;
  lifeArea?: LifeArea;
}

export interface LifeArea {
  id: string;
  userId: string;
  name: string;
  phoenixName?: string;
  status: 'GREEN' | 'YELLOW' | 'RED';
  score: number;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class DatabaseService {
  private supabase: SupabaseClient;
  private journals: Map<string, Journal> = new Map();
  private lifeAreas: Map<string, LifeArea> = new Map();

  constructor() {
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey);
      console.log('Supabase client initialized successfully');
    } else {
      console.warn('Supabase credentials not found, falling back to in-memory storage');
    }

    // Initialize with demo life areas for fallback
    this.initializeDemoData();
  }

  private initializeDemoData() {
    const demoUserId = 'demo-user-id';
    const defaultLifeAreas = [
      'Sacred Relationship',
      'Physical Temple',
      'Soul Purpose Work',
      'Creative Expression',
      'Mind & Learning',
      'Family Constellation',
      'Tribe & Community',
      'Financial Flow',
      'Home Sanctuary',
      'Life Adventure',
      'Spiritual Path',
      'Service & Contribution',
      'Joy & Celebration',
    ];

    defaultLifeAreas.forEach((name, index) => {
      const lifeArea: LifeArea = {
        id: `life-area-${index + 1}`,
        userId: demoUserId,
        name,
        phoenixName: `Your ${name} Fire`,
        status: 'GREEN',
        score: Math.floor(Math.random() * 100),
        sortOrder: index,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.lifeAreas.set(lifeArea.id, lifeArea);
    });
  }

  // Journal methods
  async createJournal(data: Partial<Journal>): Promise<Journal> {
    if (this.supabase) {
      try {
        const { data: result, error } = await this.supabase
          .from('journals')
          .insert({
            user_id: data.userId || 'demo-user-id',
            life_area_id: data.lifeAreaId,
            content: data.content || '',
            tags: data.tags || [],
            upset_detected: data.upsetDetected || false,
            ai_reframe: data.aiReframe,
          })
          .select()
          .single();

        if (error) throw error;
        
        return this.mapJournalFromSupabase(result);
      } catch (error) {
        console.error('Error creating journal in Supabase:', error);
        // Fall through to in-memory fallback
      }
    }

    // Fallback to in-memory storage
    const journal: Journal = {
      id: Date.now().toString(),
      userId: data.userId || 'demo-user-id',
      lifeAreaId: data.lifeAreaId,
      content: data.content || '',
      tags: data.tags || [],
      upsetDetected: data.upsetDetected || false,
      aiReframe: data.aiReframe,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (journal.lifeAreaId) {
      journal.lifeArea = this.lifeAreas.get(journal.lifeAreaId);
    }

    this.journals.set(journal.id, journal);
    return journal;
  }

  async findJournals(filter?: { userId?: string; lifeAreaId?: string }): Promise<Journal[]> {
    if (this.supabase) {
      try {
        let query = this.supabase.from('journals').select('*');
        
        if (filter?.userId) {
          query = query.eq('user_id', filter.userId);
        }
        if (filter?.lifeAreaId) {
          query = query.eq('life_area_id', filter.lifeAreaId);
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (error) throw error;
        
        return data.map(this.mapJournalFromSupabase);
      } catch (error) {
        console.error('Error fetching journals from Supabase:', error);
        // Fall through to in-memory fallback
      }
    }

    // Fallback to in-memory storage
    const journals = Array.from(this.journals.values());
    return journals
      .filter(j => {
        if (filter?.userId && j.userId !== filter.userId) return false;
        if (filter?.lifeAreaId && j.lifeAreaId !== filter.lifeAreaId) return false;
        return true;
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findJournalById(id: string): Promise<Journal | null> {
    return this.journals.get(id) || null;
  }

  async updateJournal(id: string, data: Partial<Journal>): Promise<Journal | null> {
    const journal = this.journals.get(id);
    if (!journal) return null;

    const updated = {
      ...journal,
      ...data,
      updatedAt: new Date(),
    };

    if (updated.lifeAreaId) {
      updated.lifeArea = this.lifeAreas.get(updated.lifeAreaId);
    }

    this.journals.set(id, updated);
    return updated;
  }

  async deleteJournal(id: string): Promise<boolean> {
    return this.journals.delete(id);
  }

  // Life Area methods
  async findLifeAreas(userId: string): Promise<LifeArea[]> {
    return Array.from(this.lifeAreas.values())
      .filter(la => la.userId === userId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async findLifeAreaById(id: string): Promise<LifeArea | null> {
    return this.lifeAreas.get(id) || null;
  }

  async updateLifeArea(id: string, data: Partial<LifeArea>): Promise<LifeArea | null> {
    const lifeArea = this.lifeAreas.get(id);
    if (!lifeArea) return null;

    const updated = {
      ...lifeArea,
      ...data,
      updatedAt: new Date(),
    };

    this.lifeAreas.set(id, updated);
    return updated;
  }

  async countRecentUpsets(lifeAreaId: string, days: number = 7): Promise<number> {
    if (this.supabase) {
      try {
        const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const { count, error } = await this.supabase
          .from('journals')
          .select('*', { count: 'exact', head: true })
          .eq('life_area_id', lifeAreaId)
          .eq('upset_detected', true)
          .gte('created_at', cutoff.toISOString());
        
        if (error) throw error;
        
        return count || 0;
      } catch (error) {
        console.error('Error counting upsets from Supabase:', error);
        // Fall through to in-memory fallback
      }
    }

    // Fallback to in-memory storage
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const journals = Array.from(this.journals.values());
    
    return journals.filter(j => 
      j.lifeAreaId === lifeAreaId &&
      j.upsetDetected &&
      j.createdAt >= cutoff
    ).length;
  }

  // Helper method to map Supabase data to Journal interface
  private mapJournalFromSupabase(data: any): Journal {
    return {
      id: data.id,
      userId: data.user_id,
      lifeAreaId: data.life_area_id,
      content: data.content,
      tags: data.tags || [],
      upsetDetected: data.upset_detected || false,
      aiReframe: data.ai_reframe,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      lifeArea: data.life_area_id ? this.lifeAreas.get(data.life_area_id) : undefined,
    };
  }
}