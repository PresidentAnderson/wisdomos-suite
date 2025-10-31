import { SupabaseClient } from '@supabase/supabase-js';
import {
  Autobiography,
  AutobiographySchema,
  AutobiographyEvent,
  REFRAME_PROMPTS
} from './types';

export class AutobiographyService {
  constructor(private supabase: SupabaseClient) {}

  async createAutobiography(userId: string) {
    const autobiography: Autobiography = {
      id: crypto.randomUUID(),
      userId,
      events: [],
      futureVisions: [],
      culturalContext: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const validated = AutobiographySchema.parse(autobiography);

    const { data, error } = await this.supabase
      .from('autobiographies')
      .insert(validated)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async addEvent(userId: string, event: Omit<AutobiographyEvent, 'id'>) {
    const { data: autobiography, error: fetchError } = await this.supabase
      .from('autobiographies')
      .select('*')
      .eq('userId', userId)
      .single();

    if (fetchError) {
      // Create autobiography if it doesn't exist
      if (fetchError.code === 'PGRST116') {
        await this.createAutobiography(userId);
        return this.addEvent(userId, event);
      }
      throw fetchError;
    }

    const newEvent: AutobiographyEvent = {
      ...event,
      id: crypto.randomUUID(),
    };

    const updatedEvents = [...autobiography.events, newEvent].sort(
      (a, b) => a.year - b.year || (a.month || 0) - (b.month || 0)
    );

    const { data, error } = await this.supabase
      .from('autobiographies')
      .update({
        events: updatedEvents,
        updatedAt: new Date(),
      })
      .eq('userId', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateEvent(userId: string, eventId: string, updates: Partial<AutobiographyEvent>) {
    const { data: autobiography, error: fetchError } = await this.supabase
      .from('autobiographies')
      .select('*')
      .eq('userId', userId)
      .single();

    if (fetchError) throw fetchError;

    const updatedEvents = autobiography.events.map((event: AutobiographyEvent) =>
      event.id === eventId ? { ...event, ...updates } : event
    );

    const { data, error } = await this.supabase
      .from('autobiographies')
      .update({
        events: updatedEvents,
        updatedAt: new Date(),
      })
      .eq('userId', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async reframeIncident(
    userId: string,
    eventId: string,
    reframe: {
      originalIncident: string;
      newNarrative: string;
      insights: string[];
    }
  ) {
    const reframeData = {
      ...reframe,
      completedAt: new Date(),
    };

    return this.updateEvent(userId, eventId, {
      isReframed: true,
      reframe: reframeData,
    });
  }

  async addFutureVision(
    userId: string,
    year: number,
    vision: string,
    goals: string[] = []
  ) {
    const { data: autobiography, error: fetchError } = await this.supabase
      .from('autobiographies')
      .select('*')
      .eq('userId', userId)
      .single();

    if (fetchError) throw fetchError;

    const existingVisionIndex = autobiography.futureVisions.findIndex(
      (v: any) => v.year === year
    );

    const newVision = {
      year,
      vision,
      goals,
      updatedAt: new Date(),
    };

    let updatedVisions;
    if (existingVisionIndex >= 0) {
      updatedVisions = [...autobiography.futureVisions];
      updatedVisions[existingVisionIndex] = newVision;
    } else {
      updatedVisions = [...autobiography.futureVisions, newVision].sort(
        (a, b) => a.year - b.year
      );
    }

    const { data, error } = await this.supabase
      .from('autobiographies')
      .update({
        futureVisions: updatedVisions,
        updatedAt: new Date(),
      })
      .eq('userId', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getAutobiography(userId: string) {
    const { data, error } = await this.supabase
      .from('autobiographies')
      .select('*')
      .eq('userId', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      // Create if doesn't exist
      return this.createAutobiography(userId);
    }

    if (error) throw error;
    return data;
  }

  async getTimelineView(userId: string, startYear?: number, endYear?: number) {
    const autobiography = await this.getAutobiography(userId);
    
    let events = autobiography.events;
    if (startYear) {
      events = events.filter((e: AutobiographyEvent) => e.year >= startYear);
    }
    if (endYear) {
      events = events.filter((e: AutobiographyEvent) => e.year <= endYear);
    }

    return {
      ...autobiography,
      events,
    };
  }

  async getDecadeView(userId: string, decade: number) {
    const startYear = decade;
    const endYear = decade + 9;
    return this.getTimelineView(userId, startYear, endYear);
  }

  getReframePrompts() {
    return REFRAME_PROMPTS;
  }

  async getReframedIncidents(userId: string) {
    const autobiography = await this.getAutobiography(userId);
    return autobiography.events.filter((e: AutobiographyEvent) => e.isReframed);
  }

  async exportToMarkdown(userId: string): Promise<string> {
    const autobiography = await this.getAutobiography(userId);
    
    let markdown = '# My Autobiography\\n\\n';
    
    // Past Events
    markdown += '## Life Events\\n\\n';
    for (const event of autobiography.events) {
      markdown += `### ${event.year}${event.month ? `-${event.month}` : ''}${event.day ? `-${event.day}` : ''}: ${event.title}\\n\\n`;
      markdown += `${event.description}\\n\\n`;
      
      if (event.isReframed && event.reframe) {
        markdown += '**Reframed Narrative:**\\n';
        markdown += `> ${event.reframe.newNarrative}\\n\\n`;
        markdown += '**Insights:**\\n';
        event.reframe.insights.forEach(insight => {
          markdown += `- ${insight}\\n`;
        });
        markdown += '\\n';
      }
      
      if (event.tags && event.tags.length > 0) {
        markdown += `**Tags:** ${event.tags.join(', ')}\\n\\n`;
      }
    }
    
    // Future Visions
    if (autobiography.futureVisions.length > 0) {
      markdown += '## Future Visions\\n\\n';
      for (const vision of autobiography.futureVisions) {
        markdown += `### ${vision.year}\\n\\n`;
        markdown += `${vision.vision}\\n\\n`;
        if (vision.goals.length > 0) {
          markdown += '**Goals:**\\n';
          vision.goals.forEach(goal => {
            markdown += `- ${goal}\\n`;
          });
          markdown += '\\n';
        }
      }
    }
    
    return markdown;
  }
}