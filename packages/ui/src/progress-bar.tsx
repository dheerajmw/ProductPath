import type { ReactNode } from "react";

export function ProgressBar({
  value,
  label,
  trailing,
  hint,
  max = 100,
}: {
  value: number;
  label?: ReactNode;
  trailing?: ReactNode;
  hint?: ReactNode;
  max?: number;
}) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

  return (
    <div className="pp-progress-block">
      {label || trailing ? (
        <div className="pp-progress-labels">
          {label ? <span>{label}</span> : <span />}
          {trailing ? <span>{trailing}</span> : null}
        </div>
      ) : null}
      <div className="pp-progress-track" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
        <div className="pp-progress-fill" style={{ width: `${pct}%` }} />
      </div>
      {hint ? <p className="pp-progress-hint">{hint}</p> : null}
    </div>
  );
}
