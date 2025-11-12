import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { DataTable, Column } from '@/components/admin/DataTable'
import { FormDrawer } from '@/components/admin/FormDrawer'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { getTestimonials } from '@/api/client'
import { createTestimonial, updateTestimonial, deleteTestimonial } from '@/api/admin'
import type { TestimonialDto } from '@/api/schemas'
import { toast } from 'sonner'

const schema = z.object({
	name: z.string().min(2),
	designation: z.string().optional(),
	message: z.string().min(2),
	image: z.string().url().or(z.literal('')).optional(),
	rating: z.coerce.number().min(1).max(5).optional(),
	active: z.boolean().optional(),
	order: z.coerce.number().int().optional(),
})
type FormValues = z.infer<typeof schema>

export function Testimonials() {
	const [items, setItems] = useState<TestimonialDto[]>([])
	const [loading, setLoading] = useState(true)
	const [page, setPage] = useState(1)
	const [total, setTotal] = useState(0)
	const [formOpen, setFormOpen] = useState(false)
	const [editing, setEditing] = useState<any | null>(null)
	const [deleteDialog, setDeleteDialog] = useState<any | null>(null)
	const [submitting, setSubmitting] = useState(false)

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<FormValues>({
		resolver: zodResolver(schema),
		defaultValues: { active: true, rating: 5 },
	})

	const load = async () => {
		setLoading(true)
		try {
			const res = await getTestimonials()
			setItems(res.data as any)
			setTotal(res.data.length)
		} catch {
			toast.error('Failed to load testimonials')
		} finally {
			setLoading(false)
		}
	}
	useEffect(() => {
		load()
	}, [page])

	const openCreate = () => {
		setEditing(null)
		reset({ name: '', designation: '', message: '', image: '', rating: 5, active: true, order: 0 })
		setFormOpen(true)
	}
	const openEdit = (item: any) => {
		setEditing(item)
		reset({
			name: item.clientName,
			designation: item.designation || '',
			message: '', // backend stores message; client dto lacks it, keep separate
			image: item.avatarUrl || '',
			rating: item.rating || 5,
			active: true,
			order: 0,
		})
		setFormOpen(true)
	}

	const onSubmit = async (data: FormValues) => {
		setSubmitting(true)
		try {
			if (editing) {
				await updateTestimonial(editing.id, {
					name: data.name,
					designation: data.designation,
					message: data.message,
					image: data.image || undefined,
					rating: data.rating,
					active: data.active,
					order: data.order,
				})
				toast.success('Testimonial updated')
			} else {
				await createTestimonial({
					name: data.name,
					designation: data.designation,
					message: data.message,
					image: data.image || undefined,
					rating: data.rating,
					active: data.active,
					order: data.order,
				})
				toast.success('Testimonial created')
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
			await deleteTestimonial(deleteDialog.id)
			toast.success('Testimonial deleted')
			setDeleteDialog(null)
			load()
		} catch {
			toast.error('Failed to delete testimonial')
		} finally {
			setSubmitting(false)
		}
	}

	const columns: Column<any>[] = [
		{ key: 'name', label: 'Client', render: (i) => <div className="font-medium">{i.clientName}</div> },
		{ key: 'designation', label: 'Role', render: (i) => <div className="text-text-muted text-sm">{i.designation}</div> },
		{
			key: 'actions',
			label: 'Actions',
			render: (item) => (
				<div className="flex gap-2">
					<Button variant="ghost" size="sm" onClick={() => openEdit(item)}>
						Edit
					</Button>
					<Button variant="ghost" size="sm" onClick={() => setDeleteDialog(item)}>
						Delete
					</Button>
				</div>
			),
		},
	]

	return (
		<div>
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-3xl font-bold text-text-strong">Testimonials</h1>
				<Button variant="primary" onClick={openCreate}>Add Testimonial</Button>
			</div>

			<DataTable data={items as any} columns={columns} loading={loading} page={page} pageSize={20} total={total} onPageChange={setPage} />

			<FormDrawer open={formOpen} onOpenChange={setFormOpen} title={editing ? 'Edit Testimonial' : 'Create Testimonial'}>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
					<div>
						<label className="block text-sm font-medium text-text-strong mb-2">Name *</label>
						<Input {...register('name')} placeholder="Client name" />
						{errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
					</div>
					<div>
						<label className="block text-sm font-medium text-text-strong mb-2">Designation</label>
						<Input {...register('designation')} placeholder="CTO, Company" />
					</div>
					<div>
						<label className="block text-sm font-medium text-text-strong mb-2">Message *</label>
						<Textarea rows={5} {...register('message')} placeholder="What they said..." />
						{errors.message && <p className="mt-1 text-sm text-red-500">{errors.message.message}</p>}
					</div>
					<div>
						<label className="block text-sm font-medium text-text-strong mb-2">Image URL</label>
						<Input {...register('image')} placeholder="https://..." />
					</div>
					<div className="flex gap-3 pt-4 border-t border-border">
						<Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>
							Cancel
						</Button>
						<Button type="submit" variant="primary" disabled={submitting}>
							{submitting ? 'Saving...' : editing ? 'Update' : 'Create'}
						</Button>
					</div>
				</form>
			</FormDrawer>

			<ConfirmDialog
				open={!!deleteDialog}
				onOpenChange={(open) => !open && setDeleteDialog(null)}
				title="Delete Testimonial"
				description={`Are you sure you want to delete "${deleteDialog?.clientName}"?`}
				confirmLabel="Delete"
				onConfirm={handleDelete}
				loading={submitting}
				variant="danger"
			/>
		</div>
	)
}


