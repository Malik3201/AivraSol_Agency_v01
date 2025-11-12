import { useState, useEffect, useMemo } from 'react'
import { searchServices } from '@/lib/data-utils'
import { getServices } from '@/api/client'
import { FORCE_API } from '@/lib/config'
import type { Service } from '@/types/content'

interface UseServicesReturn {
  data: Service[]
  mapBySlug: Map<string, Service>
  search: (q: string) => Service[]
  loading: boolean
  error: Error | null
}

let cachedServices: Service[] | null = null

export function useServices(): UseServicesReturn {
  const [data, setData] = useState<Service[]>(cachedServices || [])
  const [loading, setLoading] = useState(!cachedServices)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!cachedServices) {
      if (!FORCE_API) {
        console.warn('[useServices] FORCE_API is false, but API mode is enforced')
      }

      getServices()
        .then((response) => {
          cachedServices = response.data as Service[]
          setData(cachedServices)
          setLoading(false)
        })
        .catch((err) => {
          console.warn('[Aivrasol] API error', { route: '/api/services', err })
          setError(err)
          setLoading(false)
        })
    }
  }, [])

  const mapBySlug = useMemo(() => {
    const map = new Map<string, Service>()
    data.forEach((service) => {
      map.set(service.slug, service)
    })
    return map
  }, [data])

  const search = (q: string) => searchServices(data, q)

  return { data, mapBySlug, search, loading, error }
}

