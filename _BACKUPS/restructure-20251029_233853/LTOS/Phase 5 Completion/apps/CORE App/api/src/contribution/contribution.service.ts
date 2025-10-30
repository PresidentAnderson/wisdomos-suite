import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

export interface Contribution {
  userId: string;
  identityStatement: string;
  coreStrengths: Array<{
    id: string;
    strength: string;
    description: string;
    examples: string[];
  }>;
  naturalContributions: Array<{
    id: string;
    contribution: string;
    impact: string;
    frequency: 'daily' | 'weekly' | 'project-based';
  }>;
  acknowledgments: Array<{
    id: string;
    from: string;
    message: string;
    date: Date;
    context: string;
  }>;
  lastUpdated: Date;
}

// Prisma-compatible contribution interface
export interface PrismaContribution {
  id: string;
  userId: string;
  category: string;
  title: string;
  description?: string;
  contributions: string[];
  impact?: string;
  commitment?: string;
  tags: string[];
  visibility: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class ContributionService {
  private contributions: Map<string, Contribution> = new Map();
  private prismaContributions: Map<string, PrismaContribution[]> = new Map();

  constructor(private readonly prisma: PrismaService) {
    // Initialize with demo data
    this.contributions.set('demo-user-id', {
      userId: 'demo-user-id',
      identityStatement: 'I am a natural catalyst for transformation and growth',
      coreStrengths: [
        {
          id: '1',
          strength: 'Strategic Vision',
          description: 'Ability to see the big picture and long-term possibilities',
          examples: ['Led company restructuring', 'Developed 5-year growth plan'],
        },
        {
          id: '2',
          strength: 'Empathetic Leadership',
          description: 'Leading with understanding and compassion',
          examples: ['Mentored 15+ team members', 'Built inclusive team culture'],
        },
      ],
      naturalContributions: [
        {
          id: '1',
          contribution: 'Problem Solving',
          impact: 'Help teams overcome complex challenges',
          frequency: 'daily',
        },
        {
          id: '2',
          contribution: 'Innovation',
          impact: 'Introduce new perspectives and solutions',
          frequency: 'weekly',
        },
      ],
      acknowledgments: [
        {
          id: '1',
          from: 'Sarah M.',
          message: 'Your guidance transformed our entire approach',
          date: new Date('2024-01-15'),
          context: 'Project Phoenix',
        },
      ],
      lastUpdated: new Date(),
    });
  }

  async getContribution(userId: string): Promise<Contribution | null> {
    return this.contributions.get(userId) || null;
  }

  async createOrUpdateContribution(userId: string, data: Partial<Contribution>): Promise<Contribution> {
    const existing = this.contributions.get(userId);
    const contribution = {
      ...existing,
      ...data,
      userId,
      lastUpdated: new Date(),
    } as Contribution;
    
    this.contributions.set(userId, contribution);
    return contribution;
  }

  async addStrength(userId: string, strength: any): Promise<Contribution> {
    const contribution = this.contributions.get(userId) || this.createDefault(userId);
    
    contribution.coreStrengths.push({
      id: Date.now().toString(),
      ...strength,
    });
    
    contribution.lastUpdated = new Date();
    this.contributions.set(userId, contribution);
    return contribution;
  }

  async removeStrength(userId: string, strengthId: string): Promise<Contribution> {
    const contribution = this.contributions.get(userId);
    if (!contribution) throw new Error('Contribution not found');
    
    contribution.coreStrengths = contribution.coreStrengths.filter(s => s.id !== strengthId);
    contribution.lastUpdated = new Date();
    this.contributions.set(userId, contribution);
    return contribution;
  }

  async addNaturalContribution(userId: string, naturalContribution: any): Promise<Contribution> {
    const contribution = this.contributions.get(userId) || this.createDefault(userId);
    
    contribution.naturalContributions.push({
      id: Date.now().toString(),
      ...naturalContribution,
    });
    
    contribution.lastUpdated = new Date();
    this.contributions.set(userId, contribution);
    return contribution;
  }

  async removeNaturalContribution(userId: string, contributionId: string): Promise<Contribution> {
    const contribution = this.contributions.get(userId);
    if (!contribution) throw new Error('Contribution not found');
    
    contribution.naturalContributions = contribution.naturalContributions.filter(c => c.id !== contributionId);
    contribution.lastUpdated = new Date();
    this.contributions.set(userId, contribution);
    return contribution;
  }

  async addAcknowledgment(userId: string, acknowledgment: any): Promise<Contribution> {
    const contribution = this.contributions.get(userId) || this.createDefault(userId);
    
    contribution.acknowledgments.push({
      id: Date.now().toString(),
      date: new Date(),
      ...acknowledgment,
    });
    
    contribution.lastUpdated = new Date();
    this.contributions.set(userId, contribution);
    return contribution;
  }

  async removeAcknowledgment(userId: string, acknowledgmentId: string): Promise<Contribution> {
    const contribution = this.contributions.get(userId);
    if (!contribution) throw new Error('Contribution not found');
    
    contribution.acknowledgments = contribution.acknowledgments.filter(a => a.id !== acknowledgmentId);
    contribution.lastUpdated = new Date();
    this.contributions.set(userId, contribution);
    return contribution;
  }

  private createDefault(userId: string): Contribution {
    return {
      userId,
      identityStatement: '',
      coreStrengths: [],
      naturalContributions: [],
      acknowledgments: [],
      lastUpdated: new Date(),
    };
  }

  // ========================================================================
  // Prisma-based Contribution Methods (for mirroring feature)
  // ========================================================================

  /**
   * Create a new contribution entry that will be mirrored to fulfillment areas
   */
  async createPrismaContribution(data: {
    userId: string;
    category: 'Doing' | 'Being' | 'Having';
    title: string;
    description?: string;
    contributions: string[];
    impact?: string;
    commitment?: string;
    tags?: string[];
    visibility?: string;
  }): Promise<PrismaContribution | null> {
    // Try database first
    const result = await this.prisma.safeQuery(
      async () => {
        return this.prisma.contribution.create({
          data: {
            userId: data.userId,
            category: data.category,
            title: data.title,
            description: data.description,
            contributions: data.contributions,
            impact: data.impact,
            commitment: data.commitment,
            tags: data.tags || [],
            visibility: data.visibility || 'private',
          },
        });
      },
      // Fallback to in-memory
      () => {
        const contribution: PrismaContribution = {
          id: Date.now().toString(),
          userId: data.userId,
          category: data.category,
          title: data.title,
          description: data.description,
          contributions: data.contributions,
          impact: data.impact,
          commitment: data.commitment,
          tags: data.tags || [],
          visibility: data.visibility || 'private',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const userContributions = this.prismaContributions.get(data.userId) || [];
        userContributions.push(contribution);
        this.prismaContributions.set(data.userId, userContributions);

        return contribution;
      }
    );

    return result;
  }

  /**
   * Get all Prisma contributions for a user
   */
  async getPrismaContributions(userId: string): Promise<PrismaContribution[]> {
    const result = await this.prisma.safeQuery(
      async () => {
        return this.prisma.contribution.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
        });
      },
      // Fallback to in-memory
      () => {
        return this.prismaContributions.get(userId) || [];
      }
    );

    return result || [];
  }

  /**
   * Update a Prisma contribution
   */
  async updatePrismaContribution(
    id: string, 
    userId: string, 
    data: Partial<Omit<PrismaContribution, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
  ): Promise<PrismaContribution | null> {
    const result = await this.prisma.safeQuery(
      async () => {
        return this.prisma.contribution.update({
          where: { id, userId },
          data: {
            ...data,
            updatedAt: new Date(),
          },
        });
      },
      // Fallback to in-memory
      () => {
        const userContributions = this.prismaContributions.get(userId) || [];
        const index = userContributions.findIndex(c => c.id === id);
        
        if (index === -1) return null;
        
        userContributions[index] = {
          ...userContributions[index],
          ...data,
          updatedAt: new Date(),
        };
        
        this.prismaContributions.set(userId, userContributions);
        return userContributions[index];
      }
    );

    return result;
  }

  /**
   * Delete a Prisma contribution
   */
  async deletePrismaContribution(id: string, userId: string): Promise<boolean> {
    const result = await this.prisma.safeQuery(
      async () => {
        await this.prisma.contribution.delete({
          where: { id, userId },
        });
        return true;
      },
      // Fallback to in-memory
      () => {
        const userContributions = this.prismaContributions.get(userId) || [];
        const filteredContributions = userContributions.filter(c => c.id !== id);
        
        if (filteredContributions.length === userContributions.length) {
          return false; // Nothing was deleted
        }
        
        this.prismaContributions.set(userId, filteredContributions);
        return true;
      }
    );

    return result || false;
  }

  /**
   * Get a single Prisma contribution by ID
   */
  async getPrismaContributionById(id: string, userId: string): Promise<PrismaContribution | null> {
    const result = await this.prisma.safeQuery(
      async () => {
        return this.prisma.contribution.findFirst({
          where: { id, userId },
        });
      },
      // Fallback to in-memory
      () => {
        const userContributions = this.prismaContributions.get(userId) || [];
        return userContributions.find(c => c.id === id) || null;
      }
    );

    return result;
  }
}