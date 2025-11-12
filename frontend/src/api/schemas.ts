import { z } from 'zod'

export const ServiceDtoSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  summary: z.string(),
  description: z.string(),
  tools: z.array(z.string()),
  tags: z.array(z.string()),
  faqs: z.array(
    z.object({
      q: z.string(),
      a: z.string(),
    })
  ),
  featured: z.boolean(),
  order: z.number(),
})

export const CategoryDtoSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  type: z.string(),
  order: z.number(),
})

export const ProjectDtoSchema = z.object({
  slug: z.string(),
  title: z.string(),
  summary: z.string(),
  categorySlug: z.string(),
  industries: z.array(z.string()),
  tech: z.array(z.string()),
  kpis: z.array(
    z.object({
      label: z.string(),
      value: z.union([z.string(), z.number()]),
      unit: z.string().optional(),
    })
  ),
  cover: z.object({ url: z.string(), alt: z.string().optional() }),
  gallery: z.array(z.object({ url: z.string(), alt: z.string().optional() })),
  problem: z.string(),
  solution: z.string(),
  impact: z.string(),
  links: z.object({
    live: z.string().optional(),
    github: z.string().optional(),
  }),
  hasBeforeAfter: z.boolean(),
  featured: z.boolean(),
  createdAt: z.string(),
})

export const TestimonialDtoSchema = z.object({
  id: z.string(),
  clientName: z.string(),
  designation: z.string().optional(),
  company: z.string().optional(),
  message: z.string().optional(),
  avatarUrl: z.string().optional(),
  rating: z.number().int().min(1).max(5).optional(),
  projectSlug: z.string().optional(),
  serviceType: z.enum(['MERN', 'WordPress', 'Mobile', 'SEO', 'Python', 'AI']).optional(),
})

export const KnowledgeDtoSchema = z.object({
  id: z.string(),
  type: z.string(),
  refId: z.string().optional(),
  question: z.string(),
  answer: z.string(),
  keywords: z.array(z.string()),
})

export function ListEnvelope<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    ok: z.literal(true),
    data: z.array(itemSchema),
    total: z.number().optional(),
    page: z.number().optional(),
    pageSize: z.number().optional(),
  })
}

export function ItemEnvelope<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    ok: z.literal(true),
    data: itemSchema,
  })
}

export const OkEnvelopeSchema = z.object({
  ok: z.literal(true),
})

export const ContactEnvelopeSchema = z.object({
  ok: z.literal(true),
  emailSent: z.boolean().optional(),
  webhookSent: z.boolean().optional(),
})

export type ServiceDto = z.infer<typeof ServiceDtoSchema>
export type CategoryDto = z.infer<typeof CategoryDtoSchema>
export type ProjectDto = z.infer<typeof ProjectDtoSchema>
export type TestimonialDto = z.infer<typeof TestimonialDtoSchema>
export type KnowledgeDto = z.infer<typeof KnowledgeDtoSchema>

