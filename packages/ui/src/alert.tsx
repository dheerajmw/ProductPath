import type { ReactNode } from "react";

type AlertVariant = "info" | "success" | "error";

const colors: Record<AlertVariant, { bg: string; border: string; text: string }> = {
  info: {
    bg: "var(--pp-info-bg)",
    border: "rgba(173, 198, 255, 0.25)",
    text: "var(--pp-primary)",
  },
  success: {
    bg: "var(--pp-secondary-dim)",
    border: "rgba(78, 222, 163, 0.3)",
    text: "var(--pp-secondary)",
  },
  error: {
    bg: "var(--pp-danger-bg)",
    border: "rgba(255, 180, 171, 0.35)",
    text: "var(--pp-danger)",
  },
};

export function Alert({
  variant = "info",
  children,
}: {
  variant?: AlertVariant;
  children: ReactNode;
}) {
  const c = colors[variant];
  return (
    <div
      role="alert"
      className="pp-glass-card"
      style={{
        padding: "14px 18px",
        borderRadius: "var(--pp-radius-lg)",
        border: `1px solid ${c.border}`,
        background: c.bg,
        color: c.text,
        fontSize: "0.9375rem",
        lineHeight: 1.5,
      }}
    >
      {children}
    </div>
  );
}
