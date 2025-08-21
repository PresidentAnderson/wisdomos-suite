import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'
import { z } from 'zod'

const LoginSchema = z.object({
  email: z.string().email(),
  name: z.string().optional()
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, name } = LoginSchema.parse(body)
    
    // Upsert user
    const user = await prisma.user.upsert({
      where: { email },
      update: { name: name || undefined },
      create: { email, name }
    })
    
    // Generate token
    const token = signToken({
      sub: user.id,
      email: user.email,
      name: user.name || undefined
    })
    
    return NextResponse.json({ 
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
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