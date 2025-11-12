import { motion } from 'framer-motion'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { Card } from '@/components/ui/Card'
import { Chip } from '@/components/ui/Chip'
import { Container } from '@/components/layout/Container'
import { SectionHeading } from '@/components/layout/SectionHeading'
import { fadeInUp, staggerChildren, getMotionProps } from '@/lib/motionPresets'
import { useReducedMotionFlag } from '@/hooks/useReducedMotionFlag'
import type { TeamMember } from '@/types/content'

interface TeamGridProps {
  items: TeamMember[]
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function TeamGrid({ items }: TeamGridProps) {
  const prefersReducedMotion = useReducedMotionFlag()

  return (
    <section className="py-20 bg-surface/50">
      <Container>
        <SectionHeading
          title="Meet the Team"
          subtitle="The talented people behind our success"
        />

        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          {...getMotionProps(staggerChildren(0.1))}
        >
          {items.map((member, index) => (
            <motion.div key={index} {...getMotionProps(fadeInUp)}>
              <TooltipPrimitive.Provider delayDuration={200}>
                <TooltipPrimitive.Root>
                  <TooltipPrimitive.Trigger asChild>
                    <motion.div
                      whileHover={!prefersReducedMotion ? {
                        rotateY: 3,
                        rotateX: -3,
                        scale: 1.02,
                      } : {}}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <Card 
                        className="text-center cursor-pointer"
                        tabIndex={0}
                        role="button"
                        aria-label={`${member.name}, ${member.role}`}
                      >
                        {/* Hex avatar mask */}
                        <div 
                          className="w-24 h-24 mx-auto mb-4 flex items-center justify-center bg-gradient-to-br from-primary/20 to-amber/20 text-primary font-bold text-xl"
                          style={{
                            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                          }}
                        >
                          {getInitials(member.name)}
                        </div>

                        <h3 className="text-xl font-semibold text-text-strong mb-1">
                          {member.name}
                        </h3>
                        <p className="text-sm text-text-muted mb-3">
                          {member.role}
                        </p>

                        <Chip variant="primary" className="text-xs">
                          {member.superpower}
                        </Chip>
                      </Card>
                    </motion.div>
                  </TooltipPrimitive.Trigger>
                  
                  <TooltipPrimitive.Portal>
                    <TooltipPrimitive.Content
                      side="top"
                      className="z-50 overflow-hidden rounded-lg bg-surface px-3 py-2 text-sm text-text-strong shadow-xl border border-border max-w-xs"
                      sideOffset={5}
                    >
                      <span className="font-semibold">{member.name}</span> excels at <span className="text-primary">{member.superpower}</span>
                      <TooltipPrimitive.Arrow className="fill-border" />
                    </TooltipPrimitive.Content>
                  </TooltipPrimitive.Portal>
                </TooltipPrimitive.Root>
              </TooltipPrimitive.Provider>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  )
}

