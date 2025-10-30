import { BaseAgent, Message } from './base-agent';
import { prisma } from '@/lib/db';

interface ServiceMatch {
  id: string;
  title: string;
  description: string;
  price: number;
  priceType: string;
  provider: {
    displayName: string | null;
    isVerified: boolean;
  };
  category: {
    name: string;
  } | null;
  averageRating: number;
  totalBookings: number;
}

interface Recommendation {
  service: ServiceMatch;
  reasoning: string;
  matchScore: number;
}

interface DiscoveryResult {
  recommendations: Recommendation[];
  conversationalResponse: string;
  followUpQuestions?: string[];
}

export class ServiceDiscoveryAgent extends BaseAgent {
  constructor() {
    const systemPrompt = `You are a helpful service discovery assistant for WisePlay Marketplace, a platform connecting people in the Landmark community with transformational services, coaching, and partnerships.

Your role is to:
1. Understand what users are looking for (their challenges, goals, context)
2. Recommend the most relevant services from the available options
3. Explain WHY each service is a good match
4. Help users make informed decisions

Guidelines:
- Be warm, authentic, and community-focused
- Use Landmark language when appropriate (breakthrough, possibility, commitment, transformation)
- Prioritize quality and fit over price
- Consider the user's readiness and context
- Be honest about what services can and cannot do
- Recommend 1-3 services maximum (not overwhelming)
- Provide clear reasoning for each recommendation

Output Format:
Return a JSON object with:
{
  "recommendations": [
    {
      "serviceId": "...",
      "reasoning": "Clear explanation of why this service fits",
      "matchScore": 0-100
    }
  ],
  "conversationalResponse": "Friendly response to the user",
  "followUpQuestions": ["Optional questions to refine recommendations"]
}`;

    super(systemPrompt, {
      model: 'claude-3-5-sonnet-20241022',
      maxTokens: 3000,
      temperature: 0.7,
    });
  }

  /**
   * Process a user query and return service recommendations
   */
  async process(
    query: string,
    context?: {
      userId?: string;
      conversationHistory?: Message[];
      filters?: {
        maxPrice?: number;
        location?: string;
        category?: string;
      };
    }
  ): Promise<DiscoveryResult> {
    try {
      // 1. Fetch available services from database
      const services = await this.fetchRelevantServices(context?.filters);

      // 2. Build the prompt with services data
      const servicesContext = this.formatServicesForLLM(services);

      // 3. Create conversation messages
      const messages: Message[] = [
        ...(context?.conversationHistory || []),
        {
          role: 'user',
          content: `User Query: "${query}"

Available Services:
${servicesContext}

${context?.filters ? `User Filters: ${JSON.stringify(context.filters)}` : ''}

Please recommend the best services for this user and explain your reasoning. Format your response as JSON.`,
        },
      ];

      // 4. Get recommendations from Claude
      const response = await this.chat(messages);

      // 5. Parse the response
      const parsed = this.parseJSON<{
        recommendations: Array<{
          serviceId: string;
          reasoning: string;
          matchScore: number;
        }>;
        conversationalResponse: string;
        followUpQuestions?: string[];
      }>(response);

      if (!parsed || !parsed.recommendations) {
        throw new Error('Failed to parse recommendations from AI response');
      }

      // 6. Enrich recommendations with full service data
      const enrichedRecommendations = await this.enrichRecommendations(
        parsed.recommendations,
        services
      );

      return {
        recommendations: enrichedRecommendations,
        conversationalResponse: parsed.conversationalResponse,
        followUpQuestions: parsed.followUpQuestions,
      };
    } catch (error) {
      console.error('Error in ServiceDiscoveryAgent:', error);
      throw error;
    }
  }

  /**
   * Fetch relevant services from database
   */
  private async fetchRelevantServices(filters?: {
    maxPrice?: number;
    location?: string;
    category?: string;
  }): Promise<ServiceMatch[]> {
    const services = await prisma.service.findMany({
      where: {
        status: 'ACTIVE',
        ...(filters?.maxPrice && {
          price: { lte: filters.maxPrice },
        }),
        ...(filters?.location && {
          location: { contains: filters.location, mode: 'insensitive' },
        }),
        ...(filters?.category && {
          category: {
            slug: filters.category,
          },
        }),
      },
      include: {
        provider: {
          select: {
            displayName: true,
            isVerified: true,
          },
        },
        category: {
          select: {
            name: true,
          },
        },
      },
      take: 20, // Limit to top 20 services
      orderBy: {
        averageRating: 'desc',
      },
    });

    return services.map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      price: typeof s.price === 'number' ? s.price : Number(s.price),
      priceType: s.priceType,
      provider: s.provider,
      category: s.category,
      averageRating: typeof s.averageRating === 'number' ? s.averageRating : Number(s.averageRating),
      totalBookings: s.totalBookings,
    }));
  }

  /**
   * Format services for LLM consumption
   */
  private formatServicesForLLM(services: ServiceMatch[]): string {
    return services
      .map(
        (s, index) => `
[${index + 1}] ${s.title}
ID: ${s.id}
Provider: ${s.provider.displayName}${s.provider.isVerified ? ' ✓ Verified' : ''}
Category: ${s.category?.name || 'Uncategorized'}
Price: $${s.price} ${s.priceType === 'PER_HOUR' ? '/hour' : s.priceType === 'PER_SESSION' ? '/session' : ''}
Rating: ${s.averageRating.toFixed(1)}/5.0 (${s.totalBookings} bookings)
Description: ${s.description.substring(0, 200)}...
`
      )
      .join('\n---\n');
  }

  /**
   * Enrich recommendations with full service data
   */
  private async enrichRecommendations(
    recommendations: Array<{
      serviceId: string;
      reasoning: string;
      matchScore: number;
    }>,
    services: ServiceMatch[]
  ): Promise<Recommendation[]> {
    return recommendations
      .map((rec) => {
        const service = services.find((s) => s.id === rec.serviceId);
        if (!service) return null;

        return {
          service,
          reasoning: rec.reasoning,
          matchScore: rec.matchScore,
        };
      })
      .filter((rec): rec is Recommendation => rec !== null);
  }

  /**
   * Stream recommendations (for real-time UX)
   */
  async *streamRecommendations(
    query: string,
    context?: {
      userId?: string;
      conversationHistory?: Message[];
      filters?: any;
    }
  ): AsyncGenerator<string> {
    const services = await this.fetchRelevantServices(context?.filters);
    const servicesContext = this.formatServicesForLLM(services);

    const messages: Message[] = [
      ...(context?.conversationHistory || []),
      {
        role: 'user',
        content: `User Query: "${query}"\n\nAvailable Services:\n${servicesContext}\n\nRecommend services and explain reasoning.`,
      },
    ];

    for await (const chunk of this.chatStream(messages)) {
      yield chunk;
    }
  }
}
