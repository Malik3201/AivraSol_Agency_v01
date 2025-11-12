import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
import { Container } from '@/components/layout/Container'
import { useReducedMotionFlag } from '@/hooks/useReducedMotionFlag'
import { cn } from '@/lib/cn'

interface MediaGalleryProps {
  images: Array<string | { url: string; alt?: string }>
  title: string
}

export function MediaGallery({ images, title }: MediaGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const prefersReducedMotion = useReducedMotionFlag()

  const openLightbox = (index: number) => {
    setActiveIndex(index)
    setLightboxOpen(true)
    window.plausible?.('lightbox_open', { props: { image_count: images.length } })
  }

  const goNext = () => {
    setActiveIndex((prev) => (prev + 1) % images.length)
  }

  const goPrev = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  useEffect(() => {
    if (!lightboxOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'Escape') setLightboxOpen(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxOpen, images.length])

  return (
    <section className="py-16">
      <Container>
        <h2 className="text-2xl font-bold text-text-strong mb-8">Gallery</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image, index) => {
            const src = typeof image === 'string' ? image : image.url
            const alt = typeof image === 'string' ? `${title} - Image ${index + 1}` : (image.alt || `${title} - Image ${index + 1}`)
            return (
            <motion.button
              key={index}
              onClick={() => openLightbox(index)}
              className="relative aspect-video rounded-xl overflow-hidden bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 group"
              whileHover={!prefersReducedMotion ? { scale: 1.02 } : {}}
              transition={{ duration: 0.2 }}
              aria-label={`View image ${index + 1} of ${images.length}`}
            >
              <img
                src={src}
                alt={alt}
                loading="lazy"
                className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <span className="text-text-strong text-sm font-medium">
                  View full size
                </span>
              </div>
            </motion.button>
            )
          })}
        </div>

        {/* Lightbox Dialog */}
        <Dialog.Root open={lightboxOpen} onOpenChange={setLightboxOpen}>
          <Dialog.Portal>
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 bg-bg/95 backdrop-blur-sm z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </Dialog.Overlay>

            <Dialog.Content asChild>
              <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.95 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="relative w-full max-w-6xl max-h-[90vh] flex flex-col">
                  {/* Close button */}
                  <Dialog.Close asChild>
                    <button
                      className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-surface/80 backdrop-blur-sm flex items-center justify-center text-text-strong hover:bg-surface hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label="Close lightbox"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </Dialog.Close>

                  {/* Image container */}
                  <div className="relative flex-1 flex items-center justify-center">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.img
                        key={activeIndex}
                        src={typeof images[activeIndex] === 'string' ? (images[activeIndex] as string) : (images[activeIndex] as any).url}
                        alt={typeof images[activeIndex] === 'string' ? `${title} - Image ${activeIndex + 1}` : ((images[activeIndex] as any).alt || `${title} - Image ${activeIndex + 1}`)}
                        className="max-w-full max-h-[80vh] object-contain rounded-lg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      />
                    </AnimatePresence>

                    {/* Navigation arrows */}
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={goPrev}
                          className={cn(
                            'absolute left-4 w-12 h-12 rounded-full bg-surface/80 backdrop-blur-sm flex items-center justify-center text-text-strong hover:bg-surface hover:text-primary transition-colors',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                          )}
                          aria-label="Previous image"
                        >
                          <ChevronLeft className="h-6 w-6" />
                        </button>

                        <button
                          onClick={goNext}
                          className={cn(
                            'absolute right-4 w-12 h-12 rounded-full bg-surface/80 backdrop-blur-sm flex items-center justify-center text-text-strong hover:bg-surface hover:text-primary transition-colors',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                          )}
                          aria-label="Next image"
                        >
                          <ChevronRight className="h-6 w-6" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Image counter */}
                  <div className="text-center mt-4">
                    <span className="text-text-muted text-sm">
                      {activeIndex + 1} / {images.length}
                    </span>
                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </Container>
    </section>
  )
}

