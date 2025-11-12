import { ButtonHTMLAttributes, forwardRef } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'
import { useMagneticHover } from '@/hooks/useMagneticHover'
import { useReducedMotionFlag } from '@/hooks/useReducedMotionFlag'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'subtle'
  size?: 'sm' | 'md' | 'lg'
  magnetic?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', magnetic = false, children, ...props }, ref) => {
    const { elementRef, offset, handlers } = useMagneticHover(0.15)
    const prefersReducedMotion = useReducedMotionFlag()

    const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-220 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-6 py-3',
      lg: 'px-8 py-4 text-lg',
    }

    const variants = {
      primary: 'bg-primary text-bg hover:bg-primary/90 shadow-md hover:shadow-lg',
      ghost: 'border border-border text-text-strong hover:bg-surface',
      subtle: 'bg-card text-text-strong hover:bg-surface',
    }

    const magneticProps = magnetic && !prefersReducedMotion ? handlers : {}

    return (
      <motion.button
        ref={(node) => {
          elementRef.current = node
          if (typeof ref === 'function') ref(node)
          else if (ref) ref.current = node
        }}
        className={cn(baseStyles, sizes[size], variants[variant], className)}
        animate={magnetic && !prefersReducedMotion ? { x: offset.x, y: offset.y } : {}}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        {...magneticProps}
        {...props}
      >
        {children}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'

