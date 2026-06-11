import type { RoadmapProject } from "@/data/roadmaps/types/roadmap";
import { Card, CardContent, CardTitle } from "@productpath/ui";

export function ProjectsSection({ projects }: { projects: RoadmapProject[] }) {
  return (
    <section className="pp-roadmap-section" aria-labelledby="projects-heading">
      <h2 id="projects-heading" className="pp-roadmap-section-title">
        Portfolio projects
      </h2>
      <p className="pp-roadmap-section-lead">
        Ship these on ProductPath to demonstrate AI product judgment.
      </p>
      <div className="pp-roadmap-projects-grid">
        {projects.map((project) => (
          <Card key={project.title}>
            <CardContent>
              <span className="pp-pill pp-pill--sm" data-difficulty={project.difficulty}>
                {project.difficulty}
              </span>
              <CardTitle style={{ marginTop: 12 }}>{project.title}</CardTitle>
              <p className="pp-body-muted" style={{ margin: "8px 0 12px" }}>
                {project.description}
              </p>
              <ul className="pp-roadmap-outcomes">
                {project.outcomes.map((outcome) => (
                  <li key={outcome}>{outcome}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
