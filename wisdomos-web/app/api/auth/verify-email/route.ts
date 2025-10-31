import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { sendVerificationEmail } from '@/lib/email'

const prisma = new PrismaClient()

// POST - Send verification email
export async function POST(request: Request) {
  try {
    const { userId } = await request.json()
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { auth: true }
    })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    if (user.emailVerified) {
      return NextResponse.json({ message: 'Email already verified' })
    }
    
    // Generate verification token
    const verifyToken = crypto.randomUUID()
    const verifyTokenExpiry = new Date(Date.now() + 86400000) // 24 hours
    
    // Update or create auth record
    if (user.auth) {
      await prisma.auth.update({
        where: { userId: user.id },
        data: {
          verifyToken,
          verifyTokenExpiry
        }
      })
    } else {
      await prisma.auth.create({
        data: {
          userId: user.id,
          hashedPassword: '', // Will be set when user sets password
          verifyToken,
          verifyTokenExpiry
        }
      })
    }
    
    // Send verification email
    await sendVerificationEmail(user.email, verifyToken, user.name || 'User')
    
    return NextResponse.json({ 
      message: 'Verification email sent' 
    })
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 })
  }
}

// GET - Verify email with token
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    
    if (!token) {
      return NextResponse.json({ error: 'Verification token is required' }, { status: 400 })
    }
    
    // Find auth record by verification token
    const auth = await prisma.auth.findUnique({
      where: { verifyToken: token },
      include: { user: true }
    })
    
    if (!auth) {
      return NextResponse.json({ error: 'Invalid verification token' }, { status: 400 })
    }
    
    // Check if token is expired
    if (!auth.verifyTokenExpiry || auth.verifyTokenExpiry < new Date()) {
      return NextResponse.json({ error: 'Verification token has expired' }, { status: 400 })
    }
    
    // Update user as verified and clear token
    await prisma.$transaction([
      prisma.user.update({
        where: { id: auth.userId },
        data: {
          emailVerified: new Date()
        }
      }),
      prisma.auth.update({
        where: { id: auth.id },
        data: {
          verifyToken: null,
          verifyTokenExpiry: null
        }
      })
    ])
    
    return NextResponse.json({ 
      message: 'Email verified successfully',
      verified: true
    })
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json({ error: 'Failed to verify email' }, { status: 500 })
  }
}