import type { Roadmap } from "@/data/roadmaps/types/roadmap";

export function SkillTimeline({ roadmap }: { roadmap: Roadmap }) {
  const phases = [...roadmap.phases].sort((a, b) => a.order - b.order);
  const timelineByPhase = new Map(roadmap.timelines.map((t) => [t.phaseId, t]));

  return (
    <section className="pp-roadmap-section" aria-labelledby="skill-timeline-heading">
      <h2 id="skill-timeline-heading" className="pp-roadmap-section-title">
        Skill timeline
      </h2>
      <p className="pp-roadmap-section-lead">
        Phased learning path with skills mapped to each stage.
      </p>
      <ol className="pp-roadmap-timeline">
        {phases.map((phase) => {
          const timeline = timelineByPhase.get(phase.id);
          const phaseSkills = roadmap.skills.filter((s) => s.phaseId === phase.id);
          const milestones = roadmap.milestones.filter((m) => m.phaseId === phase.id);

          return (
            <li key={phase.id} className="pp-roadmap-timeline-item">
              <div className="pp-roadmap-timeline-marker" aria-hidden />
              <div className="pp-roadmap-timeline-body">
                <div className="pp-roadmap-timeline-head">
                  <h3>{phase.title}</h3>
                  <span className="pp-roadmap-duration">
                    {timeline ? `${timeline.weeks} wk` : phase.duration}
                  </span>
                </div>
                <p className="pp-roadmap-muted">{phase.description}</p>
                {phaseSkills.length > 0 && (
                  <ul className="pp-roadmap-chip-list">
                    {phaseSkills.map((skill) => (
                      <li key={skill.name} className="pp-roadmap-chip" data-level={skill.level}>
                        {skill.name}
                        <span className="pp-roadmap-chip-meta">{skill.level}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {milestones.length > 0 && (
                  <ul className="pp-roadmap-milestones">
                    {milestones.map((m) => (
                      <li key={m.title}>
                        <strong>{m.title}</strong>
                        <span>{m.description}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
