import type { Roadmap } from "@/data/roadmaps/types/roadmap";

export function CareerOutcomes({ roadmap }: { roadmap: Roadmap }) {
  const { salaryPotential, meta } = roadmap;

  return (
    <section className="pp-roadmap-section" aria-labelledby="career-outcomes-heading">
      <h2 id="career-outcomes-heading" className="pp-roadmap-section-title">
        Career outcomes
      </h2>
      <p className="pp-roadmap-section-lead">
        Compensation bands and market signals for this AI product track.
      </p>
      <div className="pp-roadmap-outcomes-grid">
        <div className="pp-roadmap-salary-card">
          <h3>Salary potential</h3>
          <dl>
            <div>
              <dt>Entry</dt>
              <dd>{salaryPotential.entry}</dd>
            </div>
            <div>
              <dt>Mid-level</dt>
              <dd>{salaryPotential.mid}</dd>
            </div>
            <div>
              <dt>Senior</dt>
              <dd>{salaryPotential.senior}</dd>
            </div>
          </dl>
          {salaryPotential.notes && (
            <p className="pp-roadmap-muted">{salaryPotential.notes}</p>
          )}
        </div>
        <div className="pp-roadmap-salary-card">
          <h3>Market snapshot</h3>
          <ul className="pp-roadmap-market-list">
            <li>
              <strong>Job demand score</strong>
              <span>{meta.jobDemandScore}/10</span>
            </li>
            <li>
              <strong>AI focus</strong>
              <span>{meta.aiFocusLevel}</span>
            </li>
            <li>
              <strong>Typical duration</strong>
              <span>{meta.estimatedDuration}</span>
            </li>
            <li>
              <strong>Difficulty</strong>
              <span>{meta.difficulty}</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
