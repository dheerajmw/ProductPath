"use client";

import type { MvpSkillBreakdown } from "@/lib/api";

type Props = {
  skills: MvpSkillBreakdown[];
};

export function SkillRadarChart({ skills }: Props) {
  return (
    <section className="pp-glass-card pp-mvp-skills">
      <h2>Skill breakdown</h2>
      <ul className="pp-mvp-skill-bars">
        {skills.map((s) => (
          <li key={s.skillTag}>
            <div className="pp-mvp-skill-head">
              <span>{s.skillName}</span>
              <span>{s.percent}%</span>
            </div>
            <div className="pp-mvp-skill-track">
              <div
                className={`pp-mvp-skill-fill${s.weak ? " pp-mvp-skill-fill--weak" : ""}`}
                style={{ width: `${s.percent}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
