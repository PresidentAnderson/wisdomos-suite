import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function ProviderEarningsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/api/auth/signin?callbackUrl=/dashboard/provider/earnings')
  }

  const userId = session.user.id

  // Get provider profile
  const provider = await prisma.providerProfile.findUnique({
    where: { userId },
  })

  if (!provider) {
    redirect('/dashboard/settings/provider')
  }

  // Fetch completed bookings
  const completedBookings = await prisma.booking.findMany({
    where: {
      providerId: userId,
      status: 'COMPLETED',
    },
    include: {
      service: {
        select: {
          title: true,
        },
      },
      buyer: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      completedAt: 'desc',
    },
  })

  // Calculate earnings
  const totalEarnings = Number(provider.totalEarnings) || 0
  const pendingEarnings = completedBookings
    .filter((b) => b.paymentStatus === 'SUCCEEDED')
    .reduce((sum, b) => sum + Number(b.basePrice), 0)

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Earnings</h1>
        <p className="text-gray-600">Track your revenue and payouts</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Earnings</p>
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold">${totalEarnings.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">All time</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Pending Payout</p>
            <Clock className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold">${pendingEarnings.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">Available soon</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Completed</p>
            <CheckCircle className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold">{completedBookings.length}</p>
          <p className="text-xs text-gray-500 mt-1">Services delivered</p>
        </div>
      </div>

      {/* Stripe Connect Status */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Payout Settings</h2>

        {provider.stripeChargesEnabled && provider.stripePayoutsEnabled ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-900 mb-1">
                  Stripe Account Connected
                </p>
                <p className="text-sm text-green-800">
                  Your account is set up and ready to receive payouts. Earnings will be automatically transferred to your bank account.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-orange-900 mb-1">
                  Complete Stripe Setup
                </p>
                <p className="text-sm text-orange-800 mb-3">
                  To receive payouts, you need to complete your Stripe Connect onboarding.
                </p>
                <Button className="bg-orange-600 hover:bg-orange-700">
                  Complete Setup
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Earnings */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Earnings</h2>

        {completedBookings.length === 0 ? (
          <div className="text-center py-8">
            <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No completed bookings yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Service
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Client
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Date
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    Earned
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    Platform Fee
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    Net
                  </th>
                </tr>
              </thead>
              <tbody>
                {completedBookings.slice(0, 10).map((booking) => (
                  <tr key={booking.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm">{booking.service.title}</td>
                    <td className="py-3 px-4 text-sm">{booking.buyer.name}</td>
                    <td className="py-3 px-4 text-sm">
                      {booking.completedAt
                        ? new Date(booking.completedAt).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-sm text-right">
                      ${Number(booking.basePrice).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-sm text-right text-red-600">
                      -${Number(booking.platformFee).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-sm text-right font-semibold">
                      ${(Number(booking.basePrice) - Number(booking.platformFee)).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
