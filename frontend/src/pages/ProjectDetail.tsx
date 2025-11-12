import { useMemo, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertCircle } from 'lucide-react'
import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/Button'
import { ProjectHeader } from '@/components/portfolio/ProjectHeader'
import { ProblemSolutionImpact } from '@/components/portfolio/ProblemSolutionImpact'
import { MediaGallery } from '@/components/portfolio/MediaGallery'
import { BeforeAfterSlider } from '@/components/portfolio/BeforeAfterSlider'
import { TechBadges } from '@/components/portfolio/TechBadges'
import { RelatedProjects } from '@/components/portfolio/RelatedProjects'
import { StickyMiniCTA } from '@/components/portfolio/StickyMiniCTA'
import { useProjects } from '@/hooks/data'
import { relatedProjects as getRelatedProjects } from '@/lib/data-utils'
import { fadeInUp } from '@/lib/motionPresets'
import { SkeletonGrid } from '@/components/ui/Skeleton'
import { ContentError } from '@/components/ui/ContentError'
import { Link } from 'react-router-dom'

export function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { allProjects, loading, error } = useProjects()

  const project = useMemo(() => {
    return allProjects.find((p) => p.slug === slug) || null
  }, [allProjects, slug])

  const related = useMemo(() => {
    return project ? getRelatedProjects(allProjects, project, 3) : []
  }, [allProjects, project])

  useEffect(() => {
    if (project) {
      window.plausible?.('project_view', { props: { slug } })
    }
  }, [project, slug])

  if (loading) {
    return (
      <div className="py-20">
        <Container>
          <SkeletonGrid rows={2} cols={3} />
        </Container>
      </div>
    )
  }

  if (error) {
    return (
      <Container>
        <ContentError error={error} onRetry={() => window.location.reload()} />
      </Container>
    )
  }

  if (!project) {
    return (
      <section className="py-32">
        <Container>
          <motion.div {...fadeInUp} className="text-center max-w-md mx-auto">
            <AlertCircle className="h-16 w-16 text-amber mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-text-strong mb-4">
              Project Not Found
            </h1>
            <p className="text-text-muted mb-8">
              The project you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/portfolio">
              <Button variant="primary">
                Back to Portfolio
              </Button>
            </Link>
          </motion.div>
        </Container>
      </section>
    )
  }

  const coverUrl = (project as any).cover?.url || ''
  const galleryImages = [
    coverUrl,
    ...((project.gallery as any[]) || []).map((g: any) => (typeof g === 'string' ? g : g?.url)),
  ].filter(Boolean) as string[]

  return (
    <>
      <ProjectHeader project={project} />

      <ProblemSolutionImpact project={project} />

      <MediaGallery images={galleryImages as any} title={project.title} />

      {project.hasBeforeAfter && (
        <BeforeAfterSlider
          beforeImage={(project.gallery[0] as any)?.url || (project.gallery[0] as any) || ''}
          afterImage={(project.gallery[1] as any)?.url || (project.gallery[1] as any) || ''}
          title={project.title}
        />
      )}

      <TechBadges project={project} />

      <RelatedProjects projects={related} />

      <StickyMiniCTA />
    </>
  )
}
