import { useState, useEffect } from 'react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { DataTable, Column } from '@/components/admin/DataTable'
import { FormDrawer } from '@/components/admin/FormDrawer'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Input as FileInput } from '@/components/ui/Input'
import { getServices } from '@/api/client'
import { createService, updateService, deleteService, ServiceBody } from '@/api/admin'
import { ServiceDto } from '@/api/schemas'
import { toast } from 'sonner'

const serviceFormSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(120),
  description: z.string().max(5000),
  icon: z.string().min(1),
  image: z.string().min(1),
  featured: z.boolean().optional(),
})

type ServiceForm = z.infer<typeof serviceFormSchema>

export function Services() {
  const [services, setServices] = useState<ServiceDto[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [formOpen, setFormOpen] = useState(false)
  const [editingService, setEditingService] = useState<ServiceDto | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<ServiceDto | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ServiceForm>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      featured: false
    },
  })

  // removed FAQs inline editor; managed separately under FAQs page

  const loadServices = async () => {
    setLoading(true)
    try {
      const response = await getServices({ page, limit: 20 })
      setServices(response.data as any)
      setTotal(response.total || response.data.length)
    } catch (error) {
      toast.error('Failed to load services')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadServices()
  }, [page])

  const openCreate = () => {
    setEditingService(null)
    reset({
      name: '',
      slug: '',
      description: '',
      icon: '',
      image: '',
      featured: false,
    })
    setFormOpen(true)
  }

  const openEdit = (service: ServiceDto) => {
    setEditingService(service)
    reset({
      name: service.title,
      slug: service.slug,
      description: service.description,
      icon: (service as any).icon || '',
      image: (service as any).image || '',
      featured: service.featured
    })
    setFormOpen(true)
  }

  const onSubmit = async (data: ServiceForm) => {
    setSubmitting(true)
    try {
      const body: ServiceBody = {
        name: data.name,
        slug: data.slug,
        description: data.description,
        icon: data.icon,
        image: data.image,
        featured: data.featured,
      }

      if (editingService) {
        await updateService(editingService.id, body)
        toast.success('Service updated successfully')
      } else {
        await createService(body)
        toast.success('Service created successfully')
      }

      setFormOpen(false)
      loadServices()
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
      await deleteService(deleteDialog.id)
      toast.success('Service deleted successfully')
      setDeleteDialog(null)
      loadServices()
    } catch (error) {
      toast.error('Failed to delete service')
    } finally {
      setSubmitting(false)
    }
  }

  const columns: Column<ServiceDto>[] = [
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
    // summary not a backend field; omit
    {
      key: 'featured',
      label: 'Featured',
      render: (item) =>
        item.featured ? (
          <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">Featured</span>
        ) : (
          <span className="text-text-muted text-xs">No</span>
        ),
    },
    // tools not managed here
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
        <h1 className="text-3xl font-bold text-text-strong">Services</h1>
        <Button variant="primary" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Add Service
        </Button>
      </div>

      <DataTable
        data={services}
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
        title={editingService ? 'Edit Service' : 'Create Service'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-strong mb-2">Name *</label>
            <Input {...register('name')} placeholder="Service name" />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-strong mb-2">Slug *</label>
            <Input {...register('slug')} placeholder="unique-slug" />
            {errors.slug && (
              <p className="mt-1 text-sm text-red-500">{errors.slug.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-strong mb-2">
              Description *
            </label>
            <Textarea {...register('description')} rows={6} placeholder="Full description" />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-strong mb-2">Icon *</label>
            <Input {...register('icon')} placeholder="e.g. code, rocket" />
            {errors.icon && <p className="mt-1 text-sm text-red-500">{errors.icon.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-strong mb-2">Image URL *</label>
            <Input {...register('image')} placeholder="https://..." />
            {errors.image && <p className="mt-1 text-sm text-red-500">{errors.image.message}</p>}
          </div>

          <div className="flex items-center gap-3">
            <Controller
              name="featured"
              control={control}
              render={({ field }) => (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="w-4 h-4 text-primary rounded border-border focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-sm text-text-strong">Featured</span>
                </label>
              )}
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Saving...' : editingService ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </FormDrawer>

      <ConfirmDialog
        open={!!deleteDialog}
        onOpenChange={(open) => !open && setDeleteDialog(null)}
        title="Delete Service"
        description={`Are you sure you want to delete "${deleteDialog?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        loading={submitting}
        variant="danger"
      />
    </div>
  )
}

