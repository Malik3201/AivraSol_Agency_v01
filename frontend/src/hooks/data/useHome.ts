import { useState, useEffect } from 'react'
import type { HomeData } from '@/types/content'

interface UseHomeReturn {
  data: HomeData | null
  loading: boolean
  error: Error | null
}

// Home data remains JSON-only (no backend API endpoint)
let cachedHomeData: HomeData | null = null

export function useHome(): UseHomeReturn {
  const [data, setData] = useState<HomeData | null>(cachedHomeData)
  const [loading, setLoading] = useState(!cachedHomeData)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!cachedHomeData) {
      // Direct import from __mock (Home has no API endpoint)
      import('@/__mock/home.json')
        .then((module) => {
          cachedHomeData = module.default as HomeData
          setData(cachedHomeData)
          setLoading(false)
        })
        .catch((err) => {
          console.error('[Aivrasol] Failed to load home data', err)
          setError(err instanceof Error ? err : new Error('Failed to load home data'))
          setLoading(false)
        })
    }
  }, [])

  return { data, loading, error }
}

