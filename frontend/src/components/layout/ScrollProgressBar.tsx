import { motion } from 'framer-motion'
import { useScrollProgress } from '@/hooks/useScrollProgress'
import { useReducedMotionFlag } from '@/hooks/useReducedMotionFlag'

export function ScrollProgressBar() {
  const progress = useScrollProgress()
  const prefersReducedMotion = useReducedMotionFlag()

  if (prefersReducedMotion) {
    return null
  }

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-primary origin-left z-50"
      style={{ scaleX: progress / 100 }}
      initial={{ scaleX: 0 }}
      transition={{ duration: 0.1 }}
    />
  )
}

