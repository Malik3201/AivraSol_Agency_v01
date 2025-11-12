import { motion } from 'framer-motion'
import { Container } from '@/components/layout/Container'
import { SectionHeading } from '@/components/layout/SectionHeading'
import { fadeInUp, staggerChildren } from '@/lib/motionPresets'
import { useReducedMotionFlag } from '@/hooks/useReducedMotionFlag'
import type { Project } from '@/types/content'

interface ProblemSolutionImpactProps {
  project: Project
}

export function ProblemSolutionImpact({ project }: ProblemSolutionImpactProps) {
  const prefersReducedMotion = useReducedMotionFlag()

  const sections = [
    { key: 'problem', title: 'Problem', content: project.problem },
    { key: 'solution', title: 'Solution', content: project.solution },
    { key: 'impact', title: 'Impact', content: project.impact }
  ]

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Soft angled gradient background */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          background:
            'linear-gradient(135deg, var(--primary) 0%, transparent 40%, transparent 60%, var(--amber) 100%)'
        }}
      />

      <Container>
        <motion.div
          {...staggerChildren(prefersReducedMotion ? 0 : 0.15)}
          className="grid md:grid-cols-3 gap-12"
        >
          {sections.map((section) => (
            <motion.div key={section.key} {...fadeInUp}>
              <SectionHeading
                title={section.title}
                subtitle=""
                align="left"
              />
              <p className="text-text-muted leading-relaxed mt-4">
                {section.content}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  )
}

