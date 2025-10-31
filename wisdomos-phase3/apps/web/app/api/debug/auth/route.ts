import { NextRequest, NextResponse } from 'next/server'
import { getTenantPrismaClient } from '@/lib/tenant/prisma-tenant-client'

/**
 * GET /api/debug/auth?email=xxx
 *
 * Diagnostic endpoint to check if a user exists in the database
 * WARNING: This should be removed or protected in production
 */
export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Debug endpoints are disabled in production' },
      { status: 403 }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      )
    }

    const prisma = getTenantPrismaClient()

    // Check if user exists
    const user = await prisma.user.findFirst({
      where: { email },
      include: {
        tenant: true
      }
    })

    if (!user) {
      // Check total users in database
      const totalUsers = await prisma.user.count()
      const allUsers = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          tenantId: true,
          createdAt: true
        },
        take: 10,
        orderBy: { createdAt: 'desc' }
      })

      return NextResponse.json({
        found: false,
        message: 'User not found',
        searchedEmail: email,
        totalUsersInDatabase: totalUsers,
        recentUsers: allUsers.map(u => ({
          email: u.email,
          name: u.name,
          createdAt: u.createdAt
        })),
        diagnostic: {
          possibleIssues: [
            'User registration may have failed',
            'Email case sensitivity mismatch',
            'User was created in different tenant context',
            'Database connection issue during registration'
          ],
          nextSteps: [
            'Check registration API logs',
            'Verify DATABASE_URL environment variable',
            'Try registering again with different email',
            'Check Prisma schema is up to date (run: npx prisma generate)'
          ]
        }
      })
    }

    // User found - return detailed info
    return NextResponse.json({
      found: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        tenantId: user.tenantId,
        role: user.role,
        isOwner: user.isOwner,
        dateOfBirth: user.dateOfBirth,
        hasPassword: !!user.passwordHash,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      tenant: {
        id: user.tenant.id,
        name: user.tenant.name,
        slug: user.tenant.slug,
        plan: user.tenant.plan,
        status: user.tenant.status
      },
      diagnostic: {
        status: 'OK',
        message: 'User exists and is properly configured',
        canLogin: !!user.passwordHash
      }
    })

  } catch (error: any) {
    console.error('Debug auth error:', error)
    return NextResponse.json(
      {
        error: 'Database query failed',
        details: error.message,
        diagnostic: {
          possibleIssues: [
            'Database connection issue',
            'Prisma client not generated',
            'DATABASE_URL not configured'
          ],
          nextSteps: [
            'Check DATABASE_URL in .env',
            'Run: npx prisma generate',
            'Run: npx prisma db push',
            'Check database is accessible'
          ]
        }
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/debug/auth/test-registration
 *
 * Test registration flow without actually creating an account
 */
export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Debug endpoints are disabled in production' },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const { email, password, name, dateOfBirth } = body

    const diagnostics: any = {
      validations: {},
      databaseConnection: false,
      prismaGenerated: false,
      recommendations: []
    }

    // Validate inputs
    diagnostics.validations.email = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    diagnostics.validations.password = password && password.length >= 8
    diagnostics.validations.name = !!name
    diagnostics.validations.dateOfBirth = dateOfBirth ? !isNaN(new Date(dateOfBirth).getTime()) : true

    const allValid = Object.values(diagnostics.validations).every(v => v === true)

    if (!allValid) {
      diagnostics.recommendations.push('Fix validation errors before attempting registration')
      return NextResponse.json({
        canRegister: false,
        diagnostics
      })
    }

    // Test database connection
    const prisma = getTenantPrismaClient()

    try {
      await prisma.$queryRaw`SELECT 1`
      diagnostics.databaseConnection = true
    } catch (error) {
      diagnostics.databaseConnection = false
      diagnostics.recommendations.push('Database connection failed - check DATABASE_URL')
    }

    // Check if Prisma client is generated
    try {
      const userCount = await prisma.user.count()
      diagnostics.prismaGenerated = true
      diagnostics.currentUserCount = userCount
    } catch (error) {
      diagnostics.prismaGenerated = false
      diagnostics.recommendations.push('Run: npx prisma generate')
    }

    // Check if email already exists
    if (diagnostics.prismaGenerated) {
      const existingUser = await prisma.user.findFirst({
        where: { email }
      })

      diagnostics.emailAvailable = !existingUser

      if (existingUser) {
        diagnostics.recommendations.push(`Email ${email} already registered`)
      }
    }

    const canRegister = diagnostics.databaseConnection &&
                       diagnostics.prismaGenerated &&
                       diagnostics.emailAvailable

    return NextResponse.json({
      canRegister,
      diagnostics,
      message: canRegister
        ? 'All checks passed - registration should work'
        : 'Issues detected - see recommendations'
    })

  } catch (error: any) {
    console.error('Test registration error:', error)
    return NextResponse.json(
      {
        canRegister: false,
        error: error.message,
        diagnostics: {
          recommendations: [
            'Check database connection',
            'Verify Prisma schema is up to date',
            'Check server logs for detailed errors'
          ]
        }
      },
      { status: 500 }
    )
  }
}
