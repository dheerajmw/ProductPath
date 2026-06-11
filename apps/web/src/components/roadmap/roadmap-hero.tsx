import type { Roadmap } from "@/data/roadmaps/types/roadmap";

function formatSalaryRange(min: number, max: number, currency: string): string {
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(n);
  return `${fmt(min)} – ${fmt(max)}`;
}

export function RoadmapHero({ roadmap }: { roadmap: Roadmap }) {
  const { meta } = roadmap;

  return (
    <header className="pp-roadmap-hero">
      <div className="pp-roadmap-hero-badges">
        <span className="pp-pill pp-pill--primary">{meta.difficulty}</span>
        <span className="pp-pill">{meta.aiFocusLevel} AI focus</span>
        <span className="pp-pill">{meta.estimatedDuration}</span>
      </div>
      <h1 className="pp-roadmap-hero-title">{meta.title}</h1>
      <p className="pp-roadmap-hero-desc">{meta.description}</p>
      <dl className="pp-roadmap-hero-stats">
        <div>
          <dt>Target roles</dt>
          <dd>{meta.targetRoles.join(" · ")}</dd>
        </div>
        <div>
          <dt>Salary range</dt>
          <dd>
            {formatSalaryRange(
              meta.salaryRange.min,
              meta.salaryRange.max,
              meta.salaryRange.currency,
            )}{" "}
            <span className="pp-roadmap-muted">({meta.salaryRange.region})</span>
          </dd>
        </div>
        <div>
          <dt>Job demand</dt>
          <dd>
            <span className="pp-roadmap-demand" data-score={meta.jobDemandScore}>
              {meta.jobDemandScore}/10
            </span>
          </dd>
        </div>
      </dl>
      {meta.tags && meta.tags.length > 0 && (
        <ul className="pp-roadmap-tags">
          {meta.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      )}
    </header>
  );
}
