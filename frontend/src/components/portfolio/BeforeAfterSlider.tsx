import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Container } from '@/components/layout/Container'
import { useReducedMotionFlag } from '@/hooks/useReducedMotionFlag'
import { cn } from '@/lib/cn'

interface BeforeAfterSliderProps {
  beforeImage: string
  afterImage: string
  title: string
}

export function BeforeAfterSlider({ beforeImage, afterImage, title }: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotionFlag()

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setSliderPosition(percentage)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) handleMove(e.clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && e.touches[0]) handleMove(e.touches[0].clientX)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      setSliderPosition((prev) => Math.max(0, prev - 5))
    } else if (e.key === 'ArrowRight') {
      setSliderPosition((prev) => Math.min(100, prev + 5))
    }
  }

  return (
    <section className="py-16 bg-surface/30">
      <Container>
        <h2 className="text-2xl font-bold text-text-strong mb-8">Before & After</h2>

        <div
          ref={containerRef}
          className="relative aspect-video rounded-xl overflow-hidden bg-card select-none"
          onMouseMove={handleMouseMove}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          onTouchMove={handleTouchMove}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
        >
          {/* After image (full width) */}
          <img
            src={afterImage}
            alt={`${title} - After`}
            className="absolute inset-0 w-full h-full object-cover"
            draggable={false}
          />

          {/* Before image (clipped) */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
          >
            <img
              src={beforeImage}
              alt={`${title} - Before`}
              className="absolute inset-0 w-full h-full object-cover"
              draggable={false}
            />
          </div>

          {/* Slider handle */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-amber cursor-ew-resize"
            style={{ left: `${sliderPosition}%` }}
          >
            <button
              className={cn(
                'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
                'w-12 h-12 rounded-full bg-amber shadow-lg',
                'flex items-center justify-center',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                'hover:scale-110 transition-transform'
              )}
              onKeyDown={handleKeyDown}
              aria-label="Drag to compare before and after"
              aria-valuenow={Math.round(sliderPosition)}
              aria-valuemin={0}
              aria-valuemax={100}
              role="slider"
              tabIndex={0}
            >
              <svg className="w-6 h-6 text-bg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Labels */}
          <div className="absolute top-4 left-4 bg-bg/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-text-strong">
            Before
          </div>
          <div className="absolute top-4 right-4 bg-primary/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-bg">
            After
          </div>
        </div>
      </Container>
    </section>
  )
}

