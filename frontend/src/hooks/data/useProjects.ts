import { useState, useEffect, useMemo, useCallback } from 'react'
import { getProjects } from '@/api/client'
import { FORCE_API } from '@/lib/config'
import type { Project, FilterOptions } from '@/types/content'

interface ProjectFilters {
  q: string
  category: Set<string>
  industries: Set<string>
  tech: Set<string>
}

interface UseProjectsReturn {
  data: Project[]
  allProjects: Project[]
  total: number
  pages: number
  page: number
  pageSize: number
  filters: ProjectFilters
  loading: boolean
  error: Error | null
  setQuery: (q: string) => void
  toggleFilter: (group: keyof Omit<ProjectFilters, 'q'>, value: string) => void
  clearFilters: () => void
  setPage: (page: number) => void
  setPageSize: (size: number) => void
  applyFilters: (partial: Partial<FilterOptions>) => void
  setSortBy: (s: 'featured' | 'newest' | 'impact' | 'az') => void
  setFeaturedFlag: (f: boolean | undefined) => void
  derived: {
    activeCount: number
    summaryChips: Array<{ label: string; group: string }>
  }
}

export function useProjects(initialFilters?: Partial<FilterOptions>): UseProjectsReturn {
  const [allProjects, setAllProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  const [filters, setFilters] = useState<ProjectFilters>({
    q: initialFilters?.q || '',
    category: new Set(initialFilters?.category || []),
    industries: new Set(initialFilters?.industries || []),
    tech: new Set(initialFilters?.tech || [])
  })
  
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)
  const [apiTotal, setApiTotal] = useState(0)
  const [apiPages, setApiPages] = useState(1)
  const [sort, setSort] = useState<'featured' | 'newest' | 'impact' | 'az'>('featured')
  const [featured, setFeatured] = useState<boolean | undefined>(undefined)

  useEffect(() => {
    if (!FORCE_API) {
      console.warn('[useProjects] FORCE_API is false, but API mode is enforced')
    }

    setLoading(true)
    
    const categoryArray = filters.category.size > 0 ? Array.from(filters.category) : undefined
    const industriesArray = filters.industries.size > 0 ? Array.from(filters.industries) : undefined
    const techArray = filters.tech.size > 0 ? Array.from(filters.tech) : undefined
    
    getProjects({
      q: filters.q || undefined,
      category: categoryArray,
      industries: industriesArray,
      tech: techArray,
      page,
      limit: pageSize,
      sort,
      featured,
    })
      .then((response) => {
        setAllProjects(response.data as Project[])
        setApiTotal(response.total || 0)
        setApiPages(Math.ceil((response.total || 0) / pageSize))
        setLoading(false)
      })
      .catch((err) => {
        console.warn('[Aivrasol] API error', { route: '/api/projects', err })
        setError(err)
        setLoading(false)
      })
  }, [filters, page, pageSize, sort, featured])

  const paginatedResult = useMemo(() => {
    return {
      data: allProjects,
      total: apiTotal,
      pages: apiPages,
      page,
      pageSize
    }
  }, [allProjects, page, pageSize, apiTotal, apiPages])

  const setQuery = useCallback((q: string) => {
    setFilters((prev) => ({ ...prev, q }))
    setPage(1)
  }, [])

  const toggleFilter = useCallback((group: keyof Omit<ProjectFilters, 'q'>, value: string) => {
    setFilters((prev) => {
      const newSet = new Set(prev[group])
      if (newSet.has(value)) {
        newSet.delete(value)
      } else {
        newSet.add(value)
      }
      return { ...prev, [group]: newSet }
    })
    setPage(1)
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({
      q: '',
      category: new Set(),
      industries: new Set(),
      tech: new Set()
    })
    setPage(1)
  }, [])

  const applyFilters = useCallback((partial: Partial<FilterOptions>) => {
    setFilters((prev) => ({
      q: partial.q !== undefined ? partial.q : prev.q,
      category: partial.category ? new Set(partial.category) : prev.category,
      industries: partial.industries ? new Set(partial.industries) : prev.industries,
      tech: partial.tech ? new Set(partial.tech) : prev.tech
    }))
    setPage(1)
  }, [])

  const derived = useMemo(() => {
    const activeCount = filters.category.size + filters.industries.size + filters.tech.size
    
    const summaryChips: Array<{ label: string; group: string }> = []
    
    filters.category.forEach((cat) => summaryChips.push({ label: cat, group: 'category' }))
    filters.industries.forEach((ind) => summaryChips.push({ label: ind, group: 'industries' }))
    filters.tech.forEach((t) => summaryChips.push({ label: t, group: 'tech' }))
    
    return { activeCount, summaryChips }
  }, [filters])

  return {
    data: paginatedResult.data,
    allProjects,
    total: paginatedResult.total,
    pages: paginatedResult.pages,
    page: paginatedResult.page,
    pageSize: paginatedResult.pageSize,
    filters,
    loading,
    error,
    setQuery,
    toggleFilter,
    clearFilters,
    setPage,
    setPageSize,
    applyFilters,
    setSortBy: setSort,
    setFeaturedFlag: setFeatured,
    derived
  }
}
