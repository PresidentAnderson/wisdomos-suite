import { NextRequest, NextResponse } from 'next/server'
import { getTenantPrismaClient } from '@/lib/tenant/prisma-tenant-client'
import {
  generateToken,
  type JWTPayload
} from '@/lib/auth'
import { verifyPassword, verifyLegacyPassword } from '@/lib/password-utils'

/**
 * POST /api/auth/login
 *
 * Authenticates a user and returns a JWT token
 * This is a pure server-side API route that never crosses the client/server boundary
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, tenantSlug } = body

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields: email, password' },
        { status: 400 }
      )
    }

    const prisma = getTenantPrismaClient()

    // Find user by email (email is not globally unique, only per-tenant)
    // So we use findFirst which works with the email index
    const user = await prisma.user.findFirst({
      where: { email },
      include: {
        tenant: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify password
    let isValid = false
    if (user.passwordHash) {
      // Try modern hash first
      isValid = await verifyPassword(password, user.passwordHash)

      // If modern hash fails, try legacy format
      if (!isValid) {
        isValid = verifyLegacyPassword(password, user.passwordHash)
      }
    }

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // If tenantSlug is provided, verify it matches user's tenant
    if (tenantSlug && tenantSlug !== user.tenant.slug) {
      return NextResponse.json(
        { error: 'Access denied to this workspace' },
        { status: 403 }
      )
    }

    const targetTenant = user.tenant

    // Update last login time
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })

    // Generate JWT token
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      tenantId: targetTenant.id,
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
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt
      },
      tenant: {
        id: targetTenant.id,
        name: targetTenant.name,
        slug: targetTenant.slug,
        plan: targetTenant.plan
      },
      token
    }, { status: 200 })

  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: error.message || 'Authentication failed' },
      { status: 500 }
    )
  }
}
