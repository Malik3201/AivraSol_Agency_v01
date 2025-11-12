import { Link } from 'react-router-dom'
import { ArrowRight, Code2, LayoutDashboard, Smartphone, Sparkles, Cpu, Bot } from 'lucide-react'
import { Dialog } from '@/components/ui/Dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/Accordion'
import { Button } from '@/components/ui/Button'
import { Chip } from '@/components/ui/Chip'
import { Card } from '@/components/ui/Card'
import type { Service } from '@/types/content'

interface ServiceModalProps {
  service: Service | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const iconMap: Record<string, React.ComponentType<any>> = {
  'code-2': Code2,
  'layout-dashboard': LayoutDashboard,
  'smartphone': Smartphone,
  'sparkles': Sparkles,
  'cpu': Cpu,
  'bot': Bot,
}

export function ServiceModal({ service, open, onOpenChange }: ServiceModalProps) {
  if (!service) return null
  
  const Icon = iconMap[service.icon] || Code2

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="max-h-[80vh] overflow-y-auto">
        {/* Sticky Header */}
        <div className="sticky top-0 bg-card border-b border-border pb-4 mb-6 z-10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-text-strong mb-1">{service.title}</h2>
              <p className="text-text-muted">{service.benefit}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview">
          <TabsList className="w-full justify-start mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
            {service.examples.length > 0 && <TabsTrigger value="examples">Examples</TabsTrigger>}
            {service.faqs.length > 0 && <TabsTrigger value="faqs">FAQs</TabsTrigger>}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="space-y-4">
              {service.overview.map((point, i) => (
                <div key={i} className="flex gap-3">
                  <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-text-muted">{point}</p>
                </div>
              ))}

              <div className="mt-6">
                <h3 className="text-sm font-semibold text-text-strong mb-3 uppercase tracking-wide">Pricing Bands</h3>
                <div className="flex flex-wrap gap-2">
                  {service.pricingBands.map((band, i) => (
                    <Chip key={i} variant="amber" className="font-mono text-xs">
                      {band}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tools Tab */}
          <TabsContent value="tools">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {service.tools.map((tool, i) => (
                <Card key={i} className="p-4 text-center hover:border-primary/30 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 mx-auto mb-2 flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <div className="font-medium text-text-strong text-sm">{tool}</div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Examples Tab */}
          {service.examples.length > 0 && (
            <TabsContent value="examples">
              <div className="grid md:grid-cols-2 gap-4">
                {service.examples.map((example, i) => (
                  <Card key={i} hoverable className="overflow-hidden">
                    <div className="w-full h-32 bg-gradient-to-br from-surface to-card mb-3 rounded-lg flex items-center justify-center">
                      <svg className="w-12 h-12 text-primary/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
                        <path d="M21 15l-5-5L5 21" strokeWidth="2"/>
                      </svg>
                    </div>
                    <h4 className="font-semibold text-text-strong mb-1">{example.title}</h4>
                    <p className="text-sm text-primary mb-3">{example.kpi}</p>
                    <Link to={example.to} className="text-sm text-primary hover:text-primary/80 inline-flex items-center gap-1">
                      View Project <ArrowRight className="h-3 w-3" />
                    </Link>
                  </Card>
                ))}
              </div>
            </TabsContent>
          )}

          {/* FAQs Tab */}
          {service.faqs.length > 0 && (
            <TabsContent value="faqs">
              <Accordion type="single" collapsible>
                {service.faqs.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`}>
                    <AccordionTrigger className="text-text-strong text-left">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-text-muted">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>
          )}
        </Tabs>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 bg-card border-t border-border pt-6 mt-6 flex flex-wrap gap-3">
          <Link to="/contact" className="flex-1">
            <Button variant="primary" magnetic className="w-full">
              Get a Quote <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/portfolio" className="flex-1">
            <Button variant="ghost" className="w-full">
              See Similar Work
            </Button>
          </Link>
        </div>
      </div>
    </Dialog>
  )
}

