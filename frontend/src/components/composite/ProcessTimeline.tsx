import { motion, useInView } from 'framer-motion'
import { Lightbulb, PenTool, Rocket, TrendingUp } from 'lucide-react'
import { useRef } from 'react'
import { Container } from '@/components/layout/Container'
import { SectionHeading } from '@/components/layout/SectionHeading'
import { fadeInUp, getMotionProps } from '@/lib/motionPresets'
import { useReducedMotionFlag } from '@/hooks/useReducedMotionFlag'
interface ProcessStep {
  step: string
  desc: string
}

interface ProcessTimelineProps {
  steps: ProcessStep[]
}

const iconMap = [Lightbulb, PenTool, Rocket, TrendingUp]

export function ProcessTimeline({ steps }: ProcessTimelineProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })
  const prefersReducedMotion = useReducedMotionFlag()

  return (
    <section className="py-20 bg-surface/50">
      <Container>
        <SectionHeading 
          title="Our Process"
          subtitle="A proven methodology that delivers exceptional results"
        />
        
        <div ref={ref} className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          <svg 
            className="absolute top-16 left-0 right-0 h-0.5 hidden lg:block pointer-events-none" 
            style={{ transform: 'translateY(-50%)' }}
            preserveAspectRatio="none"
            viewBox="0 0 1000 2"
          >
            <motion.path
              d="M 0 1 L 1000 1"
              stroke="url(#gradient)"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
              transition={{ 
                duration: prefersReducedMotion ? 0 : 1.5, 
                ease: [0.22, 1, 0.36, 1],
                delay: 0.3 
              }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--primary)" />
                <stop offset="50%" stopColor="var(--amber)" />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.5" />
              </linearGradient>
            </defs>
          </svg>

          {steps.map((step, index) => {
            const Icon = iconMap[index] || Lightbulb
            return (
              <motion.div 
                key={index} 
                className="relative"
                {...getMotionProps(fadeInUp)}
                transition={{ delay: index * 0.15 }}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-card border-2 border-primary/30 flex items-center justify-center mb-4 relative z-10">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                  <div className="text-sm font-bold text-amber mb-2">
                    Step {index + 1}
                  </div>
                  <h3 className="text-xl font-semibold text-text-strong mb-3">
                    {step.step}
                  </h3>
                  <p className="text-sm text-text-muted">
                    {step.desc}
                  </p>
                </div>

                {index < steps.length - 1 && (
                  <svg 
                    className="hidden lg:block absolute top-16 -right-4 w-8 h-8 text-border" 
                    style={{ transform: 'translate(0, -50%)' }}
                  >
                    <motion.line 
                      x1="0" 
                      y1="4" 
                      x2="32" 
                      y2="4" 
                      stroke="currentColor" 
                      strokeWidth="2"
                      strokeDasharray="4 2"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
                      transition={{ 
                        duration: prefersReducedMotion ? 0 : 0.8,
                        delay: 0.5 + index * 0.2,
                        ease: [0.22, 1, 0.36, 1]
                      }}
                    />
                  </svg>
                )}
              </motion.div>
            )
          })}
        </div>
      </Container>
    </section>
  )
}
