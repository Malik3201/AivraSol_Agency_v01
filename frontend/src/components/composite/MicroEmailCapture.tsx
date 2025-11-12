import { useState } from 'react'
import { Send, CheckCircle } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/layout/Container'

export function MicroEmailCapture() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const validateEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email) {
      setError('Email is required')
      return
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address')
      return
    }

    setSubmitted(true)
    setTimeout(() => {
      setEmail('')
      setSubmitted(false)
    }, 3000)
  }

  return (
    <section className="py-16 bg-surface/50">
      <Container size="md">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-text-strong mb-3">
            Stay Updated
          </h2>
          <p className="text-text-muted">
            Get the latest insights and updates delivered to your inbox.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <div className="flex gap-3">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitted}
              className="flex-1"
            />
            <Button 
              type="submit" 
              variant="primary"
              disabled={submitted}
            >
              {submitted ? (
                <><CheckCircle className="h-4 w-4" /> Subscribed</>
              ) : (
                <><Send className="h-4 w-4" /> Subscribe</>
              )}
            </Button>
          </div>
          {error && (
            <p className="text-amber text-sm mt-3 text-center">
              {error}
            </p>
          )}
          {submitted && (
            <p className="text-primary text-sm mt-3 text-center">
              Thank you for subscribing!
            </p>
          )}
        </form>
      </Container>
    </section>
  )
}
