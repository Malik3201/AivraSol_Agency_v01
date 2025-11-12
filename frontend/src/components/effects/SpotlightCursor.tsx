import { useEffect, useState } from 'react'
import { useReducedMotionFlag } from '@/hooks/useReducedMotionFlag'

interface SpotlightCursorProps {
  enabled?: boolean
}

export function SpotlightCursor({ enabled = false }: SpotlightCursorProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const prefersReducedMotion = useReducedMotionFlag()

  useEffect(() => {
    if (!enabled || prefersReducedMotion) return

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [enabled, prefersReducedMotion])

  if (!enabled || prefersReducedMotion) return null

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-300"
      style={{
        background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(43, 182, 115, 0.06), transparent 40%)`,
      }}
    />
  )
}

