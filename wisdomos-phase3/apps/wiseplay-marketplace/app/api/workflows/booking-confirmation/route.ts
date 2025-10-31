import { start } from 'workflow/api';
import { handleBookingConfirmation } from '@/workflows/booking-confirmation';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { bookingId } = await request.json();

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // Start the booking confirmation workflow asynchronously
    // This doesn't block the request - the workflow runs in the background
    await start(handleBookingConfirmation, [bookingId]);

    return NextResponse.json({
      message: 'Booking confirmation workflow started',
      bookingId,
    });
  } catch (error) {
    console.error('Error starting booking workflow:', error);
    return NextResponse.json(
      { error: 'Failed to start workflow' },
      { status: 500 }
    );
  }
}
