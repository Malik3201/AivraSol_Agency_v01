import type { Project, Service, FilterOptions } from '@/types/content'

// ─────────────────────────────────────────────────────────────
// TEXT NORMALIZATION & SEARCH
// ─────────────────────────────────────────────────────────────

export function normalize(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
}

export function matchTokens(haystack: string, tokens: string[]): boolean {
  const normalizedHaystack = normalize(haystack)
  return tokens.every((token) => normalizedHaystack.includes(normalize(token)))
}

export function searchProjects(projects: Project[], q: string): Project[] {
  if (!q || !q.trim()) return projects

  const tokens = q.trim().split(/\s+/)
  
  return projects.filter((project) => {
    const searchableText = [
      project.title,
      project.summary,
      project.category,
      ...project.industries,
      ...project.tech,
      project.problem,
      project.solution
    ].join(' ')

    return matchTokens(searchableText, tokens)
  })
}

export function searchServices(services: Service[], q: string): Service[] {
  if (!q || !q.trim()) return services

  const tokens = q.trim().split(/\s+/)
  
  return services.filter((service) => {
    const searchableText = [
      service.title,
      service.summary,
      service.overview,
      ...service.keyBenefits,
      ...service.tools
    ].join(' ')

    return matchTokens(searchableText, tokens)
  })
}

// ─────────────────────────────────────────────────────────────
// FILTERING
// ─────────────────────────────────────────────────────────────

export function filterProjects(
  projects: Project[],
  filters: FilterOptions
): Project[] {
  let filtered = [...projects]

  // Category filter (AND logic for multiple categories)
  if (filters.category && filters.category.length > 0) {
    filtered = filtered.filter((p) => filters.category!.includes(p.category))
  }

  // Industry filter (OR logic - project matches any selected industry)
  if (filters.industries && filters.industries.length > 0) {
    filtered = filtered.filter((p) =>
      p.industries.some((ind) => filters.industries!.includes(ind))
    )
  }

  // Tech filter (OR logic - project uses any selected tech)
  if (filters.tech && filters.tech.length > 0) {
    filtered = filtered.filter((p) =>
      p.tech.some((t) => filters.tech!.includes(t))
    )
  }

  // Search query
  if (filters.q) {
    filtered = searchProjects(filtered, filters.q)
  }

  return filtered
}

// ─────────────────────────────────────────────────────────────
// PAGINATION
// ─────────────────────────────────────────────────────────────

export interface PaginationResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  pages: number
}

export function paginate<T>(
  items: T[],
  page: number,
  pageSize: number
): PaginationResult<T> {
  const total = items.length
  const pages = Math.ceil(total / pageSize)
  const safePage = Math.max(1, Math.min(page, pages || 1))
  const startIndex = (safePage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const data = items.slice(startIndex, endIndex)

  return {
    data,
    total,
    page: safePage,
    pageSize,
    pages
  }
}

// ─────────────────────────────────────────────────────────────
// KPI FORMATTING (PREVENT NaN)
// ─────────────────────────────────────────────────────────────

export interface FormattedKPI {
  text: string
  isNumeric: boolean
  number?: number
}

export function formatKPI(value: string | number): FormattedKPI {
  if (typeof value === 'number') {
    if (!isNaN(value) && isFinite(value)) {
      return {
        text: String(value),
        isNumeric: true,
        number: value
      }
    }
    return { text: '0', isNumeric: false }
  }

  // String value
  const str = String(value).trim()
  
  // Try to extract numeric value
  const numericMatch = str.match(/^([+-]?\d+(?:\.\d+)?)/)
  
  if (numericMatch) {
    const num = parseFloat(numericMatch[1])
    if (!isNaN(num) && isFinite(num)) {
      return {
        text: str,
        isNumeric: true,
        number: num
      }
    }
  }

  // Non-numeric or unparseable - return as-is
  return {
    text: str,
    isNumeric: false
  }
}

// ─────────────────────────────────────────────────────────────
// RELATED PROJECTS
// ─────────────────────────────────────────────────────────────

export function relatedProjects(
  all: Project[],
  base: Project,
  count = 3
): Project[] {
  const scored = all
    .filter((p) => p.slug !== base.slug)
    .map((p) => {
      let score = 0
      
      // Same category = +3
      if (p.category === base.category) score += 3
      
      // Shared industries = +1 each
      score += p.industries.filter((ind) => base.industries.includes(ind)).length
      
      // Shared tech = +1 each
      score += p.tech.filter((t) => base.tech.includes(t)).length
      
      return { project: p, score }
    })
    .sort((a, b) => b.score - a.score)
  
  return scored.slice(0, count).map((s) => s.project)
}

