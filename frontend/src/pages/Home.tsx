import { HeroCollage } from "@/components/composite/HeroCollage";
import { TrustBar } from "@/components/composite/TrustBar";
import { ServicesGrid } from "@/components/composite/ServicesGrid";
import { ProcessTimeline } from "@/components/composite/ProcessTimeline";
import { CaseStudyHighlights } from "@/components/composite/CaseStudyHighlights";
import { CapabilitiesRibbon } from "@/components/composite/CapabilitiesRibbon";
import { TestimonialsCarousel } from "@/components/composite/TestimonialsCarousel";
import { FAQPreview } from "@/components/composite/FAQPreview";
import { CTABand } from "@/components/composite/CTABand";
import { MicroEmailCapture } from "@/components/composite/MicroEmailCapture";
import { SpotlightCursor } from "@/components/effects/SpotlightCursor";
import { useFAQs, useServices, useTestimonials } from "@/hooks/data";
import { useTechStacks } from "@/hooks/data/useTechStacks";
import { getProjects } from "@/api/client";
import homeMock from "@/__mock/home.json";
import { Container } from "@/components/layout/Container";
import { SkeletonGrid } from "@/components/ui/Skeleton";
import { ContentError } from "@/components/ui/ContentError";
import { useEffect, useState } from "react";
import type { Project } from "@/types/content";

export function Home() {
  const {
    data: services,
    loading: servicesLoading,
    error: servicesError,
  } = useServices();
  const {
    data: testimonials,
    loading: testiLoading,
    error: testiError,
  } = useTestimonials();
  const {
    data: faqsData,
    loading: faqsLoading,
    error: faqsError,
    refresh: refreshFAQs,
  } = useFAQs();
  const {
    data: techNames,
    loading: techLoading,
    error: techError,
  } = useTechStacks();
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [projLoading, setProjLoading] = useState(true);
  const [projError, setProjError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    setProjLoading(true);
    getProjects({ featured: true })
      .then((res) => {
        if (!mounted) return;
        setFeaturedProjects((res.data as any[]).filter((p: any) => p.featured));
        setProjLoading(false);
      })
      .catch((err) => {
        if (!mounted) return;
        setProjError(
          err instanceof Error ? err : new Error("Failed to load projects")
        );
        setProjLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const loading =
    servicesLoading ||
    testiLoading ||
    faqsLoading ||
    techLoading ||
    projLoading;
  const error =
    servicesError || testiError || faqsError || techError || projError;

  if (loading) {
    return (
      <div className="py-20">
        <Container>
          <SkeletonGrid rows={2} cols={3} />
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <Container>
        <ContentError error={error} onRetry={() => window.location.reload()} />
      </Container>
    );
  }

  return (
    <>
      <SpotlightCursor enabled />
      {/* Render hero and trust bar from mock/static content so the landing page shows the intended hero */}
      <HeroCollage data={(homeMock as any).hero} />
      <TrustBar logos={(homeMock as any).trust?.logos || []} />

      <ServicesGrid
        items={services.map((s) => ({
          icon: s.icon,
          title: s.title,
          benefit: s.summary,
          slug: s.slug,
        }))}
      />

      <ProcessTimeline
        steps={[
          { step: "Discover", desc: "Goals, KPIs, scope & constraints" },
          { step: "Prototype", desc: "Clickable UI, fast feedback" },
          { step: "Ship", desc: "Prod-grade release & QA" },
          { step: "Grow", desc: "Analytics, SEO & iterations" },
        ]}
      />

      <CaseStudyHighlights
        items={featuredProjects
          .filter((p) => p.featured)
          .slice(0, 3)
          .map((p: any) => ({
            title: p.title,
            summary: p.summary,
            coverUrl: p.cover?.url || p.image || "",
            slug: p.slug,
          }))}
      />

      <CapabilitiesRibbon items={techNames} />

      <TestimonialsCarousel
        items={testimonials.map((t: any) => ({
          quote: t.message || t.designation || t.clientName,
          author: t.clientName,
          role: t.designation || "",
          avatarUrl: t.avatarUrl,
        }))}
      />

      <FAQPreview
        items={faqsData}
        loading={faqsLoading}
        error={faqsError}
        onRefresh={refreshFAQs}
      />

      {/* CTA can remain or be hidden if backend-driven only; keeping minimal presence */}
      <CTABand
        data={{
          title: "Let’s talk",
          sub: "Tell us about your project",
          primaryLabel: "Get an Estimate",
          secondaryLabel: "See Our Work",
        }}
      />

      <MicroEmailCapture />
    </>
  );
}
