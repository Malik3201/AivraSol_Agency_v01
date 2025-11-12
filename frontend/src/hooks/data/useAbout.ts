import { useState, useEffect } from 'react'
import type { AboutData } from '@/types/content'

interface UseAboutReturn {
  data: AboutData | null
  loading: boolean
  error: Error | null
}

// About data remains JSON-only (no backend API endpoint)
let cachedAboutData: AboutData | null = null

export function useAbout(): UseAboutReturn {
  const [data, setData] = useState<AboutData | null>(cachedAboutData)
  const [loading, setLoading] = useState(!cachedAboutData)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!cachedAboutData) {
      // Direct import from __mock (About has no API endpoint)
      import('@/__mock/about.json')
        .then((module) => {
          cachedAboutData = module.default as AboutData
          setData(cachedAboutData)
          setLoading(false)
        })
        .catch((err) => {
          console.error('[Aivrasol] Failed to load about data', err)
          setError(err instanceof Error ? err : new Error('Failed to load about data'))
          setLoading(false)
        })
    }
  }, [])

  return { data, loading, error }
}

