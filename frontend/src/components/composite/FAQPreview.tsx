import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/Accordion'
import { Container } from '@/components/layout/Container'
import { SectionHeading } from '@/components/layout/SectionHeading'
import { RefreshCw } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface FAQ {
  q: string
  a: string
}

interface FAQPreviewProps {
  items: FAQ[]
  loading?: boolean
  error?: Error | null
  onRefresh?: () => void
}

export function FAQPreview({ items, loading, error, onRefresh }: FAQPreviewProps) {
  const { user } = useAuth()

  if (loading && items.length === 0) {
    return (
      <section className="py-20">
        <Container size="md">
          <div className="text-center text-slate-500">Loading FAQs...</div>
        </Container>
      </section>
    )
  }

  if (error && items.length === 0) {
    return (
      <section className="py-20">
        <Container size="md">
          <div className="text-center text-red-600">Failed to load FAQs</div>
        </Container>
      </section>
    )
  }

  return (
    <section className="py-20">
      <Container size="md">
        <div className="relative">
          <SectionHeading 
            title="Frequently Asked Questions"
            subtitle="Find answers to common questions about our services"
          />

          {/* Admin-only refresh button */}
          {/* {user && onRefresh && (
           
          )} */}
        </div>

        <Accordion type="single" collapsible>
          {items.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-text-strong text-left">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-text-muted">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Container>
    </section>
  )
}
