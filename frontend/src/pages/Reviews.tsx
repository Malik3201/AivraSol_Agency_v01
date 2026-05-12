import { useEffect, useState } from 'react'
import {
  Building2,
  Download,
  ExternalLink,
  FileText,
  Loader2,
  Quote,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Container } from '@/components/layout/Container'
import { SectionHeading } from '@/components/layout/SectionHeading'
import { ContentError } from '@/components/ui/ContentError'
import { StarRating } from '@/components/reviews/StarRating'
import { listApprovedReviews, type Review } from '@/api/reviews'

function MediaPreview({
  url,
  kind,
  name,
}: {
  url: string
  kind?: string
  name?: string
}) {
  const label = name || url.split('/').pop() || 'Attachment'

  if (kind === 'image') {
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer noopener"
        className="block group"
      >
        <img
          src={url}
          alt={label}
          loading="lazy"
          className="w-full h-32 object-cover rounded-lg border border-border group-hover:opacity-90 transition-opacity"
        />
      </a>
    )
  }

  if (kind === 'video') {
    return (
      <video
        src={url}
        controls
        className="w-full h-32 rounded-lg border border-border bg-surface"
      />
    )
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer noopener"
      className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-border bg-surface/60 hover:bg-card transition-colors text-sm"
      title={label}
    >
      <span className="inline-flex items-center gap-2 truncate text-text-strong">
        <FileText className="w-4 h-4 text-text-muted shrink-0" />
        <span className="truncate">{label}</span>
      </span>
      <Download className="w-4 h-4 text-text-muted" />
    </a>
  )
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <Card className="relative h-full flex flex-col">
      <Quote className="absolute top-4 right-4 h-10 w-10 text-primary/10" />

      <div className="mb-4">
        <StarRating value={review.rating} readOnly size={18} />
      </div>

      <p className="text-text-strong text-base md:text-lg leading-relaxed relative z-10 mb-6 whitespace-pre-line">
        “{review.review_text}”
      </p>

      {review.media_files && review.media_files.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-5">
          {review.media_files.slice(0, 4).map((m, i) => (
            <MediaPreview
              key={`${m.filename}-${i}`}
              url={m.url}
              kind={m.kind}
              name={m.originalName || m.filename}
            />
          ))}
        </div>
      )}

      {review.project_links && review.project_links.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-2">
          {review.project_links.map((link, i) => (
            <a
              key={`${link.url}-${i}`}
              href={link.url}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md border border-border bg-surface hover:bg-card transition-colors text-text-strong"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              {link.label}
            </a>
          ))}
        </div>
      )}

      <div className="mt-auto pt-4 border-t border-border">
        <div className="font-semibold text-text-strong">{review.client_name}</div>
        {(review.company_name || review.service_category) && (
          <div className="text-sm text-text-muted inline-flex items-center gap-1.5">
            {review.company_name && (
              <span className="inline-flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                {review.company_name}
              </span>
            )}
            {review.company_name && review.service_category && (
              <span className="text-text-muted/50">·</span>
            )}
            {review.service_category && <span>{review.service_category}</span>}
          </div>
        )}
        {review.project_name && (
          <div className="text-xs text-text-muted mt-1">
            Project: {review.project_name}
          </div>
        )}
      </div>
    </Card>
  )
}

export function Reviews() {
  const [items, setItems] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let mounted = true
    listApprovedReviews()
      .then((res) => {
        if (!mounted) return
        setItems(res.reviews || [])
        setLoading(false)
      })
      .catch((err) => {
        if (!mounted) return
        setError(err instanceof Error ? err : new Error('Failed to load reviews'))
        setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  return (
    <section className="py-16 md:py-24">
      <Container>
        <SectionHeading
          title="Client Reviews"
          subtitle="Real words from teams we've shipped real work with"
        />

        {loading ? (
          <div className="flex items-center justify-center py-16 text-text-muted gap-3">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading reviews…
          </div>
        ) : error ? (
          <ContentError error={error} onRetry={() => window.location.reload()} />
        ) : items.length === 0 ? (
          <Card className="text-center py-16">
            <p className="text-text-muted">
              No client reviews yet — check back soon.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((review) => (
              <ReviewCard key={review._id} review={review} />
            ))}
          </div>
        )}
      </Container>
    </section>
  )
}
