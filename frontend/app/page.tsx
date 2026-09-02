import { DockitHeader } from "@/components/dockit/DockitHeader";
import { DockitHero } from "@/components/dockit/DockitHero";
import { DockitFeatures } from "@/components/dockit/DockitFeatures";
import { DockitHeroTabs } from "@/components/dockit/DockitHeroTabs";
import { DockitTopics } from "@/components/dockit/DockitTopics";
import { DockitTestimonials } from "@/components/dockit/DockitTestimonials";
import { DockitFaq } from "@/components/dockit/DockitFaq";
import { DockitCTA } from "@/components/dockit/DockitCTA";
import { DockitFooter } from "@/components/dockit/DockitFooter";

export default function LandingPage() {
  return (
    <div className="dockit-page min-h-screen overflow-x-hidden">
      <div className="hero-bg-wrap" aria-hidden />
      <DockitHeader />
      <main className="dockit-main">
        <DockitHero />
        <DockitFeatures />
        <DockitHeroTabs />
        <DockitTopics />
        <DockitTestimonials />
        <DockitFaq />
        <DockitCTA />
      </main>
      <DockitFooter />
    </div>
  );
}
