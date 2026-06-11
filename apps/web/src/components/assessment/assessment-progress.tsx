"use client";

type Props = {
  current: number;
  total: number;
  label?: string;
};

export function AssessmentProgress({ current, total, label }: Props) {
  const pct = total > 0 ? Math.round(((current + 1) / total) * 100) : 0;

  return (
    <div className="pp-mvp-assess-progress">
      <div className="pp-mvp-assess-progress-head">
        <span>{label ?? "Progress"}</span>
        <span>
          {current + 1} / {total}
        </span>
      </div>
      <div className="pp-mvp-assess-progress-bar">
        <div style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
