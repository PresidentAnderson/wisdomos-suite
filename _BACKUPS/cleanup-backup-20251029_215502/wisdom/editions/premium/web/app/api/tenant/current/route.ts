import { NextRequest, NextResponse } from 'next/server';
import { withTenantApi } from '@/lib/tenant/api-tenant-context';
import { TenantService } from '@/lib/tenant/tenant-service';

export const GET = withTenantApi(async (request: NextRequest, context) => {
  try {
    const tenant = await TenantService.getTenantWithUsage(context.tenantId);
    
    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: tenant.id,
      slug: tenant.slug,
      name: tenant.name,
      plan: tenant.plan,
      features: tenant.features,
      usage: {
        users: tenant.userCount,
        maxUsers: tenant.maxUsers,
        storage: tenant.storageUsed,
        maxStorage: tenant.storageLimit,
      },
    });
  } catch (error) {
    console.error('Error fetching tenant:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tenant information' },
      { status: 500 }
    );
  }
});