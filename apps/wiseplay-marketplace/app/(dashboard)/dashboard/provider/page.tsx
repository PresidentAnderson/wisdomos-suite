import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import {
  Calendar,
  DollarSign,
  Package,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

export default async function ProviderDashboard() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/api/auth/signin?callbackUrl=/dashboard/provider')
  }

  const userId = session.user.id

  // Get provider profile
  const provider = await prisma.providerProfile.findUnique({
    where: { userId },
    include: {
      services: {
        where: { isPublished: true },
        select: {
          id: true,
          title: true,
          images: true,
          basePrice: true,
          totalBookings: true,
          averageRating: true,
        },
      },
    },
  })

  if (!provider) {
    redirect('/dashboard/settings/provider')
  }

  // Fetch pending bookings
  const pendingBookings = await prisma.booking.findMany({
    where: {
      providerId: userId,
      status: 'PENDING',
    },
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
          image: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 5,
  })

  // Fetch upcoming bookings
  const upcomingBookings = await prisma.booking.findMany({
    where: {
      providerId: userId,
      status: 'CONFIRMED',
      scheduledAt: {
        gte: new Date(),
      },
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
      scheduledAt: 'asc',
    },
    take: 5,
  })

  // Calculate stats
  const stats = {
    totalServices: provider.services.length,
    totalBookings: await prisma.booking.count({ where: { providerId: userId } }),
    pendingCount: await prisma.booking.count({
      where: { providerId: userId, status: 'PENDING' }
    }),
    totalEarnings: Number(provider.totalEarnings) || 0,
    averageRating: Number(provider.averageRating) || 0,
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Provider Dashboard</h1>
        <p className="text-gray-600">
          Welcome back, {provider.displayName || session.user.name}!
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Active Services</p>
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold">{stats.totalServices}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Bookings</p>
            <Calendar className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold">{stats.totalBookings}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Pending</p>
            <AlertCircle className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold">{stats.pendingCount}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Earnings</p>
            <DollarSign className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold">${stats.totalEarnings.toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Avg Rating</p>
            <TrendingUp className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-3xl font-bold">{stats.averageRating.toFixed(1)}</p>
        </div>
      </div>

      {/* Pending Bookings Alert */}
      {pendingBookings.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-orange-900 mb-2">
                {pendingBookings.length} Booking{pendingBookings.length > 1 ? 's' : ''} Awaiting Response
              </h3>
              <p className="text-sm text-orange-800 mb-4">
                You have booking requests that need your attention. Please accept or decline them soon.
              </p>
              <Link href="/dashboard/provider/bookings?status=PENDING">
                <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                  Review Bookings
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Bookings */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Pending Requests</h2>
            <Link href="/dashboard/provider/bookings?status=PENDING">
              <Button variant="outline" size="sm">
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {pendingBookings.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-500">All caught up! No pending requests.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingBookings.map((booking) => (
                <Link
                  key={booking.id}
                  href={`/dashboard/provider/bookings/${booking.id}`}
                  className="block p-4 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-2">
                    {booking.buyer.image ? (
                      <Image
                        src={booking.buyer.image}
                        alt={booking.buyer.name || 'Buyer'}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-600 font-semibold">
                          {booking.buyer.name?.charAt(0) || 'B'}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-semibold">{booking.buyer.name}</p>
                      <p className="text-sm text-gray-500">{booking.service.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    {new Date(booking.scheduledAt).toLocaleDateString()}
                    <Clock className="w-4 h-4 ml-2" />
                    {new Date(booking.scheduledAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Bookings */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Upcoming Bookings</h2>
            <Link href="/dashboard/provider/bookings?status=CONFIRMED">
              <Button variant="outline" size="sm">
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {upcomingBookings.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No upcoming confirmed bookings</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="p-4 rounded-lg border border-gray-200"
                >
                  <p className="font-semibold mb-1">{booking.service.title}</p>
                  <p className="text-sm text-gray-600 mb-2">
                    with {booking.buyer.name}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    {new Date(booking.scheduledAt).toLocaleDateString()}
                    <Clock className="w-4 h-4 ml-2" />
                    {new Date(booking.scheduledAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* My Services */}
      <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">My Services</h2>
          <Link href="/dashboard/provider/services">
            <Button variant="outline" size="sm">
              Manage Services
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        {provider.services.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">No services yet</p>
            <Link href="/dashboard/provider/services/create">
              <Button className="bg-gradient-to-r from-orange-600 to-amber-600">
                Create Your First Service
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {provider.services.slice(0, 6).map((service) => (
              <div
                key={service.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                {service.images && service.images.length > 0 && (
                  <div className="relative w-full h-32 rounded-lg overflow-hidden mb-3">
                    <Image
                      src={service.images[0]}
                      alt={service.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <h3 className="font-semibold mb-2 line-clamp-2">{service.title}</h3>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">${Number(service.basePrice).toFixed(2)}</span>
                  <span className="text-gray-500">
                    {service.totalBookings} booking{service.totalBookings !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
