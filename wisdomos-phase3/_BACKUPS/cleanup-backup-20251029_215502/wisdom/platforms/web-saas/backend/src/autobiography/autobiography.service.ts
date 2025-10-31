import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export interface AutobiographyEntry {
  id: string;
  userId: string;
  year: number;
  title: string;
  narrative: string;
  earliestSimilarOccurrence?: {
    year: number;
    description: string;
  };
  meaning: string;
  insight: string;
  commitment: string;
  lifeAreas: string[];
  tags: string[];
  emotionalCharge: number;
  category: string;
  people: any[];
  completionStatus: string;
  isReframed: boolean;
  reframedNarrative?: string;
  version: number;
  revisions: any[];
  createdAt: Date;
  updatedAt: Date;
  isDirty: boolean;
  lastAutoSave?: Date;
}

@Injectable()
export class AutobiographyService {
  private entries: Map<string, AutobiographyEntry> = new Map();
  private revisions: Map<string, any[]> = new Map();

  constructor(private database: DatabaseService) {
    // Initialize with demo data
    this.initializeDemoData();
  }

  private initializeDemoData() {
    const demoEntry: AutobiographyEntry = {
      id: 'demo-1990',
      userId: 'demo-user-id',
      year: 1990,
      title: 'The Beginning of My Journey',
      narrative: 'This was the year everything began. A new form of organized energy came into being.',
      meaning: 'Every beginning contains all future possibilities',
      insight: 'I was born complete, not lacking anything',
      commitment: 'Honor my original nature',
      lifeAreas: ['spiritual', 'identity'],
      tags: ['birth', 'beginning', 'potential'],
      emotionalCharge: 5,
      category: 'milestone',
      people: [],
      completionStatus: 'complete',
      isReframed: false,
      version: 1,
      revisions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isDirty: false
    };
    
    this.entries.set(demoEntry.id, demoEntry);
  }

  async createEntry(data: Partial<AutobiographyEntry>): Promise<AutobiographyEntry> {
    const entry: AutobiographyEntry = {
      id: `entry-${Date.now()}`,
      userId: data.userId || 'demo-user-id',
      year: data.year || new Date().getFullYear(),
      title: data.title || '',
      narrative: data.narrative || '',
      meaning: data.meaning || '',
      insight: data.insight || '',
      commitment: data.commitment || '',
      lifeAreas: data.lifeAreas || [],
      tags: data.tags || [],
      emotionalCharge: data.emotionalCharge || 0,
      category: data.category || 'milestone',
      people: data.people || [],
      completionStatus: data.completionStatus || 'draft',
      isReframed: false,
      version: 1,
      revisions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isDirty: false,
      earliestSimilarOccurrence: data.earliestSimilarOccurrence
    };

    this.entries.set(entry.id, entry);
    return entry;
  }

  async updateEntry(id: string, updates: Partial<AutobiographyEntry>, changeNote?: string): Promise<AutobiographyEntry> {
    const entry = this.entries.get(id);
    if (!entry) {
      throw new Error('Entry not found');
    }

    // Create revision before updating
    const revision = {
      id: `rev-${Date.now()}`,
      entryId: id,
      version: entry.version,
      fields: { ...entry },
      changedFields: Object.keys(updates),
      changeNote,
      editedBy: 'current-user',
      editedAt: new Date()
    };

    // Store revision
    if (!this.revisions.has(id)) {
      this.revisions.set(id, []);
    }
    this.revisions.get(id)!.push(revision);

    // Update entry
    const updatedEntry = {
      ...entry,
      ...updates,
      version: entry.version + 1,
      updatedAt: new Date(),
      revisions: this.revisions.get(id) || []
    };

    this.entries.set(id, updatedEntry);
    return updatedEntry;
  }

  async getEntry(id: string): Promise<AutobiographyEntry | null> {
    return this.entries.get(id) || null;
  }

  async getEntriesByYear(userId: string, year: number): Promise<AutobiographyEntry[]> {
    return Array.from(this.entries.values()).filter(
      e => e.userId === userId && e.year === year
    );
  }

  async getEntriesByRange(userId: string, startYear: number, endYear: number): Promise<AutobiographyEntry[]> {
    return Array.from(this.entries.values())
      .filter(e => e.userId === userId && e.year >= startYear && e.year <= endYear)
      .sort((a, b) => a.year - b.year);
  }

  async getAllEntries(userId: string): Promise<AutobiographyEntry[]> {
    return Array.from(this.entries.values())
      .filter(e => e.userId === userId)
      .sort((a, b) => a.year - b.year);
  }

  async getRevisionHistory(entryId: string): Promise<any[]> {
    return this.revisions.get(entryId) || [];
  }

  async restoreRevision(entryId: string, revisionId: string): Promise<AutobiographyEntry> {
    const revisions = this.revisions.get(entryId);
    if (!revisions) {
      throw new Error('No revisions found');
    }

    const revision = revisions.find(r => r.id === revisionId);
    if (!revision) {
      throw new Error('Revision not found');
    }

    // Restore the entry to the revision state
    const restoredEntry = {
      ...revision.fields,
      version: (this.entries.get(entryId)?.version || 0) + 1,
      updatedAt: new Date()
    };

    this.entries.set(entryId, restoredEntry);
    return restoredEntry;
  }

  async searchEntries(userId: string, query: string): Promise<AutobiographyEntry[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.entries.values()).filter(e => {
      if (e.userId !== userId) return false;
      
      return (
        e.title.toLowerCase().includes(lowerQuery) ||
        e.narrative.toLowerCase().includes(lowerQuery) ||
        e.meaning.toLowerCase().includes(lowerQuery) ||
        e.insight.toLowerCase().includes(lowerQuery) ||
        e.tags.some(t => t.toLowerCase().includes(lowerQuery))
      );
    });
  }

  async exportToMarkdown(userId: string, yearRange?: { start: number; end: number }): Promise<string> {
    let entries = Array.from(this.entries.values())
      .filter(e => e.userId === userId);
    
    if (yearRange) {
      entries = entries.filter(e => e.year >= yearRange.start && e.year <= yearRange.end);
    }
    
    entries.sort((a, b) => a.year - b.year);

    let markdown = '# My Autobiography\n\n';
    markdown += `*Generated on ${new Date().toLocaleDateString()}*\n\n`;
    markdown += '---\n\n';

    for (const entry of entries) {
      markdown += `## ${entry.year} — ${entry.title}\n\n`;
      markdown += `**Narrative:** ${entry.narrative}\n\n`;
      
      if (entry.earliestSimilarOccurrence) {
        markdown += `**Earliest Similar Occurrence:** ${entry.earliestSimilarOccurrence.year} - ${entry.earliestSimilarOccurrence.description}\n\n`;
      }
      
      markdown += `**Meaning:** ${entry.meaning}\n\n`;
      markdown += `**Insight:** ${entry.insight}\n\n`;
      markdown += `**Commitment:** ${entry.commitment}\n\n`;
      
      if (entry.lifeAreas.length > 0) {
        markdown += `**Life Areas:** ${entry.lifeAreas.join(', ')}\n\n`;
      }
      
      if (entry.tags.length > 0) {
        markdown += `**Tags:** ${entry.tags.map(t => `#${t}`).join(' ')}\n\n`;
      }
      
      if (entry.isReframed && entry.reframedNarrative) {
        markdown += `**Reframed:** ${entry.reframedNarrative}\n\n`;
      }
      
      markdown += `---\n\n`;
    }

    return markdown;
  }

  async detectPatterns(userId: string): Promise<any[]> {
    const entries = await this.getAllEntries(userId);
    const patterns: any[] = [];
    
    // Simple pattern detection - look for similar narratives
    const narrativeWords = new Map<string, number[]>();
    
    entries.forEach(entry => {
      const words = entry.narrative.toLowerCase().split(/\s+/);
      words.forEach(word => {
        if (word.length > 5) { // Only consider significant words
          if (!narrativeWords.has(word)) {
            narrativeWords.set(word, []);
          }
          narrativeWords.get(word)!.push(entry.year);
        }
      });
    });
    
    // Find words that appear in multiple years
    narrativeWords.forEach((years, word) => {
      if (years.length > 2) {
        patterns.push({
          id: `pattern-${word}`,
          name: `Recurring theme: ${word}`,
          description: `This theme appears across ${years.length} entries`,
          years: years.sort(),
          category: 'behavioral'
        });
      }
    });
    
    return patterns;
  }

  async autoSave(id: string, updates: Partial<AutobiographyEntry>): Promise<{ success: boolean }> {
    try {
      const entry = this.entries.get(id);
      if (!entry) {
        return { success: false };
      }

      // Don't create a revision for auto-save, just update the fields
      const updatedEntry = {
        ...entry,
        ...updates,
        isDirty: true,
        lastAutoSave: new Date()
      };

      this.entries.set(id, updatedEntry);
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  }
}