import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/cn'

interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'amber'
}

export const Chip = forwardRef<HTMLSpanElement, ChipProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'bg-surface text-text-muted border-border',
      primary: 'bg-primary/10 text-primary border-primary/20',
      amber: 'bg-amber/10 text-amber border-amber/20',
    }

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border',
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </span>
    )
  }
)

Chip.displayName = 'Chip'

