import { ArrowRight, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/layout/Container'
import { Card } from '@/components/ui/Card'
interface CTAData {
  title: string
  sub: string
  primaryLabel: string
  secondaryLabel: string
}

interface CTABandProps {
  data: CTAData
}

export function CTABand({ data }: CTABandProps) {
  return (
    <section className="py-20">
      <Container>
        <Card className="p-8 md:p-12 bg-gradient-to-br from-card to-surface border-primary/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-24 h-1 bg-gradient-to-r from-primary to-amber" />
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="text-center md:text-left">
              <div className="text-sm text-amber mb-2 font-medium">{data.title}</div>
              <h2 className="text-2xl md:text-3xl font-bold text-text-strong mb-2">
                Ready to start your project?
              </h2>
              <p className="text-text-muted">
                {data.sub}
              </p>
            </div>

            <div className="flex flex-wrap gap-4 justify-center md:justify-end">
              <Link to="/contact">
                <Button variant="primary" magnetic>
                  {data.primaryLabel} <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/portfolio">
                <Button variant="ghost">
                  <Mail className="h-4 w-4" /> {data.secondaryLabel}
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </Container>
    </section>
  )
}
