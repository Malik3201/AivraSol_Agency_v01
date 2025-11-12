import { motion } from 'framer-motion'
import { CheckCircle, Quote } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Container } from '@/components/layout/Container'
import { SectionHeading } from '@/components/layout/SectionHeading'
import { fadeInUp, staggerChildren, getMotionProps } from '@/lib/motionPresets'

interface WhyUsCalloutsProps {
  points: string[]
}

export function WhyUsCallouts({ points }: WhyUsCalloutsProps) {
  return (
    <section className="py-20 bg-surface/50">
      <Container>
        <SectionHeading
          title="Why Choose Us"
          subtitle="What sets us apart from the rest"
        />

        <motion.div
          className="grid md:grid-cols-3 gap-6 mb-12"
          {...getMotionProps(staggerChildren(0.1))}
        >
          {points.map((point, index) => (
            <motion.div key={index} {...getMotionProps(fadeInUp)}>
              <Card className="h-full">
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-text-strong font-medium leading-relaxed">
                    {point}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonial blurb */}
        <motion.div {...getMotionProps(fadeInUp)} transition={{ delay: 0.3 }}>
          <Card className="max-w-3xl mx-auto p-8 bg-gradient-to-br from-card to-surface relative">
            <Quote className="absolute top-4 right-4 h-12 w-12 text-primary/10" />
            <p className="text-lg text-text-strong italic leading-relaxed mb-4 relative z-10">
              "They delivered exactly what we needed, on time and within budget. The quality of work exceeded our expectations."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20" />
              <div>
                <div className="font-semibold text-text-strong text-sm">Sarah Johnson</div>
                <div className="text-xs text-text-muted">Product Manager, TechCorp</div>
              </div>
            </div>
          </Card>
        </motion.div>
      </Container>
    </section>
  )
}

