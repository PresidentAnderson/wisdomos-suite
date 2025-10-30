"use client"

import Image from "next/image"
import Link from "next/link"
import { Star, Heart, Clock } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ServiceCardProps {
  service: {
    id: string
    title: string
    description: string
    price: number
    imageUrl?: string | null
    category?: {
      name: string
    } | null
    provider?: {
      user: {
        name?: string | null
      }
    } | null
    avgRating?: number | null
    totalReviews?: number
  }
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const rating = service.avgRating || 0
  const reviewCount = service.totalReviews || 0
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
        {service.provider?.user?.name && (
          <p className="text-xs text-gray-500 mb-2">
            by {service.provider.user.name}
          </p>
        )}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
          </div>
          {reviewCount > 0 && (
            <span className="text-sm text-gray-500">({reviewCount})</span>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="text-2xl font-bold text-gray-900">
          ${service.price.toFixed(2)}
        </div>
        <Button>Book Now</Button>
      </CardFooter>
    </Card>
  )
}
