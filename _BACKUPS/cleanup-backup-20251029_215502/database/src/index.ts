import { PrismaClient } from '@prisma/client';
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private isConnected = false;

  async onModuleInit() {
    try {
      await this.$connect();
      this.isConnected = true;
      console.log('✅ Prisma connected successfully');
      
      // Initialize canonical life areas on startup
      await this.initializeCanonicalLifeAreas();
    } catch (error) {
      console.warn('⚠️ Prisma connection failed, will use in-memory fallback:', error.message);
      this.isConnected = false;
    }
  }

  async onModuleDestroy() {
    if (this.isConnected) {
      await this.$disconnect();
      console.log('🔌 Prisma disconnected');
    }
  }

  get connected(): boolean {
    return this.isConnected;
  }

  /**
   * Safe database operation wrapper - falls back gracefully when DB is unavailable
   */
  async safeQuery<T>(operation: () => Promise<T>, fallback?: () => T | Promise<T>): Promise<T | null> {
    if (!this.isConnected) {
      if (fallback) {
        return await fallback();
      }
      return null;
    }

    try {
      return await operation();
    } catch (error) {
      console.error('Database operation failed:', error.message);
      if (fallback) {
        return await fallback();
      }
      return null;
    }
  }

  /**
   * Initialize canonical life areas if they don't exist
   */
  async initializeCanonicalLifeAreas() {
    return this.safeQuery(async () => {
      const canonicalAreas = [
        {
          slug: 'work-purpose',
          name: 'Work & Purpose',
          description: 'Your professional life and sense of meaning',
          icon: '💼',
          color: '#3B82F6',
        },
        {
          slug: 'creativity-expression',
          name: 'Creativity & Expression',
          description: 'Your creative outlets and self-expression',
          icon: '🎨',
          color: '#8B5CF6',
        },
        {
          slug: 'health-recovery',
          name: 'Health & Recovery',
          description: 'Physical and mental wellbeing',
          icon: '🏃',
          color: '#10B981',
        },
        {
          slug: 'finance',
          name: 'Finance',
          description: 'Financial health and resource management',
          icon: '💰',
          color: '#F59E0B',
        },
        {
          slug: 'intimacy',
          name: 'Intimacy',
          description: 'Close personal relationships and connection',
          icon: '❤️',
          color: '#EF4444',
        },
        {
          slug: 'friendship',
          name: 'Friendship',
          description: 'Social connections and community',
          icon: '🤝',
          color: '#06B6D4',
        },
        {
          slug: 'family',
          name: 'Family',
          description: 'Family relationships and responsibilities',
          icon: '👨‍👩‍👧‍👦',
          color: '#EC4899',
        },
        {
          slug: 'spirituality-practice',
          name: 'Spirituality & Practice',
          description: 'Spiritual growth and practices',
          icon: '🧘',
          color: '#9333EA',
        },
        {
          slug: 'education-growth',
          name: 'Education & Growth',
          description: 'Learning and personal development',
          icon: '📚',
          color: '#6366F1',
        },
        {
          slug: 'adventure-travel',
          name: 'Adventure & Travel',
          description: 'Exploration and new experiences',
          icon: '✈️',
          color: '#0EA5E9',
        },
        {
          slug: 'home-environment',
          name: 'Home & Environment',
          description: 'Living space and surroundings',
          icon: '🏡',
          color: '#84CC16',
        },
        {
          slug: 'community-contribution',
          name: 'Community & Contribution',
          description: 'Service and community involvement',
          icon: '🌍',
          color: '#14B8A6',
        },
        {
          slug: 'fun-recreation',
          name: 'Fun & Recreation',
          description: 'Leisure and enjoyment',
          icon: '🎮',
          color: '#F97316',
        },
      ];

      // Use upsert to create or update canonical life areas
      const results = await Promise.all(
        canonicalAreas.map((area) =>
          this.lifeAreaCanonical.upsert({
            where: { slug: area.slug },
            update: {
              name: area.name,
              description: area.description,
              icon: area.icon,
              color: area.color,
            },
            create: area,
          })
        )
      );

      console.log(`✅ Initialized ${results.length} canonical life areas`);
      return results;
    });
  }
}

// Database module for NestJS
import { Module, Global } from '@nestjs/common';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {}

// Re-export Prisma types
export * from '@prisma/client';
export { PrismaService };