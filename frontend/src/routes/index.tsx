import { Routes, Route } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ScrollProgressBar } from '@/components/layout/ScrollProgressBar'
import { NoiseBackground } from '@/components/effects/NoiseBackground'
import { Vignette } from '@/components/effects/Vignette'
import { Aiva } from '@/components/aiva/Aiva'
import { Home } from '@/pages/Home'
import { About } from '@/pages/About'
import { Services as PublicServices } from '@/pages/Services'
import { ServiceDetail } from '@/pages/ServiceDetail'
import { Portfolio } from '@/pages/Portfolio'
import { ProjectDetail } from '@/pages/ProjectDetail'
import { Contact } from '@/pages/Contact'
import { Login } from '@/pages/admin/Login'
import { AdminShell } from '@/components/admin/AdminShell'
import { RouteGuard } from '@/components/admin/RouteGuard'
import { Dashboard } from '@/pages/admin/Dashboard'
import { Services } from '@/pages/admin/Services'
import { Projects } from '@/pages/admin/Projects'
import { Knowledge } from '@/pages/admin/Knowledge'
import { ToolsChecks } from '@/pages/admin/ToolsChecks'
import { Testimonials } from '@/pages/admin/Testimonials'
import { TechStacks } from '@/pages/admin/TechStacks'

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <NoiseBackground />
      <Vignette />
      <ScrollProgressBar />
      <div className="relative z-10">
        <Header />
        <main>{children}</main>
        <Footer />
      </div>
      <Aiva />
    </div>
  )
}

export function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicLayout>
            <Home />
          </PublicLayout>
        }
      />
      <Route
        path="/about"
        element={
          <PublicLayout>
            <About />
          </PublicLayout>
        }
      />
      <Route
        path="/services"
        element={
          <PublicLayout>
            <PublicServices />
          </PublicLayout>
        }
      />
      <Route
        path="/services/:slug"
        element={
          <PublicLayout>
            <ServiceDetail />
          </PublicLayout>
        }
      />
      <Route
        path="/portfolio"
        element={
          <PublicLayout>
            <Portfolio />
          </PublicLayout>
        }
      />
      <Route
        path="/portfolio/:slug"
        element={
          <PublicLayout>
            <ProjectDetail />
          </PublicLayout>
        }
      />
      <Route
        path="/contact"
        element={
          <PublicLayout>
            <Contact />
          </PublicLayout>
        }
      />
      <Route path="/admin/login" element={<Login />} />
      <Route
        path="/admin"
        element={
          <RouteGuard>
            <AdminShell />
          </RouteGuard>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="services" element={<Services />} />
        <Route path="projects" element={<Projects />} />
        <Route path="knowledge" element={<Knowledge />} />
        <Route path="testimonials" element={<Testimonials />} />
        <Route path="techstack" element={<TechStacks />} />
        <Route path="tools/checks" element={<ToolsChecks />} />
      </Route>
    </Routes>
  )
}

