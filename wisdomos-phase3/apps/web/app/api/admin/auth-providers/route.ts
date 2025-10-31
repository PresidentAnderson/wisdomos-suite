import { NextRequest, NextResponse } from 'next/server'
import { getTenantPrismaClient } from '@/lib/tenant/prisma-tenant-client'

/**
 * GET /api/admin/auth-providers
 * Fetch all auth providers for the current tenant
 */
export async function GET(request: NextRequest) {
  try {
    const prisma = getTenantPrismaClient()

    // TODO: Add authentication check to ensure user is admin
    // const { userId, tenantId, role } = await verifyAuth(request)
    // if (role !== 'OWNER' && role !== 'ADMIN') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    // }

    // For now, get first tenant (in production, use authenticated tenant)
    const tenant = await prisma.tenant.findFirst()
    if (!tenant) {
      return NextResponse.json({ error: 'No tenant found' }, { status: 404 })
    }

    // Fetch all providers for this tenant
    const providers = await prisma.$queryRawUnsafe(`
      SELECT * FROM auth_provider
      WHERE tenant_id = $1
      ORDER BY display_order ASC, provider_name ASC
    `, tenant.id)

    return NextResponse.json({
      providers,
      tenantId: tenant.id
    })

  } catch (error: any) {
    console.error('Error fetching auth providers:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch providers' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/auth-providers
 * Create a new auth provider configuration
 */
export async function POST(request: NextRequest) {
  try {
    const prisma = getTenantPrismaClient()
    const body = await request.json()

    const {
      providerKey,
      providerName,
      providerType,
      enabled = false,
      ...config
    } = body

    // Validation
    if (!providerKey || !providerName || !providerType) {
      return NextResponse.json(
        { error: 'Missing required fields: providerKey, providerName, providerType' },
        { status: 400 }
      )
    }

    // Get tenant (in production, use authenticated tenant)
    const tenant = await prisma.tenant.findFirst()
    if (!tenant) {
      return NextResponse.json({ error: 'No tenant found' }, { status: 404 })
    }

    // Create provider
    const provider = await prisma.$queryRawUnsafe(`
      INSERT INTO auth_provider (
        id, tenant_id, provider_key, provider_name, provider_type, enabled,
        client_id, client_secret, authorization_url, token_url, user_info_url,
        redirect_uri, scopes, metadata
      )
      VALUES (
        gen_random_uuid()::text, $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10, $11, $12, $13
      )
      RETURNING *
    `,
      tenant.id,
      providerKey,
      providerName,
      providerType,
      enabled,
      config.clientId || null,
      config.clientSecret || null,
      config.authorizationUrl || null,
      config.tokenUrl || null,
      config.userInfoUrl || null,
      config.redirectUri || null,
      config.scopes ? JSON.stringify(config.scopes) : null,
      config.metadata ? JSON.stringify(config.metadata) : '{}'
    )

    return NextResponse.json({ provider }, { status: 201 })

  } catch (error: any) {
    console.error('Error creating auth provider:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create provider' },
      { status: 500 }
    )
  }
}
