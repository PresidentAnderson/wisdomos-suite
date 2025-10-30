import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/marketplace/auth'

/**
 * GET /api/marketplace/bookings/[id]
 * Get a specific booking by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const userId = user.id

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        service: {
          select: {
            id: true,
            title: true,
            images: true,
            provider: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                  },
                },
              },
            },
          },
        },
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        review: true,
      },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Check if user is authorized to view this booking
    if (booking.buyerId !== userId && booking.providerId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json(booking)
  } catch (error) {
    console.error('Error fetching booking:', error)
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/marketplace/bookings/[id]
 * Update booking status (accept, decline, complete, cancel)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const userId = user.id

    const body = await request.json()
    const { status, cancellationReason } = body

    // Get current booking
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        service: true,
      },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Authorization checks based on action
    if (status === 'CONFIRMED' || status === 'DECLINED') {
      // Only provider can accept/decline
      if (booking.providerId !== userId) {
        return NextResponse.json(
          { error: 'Only provider can accept or decline bookings' },
          { status: 403 }
        )
      }
    } else if (status === 'CANCELLED') {
      // Both buyer and provider can cancel
      if (booking.buyerId !== userId && booking.providerId !== userId) {
        return NextResponse.json(
          { error: 'Unauthorized to cancel this booking' },
          { status: 403 }
        )
      }
    } else if (status === 'COMPLETED') {
      // Only provider can mark as completed
      if (booking.providerId !== userId) {
        return NextResponse.json(
          { error: 'Only provider can complete bookings' },
          { status: 403 }
        )
      }
    }

    // Update booking
    const updatedBooking = await prisma.booking.update({
      where: { id: params.id },
      data: {
        status,
        ...(status === 'CANCELLED' && {
          cancellationReason,
          cancelledBy: userId,
          cancelledAt: new Date(),
        }),
        ...(status === 'COMPLETED' && {
          completedAt: new Date(),
        }),
      },
      include: {
        service: true,
        buyer: {
          select: {
            name: true,
            email: true,
          },
        },
        provider: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    // Create notification for the other party
    const notificationUserId =
      booking.buyerId === userId ? booking.providerId : booking.buyerId

    await prisma.notification.create({
      data: {
        userId: notificationUserId,
        type: 'BOOKING_UPDATE',
        title: `Booking ${status.toLowerCase()}`,
        message: `Booking for ${booking.service.title} has been ${status.toLowerCase()}`,
        actionUrl: `/dashboard/bookings/${booking.id}`,
        metadata: {
          bookingId: booking.id,
          status,
        },
      },
    })

    return NextResponse.json(updatedBooking)
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/marketplace/bookings/[id]
 * Delete a booking (only if pending)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()
    const userId = user.id

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Only buyer can delete their own pending bookings
    if (booking.buyerId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (booking.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Can only delete pending bookings' },
        { status: 400 }
      )
    }

    await prisma.booking.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting booking:', error)
    return NextResponse.json(
      { error: 'Failed to delete booking' },
      { status: 500 }
    )
  }
}
