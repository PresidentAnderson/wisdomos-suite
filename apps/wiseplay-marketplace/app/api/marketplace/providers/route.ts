import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/marketplace/auth';
import { z } from 'zod';

// Validation schema for creating provider profile
const createProviderSchema = z.object({
  displayName: z.string().min(2).max(100),
  tagline: z.string().max(200).optional(),
  description: z.string().max(2000).optional(),
  expertise: z.array(z.string()).optional(),
  yearsExperience: z.number().int().min(0).optional(),
  businessName: z.string().max(200).optional(),
  businessWebsite: z.string().url().optional(),
  businessEmail: z.string().email().optional(),
  businessPhone: z.string().optional(),
});

/**
 * GET /api/marketplace/providers
 * Get list of providers with filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const isVerified = searchParams.get('verified') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: any = {
      stripeOnboardingComplete: true,
    };

    if (isVerified) {
      where.isVerified = true;
    }

    if (query) {
      where.OR = [
        { displayName: { contains: query, mode: 'insensitive' } },
        { tagline: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ];
    }

    const [providers, total] = await Promise.all([
      prisma.providerProfile.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              name: true,
              email: true,
              image: true,
            },
          },
          services: {
            where: {
              isActive: true,
              isPublished: true,
            },
            take: 3,
          },
          _count: {
            select: {
              services: true,
            },
          },
        },
        orderBy: {
          averageRating: 'desc',
        },
      }),
      prisma.providerProfile.count({ where }),
    ]);

    return NextResponse.json({
      providers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching providers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch providers' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/marketplace/providers
 * Create a new provider profile
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    const body = await request.json();
    const validatedData = createProviderSchema.parse(body);

    // Check if user already has a provider profile
    const existingProfile = await prisma.providerProfile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      return NextResponse.json(
        { error: 'Provider profile already exists' },
        { status: 400 }
      );
    }

    // Create provider profile
    const providerProfile = await prisma.providerProfile.create({
      data: {
        userId,
        ...validatedData,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // Update user's isProvider flag
    await prisma.user.update({
      where: { id: userId },
      data: { isProvider: true },
    });

    return NextResponse.json(providerProfile, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating provider profile:', error);
    return NextResponse.json(
      { error: 'Failed to create provider profile' },
      { status: 500 }
    );
  }
}
