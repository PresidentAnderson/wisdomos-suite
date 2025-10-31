import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Calendar, Clock, Filter } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

interface BuyerBookingsPageProps {
  searchParams?: {
    filter?: string
    status?: string
  }
}

export default async function BuyerBookingsPage({
  searchParams,
}: BuyerBookingsPageProps) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/api/auth/signin?callbackUrl=/dashboard/buyer/bookings')
  }

  const userId = session.user.id
  const filter = searchParams?.filter || 'all'
  const statusFilter = searchParams?.status

  // Build query conditions
  const where: any = { buyerId: userId }

  if (filter === 'upcoming') {
    where.scheduledAt = { gte: new Date() }
    where.status = { in: ['PENDING', 'CONFIRMED'] }
  } else if (filter === 'past') {
    where.OR = [
      { scheduledAt: { lt: new Date() } },
      { status: 'COMPLETED' },
    ]
  }

  if (statusFilter) {
    where.status = statusFilter
  }

  // Fetch bookings
  const bookings = await prisma.booking.findMany({
    where,
    include: {
      service: {
        select: {
          id: true,
          title: true,
          images: true,
        },
      },
      provider: {
        select: {
          name: true,
          email: true,
          image: true,
        },
      },
      review: true,
    },
    orderBy: {
      scheduledAt: 'desc',
    },
  })

  const activeFilter = (f: string) =>
    filter === f
      ? 'bg-orange-100 text-orange-700 border-orange-300'
      : 'bg-white text-gray-700 border-gray-200 hover:border-orange-300'

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
        <p className="text-gray-600">View and manage all your bookings</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filter:</span>
        </div>

        <Link href="/dashboard/buyer/bookings?filter=all">
          <Button
            variant="outline"
            size="sm"
            className={activeFilter('all')}
          >
            All Bookings
          </Button>
        </Link>

        <Link href="/dashboard/buyer/bookings?filter=upcoming">
          <Button
            variant="outline"
            size="sm"
            className={activeFilter('upcoming')}
          >
            Upcoming
          </Button>
        </Link>

        <Link href="/dashboard/buyer/bookings?filter=past">
          <Button
            variant="outline"
            size="sm"
            className={activeFilter('past')}
          >
            Past
          </Button>
        </Link>

        <div className="ml-auto flex gap-2">
          <Link href="/dashboard/buyer/bookings?status=PENDING">
            <Button variant="outline" size="sm">
              Pending ({bookings.filter((b) => b.status === 'PENDING').length})
            </Button>
          </Link>
        </div>
      </div>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No bookings found</h3>
          <p className="text-gray-500 mb-6">
            {filter === 'upcoming'
              ? "You don't have any upcoming bookings"
              : filter === 'past'
              ? "You don't have any past bookings yet"
              : "You haven't made any bookings yet"}
          </p>
          <Link href="/marketplace">
            <Button className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700">
              Browse Services
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Link
              key={booking.id}
              href={`/dashboard/buyer/bookings/${booking.id}`}
              className="block bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                {/* Service Image */}
                {booking.service.images && booking.service.images.length > 0 && (
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={booking.service.images[0]}
                      alt={booking.service.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                {/* Booking Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-semibold mb-1">
                        {booking.service.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        with {booking.provider.name}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-700'
                          : booking.status === 'CONFIRMED'
                          ? 'bg-blue-100 text-blue-700'
                          : booking.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-700'
                          : booking.status === 'CANCELLED'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(booking.scheduledAt).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date(booking.scheduledAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="font-medium text-gray-900">
                      ${Number(booking.totalPrice).toFixed(2)}
                    </span>
                  </div>

                  {/* Additional Info */}
                  <div className="flex items-center gap-4">
                    {booking.review && (
                      <span className="text-xs text-green-600 font-medium">
                        ✓ Reviewed
                      </span>
                    )}
                    {!booking.review && booking.status === 'COMPLETED' && (
                      <span className="text-xs text-orange-600 font-medium">
                        Review Pending
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      Booked on {new Date(booking.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Results Count */}
      {bookings.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-500">
          Showing {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}
