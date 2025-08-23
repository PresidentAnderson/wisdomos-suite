import { Resend } from 'resend'

// Initialize Resend only if API key is available
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

interface EmailOptions {
  to: string
  subject: string
  html: string
  from?: string
}

export async function sendEmail({ to, subject, html, from = 'WisdomOS <noreply@wisdomos.app>' }: EmailOptions) {
  try {
    if (!resend) {
      console.warn('Email service not configured. Skipping email send.')
      console.log('Would send email to:', to)
      console.log('Subject:', subject)
      return { success: false, error: 'Email service not configured' }
    }
    
    const data = await resend.emails.send({
      from,
      to,
      subject,
      html
    })
    
    return { success: true, data }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error }
  }
}

export async function sendVerificationEmail(email: string, token: string, name: string) {
  const verifyLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify-email?token=${token}`
  
  return sendEmail({
    to: email,
    subject: 'Verify your WisdomOS email',
    html: emailTemplates.welcome(name, verifyLink)
  })
}

export async function sendPasswordResetEmail(email: string, token: string, name: string) {
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`
  
  return sendEmail({
    to: email,
    subject: 'Reset your WisdomOS password',
    html: emailTemplates.passwordReset(name, resetLink)
  })
}

export const emailTemplates = {
  welcome: (name: string, verifyLink: string) => `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to WisdomOS!</h1>
          </div>
          <div class="content">
            <h2>Hi ${name},</h2>
            <p>Thank you for joining WisdomOS - your personal growth operating system.</p>
            <p>Please verify your email address to get started:</p>
            <center>
              <a href="${verifyLink}" class="button">Verify Email</a>
            </center>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #667eea;">${verifyLink}</p>
            <p>This link will expire in 24 hours.</p>
            <br>
            <p>Best regards,<br>The WisdomOS Team</p>
          </div>
          <div class="footer">
            <p>© 2024 WisdomOS. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `,
  
  passwordReset: (name: string, resetLink: string) => `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hi ${name || 'there'},</h2>
            <p>We received a request to reset your password for WisdomOS.</p>
            <p>Click the button below to reset your password:</p>
            <center>
              <a href="${resetLink}" class="button">Reset Password</a>
            </center>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #667eea;">${resetLink}</p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <br>
            <p>Best regards,<br>The WisdomOS Team</p>
          </div>
          <div class="footer">
            <p>© 2024 WisdomOS. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `,
  
  weeklyInsights: (name: string, stats: any) => `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .stat-box { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #667eea; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Weekly WisdomOS Insights</h1>
          </div>
          <div class="content">
            <h2>Hi ${name},</h2>
            <p>Here's your weekly progress summary:</p>
            
            <div class="stat-box">
              <strong>🔥 Streak:</strong> ${stats.streak} days
            </div>
            
            <div class="stat-box">
              <strong>📝 Journal Entries:</strong> ${stats.journalEntries} this week
            </div>
            
            <div class="stat-box">
              <strong>🎯 Goals Completed:</strong> ${stats.goalsCompleted}
            </div>
            
            <div class="stat-box">
              <strong>💭 Most Common Mood:</strong> ${stats.topMood}
            </div>
            
            <center>
              <a href="${process.env.NEXT_PUBLIC_URL}/analytics" class="button">View Full Analytics</a>
            </center>
            
            <p>Keep up the great work on your personal growth journey!</p>
            
            <br>
            <p>Best regards,<br>The WisdomOS Team</p>
          </div>
        </div>
      </body>
    </html>
  `
}