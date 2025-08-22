import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const ForgotPasswordSchema = z.object({
  email: z.string().email()
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email } = ForgotPasswordSchema.parse(body)
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: { auth: true }
    })
    
    if (user && user.auth) {
      // Generate reset token
      const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
      
      // Update auth with reset token
      await prisma.auth.update({
        where: { userId: user.id },
        data: {
          resetToken,
          resetTokenExpiry
        }
      })
      
      // In production, send email with reset link
      // For now, log the reset link
      console.log(`Reset link: ${process.env.NEXT_PUBLIC_URL}/reset-password?token=${resetToken}`)
      
      // TODO: Send email using service like SendGrid, Resend, etc.
      // await sendEmail({
      //   to: email,
      //   subject: 'Password Reset - WisdomOS',
      //   html: `Click here to reset your password: ${resetLink}`
      // })
    }
    
    // Always return success to prevent email enumeration
    return NextResponse.json({
      message: 'If an account exists with this email, you will receive reset instructions.'
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }
    
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}