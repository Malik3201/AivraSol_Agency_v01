import { useState, useEffect, useCallback, useMemo } from 'react'
import { getKnowledge } from '@/api/client'
import { FORCE_API } from '@/lib/config'
import type { FAQ } from '@/types/content'

interface UseFAQsReturn {
  data: FAQ[]
  loading: boolean
  error: Error | null
  refresh: () => void
}

let cachedFAQs: FAQ[] | null = null

export function useFAQs(): UseFAQsReturn {
  const [data, setData] = useState<FAQ[]>(cachedFAQs || [])
  const [loading, setLoading] = useState(!cachedFAQs)
  const [error, setError] = useState<Error | null>(null)

  const fetchFAQs = useCallback(async () => {
    if (!FORCE_API) {
      console.warn('[useFAQs] FORCE_API is false, but API mode is enforced')
    }

    setLoading(true)
    setError(null)

    try {
      const response = await getKnowledge({ type: 'faq' })
      const faqs: FAQ[] = response.data.map((k) => ({
        q: k.question,
        a: k.answer,
      }))
      
      cachedFAQs = faqs
      setData(faqs)
      setLoading(false)

      // Analytics stub
      if (window.plausible && !cachedFAQs) {
        window.plausible('api_faq_loaded')
      }
    } catch (err) {
      console.warn('[Aivrasol] API error', { route: '/api/knowledge?type=faq', err })
      setError(err instanceof Error ? err : new Error('Failed to load FAQs'))
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!cachedFAQs) {
      fetchFAQs()
    }
  }, [fetchFAQs])

  return useMemo(() => ({
    data,
    loading,
    error,
    refresh: fetchFAQs
  }), [data, loading, error, fetchFAQs])
}

