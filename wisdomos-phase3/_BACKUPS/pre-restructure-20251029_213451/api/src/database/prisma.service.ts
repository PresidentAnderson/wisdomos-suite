import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      console.log('✅ Prisma connected to database');
      
      // Initialize life areas if they don't exist
      await this.initializeLifeAreas();
    } catch (error) {
      console.error('Failed to connect to database:', error);
      console.log('⚠️ Running in memory-only mode');
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  private async initializeLifeAreas() {
    try {
      const count = await this.lifeAreaCanonical.count();
      if (count === 0) {
        console.log('Initializing canonical life areas...');
        
        const lifeAreas = [
          { slug: 'work-purpose', name: 'Work & Purpose', description: 'Your professional life and sense of meaning', icon: '💼', color: '#3B82F6' },
          { slug: 'creativity-expression', name: 'Creativity & Expression', description: 'Your creative outlets and self-expression', icon: '🎨', color: '#8B5CF6' },
          { slug: 'health-recovery', name: 'Health & Recovery', description: 'Physical and mental wellbeing', icon: '🏃', color: '#10B981' },
          { slug: 'finance', name: 'Finance', description: 'Financial health and resource management', icon: '💰', color: '#F59E0B' },
          { slug: 'intimacy', name: 'Intimacy', description: 'Close personal relationships and connection', icon: '❤️', color: '#EF4444' },
          { slug: 'friendship', name: 'Friendship', description: 'Social connections and community', icon: '🤝', color: '#06B6D4' },
          { slug: 'family', name: 'Family', description: 'Family relationships and responsibilities', icon: '👨‍👩‍👧‍👦', color: '#EC4899' },
          { slug: 'spirituality-practice', name: 'Spirituality & Practice', description: 'Spiritual growth and practices', icon: '🧘', color: '#9333EA' },
          { slug: 'education-growth', name: 'Education & Growth', description: 'Learning and personal development', icon: '📚', color: '#6366F1' },
          { slug: 'adventure-travel', name: 'Adventure & Travel', description: 'Exploration and new experiences', icon: '✈️', color: '#0EA5E9' },
          { slug: 'home-environment', name: 'Home & Environment', description: 'Living space and surroundings', icon: '🏡', color: '#84CC16' },
          { slug: 'community-contribution', name: 'Community & Contribution', description: 'Service and community involvement', icon: '🌍', color: '#14B8A6' },
          { slug: 'fun-recreation', name: 'Fun & Recreation', description: 'Leisure and enjoyment', icon: '🎮', color: '#F97316' },
        ];

        await this.lifeAreaCanonical.createMany({
          data: lifeAreas,
          skipDuplicates: true,
        });
        
        console.log('✅ Initialized 13 canonical life areas');
      }
    } catch (error) {
      console.warn('Could not initialize life areas:', error);
    }
  }
}