import { NextRequest, NextResponse } from 'next/server';
import { ServiceDiscoveryAgent } from '@/lib/agents/discovery-agent';
import { z } from 'zod';

// Request validation schema
const DiscoveryRequestSchema = z.object({
  query: z.string().min(5, 'Query must be at least 5 characters'),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional(),
  filters: z.object({
    maxPrice: z.number().optional(),
    location: z.string().optional(),
    category: z.string().optional(),
  }).optional(),
});

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // Use Node.js runtime for AI features

/**
 * POST /api/agents/discovery
 *
 * Get AI-powered service recommendations
 *
 * Body:
 * {
 *   "query": "I need help with career breakthrough",
 *   "conversationHistory": [...], // optional
 *   "filters": { maxPrice: 500, location: "SF" } // optional
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Check if Anthropic API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'AI service not configured. Please add ANTHROPIC_API_KEY to environment variables.' },
        { status: 503 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = DiscoveryRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { query, conversationHistory, filters } = validation.data;

    // Initialize discovery agent
    const agent = new ServiceDiscoveryAgent();

    // Get recommendations
    const result = await agent.process(query, {
      conversationHistory,
      filters,
    });

    // Return recommendations
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error in discovery agent API:', error);

    return NextResponse.json(
      {
        error: 'Failed to process discovery request',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/agents/discovery
 *
 * CORS preflight
 */
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}
