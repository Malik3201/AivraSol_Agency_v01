/**
 * DEPRECATED: JSON loaders disabled when FORCE_API=true
 * Use API clients from @/api/client instead
 * 
 * JSON files have been moved to src/__mock for archival only.
 * These loaders are kept for legacy support but will throw errors when FORCE_API=true.
 */

import { FORCE_API, guardJsonImport } from '@/lib/config'
import type {
  HomeData,
  Service,
  AboutData,
  Project,
  FAQ,
  Testimonial
} from '@/types/content'

export async function loadHomeData(): Promise<HomeData> {
  if (FORCE_API) guardJsonImport('loadHomeData')
  
  // Lazy import only if FORCE_API is false (legacy support)
  const homeData = await import('../__mock/home.json')
  return homeData.default as HomeData
}

export async function loadServices(): Promise<Service[]> {
  if (FORCE_API) guardJsonImport('loadServices')
  
  const servicesData = await import('../__mock/services.json')
  return servicesData.default as Service[]
}

export async function loadAbout(): Promise<AboutData> {
  if (FORCE_API) guardJsonImport('loadAbout')
  
  const aboutData = await import('../__mock/about.json')
  return aboutData.default as AboutData
}

export async function loadProjects(): Promise<Project[]> {
  if (FORCE_API) guardJsonImport('loadProjects')
  
  const portfolioData = await import('../__mock/portfolio.json')
  return portfolioData.default as Project[]
}

export async function loadFAQs(): Promise<FAQ[]> {
  if (FORCE_API) guardJsonImport('loadFAQs')
  
  const faqsData = await import('../__mock/faqs.json')
  return faqsData.default as FAQ[]
}

export async function loadTestimonials(): Promise<Testimonial[]> {
  if (FORCE_API) guardJsonImport('loadTestimonials')
  
  const testimonialsData = await import('../__mock/testimonials.json')
  return testimonialsData.default as Testimonial[]
}

