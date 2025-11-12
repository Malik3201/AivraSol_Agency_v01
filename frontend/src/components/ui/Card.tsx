import { HTMLAttributes, forwardRef } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'
import { useReducedMotionFlag } from '@/hooks/useReducedMotionFlag'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverable = false, children, ...props }, ref) => {
    const prefersReducedMotion = useReducedMotionFlag()

    const Component = hoverable && !prefersReducedMotion ? motion.div : 'div'

    const hoverProps = hoverable && !prefersReducedMotion
      ? {
          whileHover: { y: -4, scale: 1.01 },
          transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
        }
      : {}

    return (
      <Component
        ref={ref}
        className={cn(
          'bg-card rounded-2xl p-6 border border-border shadow-lg',
          hoverable && 'transition-shadow hover:shadow-xl cursor-pointer',
          className
        )}
        {...hoverProps}
        {...props}
      >
        {children}
      </Component>
    )
  }
)

Card.displayName = 'Card'

