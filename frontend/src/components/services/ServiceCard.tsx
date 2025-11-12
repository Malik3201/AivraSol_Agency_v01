import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Code2, LayoutDashboard, Smartphone, Sparkles, Cpu, Bot } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Chip } from '@/components/ui/Chip'
import { useReducedMotionFlag } from '@/hooks/useReducedMotionFlag'
import type { Service } from '@/types/content'

interface ServiceCardProps {
  service: Service
  onOpenModal: (service: Service) => void
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

export function ServiceCard({ service, onOpenModal }: ServiceCardProps) {
  const Icon = iconMap[service.icon] || Code2
  
  const handleClick = () => {
    onOpenModal(service)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onOpenModal(service)
    }
  }

  return (
    <Card
      hoverable
      role="button"
      tabIndex={0}
      aria-label={`View details for ${service.title}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className="h-full group relative overflow-hidden cursor-pointer"
    >
      {/* Top amber notch */}
      <div className="absolute top-0 left-0 w-12 h-1 bg-amber" />
      
      {/* Shimmer effect */}
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
        
        <div className="flex flex-wrap gap-2 mb-4">
          {service.tools.slice(0, 4).map((tool, i) => (
            <Chip key={i} variant="default" className="text-xs">
              {tool}
            </Chip>
          ))}
        </div>
        
        <div className="flex items-center gap-2 text-primary text-sm font-medium">
          View Details <MagneticArrow />
        </div>
      </div>
    </Card>
  )
}

