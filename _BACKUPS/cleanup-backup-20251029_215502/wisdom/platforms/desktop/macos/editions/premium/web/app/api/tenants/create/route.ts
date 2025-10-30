import { NextRequest, NextResponse } from 'next/server';
import { TenantService } from '@/lib/tenant/tenant-service';
import { TenantPlan } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, ownerEmail, ownerPassword, ownerName, plan } = body;

    // Validate required fields
    if (!name || !slug || !ownerEmail || !ownerPassword) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate password length
    if (ownerPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        { error: 'Slug can only contain lowercase letters, numbers, and hyphens' },
        { status: 400 }
      );
    }

    // Create the tenant
    const result = await TenantService.createTenant({
      name,
      slug,
      ownerEmail,
      ownerPassword,
      ownerName,
      plan: plan || TenantPlan.FREE,
    });

    // Generate the login URL for the new tenant
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const domain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'localhost:3000';
    const loginUrl = `${protocol}://${slug}.${domain}/auth/login`;

    return NextResponse.json({
      success: true,
      tenant: {
        id: result.tenant.id,
        name: result.tenant.name,
        slug: result.tenant.slug,
        plan: result.tenant.plan,
      },
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
      },
      loginUrl,
    });
  } catch (error: any) {
    console.error('Error creating tenant:', error);
    
    if (error.message === 'Tenant slug already exists') {
      return NextResponse.json(
        { error: 'This workspace URL is already taken' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create tenant' },
      { status: 500 }
    );
  }
}