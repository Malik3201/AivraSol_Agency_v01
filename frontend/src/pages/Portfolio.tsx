import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Container } from '@/components/layout/Container'
import { SectionHeading } from '@/components/layout/SectionHeading'
import { PortfolioToolbar } from '@/components/portfolio/PortfolioToolbar'
import { FilterDrawer } from '@/components/portfolio/FilterDrawer'
import { ProjectCard } from '@/components/portfolio/ProjectCard'
import { Button } from '@/components/ui/Button'
import { SpotlightCursor } from '@/components/effects/SpotlightCursor'
import { useProjects } from '@/hooks/data'
import { getCategories } from '@/api/client'
import { useReducedMotionFlag } from '@/hooks/useReducedMotionFlag'
import { staggerChildren, fadeInUp } from '@/lib/motionPresets'
import { SkeletonGrid } from '@/components/ui/Skeleton'
import { ContentError } from '@/components/ui/ContentError'

type TabItem = { slug: string; title: string }

export function Portfolio() {
  const {
    data: visibleProjects,
    total,
    page,
    pageSize,
    filters,
    loading,
    error,
    toggleFilter,
    clearFilters,
    setPage,
    setSortBy: setSortApi,
    derived
  } = useProjects()

  const [activeTab, setActiveTab] = useState('all')
  const [sortBy, setSortBy] = useState('featured')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const prefersReducedMotion = useReducedMotionFlag()
  const [tabs, setTabs] = useState<TabItem[]>([])
  const [industries, setIndustries] = useState<string[]>([])
  const [technologies, setTechnologies] = useState<string[]>([])

  useEffect(() => {
    (async () => {
      const [cats, inds, techs] = await Promise.all([
        getCategories({ type: 'category' }),
        getCategories({ type: 'industry' }),
        getCategories({ type: 'tech' }),
      ])
      setTabs((cats.data || []).map(c => ({ slug: c.slug, title: c.title })))
      setIndustries((inds.data || []).map(i => i.slug))
      setTechnologies((techs.data || []).map(t => t.slug))
    })()
  }, [])

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    // reset and set single category slug
    filters.category.clear()
    if (tab !== 'all') toggleFilter('category', tab)
  }

  const handleClearAll = () => {
    setActiveTab('all')
    setSortBy('featured')
    clearFilters()
  }

  const hasMore = total > visibleProjects.length

  const handleLoadMore = () => {
    setPage(page + 1)
    window.plausible?.('portfolio_load_more', { props: { current_count: visibleProjects.length } })
  }

  const selectedIndustries = Array.from(filters.industries)
  const selectedTech = Array.from(filters.tech)

  return (
    <>
      {/* Spotlight cursor effect */}
      {!prefersReducedMotion && <SpotlightCursor />}

      {/* Header Section */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-b from-surface/30 to-transparent">
        {/* Blueprint grid background */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
          <div 
            className="absolute inset-0" 
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='40' height='40' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 40 0 L 0 0 0 40' fill='none' stroke='white' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)' /%3E%3C/svg%3E")`,
            }} 
          />
        </div>
        
        <Container className="relative z-10">
          <SectionHeading
            title="Our Portfolio"
            subtitle="Explore our selected work across industries and technologies. From startups to enterprises, we've delivered solutions that drive real results."
            align="center"
          />
        </Container>
      </section>

      {/* Toolbar */}
      <PortfolioToolbar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        selectedIndustries={selectedIndustries}
        onIndustriesChange={(industries) => {
          industries.forEach(ind => {
            if (!filters.industries.has(ind)) toggleFilter('industries', ind)
          })
          Array.from(filters.industries).forEach(ind => {
            if (!industries.includes(ind)) toggleFilter('industries', ind)
          })
        }}
        selectedTech={selectedTech}
        onTechChange={(tech) => {
          tech.forEach(t => {
            if (!filters.tech.has(t)) toggleFilter('tech', t)
          })
          Array.from(filters.tech).forEach(t => {
            if (!tech.includes(t)) toggleFilter('tech', t)
          })
        }}
        sortBy={sortBy}
        onSortChange={(s) => { setSortBy(s); setSortApi(s as any) }}
        onClearAll={handleClearAll}
        onOpenDrawer={() => setDrawerOpen(true)}
      industries={industries}
      technologies={technologies}
      tabs={tabs}
      />

      {/* Filter Drawer (Mobile) */}
      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        selectedIndustries={selectedIndustries}
        onIndustriesChange={(industries) => {
          industries.forEach(ind => {
            if (!filters.industries.has(ind)) toggleFilter('industries', ind)
          })
          Array.from(filters.industries).forEach(ind => {
            if (!industries.includes(ind)) toggleFilter('industries', ind)
          })
        }}
        selectedTech={selectedTech}
        onTechChange={(tech) => {
          tech.forEach(t => {
            if (!filters.tech.has(t)) toggleFilter('tech', t)
          })
          Array.from(filters.tech).forEach(t => {
            if (!tech.includes(t)) toggleFilter('tech', t)
          })
        }}
        sortBy={sortBy}
        onSortChange={(s) => { setSortBy(s); setSortApi(s as any) }}
        onClearAll={handleClearAll}
      industries={industries}
      technologies={technologies}
      tabs={tabs}
      />

      {/* Grid */}
      <section className="py-12 min-h-screen">
        <Container>
          {loading ? (
            <SkeletonGrid rows={4} cols={3} />
          ) : error ? (
            <ContentError error={error} onRetry={() => window.location.reload()} />
          ) : visibleProjects.length === 0 ? (
            <motion.div {...fadeInUp} className="text-center py-20">
              <div className="text-text-muted mb-4">No projects found</div>
              <Button variant="ghost" onClick={handleClearAll}>
                Clear filters
              </Button>
            </motion.div>
          ) : (
            <>
              <motion.div
                {...staggerChildren(prefersReducedMotion ? 0 : 0.08)}
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
              >
                {visibleProjects.map((project) => (
                  <ProjectCard key={project.slug} project={project} />
                ))}
              </motion.div>

              {/* Load More */}
              {hasMore && (
                <motion.div {...fadeInUp} className="text-center">
                  <Button variant="ghost" onClick={handleLoadMore}>
                    <span>Load more</span>
                    <span className="text-xs text-text-muted ml-2">
                      ({total - visibleProjects.length} remaining)
                    </span>
                  </Button>
                </motion.div>
              )}
            </>
          )}
        </Container>
      </section>
    </>
  )
}
