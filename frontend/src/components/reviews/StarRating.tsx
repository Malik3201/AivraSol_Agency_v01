import { Star } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/cn'

interface StarRatingProps {
  value: number
  onChange?: (value: number) => void
  readOnly?: boolean
  size?: number
  className?: string
}

export function StarRating({
  value,
  onChange,
  readOnly = false,
  size = 28,
  className,
}: StarRatingProps) {
  const [hover, setHover] = useState(0)
  const active = hover || value

  return (
    <div
      className={cn('inline-flex items-center gap-1', className)}
      role={readOnly ? undefined : 'radiogroup'}
      aria-label="Rating"
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= active
        const Component = readOnly ? 'span' : 'button'
        return (
          <Component
            key={star}
            type={readOnly ? undefined : 'button'}
            role={readOnly ? undefined : 'radio'}
            aria-checked={readOnly ? undefined : value === star}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
            onClick={readOnly ? undefined : () => onChange?.(star)}
            onMouseEnter={readOnly ? undefined : () => setHover(star)}
            onMouseLeave={readOnly ? undefined : () => setHover(0)}
            onFocus={readOnly ? undefined : () => setHover(star)}
            onBlur={readOnly ? undefined : () => setHover(0)}
            className={cn(
              'transition-transform duration-150',
              !readOnly && 'cursor-pointer hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded',
              readOnly && 'cursor-default'
            )}
          >
            <Star
              width={size}
              height={size}
              className={cn(
                'transition-colors',
                filled
                  ? 'fill-amber text-amber'
                  : 'text-text-muted/40'
              )}
              strokeWidth={1.5}
            />
          </Component>
        )
      })}
    </div>
  )
}
