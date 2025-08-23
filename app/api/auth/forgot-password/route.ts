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
      
      // Send email with reset link
      const resetLink = `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`
      
      if (process.env.RESEND_API_KEY) {
        const { sendEmail, emailTemplates } = await import('@/lib/email')
        await sendEmail({
          to: email,
          subject: 'Password Reset - WisdomOS',
          html: emailTemplates.passwordReset(user.name || '', resetLink)
        })
      } else {
        // Fallback for development
        console.log(`Reset link: ${resetLink}`)
      }
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