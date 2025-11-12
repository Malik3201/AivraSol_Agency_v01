import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ExternalLink, Github } from 'lucide-react'
import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/Button'
import { KPIChip } from '@/components/ui/KPIChip'
import { useMagneticHover } from '@/hooks/useMagneticHover'
import { fadeInUp } from '@/lib/motionPresets'
import { useReducedMotionFlag } from '@/hooks/useReducedMotionFlag'
import type { Project } from '@/types/content'

interface ProjectHeaderProps {
  project: Project
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  const prefersReducedMotion = useReducedMotionFlag()
  const { ref: liveRef, style: liveStyle } = useMagneticHover<HTMLAnchorElement>(3)
  const { ref: githubRef, style: githubStyle } = useMagneticHover<HTMLAnchorElement>(3)

  return (
    <section className="py-12 border-b border-border">
      <Container>
        {/* Breadcrumb */}
        <motion.div {...fadeInUp} className="mb-6">
          <Link
            to="/portfolio"
            className="inline-flex items-center gap-2 text-text-muted hover:text-primary transition-colors text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Portfolio</span>
          </Link>
        </motion.div>

        <motion.div
          {...fadeInUp}
          transition={{ delay: 0.1 }}
          className="grid lg:grid-cols-2 gap-8 items-start"
        >
          {/* Left: Title + Summary */}
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-text-strong mb-4 leading-tight">
              {project.title}
            </h1>
            <p className="text-lg text-text-muted leading-relaxed">
              {project.summary}
            </p>
          </div>

          {/* Right: Cover image + KPIs + Links */}
          <div className="space-y-6">
            {(project as any).cover?.url && (
              <div className="w-full overflow-hidden rounded-xl border border-border">
                <img
                  src={(project as any).cover.url}
                  alt={`${project.title} cover`}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}

            {/* KPI Chips */}
            {project.kpis.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {project.kpis.slice(0, 3).map((kpi, i) => (
                  <KPIChip
                    key={i}
                    label={kpi.label}
                    value={kpi.value}
                    animateOnReveal={true}
                  />
                ))}
              </div>
            )}

            {/* Action Buttons */}
            {(project.links?.live || project.links?.github) && (
              <div className="flex flex-wrap gap-3">
                {project.links.live && (
                  <a
                    ref={liveRef}
                    href={project.links.live}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={!prefersReducedMotion ? liveStyle : {}}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
                    onClick={() => {
                      window.plausible?.('project_link_click', {
                        props: { slug: project.slug, type: 'live' }
                      })
                    }}
                  >
                    <Button variant="primary" magnetic={false}>
                      <ExternalLink className="h-4 w-4" />
                      Open Demo
                    </Button>
                  </a>
                )}

                {project.links.github && (
                  <a
                    ref={githubRef}
                    href={project.links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={!prefersReducedMotion ? githubStyle : {}}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
                    onClick={() => {
                      window.plausible?.('project_link_click', {
                        props: { slug: project.slug, type: 'github' }
                      })
                    }}
                  >
                    <Button variant="ghost">
                      <Github className="h-4 w-4" />
                      View Code
                    </Button>
                  </a>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </Container>
    </section>
  )
}

