import { useEffect, useRef } from 'react'

/**
 * Fire a callback once when element enters viewport
 * Useful for analytics, count-ups, or one-time animations
 */
export function useFirstViewportOnce(
  callback: () => void,
  options?: IntersectionObserverInit
) {
  const ref = useRef<HTMLElement>(null)
  const hasFired = useRef(false)

  useEffect(() => {
    const element = ref.current
    if (!element || hasFired.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasFired.current) {
            hasFired.current = true
            callback()
            observer.disconnect()
          }
        })
      },
      { threshold: 0.3, ...options }
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [callback, options])

  return ref
}

