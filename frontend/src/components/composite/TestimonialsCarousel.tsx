import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Container } from '@/components/layout/Container'
import { SectionHeading } from '@/components/layout/SectionHeading'
import { useReducedMotionFlag } from '@/hooks/useReducedMotionFlag'
interface Testimonial {
  quote: string
  author: string
  role: string
  avatarUrl?: string
}

interface TestimonialsCarouselProps {
  items: Testimonial[]
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function TestimonialsCarousel({ items }: TestimonialsCarouselProps) {
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const prefersReducedMotion = useReducedMotionFlag()

  if (!items || items.length === 0) {
    return null
  }

  useEffect(() => {
    if (prefersReducedMotion || isPaused || items.length === 0) return

    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % items.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [items.length, prefersReducedMotion, isPaused])

  const next = () => items.length > 0 && setCurrent((prev) => (prev + 1) % items.length)
  const prev = () => items.length > 0 && setCurrent((prev) => (prev - 1 + items.length) % items.length)

  return (
    <section 
      className="py-20 bg-surface/50"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <Container size="md">
        <SectionHeading 
          title="Client Testimonials"
          subtitle="Hear what our clients say about working with us"
        />

        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-8 md:p-12 relative">
                <Quote className="absolute top-6 right-6 h-12 w-12 text-primary/10" />
                
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className="h-4 w-4 fill-amber text-amber" 
                    />
                  ))}
                </div>

                <p className="text-xl md:text-2xl text-text-strong mb-8 leading-relaxed relative z-10">
                  "{items[current].quote}"
                </p>

                <div className="flex items-center gap-4">
                  {items[current].avatarUrl ? (
                    <img
                      src={items[current].avatarUrl!}
                      alt={items[current].author}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div 
                      className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm"
                      style={{
                        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                      }}
                    >
                      {getInitials(items[current].author)}
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-text-strong">
                      {items[current].author}
                    </div>
                    <div className="text-sm text-text-muted">
                      {items[current].role}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center hover:bg-card hover:border-primary/30 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-5 w-5 text-text-muted" />
            </button>

            <div className="flex gap-2">
              {items.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrent(index)}
                  className={`h-2 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    index === current ? 'bg-primary w-8' : 'bg-border w-2'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center hover:bg-card hover:border-primary/30 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-5 w-5 text-text-muted" />
            </button>
          </div>
        </div>
      </Container>
    </section>
  )
}
