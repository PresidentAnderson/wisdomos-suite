/**
 * Authentication Middleware
 *
 * Validates JWT and attaches tenant context to request
 */

import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import { createTenantPrismaClient } from '@/lib/tenant/provisioning'

export interface AuthenticatedRequest extends NextApiRequest {
  user: {
    userId: string
    email: string
    tenantId: string
    tenantSchema: string
    role: string
  }
  prisma: ReturnType<typeof createTenantPrismaClient>
}

export interface JWTPayload {
  userId: string
  email: string
  tenantId: string
  tenantSchema: string
  role: string
}

export function authMiddleware(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Extract token from Authorization header
      const authHeader = req.headers.authorization
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No authorization token provided' })
      }

      const token = authHeader.substring(7)

      // Verify JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload

      // Attach user context to request
      const authenticatedReq = req as AuthenticatedRequest
      authenticatedReq.user = decoded

      // Create tenant-scoped Prisma client
      authenticatedReq.prisma = createTenantPrismaClient(decoded.tenantSchema)

      // Call the actual handler
      await handler(authenticatedReq, res)
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ error: 'Invalid token' })
      }
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ error: 'Token expired' })
      }

      console.error('[Auth Middleware] Error:', error)
      res.status(500).json({ error: 'Authentication failed' })
    }
  }
}
