import { useState } from 'react'
import { motion } from 'framer-motion'
import { Server, Layers, Smartphone, TrendingUp, Code2, Bot } from 'lucide-react'
import { Container } from '@/components/layout/Container'
import { cn } from '@/lib/cn'
import { useReducedMotionFlag } from '@/hooks/useReducedMotionFlag'

interface CapabilitiesRibbonProps {
  items: string[]
}

const techIcons: Record<string, React.ComponentType<any>> = {
  'MERN': Server,
  'WordPress': Layers,
  'Mobile': Smartphone,
  'SEO': TrendingUp,
  'Python': Code2,
  'AI': Bot,
}

export function CapabilitiesRibbon({ items }: CapabilitiesRibbonProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const prefersReducedMotion = useReducedMotionFlag()

  const handleClick = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index)
    window.plausible?.('filter_applied', { props: { capability: items[index] } })
  }

  return (
    <section className="py-12">
      <Container>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-text-strong mb-4">
            Technologies We Master
          </h2>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {items.map((tech, i) => {
            const isActive = activeIndex === i
            const Icon = techIcons[tech] || Code2
            return (
              <motion.button
                key={i}
                onClick={() => handleClick(i)}
                className={cn(
                  'inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium border transition-all',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  isActive 
                    ? 'bg-primary/10 text-primary border-primary/20 shadow-inner' 
                    : 'bg-surface text-text-muted border-border hover:border-primary/30 hover:text-text-strong'
                )}
                whileHover={!prefersReducedMotion ? { scaleX: 0.98 } : {}}
                whileTap={!prefersReducedMotion ? { scale: 0.95 } : {}}
                transition={{ duration: 0.15 }}
              >
                <Icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-text-muted")} />
                <motion.span
                  animate={isActive && !prefersReducedMotion ? { x: 2 } : { x: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {tech}
                </motion.span>
              </motion.button>
            )
          })}
        </div>
      </Container>
    </section>
  )
}

