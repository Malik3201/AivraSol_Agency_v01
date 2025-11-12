import { useEffect, useState } from 'react'
import { getCategories } from '@/api/client'

interface UseTechStacksReturn {
	data: string[]
	loading: boolean
	error: Error | null
}

export function useTechStacks(): UseTechStacksReturn {
	const [data, setData] = useState<string[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<Error | null>(null)

	useEffect(() => {
		let mounted = true
		setLoading(true)
		getCategories({ type: 'tech' })
			.then((res: any) => {
				if (!mounted) return
				const names = (res.data || []).map((c: any) => c.title)
				setData(names)
				setLoading(false)
			})
			.catch((err) => {
				if (!mounted) return
				setError(err instanceof Error ? err : new Error('Failed to load tech stack'))
				setLoading(false)
			})
		return () => {
			mounted = false
		}
	}, [])

	return { data, loading, error }
}


