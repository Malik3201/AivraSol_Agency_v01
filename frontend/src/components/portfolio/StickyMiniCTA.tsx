import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export function StickyMiniCTA() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY
      const pageHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = (scrolled / pageHeight) * 100

      // Show after 50% scroll
      setIsVisible(scrollPercent >= 50)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Check initial state

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.aside
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="hidden lg:block fixed top-32 right-8 w-72 max-w-[280px] z-20"
        >
          <Card className="p-6 bg-gradient-to-br from-card to-surface border-primary/20 shadow-lg">
            <div className="mb-4">
              <MessageSquare className="h-8 w-8 text-primary mb-3" />
              <h3 className="text-lg font-semibold text-text-strong mb-2">
                Need something similar?
              </h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Let's discuss how we can build a tailored solution for your business.
              </p>
            </div>

            <Link to="/contact" onClick={() => {
              window.plausible?.('sticky_cta_click', { props: { source: 'project_detail' } })
            }}>
              <Button variant="primary" magnetic className="w-full">
                Get in Touch
              </Button>
            </Link>
          </Card>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}

