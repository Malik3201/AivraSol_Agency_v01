import { z, ZodSchema } from 'zod'
import { API_BASE } from '@/lib/config'

class ApiError extends Error {
  constructor(public message: string, public statusCode?: number) {
    super(message)
    this.name = 'ApiError'
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
      errorData.error?.message || `HTTP ${response.status}`,
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

export async function apiGet<T>(path: string, schema: ZodSchema<T>): Promise<T> {
  const url = `${API_BASE}${path}`

  try {
    const response = await fetchWithRetry(
      url,
      {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
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
  schema: ZodSchema<T>
): Promise<T> {
  const url = `${API_BASE}${path}`

  try {
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
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
  schema: ZodSchema<T>
): Promise<T> {
  const url = `${API_BASE}${path}`

  try {
    const response = await fetch(url, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
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

export async function apiDelete<T>(path: string, schema: ZodSchema<T>): Promise<T> {
  const url = `${API_BASE}${path}`

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
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

