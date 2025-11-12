export const USE_API = import.meta.env.VITE_USE_API === 'true'
export const API_BASE = import.meta.env.VITE_API_BASE || ''

// Kill switch: Force API mode (no JSON fallback allowed)
export const FORCE_API = true

export function dataSourceLabel(): 'api' | 'json' {
  return USE_API || FORCE_API ? 'api' : 'json'
}

// Enforce FORCE_API at dev-time
if (import.meta.env.DEV) {
  console.log(`[Aivrasol] Data source: ${dataSourceLabel().toUpperCase()}`)
  
  if (FORCE_API && !USE_API) {
    console.warn('[Aivrasol] USE_API is false but FORCE_API is true. API mode forced.')
  }
}

// Runtime guard for JSON imports
export function guardJsonImport(location: string): never {
  const msg = `JSON loader disabled: FORCE_API=true (attempted at ${location})`
  console.error(`[Aivrasol] ${msg}`)
  throw new Error(msg)
}

