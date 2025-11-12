/// <reference types="vite/client" />

interface Window {
  plausible?: (event: string, options?: { props?: Record<string, any> }) => void
}

