import { useState } from 'react'
import { motion } from 'framer-motion'
import { Container } from '@/components/layout/Container'
import { SectionHeading } from '@/components/layout/SectionHeading'
import { ServiceCard } from './ServiceCard'
import { ServiceFilters } from './ServiceFilters'
import { fadeInUp, staggerChildren, getMotionProps } from '@/lib/motionPresets'
import type { Service } from '@/types/content'
import { useNavigate } from 'react-router-dom'

interface ServicesGridProps {
  services: Service[]
}

export function ServicesGrid({ services }: ServicesGridProps) {
  const [activeFilter, setActiveFilter] = useState('All')
  const navigate = useNavigate()

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter)
    window.plausible?.('service_filter_applied', { props: { filter } })
  }

  const handleOpenDetail = (service: Service) => {
    window.plausible?.('service_modal_open', { props: { slug: service.slug } })
    navigate(`/services/${service.slug}`)
  }

  const filteredServices = activeFilter === 'All'
    ? services
    : services.filter(s => s.title.includes(activeFilter))

  return (
    <section className="py-20 relative">
      {/* Blueprint grid background */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='40' height='40' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 40 0 L 0 0 0 40' fill='none' stroke='white' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)' /%3E%3C/svg%3E")`,
        }} />
      </div>

      <Container className="relative z-10">
        <SectionHeading
          title="Services"
          subtitle="Comprehensive digital solutions tailored to your business needs"
        />

        <ServiceFilters activeFilter={activeFilter} onFilterChange={handleFilterChange} />

        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          {...getMotionProps(staggerChildren(0.08))}
          key={activeFilter}
        >
          {filteredServices.map((service) => (
            <motion.div key={service.slug} {...getMotionProps(fadeInUp)}>
              <ServiceCard service={service} onOpenModal={() => handleOpenDetail(service)} />
            </motion.div>
          ))}
        </motion.div>
      </Container>

    </section>
  )
}

