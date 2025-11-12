import { motion } from 'framer-motion'
import { Code2, LayoutDashboard, Smartphone, Sparkles, Cpu, Bot, ArrowRight } from 'lucide-react'
import { useState, useRef } from 'react'
import { Card } from '@/components/ui/Card'
import { Container } from '@/components/layout/Container'
import { SectionHeading } from '@/components/layout/SectionHeading'
import { fadeInUp, staggerChildren, getMotionProps } from '@/lib/motionPresets'
import { useReducedMotionFlag } from '@/hooks/useReducedMotionFlag'
import { useNavigate } from 'react-router-dom'
interface Service {
  icon: string
  title: string
  benefit: string
  slug: string
}

interface ServicesGridProps {
  items: Service[]
}

const iconMap: Record<string, React.ComponentType<any>> = {
  'code-2': Code2,
  'layout-dashboard': LayoutDashboard,
  'smartphone': Smartphone,
  'sparkles': Sparkles,
  'cpu': Cpu,
  'bot': Bot,
}

function MagneticArrow() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const ref = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotionFlag()

  const handleMouseMove = (e: React.MouseEvent) => {
    if (prefersReducedMotion || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    setPosition({
      x: (e.clientX - centerX) * 0.15,
      y: (e.clientY - centerY) * 0.15,
    })
  }

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 })
  }

  return (
    <div 
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="inline-flex"
    >
      <motion.div
        animate={{ x: position.x, y: position.y }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <ArrowRight className="h-4 w-4" />
      </motion.div>
    </div>
  )
}

export function ServicesGrid({ items }: ServicesGridProps) {
  const navigate = useNavigate()
  const handleServiceClick = (slug: string) => {
    window.plausible?.('services_cta_click', { props: { service: slug } })
    navigate(`/services/${slug}`)
  }

  return (
    <section className="py-20">
      <Container>
        <SectionHeading 
          title="Our Services"
          subtitle="Comprehensive digital solutions tailored to your business needs"
        />
        
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          {...getMotionProps(staggerChildren(0.08))}
        >
          {items.map((service, index) => {
            const Icon = iconMap[service.icon] || Code2
            return (
              <motion.div key={index} {...getMotionProps(fadeInUp)}>
                <Card 
                  hoverable 
                  className="h-full group relative overflow-hidden cursor-pointer"
                  onClick={() => handleServiceClick(service.slug)}
                >
                  <div className="absolute top-0 left-0 w-12 h-0.5 bg-amber" />
                  
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(233, 162, 59, 0.08), transparent)',
                      animation: 'shimmer 2s linear infinite',
                    }}
                  />

                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-text-strong mb-2">
                      {service.title}
                    </h3>
                    <p className="text-text-muted leading-relaxed mb-4">
                      {service.benefit}
                    </p>
                    <div className="flex items-center gap-2 text-primary text-sm font-medium">
                      Learn More <MagneticArrow />
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      </Container>
    </section>
  )
}
