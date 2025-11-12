import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Edit, Trash2 } from 'lucide-react'
import { DataTable, Column } from '@/components/admin/DataTable'
import { FormDrawer } from '@/components/admin/FormDrawer'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { listFaqs, createKnowledge, updateKnowledge, deleteKnowledge } from '@/api/admin'
import { KnowledgeDto } from '@/api/schemas'
import { toast } from 'sonner'

const knowledgeFormSchema = z.object({
  type: z.enum(['faq', 'testimonial']).default('faq'),
  refId: z.string().optional(),
  question: z.string().min(2).max(240),
  answer: z.string().min(2).max(5000),
  keywords: z.string(),
})

type KnowledgeForm = z.infer<typeof knowledgeFormSchema>

export function Knowledge() {
  const [knowledge, setKnowledge] = useState<KnowledgeDto[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [formOpen, setFormOpen] = useState(false)
  const [editingKnowledge, setEditingKnowledge] = useState<KnowledgeDto | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<KnowledgeDto | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<KnowledgeForm>({
    resolver: zodResolver(knowledgeFormSchema),
    defaultValues: {
      type: 'faq',
      keywords: '',
    },
  })

  const loadKnowledge = async () => {
    setLoading(true)
    try {
      const response = await listFaqs()
      const data = (response as any).faqs || []
      const adapted: KnowledgeDto[] = data.map((f: any) => ({
        id: f._id,
        type: 'faq',
        refId: undefined,
        question: f.question,
        answer: f.answer,
        keywords: [],
      }))
      setKnowledge(adapted as any)
      setTotal(adapted.length)
    } catch (error) {
      toast.error('Failed to load knowledge')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadKnowledge()
  }, [page])

  const openCreate = () => {
    setEditingKnowledge(null)
    reset({ type: 'faq', refId: '', question: '', answer: '', keywords: '' })
    setFormOpen(true)
  }

  const openEdit = (item: KnowledgeDto) => {
    setEditingKnowledge(item)
    reset({
      type: 'faq',
      refId: '',
      question: item.question,
      answer: item.answer,
      keywords: item.keywords.join(', '),
    })
    setFormOpen(true)
  }

  const onSubmit = async (data: KnowledgeForm) => {
    setSubmitting(true)
    try {
      const body = {
        question: data.question,
        answer: data.answer,
        category: undefined,
        order: undefined,
        active: true,
      }

      if (editingKnowledge) {
        await updateKnowledge(editingKnowledge.id, body)
        toast.success('FAQ updated successfully')
      } else {
        await createKnowledge(body)
        toast.success('FAQ created successfully')
      }

      setFormOpen(false)
      loadKnowledge()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Operation failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog) return
    setSubmitting(true)
    try {
      await deleteKnowledge(deleteDialog.id)
      toast.success('Knowledge deleted successfully')
      setDeleteDialog(null)
      loadKnowledge()
    } catch (error) {
      toast.error('Failed to delete knowledge')
    } finally {
      setSubmitting(false)
    }
  }

  const columns: Column<KnowledgeDto>[] = [
    {
      key: 'type',
      label: 'Type',
      render: (item) => (
        <span className="px-2 py-1 bg-surface text-text-strong text-xs rounded uppercase">
          {item.type}
        </span>
      ),
    },
    {
      key: 'question',
      label: 'Question',
      render: (item) => (
        <div className="max-w-md">
          <div className="font-medium text-text-strong truncate">{item.question}</div>
        </div>
      ),
    },
    {
      key: 'keywords',
      label: 'Keywords',
      render: (item) => (
        <div className="flex gap-1 flex-wrap max-w-xs">
          {item.keywords.slice(0, 3).map((keyword, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded"
            >
              {keyword}
            </span>
          ))}
          {item.keywords.length > 3 && (
            <span className="text-text-muted text-xs">+{item.keywords.length - 3}</span>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleteDialog(item)}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-text-strong">FAQs</h1>
        <Button variant="primary" onClick={openCreate}>
          Add FAQ
        </Button>
      </div>

      <DataTable
        data={knowledge}
        columns={columns}
        loading={loading}
        page={page}
        pageSize={20}
        total={total}
        onPageChange={setPage}
      />

      <FormDrawer
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editingKnowledge ? 'Edit Knowledge' : 'Create Knowledge'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-strong mb-2">Type *</label>
            <Select {...register('type')}>
              <option value="faq">FAQ</option>
              <option value="testimonial">Testimonial</option>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-strong mb-2">
              Reference ID (optional)
            </label>
            <Input {...register('refId')} placeholder="Service or Project ID" />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-strong mb-2">Question *</label>
            <Input {...register('question')} placeholder="Enter question" />
            {errors.question && (
              <p className="mt-1 text-sm text-red-500">{errors.question.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-strong mb-2">Answer *</label>
            <Textarea {...register('answer')} rows={8} placeholder="Enter detailed answer" />
            {errors.answer && <p className="mt-1 text-sm text-red-500">{errors.answer.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-strong mb-2">
              Keywords (comma-separated)
            </label>
            <Input {...register('keywords')} placeholder="react, typescript, api" />
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Saving...' : editingKnowledge ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </FormDrawer>

      <ConfirmDialog
        open={!!deleteDialog}
        onOpenChange={(open) => !open && setDeleteDialog(null)}
        title="Delete Knowledge"
        description={`Are you sure you want to delete this knowledge entry? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        loading={submitting}
        variant="danger"
      />
    </div>
  )
}

