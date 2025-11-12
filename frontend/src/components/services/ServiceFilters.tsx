import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'
import { useReducedMotionFlag } from '@/hooks/useReducedMotionFlag'

interface ServiceFiltersProps {
  activeFilter: string
  onFilterChange: (filter: string) => void
}

const filters = ['All', 'MERN', 'WordPress', 'Mobile', 'SEO', 'Python', 'AI']

export function ServiceFilters({ activeFilter, onFilterChange }: ServiceFiltersProps) {
  const prefersReducedMotion = useReducedMotionFlag()

  return (
    <div className="sticky top-16 z-30 bg-bg/80 backdrop-blur-md border-b border-border py-4 mb-8">
      <div className="flex flex-wrap gap-2 justify-center">
        {filters.map((filter) => {
          const isActive = activeFilter === filter
          return (
            <motion.button
              key={filter}
              onClick={() => onFilterChange(filter)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium border transition-all',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                isActive
                  ? 'bg-primary/10 text-primary border-primary/20 shadow-inner'
                  : 'bg-surface text-text-muted border-border hover:border-primary/30 hover:text-text-strong'
              )}
              whileHover={!prefersReducedMotion ? { scaleX: 0.98 } : {}}
              whileTap={!prefersReducedMotion ? { scale: 0.95 } : {}}
              transition={{ duration: 0.15 }}
            >
              {filter}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

