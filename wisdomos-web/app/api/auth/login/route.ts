import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().optional()
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = LoginSchema.parse(body)
    
    // Handle demo login (no password required)
    if (email === 'demo@wisdomos.app' && !password) {
      // Create or get demo user
      const demoUser = await prisma.user.upsert({
        where: { email: 'demo@wisdomos.app' },
        update: {},
        create: { 
          email: 'demo@wisdomos.app', 
          name: 'Demo User',
          emailVerified: new Date()
        }
      })
      
      const token = jwt.sign(
        { sub: demoUser.id, email: demoUser.email, name: demoUser.name },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      )
      
      return NextResponse.json({ 
        token,
        user: {
          id: demoUser.id,
          email: demoUser.email,
          name: demoUser.name
        }
      })
    }
    
    // Regular login with password
    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      )
    }
    
    // Find user with auth
    const user = await prisma.user.findUnique({
      where: { email },
      include: { auth: true }
    })
    
    if (!user || !user.auth) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }
    
    // Verify password
    const validPassword = await bcrypt.compare(password, user.auth.hashedPassword)
    
    if (!validPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { sub: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )
    
    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified
      }
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }
    
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    )
  }
}