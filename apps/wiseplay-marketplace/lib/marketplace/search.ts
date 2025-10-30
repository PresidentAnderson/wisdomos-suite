import { ServiceType, ServiceStatus, Prisma } from '@prisma/client';
import { prisma } from './db';

export interface SearchFilters {
  query?: string;
  type?: ServiceType;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  featured?: boolean;
  providerId?: string;
}

export interface SearchOptions {
  page?: number;
  limit?: number;
  sortBy?: 'price' | 'rating' | 'bookings' | 'recent';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Search services with filters
 */
export async function searchServices(
  filters: SearchFilters = {},
  options: SearchOptions = {}
) {
  const {
    query,
    type,
    categoryId,
    minPrice,
    maxPrice,
    tags,
    featured,
    providerId,
  } = filters;

  const {
    page = 1,
    limit = 20,
    sortBy = 'recent',
    sortOrder = 'desc',
  } = options;

  const skip = (page - 1) * limit;

  // Build where clause
  const where: Prisma.ServiceWhereInput = {
    status: ServiceStatus.ACTIVE,
    ...(query && {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { shortDescription: { contains: query, mode: 'insensitive' } },
      ],
    }),
    ...(type && { type }),
    ...(categoryId && { categoryId }),
    ...(minPrice !== undefined && { price: { gte: minPrice } }),
    ...(maxPrice !== undefined && { price: { lte: maxPrice } }),
    ...(featured !== undefined && { featured }),
    ...(providerId && { providerId }),
    ...(tags && tags.length > 0 && {
      tags: {
        some: {
          slug: { in: tags },
        },
      },
    }),
  };

  // Build orderBy clause
  const orderBy: Prisma.ServiceOrderByWithRelationInput =
    sortBy === 'price' ? { price: sortOrder } :
    sortBy === 'rating' ? { averageRating: sortOrder } :
    sortBy === 'bookings' ? { bookingCount: sortOrder } :
    { createdAt: sortOrder };

  const [services, total] = await Promise.all([
    prisma.service.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        provider: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
            averageRating: true,
            totalReviews: true,
            isVerified: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    }),
    prisma.service.count({ where }),
  ]);

  return {
    services,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get featured services
 */
export async function getFeaturedServices(limit: number = 8) {
  return prisma.service.findMany({
    where: {
      status: ServiceStatus.ACTIVE,
      featured: true,
    },
    take: limit,
    orderBy: {
      bookingCount: 'desc',
    },
    include: {
      provider: {
        select: {
          id: true,
          displayName: true,
          avatarUrl: true,
          averageRating: true,
          isVerified: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });
}

/**
 * Get service by ID or slug
 */
export async function getService(idOrSlug: string) {
  return prisma.service.findFirst({
    where: {
      OR: [
        { id: idOrSlug },
        { slug: idOrSlug },
      ],
    },
    include: {
      provider: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
      category: true,
      tags: true,
      reviews: {
        where: { isPublished: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          reviewer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
      },
    },
  });
}

/**
 * Get all service categories
 */
export async function getCategories() {
  return prisma.serviceCategory.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      order: 'asc',
    },
    include: {
      _count: {
        select: {
          services: true,
        },
      },
    },
  });
}

/**
 * Get popular tags
 */
export async function getPopularTags(limit: number = 20) {
  return prisma.serviceTag.findMany({
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
}
