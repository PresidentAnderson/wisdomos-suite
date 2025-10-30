import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth, requireProvider } from '@/lib/marketplace/auth';
import { searchServices } from '@/lib/marketplace/search';
import { z } from 'zod';

// Validation schema for creating service
const createServiceSchema = z.object({
  title: z.string().min(3).max(200),
  slug: z.string().min(3).max(200),
  description: z.string().min(20).max(5000),
  shortDescription: z.string().max(300).optional(),
  basePrice: z.number().positive(),
  currency: z.string().default('USD'),
  priceType: z.enum(['FIXED', 'HOURLY', 'PACKAGE']).default('FIXED'),
  duration: z.number().int().positive(),
  bufferTime: z.number().int().optional(),
  categoryIds: z.array(z.string()).optional(),
  tagIds: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  videoUrl: z.string().url().optional(),
  requirements: z.string().optional(),
  deliverables: z.string().optional(),
  maxAdvanceBooking: z.number().int().optional(),
  minAdvanceBooking: z.number().int().optional(),
  maxBookingsPerDay: z.number().int().optional(),
  isPublished: z.boolean().default(false),
});

/**
 * GET /api/marketplace/services
 * Search and list services with filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const filters = {
      query: searchParams.get('query') || undefined,
      categoryId: searchParams.get('categoryId') || undefined,
      tags: searchParams.get('tags')?.split(',') || [],
      minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
      maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
      priceType: searchParams.get('priceType') || undefined,
      duration: searchParams.get('duration') ? parseInt(searchParams.get('duration')!) : undefined,
      sortBy: (searchParams.get('sortBy') || 'popularity') as any,
      sortOrder: (searchParams.get('sortOrder') || 'desc') as any,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
    };

    const result = await searchServices(filters);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/marketplace/services
 * Create a new service (provider only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireProvider();
    if (session instanceof NextResponse) {
      return session; // Return error response
    }

    const userId = session.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = createServiceSchema.parse(body);

    // Get provider profile
    const providerProfile = await prisma.providerProfile.findUnique({
      where: { userId },
    });

    if (!providerProfile) {
      return NextResponse.json(
        { error: 'Provider profile not found' },
        { status: 404 }
      );
    }

    // Check if provider has completed Stripe onboarding
    if (!providerProfile.stripeOnboardingComplete) {
      return NextResponse.json(
        { error: 'Please complete Stripe onboarding first' },
        { status: 400 }
      );
    }

    // Check if slug is unique
    const existingService = await prisma.service.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existingService) {
      return NextResponse.json(
        { error: 'Service slug already exists' },
        { status: 400 }
      );
    }

    const { categoryIds, tagIds, ...serviceData } = validatedData;

    // Create service
    const service = await prisma.service.create({
      data: {
        ...serviceData,
        providerId: providerProfile.id,
        categories: categoryIds
          ? {
              connect: categoryIds.map((id) => ({ id })),
            }
          : undefined,
        tags: tagIds
          ? {
              connect: tagIds.map((id) => ({ id })),
            }
          : undefined,
      },
      include: {
        provider: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        categories: true,
        tags: true,
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating service:', error);
    return NextResponse.json(
      { error: 'Failed to create service' },
      { status: 500 }
    );
  }
}
