import type { CSSProperties, ReactNode } from "react";

export type VerificationBadgeState =
  | "LEARNING"
  | "EMERGING_TALENT"
  | "INTERVIEW_READY"
  | "VERIFIED_PROFESSIONAL";

const STYLES: Record<VerificationBadgeState, { bg: string; border: string; color: string; label: string }> =
  {
    LEARNING: {
      bg: "var(--pp-surface-variant)",
      border: "var(--pp-border)",
      color: "var(--pp-muted)",
      label: "Learning",
    },
    EMERGING_TALENT: {
      bg: "var(--pp-primary-dim)",
      border: "rgba(173, 198, 255, 0.25)",
      color: "var(--pp-primary)",
      label: "Emerging talent",
    },
    INTERVIEW_READY: {
      bg: "var(--pp-secondary-dim)",
      border: "rgba(78, 222, 163, 0.35)",
      color: "var(--pp-secondary)",
      label: "Interview ready",
    },
    VERIFIED_PROFESSIONAL: {
      bg: "var(--pp-secondary-dim)",
      border: "rgba(78, 222, 163, 0.5)",
      color: "var(--pp-secondary)",
      label: "Verified professional",
    },
  };

export function VerificationBadge({
  state,
  validUntil,
  style,
}: {
  state: VerificationBadgeState;
  validUntil?: string | null;
  style?: CSSProperties;
}) {
  const s = STYLES[state] ?? STYLES.LEARNING;
  const verified = state === "INTERVIEW_READY" || state === "VERIFIED_PROFESSIONAL";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 12px",
        borderRadius: "var(--pp-radius-full)",
        fontSize: "0.75rem",
        fontWeight: 600,
        letterSpacing: "0.03em",
        background: s.bg,
        border: `1px solid ${s.border}`,
        color: s.color,
        boxShadow: verified ? "0 0 12px rgba(78, 222, 163, 0.2)" : undefined,
        ...style,
      }}
    >
      {verified ? (
        <span className="material-symbols-outlined" style={{ fontSize: "0.875rem" }}>
          verified
        </span>
      ) : null}
      {s.label}
      {validUntil && verified ? (
        <span style={{ fontWeight: 400, opacity: 0.85 }}>
          · until {new Date(validUntil).toLocaleDateString()}
        </span>
      ) : null}
    </span>
  );
}

export function VerificationBadgeRow({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, ...style }}>{children}</div>
  );
}
