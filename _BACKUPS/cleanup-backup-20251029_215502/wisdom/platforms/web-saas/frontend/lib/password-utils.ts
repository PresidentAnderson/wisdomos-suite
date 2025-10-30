/**
 * Simple password utilities for development
 * In production, use proper bcrypt on the server side
 */

export async function hashPassword(password: string): Promise<string> {
  // Simple hash for development - DO NOT USE IN PRODUCTION
  // In production, this should be done server-side with bcrypt
  const encoder = new TextEncoder()
  const data = encoder.encode(password + 'wisdomos-salt-dev')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password)
  return passwordHash === hash
}

// Fallback for older stored passwords (base64)
export function legacyHash(password: string): string {
  return btoa(password)
}

export function verifyLegacyPassword(password: string, hash: string): boolean {
  return legacyHash(password) === hash
}