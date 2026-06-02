import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children: ReactNode;
}

const variantStyles: Record<Variant, React.CSSProperties> = {
  primary: {
    background: "var(--pp-primary)",
    color: "var(--pp-on-primary)",
    border: "none",
    boxShadow: "var(--pp-glow-primary)",
  },
  secondary: {
    background: "rgba(255, 255, 255, 0.05)",
    color: "var(--pp-fg)",
    border: "1px solid var(--pp-border)",
    backdropFilter: "blur(12px)",
  },
  ghost: {
    background: "transparent",
    color: "var(--pp-muted)",
    border: "1px solid transparent",
  },
  danger: {
    background: "var(--pp-danger-bg)",
    color: "var(--pp-danger)",
    border: "1px solid rgba(255, 180, 171, 0.3)",
  },
};

const sizeStyles: Record<Size, React.CSSProperties> = {
  sm: { padding: "6px 14px", fontSize: "0.875rem", minHeight: 36 },
  md: { padding: "10px 18px", fontSize: "0.9375rem", minHeight: 44 },
  lg: { padding: "12px 24px", fontSize: "1rem", minHeight: 48 },
};

export function Button({
  variant = "primary",
  size = "md",
  loading,
  disabled,
  children,
  style,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      style={{
        fontFamily: "var(--pp-font)",
        borderRadius: "var(--pp-radius-lg)",
        fontWeight: 600,
        letterSpacing: "0.02em",
        cursor: disabled || loading ? "not-allowed" : "pointer",
        opacity: disabled || loading ? 0.55 : 1,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        transition: "transform 0.15s ease, filter 0.15s ease, border-color 0.2s ease",
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...style,
      }}
      {...props}
    >
      {loading ? "Loading…" : children}
    </button>
  );
}
