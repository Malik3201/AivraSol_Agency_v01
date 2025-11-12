import { useState, useEffect } from 'react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Edit, Trash2, X } from 'lucide-react'
import { DataTable, Column } from '@/components/admin/DataTable'
import { FormDrawer } from '@/components/admin/FormDrawer'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { getProjects } from '@/api/client'
import { apiGet } from '@/api/http'
import { createProject, updateProject, deleteProject, ProjectBody } from '@/api/admin'
import { ProjectDto, CategoryDto, CategoryDtoSchema, ListEnvelope } from '@/api/schemas'
import { toast } from 'sonner'

const projectFormSchema = z.object({
  title: z.string().min(2).max(120),
  slug: z.string().min(2).max(120),
  description: z.string().min(2).max(2000),
  types: z.string().min(1), // comma-separated
  technologies: z.string().optional(), // comma-separated
  image: z.string().url(),
  galleryUrls: z.array(z.string().url().or(z.literal(''))).optional(),
  liveUrl: z.string().url().or(z.literal('')).optional(),
  githubUrl: z.string().url().or(z.literal('')).optional(),
  client: z.string().optional(),
  featured: z.boolean(),
})

type ProjectForm = z.infer<typeof projectFormSchema>

export function Projects() {
  const [projects, setProjects] = useState<ProjectDto[]>([])
  const [categories, setCategories] = useState<CategoryDto[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [formOpen, setFormOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<ProjectDto | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<ProjectDto | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProjectForm>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      featured: false,
      slug: '',
      description: '',
      types: '',
      technologies: '',
      image: '',
      galleryUrls: [],
      liveUrl: '',
      githubUrl: '',
      client: '',
    },
  })

  // removed KPIs editor; not supported by backend

  const loadProjects = async () => {
    setLoading(true)
    try {
      const response = await getProjects({ page, limit: 20 })
      setProjects(response.data as any)
      setTotal(response.total || response.data.length)
    } catch (error) {
      toast.error('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => { /* categories not provided by backend */ }

  useEffect(() => {
    loadProjects()
    loadCategories()
  }, [page])

  const openCreate = () => {
    setEditingProject(null)
    reset({
      title: '',
      slug: '',
      description: '',
      types: '',
      technologies: '',
      image: '',
      galleryUrls: [''],
      liveUrl: '',
      githubUrl: '',
      client: '',
      featured: false,
    })
    setFormOpen(true)
  }

  const openEdit = (project: ProjectDto) => {
    setEditingProject(project)
    reset({
      title: project.title,
      slug: project.slug,
      description: project.summary,
      types: (project as any).categorySlug || '',
      technologies: project.tech.join(', '),
      image: (project as any).cover?.url || '',
      galleryUrls: (project.gallery as any).map((g: any) => (typeof g === 'string' ? g : g.url)),
      liveUrl: project.links?.live || '',
      githubUrl: project.links?.github || '',
      client: '',
      featured: project.featured,
    })
    setFormOpen(true)
  }

  const onSubmit = async (data: ProjectForm) => {
    setSubmitting(true)
    try {
      const body: ProjectBody = {
        title: data.title,
        slug: data.slug,
        description: data.description,
        types: data.types.split(',').map((t) => t.trim()).filter(Boolean),
        technologies: (data.technologies || '').split(',').map((t) => t.trim()).filter(Boolean),
        image: data.image,
        gallery: (data.galleryUrls || []).map((u) => (u || '').trim()).filter(Boolean),
        liveUrl: data.liveUrl || undefined,
        githubUrl: data.githubUrl || undefined,
        client: data.client || undefined,
        featured: data.featured,
      }

      if (editingProject) {
        const id = (editingProject as any).id || (editingProject as any)._id || editingProject.slug
        await updateProject(id, body)
        toast.success('Project updated successfully')
      } else {
        await createProject(body)
        toast.success('Project created successfully')
      }

      setFormOpen(false)
      loadProjects()
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
      const id = (deleteDialog as any).id || (deleteDialog as any)._id || deleteDialog.slug
      await deleteProject(id)
      toast.success('Project deleted successfully')
      setDeleteDialog(null)
      loadProjects()
    } catch (error) {
      toast.error('Failed to delete project')
    } finally {
      setSubmitting(false)
    }
  }

  const categoryOptions = categories.filter((c) => c.type === 'category')

  const columns: Column<ProjectDto>[] = [
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
      key: 'tech',
      label: 'Tech',
      render: (item) => (
        <div className="text-text-muted text-xs">
          {item.tech.slice(0, 2).join(', ')}
          {item.tech.length > 2 && ` +${item.tech.length - 2}`}
        </div>
      ),
    },
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
        <h1 className="text-3xl font-bold text-text-strong">Projects</h1>
        <Button variant="primary" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Add Project
        </Button>
      </div>

      <DataTable
        data={projects}
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
        title={editingProject ? 'Edit Project' : 'Create Project'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-strong mb-2">Title *</label>
            <Input {...register('title')} placeholder="Project title" />
            {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-strong mb-2">Slug *</label>
            <Input {...register('slug')} placeholder="unique-slug" />
            {errors.slug && (
              <p className="mt-1 text-sm text-red-500">{errors.slug.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-strong mb-2">Description *</label>
            <Textarea {...register('description')} rows={4} placeholder="Project description" />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-strong mb-2">Types *</label>
            <Input {...register('types')} placeholder="e.g. web, mobile" />
            {errors.types && <p className="mt-1 text-sm text-red-500">{errors.types.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-strong mb-2">Technologies</label>
            <Input {...register('technologies')} placeholder="React, Node.js, MongoDB" />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-strong mb-2">Main Image URL *</label>
            <Input {...register('image')} placeholder="https://..." />
            {errors.image && <p className="mt-1 text-sm text-red-500">{errors.image.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-strong mb-2">
              Gallery Image URLs
            </label>
            <div className="space-y-2">
              {(watch('galleryUrls') || []).map((val, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    {...register(`galleryUrls.${idx}` as const)}
                    placeholder="https://..."
                  />
                  <button
                    type="button"
                    className="text-text-muted hover:text-red-500 px-2"
                    onClick={() => {
                      const arr = [...(watch('galleryUrls') || [])]
                      arr.splice(idx, 1)
                      setValue('galleryUrls', arr as any, { shouldValidate: true })
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <Button
                type="button"
                variant="ghost"
                onClick={() => setValue('galleryUrls', [ ...(watch('galleryUrls') || []), '' ] as any, { shouldValidate: true })}
              >
                + Add another URL
              </Button>
            </div>
            <p className="text-xs text-text-muted mt-1">
              All URLs will be sent separated by "," to the backend.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-strong mb-2">Live Link</label>
            <Input {...register('liveUrl')} placeholder="https://..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-strong mb-2">GitHub Link</label>
            <Input {...register('githubUrl')} placeholder="https://..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-strong mb-2">Client</label>
            <Input {...register('client')} placeholder="Client name" />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-strong mb-2">Featured</label>
            <Controller
              name="featured"
              control={control}
              render={({ field }: any) => (
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
              {submitting ? 'Saving...' : editingProject ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </FormDrawer>

      <ConfirmDialog
        open={!!deleteDialog}
        onOpenChange={(open) => !open && setDeleteDialog(null)}
        title="Delete Project"
        description={`Are you sure you want to delete "${deleteDialog?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        loading={submitting}
        variant="danger"
      />
    </div>
  )
}

