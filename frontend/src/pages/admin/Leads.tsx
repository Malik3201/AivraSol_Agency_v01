import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { DataTable, Column } from '@/components/admin/DataTable'
import { FormDrawer } from '@/components/admin/FormDrawer'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Eye, Mail, Copy } from 'lucide-react'
import { listLeads, updateLead, Lead } from '@/api/admin'
import { toast } from 'sonner'

const statusColors = {
  new: 'bg-primary/10 text-primary',
  qualified: 'bg-amber/10 text-amber',
  proposal: 'bg-surface text-text-strong',
  won: 'bg-green-500/10 text-green-600',
  lost: 'bg-red-500/10 text-red-600',
}

export function Leads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [detailDrawer, setDetailDrawer] = useState<Lead | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const {
    register: registerNote,
    handleSubmit: handleNoteSubmit,
    reset: resetNote,
  } = useForm<{ note: string }>()

  const loadLeads = async () => {
    setLoading(true)
    try {
      const params: any = { page, limit: 20 }
      if (statusFilter) params.status = statusFilter
      const response = await listLeads(params)
      setLeads(response.data)
      setTotal(response.total || response.data.length)
    } catch (error) {
      toast.error('Failed to load leads')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLeads()
  }, [page, statusFilter])

  const handleStatusChange = async (leadId: string, newStatus: Lead['status']) => {
    setSubmitting(true)
    try {
      await updateLead(leadId, { status: newStatus })
      toast.success('Status updated successfully')
      loadLeads()
      if (detailDrawer?.id === leadId) {
        setDetailDrawer({ ...detailDrawer, status: newStatus })
      }
    } catch (error) {
      toast.error('Failed to update status')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddNote = async (data: { note: string }) => {
    if (!detailDrawer || !data.note.trim()) return
    setSubmitting(true)
    try {
      await updateLead(detailDrawer.id, { note: { text: data.note } })
      toast.success('Note added successfully')
      resetNote()
      loadLeads()
      const updated = await listLeads({ page, limit: 20 })
      const updatedLead = updated.data.find((l) => l.id === detailDrawer.id)
      if (updatedLead) {
        setDetailDrawer(updatedLead)
      }
    } catch (error) {
      toast.error('Failed to add note')
    } finally {
      setSubmitting(false)
    }
  }

  const copyEmail = (email: string) => {
    navigator.clipboard.writeText(email)
    toast.success('Email copied to clipboard')
  }

  const columns: Column<Lead>[] = [
    {
      key: 'name',
      label: 'Name',
      render: (item) => (
        <div>
          <div className="font-medium text-text-strong">{item.name}</div>
          <div className="text-xs text-text-muted">{item.email}</div>
        </div>
      ),
    },
    {
      key: 'company',
      label: 'Company',
      render: (item) => (
        <div className="text-text-muted text-sm">{item.company || '—'}</div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (item) => (
        <span className={`px-2 py-1 text-xs rounded capitalize ${statusColors[item.status]}`}>
          {item.status}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (item) => (
        <div className="text-text-muted text-sm">
          {new Date(item.createdAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setDetailDrawer(item)}>
            <Eye className="h-4 w-4" />
          </Button>
          <a href={`mailto:${item.email}`}>
            <Button variant="ghost" size="sm">
              <Mail className="h-4 w-4" />
            </Button>
          </a>
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-text-strong">Leads</h1>
        <div className="flex gap-2">
          {['', 'new', 'qualified', 'proposal', 'won', 'lost'].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setStatusFilter(status)}
            >
              {status || 'All'}
            </Button>
          ))}
        </div>
      </div>

      <DataTable
        data={leads}
        columns={columns}
        loading={loading}
        page={page}
        pageSize={20}
        total={total}
        onPageChange={setPage}
      />

      <FormDrawer
        open={!!detailDrawer}
        onOpenChange={(open) => !open && setDetailDrawer(null)}
        title="Lead Details"
      >
        {detailDrawer && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-text-muted mb-2">Contact</h3>
              <div className="text-text-strong mb-1">{detailDrawer.name}</div>
              <div className="flex items-center gap-2">
                <span className="text-text-muted text-sm">{detailDrawer.email}</span>
                <button
                  onClick={() => copyEmail(detailDrawer.email)}
                  className="text-text-muted hover:text-primary"
                >
                  <Copy className="h-3 w-3" />
                </button>
              </div>
              {detailDrawer.company && (
                <div className="text-text-muted text-sm mt-1">{detailDrawer.company}</div>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium text-text-muted mb-2">Status</h3>
              <Select
                value={detailDrawer.status}
                onChange={(e) => handleStatusChange(detailDrawer.id, e.target.value as any)}
                disabled={submitting}
              >
                <option value="new">New</option>
                <option value="qualified">Qualified</option>
                <option value="proposal">Proposal</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
              </Select>
            </div>

            {detailDrawer.projectType && detailDrawer.projectType.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-text-muted mb-2">Project Type</h3>
                <div className="flex gap-2 flex-wrap">
                  {detailDrawer.projectType.map((type, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-primary/10 text-primary text-xs rounded"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {detailDrawer.budgetRange && (
              <div>
                <h3 className="text-sm font-medium text-text-muted mb-2">Budget</h3>
                <div className="text-text-strong">{detailDrawer.budgetRange}</div>
              </div>
            )}

            {detailDrawer.timeline && (
              <div>
                <h3 className="text-sm font-medium text-text-muted mb-2">Timeline</h3>
                <div className="text-text-strong">{detailDrawer.timeline}</div>
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium text-text-muted mb-2">Message</h3>
              <div className="text-text-strong bg-surface p-4 rounded-lg whitespace-pre-wrap">
                {detailDrawer.message}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-text-muted mb-3">Notes</h3>
              <div className="space-y-3 mb-4">
                {detailDrawer.notes.map((note, idx) => (
                  <div key={idx} className="bg-surface p-3 rounded-lg">
                    <div className="text-sm text-text-strong">{note.text}</div>
                    <div className="text-xs text-text-muted mt-1">
                      {new Date(note.at).toLocaleString()}
                    </div>
                  </div>
                ))}
                {detailDrawer.notes.length === 0 && (
                  <div className="text-text-muted text-sm">No notes yet</div>
                )}
              </div>

              <form onSubmit={handleNoteSubmit(handleAddNote)} className="space-y-3">
                <Textarea
                  {...registerNote('note')}
                  rows={3}
                  placeholder="Add a note..."
                  disabled={submitting}
                />
                <Button type="submit" variant="primary" size="sm" disabled={submitting}>
                  {submitting ? 'Adding...' : 'Add Note'}
                </Button>
              </form>
            </div>
          </div>
        )}
      </FormDrawer>
    </div>
  )
}

