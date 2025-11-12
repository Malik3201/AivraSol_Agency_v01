import { useState, useEffect } from 'react'
import { getTestimonials } from '@/api/client'
import { FORCE_API } from '@/lib/config'
import type { Testimonial } from '@/types/content'

interface UseTestimonialsReturn {
  data: Testimonial[]
  loading: boolean
  error: Error | null
}

let cachedTestimonials: Testimonial[] | null = null

export function useTestimonials(): UseTestimonialsReturn {
  const [data, setData] = useState<Testimonial[]>(cachedTestimonials || [])
  const [loading, setLoading] = useState(!cachedTestimonials)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!cachedTestimonials) {
      if (!FORCE_API) {
        console.warn('[useTestimonials] FORCE_API is false, but API mode is enforced')
      }

      getTestimonials()
        .then((response) => {
          cachedTestimonials = response.data as Testimonial[]
          setData(cachedTestimonials)
          setLoading(false)
        })
        .catch((err) => {
          console.warn('[Aivrasol] API error', { route: '/api/testimonials', err })
          setError(err)
          setLoading(false)
        })
    }
  }, [])

  return { data, loading, error }
}

