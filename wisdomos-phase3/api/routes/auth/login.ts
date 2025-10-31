/**
 * User Login Route
 *
 * Authenticates user and returns JWT with tenant context
 */

import { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Validate input
    const { email, password } = loginSchema.parse(req.body)

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        tenants: {
          include: {
            tenant: true
          }
        }
      }
    })

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.passwordHash)
    if (!passwordValid) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })

    // Get primary tenant (first one or owner role)
    const primaryTenant = user.tenants.find(t => t.role === 'OWNER') || user.tenants[0]

    if (!primaryTenant) {
      return res.status(500).json({ error: 'No tenant found for user' })
    }

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        tenantId: primaryTenant.tenantId,
        tenantSchema: primaryTenant.tenant.schemaName,
        role: primaryTenant.role
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      },
      tenants: user.tenants.map(t => ({
        id: t.tenant.id,
        name: t.tenant.name,
        role: t.role,
        schemaName: t.tenant.schemaName
      })),
      token
    })
  } catch (error) {
    console.error('[Auth] Login error:', error)

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      })
    }

    res.status(500).json({
      error: 'Login failed'
    })
  }
}
