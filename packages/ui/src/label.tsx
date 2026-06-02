import type { LabelHTMLAttributes, ReactNode } from "react";

export function Label({
  children,
  style,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement> & { children: ReactNode }) {
  return (
    <label
      style={{
        fontFamily: "var(--pp-font)",
        fontSize: "0.875rem",
        fontWeight: 600,
        color: "var(--pp-muted)",
        ...style,
      }}
      {...props}
    >
      {children}
    </label>
  );
}
