"use client"

import Image from 'next/image';
import { Star } from 'lucide-react';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  buyer: {
    user: {
      name: string | null;
      image: string | null;
    };
  };
}

interface ReviewCardProps {
  review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const rating = typeof review.rating === 'number'
    ? review.rating
    : Number(review.rating);

  const buyerName = review.buyer.user.name || 'Anonymous';
  const buyerImage = review.buyer.user.image;

  return (
    <div className="border-b border-gray-200 pb-6 last:border-b-0">
      <div className="flex items-start gap-4">
        {/* Buyer Avatar */}
        <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
          {buyerImage ? (
            <Image
              src={buyerImage}
              alt={buyerName}
              fill
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-indigo-500 text-white font-semibold">
              {buyerName[0].toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1">
          {/* Buyer Name & Date */}
          <div className="flex items-center justify-between mb-2">
            <p className="font-semibold text-gray-900">{buyerName}</p>
            <span className="text-sm text-gray-500">
              {new Date(review.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>

          {/* Rating Stars */}
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < rating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'fill-gray-200 text-gray-200'
                }`}
              />
            ))}
            <span className="text-sm text-gray-600 ml-1">
              {rating.toFixed(1)}
            </span>
          </div>

          {/* Review Comment */}
          {review.comment && (
            <p className="text-gray-700 leading-relaxed">{review.comment}</p>
          )}
        </div>
      </div>
    </div>
  );
}
