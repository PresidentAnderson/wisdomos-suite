"use client"

import Image from "next/image"
import Link from "next/link"
import { Star, Heart } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface GameCardProps {
  id: string
  title: string
  description: string
  price: number
  coverImage: string
  category: string
  rating?: number
  reviewCount?: number
}

export function GameCard({
  id,
  title,
  description,
  price,
  coverImage,
  category,
  rating = 0,
  reviewCount = 0,
}: GameCardProps) {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      <Link href={`/marketplace/games/${id}`}>
        <div className="relative aspect-video">
          <Image
            src={coverImage}
            alt={title}
            fill
            className="object-cover"
          />
        </div>
      </Link>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
            {category}
          </span>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Heart className="h-4 w-4" />
          </Button>
        </div>
        <Link href={`/marketplace/games/${id}`}>
          <h3 className="font-semibold text-lg mb-1 hover:text-blue-600">
            {title}
          </h3>
        </Link>
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {description}
        </p>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
          </div>
          <span className="text-sm text-gray-500">({reviewCount})</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="text-2xl font-bold text-gray-900">
          ${price.toFixed(2)}
        </div>
        <Button>Add to Cart</Button>
      </CardFooter>
    </Card>
  )
}
