import { NextRequest, NextResponse } from 'next/server'
import { getTenantPrismaClient, withTenant } from '@/lib/tenant/prisma-tenant-client'
import {
  generateToken,
  generateId,
  generateSlug,
  getDefaultPreferences,
  getAllPermissions,
  getDefaultTenantSettings,
  type User,
  type Tenant,
  type JWTPayload
} from '@/lib/auth'
import { hashPassword } from '@/lib/password-utils'

/**
 * POST /api/auth/register
 *
 * Creates a new user account and workspace (tenant)
 * This is a pure server-side API route that never crosses the client/server boundary
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, tenantName } = body

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: email, password, name' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    const prisma = getTenantPrismaClient()

    // Check if user already exists (email is not globally unique, only per-tenant)
    // So we use findFirst which works with the email index
    const existingUser = await prisma.user.findFirst({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Generate IDs and slug
    const userId = generateId()
    const tenantId = generateId()
    const slug = tenantName ? generateSlug(tenantName) : generateSlug(name)

    // Create tenant first (required for foreign key)
    const tenant = await prisma.tenant.create({
      data: {
        id: tenantId,
        name: tenantName || `${name}'s Workspace`,
        slug,
        plan: 'FREE',
        settings: getDefaultTenantSettings(tenantName || `${name}'s Workspace`)
      }
    })

    // Create user within tenant context
    const user = await withTenant(tenantId, async () => {
      return await prisma.user.create({
        data: {
          id: userId,
          email,
          name,
          tenantId,
          role: 'OWNER',
          isOwner: true,
          passwordHash: hashedPassword,
          createdAt: new Date()
        }
      })
    })

    // Generate JWT token
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      tenantId: tenant.id,
      role: user.role as any
    }

    const token = generateToken(payload)

    // Return user data and token
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        tenantId: user.tenantId,
        role: user.role,
        createdAt: user.createdAt
      },
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        plan: tenant.plan
      },
      token
    }, { status: 201 })

  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: error.message || 'Registration failed' },
      { status: 500 }
    )
  }
}
