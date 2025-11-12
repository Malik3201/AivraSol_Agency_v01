import { HTMLAttributes, forwardRef, useEffect, useState } from 'react'
import { cn } from '@/lib/cn'
import { useReducedMotionFlag } from '@/hooks/useReducedMotionFlag'

interface KPIChipProps extends Omit<HTMLAttributes<HTMLDivElement>, 'prefix'> {
  value: number
  suffix?: string
  prefix?: string
  label: string
  duration?: number
}

export const KPIChip = forwardRef<HTMLDivElement, KPIChipProps>(
  ({ className, value, suffix = '', prefix = '', label, duration = 2000, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState(0)
    const prefersReducedMotion = useReducedMotionFlag()

    useEffect(() => {
      if (prefersReducedMotion) {
        setDisplayValue(value)
        return
      }

      let startTime: number | null = null
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp
        const progress = Math.min((timestamp - startTime) / duration, 1)
        
        setDisplayValue(Math.floor(progress * value))

        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }

      requestAnimationFrame(animate)
    }, [value, duration, prefersReducedMotion])

    return (
      <div
        ref={ref}
        className={cn('inline-flex flex-col items-start gap-1', className)}
        {...props}
      >
        <div className="text-2xl font-bold text-text-strong">
          {prefix}{displayValue.toLocaleString()}{suffix}
        </div>
        <div className="text-xs text-text-muted uppercase tracking-wide">{label}</div>
      </div>
    )
  }
)

KPIChip.displayName = 'KPIChip'

