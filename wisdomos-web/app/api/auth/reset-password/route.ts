import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { sendPasswordResetEmail } from '@/lib/email'

const prisma = new PrismaClient()

// POST - Request password reset
export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: { auth: true }
    })
    
    if (!user) {
      // Don't reveal if user exists
      return NextResponse.json({ 
        message: 'If an account exists with this email, you will receive a password reset link.' 
      })
    }
    
    // Generate reset token
    const resetToken = crypto.randomUUID()
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour
    
    // Update or create auth record
    if (user.auth) {
      await prisma.auth.update({
        where: { userId: user.id },
        data: {
          resetToken,
          resetTokenExpiry
        }
      })
    } else {
      await prisma.auth.create({
        data: {
          userId: user.id,
          hashedPassword: '', // Will be set when password is reset
          resetToken,
          resetTokenExpiry
        }
      })
    }
    
    // Send reset email
    await sendPasswordResetEmail(user.email, resetToken, user.name || 'User')
    
    return NextResponse.json({ 
      message: 'If an account exists with this email, you will receive a password reset link.' 
    })
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}

// PUT - Reset password with token
export async function PUT(request: Request) {
  try {
    const { token, password } = await request.json()
    
    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 })
    }
    
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }
    
    // Find auth record by reset token
    const auth = await prisma.auth.findUnique({
      where: { resetToken: token },
      include: { user: true }
    })
    
    if (!auth) {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 })
    }
    
    // Check if token is expired
    if (!auth.resetTokenExpiry || auth.resetTokenExpiry < new Date()) {
      return NextResponse.json({ error: 'Reset token has expired' }, { status: 400 })
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Update password and clear reset token
    await prisma.auth.update({
      where: { id: auth.id },
      data: {
        hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    })
    
    return NextResponse.json({ 
      message: 'Password has been reset successfully' 
    })
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 })
  }
}