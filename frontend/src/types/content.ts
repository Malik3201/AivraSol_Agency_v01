// ─────────────────────────────────────────────────────────────
// SHARED CONTENT TYPES
// ─────────────────────────────────────────────────────────────

export interface KPI {
  label: string
  value: string | number
  unit?: string
}

export interface ProjectLinks {
  live?: string
  github?: string
}

// ─────────────────────────────────────────────────────────────
// HOME PAGE
// ─────────────────────────────────────────────────────────────

export interface CollageItem {
  title: string
  kpi: string
}

export interface HomeData {
  hero: {
    title: string
    sub: string
    primaryCta: { label: string; to: string }
    secondaryCta: { label: string; to: string }
    collage: CollageItem[]
  }
  trust: {
    logos: Array<{ name: string }>
  }
  services: {
    items: Array<{
      icon: string
      title: string
      benefit: string
      slug: string
    }>
  }
  process: {
    steps: Array<{ step: string; desc: string }>
  }
  featured: {
    items: Array<{
      title: string
      kpi: string
    }>
  }
  capabilities: {
    items: string[]
  }
  testimonials: {
    items: Array<{
      quote: string
      author: string
      role: string
    }>
  }
  faq: {
    items: Array<{ q: string; a: string }>
  }
  cta: {
    title: string
    sub: string
    primaryLabel: string
    secondaryLabel: string
  }
}

// ─────────────────────────────────────────────────────────────
// SERVICES
// ─────────────────────────────────────────────────────────────

export interface ServiceExample {
  title: string
  result: string
}

export interface ServiceFAQ {
  q: string
  a: string
}

export interface Service {
  slug: string
  title: string
  icon: string
  summary: string
  overview: string
  keyBenefits: string[]
  tools: string[]
  pricingBands: Array<{ label: string; range: string }>
  examples: ServiceExample[]
  faqs: ServiceFAQ[]
}

// ─────────────────────────────────────────────────────────────
// ABOUT
// ─────────────────────────────────────────────────────────────

export interface StoryItem {
  year: string
  title: string
  copy: string
}

export interface ValueItem {
  title: string
  desc: string
}

export interface TeamMember {
  name: string
  role: string
  superpower: string
}

export interface AboutData {
  story: StoryItem[]
  values: ValueItem[]
  team: TeamMember[]
  tech: string[]
  whyUs: Array<{ title: string; desc: string }>
  cta: {
    title: string
    sub: string
    primaryLabel: string
    secondaryLabel: string
  }
}

// ─────────────────────────────────────────────────────────────
// PORTFOLIO
// ─────────────────────────────────────────────────────────────

export interface Project {
  slug: string
  title: string
  summary: string
  categorySlug: string
  industries: string[]
  tech: string[]
  kpis: KPI[]
  cover: { url: string; alt?: string }
  gallery: Array<{ url: string; alt?: string }>
  problem: string
  solution: string
  impact: string
  links?: ProjectLinks
  hasBeforeAfter?: boolean
  featured?: boolean
  createdAt?: string
}

export interface FilterOptions {
  category?: string[]
  industries?: string[]
  tech?: string[]
  q?: string
}

// ─────────────────────────────────────────────────────────────
// TESTIMONIALS & FAQs
// ─────────────────────────────────────────────────────────────

export interface Testimonial {
  id?: string
  clientName: string
  designation?: string
  company?: string
  avatarUrl?: string
  rating?: number
  projectSlug?: string
  serviceType?: 'MERN' | 'WordPress' | 'Mobile' | 'SEO' | 'Python' | 'AI'
  message?: string
}

export interface FAQ {
  q: string
  a: string
}

// ─────────────────────────────────────────────────────────────
// CONTACT
// ─────────────────────────────────────────────────────────────

export interface LeadPayload {
  name: string
  email: string
  company?: string
  message: string
}

