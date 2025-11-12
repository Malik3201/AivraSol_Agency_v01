import { motion } from 'framer-motion'
import { PenTool, Zap, Target } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Container } from '@/components/layout/Container'
import { SectionHeading } from '@/components/layout/SectionHeading'
import { fadeInUp, staggerChildren, getMotionProps } from '@/lib/motionPresets'
import type { ValueItem } from '@/types/content'

interface ValuesGridProps {
  items: ValueItem[]
}

const iconMap: Record<string, React.ComponentType<any>> = {
  'pen-tool': PenTool,
  'zap': Zap,
  'target': Target,
}

export function ValuesGrid({ items }: ValuesGridProps) {
  return (
    <section className="py-20">
      <Container>
        <SectionHeading
          title="Our Values"
          subtitle="The principles that guide everything we do"
        />

        <motion.div
          className="grid md:grid-cols-3 gap-6"
          {...getMotionProps(staggerChildren(0.12))}
        >
          {items.map((value, index) => {
            const Icon = iconMap[value.icon] || Target
            return (
              <motion.div key={index} {...getMotionProps(fadeInUp)}>
                <Card hoverable className="h-full group relative overflow-hidden">
                  <div className="relative">
                    {/* Stroke-only custom SVG icon */}
                    <div className="w-16 h-16 rounded-2xl border-2 border-primary/30 flex items-center justify-center mb-4 group-hover:border-primary/50 transition-colors">
                      <Icon className="h-8 w-8 text-primary" strokeWidth={1.5} />
                    </div>

                    <div className="relative inline-block mb-3">
                      <h3 className="text-2xl font-semibold text-text-strong">
                        {value.title}
                      </h3>
                      {/* Hand-drawn underline */}
                      <svg
                        className="absolute -bottom-1 left-0 w-full h-2 overflow-visible"
                        viewBox="0 0 100 4"
                        preserveAspectRatio="none"
                      >
                        <motion.path
                          d="M 0 2 Q 25 1, 50 2 T 100 2"
                          stroke="var(--amber)"
                          strokeWidth="1.5"
                          fill="none"
                          strokeLinecap="round"
                          initial={{ pathLength: 0, opacity: 0 }}
                          whileInView={{ pathLength: 1, opacity: 0.5 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                        />
                      </svg>
                    </div>

                    <p className="text-text-muted leading-relaxed">
                      {value.copy}
                    </p>
                  </div>

                  {/* Subtle hover inner shadow effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className="absolute inset-0 shadow-inner" style={{
                      boxShadow: 'inset 0 2px 8px rgba(43, 182, 115, 0.05)'
                    }} />
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      </Container>
    </section>
  )
}

