import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronDown, Filter } from 'lucide-react'
import * as Select from '@radix-ui/react-select'
import * as Popover from '@radix-ui/react-popover'
import { cn } from '@/lib/cn'
import { useReducedMotionFlag } from '@/hooks/useReducedMotionFlag'

interface ToolbarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  selectedIndustries: string[]
  onIndustriesChange: (industries: string[]) => void
  selectedTech: string[]
  onTechChange: (tech: string[]) => void
  sortBy: string
  onSortChange: (sort: string) => void
  onClearAll: () => void
  onOpenDrawer: () => void
  industries: string[]
  technologies: string[]
  tabs: Array<{ slug: string; title: string }>
}

// Tabs now come from API via props

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'impact', label: 'Most Impact' },
  { value: 'az', label: 'A–Z' }
]

export function PortfolioToolbar({
  activeTab,
  onTabChange,
  selectedIndustries,
  onIndustriesChange,
  selectedTech,
  onTechChange,
  sortBy,
  onSortChange,
  onClearAll,
  onOpenDrawer,
  industries,
  technologies,
  tabs
}: ToolbarProps) {
  const [industrySearch, setIndustrySearch] = useState('')
  const [techSearch, setTechSearch] = useState('')
  const prefersReducedMotion = useReducedMotionFlag()

  const activeFiltersCount = selectedIndustries.length + selectedTech.length + (activeTab !== 'all' ? 1 : 0)

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
    <div className="sticky top-16 z-20 bg-bg/95 backdrop-blur-md border-b border-border transition-all">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Desktop: Tabs + Dropdowns */}
        <div className="hidden lg:flex items-center gap-6 py-4">
          {/* Tabs */}
          <div className="flex items-center gap-2">
            <button
              key="all"
              onClick={() => onTabChange('all')}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                activeTab === 'all'
                  ? 'bg-primary text-bg shadow-sm'
                  : 'text-text-muted hover:text-text-strong hover:bg-surface'
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
                    : 'text-text-muted hover:text-text-strong hover:bg-surface'
                )}
              >
                {tab.title}
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-border" />

          {/* Dropdown Filters */}
          <div className="flex items-center gap-3 flex-1">
            {/* Industry Filter */}
            <Popover.Root>
              <Popover.Trigger asChild>
                <button
                  className={cn(
                    'inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    selectedIndustries.length > 0
                      ? 'bg-primary/10 text-primary border-primary/30'
                      : 'bg-surface text-text-muted border-border hover:border-primary/20'
                  )}
                >
                  Industry
                  {selectedIndustries.length > 0 && (
                    <span className="text-xs bg-primary/20 px-1.5 rounded">
                      {selectedIndustries.length}
                    </span>
                  )}
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content
                  className="z-50 w-64 bg-surface border border-border rounded-xl shadow-lg p-2 max-h-80 overflow-y-auto"
                  sideOffset={5}
                  align="start"
                >
                  <input
                    type="text"
                    placeholder="Search industries..."
                    value={industrySearch}
                    onChange={(e) => setIndustrySearch(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-card border border-border rounded-lg text-text-strong placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-ring mb-2"
                  />
                  <div className="space-y-1">
                    {filteredIndustries.map((industry) => (
                      <label
                        key={industry}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-card cursor-pointer text-sm"
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
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>

            {/* Technology Filter */}
            <Popover.Root>
              <Popover.Trigger asChild>
                <button
                  className={cn(
                    'inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    selectedTech.length > 0
                      ? 'bg-primary/10 text-primary border-primary/30'
                      : 'bg-surface text-text-muted border-border hover:border-primary/20'
                  )}
                >
                  Technology
                  {selectedTech.length > 0 && (
                    <span className="text-xs bg-primary/20 px-1.5 rounded">
                      {selectedTech.length}
                    </span>
                  )}
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content
                  className="z-50 w-64 bg-surface border border-border rounded-xl shadow-lg p-2 max-h-80 overflow-y-auto"
                  sideOffset={5}
                  align="start"
                >
                  <input
                    type="text"
                    placeholder="Search technologies..."
                    value={techSearch}
                    onChange={(e) => setTechSearch(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-card border border-border rounded-lg text-text-strong placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-ring mb-2"
                  />
                  <div className="space-y-1">
                    {filteredTech.map((tech) => (
                      <label
                        key={tech}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-card cursor-pointer text-sm"
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
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>

            {/* Sort Select */}
            <Select.Root value={sortBy} onValueChange={onSortChange}>
              <Select.Trigger
                className={cn(
                  'inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all',
                  'bg-surface text-text-muted border-border hover:border-primary/20',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                )}
              >
                <Select.Value />
                <Select.Icon>
                  <ChevronDown className="h-3.5 w-3.5" />
                </Select.Icon>
              </Select.Trigger>
              <Select.Portal>
                <Select.Content
                  className="z-50 bg-surface border border-border rounded-xl shadow-lg overflow-hidden"
                  position="popper"
                  sideOffset={5}
                >
                  <Select.Viewport className="p-1">
                    {SORT_OPTIONS.map((option) => (
                      <Select.Item
                        key={option.value}
                        value={option.value}
                        className="px-3 py-2 text-sm text-text-strong rounded-lg hover:bg-card cursor-pointer focus:outline-none focus:bg-card"
                      >
                        <Select.ItemText>{option.label}</Select.ItemText>
                      </Select.Item>
                    ))}
                  </Select.Viewport>
                </Select.Content>
              </Select.Portal>
            </Select.Root>
          </div>

          {activeFiltersCount > 0 && (
            <button
              onClick={onClearAll}
              className="text-sm text-primary hover:text-amber font-medium underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Mobile: Filters Button */}
        <div className="lg:hidden py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-strong">Portfolio</h2>
          <button
            onClick={onOpenDrawer}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              activeFiltersCount > 0
                ? 'bg-primary/10 text-primary border-primary/30'
                : 'bg-surface text-text-muted border-border'
            )}
          >
            <Filter className="h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="text-xs bg-primary/20 px-1.5 rounded">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Applied Filters Summary (Desktop only) */}
        {activeFiltersCount > 0 && (
          <div className="hidden lg:flex items-center gap-2 pb-3 overflow-x-auto">
            <span className="text-xs text-text-muted uppercase tracking-wider whitespace-nowrap">
              Active:
            </span>
            {activeTab !== 'all' && (
              <FilterChip
                label={activeTab}
                onRemove={() => onTabChange('all')}
              />
            )}
            {selectedIndustries.slice(0, 2).map((ind) => (
              <FilterChip
                key={ind}
                label={ind}
                onRemove={() => toggleIndustry(ind)}
              />
            ))}
            {selectedTech.slice(0, 1).map((tech) => (
              <FilterChip
                key={tech}
                label={tech}
                onRemove={() => toggleTech(tech)}
              />
            ))}
            {activeFiltersCount > 3 && (
              <button
                onClick={onOpenDrawer}
                className="text-xs text-primary hover:text-amber font-medium"
              >
                +{activeFiltersCount - 3} more
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="inline-flex items-center gap-1.5 px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium"
    >
      <span>{label}</span>
      <button
        onClick={onRemove}
        onKeyDown={(e) => {
          if (e.key === 'Backspace') onRemove()
        }}
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        aria-label={`Remove ${label} filter`}
      >
        <X className="h-3 w-3" />
      </button>
    </motion.div>
  )
}

