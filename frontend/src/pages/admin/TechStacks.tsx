import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { DataTable, Column } from '@/components/admin/DataTable'
import { FormDrawer } from '@/components/admin/FormDrawer'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { getCategories } from '@/api/client'
import { createTechStack, updateTechStack, deleteTechStack } from '@/api/admin'
import { toast } from 'sonner'

const schema = z.object({
	name: z.string().min(1),
	category: z.string().optional(),
	icon: z.string().optional(),
	level: z.string().optional(),
	description: z.string().optional(),
	active: z.boolean().optional(),
	order: z.coerce.number().int().optional(),
})
type FormValues = z.infer<typeof schema>

export function TechStacks() {
	const [items, setItems] = useState<any[]>([])
	const [loading, setLoading] = useState(true)
	const [page, setPage] = useState(1)
	const [total, setTotal] = useState(0)
	const [formOpen, setFormOpen] = useState(false)
	const [editing, setEditing] = useState<any | null>(null)
	const [deleteDialog, setDeleteDialog] = useState<any | null>(null)
	const [submitting, setSubmitting] = useState(false)

	const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
		resolver: zodResolver(schema),
		defaultValues: { active: true, order: 0 }
	})

	const load = async () => {
		setLoading(true)
		try {
			const res: any = await getCategories({ type: 'tech' })
			setItems(res.data || [])
			setTotal((res.data || []).length)
		} catch {
			toast.error('Failed to load tech stacks')
		} finally {
			setLoading(false)
		}
	}
	useEffect(() => { load() }, [page])

	const openCreate = () => {
		setEditing(null)
		reset({ name: '', category: '', icon: '', level: '', description: '', active: true, order: 0 })
		setFormOpen(true)
	}
	const openEdit = (item: any) => {
		setEditing(item)
		reset({ name: item.title, category: '', icon: '', level: '', description: '', active: true, order: item.order || 0 })
		setFormOpen(true)
	}

	const onSubmit = async (data: FormValues) => {
		setSubmitting(true)
		try {
			if (editing) {
				await updateTechStack(editing.id || editing.slug, data as any)
				toast.success('Tech updated')
			} else {
				await createTechStack(data as any)
				toast.success('Tech created')
			}
			setFormOpen(false)
			load()
		} catch {
			toast.error('Operation failed')
		} finally {
			setSubmitting(false)
		}
	}

	const handleDelete = async () => {
		if (!deleteDialog) return
		setSubmitting(true)
		try {
			await deleteTechStack(deleteDialog.id || deleteDialog.slug)
			toast.success('Tech deleted')
			setDeleteDialog(null)
			load()
		} catch {
			toast.error('Failed to delete tech')
		} finally {
			setSubmitting(false)
		}
	}

	const columns: Column<any>[] = [
		{ key: 'title', label: 'Name', render: (i) => <div className="font-medium">{i.title}</div> },
		{ key: 'order', label: 'Order', render: (i) => <div className="text-sm text-text-muted">{i.order ?? '-'}</div> },
		{
			key: 'actions',
			label: 'Actions',
			render: (item) => (
				<div className="flex gap-2">
					<Button variant="ghost" size="sm" onClick={() => openEdit(item)}>Edit</Button>
					<Button variant="ghost" size="sm" onClick={() => setDeleteDialog(item)}>Delete</Button>
				</div>
			),
		},
	]

	return (
		<div>
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-3xl font-bold text-text-strong">Tech Stack</h1>
				<Button variant="primary" onClick={openCreate}>Add Tech</Button>
			</div>

			<DataTable data={items as any} columns={columns} loading={loading} page={page} pageSize={20} total={total} onPageChange={setPage} />

			<FormDrawer open={formOpen} onOpenChange={setFormOpen} title={editing ? 'Edit Tech' : 'Create Tech'}>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
					<div>
						<label className="block text-sm font-medium text-text-strong mb-2">Name *</label>
						<Input {...register('name')} placeholder="React" />
						{errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
					</div>
					<div>
						<label className="block text-sm font-medium text-text-strong mb-2">Category</label>
						<Input {...register('category')} placeholder="Frontend" />
					</div>
					<div>
						<label className="block text-sm font-medium text-text-strong mb-2">Icon</label>
						<Input {...register('icon')} placeholder="lucide-react" />
					</div>
					<div>
						<label className="block text-sm font-medium text-text-strong mb-2">Level</label>
						<Input {...register('level')} placeholder="Advanced" />
					</div>
					<div>
						<label className="block text-sm font-medium text-text-strong mb-2">Description</label>
						<Input {...register('description')} placeholder="Short description" />
					</div>
					<div className="flex gap-3 pt-4 border-t border-border">
						<Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>Cancel</Button>
						<Button type="submit" variant="primary" disabled={submitting}>
							{submitting ? 'Saving...' : editing ? 'Update' : 'Create'}
						</Button>
					</div>
				</form>
			</FormDrawer>

			<ConfirmDialog
				open={!!deleteDialog}
				onOpenChange={(open) => !open && setDeleteDialog(null)}
				title="Delete Tech"
				description={`Are you sure you want to delete "${deleteDialog?.title}"?`}
				confirmLabel="Delete"
				onConfirm={handleDelete}
				loading={submitting}
				variant="danger"
			/>
		</div>
	)
}


