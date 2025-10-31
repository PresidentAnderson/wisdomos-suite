import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function DashboardRouter() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/api/auth/signin?callbackUrl=/dashboard')
  }

  // Check if user is a provider
  const provider = await prisma.providerProfile.findUnique({
    where: { userId: session.user.id },
  })

  // Check if user has any bookings as buyer
  const buyerBookingsCount = await prisma.booking.count({
    where: { buyerId: session.user.id },
  })

  // Route logic:
  // 1. If user is a provider, show provider dashboard
  // 2. If user has bookings as buyer but not provider, show buyer dashboard
  // 3. Default to buyer dashboard for new users

  if (provider) {
    redirect('/dashboard/provider')
  } else if (buyerBookingsCount > 0) {
    redirect('/dashboard/buyer')
  } else {
    redirect('/dashboard/buyer')
  }
}
