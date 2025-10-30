import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { getTenantPrismaClient, withTenant } from './prisma-tenant-client';

interface ApiTenantContext {
  tenantId: string;
  userId: string;
  userRole: string;
}

/**
 * Get tenant context from request headers (set by middleware)
 */
export function getTenantFromHeaders(request: NextRequest): string | null {
  return request.headers.get('x-tenant-id');
}

/**
 * Get authenticated user and tenant context for API routes
 */
export async function getApiContext(request: NextRequest): Promise<ApiTenantContext | null> {
  try {
    // Get tenant ID from headers (set by middleware)
    const tenantId = getTenantFromHeaders(request);
    if (!tenantId) {
      return null;
    }

    // Get user session
    const session = await getServerSession();
    if (!session?.user?.email) {
      return null;
    }

    // Verify user belongs to tenant
    const prisma = getTenantPrismaClient();
    const user = await withTenant(tenantId, async () => {
      return await prisma.user.findFirst({
        where: {
          email: session.user.email!,
          tenantId: tenantId,
        },
        select: {
          id: true,
          role: true,
        },
      });
    });

    if (!user) {
      return null;
    }

    return {
      tenantId,
      userId: user.id,
      userRole: user.role,
    };
  } catch (error) {
    console.error('Error getting API context:', error);
    return null;
  }
}

/**
 * Wrapper for API route handlers with tenant context
 */
export function withTenantApi<T = any>(
  handler: (
    request: NextRequest,
    context: ApiTenantContext
  ) => Promise<Response>
) {
  return async (request: NextRequest): Promise<Response> => {
    const context = await getApiContext(request);
    
    if (!context) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Run handler with tenant context
    return withTenant(context.tenantId, () => handler(request, context));
  };
}