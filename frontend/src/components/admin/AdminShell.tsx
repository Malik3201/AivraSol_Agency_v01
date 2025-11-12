import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import {
  LayoutDashboard,
  Layers,
  Briefcase,
  Tag,
  BookOpen,
  Inbox,
  LogOut,
  Menu,
  X,
  User,
  Activity,
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'
import { FORCE_API } from '@/lib/config'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/services', label: 'Services', icon: Layers },
  { to: '/admin/projects', label: 'Projects', icon: Briefcase },
  { to: '/admin/knowledge', label: 'FAQs', icon: BookOpen },
  { to: '/admin/testimonials', label: 'Testimonials', icon: Inbox },
  { to: '/admin/techstack', label: 'Tech Stack', icon: Tag },
]

const toolsItems = [
  { to: '/admin/tools/checks', label: 'Diagnostics', icon: Activity },
]

export function AdminShell() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Logged out successfully')
      navigate('/admin/login')
    } catch (error) {
      toast.error('Failed to log out')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-surface border-r border-border transform transition-transform duration-200 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h1 className="text-xl font-bold text-text-strong">Admin CMS</h1>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-text-muted hover:text-text-strong"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-text-muted hover:bg-surface-hover hover:text-text-strong'
                      }`
                    }
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </NavLink>
                )
              })}

              <div className="pt-4 mt-4 border-t border-border">
                <div className="text-xs font-medium text-text-muted px-4 pb-2">TOOLS</div>
                {toolsItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-text-muted hover:bg-surface-hover hover:text-text-strong'
                        }`
                      }
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </NavLink>
                  )
                })}
              </div>
            </nav>

            <div className="p-4 border-t border-border">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-text-muted hover:bg-surface-hover hover:text-text-strong transition-colors w-full"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Topbar */}
          <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-text-muted hover:text-text-strong"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex items-center gap-4 ml-auto">
              {FORCE_API && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 rounded-md border border-green-200">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs font-medium">API</span>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-background rounded-lg border border-border">
                  <User className="h-4 w-4 text-text-muted" />
                  <span className="text-sm font-medium text-text-strong">{user?.name}</span>
                  <span className="text-xs text-text-muted px-2 py-0.5 bg-primary/10 text-primary rounded">
                    {user?.role}
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

