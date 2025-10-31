import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

// GET - Fetch user notifications
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { sub: string }
    const userId = decoded.sub

    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unread') === 'true'

    // For now, generate sample notifications
    // In production, these would come from a notifications table
    const notifications = [
      {
        id: '1',
        type: 'goal_reminder',
        title: 'Goal Check-in',
        message: 'You have 3 goals due this week',
        read: false,
        createdAt: new Date(Date.now() - 3600000),
        icon: '🎯',
        actionUrl: '/goals'
      },
      {
        id: '2',
        type: 'streak_milestone',
        title: 'Streak Milestone!',
        message: 'You&apos;ve maintained your meditation habit for 7 days!',
        read: false,
        createdAt: new Date(Date.now() - 7200000),
        icon: '🔥',
        actionUrl: '/habits'
      },
      {
        id: '3',
        type: 'weekly_review',
        title: 'Weekly Review Ready',
        message: 'Your weekly insights are ready to view',
        read: true,
        createdAt: new Date(Date.now() - 86400000),
        icon: '📊',
        actionUrl: '/insights'
      }
    ]

    const filtered = unreadOnly ? notifications.filter(n => !n.read) : notifications

    return NextResponse.json({
      notifications: filtered,
      unreadCount: notifications.filter(n => !n.read).length
    })
  } catch (error) {
    console.error('Notifications error:', error)
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}

// POST - Create a new notification
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { sub: string }
    const userId = decoded.sub

    const { type, title, message, icon, actionUrl } = await request.json()

    const notification = {
      id: crypto.randomUUID(),
      type,
      title,
      message,
      icon: icon || '🔔',
      actionUrl,
      read: false,
      createdAt: new Date()
    }

    // In production, send real-time notification via SSE
    // This would be done through a separate service or pub/sub system

    return NextResponse.json(notification)
  } catch (error) {
    console.error('Create notification error:', error)
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 })
  }
}

// PATCH - Mark notifications as read
export async function PATCH(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { notificationIds } = await request.json()

    // In production, update the database
    // await prisma.notification.updateMany({
    //   where: { id: { in: notificationIds } },
    //   data: { read: true }
    // })

    return NextResponse.json({ success: true, updated: notificationIds.length })
  } catch (error) {
    console.error('Update notification error:', error)
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 })
  }
}