"use client"

import Image from "next/image"
import Link from "next/link"
import { Star, Heart, Users } from "lucide-react"
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
    <Card className="overflow-hidden transition-all hover:shadow-xl border border-amber-100 hover:border-amber-300">
      <Link href={`/marketplace/services/${service.id}`}>
        <div className="relative aspect-video bg-gradient-to-br from-orange-100 to-amber-100">
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
            <span className="text-xs font-medium text-orange-700 bg-orange-50 px-2 py-1 rounded border border-orange-200">
              {service.category.name}
            </span>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-orange-50">
            <Heart className="h-4 w-4 text-orange-600" />
          </Button>
        </div>
        <Link href={`/marketplace/services/${service.id}`}>
          <h3 className="font-semibold text-lg mb-1 hover:text-orange-700 transition-colors">
            {service.title}
          </h3>
        </Link>
        <p className="text-sm text-gray-700 line-clamp-2 mb-3 leading-relaxed">
          {service.description}
        </p>
        {service.provider?.displayName && (
          <div className="flex items-center gap-1 mb-2">
            <p className="text-sm text-gray-600">
              with <span className="font-medium text-gray-900">{service.provider.displayName}</span>
              {service.provider.isVerified && (
                <span className="ml-1 inline-flex items-center text-xs text-green-700 bg-green-50 px-1.5 py-0.5 rounded border border-green-200">
                  ✓ Verified
                </span>
              )}
            </p>
          </div>
        )}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="ml-1 text-sm font-medium text-gray-900">{rating.toFixed(1)}</span>
          </div>
          {service.totalBookings > 0 && (
            <div className="flex items-center text-sm text-gray-600">
              <Users className="h-3.5 w-3.5 mr-1" />
              <span>{service.totalBookings} {service.totalBookings === 1 ? 'partnership' : 'partnerships'}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex items-center justify-between bg-gradient-to-r from-orange-50/50 to-amber-50/50">
        <Link href={`/marketplace/services/${service.id}`} className="text-sm font-medium text-orange-700 hover:text-orange-800">
          Learn More
        </Link>
        <Button className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white">
          Connect
        </Button>
      </CardFooter>
    </Card>
  )
}
