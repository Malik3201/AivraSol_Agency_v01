import { motion } from 'framer-motion'
import { Container } from '@/components/layout/Container'
import { SectionHeading } from '@/components/layout/SectionHeading'
import { ProjectCard } from './ProjectCard'
import { staggerChildren } from '@/lib/motionPresets'
import { useReducedMotionFlag } from '@/hooks/useReducedMotionFlag'
import type { Project } from '@/types/content'

interface RelatedProjectsProps {
  projects: Project[]
}

export function RelatedProjects({ projects }: RelatedProjectsProps) {
  const prefersReducedMotion = useReducedMotionFlag()

  if (projects.length === 0) return null

  return (
    <section className="py-20 bg-surface/30">
      <Container>
        <SectionHeading
          title="Related Projects"
          subtitle="More work in this space"
        />

        <motion.div
          {...staggerChildren(prefersReducedMotion ? 0 : 0.1)}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </motion.div>
      </Container>
    </section>
  )
}

