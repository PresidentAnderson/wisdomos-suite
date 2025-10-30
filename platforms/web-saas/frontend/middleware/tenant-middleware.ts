import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { TenantService } from '@/lib/tenant/tenant-service';

export interface TenantContext {
  tenantId: string;
  tenantSlug: string;
  userId?: string;
  userRole?: string;
}

/**
 * Extract tenant from subdomain or custom domain
 */
export async function extractTenant(request: NextRequest): Promise<string | null> {
  const host = request.headers.get('host') || '';
  
  // Check for custom domain first
  const customDomainTenant = await checkCustomDomain(host);
  if (customDomainTenant) {
    return customDomainTenant;
  }

  // Extract subdomain
  const subdomain = extractSubdomain(host);
  if (!subdomain || subdomain === 'www' || subdomain === 'app') {
    return null;
  }

  return subdomain;
}

/**
 * Extract subdomain from host
 */
function extractSubdomain(host: string): string | null {
  // Handle localhost development
  if (host.includes('localhost')) {
    // For development, you might use a header or query param
    return null;
  }

  const parts = host.split('.');
  if (parts.length >= 3) {
    return parts[0];
  }

  return null;
}

/**
 * Check if host is a custom domain
 */
async function checkCustomDomain(host: string): Promise<string | null> {
  // In production, query database for custom domains
  // For now, return null
  return null;
}

/**
 * Tenant isolation middleware
 */
export async function tenantMiddleware(request: NextRequest) {
  // Skip for static files and API routes that don't need tenant context
  const pathname = request.nextUrl.pathname;
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/public') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Extract tenant from request
  const tenantSlug = await extractTenant(request);
  
  // For main domain, redirect to marketing or login
  if (!tenantSlug && !pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Get tenant details
  if (tenantSlug) {
    const tenant = await TenantService.getTenantBySlug(tenantSlug);
    
    if (!tenant) {
      // Invalid tenant
      return NextResponse.redirect(new URL('/404', request.url));
    }

    // Check tenant status
    if (tenant.status === 'SUSPENDED') {
      return NextResponse.redirect(new URL('/suspended', request.url));
    }

    if (tenant.status === 'CANCELLED') {
      return NextResponse.redirect(new URL('/cancelled', request.url));
    }

    // Add tenant context to headers
    const response = NextResponse.next();
    response.headers.set('x-tenant-id', tenant.id);
    response.headers.set('x-tenant-slug', tenant.slug);
    response.headers.set('x-tenant-plan', tenant.plan);

    return response;
  }

  return NextResponse.next();
}