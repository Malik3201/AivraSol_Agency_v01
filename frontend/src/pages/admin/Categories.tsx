import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { DataTable, Column } from '@/components/admin/DataTable'
import { FormDrawer } from '@/components/admin/FormDrawer'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { apiGet } from '@/api/http'
import { createCategory, updateCategory, deleteCategory, CategoryBody } from '@/api/admin'
import { CategoryDto, CategoryDtoSchema, ListEnvelope } from '@/api/schemas'
import { toast } from 'sonner'

const categoryFormSchema = z.object({
  title: z.string().min(2).max(120),
  description: z.string().max(1000),
  type: z.enum(['category', 'industry', 'tech']),
  order: z.coerce.number().int(),
})

type CategoryForm = z.infer<typeof categoryFormSchema>

export function Categories() {
  const [categories, setCategories] = useState<CategoryDto[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [formOpen, setFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CategoryDto | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<CategoryDto | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryForm>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      type: 'category',
      order: 0,
    },
  })

  const loadCategories = async () => {
    setLoading(true)
    try {
      const response = await apiGet('/api/categories', ListEnvelope(CategoryDtoSchema))
      setCategories(response.data)
      setTotal(response.total || response.data.length)
    } catch (error) {
      toast.error('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [page])

  const openCreate = () => {
    setEditingCategory(null)
    reset({ title: '', description: '', type: 'category', order: 0 })
    setFormOpen(true)
  }

  const openEdit = (category: CategoryDto) => {
    setEditingCategory(category)
    reset({
      title: category.title,
      description: category.description,
      type: category.type as any,
      order: category.order,
    })
    setFormOpen(true)
  }

  const onSubmit = async (data: CategoryForm) => {
    setSubmitting(true)
    try {
      const body: CategoryBody = {
        title: data.title,
        description: data.description,
        type: data.type,
        order: data.order,
      }

      if (editingCategory) {
        await updateCategory(editingCategory.id, body)
        toast.success('Category updated successfully')
      } else {
        await createCategory(body)
        toast.success('Category created successfully')
      }

      setFormOpen(false)
      loadCategories()
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
      await deleteCategory(deleteDialog.id)
      toast.success('Category deleted successfully')
      setDeleteDialog(null)
      loadCategories()
    } catch (error) {
      toast.error('Failed to delete category')
    } finally {
      setSubmitting(false)
    }
  }

  const columns: Column<CategoryDto>[] = [
    {
      key: 'title',
      label: 'Title',
      render: (item) => (
        <div>
          <div className="font-medium text-text-strong">{item.title}</div>
          <div className="text-xs text-text-muted">{item.slug}</div>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: (item) => (
        <span className="px-2 py-1 bg-surface text-text-strong text-xs rounded capitalize">
          {item.type}
        </span>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (item) => (
        <div className="max-w-xs truncate text-text-muted">{item.description || '—'}</div>
      ),
    },
    {
      key: 'order',
      label: 'Order',
      render: (item) => <span className="text-text-muted">{item.order}</span>,
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
        <h1 className="text-3xl font-bold text-text-strong">Categories</h1>
        <Button variant="primary" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      <DataTable
        data={categories}
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
        title={editingCategory ? 'Edit Category' : 'Create Category'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-strong mb-2">Title *</label>
            <Input {...register('title')} placeholder="Category title" />
            {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-strong mb-2">Type *</label>
            <Select {...register('type')}>
              <option value="category">Category</option>
              <option value="industry">Industry</option>
              <option value="tech">Technology</option>
            </Select>
            {errors.type && <p className="mt-1 text-sm text-red-500">{errors.type.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-strong mb-2">Description</label>
            <Textarea {...register('description')} rows={4} placeholder="Optional description" />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-strong mb-2">Order</label>
            <Input type="number" {...register('order')} placeholder="0" />
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </FormDrawer>

      <ConfirmDialog
        open={!!deleteDialog}
        onOpenChange={(open) => !open && setDeleteDialog(null)}
        title="Delete Category"
        description={`Are you sure you want to delete "${deleteDialog?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        loading={submitting}
        variant="danger"
      />
    </div>
  )
}

