import { useReducedMotionFlag } from '@/hooks/useReducedMotionFlag'
import { Container } from '@/components/layout/Container'
interface Logo {
  name: string
}

interface TrustBarProps {
  logos: Logo[]
}

export function TrustBar({ logos }: TrustBarProps) {
  const prefersReducedMotion = useReducedMotionFlag()

  const doubledLogos = [...logos, ...logos]

  return (
    <section className="py-12 border-y border-border bg-surface/50">
      <Container>
        <p className="text-center text-sm text-text-muted mb-8 uppercase tracking-wider">
          Trusted by industry leaders
        </p>
        <div className="relative overflow-hidden">
          {!prefersReducedMotion ? (
            <div 
              className="flex gap-12 items-center animate-marquee hover:[animation-play-state:paused]"
              style={{
                width: 'max-content',
              }}
            >
              {doubledLogos.map((logo, i) => (
                <div 
                  key={i} 
                  className="flex-shrink-0 text-text-muted hover:text-text-strong transition-colors font-semibold text-lg grayscale hover:grayscale-0 opacity-60 hover:opacity-100"
                >
                  {logo.name}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-8 items-center">
              {logos.map((logo, i) => (
                <div 
                  key={i} 
                  className="text-text-muted font-semibold text-lg grayscale opacity-60"
                  style={{
                    animation: 'fadeIn 0.5s ease-in-out',
                    animationDelay: `${i * 0.1}s`,
                    animationFillMode: 'backwards',
                  }}
                >
                  {logo.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </Container>
    </section>
  )
}
