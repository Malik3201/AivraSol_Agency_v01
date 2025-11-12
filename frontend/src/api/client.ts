import { apiGet } from './http'
import { z } from 'zod'
import type { ServiceDto, ProjectDto, TestimonialDto, KnowledgeDto } from './schemas'

function buildQueryString(params?: Record<string, any>): string {
  if (!params) return ''

  const entries = Object.entries(params).filter(([_, v]) => v !== undefined && v !== null)
  if (entries.length === 0) return ''

  const searchParams = new URLSearchParams()
  entries.forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => searchParams.append(key, String(v)))
    } else {
      searchParams.append(key, String(value))
    }
  })

  return `?${searchParams.toString()}`
}

export async function getServices(params?: {
  q?: string
  featured?: boolean
  page?: number
  limit?: number
}) {
  const query = buildQueryString(params)
  const BackendSchema = z.object({
    success: z.boolean().optional(),
    succes: z.boolean().optional(),
    message: z.string().optional(),
    services: z
      .array(
        z.object({
          _id: z.string().optional(),
          id: z.string().optional(),
          name: z.string(),
          slug: z.string(),
          description: z.string(),
          icon: z.string(),
          image: z.string(),
          featured: z.boolean().optional(),
        })
      )
      .optional(),
  })
  const res = await apiGet(`/services${query}`, BackendSchema as any)
  const data = (res as any).services || []
  const adapted: ServiceDto[] = data.map((s: any) => ({
    id: s._id || s.id || s.slug,
    slug: s.slug,
    title: s.name,
    summary: s.description,
    description: s.description,
    tools: [],
    tags: [],
    faqs: [],
    featured: !!s.featured,
    order: 0,
  }))
  return { ok: true, data: adapted, total: adapted.length }
}

export async function getProjects(params?: {
  q?: string
  category?: string | string[]
  industries?: string | string[]
  tech?: string | string[]
  sort?: 'featured' | 'newest' | 'impact' | 'az'
  featured?: boolean
  page?: number
  limit?: number
}) {
  const query = buildQueryString(params)
  const BackendSchema = z.object({
    success: z.boolean().optional(),
    message: z.string().optional(),
    projects: z
      .array(
        z.object({
          _id: z.string().optional(),
          slug: z.string(),
          title: z.string(),
          description: z.string(),
          types: z.array(z.string()),
          technologies: z.array(z.string()).optional(),
          image: z.string(),
          gallery: z.array(z.string()).optional(),
          liveUrl: z.string().optional(),
          githubUrl: z.string().optional(),
          client: z.string().optional(),
          featured: z.boolean().optional(),
          createdAt: z.string().optional(),
        })
      )
      .optional(),
  })
  const res = await apiGet(`/projects${query}`, BackendSchema as any)
  const data = (res as any).projects || []
  const adapted: ProjectDto[] = data.map((p: any) => ({
    // carry backend id for admin operations (as extra field)
    ...(p._id ? { id: p._id } : {}),
    slug: p.slug,
    title: p.title,
    summary: p.description,
    categorySlug: (p.types && p.types[0]) || 'general',
    industries: [],
    tech: p.technologies || [],
    kpis: [],
    cover: { url: p.image, alt: p.title },
    gallery: (p.gallery || []).map((url: string) => ({ url })),
    problem: '',
    solution: '',
    impact: '',
    links: { live: p.liveUrl, github: p.githubUrl },
    hasBeforeAfter: false,
    featured: !!p.featured,
    createdAt: p.createdAt,
  }))
  return { ok: true, data: adapted, total: adapted.length }
}

export async function getProject(slugOrId: string) {
  const list = await getProjects()
  const found = list.data.find((p) => p.slug === slugOrId) || list.data[0]
  return { ok: true, data: found }
}

export async function getTestimonials() {
  const BackendSchema = z.object({
    success: z.boolean().optional(),
    message: z.string().optional(),
    testimonials: z
      .array(
        z.object({
          _id: z.string().optional(),
          name: z.string(),
          designation: z.string().optional(),
          message: z.string(),
          image: z.string().optional(),
          rating: z.number().optional(),
          active: z.boolean().optional(),
          order: z.number().optional(),
        })
      )
      .optional(),
  })
  const res = await apiGet('/testimonials', BackendSchema as any)
  const data = (res as any).testimonials || []
  const adapted: TestimonialDto[] = data.map((t: any) => ({
    id: t._id,
    clientName: t.name,
    designation: t.designation,
    message: t.message,
    company: undefined,
    avatarUrl: t.image,
    rating: t.rating,
    projectSlug: undefined,
    serviceType: undefined,
  }))
  return { ok: true, data: adapted, total: adapted.length }
}

export async function getKnowledge() {
  const BackendSchema = z.object({
    success: z.boolean().optional(),
    message: z.string().optional(),
    faqs: z
      .array(
        z.object({
          _id: z.string().optional(),
          question: z.string(),
          answer: z.string(),
          category: z.string().optional(),
          order: z.number().optional(),
          active: z.boolean().optional(),
        })
      )
      .optional(),
  })
  const res = await apiGet('/faqs', BackendSchema as any)
  const data = (res as any).faqs || []
  const adapted: KnowledgeDto[] = data.map((f: any) => ({
    id: f._id,
    type: 'faq',
    refId: undefined,
    question: f.question,
    answer: f.answer,
    keywords: [],
  }))
  return { ok: true, data: adapted, total: adapted.length }
}

export async function getCategories(params: { type: 'category' | 'industry' | 'tech' }) {
  if (params.type === 'tech') {
    const BackendSchema = z.object({
      success: z.boolean().optional(),
      message: z.string().optional(),
      techStacks: z
        .array(
          z.object({
            _id: z.string().optional(),
            name: z.string(),
            category: z.string().optional(),
            icon: z.string().optional(),
            level: z.string().optional(),
            description: z.string().optional(),
            active: z.boolean().optional(),
            order: z.number().optional(),
          })
        )
        .optional(),
    })
    const res = await apiGet('/techstacks', BackendSchema as any)
    const stacks = (res as any).techStacks || []
    const unique = Array.from(new Set(stacks.map((s: any) => String(s.name)))).map((name: string, idx) => ({
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      title: name as string,
      order: idx,
    }))
    return { ok: true, data: unique, total: unique.length } as any
  }
  return { ok: true, data: [], total: 0 } as any
}

export async function postContact(_payload: {
  name: string
  email: string
  company?: string
  projectType?: string[]
  budgetRange?: string
  timeline?: string
  message: string
  company_site?: string
  recaptchaToken?: string
}) {
  return { ok: true, emailSent: false, webhookSent: false } as any
}

