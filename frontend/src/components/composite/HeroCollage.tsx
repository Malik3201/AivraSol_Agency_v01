import { motion, useMotionValue, useSpring, useInView } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Container } from '@/components/layout/Container'
import { fadeInUp, staggerChildren, getMotionProps } from '@/lib/motionPresets'
import { useReducedMotionFlag } from '@/hooks/useReducedMotionFlag'
interface CollageItem {
  title: string
  kpi: string
}

interface HeroData {
  title: string
  sub: string
  primaryCta: { label: string; to: string }
  secondaryCta: { label: string; to: string }
  collage: CollageItem[]
}

interface HeroCollageProps {
  data: HeroData
}

export function HeroCollage({ data }: HeroCollageProps) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springConfig = { damping: 25, stiffness: 150 }
  const x = useSpring(mouseX, springConfig)
  const y = useSpring(mouseY, springConfig)
  const prefersReducedMotion = useReducedMotionFlag()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return
    const rect = e.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    mouseX.set((e.clientX - centerX) * 0.02)
    mouseY.set((e.clientY - centerY) * 0.02)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  const handlePrimaryCTA = () => {
    window.plausible?.('hero_cta_click', { props: { cta: 'primary' } })
  }

  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h20v20H0z\' fill=\'none\'/%3E%3Cpath d=\'M10 0v20M0 10h20\' stroke=\'%23fff\' stroke-width=\'0.5\' opacity=\'0.1\'/%3E%3C/svg%3E")',
          backgroundSize: '20px 20px',
        }} />
      </div>
      
      <Container>
        <div 
          ref={ref}
          className="grid lg:grid-cols-2 gap-12 items-center"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <motion.div {...getMotionProps(staggerChildren(0.15))}>
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-text-strong mb-6 leading-[1.1]"
              {...getMotionProps(fadeInUp)}
            >
              {data.title}
            </motion.h1>
            <motion.p 
              className="text-lg md:text-xl text-text-muted mb-8 max-w-xl leading-relaxed"
              {...getMotionProps(fadeInUp)}
            >
              {data.sub}
            </motion.p>
            <motion.div 
              className="flex flex-wrap gap-4"
              {...getMotionProps(fadeInUp)}
            >
              <Link to={data.primaryCta.to} onClick={handlePrimaryCTA}>
                <Button variant="primary" magnetic>
                  {data.primaryCta.label} <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to={data.secondaryCta.to}>
                <Button variant="ghost" className="group">
                  {data.secondaryCta.label}
                  <span className="inline-block transition-transform group-hover:translate-x-1">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          <div className="relative h-[500px] hidden lg:block">
            {data.collage.map((item, index) => {
              const positions = [
                { top: '0', right: '0', width: '16rem', height: '16rem', delay: 0, needsTransform: false },
                { bottom: '0', left: '0', width: '14rem', height: '14rem', delay: 0.15, needsTransform: false },
                { top: '50%', left: '50%', width: '12rem', height: '12rem', delay: 0.3, needsTransform: true },
              ]
              const pos = positions[index] || positions[0]
              const { needsTransform, delay, ...styleProps } = pos

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, clipPath: 'inset(0 100% 0 0)' }}
                  animate={isInView ? { 
                    opacity: 1, 
                    clipPath: 'inset(0 0% 0 0)',
                  } : {}}
                  transition={{ 
                    duration: 0.8, 
                    delay: prefersReducedMotion ? 0 : delay,
                    ease: [0.22, 1, 0.36, 1] 
                  }}
                  style={{
                    position: 'absolute' as const,
                    ...styleProps,
                    ...(needsTransform && { transform: 'translate(-50%, -50%)' }),
                  }}
                  className="w-auto h-auto"
                >
                  <motion.div
                    style={!prefersReducedMotion ? { 
                      x: index === 1 ? x.get() * -1.5 : index === 0 ? x : x.get() * 0.8,
                      y: index === 1 ? y.get() * -1.5 : index === 0 ? y : y.get() * 0.8,
                    } : {}}
                  >
                    <Card 
                      className="p-4 bg-gradient-to-br from-card to-surface border-primary/20 relative overflow-hidden group"
                      style={{ width: pos.width, height: pos.height }}
                    >
                      <div 
                        className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50 group-hover:opacity-70 transition-opacity"
                      />
                      
                      {/* Dummy Project Visual */}
                      <div className="absolute inset-0 p-4 flex items-center justify-center opacity-30">
                        {index === 0 && (
                          <svg className="w-full h-full" viewBox="0 0 200 200" fill="none">
                            <rect x="10" y="20" width="180" height="120" rx="8" stroke="var(--primary)" strokeWidth="2" opacity="0.3"/>
                            <rect x="20" y="30" width="160" height="30" rx="4" fill="var(--primary)" opacity="0.2"/>
                            <circle cx="40" cy="80" r="15" fill="var(--amber)" opacity="0.3"/>
                            <rect x="65" y="70" width="100" height="8" rx="4" fill="var(--primary)" opacity="0.2"/>
                            <rect x="65" y="85" width="80" height="8" rx="4" fill="var(--primary)" opacity="0.15"/>
                            <rect x="20" y="110" width="50" height="20" rx="4" fill="var(--amber)" opacity="0.25"/>
                          </svg>
                        )}
                        {index === 1 && (
                          <svg className="w-full h-full" viewBox="0 0 200 200" fill="none">
                            <path d="M20 50 L180 50 L180 150 L20 150 Z" stroke="var(--amber)" strokeWidth="2" opacity="0.3"/>
                            <circle cx="100" cy="100" r="30" stroke="var(--primary)" strokeWidth="3" opacity="0.4"/>
                            <path d="M70 100 L100 130 L140 80" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" opacity="0.4"/>
                            <rect x="60" y="30" width="80" height="6" rx="3" fill="var(--amber)" opacity="0.3"/>
                          </svg>
                        )}
                        {index === 2 && (
                          <svg className="w-full h-full" viewBox="0 0 200 200" fill="none">
                            <rect x="30" y="40" width="40" height="100" rx="4" fill="var(--primary)" opacity="0.2"/>
                            <rect x="80" y="70" width="40" height="70" rx="4" fill="var(--amber)" opacity="0.25"/>
                            <rect x="130" y="50" width="40" height="90" rx="4" fill="var(--primary)" opacity="0.3"/>
                            <path d="M30 140 Q100 80 170 140" stroke="var(--primary)" strokeWidth="2" opacity="0.4"/>
                          </svg>
                        )}
                      </div>
                      
                      <div className="relative z-10 h-full flex flex-col justify-between">
                        <div className="text-sm font-semibold text-text-strong bg-bg/80 backdrop-blur-sm px-2 py-1 rounded self-start">
                          {item.title}
                        </div>
                        <div className="text-xs font-medium text-primary bg-bg/80 backdrop-blur-sm px-2 py-1 rounded self-end">
                          {item.kpi}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </Container>
    </section>
  )
}
