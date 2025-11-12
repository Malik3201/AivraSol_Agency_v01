import { motion } from 'framer-motion'
import { Code2, FileCode, Server, Database, Palette, Sparkles } from 'lucide-react'
import { Container } from '@/components/layout/Container'
import { SectionHeading } from '@/components/layout/SectionHeading'
import { useReducedMotionFlag } from '@/hooks/useReducedMotionFlag'

interface TechWallProps {
  items: string[]
}

const techIconMap: Record<string, React.ComponentType<any>> = {
  'React': Code2,
  'TypeScript': FileCode,
  'Node.js': Server,
  'MongoDB': Database,
  'Tailwind': Palette,
  'Framer Motion': Sparkles,
}

export function TechWall({ items }: TechWallProps) {
  const prefersReducedMotion = useReducedMotionFlag()

  return (
    <section className="py-20">
      <Container>
        <SectionHeading
          title="Technology Stack"
          subtitle="Modern, proven tools we work with daily"
        />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {items.map((tech, index) => {
            const floatDelay = index * 0.2
            const floatDuration = 3 + (index % 3) * 0.5
            const Icon = techIconMap[tech] || Code2

            return (
              <motion.div
                key={index}
                className="group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
              >
                <motion.div
                  className="aspect-square rounded-2xl bg-surface border border-border flex flex-col items-center justify-center p-4 hover:border-primary/30 transition-colors grayscale hover:grayscale-0"
                  animate={!prefersReducedMotion ? {
                    y: [0, -4, 0],
                  } : {}}
                  transition={{
                    duration: floatDuration,
                    repeat: Infinity,
                    delay: floatDelay,
                    ease: "easeInOut"
                  }}
                  aria-label={tech}
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-xs font-medium text-text-strong text-center">
                    {tech}
                  </div>
                </motion.div>
              </motion.div>
            )
          })}
        </div>
      </Container>
    </section>
  )
}

