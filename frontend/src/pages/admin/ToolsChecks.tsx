import { useState } from 'react'
import { Check, X, RefreshCw, Activity } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { getServices, getProjects, getKnowledge, getTestimonials } from '@/api/client'
import { API_BASE } from '@/lib/config'

interface CheckResult {
  route: string
  status: 'pass' | 'fail' | 'loading' | 'pending'
  message?: string
  responseTime?: number
  count?: number
}

const CHECKS = [
  { key: 'auth', route: '/api/auth/me', label: 'Auth Session' },
  { key: 'services', route: '/api/services?page=1&limit=1', label: 'Services List' },
  { key: 'projects', route: '/api/projects?page=1&limit=1', label: 'Projects List' },
  { key: 'knowledge', route: '/api/knowledge?type=faq', label: 'Knowledge (FAQ)' },
  { key: 'testimonials', route: '/api/testimonials', label: 'Testimonials' },
]

export function ToolsChecks() {
  const [results, setResults] = useState<Record<string, CheckResult>>({})
  const [running, setRunning] = useState(false)
  const [sendRealContact, setSendRealContact] = useState(false)

  const runCheck = async (key: string, route: string): Promise<CheckResult> => {
    const startTime = performance.now()
    
    try {
      let response: any
      let count = 0

      switch (key) {
        case 'auth':
          response = await fetch(`${API_BASE}${route}`, { credentials: 'include' })
          if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)
          break
        
        case 'services':
          response = await getServices({ page: 1, limit: 1 })
          count = response.total || 0
          break
        
        case 'projects':
          response = await getProjects({ page: 1, limit: 1 })
          count = response.total || 0
          break
        
        case 'knowledge':
          response = await getKnowledge({ type: 'faq' })
          count = response.data?.length || 0
          break
        
        case 'testimonials':
          response = await getTestimonials()
          count = response.data?.length || 0
          break
      }

      const endTime = performance.now()
      return {
        route,
        status: 'pass',
        message: count > 0 ? `${count} items` : 'OK',
        responseTime: Math.round(endTime - startTime),
        count
      }
    } catch (err) {
      const endTime = performance.now()
      return {
        route,
        status: 'fail',
        message: err instanceof Error ? err.message : 'Unknown error',
        responseTime: Math.round(endTime - startTime)
      }
    }
  }

  const runContactCheck = async (): Promise<CheckResult> => {
    if (!sendRealContact) {
      return {
        route: '/api/contact',
        status: 'pass',
        message: 'Dry-run (not sent)',
        responseTime: 0
      }
    }

    const startTime = performance.now()
    try {
      const response = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          message: 'This is a test message from admin diagnostics',
          company_site: '' // honeypot
        })
      })

      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)

      const endTime = performance.now()
      return {
        route: '/api/contact',
        status: 'pass',
        message: 'Contact submitted',
        responseTime: Math.round(endTime - startTime)
      }
    } catch (err) {
      const endTime = performance.now()
      return {
        route: '/api/contact',
        status: 'fail',
        message: err instanceof Error ? err.message : 'Unknown error',
        responseTime: Math.round(endTime - startTime)
      }
    }
  }

  const runAllChecks = async () => {
    setRunning(true)
    
    // Analytics stub
    if (window.plausible) {
      window.plausible('admin_tools_checks_run')
    }

    const newResults: Record<string, CheckResult> = {}

    // Run all checks sequentially
    for (const check of CHECKS) {
      setResults((prev) => ({
        ...prev,
        [check.key]: { route: check.route, status: 'loading' }
      }))

      const result = await runCheck(check.key, check.route)
      newResults[check.key] = result

      setResults((prev) => ({ ...prev, [check.key]: result }))
      
      // Small delay to avoid spamming
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    // Contact check
    setResults((prev) => ({
      ...prev,
      contact: { route: '/api/contact', status: 'loading' }
    }))

    const contactResult = await runContactCheck()
    newResults.contact = contactResult
    setResults((prev) => ({ ...prev, contact: contactResult }))

    setRunning(false)
  }

  const getStatusColor = (status: CheckResult['status']) => {
    switch (status) {
      case 'pass':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'fail':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'loading':
        return 'text-amber-600 bg-amber-50 border-amber-200'
      default:
        return 'text-slate-500 bg-slate-50 border-slate-200'
    }
  }

  const getStatusIcon = (status: CheckResult['status']) => {
    switch (status) {
      case 'pass':
        return <Check className="w-4 h-4" />
      case 'fail':
        return <X className="w-4 h-4" />
      case 'loading':
        return <RefreshCw className="w-4 h-4 animate-spin" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900 mb-2">
          API Diagnostics
        </h1>
        <p className="text-slate-600">
          Test all backend endpoints to verify connectivity and data availability.
        </p>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <Button
          onClick={runAllChecks}
          disabled={running}
          className="gap-2"
        >
          {running ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Running checks...
            </>
          ) : (
            <>
              <Activity className="w-4 h-4" />
              Run All Checks
            </>
          )}
        </Button>

        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={sendRealContact}
            onChange={(e) => setSendRealContact(e.target.checked)}
            className="rounded border-slate-300 text-amber-600 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
          />
          Send real contact test
        </label>
      </div>

      <div className="space-y-3">
        {CHECKS.map((check) => {
          const result = results[check.key]
          const status = result?.status || 'pending'

          return (
            <div
              key={check.key}
              className="flex items-center justify-between p-4 rounded-xl border bg-white"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex items-center justify-center w-8 h-8 rounded-lg border ${getStatusColor(
                      status
                    )}`}
                  >
                    {getStatusIcon(status)}
                  </span>
                  <div>
                    <div className="font-medium text-slate-900">{check.label}</div>
                    <div className="text-xs text-slate-500 font-mono">{check.route}</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm">
                {result?.responseTime !== undefined && (
                  <div className="text-slate-600">
                    <span className="font-mono">{result.responseTime}ms</span>
                  </div>
                )}

                {result?.message && (
                  <div className={status === 'fail' ? 'text-red-600' : 'text-slate-600'}>
                    {result.message}
                  </div>
                )}

                {status === 'pending' && (
                  <div className="text-slate-400">Not run yet</div>
                )}
              </div>
            </div>
          )
        })}

        {/* Contact check */}
        <div
          className="flex items-center justify-between p-4 rounded-xl border bg-white"
        >
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <span
                className={`flex items-center justify-center w-8 h-8 rounded-lg border ${getStatusColor(
                  results.contact?.status || 'pending'
                )}`}
              >
                {getStatusIcon(results.contact?.status || 'pending')}
              </span>
              <div>
                <div className="font-medium text-slate-900">Contact Form</div>
                <div className="text-xs text-slate-500 font-mono">POST /api/contact</div>
                {!sendRealContact && (
                  <div className="text-xs text-amber-600 mt-1">
                    Dry-run mode (enable checkbox to test)
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm">
            {results.contact?.responseTime !== undefined && (
              <div className="text-slate-600">
                <span className="font-mono">{results.contact.responseTime}ms</span>
              </div>
            )}

            {results.contact?.message && (
              <div
                className={
                  results.contact.status === 'fail' ? 'text-red-600' : 'text-slate-600'
                }
              >
                {results.contact.message}
              </div>
            )}

            {!results.contact && (
              <div className="text-slate-400">Not run yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

