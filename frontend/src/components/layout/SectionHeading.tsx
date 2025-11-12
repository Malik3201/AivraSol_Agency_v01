import { HTMLAttributes, forwardRef, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { cn } from '@/lib/cn'
import { fadeInUp, getMotionProps } from '@/lib/motionPresets'
import { useReducedMotionFlag } from '@/hooks/useReducedMotionFlag'

interface SectionHeadingProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  subtitle?: string
  align?: 'left' | 'center'
}

export const SectionHeading = forwardRef<HTMLDivElement, SectionHeadingProps>(
  ({ className, title, subtitle, align = 'center', ...props }, ref) => {
    const localRef = useRef<HTMLDivElement>(null)
    const isInView = useInView(localRef, { once: true, amount: 0.8 })
    const prefersReducedMotion = useReducedMotionFlag()

    return (
      <motion.div
        ref={(node) => {
          (localRef as any).current = node
          if (typeof ref === 'function') ref(node)
          else if (ref) ref.current = node
        }}
        className={cn(
          'mb-12',
          align === 'center' ? 'text-center' : 'text-left',
          className
        )}
        {...getMotionProps(fadeInUp)}
        {...props}
      >
        <div className="inline-block relative">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-strong mb-2">
            {title}
          </h2>
          <svg
            className="absolute -bottom-2 left-0 w-full h-3 overflow-visible"
            viewBox="0 0 200 8"
            preserveAspectRatio="none"
          >
            <motion.path
              d="M 0 4 Q 50 1, 100 4 T 200 4"
              stroke="var(--amber)"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={isInView ? { pathLength: 1, opacity: 0.6 } : {}}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.8,
                delay: 0.3,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
          </svg>
        </div>
        {subtitle && (
          <p className={cn(
            "text-lg text-text-muted mt-4",
            align === 'center' ? 'max-w-2xl mx-auto' : 'max-w-2xl'
          )}>
            {subtitle}
          </p>
        )}
      </motion.div>
    )
  }
)

SectionHeading.displayName = 'SectionHeading'
