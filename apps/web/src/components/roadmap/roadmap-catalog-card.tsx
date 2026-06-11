import Link from "next/link";
import { Card, CardContent, CardTitle, Button } from "@productpath/ui";
import type { RoadmapSummary } from "@/data/roadmaps/types/roadmap";

function formatSalary(min: number, max: number): string {
  return `$${Math.round(min / 1000)}k–$${Math.round(max / 1000)}k`;
}

export function RoadmapCatalogCard({ summary }: { summary: RoadmapSummary }) {
  return (
    <Card className="pp-roadmap-catalog-card">
      <CardContent>
        <div className="pp-roadmap-catalog-badges">
          <span className="pp-pill pp-pill--sm">{summary.difficulty}</span>
          <span className="pp-pill pp-pill--sm">{summary.estimatedDuration}</span>
        </div>
        <CardTitle style={{ marginTop: 12 }}>{summary.title}</CardTitle>
        <p className="pp-body-muted" style={{ margin: "8px 0 16px", lineHeight: 1.5 }}>
          {summary.description}
        </p>
        <dl className="pp-roadmap-catalog-meta">
          <div>
            <dt>Salary</dt>
            <dd>{formatSalary(summary.salaryRange.min, summary.salaryRange.max)}</dd>
          </div>
          <div>
            <dt>Demand</dt>
            <dd>{summary.jobDemandScore}/10</dd>
          </div>
          <div>
            <dt>AI focus</dt>
            <dd>{summary.aiFocusLevel}</dd>
          </div>
        </dl>
        <Link href={`/roadmaps/${summary.slug}`} style={{ marginTop: 16, display: "inline-block" }}>
          <Button variant="secondary" size="sm">
            View roadmap
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
