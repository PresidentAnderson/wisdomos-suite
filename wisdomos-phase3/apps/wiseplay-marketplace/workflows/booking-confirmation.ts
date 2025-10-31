import { sleep, FatalError } from "workflow";
import { prisma } from "@/lib/db";

/**
 * Booking Confirmation Workflow
 *
 * This workflow handles the entire booking confirmation process:
 * 1. Send immediate confirmation email to buyer
 * 2. Notify provider about new booking request
 * 3. Wait for provider response (24 hours)
 * 4. Send reminder if no response
 * 5. Auto-cancel if no response after 48 hours
 */
export async function handleBookingConfirmation(bookingId: string) {
  "use workflow";

  // Step 1: Get booking details
  const booking = await getBookingDetails(bookingId);

  if (!booking) {
    throw new FatalError(`Booking ${bookingId} not found`);
  }

  // Step 2: Send immediate confirmation to buyer
  await sendBuyerConfirmation(booking);

  // Step 3: Notify provider about new booking request
  await notifyProvider(booking);

  // Step 4: Wait 24 hours for provider response
  await sleep("24h");

  // Step 5: Check if provider responded
  const updatedBooking = await checkBookingStatus(bookingId);

  if (updatedBooking.status === "PENDING") {
    // Send reminder to provider
    await sendProviderReminder(updatedBooking);

    // Wait another 24 hours
    await sleep("24h");

    // Final check
    const finalBooking = await checkBookingStatus(bookingId);

    if (finalBooking.status === "PENDING") {
      // Auto-cancel after 48 hours of no response
      await autoCancelBooking(bookingId);
      await notifyBuyerOfCancellation(finalBooking);
    }
  }

  if (updatedBooking.status === "CONFIRMED") {
    // Send confirmation details to both parties
    await sendBookingConfirmedNotifications(updatedBooking);

    // Schedule reminder 24 hours before booking
    const timeUntilBooking = new Date(updatedBooking.scheduledAt).getTime() - Date.now();
    const reminderTime = Math.max(0, timeUntilBooking - 24 * 60 * 60 * 1000);

    if (reminderTime > 0) {
      await sleep(reminderTime);
      await sendBookingReminder(updatedBooking);
    }
  }

  return { bookingId, status: updatedBooking.status };
}

/**
 * Individual workflow steps
 */

async function getBookingDetails(bookingId: string) {
  "use step";

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      service: {
        select: {
          title: true,
          basePrice: true,
        },
      },
      buyer: {
        select: {
          email: true,
          name: true,
        },
      },
      provider: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  });

  return booking;
}

async function sendBuyerConfirmation(booking: any) {
  "use step";

  console.log(`[Workflow] Sending confirmation email to buyer: ${booking.buyer.email}`);
  console.log(`Booking ID: ${booking.id}`);
  console.log(`Service: ${booking.service.title}`);
  console.log(`Scheduled: ${booking.scheduledAt}`);

  // In production, integrate with email service (SendGrid, Resend, etc.)
  // await sendEmail({
  //   to: booking.buyer.email,
  //   template: 'booking-confirmation',
  //   data: { booking }
  // });

  return { sent: true, recipient: booking.buyer.email };
}

async function notifyProvider(booking: any) {
  "use step";

  console.log(`[Workflow] Notifying provider: ${booking.provider.email}`);
  console.log(`New booking request from: ${booking.buyer.name}`);
  console.log(`Service: ${booking.service.title}`);
  console.log(`Provider has 48 hours to respond`);

  // In production, send actual email notification
  // await sendEmail({
  //   to: booking.provider.email,
  //   template: 'new-booking-request',
  //   data: { booking }
  // });

  return { sent: true, recipient: booking.provider.email };
}

async function checkBookingStatus(bookingId: string) {
  "use step";

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      service: true,
      buyer: true,
      provider: true,
    },
  });

  if (!booking) {
    throw new FatalError(`Booking ${bookingId} not found`);
  }

  console.log(`[Workflow] Booking status: ${booking.status}`);
  return booking;
}

async function sendProviderReminder(booking: any) {
  "use step";

  console.log(`[Workflow] Sending reminder to provider: ${booking.provider.email}`);
  console.log(`Booking request still pending from: ${booking.buyer.name}`);
  console.log(`Auto-cancel in 24 hours if no response`);

  // Send reminder email
  return { sent: true, recipient: booking.provider.email };
}

async function autoCancelBooking(bookingId: string) {
  "use step";

  console.log(`[Workflow] Auto-cancelling booking: ${bookingId}`);

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "CANCELLED",
      cancelledAt: new Date(),
    },
  });

  return { cancelled: true, reason: "Provider did not respond within 48 hours" };
}

async function notifyBuyerOfCancellation(booking: any) {
  "use step";

  console.log(`[Workflow] Notifying buyer of auto-cancellation: ${booking.buyer.email}`);
  console.log(`Booking cancelled: Provider did not respond in time`);

  // Send cancellation email to buyer
  return { sent: true, recipient: booking.buyer.email };
}

async function sendBookingConfirmedNotifications(booking: any) {
  "use step";

  console.log(`[Workflow] Sending confirmation to both parties`);
  console.log(`Buyer: ${booking.buyer.email}`);
  console.log(`Provider: ${booking.provider.email}`);
  console.log(`Booking confirmed for: ${booking.scheduledAt}`);

  // Send confirmation emails to both
  return { sent: true, recipients: [booking.buyer.email, booking.provider.email] };
}

async function sendBookingReminder(booking: any) {
  "use step";

  console.log(`[Workflow] Sending 24-hour reminder`);
  console.log(`Booking scheduled for: ${booking.scheduledAt}`);
  console.log(`Reminding buyer: ${booking.buyer.email}`);
  console.log(`Reminding provider: ${booking.provider.email}`);

  // Send reminder emails
  return { sent: true, recipients: [booking.buyer.email, booking.provider.email] };
}
