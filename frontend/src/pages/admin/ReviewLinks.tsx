import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Check, Copy, Link2, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { DataTable, Column } from '@/components/admin/DataTable'
import { FormDrawer } from '@/components/admin/FormDrawer'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'
import {
  createReviewLink,
  deleteReviewLink,
  listReviewLinks,
  type ReviewLink,
} from '@/api/reviews'

interface LinkForm {
  client_name?: string
  client_email?: string
  project_name?: string
  expires_at?: string
}

function defaultExpiry() {
  // 30 days from today, formatted as yyyy-mm-dd for <input type="date">
  const d = new Date()
  d.setDate(d.getDate() + 30)
  return d.toISOString().slice(0, 10)
}

function formatDate(value?: string | null) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleString()
  } catch {
    return value
  }
}

function StatusBadge({ status }: { status?: string }) {
  const map: Record<string, string> = {
    unused: 'bg-primary/10 text-primary',
    used: 'bg-amber/10 text-amber',
    expired: 'bg-red-500/10 text-red-400',
  }
  const cls = map[status || 'unused'] || 'bg-surface text-text-muted'
  return (
    <span className={`px-2 py-1 text-xs rounded ${cls}`}>
      {status || 'unused'}
    </span>
  )
}

export function ReviewLinks() {
  const [items, setItems] = useState<ReviewLink[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<ReviewLink | null>(null)
  const [copiedToken, setCopiedToken] = useState<string | null>(null)
  const [generated, setGenerated] = useState<{
    url: string
    expires_at?: string | null
  } | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LinkForm>({ defaultValues: { expires_at: defaultExpiry() } })

  async function load() {
    setLoading(true)
    try {
      const res = await listReviewLinks()
      setItems(res.reviewLinks || [])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load links')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function openCreate() {
    setGenerated(null)
    reset({
      client_name: '',
      client_email: '',
      project_name: '',
      expires_at: defaultExpiry(),
    })
    setFormOpen(true)
  }

  async function onSubmit(data: LinkForm) {
    setSubmitting(true)
    try {
      const res = await createReviewLink({
        client_name: data.client_name || undefined,
        client_email: data.client_email || undefined,
        project_name: data.project_name || undefined,
        expires_at: data.expires_at || undefined,
      })
      if (res.success && res.url) {
        toast.success('Review link generated')
        setGenerated({
          url: res.url,
          expires_at: res.reviewLink?.expires_at,
        })
        load()
      } else {
        toast.error(res.message || 'Failed to generate link')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate link')
    } finally {
      setSubmitting(false)
    }
  }

  async function copyLink(url: string, token?: string) {
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard')
      if (token) {
        setCopiedToken(token)
        setTimeout(() => setCopiedToken(null), 1500)
      }
    } catch {
      toast.error('Could not copy to clipboard')
    }
  }

  async function handleDelete() {
    if (!deleteDialog) return
    setSubmitting(true)
    try {
      const res = await deleteReviewLink(deleteDialog._id)
      if (res.success) {
        toast.success('Link deleted')
        setDeleteDialog(null)
        load()
      } else {
        toast.error(res.message || 'Could not delete')
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const columns: Column<ReviewLink>[] = [
    {
      key: 'client',
      label: 'Client',
      render: (item) => (
        <div>
          <div className="font-medium text-text-strong">
            {item.client_name || <span className="text-text-muted">—</span>}
          </div>
          {item.client_email && (
            <div className="text-xs text-text-muted">{item.client_email}</div>
          )}
        </div>
      ),
    },
    {
      key: 'project',
      label: 'Project',
      render: (item) => (
        <div className="text-sm text-text-strong">
          {item.project_name || <span className="text-text-muted">—</span>}
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
      label: 'Created',
      render: (item) => (
        <div className="text-xs text-text-muted">{formatDate(item.created_at)}</div>
      ),
    },
    {
      key: 'used',
      label: 'Used',
      render: (item) => (
        <div className="text-xs text-text-muted">{formatDate(item.used_at)}</div>
      ),
    },
    {
      key: 'expires',
      label: 'Expires',
      render: (item) => (
        <div className="text-xs text-text-muted">
          {formatDate(item.expires_at)}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => item.url && copyLink(item.url, item.token)}
            disabled={!item.url}
            title={item.url}
          >
            {copiedToken === item.token ? (
              <Check className="w-4 h-4 text-primary" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            Copy
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteDialog(item)}
          >
            <Trash2 className="w-4 h-4 text-red-400" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-text-strong">Review Links</h1>
          <p className="text-sm text-text-muted mt-1">
            Generate one-time review links for clients.
          </p>
        </div>
        <Button variant="primary" onClick={openCreate}>
          <Plus className="w-4 h-4" />
          Generate Link
        </Button>
      </div>

      <DataTable<ReviewLink>
        data={items}
        columns={columns}
        loading={loading}
        page={page}
        pageSize={items.length || 1}
        total={items.length}
        onPageChange={setPage}
        emptyMessage="No review links yet. Generate one to get started."
      />

      <FormDrawer
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setGenerated(null)
        }}
        title="Generate Review Link"
        description="Create a unique one-time link to send to a client."
      >
        {generated ? (
          <div className="space-y-4">
            <Card className="bg-primary/5 border-primary/30">
              <div className="flex items-center gap-2 text-primary mb-2">
                <Link2 className="w-5 h-5" />
                <span className="text-sm font-medium">Link ready</span>
              </div>
              <div className="bg-surface border border-border rounded-lg p-3 text-sm text-text-strong break-all">
                {generated.url}
              </div>
              {generated.expires_at && (
                <p className="text-xs text-text-muted mt-2">
                  Expires: {formatDate(generated.expires_at)}
                </p>
              )}
            </Card>
            <div className="flex gap-3">
              <Button
                variant="primary"
                onClick={() => copyLink(generated.url)}
              >
                <Copy className="w-4 h-4" />
                Copy Link
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setGenerated(null)
                  reset({ expires_at: defaultExpiry() })
                }}
              >
                Generate another
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setFormOpen(false)
                  setGenerated(null)
                }}
              >
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-strong mb-2">
                Client Name
              </label>
              <Input
                {...register('client_name')}
                placeholder="Optional"
                disabled={submitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-strong mb-2">
                Client Email
              </label>
              <Input
                type="email"
                {...register('client_email')}
                placeholder="Optional"
                disabled={submitting}
              />
              {errors.client_email && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.client_email.message as string}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-text-strong mb-2">
                Project Name
              </label>
              <Input
                {...register('project_name')}
                placeholder="Optional"
                disabled={submitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-strong mb-2">
                Expiry Date
              </label>
              <Input
                type="date"
                {...register('expires_at')}
                disabled={submitting}
              />
              <p className="text-xs text-text-muted mt-1">
                Defaults to 30 days from today.
              </p>
            </div>
            <div className="flex gap-3 pt-4 border-t border-border">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setFormOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Generating…' : 'Generate'}
              </Button>
            </div>
          </form>
        )}
      </FormDrawer>

      <ConfirmDialog
        open={!!deleteDialog}
        onOpenChange={(open) => !open && setDeleteDialog(null)}
        title="Delete Review Link"
        description={
          deleteDialog?.is_used
            ? 'This link has been used and may have an attached review. Deleting it will also leave the review without its source link.'
            : 'Are you sure you want to delete this review link? This cannot be undone.'
        }
        confirmLabel="Delete"
        onConfirm={handleDelete}
        loading={submitting}
        variant="danger"
      />
    </div>
  )
}
