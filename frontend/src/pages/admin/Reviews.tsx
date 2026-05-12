import { useEffect, useMemo, useState } from 'react'
import {
  Check,
  Download,
  Edit,
  ExternalLink,
  Eye,
  Filter,
  Trash2,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Card } from '@/components/ui/Card'
import { DataTable, Column } from '@/components/admin/DataTable'
import { FormDrawer } from '@/components/admin/FormDrawer'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'
import { StarRating } from '@/components/reviews/StarRating'
import {
  SERVICE_CATEGORIES,
  approveReview,
  deleteReview,
  listAdminReviews,
  rejectReview,
  updateReview,
  type Review,
} from '@/api/reviews'

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected'

function StatusBadge({ status }: { status: Review['status'] }) {
  const map: Record<Review['status'], string> = {
    pending: 'bg-amber/10 text-amber',
    approved: 'bg-primary/10 text-primary',
    rejected: 'bg-red-500/10 text-red-400',
  }
  return (
    <span className={`px-2 py-1 text-xs rounded ${map[status]}`}>{status}</span>
  )
}

function formatDate(value?: string | null) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleString()
  } catch {
    return value
  }
}

interface EditState {
  client_name: string
  company_name: string
  project_name: string
  service_category: string
  review_text: string
  rating: number
  status: Review['status']
  project_links: { label: string; url: string }[]
}

export function AdminReviews() {
  const [items, setItems] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [submitting, setSubmitting] = useState(false)

  const [viewing, setViewing] = useState<Review | null>(null)
  const [editing, setEditing] = useState<Review | null>(null)
  const [editState, setEditState] = useState<EditState | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<Review | null>(null)

  async function load() {
    setLoading(true)
    try {
      const res = await listAdminReviews(
        filter === 'all' ? undefined : filter
      )
      setItems(res.reviews || [])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  const counts = useMemo(() => {
    const tally = { pending: 0, approved: 0, rejected: 0 }
    items.forEach((r) => {
      tally[r.status] += 1
    })
    return tally
  }, [items])

  async function handleApprove(review: Review) {
    setSubmitting(true)
    try {
      const res = await approveReview(review._id)
      if (res.success) {
        toast.success('Review approved')
        load()
        setViewing(null)
      } else {
        toast.error(res.message || 'Approve failed')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Approve failed')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleReject(review: Review) {
    setSubmitting(true)
    try {
      const res = await rejectReview(review._id)
      if (res.success) {
        toast.success('Review rejected')
        load()
        setViewing(null)
      } else {
        toast.error(res.message || 'Reject failed')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Reject failed')
    } finally {
      setSubmitting(false)
    }
  }

  function openEdit(review: Review) {
    setEditing(review)
    setEditState({
      client_name: review.client_name,
      company_name: review.company_name || '',
      project_name: review.project_name || '',
      service_category: review.service_category || '',
      review_text: review.review_text,
      rating: review.rating,
      status: review.status,
      project_links: (review.project_links || []).map((l) => ({ ...l })),
    })
  }

  async function handleSaveEdit() {
    if (!editing || !editState) return
    setSubmitting(true)
    try {
      const body = {
        client_name: editState.client_name.trim(),
        company_name: editState.company_name.trim(),
        project_name: editState.project_name.trim(),
        service_category: editState.service_category,
        review_text: editState.review_text.trim(),
        rating: editState.rating,
        status: editState.status,
        project_links: editState.project_links
          .map((l) => ({ label: l.label, url: l.url.trim() }))
          .filter((l) => l.url),
      }
      const res = await updateReview(editing._id, body)
      if (res.success) {
        toast.success('Review updated')
        setEditing(null)
        setEditState(null)
        load()
      } else {
        toast.error(res.message || 'Update failed')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!deleteDialog) return
    setSubmitting(true)
    try {
      const res = await deleteReview(deleteDialog._id)
      if (res.success) {
        toast.success('Review deleted')
        setDeleteDialog(null)
        load()
      } else {
        toast.error(res.message || 'Delete failed')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setSubmitting(false)
    }
  }

  const columns: Column<Review>[] = [
    {
      key: 'client',
      label: 'Client',
      render: (item) => (
        <div>
          <div className="font-medium text-text-strong">{item.client_name}</div>
          {item.company_name && (
            <div className="text-xs text-text-muted">{item.company_name}</div>
          )}
        </div>
      ),
    },
    {
      key: 'rating',
      label: 'Rating',
      render: (item) => <StarRating value={item.rating} readOnly size={14} />,
    },
    {
      key: 'project',
      label: 'Project',
      render: (item) => (
        <div className="text-sm text-text-strong">
          {item.project_name || <span className="text-text-muted">—</span>}
          {item.service_category && (
            <div className="text-xs text-text-muted">{item.service_category}</div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: 'created',
      label: 'Submitted',
      render: (item) => (
        <div className="text-xs text-text-muted">{formatDate(item.created_at)}</div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => setViewing(item)}>
            <Eye className="w-4 h-4" />
          </Button>
          {item.status !== 'approved' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleApprove(item)}
              disabled={submitting}
              title="Approve"
            >
              <Check className="w-4 h-4 text-primary" />
            </Button>
          )}
          {item.status !== 'rejected' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleReject(item)}
              disabled={submitting}
              title="Reject"
            >
              <X className="w-4 h-4 text-amber" />
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteDialog(item)}
            title="Delete"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-strong">Reviews</h1>
          <p className="text-sm text-text-muted mt-1">
            Approve, reject, edit, or delete client-submitted reviews.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted inline-flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Status
          </span>
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value as StatusFilter)}
            className="min-w-[160px]"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="text-xs text-text-muted uppercase tracking-wide">
            Pending
          </div>
          <div className="text-2xl font-bold text-amber">{counts.pending}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-text-muted uppercase tracking-wide">
            Approved
          </div>
          <div className="text-2xl font-bold text-primary">
            {counts.approved}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-text-muted uppercase tracking-wide">
            Rejected
          </div>
          <div className="text-2xl font-bold text-red-400">
            {counts.rejected}
          </div>
        </Card>
      </div>

      <DataTable<Review>
        data={items}
        columns={columns}
        loading={loading}
        page={page}
        pageSize={items.length || 1}
        total={items.length}
        onPageChange={setPage}
        emptyMessage="No reviews to show."
      />

      {/* View drawer */}
      <FormDrawer
        open={!!viewing}
        onOpenChange={(open) => !open && setViewing(null)}
        title="Review Details"
      >
        {viewing && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold text-text-strong">
                  {viewing.client_name}
                </div>
                {viewing.company_name && (
                  <div className="text-sm text-text-muted">
                    {viewing.company_name}
                  </div>
                )}
              </div>
              <StatusBadge status={viewing.status} />
            </div>

            <div>
              <StarRating value={viewing.rating} readOnly />
            </div>

            <Card className="bg-surface/60">
              <p className="text-text-strong whitespace-pre-line">
                {viewing.review_text}
              </p>
            </Card>

            <div className="grid grid-cols-2 gap-4 text-sm">
              {viewing.project_name && (
                <div>
                  <div className="text-text-muted text-xs">Project</div>
                  <div className="text-text-strong">{viewing.project_name}</div>
                </div>
              )}
              {viewing.service_category && (
                <div>
                  <div className="text-text-muted text-xs">Category</div>
                  <div className="text-text-strong">
                    {viewing.service_category}
                  </div>
                </div>
              )}
              <div>
                <div className="text-text-muted text-xs">Submitted</div>
                <div className="text-text-strong">
                  {formatDate(viewing.created_at)}
                </div>
              </div>
              {typeof viewing.review_link_id === 'object' &&
                viewing.review_link_id?.token && (
                  <div>
                    <div className="text-text-muted text-xs">Source token</div>
                    <div className="text-text-strong text-xs break-all">
                      {viewing.review_link_id.token}
                    </div>
                  </div>
                )}
            </div>

            {viewing.project_links && viewing.project_links.length > 0 && (
              <div>
                <div className="text-sm font-medium text-text-strong mb-2">
                  Project Links
                </div>
                <div className="space-y-2">
                  {viewing.project_links.map((l, i) => (
                    <a
                      key={`${l.url}-${i}`}
                      href={l.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-border bg-surface/60 hover:bg-card transition-colors text-sm"
                    >
                      <span className="text-text-strong">{l.label}</span>
                      <span className="text-text-muted inline-flex items-center gap-1 text-xs">
                        Open <ExternalLink className="w-3 h-3" />
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {viewing.media_files && viewing.media_files.length > 0 && (
              <div>
                <div className="text-sm font-medium text-text-strong mb-2">
                  Media ({viewing.media_files.length})
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {viewing.media_files.map((m, i) => (
                    <a
                      key={`${m.filename}-${i}`}
                      href={m.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="block border border-border bg-surface/60 rounded-lg p-2 hover:bg-card transition-colors"
                    >
                      {m.kind === 'image' ? (
                        <img
                          src={m.url}
                          alt={m.originalName || m.filename}
                          className="w-full h-24 object-cover rounded"
                        />
                      ) : m.kind === 'video' ? (
                        <video
                          src={m.url}
                          className="w-full h-24 object-cover rounded bg-black"
                          controls
                        />
                      ) : (
                        <div className="h-24 flex items-center justify-center rounded bg-card">
                          <Download className="w-6 h-6 text-text-muted" />
                        </div>
                      )}
                      <div className="text-xs text-text-muted truncate mt-1">
                        {m.originalName || m.filename}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-border">
              {viewing.status !== 'approved' && (
                <Button
                  variant="primary"
                  onClick={() => handleApprove(viewing)}
                  disabled={submitting}
                >
                  <Check className="w-4 h-4" />
                  Approve
                </Button>
              )}
              {viewing.status !== 'rejected' && (
                <Button
                  variant="ghost"
                  onClick={() => handleReject(viewing)}
                  disabled={submitting}
                >
                  <X className="w-4 h-4" />
                  Reject
                </Button>
              )}
              <Button variant="ghost" onClick={() => openEdit(viewing)}>
                <Edit className="w-4 h-4" />
                Edit
              </Button>
            </div>
          </div>
        )}
      </FormDrawer>

      {/* Edit drawer */}
      <FormDrawer
        open={!!editing}
        onOpenChange={(open) => {
          if (!open) {
            setEditing(null)
            setEditState(null)
          }
        }}
        title="Edit Review"
      >
        {editing && editState && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-strong mb-2">
                Client Name
              </label>
              <Input
                value={editState.client_name}
                onChange={(e) =>
                  setEditState({ ...editState, client_name: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-strong mb-2">
                  Company
                </label>
                <Input
                  value={editState.company_name}
                  onChange={(e) =>
                    setEditState({ ...editState, company_name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-strong mb-2">
                  Project Name
                </label>
                <Input
                  value={editState.project_name}
                  onChange={(e) =>
                    setEditState({ ...editState, project_name: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-strong mb-2">
                Service Category
              </label>
              <Select
                value={editState.service_category}
                onChange={(e) =>
                  setEditState({
                    ...editState,
                    service_category: e.target.value,
                  })
                }
              >
                <option value="">— None —</option>
                {SERVICE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-strong mb-2">
                Review Text
              </label>
              <Textarea
                rows={5}
                value={editState.review_text}
                onChange={(e) =>
                  setEditState({ ...editState, review_text: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-strong mb-2">
                  Rating
                </label>
                <StarRating
                  value={editState.rating}
                  onChange={(value) => setEditState({ ...editState, rating: value })}
                  size={22}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-strong mb-2">
                  Status
                </label>
                <Select
                  value={editState.status}
                  onChange={(e) =>
                    setEditState({
                      ...editState,
                      status: e.target.value as Review['status'],
                    })
                  }
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-strong mb-2">
                Project Links
              </label>
              <div className="space-y-2">
                {editState.project_links.map((l, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input
                      value={l.label}
                      onChange={(e) => {
                        const next = [...editState.project_links]
                        next[idx] = { ...next[idx], label: e.target.value }
                        setEditState({ ...editState, project_links: next })
                      }}
                      className="max-w-[160px]"
                      placeholder="Label"
                    />
                    <Input
                      value={l.url}
                      onChange={(e) => {
                        const next = [...editState.project_links]
                        next[idx] = { ...next[idx], url: e.target.value }
                        setEditState({ ...editState, project_links: next })
                      }}
                      placeholder="https://…"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const next = editState.project_links.filter(
                          (_, i) => i !== idx
                        )
                        setEditState({ ...editState, project_links: next })
                      }}
                      className="text-text-muted hover:text-red-400 px-2"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setEditState({
                      ...editState,
                      project_links: [
                        ...editState.project_links,
                        { label: 'Website', url: '' },
                      ],
                    })
                  }
                >
                  + Add link
                </Button>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-border">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setEditing(null)
                  setEditState(null)
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveEdit}
                disabled={submitting}
              >
                {submitting ? 'Saving…' : 'Save Changes'}
              </Button>
            </div>
          </div>
        )}
      </FormDrawer>

      <ConfirmDialog
        open={!!deleteDialog}
        onOpenChange={(open) => !open && setDeleteDialog(null)}
        title="Delete Review"
        description={`Delete the review from "${deleteDialog?.client_name}"? Any attached media will also be removed.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        loading={submitting}
        variant="danger"
      />
    </div>
  )
}
