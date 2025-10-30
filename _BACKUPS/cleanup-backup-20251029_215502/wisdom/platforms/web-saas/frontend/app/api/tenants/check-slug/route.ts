import { NextRequest, NextResponse } from 'next/server';
import { TenantService } from '@/lib/tenant/tenant-service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug parameter is required' },
        { status: 400 }
      );
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        { 
          available: false,
          error: 'Slug can only contain lowercase letters, numbers, and hyphens'
        },
        { status: 400 }
      );
    }

    // Check if slug is reserved
    const reservedSlugs = ['www', 'app', 'api', 'admin', 'dashboard', 'auth', 'login', 'signup'];
    if (reservedSlugs.includes(slug)) {
      return NextResponse.json({
        available: false,
        error: 'This URL is reserved',
      });
    }

    // Check if slug is already taken
    const existingTenant = await TenantService.getTenantBySlug(slug);
    
    return NextResponse.json({
      available: !existingTenant,
    });
  } catch (error) {
    console.error('Error checking slug:', error);
    return NextResponse.json(
      { error: 'Failed to check slug availability' },
      { status: 500 }
    );
  }
}