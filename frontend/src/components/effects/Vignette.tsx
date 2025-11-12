export function Vignette() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        background: 'radial-gradient(ellipse at center, transparent 0%, rgba(12, 11, 16, 0.4) 100%)',
      }}
    />
  )
}

