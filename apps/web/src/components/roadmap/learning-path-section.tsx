import type { LearningPathStep, RoadmapResource } from "@/data/roadmaps/types/roadmap";

export function LearningPathSection({
  steps,
  resources,
}: {
  steps: LearningPathStep[];
  resources: RoadmapResource[];
}) {
  const ordered = [...steps].sort((a, b) => a.step - b.step);

  return (
    <section className="pp-roadmap-section" aria-labelledby="learning-path-heading">
      <h2 id="learning-path-heading" className="pp-roadmap-section-title">
        Learning path
      </h2>
      <p className="pp-roadmap-section-lead">
        Recommended sequence from foundations to interview readiness.
      </p>
      <ol className="pp-roadmap-learning-steps">
        {ordered.map((step) => (
          <li key={step.step}>
            <span className="pp-roadmap-step-num">{step.step}</span>
            <div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
              {step.duration && (
                <span className="pp-roadmap-duration">{step.duration}</span>
              )}
            </div>
          </li>
        ))}
      </ol>
      {resources.length > 0 && (
        <div className="pp-roadmap-resources">
          <h3 className="pp-roadmap-subtitle">Resources</h3>
          <ul>
            {resources.map((resource) => (
              <li key={resource.title}>
                <span className="pp-roadmap-resource-type">{resource.type}</span>
                <strong>{resource.title}</strong>
                {resource.description && <span>{resource.description}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
