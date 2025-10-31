import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/marketplace/auth';
import { z } from 'zod';
import { calculatePlatformFee, toCents } from '@/lib/stripe/config';

// Validation schema for creating booking
const createBookingSchema = z.object({
  serviceId: z.string(),
  scheduledAt: z.string().datetime(),
  timezone: z.string(),
  notes: z.string().max(1000).optional(),
  location: z.string().optional(),
});

/**
 * GET /api/marketplace/bookings
 * Get user's bookings (as buyer or provider)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const userId = user.id;

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') || 'buyer'; // 'buyer' or 'provider'
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: any = role === 'buyer' 
      ? { buyerId: userId }
      : { providerId: userId };

    if (status) {
      where.status = status;
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        include: {
          service: {
            include: {
              provider: {
                include: {
                  user: {
                    select: {
                      name: true,
                      image: true,
                    },
                  },
                },
              },
            },
          },
          buyer: {
            select: {
              name: true,
              email: true,
              image: true,
            },
          },
          provider: {
            select: {
              name: true,
              email: true,
              image: true,
            },
          },
          review: true,
        },
        orderBy: {
          scheduledAt: 'desc',
        },
      }),
      prisma.booking.count({ where }),
    ]);

    return NextResponse.json({
      bookings,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/marketplace/bookings
 * Create a new booking
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    const body = await request.json();
    const validatedData = createBookingSchema.parse(body);

    // Get service details
    const service = await prisma.service.findUnique({
      where: { id: validatedData.serviceId },
      include: {
        provider: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    if (!service.isActive || !service.isPublished) {
      return NextResponse.json(
        { error: 'Service is not available' },
        { status: 400 }
      );
    }

    // Check if provider can accept bookings
    if (!service.provider.stripeChargesEnabled) {
      return NextResponse.json(
        { error: 'Provider cannot accept bookings yet' },
        { status: 400 }
      );
    }

    // Calculate times
    const scheduledAt = new Date(validatedData.scheduledAt);
    const endTime = new Date(scheduledAt.getTime() + service.duration * 60000);

    // Calculate pricing with platform fee (6%)
    const basePrice = parseFloat(service.basePrice.toString());
    const basePriceInCents = toCents(basePrice);
    const platformFee = calculatePlatformFee(basePriceInCents);
    const totalPrice = basePrice; // Buyer pays base price, platform fee taken from provider

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        buyerId: userId,
        providerId: service.provider.userId,
        serviceId: service.id,
        scheduledAt,
        endTime,
        duration: service.duration,
        timezone: validatedData.timezone,
        notes: validatedData.notes,
        location: validatedData.location,
        basePrice,
        platformFee: platformFee / 100, // Convert cents to dollars
        totalPrice,
        currency: service.currency,
        status: service.provider.autoAcceptBookings ? 'CONFIRMED' : 'PENDING',
      },
      include: {
        service: {
          include: {
            provider: {
              include: {
                user: {
                  select: {
                    name: true,
                    image: true,
                  },
                },
              },
            },
          },
        },
        buyer: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // Create notification for provider
    await prisma.notification.create({
      data: {
        userId: service.provider.userId,
        type: 'BOOKING_REQUEST',
        title: 'New Booking Request',
        message: `${user.name || user.email} requested to book ${service.title}`,
        actionUrl: `/marketplace/dashboard/bookings/${booking.id}`,
        metadata: {
          bookingId: booking.id,
          serviceId: service.id,
        },
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}
