import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Container } from '@/components/layout/Container'
import { SectionHeading } from '@/components/layout/SectionHeading'
import { SkeletonGrid } from '@/components/ui/Skeleton'
import { ContentError } from '@/components/ui/ContentError'
import { apiGet } from '@/api/http'
import { z } from 'zod'

interface ServiceBackend {
	_id?: string
	name: string
	slug: string
	description: string
	icon?: string
	image?: string
	featured?: boolean
}

export function ServiceDetail() {
	const { slug } = useParams<{ slug: string }>()
	const [service, setService] = useState<ServiceBackend | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<Error | null>(null)

	useEffect(() => {
		let mounted = true
		const BackendSchema = z.object({
			success: z.boolean().optional(),
			succes: z.boolean().optional(),
			message: z.string().optional(),
			services: z.array(
				z.object({
					_id: z.string().optional(),
					name: z.string(),
					slug: z.string(),
					description: z.string(),
					icon: z.string().optional(),
					image: z.string().optional(),
					featured: z.boolean().optional(),
				})
			).optional(),
		})

		setLoading(true)
		apiGet('/services', BackendSchema as any)
			.then((res: any) => {
				if (!mounted) return
				const list: ServiceBackend[] = res.services || []
				const found = list.find((s) => s.slug === slug) || null
				if (!found) {
					throw new Error('Service not found')
				}
				setService(found)
				setError(null)
			})
			.catch((err) => {
				if (!mounted) return
				setError(err instanceof Error ? err : new Error('Failed to load service'))
			})
			.finally(() => mounted && setLoading(false))

		return () => {
			mounted = false
		}
	}, [slug])

	if (loading) {
		return (
			<div className="py-20">
				<Container>
					<SkeletonGrid rows={1} cols={1} />
				</Container>
			</div>
		)
	}

	if (error || !service) {
		return (
			<Container>
				<ContentError error={error || new Error('Service not found')} onRetry={() => window.location.reload()} />
			</Container>
		)
	}

	return (
		<section className="py-16">
			<Container>
				<div className="mb-6 text-sm">
					<Link className="text-primary hover:underline" to="/services">← Back to Services</Link>
				</div>

				<SectionHeading title={service.name} subtitle={service.featured ? 'Featured service' : ''} />

				<div className="grid md:grid-cols-2 gap-8 items-start">
					{service.image ? (
						<div className="w-full overflow-hidden rounded-lg border border-border">
							<img src={service.image} alt={service.name} className="w-full h-auto object-cover" />
						</div>
					) : (
						<div className="w-full h-64 rounded-lg border border-dashed border-border flex items-center justify-center text-text-muted">
							No image
						</div>
					)}

					<div>
						<h2 className="text-2xl font-semibold text-text-strong mb-4">Overview</h2>
						<p className="text-text">{service.description}</p>
					</div>
				</div>
			</Container>
		</section>
	)
}


