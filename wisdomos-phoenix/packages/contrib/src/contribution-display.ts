import { SupabaseClient } from '@supabase/supabase-js';
import { 
  ContributionDisplay, 
  ContributionDisplaySchema,
  ContributionEntry,
  CONTRIBUTION_PROMPTS 
} from './types';

export class ContributionDisplayService {
  constructor(private supabase: SupabaseClient) {}

  async createDisplay(userId: string, data: Partial<ContributionDisplay>) {
    const display: ContributionDisplay = {
      id: crypto.randomUUID(),
      userId,
      title: data.title || 'My Contribution Display',
      description: data.description,
      entries: data.entries || [],
      feedback: [],
      visibility: data.visibility || 'private',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const validated = ContributionDisplaySchema.parse(display);

    const { data: result, error } = await this.supabase
      .from('contribution_displays')
      .insert(validated)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  async updateDisplay(id: string, updates: Partial<ContributionDisplay>) {
    const { data, error } = await this.supabase
      .from('contribution_displays')
      .update({
        ...updates,
        updatedAt: new Date(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async addEntry(displayId: string, entry: ContributionEntry) {
    const { data: display, error: fetchError } = await this.supabase
      .from('contribution_displays')
      .select('entries')
      .eq('id', displayId)
      .single();

    if (fetchError) throw fetchError;

    const updatedEntries = [...(display.entries || []), entry];

    const { data, error } = await this.supabase
      .from('contribution_displays')
      .update({
        entries: updatedEntries,
        updatedAt: new Date(),
      })
      .eq('id', displayId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async removeEntry(displayId: string, entryId: string) {
    const { data: display, error: fetchError } = await this.supabase
      .from('contribution_displays')
      .select('entries')
      .eq('id', displayId)
      .single();

    if (fetchError) throw fetchError;

    const updatedEntries = display.entries.filter(
      (e: ContributionEntry) => e.id !== entryId
    );

    const { data, error } = await this.supabase
      .from('contribution_displays')
      .update({
        entries: updatedEntries,
        updatedAt: new Date(),
      })
      .eq('id', displayId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async addFeedback(
    displayId: string,
    fromUserId: string,
    comment: string,
    entryId?: string
  ) {
    const feedback = {
      id: crypto.randomUUID(),
      fromUserId,
      entryId,
      comment,
      createdAt: new Date(),
    };

    const { data: display, error: fetchError } = await this.supabase
      .from('contribution_displays')
      .select('feedback')
      .eq('id', displayId)
      .single();

    if (fetchError) throw fetchError;

    const updatedFeedback = [...(display.feedback || []), feedback];

    const { data, error } = await this.supabase
      .from('contribution_displays')
      .update({
        feedback: updatedFeedback,
        updatedAt: new Date(),
      })
      .eq('id', displayId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getDisplay(id: string) {
    const { data, error } = await this.supabase
      .from('contribution_displays')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async getUserDisplays(userId: string) {
    const { data, error } = await this.supabase
      .from('contribution_displays')
      .select('*')
      .eq('userId', userId)
      .order('updatedAt', { ascending: false });

    if (error) throw error;
    return data;
  }

  async shareWithCircle(displayId: string, circleId: string) {
    const { data, error } = await this.supabase
      .from('contribution_shares')
      .insert({
        displayId,
        circleId,
        sharedAt: new Date(),
      });

    if (error) throw error;
    return data;
  }

  getPrompts() {
    return CONTRIBUTION_PROMPTS;
  }

  async scheduleRevisitReminder(displayId: string, userId: string, days: number = 30) {
    const reminderDate = new Date();
    reminderDate.setDate(reminderDate.getDate() + days);

    const { data, error } = await this.supabase
      .from('reminders')
      .insert({
        type: 'contribution_revisit',
        userId,
        targetId: displayId,
        scheduledFor: reminderDate,
        message: 'Time to revisit and update your Contribution Display',
      });

    if (error) throw error;
    return data;
  }
}