import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

export interface JWTPayload {
  sub: string
  email: string
  name?: string
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload
}

export async function getUser(req: NextRequest): Promise<JWTPayload | null> {
  try {
    const authorization = req.headers.get('authorization')
    if (!authorization?.startsWith('Bearer ')) {
      return null
    }
    
    const token = authorization.slice('Bearer '.length)
    return verifyToken(token)
  } catch {
    return null
  }
}