import { useForm, ValidationError } from '@formspree/react'
import { useState } from 'react'
import { Mail, MapPin, Phone, Send } from 'lucide-react'
import { Container } from '@/components/layout/Container'
import { SectionHeading } from '@/components/layout/SectionHeading'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'

const contactInfo = [
  {
    icon: Mail,
    label: 'Email',
    value: 'aivrasol@gmail.com',
    href: 'mailto:aivrasol@gmail.com',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '+1 (555) 123-4567',
    href: 'tel:+15551234567',
  },
  {
    icon: MapPin,
    label: 'Location',
    value: 'Lahore, PAK',
    href: null,
  },
]

export function Contact() {
  // 👇 Add Formspree hook
  const [state, handleSubmit] = useForm("xpwkzydd") // <-- your Formspree form ID
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    service: '',
    message: '',
  })

  const handleChange = (e: any) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <section className="py-20 md:py-32">
      <Container>
        <SectionHeading 
          title="Get In Touch"
          subtitle="Let's discuss how we can help bring your vision to life"
        />

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {contactInfo.map((info, i) => {
            const Icon = info.icon
            return (
              <Card key={i} hoverable className="text-center">
                <Icon className="h-8 w-8 text-primary mx-auto mb-4" />
                <div className="text-sm text-text-muted mb-2">{info.label}</div>
                {info.href ? (
                  <a href={info.href} className="font-semibold text-text-strong hover:text-primary transition-colors">
                    {info.value}
                  </a>
                ) : (
                  <div className="font-semibold text-text-strong">{info.value}</div>
                )}
              </Card>
            )
          })}
        </div>

        <Card className="max-w-3xl mx-auto p-8">
          {state.succeeded ? (
            <p className="text-primary text-center text-lg font-semibold">
              ✅ Thanks! We’ll get back to you soon.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-text-strong mb-2">
                    Name *
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-text-strong mb-2">
                    Email *
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your@email.com"
                  />
                  <ValidationError prefix="Email" field="email" errors={state.errors} />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-text-strong mb-2">
                    Company
                  </label>
                  <Input
                    id="company"
                    name="company"
                    type="text"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Your company"
                  />
                </div>

                <div>
                  <label htmlFor="service" className="block text-sm font-medium text-text-strong mb-2">
                    Service Interested In *
                  </label>
                  <Select
                    id="service"
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a service</option>
                    <option value="web">Web Development</option>
                    <option value="mobile">Mobile Apps</option>
                    <option value="cloud">Cloud Solutions</option>
                    <option value="ai">AI Integration</option>
                    <option value="data">Data Engineering</option>
                    <option value="other">Other</option>
                  </Select>
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-text-strong mb-2">
                  Message *
                </label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="Tell us about your project..."
                  rows={6}
                />
                <ValidationError prefix="Message" field="message" errors={state.errors} />
              </div>

              <Button type="submit" variant="primary" className="w-full md:w-auto" disabled={state.submitting}>
                {state.submitting ? 'Sending...' : (
                  <>
                    <Send className="h-4 w-4" /> Send Message
                  </>
                )}
              </Button>
            </form>
          )}
        </Card>
      </Container>
    </section>
  )
}
