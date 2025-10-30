"use client"

import Image from "next/image"
import Link from "next/link"
import { Star, Heart, Clock } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Decimal } from "@prisma/client/runtime/library"

interface ServiceCardProps {
  service: {
    id: string
    title: string
    description: string
    averageRating: Decimal
    totalBookings: number
    imageUrl?: string | null
    category?: {
      name: string
    } | null
    provider?: {
      displayName: string | null
      isVerified: boolean
    } | null
  }
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const rating = typeof service.averageRating === 'number'
    ? service.averageRating
    : Number(service.averageRating)
  const imageUrl = service.imageUrl || "/placeholder-service.jpg"

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      <Link href={`/marketplace/services/${service.id}`}>
        <div className="relative aspect-video bg-gray-200">
          {service.imageUrl && (
            <Image
              src={imageUrl}
              alt={service.title}
              fill
              className="object-cover"
            />
          )}
        </div>
      </Link>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          {service.category && (
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
              {service.category.name}
            </span>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Heart className="h-4 w-4" />
          </Button>
        </div>
        <Link href={`/marketplace/services/${service.id}`}>
          <h3 className="font-semibold text-lg mb-1 hover:text-blue-600">
            {service.title}
          </h3>
        </Link>
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {service.description}
        </p>
        {service.provider?.displayName && (
          <p className="text-xs text-gray-500 mb-2">
            by {service.provider.displayName}
            {service.provider.isVerified && ' ✓'}
          </p>
        )}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
          </div>
          {service.totalBookings > 0 && (
            <span className="text-sm text-gray-500">({service.totalBookings} bookings)</span>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="text-lg font-semibold text-gray-900">
          View Details
        </div>
        <Button>Book Now</Button>
      </CardFooter>
    </Card>
  )
}
