/**
 * User Registration Route
 *
 * Creates new user + tenant with complete provisioning:
 * 1. Validate input
 * 2. Create user in public schema
 * 3. Hash password
 * 4. Provision tenant (schema + tables + seed data)
 * 5. Create user-tenant relationship
 * 6. Return JWT with tenant context
 */

import { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import { provisionTenant } from '@/lib/tenant/provisioning'

const prisma = new PrismaClient()

// Validation schema
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name required').optional(),
  lastName: z.string().optional(),
  workspaceName: z.string().min(1, 'Workspace name required')
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
    const data = registerSchema.parse(req.body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    })

    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10)

    // Create user in public schema
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName
      }
    })

    console.log(`[Auth] Created user: ${user.id}`)

    // Provision tenant (creates schema, tables, seeds data)
    const tenantResult = await provisionTenant(
      user.id,
      data.workspaceName
    )

    if (!tenantResult.success) {
      // Rollback user creation
      await prisma.user.delete({ where: { id: user.id } })
      throw new Error(tenantResult.error || 'Tenant provisioning failed')
    }

    console.log(`[Auth] Provisioned tenant: ${tenantResult.tenantId}`)

    // Create user-tenant relationship
    await prisma.userTenant.create({
      data: {
        userId: user.id,
        tenantId: tenantResult.tenantId,
        role: 'OWNER'
      }
    })

    // Generate JWT with tenant context
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        tenantId: tenantResult.tenantId,
        tenantSchema: tenantResult.schemaName,
        role: 'OWNER'
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    // Return success response
    res.status(201).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      },
      tenant: {
        id: tenantResult.tenantId,
        name: data.workspaceName,
        schemaName: tenantResult.schemaName
      },
      token
    })
  } catch (error) {
    console.error('[Auth] Registration error:', error)

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      })
    }

    res.status(500).json({
      error: error instanceof Error ? error.message : 'Registration failed'
    })
  }
}
