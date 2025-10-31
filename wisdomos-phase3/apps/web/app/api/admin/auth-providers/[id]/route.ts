import { NextRequest, NextResponse } from 'next/server'
import { getTenantPrismaClient } from '@/lib/tenant/prisma-tenant-client'

/**
 * GET /api/admin/auth-providers/[id]
 * Fetch a specific auth provider
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const prisma = getTenantPrismaClient()
    const { id } = params

    const provider = await prisma.$queryRawUnsafe(`
      SELECT * FROM auth_provider WHERE id = $1
    `, id)

    if (!provider || (provider as any[]).length === 0) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
    }

    return NextResponse.json({ provider: (provider as any[])[0] })

  } catch (error: any) {
    console.error('Error fetching auth provider:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch provider' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/auth-providers/[id]
 * Update specific fields of an auth provider (e.g., toggle enabled)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const prisma = getTenantPrismaClient()
    const { id } = params
    const body = await request.json()

    // Only allow specific fields to be patched
    const allowedFields = ['enabled']
    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates.push(`${field} = $${paramIndex}`)
        values.push(body[field])
        paramIndex++
      }
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    values.push(id)

    const query = `
      UPDATE auth_provider
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING *
    `

    const result = await prisma.$queryRawUnsafe(query, ...values)
    const provider = (result as any[])[0]

    if (!provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
    }

    return NextResponse.json({ provider })

  } catch (error: any) {
    console.error('Error updating auth provider:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update provider' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/auth-providers/[id]
 * Replace entire auth provider configuration
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const prisma = getTenantPrismaClient()
    const { id } = params
    const body = await request.json()

    // Build update query based on provider type
    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    // Common fields
    const fields: Record<string, any> = {
      enabled: body.enabled,
      client_id: body.clientId,
      client_secret: body.clientSecret,
      authorization_url: body.authorizationUrl,
      token_url: body.tokenUrl,
      user_info_url: body.userInfoUrl,
      redirect_uri: body.redirectUri,
      scopes: body.scopes ? JSON.stringify(body.scopes) : null,
      saml_entity_id: body.samlEntityId,
      saml_sso_url: body.samlSsoUrl,
      saml_certificate: body.samlCertificate,
      saml_issuer: body.samlIssuer,
      web3_chain_id: body.web3ChainId,
      web3_contract_address: body.web3ContractAddress,
      phone_provider: body.phoneProvider,
      metadata: body.metadata ? JSON.stringify(body.metadata) : '{}'
    }

    for (const [field, value] of Object.entries(fields)) {
      if (value !== undefined) {
        updates.push(`${field} = $${paramIndex}`)
        values.push(value)
        paramIndex++
      }
    }

    values.push(id)

    const query = `
      UPDATE auth_provider
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING *
    `

    const result = await prisma.$queryRawUnsafe(query, ...values)
    const provider = (result as any[])[0]

    if (!provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
    }

    return NextResponse.json({ provider })

  } catch (error: any) {
    console.error('Error updating auth provider config:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update provider configuration' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/auth-providers/[id]
 * Delete an auth provider configuration
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const prisma = getTenantPrismaClient()
    const { id } = params

    await prisma.$queryRawUnsafe(`
      DELETE FROM auth_provider WHERE id = $1
    `, id)

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Error deleting auth provider:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete provider' },
      { status: 500 }
    )
  }
}
