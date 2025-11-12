import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/cn'

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'primary' | 'amber' | 'outline'
}

export const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'bg-surface text-text-strong border-transparent',
      primary: 'bg-primary text-bg border-transparent',
      amber: 'bg-amber text-bg border-transparent',
      outline: 'bg-transparent text-text-strong border-border',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-lg border px-3 py-1 text-xs font-semibold transition-colors',
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Badge.displayName = 'Badge'

