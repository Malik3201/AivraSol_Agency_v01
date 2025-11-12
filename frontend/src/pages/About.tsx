import { StoryTimeline } from '@/components/about/StoryTimeline'
import { ValuesGrid } from '@/components/about/ValuesGrid'
import { TeamGrid } from '@/components/about/TeamGrid'
import { TechWall } from '@/components/about/TechWall'
import { WhyUsCallouts } from '@/components/about/WhyUsCallouts'
import { AboutFinalCTA } from '@/components/about/AboutFinalCTA'
import { useAbout } from '@/hooks/data'
import { Container } from '@/components/layout/Container'
import { SkeletonGrid } from '@/components/ui/Skeleton'
import { ContentError } from '@/components/ui/ContentError'

export function About() {
  const { data, loading, error } = useAbout()

  if (loading) {
    return (
      <div className="py-20">
        <Container>
          <SkeletonGrid rows={2} cols={3} />
        </Container>
      </div>
    )
  }

  if (error || !data) {
    return (
      <Container>
        <ContentError error={error} onRetry={() => window.location.reload()} />
      </Container>
    )
  }

  return (
    <>
      <StoryTimeline items={data.story} />

      <ValuesGrid items={data.values} />

      <TeamGrid items={data.team} />

      <TechWall items={data.tech} />

      <WhyUsCallouts points={data.whyUs} />

      <AboutFinalCTA data={data.cta} />
    </>
  )
}
