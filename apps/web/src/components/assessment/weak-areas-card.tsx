"use client";

type Props = {
  areas: string[];
  recommendations: { topic: string; reason: string; priority: string }[];
};

export function WeakAreasCard({ areas, recommendations }: Props) {
  if (areas.length === 0) {
    return (
      <section className="pp-glass-card pp-mvp-weak">
        <h2>Weak areas</h2>
        <p className="pp-mvp-weak-none">No major skill gaps detected — strong work.</p>
      </section>
    );
  }

  return (
    <section className="pp-glass-card pp-mvp-weak">
      <h2>Focus next</h2>
      <ul className="pp-mvp-weak-list">
        {areas.map((a) => (
          <li key={a}>{a}</li>
        ))}
      </ul>
      {recommendations.length > 0 ? (
        <ol className="pp-mvp-roadmap-recs">
          {recommendations.map((r) => (
            <li key={r.topic}>
              <strong>{r.topic}</strong>
              <span className={`pp-mvp-priority pp-mvp-priority--${r.priority}`}>{r.priority}</span>
              <p>{r.reason}</p>
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  );
}
