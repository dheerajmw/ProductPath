import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@productpath/ui";
import { MarketingShell } from "@/components/marketing-shell";
import { RoadmapCatalogCard } from "@/components/roadmap";
import { getRoadmapSummaries } from "@/data/roadmaps";

export const metadata: Metadata = {
  title: "AI Product Career Roadmaps | ProductPath",
  description:
    "Structured career roadmaps for AI product management, design, analytics, marketing, and operations.",
};

export default function RoadmapsCatalogPage() {
  const summaries = getRoadmapSummaries();

  return (
    <MarketingShell
      centered={false}
      headerExtra={
        <nav style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/login" className="pp-label-caps" style={{ color: "var(--pp-muted)" }}>
            Log in
          </Link>
          <Link href="/signup">
            <Button size="sm">Get started</Button>
          </Link>
        </nav>
      }
    >
      <section className="pp-roadmap-catalog">
        <header className="pp-roadmap-catalog-hero">
          <span className="pp-pill pp-pill--primary">Career roadmaps</span>
          <h1 className="pp-display-hero" style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>
            AI product <span className="pp-gradient-text">career paths</span>
          </h1>
          <p className="pp-hero-lead pp-body-muted">
            Dedicated roadmaps for AI-native product roles — skills, tools, projects, and interview
            prep in one place. Add a new track by dropping in a data file and registering it.
          </p>
        </header>
        <div className="pp-roadmap-catalog-grid">
          {summaries.map((summary) => (
            <RoadmapCatalogCard key={summary.slug} summary={summary} />
          ))}
        </div>
      </section>
    </MarketingShell>
  );
}
