import { motion, useInView } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useRef, useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/layout/Container'
import { SectionHeading } from '@/components/layout/SectionHeading'
import { fadeInUp, getMotionProps } from '@/lib/motionPresets'
import { useReducedMotionFlag } from '@/hooks/useReducedMotionFlag'
interface FeaturedProject {
  title: string
  summary?: string
  coverUrl?: string
  slug?: string
}

interface CaseStudyHighlightsProps {
  items: FeaturedProject[]
}

function CountUpNumber({ value, duration = 2000 }: { value: string; duration?: number }) {
  const [displayValue, setDisplayValue] = useState('0')
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.5 })
  const prefersReducedMotion = useReducedMotionFlag()
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    if (!isInView || hasAnimated) return
    setHasAnimated(true)

    if (prefersReducedMotion) {
      setDisplayValue(value)
      return
    }

    const numericMatch = value.match(/[\d.]+/)
    if (!numericMatch) {
      setDisplayValue(value)
      return
    }

    const target = parseFloat(numericMatch[0])
    const prefix = value.slice(0, numericMatch.index)
    const suffix = value.slice((numericMatch.index || 0) + numericMatch[0].length)

    let startTime: number | null = null
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      
      const current = progress * target
      setDisplayValue(`${prefix}${current.toFixed(target % 1 === 0 ? 0 : 1)}${suffix}`)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setDisplayValue(value)
      }
    }

    requestAnimationFrame(animate)
  }, [isInView, value, duration, prefersReducedMotion, hasAnimated])

  return <div ref={ref}>{displayValue}</div>
}

export function CaseStudyHighlights({ items }: CaseStudyHighlightsProps) {
  const prefersReducedMotion = useReducedMotionFlag()

  const handleProjectView = (title: string, inView: boolean) => {
    if (inView) {
      window.plausible?.('project_view', { props: { project: title } })
    }
  }

  return (
    <section className="py-20">
      <Container>
        <SectionHeading 
          title="Featured Projects"
          subtitle="Real results from our latest work"
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {items.map((project, index) => {
            const ref = useRef(null)
            const isInView = useInView(ref, { once: true, amount: 0.3 })

            useEffect(() => {
              handleProjectView(project.title, isInView)
            }, [isInView, project.title])

            const isOffset = index === 1
            
            return (
              <motion.div 
                key={index} 
                ref={ref}
                {...getMotionProps(fadeInUp)} 
                transition={{ delay: index * 0.1 }}
                className={`${isOffset ? 'lg:mt-12' : ''}`}
              >
                <Card hoverable className="h-full overflow-hidden group flex flex-col">
                  <div className="w-full h-48 rounded-xl mb-4 overflow-hidden relative bg-gradient-to-br from-surface to-card">
                    <motion.div 
                      className="w-full h-full relative"
                      whileHover={!prefersReducedMotion ? { scale: 1.02 } : {}}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {project.coverUrl ? (
                        <img src={project.coverUrl} alt={project.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/10 to-amber/5" />
                      )}
                    </motion.div>
                  </div>

                  <h3 className="text-lg font-semibold text-text-strong mb-2">
                    {project.title}
                  </h3>
                  {project.summary && (
                    <p className="text-text-muted mb-4 line-clamp-2">
                      {project.summary}
                    </p>
                  )}

                  <div className="mt-auto">
                    <Link to="/portfolio" className="inline-flex items-center gap-2 text-primary text-sm font-medium group-hover:gap-3 transition-all">
                      View Details <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>

        <div className="text-center">
          <Link to="/portfolio">
            <Button variant="ghost">
              View All Projects <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </Container>
    </section>
  )
}
