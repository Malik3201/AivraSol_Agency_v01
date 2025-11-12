import { useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Chip } from '@/components/ui/Chip'
import { useReducedMotionFlag } from '@/hooks/useReducedMotionFlag'
import { formatKPI } from '@/lib/data-utils'
import { cn } from '@/lib/cn'
import type { Project } from '@/types/content'

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })
  const prefersReducedMotion = useReducedMotionFlag()

  useEffect(() => {
    if (isInView) {
      window.plausible?.('project_card_view', { props: { slug: project.slug } })
    }
  }, [isInView, project.slug])

  // Get all taxonomy items (category + industries + tech)
  const allTags = [
    { label: (project as any).categorySlug ?? (project as any).category, type: 'category' },
    ...project.industries.slice(0, 1).map(ind => ({ label: ind, type: 'industry' })),
    ...project.tech.slice(0, 1).map(tech => ({ label: tech, type: 'tech' }))
  ]
  const visibleTags = allTags.slice(0, 3)
  const overflowCount = Math.max(0, 
    (project.industries.length - 1) + 
    (project.tech.length - 1) + 
    (allTags.length - 3)
  )

  // Format KPI safely
  const kpiData = project.kpis.length > 0 ? formatKPI(project.kpis[0].value as any) : null

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="group"
    >
      <Link 
        to={`/portfolio/${project.slug}`} 
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-2xl"
      >
        <Card className="h-full flex flex-col overflow-hidden rounded-2xl shadow-md hover:shadow-lg transition-shadow">
          {/* Cover image with fixed 16:9 aspect ratio */}
          <div className="relative w-full aspect-[16/9] overflow-hidden bg-gradient-to-br from-surface to-card">
            <motion.img
              src={(project as any).cover?.url || (project as any).cover || ''}
              alt={((project as any).cover?.alt as string) || project.title}
              loading="lazy"
              width={640}
              height={360}
              className="w-full h-full object-cover"
              initial={{ scale: 1 }}
              whileHover={!prefersReducedMotion ? { scale: 1.02, y: -2 } : {}}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            />

            {/* KPI Badge positioned top-right */}
            {kpiData && (
              <div className="absolute top-3 right-3 bg-bg/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
                <div className="text-xs font-bold text-primary">
                  {kpiData.displayValue}
                </div>
              </div>
            )}

            {/* Micro shimmer on hover */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(233, 162, 59, 0.05), transparent)',
                animation: 'shimmer 2s linear infinite',
              }}
            />
          </div>

          {/* Content */}
          <div className="flex flex-col flex-1 p-5">
            <h3 className="text-lg font-semibold text-text-strong mb-2 group-hover:text-primary transition-colors line-clamp-1">
              {project.title}
            </h3>
            <p className="text-text-muted text-sm leading-relaxed mb-4 line-clamp-2 flex-1">
              {project.summary}
            </p>

            {/* Taxonomy chips - max 3 with overflow */}
            <div className="flex flex-wrap gap-2 mb-4">
              {visibleTags.map((tag, i) => (
                <Chip 
                  key={i} 
                  variant={tag.type === 'category' ? 'primary' : 'muted'} 
                  size="sm"
                >
                  {tag.label}
                </Chip>
              ))}
              {overflowCount > 0 && (
                <Chip variant="muted" size="sm">
                  +{overflowCount}
                </Chip>
              )}
            </div>

            {/* CTA - arrow slides on hover */}
            <div className="flex items-center gap-2 text-primary text-sm font-medium group">
              <span>View project</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  )
}

