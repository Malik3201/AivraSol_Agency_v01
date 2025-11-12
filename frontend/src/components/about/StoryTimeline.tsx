import { useRef, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { Container } from '@/components/layout/Container'
import { SectionHeading } from '@/components/layout/SectionHeading'
import { fadeInUp, getMotionProps } from '@/lib/motionPresets'
import { useReducedMotionFlag } from '@/hooks/useReducedMotionFlag'
import type { StoryItem } from '@/types/content'

interface StoryTimelineProps {
  items: StoryItem[]
}

export function StoryTimeline({ items }: StoryTimelineProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })
  const prefersReducedMotion = useReducedMotionFlag()

  useEffect(() => {
    if (isInView) {
      window.plausible?.('about_timeline_view')
    }
  }, [isInView])

  return (
    <section className="py-20 bg-surface/50 relative overflow-hidden">
      {/* Diagonal hatch background */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 60 L60 0 M30 60 L60 30' stroke='white' stroke-width='1' opacity='0.5'/%3E%3C/svg%3E")`,
        }} />
      </div>

      <Container className="relative z-10">
        <SectionHeading
          title="Our Story"
          subtitle="Built by engineers, for ambitious teams"
        />

        <div ref={ref} className="relative">
          {/* Desktop: Horizontal timeline with SVG connectors */}
          <div className="hidden lg:grid lg:grid-cols-3 gap-8 relative">
            {/* SVG Path connecting cards */}
            <svg className="absolute -top-8 left-0 right-0 h-2 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 1000 20">
              <motion.path
                d="M 0 10 L 340 10 L 350 15 L 500 15 L 510 10 L 660 10 L 670 15 L 1000 15"
                stroke="var(--primary)"
                strokeWidth="2"
                fill="none"
                strokeDasharray="8 4"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={isInView ? { pathLength: 1, opacity: 0.6 } : {}}
                transition={{
                  duration: prefersReducedMotion ? 0 : 2,
                  ease: [0.22, 1, 0.36, 1],
                  delay: 0.5,
                }}
              />
            </svg>

            {items.map((item, index) => (
              <motion.div
                key={index}
                {...getMotionProps(fadeInUp)}
                transition={{ delay: index * 0.2 }}
                className="relative"
              >
                {/* Connection dot */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-primary border-4 border-bg z-10" />
                
                <Card className="relative border-l-4 border-l-amber shadow-xl bg-gradient-to-br from-card to-surface hover:shadow-2xl transition-shadow">
                  <div className="absolute -top-3 -left-3 bg-amber text-bg px-4 py-1.5 rounded-full text-xs font-bold shadow-lg">
                    {item.year}
                  </div>
                  <div className="pt-2">
                    <h3 className="text-xl font-semibold text-text-strong mb-3">{item.title}</h3>
                    <p className="text-text-muted leading-relaxed text-sm">{item.copy}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Mobile: Vertical timeline */}
          <div className="lg:hidden space-y-8">
            {items.map((item, index) => (
              <motion.div
                key={index}
                {...getMotionProps(fadeInUp)}
                transition={{ delay: index * 0.15 }}
                className="relative pl-12"
              >
                <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/30">
                  <div className="w-4 h-4 rounded-full bg-primary" />
                </div>
                {index < items.length - 1 && (
                  <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-gradient-to-b from-primary/50 to-transparent" />
                )}
                <Card className="border-l-4 border-l-amber shadow-lg bg-gradient-to-br from-card to-surface">
                  <div className="mb-3">
                    <div className="bg-amber text-bg px-3 py-1 rounded-full text-xs font-bold inline-block">
                      {item.year}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-text-strong mb-2">{item.title}</h3>
                  <p className="text-text-muted leading-relaxed text-sm">{item.copy}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}

