'use client'

import React, { useState } from 'react'
import { Star } from 'lucide-react'

interface StarRatingProps {
  rating: number
  onChange: (rating: number) => void
  label: string
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onChange,
  label,
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null)

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-amber-900">{label}</span>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="focus:outline-none transition-transform duration-150 active:scale-95 cursor-pointer"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(null)}
            data-testid={`star-rating-${star}`}
          >
            <Star
              className={`w-10 h-10 ${
                star <= (hoverRating ?? rating)
                  ? 'fill-amber-500 stroke-amber-500'
                  : 'stroke-amber-300 fill-none'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  )
}
