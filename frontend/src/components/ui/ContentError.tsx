import { motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import { Button } from './Button'
import { fadeInUp } from '@/lib/motionPresets'

interface ContentErrorProps {
  error?: Error | null
  onRetry?: () => void
}

export function ContentError({ error, onRetry }: ContentErrorProps) {
  return (
    <motion.div
      {...fadeInUp}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <AlertTriangle className="h-16 w-16 text-amber mb-6" />
      <h2 className="text-2xl font-bold text-text-strong mb-3">
        Something went wrong
      </h2>
      <p className="text-text-muted mb-6 max-w-md">
        {error?.message || 'Unable to load content. Please try again.'}
      </p>
      {onRetry && (
        <Button variant="primary" onClick={onRetry}>
          Retry
        </Button>
      )}
    </motion.div>
  )
}

