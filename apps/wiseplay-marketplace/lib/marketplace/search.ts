import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export interface SearchFilters {
  query?: string;
  categoryId?: string;
  tags?: string[];
  minPrice?: number;
  maxPrice?: number;
  priceType?: string;
  duration?: number;
  sortBy?: 'price' | 'rating' | 'popularity' | 'newest';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

/**
 * Search services with advanced filtering
 */
export async function searchServices(filters: SearchFilters) {
  const {
    query,
    categoryId,
    tags = [],
    minPrice,
    maxPrice,
    priceType,
    duration,
    sortBy = 'popularity',
    sortOrder = 'desc',
    page = 1,
    limit = 20,
  } = filters;

  const skip = (page - 1) * limit;

  // Build where clause
  const where: Prisma.ServiceWhereInput = {
    isActive: true,
    isPublished: true,
  };

  // Text search
  if (query) {
    where.OR = [
      { title: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
      { shortDescription: { contains: query, mode: 'insensitive' } },
    ];
  }

  // Category filter
  if (categoryId) {
    where.categories = {
      some: {
        id: categoryId,
      },
    };
  }

  // Tags filter
  if (tags.length > 0) {
    where.tags = {
      some: {
        slug: { in: tags },
      },
    };
  }

  // Price range filter
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.basePrice = {};
    if (minPrice !== undefined) {
      where.basePrice.gte = minPrice;
    }
    if (maxPrice !== undefined) {
      where.basePrice.lte = maxPrice;
    }
  }

  // Price type filter
  if (priceType) {
    where.priceType = priceType as any;
  }

  // Duration filter
  if (duration) {
    where.duration = duration;
  }

  // Build order by clause
  let orderBy: Prisma.ServiceOrderByWithRelationInput = {};
  switch (sortBy) {
    case 'price':
      orderBy = { basePrice: sortOrder };
      break;
    case 'rating':
      orderBy = { averageRating: sortOrder };
      break;
    case 'popularity':
      orderBy = { totalBookings: sortOrder };
      break;
    case 'newest':
      orderBy = { createdAt: sortOrder };
      break;
    default:
      orderBy = { totalBookings: 'desc' };
  }

  try {
    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        orderBy,
        skip,
        take: limit,
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
          categories: true,
          tags: true,
          _count: {
            select: {
              bookings: true,
              reviews: true,
            },
          },
        },
      }),
      prisma.service.count({ where }),
    ]);

    return {
      services,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + services.length < total,
    };
  } catch (error) {
    console.error('Error searching services:', error);
    throw new Error('Failed to search services');
  }
}

/**
 * Get featured services
 */
export async function getFeaturedServices(limit: number = 6) {
  try {
    const services = await prisma.service.findMany({
      where: {
        isActive: true,
        isPublished: true,
      },
      orderBy: [
        { averageRating: 'desc' },
        { totalBookings: 'desc' },
      ],
      take: limit,
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
        categories: true,
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    });

    return services;
  } catch (error) {
    console.error('Error getting featured services:', error);
    throw new Error('Failed to get featured services');
  }
}

/**
 * Get popular categories
 */
export async function getPopularCategories(limit: number = 8) {
  try {
    const categories = await prisma.serviceCategory.findMany({
      where: {
        parentId: null, // Only top-level categories
      },
      take: limit,
      include: {
        _count: {
          select: {
            services: true,
          },
        },
      },
      orderBy: {
        services: {
          _count: 'desc',
        },
      },
    });

    return categories;
  } catch (error) {
    console.error('Error getting popular categories:', error);
    throw new Error('Failed to get popular categories');
  }
}

/**
 * Get service recommendations for a user
 */
export async function getRecommendedServices(userId: string, limit: number = 6) {
  try {
    // Get user's booking history and wishlist
    const userBookings = await prisma.booking.findMany({
      where: { buyerId: userId },
      select: { serviceId: true },
    });

    const userWishlist = await prisma.wishlist.findMany({
      where: { userId },
      select: { serviceId: true },
    });

    const viewedServiceIds = [
      ...userBookings.map(b => b.serviceId),
      ...userWishlist.map(w => w.serviceId),
    ];

    // Get categories of services user has interacted with
    const interactedCategories = await prisma.service.findMany({
      where: {
        id: { in: viewedServiceIds },
      },
      select: {
        categories: {
          select: { id: true },
        },
      },
    });

    const categoryIds = interactedCategories.flatMap(
      s => s.categories.map(c => c.id)
    );

    // Find similar services in those categories
    const recommendations = await prisma.service.findMany({
      where: {
        isActive: true,
        isPublished: true,
        id: { notIn: viewedServiceIds },
        categories: {
          some: {
            id: { in: categoryIds },
          },
        },
      },
      orderBy: [
        { averageRating: 'desc' },
        { totalBookings: 'desc' },
      ],
      take: limit,
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
        categories: true,
      },
    });

    return recommendations;
  } catch (error) {
    console.error('Error getting recommended services:', error);
    throw new Error('Failed to get recommended services');
  }
}
