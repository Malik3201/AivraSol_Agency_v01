import { useEffect, useState } from 'react'
import { getServices } from '@/api/client'
import { getProjects } from '@/api/client'
import { getTestimonials } from '@/api/client'
import { listLeads } from '@/api/admin'
import { Card } from '@/components/ui/Card'
import { Layers, Briefcase, Inbox, Quote } from 'lucide-react'
import { SkeletonGrid } from '@/components/ui/Skeleton'

interface KPI {
  label: string
  value: number | string
  icon: typeof Layers
  color: string
}

export function Dashboard() {
  const [kpis, setKpis] = useState<KPI[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getServices().catch(() => ({ data: [] })),
      getProjects().catch(() => ({ data: [] })),
      getTestimonials().catch(() => ({ data: [] })),
      listLeads({ status: 'new' }).catch(() => ({ data: [] })),
    ]).then(([services, projects, testimonials, leads]) => {
      setKpis([
        {
          label: 'Total Services',
          value: services.data.length,
          icon: Layers,
          color: 'text-primary',
        },
        {
          label: 'Total Projects',
          value: projects.data.length,
          icon: Briefcase,
          color: 'text-amber',
        },
        {
          label: 'New Leads',
          value: leads.data.length,
          icon: Inbox,
          color: 'text-primary',
        },
        {
          label: 'Testimonials',
          value: testimonials.data.length,
          icon: Quote,
          color: 'text-text-muted',
        },
      ])
      setLoading(false)
    })
  }, [])

  if (loading) {
    return <SkeletonGrid rows={1} cols={4} />
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-text-strong mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <Card key={kpi.label} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Icon className={`h-8 w-8 ${kpi.color}`} />
              </div>
              <div className="text-3xl font-bold text-text-strong mb-1">{kpi.value}</div>
              <div className="text-sm text-text-muted">{kpi.label}</div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

