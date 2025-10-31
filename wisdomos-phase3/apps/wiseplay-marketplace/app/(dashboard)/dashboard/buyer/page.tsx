import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Calendar, Clock, DollarSign, Star, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

export default async function BuyerDashboard() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/api/auth/signin?callbackUrl=/dashboard/buyer')
  }

  const userId = session.user.id

  // Fetch upcoming bookings
  const upcomingBookings = await prisma.booking.findMany({
    where: {
      buyerId: userId,
      scheduledAt: {
        gte: new Date(),
      },
      status: {
        in: ['PENDING', 'CONFIRMED'],
      },
    },
    include: {
      service: {
        select: {
          title: true,
          images: true,
        },
      },
      provider: {
        select: {
          name: true,
          image: true,
        },
      },
    },
    orderBy: {
      scheduledAt: 'asc',
    },
    take: 5,
  })

  // Fetch past bookings
  const pastBookings = await prisma.booking.findMany({
    where: {
      buyerId: userId,
      OR: [
        { scheduledAt: { lt: new Date() } },
        { status: 'COMPLETED' },
      ],
    },
    include: {
      service: {
        select: {
          title: true,
          images: true,
        },
      },
      provider: {
        select: {
          name: true,
          image: true,
        },
      },
      review: true,
    },
    orderBy: {
      scheduledAt: 'desc',
    },
    take: 5,
  })

  // Calculate stats
  const stats = {
    total: await prisma.booking.count({ where: { buyerId: userId } }),
    pending: await prisma.booking.count({
      where: { buyerId: userId, status: 'PENDING' }
    }),
    completed: await prisma.booking.count({
      where: { buyerId: userId, status: 'COMPLETED' }
    }),
    totalSpent: await prisma.booking.aggregate({
      where: { buyerId: userId, status: { in: ['CONFIRMED', 'COMPLETED'] } },
      _sum: { totalPrice: true },
    }),
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
        <p className="text-gray-600">Welcome back, {session.user.name}!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Bookings</p>
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold">{stats.total}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Pending</p>
            <Clock className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold">{stats.pending}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Completed</p>
            <Star className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold">{stats.completed}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Spent</p>
            <DollarSign className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold">
            ${(Number(stats.totalSpent._sum.totalPrice) || 0).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Upcoming Bookings */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Upcoming Bookings</h2>
          <Link href="/dashboard/buyer/bookings">
            <Button variant="outline" size="sm">
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        {upcomingBookings.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No upcoming bookings</p>
            <Link href="/marketplace">
              <Button className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700">
                Browse Services
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingBookings.map((booking) => (
              <Link
                key={booking.id}
                href={`/dashboard/buyer/bookings/${booking.id}`}
                className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors"
              >
                {booking.service.images && booking.service.images.length > 0 && (
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={booking.service.images[0]}
                      alt={booking.service.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">
                    {booking.service.title}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(booking.scheduledAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date(booking.scheduledAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    with {booking.provider.name}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      booking.status === 'CONFIRMED'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {booking.status}
                  </span>
                  <p className="text-lg font-bold text-gray-900 mt-2">
                    ${Number(booking.totalPrice).toFixed(2)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Past Bookings */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Past Bookings</h2>
          <Link href="/dashboard/buyer/bookings?filter=past">
            <Button variant="outline" size="sm">
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        {pastBookings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No past bookings yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pastBookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center gap-4 p-4 rounded-lg border border-gray-200"
              >
                {booking.service.images && booking.service.images.length > 0 && (
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={booking.service.images[0]}
                      alt={booking.service.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{booking.service.title}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(booking.scheduledAt).toLocaleDateString()} with{' '}
                    {booking.provider.name}
                  </p>
                </div>
                <div className="text-right">
                  {!booking.review && booking.status === 'COMPLETED' && (
                    <Link href={`/dashboard/buyer/bookings/${booking.id}#review`}>
                      <Button variant="outline" size="sm">
                        Leave Review
                      </Button>
                    </Link>
                  )}
                  {booking.review && (
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-medium">
                        {booking.review.rating}/5
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
