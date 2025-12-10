import { ServicesGrid } from '@/components/services/ServicesGrid'
import { ProcessTimeline } from '@/components/composite/ProcessTimeline'
import { CTABand } from '@/components/composite/CTABand'
import { useServices } from '@/hooks/data'
import { Container } from '@/components/layout/Container'
import { SkeletonGrid } from '@/components/ui/Skeleton'
import { ContentError } from '@/components/ui/ContentError'

const processSteps = [
  { step: 'Discover', desc: 'Goals, KPIs, scope & constraints' },
  { step: 'Prototype', desc: 'Clickable UI, fast feedback' },
  { step: 'Ship', desc: 'Prod-grade release & QA' },
  { step: 'Grow', desc: 'Analytics, SEO & iterations' },
]

const ctaData = {
  title: 'Ready to kickoff in 48–72 hours?',
  sub: 'Get started with a free consultation and project estimate.',
  primaryLabel: 'Get an Estimate',
  secondaryLabel: 'See Our Work',
}

export function Services() {
  const { data: services, loading, error } = useServices()

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

  return (
    <>
      <ServicesGrid services={services} />
      
      <ProcessTimeline steps={processSteps} />
      
      <CTABand data={ctaData} />
    </>
  )
}
