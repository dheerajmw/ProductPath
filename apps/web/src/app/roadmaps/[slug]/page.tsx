import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Button } from "@productpath/ui";
import { MarketingShell } from "@/components/marketing-shell";
import { RoadmapDetail } from "@/components/roadmap";
import { getAllRoadmapSlugs, getRoadmapBySlug } from "@/data/roadmaps";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAllRoadmapSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const roadmap = getRoadmapBySlug(slug);
  if (!roadmap) return { title: "Roadmap not found" };

  return {
    title: `${roadmap.meta.title} Roadmap | ProductPath`,
    description: roadmap.meta.description,
  };
}

export default async function RoadmapDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const roadmap = getRoadmapBySlug(slug);

  if (!roadmap) {
    notFound();
  }

  return (
    <MarketingShell
      centered={false}
      headerExtra={
        <nav style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/roadmaps" className="pp-label-caps" style={{ color: "var(--pp-muted)" }}>
            All roadmaps
          </Link>
          <Link href="/signup">
            <Button size="sm">Get started</Button>
          </Link>
        </nav>
      }
    >
      <RoadmapDetail roadmap={roadmap} />
    </MarketingShell>
  );
}
