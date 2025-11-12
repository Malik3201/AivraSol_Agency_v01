import { useState } from 'react'
import { X } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/Button'

interface FilterDrawerProps {
  open: boolean
  onClose: () => void
  activeTab: string
  onTabChange: (tab: string) => void
  selectedIndustries: string[]
  onIndustriesChange: (industries: string[]) => void
  selectedTech: string[]
  onTechChange: (tech: string[]) => void
  sortBy: string
  onSortChange: (sort: string) => void
  onClearAll: () => void
  industries: string[]
  technologies: string[]
  tabs: Array<{ slug: string; title: string }>
}

// Tabs provided via props

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'impact', label: 'Most Impact' },
  { value: 'az', label: 'A–Z' }
]

export function FilterDrawer({
  open,
  onClose,
  activeTab,
  onTabChange,
  selectedIndustries,
  onIndustriesChange,
  selectedTech,
  onTechChange,
  sortBy,
  onSortChange,
  onClearAll,
  industries,
  technologies,
  tabs
}: FilterDrawerProps) {
  const [industrySearch, setIndustrySearch] = useState('')
  const [techSearch, setTechSearch] = useState('')

  const toggleIndustry = (industry: string) => {
    const newSelection = selectedIndustries.includes(industry)
      ? selectedIndustries.filter((i) => i !== industry)
      : [...selectedIndustries, industry]
    onIndustriesChange(newSelection)
  }

  const toggleTech = (tech: string) => {
    const newSelection = selectedTech.includes(tech)
      ? selectedTech.filter((t) => t !== tech)
      : [...selectedTech, tech]
    onTechChange(newSelection)
  }

  const filteredIndustries = industries.filter((i) =>
    i.toLowerCase().includes(industrySearch.toLowerCase())
  )

  const filteredTech = technologies.filter((t) =>
    t.toLowerCase().includes(techSearch.toLowerCase())
  )

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay asChild>
          <motion.div
            className="fixed inset-0 bg-bg/80 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        </Dialog.Overlay>

        <Dialog.Content asChild>
          <motion.div
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-surface border-l border-border shadow-2xl overflow-y-auto"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-surface border-b border-border px-6 py-4 flex items-center justify-between">
              <Dialog.Title className="text-lg font-semibold text-text-strong">
                Filters
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-card transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Close filters"
                >
                  <X className="h-5 w-5 text-text-muted" />
                </button>
              </Dialog.Close>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8">
              {/* Category Tabs */}
              <div>
                <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
                  Category
                </h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    key="all"
                    onClick={() => onTabChange('all')}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      activeTab === 'all'
                        ? 'bg-primary text-bg shadow-sm'
                        : 'text-text-muted bg-card hover:text-text-strong hover:bg-card/80'
                    )}
                  >
                    All
                  </button>
                  {tabs.map((tab) => (
                    <button
                      key={tab.slug}
                      onClick={() => onTabChange(tab.slug)}
                      className={cn(
                        'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        activeTab === tab.slug
                          ? 'bg-primary text-bg shadow-sm'
                          : 'text-text-muted bg-card hover:text-text-strong hover:bg-card/80'
                      )}
                    >
                      {tab.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Industries */}
              <div>
                <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
                  Industry
                </h3>
                <input
                  type="text"
                  placeholder="Search industries..."
                  value={industrySearch}
                  onChange={(e) => setIndustrySearch(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-card border border-border rounded-lg text-text-strong placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-ring mb-3"
                />
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {filteredIndustries.map((industry) => (
                    <label
                      key={industry}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-card cursor-pointer text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={selectedIndustries.includes(industry)}
                        onChange={() => toggleIndustry(industry)}
                        className="rounded border-border text-primary focus:ring-2 focus:ring-ring"
                      />
                      <span className="text-text-strong">{industry}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Technologies */}
              <div>
                <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
                  Technology
                </h3>
                <input
                  type="text"
                  placeholder="Search technologies..."
                  value={techSearch}
                  onChange={(e) => setTechSearch(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-card border border-border rounded-lg text-text-strong placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-ring mb-3"
                />
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {filteredTech.map((tech) => (
                    <label
                      key={tech}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-card cursor-pointer text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTech.includes(tech)}
                        onChange={() => toggleTech(tech)}
                        className="rounded border-border text-primary focus:ring-2 focus:ring-ring"
                      />
                      <span className="text-text-strong">{tech}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
                  Sort By
                </h3>
                <div className="space-y-1">
                  {SORT_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-card cursor-pointer text-sm"
                    >
                      <input
                        type="radio"
                        name="sort"
                        checked={sortBy === option.value}
                        onChange={() => onSortChange(option.value)}
                        className="text-primary focus:ring-2 focus:ring-ring"
                      />
                      <span className="text-text-strong">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-surface border-t border-border px-6 py-4 flex gap-3">
              <Button variant="ghost" onClick={onClearAll} className="flex-1">
                Clear All
              </Button>
              <Button variant="primary" onClick={onClose} className="flex-1">
                Apply Filters
              </Button>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

