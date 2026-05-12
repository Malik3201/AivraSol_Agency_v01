import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  Loader2,
  Plus,
  Upload,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/layout/Container'
import { StarRating } from '@/components/reviews/StarRating'
import {
  PROJECT_LINK_LABELS,
  SERVICE_CATEGORIES,
  submitReview,
  validateReviewToken,
} from '@/api/reviews'

type TokenStatus = 'loading' | 'valid' | 'used' | 'invalid' | 'expired' | 'submitted'

interface ProjectLinkRow {
  label: string
  url: string
}

const ACCEPTED_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.mp4',
  '.mov',
  '.webm',
  '.pdf',
  '.doc',
  '.docx',
  '.ai',
  '.psd',
  '.fig',
  '.xd',
  '.zip',
]

const IMAGE_EXT = ['jpg', 'jpeg', 'png', 'webp', 'gif']
const VIDEO_EXT = ['mp4', 'mov', 'webm']
const DOC_EXT = ['pdf', 'doc', 'docx']
const DESIGN_EXT = ['ai', 'psd', 'fig', 'xd', 'zip']

const MAX_FILES = 10
const MAX_IMAGE_DOC_BYTES = 10 * 1024 * 1024
const MAX_VIDEO_BYTES = 50 * 1024 * 1024

function getExt(name: string) {
  const idx = name.lastIndexOf('.')
  return idx >= 0 ? name.slice(idx + 1).toLowerCase() : ''
}

function isAllowedExt(ext: string) {
  return [...IMAGE_EXT, ...VIDEO_EXT, ...DOC_EXT, ...DESIGN_EXT].includes(ext)
}

function isValidUrl(value: string) {
  try {
    const u = new URL(value)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

function StatusMessage({
  title,
  message,
  tone = 'neutral',
}: {
  title: string
  message: string
  tone?: 'success' | 'error' | 'neutral'
}) {
  const colors =
    tone === 'success'
      ? 'border-primary/40 bg-primary/5'
      : tone === 'error'
      ? 'border-red-500/40 bg-red-500/5'
      : 'border-border bg-surface/60'
  const titleColor =
    tone === 'success'
      ? 'text-primary'
      : tone === 'error'
      ? 'text-red-400'
      : 'text-text-strong'
  return (
    <Card className={`mt-12 ${colors} text-center`}>
      <h1 className={`text-2xl md:text-3xl font-bold mb-3 ${titleColor}`}>{title}</h1>
      <p className="text-text-muted text-base md:text-lg">{message}</p>
    </Card>
  )
}

export function ReviewSubmit() {
  const { token } = useParams<{ token: string }>()
  const [status, setStatus] = useState<TokenStatus>('loading')
  const [message, setMessage] = useState<string>('')
  const [prefill, setPrefill] = useState<{ client_name?: string; project_name?: string }>(
    {}
  )

  const [clientName, setClientName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [projectName, setProjectName] = useState('')
  const [serviceCategory, setServiceCategory] = useState('')
  const [reviewText, setReviewText] = useState('')
  const [rating, setRating] = useState(0)
  const [links, setLinks] = useState<ProjectLinkRow[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let mounted = true
    if (!token) {
      setStatus('invalid')
      setMessage('Invalid review link. Please contact the AivraSol team.')
      return
    }
    validateReviewToken(token)
      .then((res) => {
        if (!mounted) return
        if (res.status === 'valid') {
          setStatus('valid')
          setPrefill(res.data || {})
          setClientName(res.data?.client_name || '')
          setProjectName(res.data?.project_name || '')
        } else if (res.status === 'used') {
          setStatus('used')
          setMessage(
            res.message || 'Thank you! You have already submitted your review.'
          )
        } else if (res.status === 'expired') {
          setStatus('expired')
          setMessage(
            'This review link has expired. Please contact the AivraSol team for a new link.'
          )
        } else {
          setStatus('invalid')
          setMessage('Invalid review link. Please contact the AivraSol team.')
        }
      })
      .catch(() => {
        if (!mounted) return
        setStatus('invalid')
        setMessage('Invalid review link. Please contact the AivraSol team.')
      })
    return () => {
      mounted = false
    }
  }, [token])

  const totalBytes = useMemo(
    () => files.reduce((sum, f) => sum + f.size, 0),
    [files]
  )

  function addLink() {
    setLinks((prev) => [...prev, { label: 'Website', url: '' }])
  }
  function updateLink(i: number, patch: Partial<ProjectLinkRow>) {
    setLinks((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)))
  }
  function removeLink(i: number) {
    setLinks((prev) => prev.filter((_, idx) => idx !== i))
  }

  function handleFilesSelected(list: FileList | null) {
    if (!list) return
    const incoming = Array.from(list)
    const next: File[] = [...files]
    for (const file of incoming) {
      if (next.length >= MAX_FILES) {
        toast.error(`You can only attach up to ${MAX_FILES} files`)
        break
      }
      const ext = getExt(file.name)
      if (!isAllowedExt(ext)) {
        toast.error(`File "${file.name}" has an unsupported type`)
        continue
      }
      const isVideo = VIDEO_EXT.includes(ext)
      const limit = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_DOC_BYTES
      if (file.size > limit) {
        const mb = Math.round(limit / (1024 * 1024))
        toast.error(`"${file.name}" exceeds the ${mb}MB limit`)
        continue
      }
      next.push(file)
    }
    setFiles(next)
  }

  function removeFile(idx: number) {
    setFiles((prev) => prev.filter((_, i) => i !== idx))
  }

  function validate() {
    const next: Record<string, string> = {}
    if (!clientName.trim()) next.clientName = 'Your name is required'
    if (!reviewText.trim()) next.reviewText = 'Please share your review'
    if (rating < 1 || rating > 5) next.rating = 'Please select a star rating'

    links.forEach((link, idx) => {
      if (link.url.trim() && !isValidUrl(link.url.trim())) {
        next[`link-${idx}`] = 'Enter a valid URL starting with http:// or https://'
      }
    })

    if (
      serviceCategory &&
      !SERVICE_CATEGORIES.includes(serviceCategory as (typeof SERVICE_CATEGORIES)[number])
    ) {
      next.serviceCategory = 'Choose a valid category'
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token) return
    if (!validate()) return

    const fd = new FormData()
    fd.append('client_name', clientName.trim())
    fd.append('review_text', reviewText.trim())
    fd.append('rating', String(rating))
    if (companyName.trim()) fd.append('company_name', companyName.trim())
    if (projectName.trim()) fd.append('project_name', projectName.trim())
    if (serviceCategory) fd.append('service_category', serviceCategory)

    const cleanLinks = links
      .map((l) => ({ label: l.label || 'Other', url: l.url.trim() }))
      .filter((l) => l.url)
    if (cleanLinks.length > 0) {
      fd.append('project_links', JSON.stringify(cleanLinks))
    }
    files.forEach((file) => fd.append('media', file))

    setSubmitting(true)
    try {
      const res = await submitReview(token, fd)
      if (res.success) {
        setStatus('submitted')
        setMessage(
          res.message ||
            'Thank you! Your review has been submitted successfully and is awaiting approval.'
        )
        toast.success('Review submitted')
      } else {
        toast.error(res.message || 'Failed to submit review')
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to submit review'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (status === 'loading') {
    return (
      <Container size="md">
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="flex items-center gap-3 text-text-muted">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Validating review link…</span>
          </div>
        </div>
      </Container>
    )
  }

  if (status === 'submitted') {
    return (
      <Container size="md">
        <Card className="mt-12 border-primary/40 bg-primary/5 text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="w-14 h-14 text-primary" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-3 text-primary">
            Thank you!
          </h1>
          <p className="text-text-muted text-base md:text-lg">{message}</p>
        </Card>
      </Container>
    )
  }

  if (status !== 'valid') {
    return (
      <Container size="md">
        <StatusMessage
          title={
            status === 'used'
              ? 'Already submitted'
              : status === 'expired'
              ? 'Link expired'
              : 'Invalid link'
          }
          message={message}
          tone={status === 'used' ? 'success' : 'error'}
        />
      </Container>
    )
  }

  return (
    <Container size="md" className="py-10 md:py-16">
      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-text-strong">
          Share Your Experience
        </h1>
        <p className="text-text-muted mt-2 max-w-xl mx-auto">
          {prefill.project_name
            ? `We'd love to hear what you thought about ${prefill.project_name}.`
            : 'Thanks for working with AivraSol — your feedback helps us grow.'}
        </p>
      </div>

      <Card className="p-6 md:p-10">
        <form onSubmit={onSubmit} className="space-y-7">
          {/* Required */}
          <div>
            <label className="block text-sm font-medium text-text-strong mb-2">
              Your Name <span className="text-red-400">*</span>
            </label>
            <Input
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Jane Doe"
              disabled={submitting}
            />
            {errors.clientName && (
              <p className="mt-1 text-sm text-red-400">{errors.clientName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-strong mb-2">
              Your Rating <span className="text-red-400">*</span>
            </label>
            <StarRating value={rating} onChange={setRating} />
            {errors.rating && (
              <p className="mt-1 text-sm text-red-400">{errors.rating}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-strong mb-2">
              Your Review <span className="text-red-400">*</span>
            </label>
            <Textarea
              rows={5}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Tell us about working with the team, the results, the experience…"
              disabled={submitting}
            />
            {errors.reviewText && (
              <p className="mt-1 text-sm text-red-400">{errors.reviewText}</p>
            )}
          </div>

          {/* Optional grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-text-strong mb-2">
                Company
              </label>
              <Input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Company name (optional)"
                disabled={submitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-strong mb-2">
                Project Name
              </label>
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Project name (optional)"
                disabled={submitting}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-strong mb-2">
              Service Category
            </label>
            <Select
              value={serviceCategory}
              onChange={(e) => setServiceCategory(e.target.value)}
              disabled={submitting}
            >
              <option value="">— Select a category (optional) —</option>
              {SERVICE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
            {errors.serviceCategory && (
              <p className="mt-1 text-sm text-red-400">{errors.serviceCategory}</p>
            )}
          </div>

          {/* Project links */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-text-strong inline-flex items-center gap-2">
                <LinkIcon className="w-4 h-4" /> Project Links
              </label>
              <Button type="button" variant="ghost" size="sm" onClick={addLink}>
                <Plus className="w-4 h-4" />
                Add link
              </Button>
            </div>
            {links.length === 0 ? (
              <p className="text-xs text-text-muted">
                Add links to live work, behance, dribbble, app stores, etc.
              </p>
            ) : (
              <div className="space-y-3">
                {links.map((link, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2">
                    <div className="col-span-4 md:col-span-3">
                      <Select
                        value={link.label}
                        onChange={(e) =>
                          updateLink(idx, { label: e.target.value })
                        }
                        disabled={submitting}
                      >
                        {PROJECT_LINK_LABELS.map((l) => (
                          <option key={l} value={l}>
                            {l}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="col-span-7 md:col-span-8">
                      <Input
                        value={link.url}
                        onChange={(e) =>
                          updateLink(idx, { url: e.target.value })
                        }
                        placeholder="https://…"
                        disabled={submitting}
                      />
                      {errors[`link-${idx}`] && (
                        <p className="mt-1 text-xs text-red-400">
                          {errors[`link-${idx}`]}
                        </p>
                      )}
                    </div>
                    <div className="col-span-1 flex items-start">
                      <button
                        type="button"
                        onClick={() => removeLink(idx)}
                        className="h-11 w-11 inline-flex items-center justify-center text-text-muted hover:text-red-400 transition-colors"
                        aria-label="Remove link"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Media upload */}
          <div>
            <label className="block text-sm font-medium text-text-strong mb-2 inline-flex items-center gap-2">
              <ImageIcon className="w-4 h-4" /> Media Attachments
            </label>
            <p className="text-xs text-text-muted mb-3">
              Images, videos, documents, or design files. Up to {MAX_FILES} files.
              Images/docs/designs max 10MB. Videos max 50MB.
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-surface hover:bg-card cursor-pointer transition-colors text-sm">
                <Upload className="w-4 h-4" />
                Choose files
                <input
                  type="file"
                  multiple
                  className="hidden"
                  accept={ACCEPTED_EXTENSIONS.join(',')}
                  onChange={(e) => handleFilesSelected(e.target.files)}
                  disabled={submitting}
                />
              </label>
              {files.length > 0 && (
                <span className="text-xs text-text-muted">
                  {files.length}/{MAX_FILES} files · {formatBytes(totalBytes)}
                </span>
              )}
            </div>

            {files.length > 0 && (
              <ul className="mt-4 space-y-2">
                {files.map((file, idx) => (
                  <li
                    key={`${file.name}-${idx}`}
                    className="flex items-center justify-between gap-3 bg-surface/60 border border-border rounded-xl px-3 py-2"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="w-4 h-4 text-text-muted shrink-0" />
                      <div className="min-w-0">
                        <div className="text-sm text-text-strong truncate">
                          {file.name}
                        </div>
                        <div className="text-xs text-text-muted">
                          {formatBytes(file.size)}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="text-text-muted hover:text-red-400"
                      aria-label={`Remove ${file.name}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="pt-4 border-t border-border flex justify-end">
            <Button type="submit" variant="primary" size="lg" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                'Submit Review'
              )}
            </Button>
          </div>
        </form>
      </Card>
    </Container>
  )
}
