import { z } from 'zod'
import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  apiPostForm,
} from './http'

export const SERVICE_CATEGORIES = [
  'Website Development',
  'UI/UX Design',
  'Branding',
  'Mobile App Development',
  'Social Media Design',
  'SEO',
  'E-commerce',
  'Custom Software',
  'Other',
] as const

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number]

export const PROJECT_LINK_LABELS = [
  'Website',
  'Behance',
  'Dribbble',
  'App Link',
  'Social Media',
  'Other',
] as const

export type ProjectLinkLabel = (typeof PROJECT_LINK_LABELS)[number]

const ProjectLinkSchema = z.object({
  label: z.string(),
  url: z.string(),
})

const MediaFileSchema = z.object({
  filename: z.string(),
  originalName: z.string().optional(),
  url: z.string(),
  mimeType: z.string().optional(),
  size: z.number().optional(),
  kind: z
    .enum(['image', 'video', 'document', 'design', 'other'])
    .optional(),
})

export const ReviewLinkSchema = z.object({
  _id: z.string(),
  token: z.string(),
  client_name: z.string().optional(),
  client_email: z.string().optional(),
  project_name: z.string().optional(),
  is_used: z.boolean(),
  used_at: z.string().nullable().optional(),
  expires_at: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  status: z.enum(['unused', 'used', 'expired']).optional(),
  url: z.string().optional(),
})
export type ReviewLink = z.infer<typeof ReviewLinkSchema>

export const ReviewSchema = z.object({
  _id: z.string(),
  review_link_id: z.union([
    z.string(),
    z
      .object({
        _id: z.string().optional(),
        token: z.string().optional(),
        client_name: z.string().optional(),
        client_email: z.string().optional(),
        project_name: z.string().optional(),
      })
      .passthrough(),
  ]),
  client_name: z.string(),
  company_name: z.string().optional(),
  project_name: z.string().optional(),
  service_category: z.string().optional(),
  project_links: z.array(ProjectLinkSchema).optional(),
  review_text: z.string(),
  rating: z.number(),
  media_files: z.array(MediaFileSchema).optional(),
  status: z.enum(['pending', 'approved', 'rejected']),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})
export type Review = z.infer<typeof ReviewSchema>

// ── Public ────────────────────────────────────────────────────────────────────

const ValidateTokenSchema = z.object({
  status: z.enum(['valid', 'used', 'invalid', 'expired']),
  message: z.string().optional(),
  data: z
    .object({
      client_name: z.string().optional(),
      project_name: z.string().optional(),
    })
    .optional(),
})

export async function validateReviewToken(token: string) {
  return apiGet(`/review-links/${encodeURIComponent(token)}`, ValidateTokenSchema)
}

const SubmitReviewResponse = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  reviewId: z.string().optional(),
})

export async function submitReview(token: string, formData: FormData) {
  return apiPostForm(
    `/reviews/${encodeURIComponent(token)}`,
    formData,
    SubmitReviewResponse
  )
}

const ApprovedReviewsResponse = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  reviews: z.array(ReviewSchema).optional(),
})

export async function listApprovedReviews() {
  return apiGet('/reviews/approved', ApprovedReviewsResponse)
}

// ── Admin ─────────────────────────────────────────────────────────────────────

const AdminReviewLinkListResponse = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  reviewLinks: z.array(ReviewLinkSchema).optional(),
})

const AdminReviewLinkResponse = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  reviewLink: ReviewLinkSchema.optional(),
  url: z.string().optional(),
})

export async function listReviewLinks() {
  return apiGet('/admin/review-links', AdminReviewLinkListResponse, { auth: true })
}

export async function createReviewLink(body: {
  client_name?: string
  client_email?: string
  project_name?: string
  expires_at?: string | null
}) {
  return apiPost('/admin/review-links', body, AdminReviewLinkResponse, {
    auth: true,
  })
}

const OkResponse = z.object({
  success: z.boolean(),
  message: z.string().optional(),
})

export async function deleteReviewLink(id: string, force = false) {
  const q = force ? '?force=true' : ''
  return apiDelete(`/admin/review-links/${id}${q}`, OkResponse, { auth: true })
}

const AdminReviewListResponse = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  reviews: z.array(ReviewSchema).optional(),
})

const AdminReviewItemResponse = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  review: ReviewSchema.optional(),
})

export async function listAdminReviews(status?: 'pending' | 'approved' | 'rejected') {
  const q = status ? `?status=${status}` : ''
  return apiGet(`/admin/reviews${q}`, AdminReviewListResponse, { auth: true })
}

export async function getAdminReview(id: string) {
  return apiGet(`/admin/reviews/${id}`, AdminReviewItemResponse, { auth: true })
}

export async function approveReview(id: string) {
  return apiPatch(`/admin/reviews/${id}/approve`, {}, AdminReviewItemResponse, {
    auth: true,
  })
}

export async function rejectReview(id: string) {
  return apiPatch(`/admin/reviews/${id}/reject`, {}, AdminReviewItemResponse, {
    auth: true,
  })
}

export async function updateReview(id: string, body: Record<string, unknown>) {
  return apiPatch(`/admin/reviews/${id}`, body, AdminReviewItemResponse, {
    auth: true,
  })
}

export async function deleteReview(id: string) {
  return apiDelete(`/admin/reviews/${id}`, OkResponse, { auth: true })
}
