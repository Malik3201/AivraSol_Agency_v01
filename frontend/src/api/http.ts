import { z, ZodSchema } from 'zod'
import { API_BASE } from '@/lib/config'

class ApiError extends Error {
  constructor(public message: string, public statusCode?: number) {
    super(message)
    this.name = 'ApiError'
  }
}

// Reads the admin JWT (stored at login) and returns the Bearer header,
// or undefined when no admin session exists. Used by admin API calls so we
// don't have to wire auth tokens through every call site.
function getAdminAuthHeader(): Record<string, string> {
  try {
    const raw = localStorage.getItem('adminAuth')
    if (!raw) return {}
    const parsed = JSON.parse(raw) as { token?: string }
    return parsed?.token ? { Authorization: `Bearer ${parsed.token}` } : {}
  } catch {
    return {}
  }
}

async function fetchWithRetry(url: string, options: RequestInit, retries = 1): Promise<Response> {
  try {
    const response = await fetch(url, options)
    return response
  } catch (error) {
    if (retries > 0 && options.method === 'GET') {
      await new Promise((resolve) => setTimeout(resolve, 500))
      return fetchWithRetry(url, options, retries - 1)
    }
    throw error
  }
}

async function handleResponse<T>(response: Response, schema: ZodSchema<T>): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: { message: 'Request failed' } }))
    throw new ApiError(
      errorData?.message || errorData.error?.message || `HTTP ${response.status}`,
      response.status
    )
  }

  const data = await response.json()

  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('API response validation failed:', error.errors)
      throw new ApiError('Invalid response format from server')
    }
    throw error
  }
}

interface RequestOpts {
  auth?: boolean
}

export async function apiGet<T>(
  path: string,
  schema: ZodSchema<T>,
  opts: RequestOpts = {}
): Promise<T> {
  const url = `${API_BASE}${path}`

  try {
    const response = await fetchWithRetry(
      url,
      {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(opts.auth ? getAdminAuthHeader() : {}),
        },
      },
      1
    )

    return handleResponse(response, schema)
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(error instanceof Error ? error.message : 'Network error')
  }
}

export async function apiPost<T>(
  path: string,
  body: unknown,
  schema: ZodSchema<T>,
  opts: RequestOpts = {}
): Promise<T> {
  const url = `${API_BASE}${path}`

  try {
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(opts.auth ? getAdminAuthHeader() : {}),
      },
      body: JSON.stringify(body),
    })

    return handleResponse(response, schema)
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(error instanceof Error ? error.message : 'Network error')
  }
}

export async function apiPut<T>(
  path: string,
  body: unknown,
  schema: ZodSchema<T>,
  opts: RequestOpts = {}
): Promise<T> {
  const url = `${API_BASE}${path}`

  try {
    const response = await fetch(url, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(opts.auth ? getAdminAuthHeader() : {}),
      },
      body: JSON.stringify(body),
    })

    return handleResponse(response, schema)
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(error instanceof Error ? error.message : 'Network error')
  }
}

export async function apiPatch<T>(
  path: string,
  body: unknown,
  schema: ZodSchema<T>,
  opts: RequestOpts = {}
): Promise<T> {
  const url = `${API_BASE}${path}`

  try {
    const response = await fetch(url, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(opts.auth ? getAdminAuthHeader() : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })

    return handleResponse(response, schema)
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(error instanceof Error ? error.message : 'Network error')
  }
}

export async function apiDelete<T>(
  path: string,
  schema: ZodSchema<T>,
  opts: RequestOpts = {}
): Promise<T> {
  const url = `${API_BASE}${path}`

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(opts.auth ? getAdminAuthHeader() : {}),
      },
    })

    return handleResponse(response, schema)
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(error instanceof Error ? error.message : 'Network error')
  }
}

// Sends multipart/form-data. Does not set Content-Type — the browser will fill
// in the correct multipart boundary.
export async function apiPostForm<T>(
  path: string,
  formData: FormData,
  schema: ZodSchema<T>,
  opts: RequestOpts & { onProgress?: (pct: number) => void } = {}
): Promise<T> {
  const url = `${API_BASE}${path}`

  try {
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: {
        ...(opts.auth ? getAdminAuthHeader() : {}),
      },
      body: formData,
    })

    return handleResponse(response, schema)
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(error instanceof Error ? error.message : 'Network error')
  }
}
