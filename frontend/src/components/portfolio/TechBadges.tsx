import { motion } from 'framer-motion'
import * as Tooltip from '@radix-ui/react-tooltip'
import { Container } from '@/components/layout/Container'
import { Badge } from '@/components/ui/Badge'
import { fadeInUp, staggerChildren } from '@/lib/motionPresets'
import { useReducedMotionFlag } from '@/hooks/useReducedMotionFlag'
import type { Project } from '@/types/content'

interface TechBadgesProps {
  project: Project
}

export function TechBadges({ project }: TechBadgesProps) {
  const prefersReducedMotion = useReducedMotionFlag()

  return (
    <section className="py-12 border-y border-border">
      <Container>
        <motion.div {...fadeInUp}>
          <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">
            Built With
          </h3>

          <Tooltip.Provider delayDuration={200}>
            <motion.div
              {...staggerChildren(prefersReducedMotion ? 0 : 0.05)}
              className="flex flex-wrap gap-2"
            >
              {project.tech.map((tech, index) => (
                <Tooltip.Root key={index}>
                  <Tooltip.Trigger asChild>
                    <motion.div {...fadeInUp}>
                      <Badge variant="primary">{tech}</Badge>
                    </motion.div>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      className="bg-surface border border-border px-3 py-2 rounded-lg text-xs text-text-strong shadow-lg z-50"
                      sideOffset={5}
                    >
                      {tech}
                      <Tooltip.Arrow className="fill-border" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              ))}
            </motion.div>
          </Tooltip.Provider>
        </motion.div>
      </Container>
    </section>
  )
}

