import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Calendar, Clock, Filter, User } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

interface ProviderBookingsPageProps {
  searchParams?: {
    status?: string
  }
}

export default async function ProviderBookingsPage({
  searchParams,
}: ProviderBookingsPageProps) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/api/auth/signin?callbackUrl=/dashboard/provider/bookings')
  }

  const userId = session.user.id
  const statusFilter = searchParams?.status

  // Build query
  const where: any = { providerId: userId }
  if (statusFilter) {
    where.status = statusFilter
  }

  // Fetch bookings
  const bookings = await prisma.booking.findMany({
    where,
    include: {
      service: {
        select: {
          title: true,
          images: true,
        },
      },
      buyer: {
        select: {
          name: true,
          email: true,
          image: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  const activeFilter = (status: string) =>
    statusFilter === status
      ? 'bg-orange-100 text-orange-700 border-orange-300'
      : 'bg-white text-gray-700 border-gray-200 hover:border-orange-300'

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Manage Bookings</h1>
        <p className="text-gray-600">Review and manage booking requests</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Status:</span>
        </div>

        <Link href="/dashboard/provider/bookings">
          <Button
            variant="outline"
            size="sm"
            className={!statusFilter ? activeFilter('') : 'bg-white'}
          >
            All
          </Button>
        </Link>

        <Link href="/dashboard/provider/bookings?status=PENDING">
          <Button
            variant="outline"
            size="sm"
            className={activeFilter('PENDING')}
          >
            Pending ({bookings.filter((b) => b.status === 'PENDING').length})
          </Button>
        </Link>

        <Link href="/dashboard/provider/bookings?status=CONFIRMED">
          <Button
            variant="outline"
            size="sm"
            className={activeFilter('CONFIRMED')}
          >
            Confirmed
          </Button>
        </Link>

        <Link href="/dashboard/provider/bookings?status=COMPLETED">
          <Button
            variant="outline"
            size="sm"
            className={activeFilter('COMPLETED')}
          >
            Completed
          </Button>
        </Link>
      </div>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No bookings found</h3>
          <p className="text-gray-500">
            {statusFilter
              ? `No ${statusFilter.toLowerCase()} bookings`
              : "You don't have any bookings yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <div className="flex items-start gap-4">
                {/* Buyer Info */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  {booking.buyer.image ? (
                    <Image
                      src={booking.buyer.image}
                      alt={booking.buyer.name || 'Buyer'}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-600" />
                    </div>
                  )}
                </div>

                {/* Booking Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">
                        {booking.service.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Requested by {booking.buyer.name}
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
                  </div>

                  {booking.notes && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <p className="text-sm text-gray-700">{booking.notes}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-lg">
                      ${Number(booking.totalPrice).toFixed(2)}
                    </span>

                    <div className="flex gap-2">
                      {booking.status === 'PENDING' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:bg-red-50"
                          >
                            Decline
                          </Button>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Accept
                          </Button>
                        </>
                      )}
                      {booking.status === 'CONFIRMED' && (
                        <Button
                          variant="outline"
                          size="sm"
                        >
                          Mark Complete
                        </Button>
                      )}
                      <Link href={`/dashboard/provider/bookings/${booking.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {bookings.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-500">
          Showing {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}
