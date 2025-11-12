import { useRef, useState, MouseEvent } from 'react'

interface MagneticOffset {
  x: number
  y: number
}

export function useMagneticHover(strength = 0.3) {
  const [offset, setOffset] = useState<MagneticOffset>({ x: 0, y: 0 })
  const elementRef = useRef<HTMLElement | null>(null)

  const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
    if (!elementRef.current) return

    const rect = elementRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const deltaX = (e.clientX - centerX) * strength
    const deltaY = (e.clientY - centerY) * strength

    setOffset({ x: deltaX, y: deltaY })
  }

  const handleMouseLeave = () => {
    setOffset({ x: 0, y: 0 })
  }

  return {
    elementRef,
    offset,
    handlers: {
      onMouseMove: handleMouseMove,
      onMouseLeave: handleMouseLeave,
    },
  }
}

