"use client";

import type { MvpLearningResource } from "@/lib/api";

type Props = {
  resources: MvpLearningResource[];
};

export function RecommendedResources({ resources }: Props) {
  if (resources.length === 0) return null;

  return (
    <section className="pp-glass-card pp-mvp-resources">
      <h2>Recommended resources</h2>
      <ul className="pp-mvp-resource-list">
        {resources.map((r) => (
          <li key={r.url}>
            <a href={r.url} target="_blank" rel="noopener noreferrer">
              <strong>{r.title}</strong>
              <span>{r.type} · {r.topic}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
