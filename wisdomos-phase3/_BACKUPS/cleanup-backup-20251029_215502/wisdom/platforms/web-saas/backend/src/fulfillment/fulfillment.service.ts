import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

export interface LifeArea {
  id: string;
  name: string;
  description: string;
  commitmentLevel: 1 | 2 | 3 | 4 | 5;
  currentFulfillment: number;
  monthlyHours: number;
  relationships: string[];
  lastReview: Date;
}

export interface Relationship {
  id: string;
  name: string;
  type: 'family' | 'friend' | 'professional' | 'romantic' | 'mentor';
  lifeAreas: string[];
  commitmentLevel: 1 | 2 | 3 | 4 | 5;
  healthScore: number;
  lastInteraction: Date;
  notes: string;
}

export interface MonthlyAudit {
  id: string;
  month: string;
  year: number;
  totalCommitments: number;
  fulfillmentScore: number;
  areasReviewed: string[];
  adjustmentsMade: string[];
  date: Date;
}

export interface Fulfillment {
  userId: string;
  overallStatus: 'overwhelmed' | 'stretched' | 'balanced' | 'underutilized';
  lifeAreas: LifeArea[];
  relationships: Relationship[];
  monthlyAudits: MonthlyAudit[];
  lastUpdated: Date;
}

// Prisma-compatible fulfillment entry interface
export interface PrismaFulfillmentEntry {
  id: string;
  userId: string;
  lifeAreaId: string;
  sourceType: string;
  sourceId?: string;
  title: string;
  description?: string;
  meta: any;
  status: string;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
  lifeArea?: {
    id: string;
    slug: string;
    name: string;
    description?: string;
    icon?: string;
    color?: string;
  };
}

@Injectable()
export class FulfillmentService {
  private fulfillments: Map<string, Fulfillment> = new Map();
  private fulfillmentEntries: Map<string, PrismaFulfillmentEntry[]> = new Map();

  constructor(private readonly prisma: PrismaService) {
    // Initialize with demo data
    this.fulfillments.set('demo-user-id', {
      userId: 'demo-user-id',
      overallStatus: 'balanced',
      lifeAreas: [
        {
          id: '1',
          name: 'Career',
          description: 'Professional development and work',
          commitmentLevel: 4,
          currentFulfillment: 85,
          monthlyHours: 160,
          relationships: ['manager', 'team'],
          lastReview: new Date(),
        },
        {
          id: '2',
          name: 'Family',
          description: 'Time with immediate family',
          commitmentLevel: 5,
          currentFulfillment: 90,
          monthlyHours: 80,
          relationships: ['spouse', 'children'],
          lastReview: new Date(),
        },
      ],
      relationships: [
        {
          id: '1',
          name: 'John (Manager)',
          type: 'professional',
          lifeAreas: ['Career'],
          commitmentLevel: 3,
          healthScore: 80,
          lastInteraction: new Date(),
          notes: 'Weekly 1-on-1 meetings',
        },
      ],
      monthlyAudits: [],
      lastUpdated: new Date(),
    });
  }

  async getFulfillment(userId: string): Promise<Fulfillment | null> {
    return this.fulfillments.get(userId) || null;
  }

  async createOrUpdateFulfillment(userId: string, data: Partial<Fulfillment>): Promise<Fulfillment> {
    const existing = this.fulfillments.get(userId);
    const fulfillment = {
      ...existing,
      ...data,
      userId,
      lastUpdated: new Date(),
    } as Fulfillment;
    
    this.fulfillments.set(userId, fulfillment);
    return fulfillment;
  }

  async addLifeArea(userId: string, area: Omit<LifeArea, 'id'>): Promise<Fulfillment> {
    const fulfillment = this.fulfillments.get(userId) || this.createDefault(userId);
    
    fulfillment.lifeAreas.push({
      id: Date.now().toString(),
      ...area,
    } as LifeArea);
    
    fulfillment.lastUpdated = new Date();
    this.updateOverallStatus(fulfillment);
    this.fulfillments.set(userId, fulfillment);
    return fulfillment;
  }

  async updateLifeArea(userId: string, areaId: string, updates: Partial<LifeArea>): Promise<Fulfillment> {
    const fulfillment = this.fulfillments.get(userId);
    if (!fulfillment) throw new Error('Fulfillment not found');
    
    const areaIndex = fulfillment.lifeAreas.findIndex(a => a.id === areaId);
    if (areaIndex === -1) throw new Error('Life area not found');
    
    fulfillment.lifeAreas[areaIndex] = {
      ...fulfillment.lifeAreas[areaIndex],
      ...updates,
    };
    
    fulfillment.lastUpdated = new Date();
    this.updateOverallStatus(fulfillment);
    this.fulfillments.set(userId, fulfillment);
    return fulfillment;
  }

  async removeLifeArea(userId: string, areaId: string): Promise<Fulfillment> {
    const fulfillment = this.fulfillments.get(userId);
    if (!fulfillment) throw new Error('Fulfillment not found');
    
    fulfillment.lifeAreas = fulfillment.lifeAreas.filter(a => a.id !== areaId);
    fulfillment.lastUpdated = new Date();
    this.updateOverallStatus(fulfillment);
    this.fulfillments.set(userId, fulfillment);
    return fulfillment;
  }

  async addRelationship(userId: string, relationship: Omit<Relationship, 'id'>): Promise<Fulfillment> {
    const fulfillment = this.fulfillments.get(userId) || this.createDefault(userId);
    
    fulfillment.relationships.push({
      id: Date.now().toString(),
      ...relationship,
    } as Relationship);
    
    fulfillment.lastUpdated = new Date();
    this.fulfillments.set(userId, fulfillment);
    return fulfillment;
  }

  async updateRelationship(userId: string, relationshipId: string, updates: Partial<Relationship>): Promise<Fulfillment> {
    const fulfillment = this.fulfillments.get(userId);
    if (!fulfillment) throw new Error('Fulfillment not found');
    
    const relIndex = fulfillment.relationships.findIndex(r => r.id === relationshipId);
    if (relIndex === -1) throw new Error('Relationship not found');
    
    fulfillment.relationships[relIndex] = {
      ...fulfillment.relationships[relIndex],
      ...updates,
    };
    
    fulfillment.lastUpdated = new Date();
    this.fulfillments.set(userId, fulfillment);
    return fulfillment;
  }

  async removeRelationship(userId: string, relationshipId: string): Promise<Fulfillment> {
    const fulfillment = this.fulfillments.get(userId);
    if (!fulfillment) throw new Error('Fulfillment not found');
    
    fulfillment.relationships = fulfillment.relationships.filter(r => r.id !== relationshipId);
    fulfillment.lastUpdated = new Date();
    this.fulfillments.set(userId, fulfillment);
    return fulfillment;
  }

  async performMonthlyAudit(userId: string, audit: Omit<MonthlyAudit, 'id' | 'date'>): Promise<Fulfillment> {
    const fulfillment = this.fulfillments.get(userId) || this.createDefault(userId);
    
    fulfillment.monthlyAudits.push({
      id: Date.now().toString(),
      date: new Date(),
      ...audit,
    } as MonthlyAudit);
    
    fulfillment.lastUpdated = new Date();
    this.fulfillments.set(userId, fulfillment);
    return fulfillment;
  }

  private updateOverallStatus(fulfillment: Fulfillment) {
    const totalCommitment = fulfillment.lifeAreas.reduce((sum, area) => sum + area.commitmentLevel, 0);
    const avgFulfillment = fulfillment.lifeAreas.reduce((sum, area) => sum + area.currentFulfillment, 0) / fulfillment.lifeAreas.length;
    
    if (totalCommitment > 20 || avgFulfillment < 50) {
      fulfillment.overallStatus = 'overwhelmed';
    } else if (totalCommitment > 15 || avgFulfillment < 70) {
      fulfillment.overallStatus = 'stretched';
    } else if (totalCommitment < 8 || avgFulfillment > 90) {
      fulfillment.overallStatus = 'underutilized';
    } else {
      fulfillment.overallStatus = 'balanced';
    }
  }

  private createDefault(userId: string): Fulfillment {
    return {
      userId,
      overallStatus: 'balanced',
      lifeAreas: [],
      relationships: [],
      monthlyAudits: [],
      lastUpdated: new Date(),
    };
  }

  // ========================================================================
  // Prisma-based Fulfillment Methods (for mirroring feature)
  // ========================================================================

  /**
   * Get all fulfillment entries for a user, optionally filtered by life area
   */
  async getFulfillmentEntries(userId: string, lifeAreaSlug?: string): Promise<PrismaFulfillmentEntry[]> {
    const result = await this.prisma.safeQuery(
      async () => {
        const where: any = { userId };
        
        if (lifeAreaSlug) {
          where.lifeArea = { slug: lifeAreaSlug };
        }

        return this.prisma.fulfillmentEntry.findMany({
          where,
          include: {
            lifeArea: true,
            contribution: true,
          },
          orderBy: [
            { priority: 'desc' },
            { createdAt: 'desc' },
          ],
        });
      },
      // Fallback to in-memory
      () => {
        const userEntries = this.fulfillmentEntries.get(userId) || [];
        
        if (lifeAreaSlug) {
          return userEntries.filter(entry => 
            entry.lifeArea?.slug === lifeAreaSlug
          );
        }
        
        return userEntries.sort((a, b) => {
          if (a.priority !== b.priority) {
            return b.priority - a.priority;
          }
          return b.createdAt.getTime() - a.createdAt.getTime();
        });
      }
    );

    return result || [];
  }

  /**
   * Get canonical life areas
   */
  async getCanonicalLifeAreas(): Promise<any[]> {
    const result = await this.prisma.safeQuery(
      async () => {
        return this.prisma.lifeAreaCanonical.findMany({
          orderBy: { name: 'asc' },
        });
      },
      // Fallback to hardcoded list
      () => {
        return [
          { id: '1', slug: 'work-purpose', name: 'Work & Purpose', icon: '💼', color: '#3B82F6' },
          { id: '2', slug: 'creativity-expression', name: 'Creativity & Expression', icon: '🎨', color: '#8B5CF6' },
          { id: '3', slug: 'health-recovery', name: 'Health & Recovery', icon: '🏃', color: '#10B981' },
          { id: '4', slug: 'finance', name: 'Finance', icon: '💰', color: '#F59E0B' },
          { id: '5', slug: 'intimacy', name: 'Intimacy', icon: '❤️', color: '#EF4444' },
          { id: '6', slug: 'friendship', name: 'Friendship', icon: '🤝', color: '#06B6D4' },
          { id: '7', slug: 'family', name: 'Family', icon: '👨‍👩‍👧‍👦', color: '#EC4899' },
          { id: '8', slug: 'spirituality-practice', name: 'Spirituality & Practice', icon: '🧘', color: '#9333EA' },
          { id: '9', slug: 'education-growth', name: 'Education & Growth', icon: '📚', color: '#6366F1' },
          { id: '10', slug: 'adventure-travel', name: 'Adventure & Travel', icon: '✈️', color: '#0EA5E9' },
          { id: '11', slug: 'home-environment', name: 'Home & Environment', icon: '🏡', color: '#84CC16' },
          { id: '12', slug: 'community-contribution', name: 'Community & Contribution', icon: '🌍', color: '#14B8A6' },
          { id: '13', slug: 'fun-recreation', name: 'Fun & Recreation', icon: '🎮', color: '#F97316' },
        ];
      }
    );

    return result || [];
  }

  /**
   * Create a manual fulfillment entry (not mirrored from contributions)
   */
  async createFulfillmentEntry(data: {
    userId: string;
    lifeAreaSlug: string;
    title: string;
    description?: string;
    priority?: number;
    status?: string;
  }): Promise<PrismaFulfillmentEntry | null> {
    const result = await this.prisma.safeQuery(
      async () => {
        // First get the life area ID
        const lifeArea = await this.prisma.lifeAreaCanonical.findUnique({
          where: { slug: data.lifeAreaSlug },
        });
        
        if (!lifeArea) {
          throw new Error(`Life area '${data.lifeAreaSlug}' not found`);
        }

        return this.prisma.fulfillmentEntry.create({
          data: {
            userId: data.userId,
            lifeAreaId: lifeArea.id,
            sourceType: 'manual',
            title: data.title,
            description: data.description,
            priority: data.priority || 3,
            status: data.status || 'active',
            meta: {},
          },
          include: {
            lifeArea: true,
          },
        });
      },
      // Fallback to in-memory
      () => {
        const entry: PrismaFulfillmentEntry = {
          id: Date.now().toString(),
          userId: data.userId,
          lifeAreaId: data.lifeAreaSlug, // Using slug as ID for in-memory
          sourceType: 'manual',
          title: data.title,
          description: data.description,
          meta: {},
          status: data.status || 'active',
          priority: data.priority || 3,
          createdAt: new Date(),
          updatedAt: new Date(),
          lifeArea: {
            id: data.lifeAreaSlug,
            slug: data.lifeAreaSlug,
            name: data.lifeAreaSlug.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          },
        };

        const userEntries = this.fulfillmentEntries.get(data.userId) || [];
        userEntries.push(entry);
        this.fulfillmentEntries.set(data.userId, userEntries);

        return entry;
      }
    );

    return result;
  }

  /**
   * Update a fulfillment entry
   */
  async updateFulfillmentEntry(
    id: string,
    userId: string,
    data: Partial<{
      title: string;
      description: string;
      priority: number;
      status: string;
    }>
  ): Promise<PrismaFulfillmentEntry | null> {
    const result = await this.prisma.safeQuery(
      async () => {
        return this.prisma.fulfillmentEntry.update({
          where: { id, userId },
          data: {
            ...data,
            updatedAt: new Date(),
          },
          include: {
            lifeArea: true,
          },
        });
      },
      // Fallback to in-memory
      () => {
        const userEntries = this.fulfillmentEntries.get(userId) || [];
        const index = userEntries.findIndex(e => e.id === id);
        
        if (index === -1) return null;
        
        userEntries[index] = {
          ...userEntries[index],
          ...data,
          updatedAt: new Date(),
        };
        
        this.fulfillmentEntries.set(userId, userEntries);
        return userEntries[index];
      }
    );

    return result;
  }

  /**
   * Delete a fulfillment entry
   */
  async deleteFulfillmentEntry(id: string, userId: string): Promise<boolean> {
    const result = await this.prisma.safeQuery(
      async () => {
        await this.prisma.fulfillmentEntry.delete({
          where: { id, userId },
        });
        return true;
      },
      // Fallback to in-memory
      () => {
        const userEntries = this.fulfillmentEntries.get(userId) || [];
        const filteredEntries = userEntries.filter(e => e.id !== id);
        
        if (filteredEntries.length === userEntries.length) {
          return false; // Nothing was deleted
        }
        
        this.fulfillmentEntries.set(userId, filteredEntries);
        return true;
      }
    );

    return result || false;
  }

  /**
   * Get fulfillment entries with contribution details (for dashboard)
   */
  async getFulfillmentWithContributions(userId: string, lifeAreaSlug?: string): Promise<any[]> {
    const result = await this.prisma.safeQuery(
      async () => {
        // Use the custom PostgreSQL function if available
        if (lifeAreaSlug) {
          return this.prisma.$queryRaw`
            SELECT * FROM get_fulfillment_with_contributions(${userId}::uuid, ${lifeAreaSlug}::text)
          `;
        } else {
          return this.prisma.$queryRaw`
            SELECT * FROM get_fulfillment_with_contributions(${userId}::uuid)
          `;
        }
      },
      // Fallback to in-memory with basic data
      async () => {
        const entries = await this.getFulfillmentEntries(userId, lifeAreaSlug);
        return entries.map(entry => ({
          entry_id: entry.id,
          life_area_name: entry.lifeArea?.name || 'Unknown',
          life_area_slug: entry.lifeArea?.slug || 'unknown',
          title: entry.title,
          description: entry.description,
          source_type: entry.sourceType,
          contribution_category: entry.meta?.category || null,
          contribution_bullets: entry.meta?.bullets || null,
          priority: entry.priority,
          status: entry.status,
          created_at: entry.createdAt,
        }));
      }
    );

    return result || [];
  }
}