import { apiGet, apiPost, apiDelete, apiPut } from './http'
import { z } from 'zod'
import {
  ServiceDtoSchema,
  ProjectDtoSchema,
  CategoryDtoSchema,
  KnowledgeDtoSchema,
  ListEnvelope,
  ItemEnvelope,
  OkEnvelopeSchema,
} from './schemas'

const LeadDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  company: z.string().optional(),
  projectType: z.array(z.string()).optional(),
  budgetRange: z.string().optional(),
  timeline: z.string().optional(),
  message: z.string(),
  status: z.enum(['new', 'qualified', 'proposal', 'won', 'lost']),
  notes: z.array(
    z.object({
      text: z.string(),
      at: z.string(),
    })
  ),
  createdAt: z.string(),
})

const UploadSignatureSchema = z.object({
  ok: z.literal(true),
  signature: z.string(),
  timestamp: z.number(),
  cloudName: z.string(),
  apiKey: z.string(),
  folder: z.string(),
  publicId: z.string().optional(),
})

type ServiceBody = {
  name: string
  slug: string
  description: string
  icon: string
  image: string
  featured?: boolean
}

type CategoryBody = {
  slug?: string
  title: string
  description?: string
  order?: number
  type: 'category' | 'industry' | 'tech'
}

type ProjectBody = {
  title: string
  slug: string
  description: string
  types: string[]
  technologies?: string[]
  image: string
  gallery?: string[]
  liveUrl?: string
  githubUrl?: string
  client?: string
  featured?: boolean
}

type KnowledgeBody = {
  question: string
  answer: string
  category?: string
  order?: number
  active?: boolean
}

type LeadUpdate = {
  status?: 'new' | 'qualified' | 'proposal' | 'won' | 'lost'
  note?: { text: string }
}

export async function createService(body: ServiceBody) {
  return apiPost('/admin/service-add', body as any, z.any())
}

export async function updateService(id: string, body: ServiceBody) {
  return apiPut(`/admin/service-edit/${id}`, body as any, z.any())
}

export async function deleteService(id: string) {
  return apiDelete(`/admin/service-delete/${id}`, OkEnvelopeSchema)
}

export async function createCategory(body: CategoryBody) {
  return apiPost('/admin/categories', body as any, z.any())
}

export async function updateCategory(id: string, body: CategoryBody) {
  return apiPost(`/admin/categories/${id}`, body as any, z.any())
}

export async function deleteCategory(id: string) {
  return apiDelete(`/admin/categories/${id}`, OkEnvelopeSchema)
}

export async function createProject(body: ProjectBody) {
  return apiPost('/admin/project-add', body as any, z.any())
}

export async function updateProject(id: string, body: ProjectBody) {
  return apiPut(`/admin/project-edit/${id}`, body as any, z.any())
}

export async function deleteProject(id: string) {
  return apiDelete(`/admin/project-delete/${id}`, OkEnvelopeSchema)
}

export async function listFaqs() {
  const Schema = z.object({
    success: z.boolean().optional(),
    message: z.string().optional(),
    faqs: z.array(
      z.object({
        _id: z.string(),
        question: z.string(),
        answer: z.string(),
        category: z.string().optional(),
        order: z.number().optional(),
        active: z.boolean().optional(),
      })
    ).optional()
  })
  return apiGet('/admin/faq', Schema as any)
}

export async function createKnowledge(body: KnowledgeBody) {
  return apiPost('/admin/faq-add', body as any, z.any())
}

export async function updateKnowledge(id: string, body: KnowledgeBody) {
  return apiPut(`/admin/faq-edit/${id}`, body as any, z.any())
}

export async function deleteKnowledge(id: string) {
  return apiDelete(`/admin/faq-delete/${id}`, OkEnvelopeSchema)
}

// Testimonials
export async function createTestimonial(body: {
  name: string
  designation?: string
  message: string
  image?: string
  rating?: number
  active?: boolean
  order?: number
}) {
  return apiPost('/admin/testimonial-add', body as any, z.any())
}

export async function updateTestimonial(id: string, body: {
  name: string
  designation?: string
  message: string
  image?: string
  rating?: number
  active?: boolean
  order?: number
}) {
  return apiPut(`/admin/testimonial-edit/${id}`, body as any, z.any())
}

export async function deleteTestimonial(id: string) {
  return apiDelete(`/admin/testimonial-delete/${id}`, OkEnvelopeSchema)
}

// Tech Stacks
export async function createTechStack(body: {
  name: string
  category?: string
  icon?: string
  level?: string
  description?: string
  active?: boolean
  order?: number
}) {
  return apiPost('/admin/techStack-add', body as any, z.any())
}

export async function updateTechStack(id: string, body: {
  name: string
  category?: string
  icon?: string
  level?: string
  description?: string
  active?: boolean
  order?: number
}) {
  return apiPut(`/admin/techStack-edit/${id}`, body as any, z.any())
}

export async function deleteTechStack(id: string) {
  return apiDelete(`/admin/techStack-delete/${id}`, OkEnvelopeSchema)
}

export async function listLeads(params?: {
  status?: string
  q?: string
  page?: number
  limit?: number
}) {
  const query = params
    ? '?' +
      Object.entries(params)
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
        .join('&')
    : ''
  return apiGet(`/api/leads${query}`, ListEnvelope(LeadDtoSchema))
}

export async function updateLead(id: string, body: LeadUpdate) {
  return apiPost(`/api/leads/${id}`, body, ItemEnvelope(LeadDtoSchema))
}

export async function getUploadSignature(params: {
  folder: string
  mime: string
  maxBytes?: number
  publicId?: string
}) {
  const query =
    '?' +
    Object.entries(params)
      .filter(([_, v]) => v !== undefined)
      .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
      .join('&')
  return apiGet(`/api/upload/sign${query}`, UploadSignatureSchema)
}

export type { ServiceBody, CategoryBody, ProjectBody, KnowledgeBody, LeadUpdate }
export { LeadDtoSchema }
export type Lead = z.infer<typeof LeadDtoSchema>

