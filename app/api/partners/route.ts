import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { sendEmail } from '@/lib/email'

const prisma = new PrismaClient()

// GET - Fetch user's accountability partners
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { sub: string }
    const userId = decoded.sub

    // For demo purposes, return sample partners
    // In production, this would query a partnership table
    const partners = [
      {
        id: '1',
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        avatar: '👩',
        status: 'active',
        sharedGoals: 3,
        lastCheckIn: new Date(Date.now() - 86400000),
        mutualStreak: 7,
        supportScore: 85
      },
      {
        id: '2',
        name: 'Mike Chen',
        email: 'mike@example.com',
        avatar: '👨',
        status: 'pending',
        sharedGoals: 0,
        lastCheckIn: null,
        mutualStreak: 0,
        supportScore: 0
      }
    ]

    const invitations = [
      {
        id: '3',
        from: 'Emma Wilson',
        email: 'emma@example.com',
        message: 'Let&apos;s work on our fitness goals together!',
        sentAt: new Date(Date.now() - 172800000)
      }
    ]

    return NextResponse.json({
      partners,
      invitations,
      stats: {
        totalPartners: partners.filter(p => p.status === 'active').length,
        pendingInvites: invitations.length,
        averageSupport: partners
          .filter(p => p.status === 'active')
          .reduce((sum, p) => sum + p.supportScore, 0) / 
          partners.filter(p => p.status === 'active').length || 0
      }
    })
  } catch (error) {
    console.error('Partners error:', error)
    return NextResponse.json({ error: 'Failed to fetch partners' }, { status: 500 })
  }
}

// POST - Send partnership invitation
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { sub: string }
    const userId = decoded.sub

    const { email, message, sharedGoals } = await request.json()

    // Get inviting user's details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create invitation record (in production)
    const invitation = {
      id: crypto.randomUUID(),
      fromUserId: userId,
      toEmail: email,
      message,
      sharedGoals,
      status: 'pending',
      createdAt: new Date()
    }

    // Send invitation email
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/accept-invite?token=${invitation.id}`
    
    await sendEmail({
      to: email,
      subject: `${user.name} wants to be your accountability partner on WisdomOS`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .message-box { background: white; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>You&apos;ve Been Invited!</h1>
              </div>
              <div class="content">
                <h2>Hi there!</h2>
                <p><strong>${user.name}</strong> wants to be your accountability partner on WisdomOS.</p>
                
                ${message ? `
                  <div class="message-box">
                    <p><strong>Personal message:</strong></p>
                    <p>${message}</p>
                  </div>
                ` : ''}
                
                <p>As accountability partners, you&apos;ll be able to:</p>
                <ul>
                  <li>Share and track goals together</li>
                  <li>Celebrate achievements and milestones</li>
                  <li>Provide mutual support and encouragement</li>
                  <li>Stay motivated with shared progress tracking</li>
                </ul>
                
                <center>
                  <a href="${inviteLink}" class="button">Accept Invitation</a>
                </center>
                
                <p>Or copy this link: ${inviteLink}</p>
                
                <p>Join WisdomOS and start your personal growth journey together!</p>
              </div>
            </div>
          </body>
        </html>
      `
    })

    return NextResponse.json({
      success: true,
      invitation
    })
  } catch (error) {
    console.error('Invite error:', error)
    return NextResponse.json({ error: 'Failed to send invitation' }, { status: 500 })
  }
}

// PUT - Accept or decline invitation
export async function PUT(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { invitationId, action } = await request.json()

    if (action === 'accept') {
      // Create partnership record
      // Update invitation status
      return NextResponse.json({
        success: true,
        message: 'Partnership established!'
      })
    } else if (action === 'decline') {
      // Update invitation status
      return NextResponse.json({
        success: true,
        message: 'Invitation declined'
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Accept/decline error:', error)
    return NextResponse.json({ error: 'Failed to process invitation' }, { status: 500 })
  }
}

// DELETE - Remove partnership
export async function DELETE(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const partnerId = searchParams.get('partnerId')

    if (!partnerId) {
      return NextResponse.json({ error: 'Partner ID required' }, { status: 400 })
    }

    // Remove partnership record
    // In production, update database

    return NextResponse.json({
      success: true,
      message: 'Partnership removed'
    })
  } catch (error) {
    console.error('Remove partner error:', error)
    return NextResponse.json({ error: 'Failed to remove partner' }, { status: 500 })
  }
}