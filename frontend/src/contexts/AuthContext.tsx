import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { apiGet, apiPost } from '@/api/http'
import { z } from 'zod'

const UserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  role: z.enum(['admin', 'editor']),
})

// Backend admin login response
const AdminLoginSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  token: z.string(),
  auth: z.object({
    _id: z.string(),
    email: z.string().email(),
  }).passthrough(),
})

type User = z.infer<typeof UserSchema>

interface AuthContextValue {
  user: User | null
  loading: boolean
  error: Error | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refetch: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchMe = async () => {
    // No /me endpoint in backend; restore from localStorage if present
    try {
      const raw = localStorage.getItem('adminAuth')
      if (raw) {
        const saved = JSON.parse(raw) as { token: string; id: string; email: string }
        setUser({ name: saved.email, email: saved.email, role: 'admin' })
      } else {
        setUser(null)
      }
      setError(null)
    } catch (err) {
      setUser(null)
      setError(err instanceof Error ? err : new Error('Failed to restore session'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMe()
  }, [])

  const login = async (email: string, password: string) => {
    const res = await apiPost('/admin/login', { email, password }, AdminLoginSchema as any)
    if (!res.success) {
      throw new Error(res.message || 'Login failed')
    }
    const id = res.auth._id
    const token = res.token
    localStorage.setItem('adminAuth', JSON.stringify({ token, id, email: res.auth.email }))
    setUser({ name: res.auth.email, email: res.auth.email, role: 'admin' })
  }

  const logout = async () => {
    try {
      const raw = localStorage.getItem('adminAuth')
      const id = raw ? (JSON.parse(raw).id as string) : undefined
      if (id) {
        await apiPost(`/admin/logout/${id}`, {}, z.any())
      }
    } finally {
      localStorage.removeItem('adminAuth')
      setUser(null)
    }
  }

  const refetch = async () => {
    setLoading(true)
    await fetchMe()
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, refetch }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

